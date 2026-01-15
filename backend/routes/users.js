const express = require('express');
const bcrypt = require('bcryptjs');
const { body, param } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authenticateToken);

// GET /api/users - Listar todos os usuários (apenas admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, nome, email, is_admin, ativo, primeiro_acesso, ultimo_acesso, created_at, updated_at
       FROM usuarios
       ORDER BY created_at DESC`
    );

    res.json({
      total: result.rowCount,
      users: result.rows
    });
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Apenas admin ou o próprio usuário pode ver os detalhes
      if (!req.user.is_admin && req.user.id !== id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const result = await query(
        `SELECT id, nome, email, is_admin, ativo, primeiro_acesso, ultimo_acesso, created_at, updated_at
         FROM usuarios WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }
);

// POST /api/users - Criar novo usuário (apenas admin)
router.post('/',
  requireAdmin,
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('is_admin').optional().isBoolean(),
    body('ativo').optional().isBoolean()
  ],
  validate,
  async (req, res) => {
    try {
      const { nome, email, senha, is_admin = false, ativo = true } = req.body;

      // Verificar se email já existe
      const existing = await query('SELECT id FROM usuarios WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Inserir usuário
      const result = await query(
        `INSERT INTO usuarios (nome, email, senha, is_admin, ativo, primeiro_acesso)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id, nome, email, is_admin, ativo, primeiro_acesso, created_at`,
        [nome, email, senhaHash, is_admin, ativo]
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }
);

// PUT /api/users/:id - Atualizar usuário
router.put('/:id',
  [
    param('id').isUUID().withMessage('ID inválido'),
    body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('is_admin').optional().isBoolean(),
    body('ativo').optional().isBoolean()
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, email, is_admin, ativo } = req.body;

      // Apenas admin pode atualizar outros usuários ou mudar is_admin
      if (!req.user.is_admin && (req.user.id !== id || is_admin !== undefined)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Verificar se usuário existe
      const userCheck = await query('SELECT id FROM usuarios WHERE id = $1', [id]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Se está mudando email, verificar se já existe
      if (email) {
        const emailCheck = await query(
          'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
          [email, id]
        );
        if (emailCheck.rows.length > 0) {
          return res.status(400).json({ error: 'Email já cadastrado' });
        }
      }

      // Construir query de atualização dinâmica
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (nome !== undefined) {
        updates.push(`nome = $${paramCount++}`);
        values.push(nome);
      }
      if (email !== undefined) {
        updates.push(`email = $${paramCount++}`);
        values.push(email);
      }
      if (is_admin !== undefined && req.user.is_admin) {
        updates.push(`is_admin = $${paramCount++}`);
        values.push(is_admin);
      }
      if (ativo !== undefined && req.user.is_admin) {
        updates.push(`ativo = $${paramCount++}`);
        values.push(ativo);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE usuarios SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING id, nome, email, is_admin, ativo, primeiro_acesso, updated_at`,
        values
      );

      res.json({
        message: 'Usuário atualizado com sucesso',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }
);

// DELETE /api/users/:id - Deletar usuário (apenas admin)
router.delete('/:id',
  requireAdmin,
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Não permitir deletar a si mesmo
      if (req.user.id === id) {
        return res.status(400).json({ error: 'Não é possível deletar seu próprio usuário' });
      }

      const result = await query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }
);

module.exports = router;
