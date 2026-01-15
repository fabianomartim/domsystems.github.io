const express = require('express');
const { body, param, query: queryValidator } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();
router.use(authenticateToken);

// GET /api/clients - Listar clientes
router.get('/', async (req, res) => {
  try {
    const { search, ativo } = req.query;
    
    let sql = 'SELECT * FROM clientes WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      sql += ` AND (nome ILIKE $${paramCount} OR email ILIKE $${paramCount} OR telefone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (ativo !== undefined) {
      sql += ` AND ativo = $${paramCount}`;
      params.push(ativo === 'true');
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    res.json({
      total: result.rowCount,
      clients: result.rows
    });
  } catch (error) {
    console.error('❌ Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// GET /api/clients/:id - Buscar cliente por ID
router.get('/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const result = await query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('❌ Erro ao buscar cliente:', error);
      res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
  }
);

// POST /api/clients - Criar cliente
router.post('/',
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('telefone').optional().notEmpty(),
    body('tipo_pessoa').optional().isIn(['fisica', 'juridica']),
    body('documento').optional().notEmpty(),
    body('endereco').optional().notEmpty(),
    body('cidade').optional().notEmpty(),
    body('estado').optional().notEmpty(),
    body('cep').optional().notEmpty()
  ],
  validate,
  async (req, res) => {
    try {
      const {
        nome, email, telefone, tipo_pessoa, documento,
        endereco, cidade, estado, cep, observacoes, ativo = true
      } = req.body;

      const result = await query(
        `INSERT INTO clientes (nome, email, telefone, tipo_pessoa, documento, endereco, cidade, estado, cep, observacoes, ativo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [nome, email, telefone, tipo_pessoa, documento, endereco, cidade, estado, cep, observacoes, ativo]
      );

      res.status(201).json({
        message: 'Cliente criado com sucesso',
        client: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Erro ao criar cliente:', error);
      res.status(500).json({ error: 'Erro ao criar cliente' });
    }
  }
);

// PUT /api/clients/:id - Atualizar cliente
router.put('/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const fields = req.body;

      // Verificar se cliente existe
      const clientCheck = await query('SELECT id FROM clientes WHERE id = $1', [id]);
      if (clientCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      // Construir query dinâmica
      const updates = [];
      const values = [];
      let paramCount = 1;

      const allowedFields = ['nome', 'email', 'telefone', 'tipo_pessoa', 'documento', 'endereco', 'cidade', 'estado', 'cep', 'observacoes', 'ativo'];
      
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
        `UPDATE clientes SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      res.json({
        message: 'Cliente atualizado com sucesso',
        client: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
      res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
  }
);

// DELETE /api/clients/:id - Deletar cliente
router.delete('/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const result = await query('DELETE FROM clientes WHERE id = $1 RETURNING id', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json({ message: 'Cliente deletado com sucesso' });
    } catch (error) {
      console.error('❌ Erro ao deletar cliente:', error);
      res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
  }
);

module.exports = router;
