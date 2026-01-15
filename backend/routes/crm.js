const express = require('express');
const { body, param } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();
router.use(authenticateToken);

// GET /api/crm/leads - Listar leads
router.get('/leads', async (req, res) => {
  try {
    const { search, estagio, classificacao, fonte } = req.query;
    
    let sql = 'SELECT * FROM crm_leads WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      sql += ` AND (nome ILIKE $${paramCount} OR empresa ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (estagio) {
      sql += ` AND estagio = $${paramCount}`;
      params.push(estagio);
      paramCount++;
    }

    if (classificacao) {
      sql += ` AND classificacao = $${paramCount}`;
      params.push(classificacao);
      paramCount++;
    }

    if (fonte) {
      sql += ` AND fonte = $${paramCount}`;
      params.push(fonte);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    res.json({
      total: result.rowCount,
      leads: result.rows
    });
  } catch (error) {
    console.error('❌ Erro ao listar leads:', error);
    res.status(500).json({ error: 'Erro ao listar leads' });
  }
});

// GET /api/crm/leads/:id - Buscar lead por ID
router.get('/leads/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const result = await query('SELECT * FROM crm_leads WHERE id = $1', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Lead não encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('❌ Erro ao buscar lead:', error);
      res.status(500).json({ error: 'Erro ao buscar lead' });
    }
  }
);

// GET /api/crm/stats - Estatísticas do CRM
router.get('/stats', async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE classificacao = 'quente') as leads_quentes,
        COUNT(*) FILTER (WHERE estagio = 'oportunidade') as oportunidades,
        SUM(valor_estimado) as valor_pipeline
      FROM crm_leads
    `);

    const estagios = await query(`
      SELECT estagio, COUNT(*) as count
      FROM crm_leads
      GROUP BY estagio
    `);

    res.json({
      summary: stats.rows[0],
      by_stage: estagios.rows
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// POST /api/crm/leads - Criar lead
router.post('/leads',
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('estagio').optional().isIn(['novo', 'contato_inicial', 'qualificacao', 'proposta', 'negociacao', 'oportunidade', 'convertido', 'perdido']),
    body('classificacao').optional().isIn(['frio', 'morno', 'quente']),
    body('fonte').optional().isIn(['website', 'indicacao', 'email', 'telefone', 'redes_sociais', 'evento', 'outro'])
  ],
  validate,
  async (req, res) => {
    try {
      const {
        nome, email, telefone, empresa, cargo, fonte = 'website',
        estagio = 'novo', classificacao = 'morno', valor_estimado,
        data_contato, proxima_acao, observacoes
      } = req.body;

      const result = await query(
        `INSERT INTO crm_leads (nome, email, telefone, empresa, cargo, fonte, estagio, classificacao, valor_estimado, data_contato, proxima_acao, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [nome, email, telefone, empresa, cargo, fonte, estagio, classificacao, valor_estimado, data_contato, proxima_acao, observacoes]
      );

      res.status(201).json({
        message: 'Lead criado com sucesso',
        lead: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Erro ao criar lead:', error);
      res.status(500).json({ error: 'Erro ao criar lead' });
    }
  }
);

// PUT /api/crm/leads/:id - Atualizar lead
router.put('/leads/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const fields = req.body;

      // Verificar se lead existe
      const leadCheck = await query('SELECT id FROM crm_leads WHERE id = $1', [id]);
      if (leadCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Lead não encontrado' });
      }

      // Construir query dinâmica
      const updates = [];
      const values = [];
      let paramCount = 1;

      const allowedFields = [
        'nome', 'email', 'telefone', 'empresa', 'cargo', 'fonte',
        'estagio', 'classificacao', 'valor_estimado', 'data_contato',
        'proxima_acao', 'observacoes'
      ];
      
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
        `UPDATE crm_leads SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      res.json({
        message: 'Lead atualizado com sucesso',
        lead: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar lead:', error);
      res.status(500).json({ error: 'Erro ao atualizar lead' });
    }
  }
);

// DELETE /api/crm/leads/:id - Deletar lead
router.delete('/leads/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const result = await query('DELETE FROM crm_leads WHERE id = $1 RETURNING id', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Lead não encontrado' });
      }

      res.json({ message: 'Lead deletado com sucesso' });
    } catch (error) {
      console.error('❌ Erro ao deletar lead:', error);
      res.status(500).json({ error: 'Erro ao deletar lead' });
    }
  }
);

module.exports = router;
