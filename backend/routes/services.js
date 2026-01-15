const express = require('express');
const { body, param } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();
router.use(authenticateToken);

// GET /api/services - Listar serviços
router.get('/', async (req, res) => {
  try {
    const { ativo } = req.query;
    
    let sql = 'SELECT * FROM tipos_servico WHERE 1=1';
    const params = [];

    if (ativo !== undefined) {
      sql += ' AND ativo = $1';
      params.push(ativo === 'true');
    }

    sql += ' ORDER BY codigo ASC';

    const result = await query(sql, params);

    res.json({
      total: result.rowCount,
      services: result.rows
    });
  } catch (error) {
    console.error('❌ Erro ao listar serviços:', error);
    res.status(500).json({ error: 'Erro ao listar serviços' });
  }
});

// GET /api/services/:id - Buscar serviço por ID
router.get('/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const result = await query('SELECT * FROM tipos_servico WHERE id = $1', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('❌ Erro ao buscar serviço:', error);
      res.status(500).json({ error: 'Erro ao buscar serviço' });
    }
  }
);

// POST /api/services - Criar serviço
router.post('/',
  [
    body('codigo').notEmpty().withMessage('Código é obrigatório'),
    body('nome_servico').notEmpty().withMessage('Nome do serviço é obrigatório'),
    body('valor_padrao').optional().isNumeric().withMessage('Valor deve ser numérico')
  ],
  validate,
  async (req, res) => {
    try {
      const { codigo, nome_servico, descricao, valor_padrao = 0, ativo = true } = req.body;

      // Verificar se código já existe
      const existing = await query('SELECT id FROM tipos_servico WHERE codigo = $1', [codigo]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Código já cadastrado' });
      }

      const result = await query(
        `INSERT INTO tipos_servico (codigo, nome_servico, descricao, valor_padrao, ativo)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [codigo, nome_servico, descricao, valor_padrao, ativo]
      );

      res.status(201).json({
        message: 'Serviço criado com sucesso',
        service: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Erro ao criar serviço:', error);
      res.status(500).json({ error: 'Erro ao criar serviço' });
    }
  }
);

// PUT /api/services/:id - Atualizar serviço
router.put('/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { codigo, nome_servico, descricao, valor_padrao, ativo } = req.body;

      // Verificar se serviço existe
      const serviceCheck = await query('SELECT id FROM tipos_servico WHERE id = $1', [id]);
      if (serviceCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      // Se está mudando código, verificar se já existe
      if (codigo) {
        const codigoCheck = await query(
          'SELECT id FROM tipos_servico WHERE codigo = $1 AND id != $2',
          [codigo, id]
        );
        if (codigoCheck.rows.length > 0) {
          return res.status(400).json({ error: 'Código já cadastrado' });
        }
      }

      // Construir query dinâmica
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (codigo !== undefined) {
        updates.push(`codigo = $${paramCount++}`);
        values.push(codigo);
      }
      if (nome_servico !== undefined) {
        updates.push(`nome_servico = $${paramCount++}`);
        values.push(nome_servico);
      }
      if (descricao !== undefined) {
        updates.push(`descricao = $${paramCount++}`);
        values.push(descricao);
      }
      if (valor_padrao !== undefined) {
        updates.push(`valor_padrao = $${paramCount++}`);
        values.push(valor_padrao);
      }
      if (ativo !== undefined) {
        updates.push(`ativo = $${paramCount++}`);
        values.push(ativo);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE tipos_servico SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      res.json({
        message: 'Serviço atualizado com sucesso',
        service: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar serviço:', error);
      res.status(500).json({ error: 'Erro ao atualizar serviço' });
    }
  }
);

// DELETE /api/services/:id - Deletar serviço
router.delete('/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const result = await query('DELETE FROM tipos_servico WHERE id = $1 RETURNING id', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      res.json({ message: 'Serviço deletado com sucesso' });
    } catch (error) {
      console.error('❌ Erro ao deletar serviço:', error);
      res.status(500).json({ error: 'Erro ao deletar serviço' });
    }
  }
);

module.exports = router;
