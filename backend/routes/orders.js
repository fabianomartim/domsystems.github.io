const express = require('express');
const { body, param } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();
router.use(authenticateToken);

// GET /api/orders - Listar ordens de serviço
router.get('/', async (req, res) => {
  try {
    const { search, status, cliente_id } = req.query;
    
    let sql = `
      SELECT o.*, c.nome as cliente_nome, s.nome_servico, s.codigo as servico_codigo
      FROM ordens_servico o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN tipos_servico s ON o.servico_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      sql += ` AND (o.numero_ordem ILIKE $${paramCount} OR c.nome ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      sql += ` AND o.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (cliente_id) {
      sql += ` AND o.cliente_id = $${paramCount}`;
      params.push(cliente_id);
      paramCount++;
    }

    sql += ' ORDER BY o.created_at DESC';

    const result = await query(sql, params);

    res.json({
      total: result.rowCount,
      orders: result.rows
    });
  } catch (error) {
    console.error('❌ Erro ao listar ordens:', error);
    res.status(500).json({ error: 'Erro ao listar ordens de serviço' });
  }
});

// GET /api/orders/:id - Buscar ordem por ID
router.get('/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const sql = `
        SELECT o.*, c.nome as cliente_nome, c.email as cliente_email,
               s.nome_servico, s.codigo as servico_codigo, s.valor_padrao
        FROM ordens_servico o
        LEFT JOIN clientes c ON o.cliente_id = c.id
        LEFT JOIN tipos_servico s ON o.servico_id = s.id
        WHERE o.id = $1
      `;
      
      const result = await query(sql, [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Ordem não encontrada' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('❌ Erro ao buscar ordem:', error);
      res.status(500).json({ error: 'Erro ao buscar ordem de serviço' });
    }
  }
);

// POST /api/orders - Criar ordem de serviço
router.post('/',
  [
    body('cliente_id').isUUID().withMessage('Cliente ID inválido'),
    body('servico_id').isUUID().withMessage('Serviço ID inválido'),
    body('valor').optional().isNumeric().withMessage('Valor deve ser numérico'),
    body('status').optional().isIn(['pendente', 'em_andamento', 'concluido', 'cancelado'])
  ],
  validate,
  async (req, res) => {
    try {
      const {
        numero_ordem, cliente_id, servico_id, descricao,
        valor, status = 'pendente', data_entrega, observacoes
      } = req.body;

      // Verificar se cliente existe
      const clientCheck = await query('SELECT id FROM clientes WHERE id = $1', [cliente_id]);
      if (clientCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      // Verificar se serviço existe
      const serviceCheck = await query('SELECT id, valor_padrao FROM tipos_servico WHERE id = $1', [servico_id]);
      if (serviceCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      // Usar valor padrão do serviço se não fornecido
      const valorFinal = valor !== undefined ? valor : serviceCheck.rows[0].valor_padrao;

      // Gerar número da ordem se não fornecido
      let numeroOrdem = numero_ordem;
      if (!numeroOrdem) {
        const lastOrder = await query(
          `SELECT numero_ordem FROM ordens_servico 
           WHERE numero_ordem ~ '^OS-[0-9]+$'
           ORDER BY numero_ordem DESC LIMIT 1`
        );
        
        if (lastOrder.rows.length > 0) {
          const lastNum = parseInt(lastOrder.rows[0].numero_ordem.split('-')[1]);
          numeroOrdem = `OS-${String(lastNum + 1).padStart(4, '0')}`;
        } else {
          numeroOrdem = 'OS-0001';
        }
      }

      const result = await query(
        `INSERT INTO ordens_servico (numero_ordem, cliente_id, servico_id, descricao, valor, status, data_entrega, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [numeroOrdem, cliente_id, servico_id, descricao, valorFinal, status, data_entrega, observacoes]
      );

      res.status(201).json({
        message: 'Ordem de serviço criada com sucesso',
        order: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Erro ao criar ordem:', error);
      res.status(500).json({ error: 'Erro ao criar ordem de serviço' });
    }
  }
);

// PUT /api/orders/:id - Atualizar ordem
router.put('/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const fields = req.body;

      // Verificar se ordem existe
      const orderCheck = await query('SELECT id FROM ordens_servico WHERE id = $1', [id]);
      if (orderCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Ordem não encontrada' });
      }

      // Construir query dinâmica
      const updates = [];
      const values = [];
      let paramCount = 1;

      const allowedFields = ['cliente_id', 'servico_id', 'descricao', 'valor', 'status', 'data_entrega', 'observacoes'];
      
      for (const field of allowedFields) {
        if (fields[field] !== undefined) {
          updates.push(`${field} = $${paramCount++}`);
          values.push(fields[field]);
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE ordens_servico SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      res.json({
        message: 'Ordem atualizada com sucesso',
        order: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar ordem:', error);
      res.status(500).json({ error: 'Erro ao atualizar ordem de serviço' });
    }
  }
);

// DELETE /api/orders/:id - Deletar ordem
router.delete('/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const result = await query('DELETE FROM ordens_servico WHERE id = $1 RETURNING id', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Ordem não encontrada' });
      }

      res.json({ message: 'Ordem deletada com sucesso' });
    } catch (error) {
      console.error('❌ Erro ao deletar ordem:', error);
      res.status(500).json({ error: 'Erro ao deletar ordem de serviço' });
    }
  }
);

module.exports = router;
