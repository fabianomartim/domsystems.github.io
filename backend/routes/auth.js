const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { query } = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/login - Autenticação
router.post('/login',
  [
    body('email').notEmpty().withMessage('Email é obrigatório'),
    body('senha').notEmpty().withMessage('Senha é obrigatória')
  ],
  validate,
  async (req, res) => {
    try {
      const { email, senha } = req.body;

      // Buscar usuário
      const result = await query(
        'SELECT * FROM usuarios WHERE email = $1 AND ativo = true',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const user = result.rows[0];

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, user.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token
      const token = generateToken(user);

      // Atualizar último acesso
      await query(
        'UPDATE usuarios SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Retornar dados (sem senha)
      const { senha: _, ...userData } = user;
      
      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: userData
      });
    } catch (error) {
      console.error('❌ Erro no login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }
);

// POST /api/auth/register - Registrar novo usuário (público)
router.post('/register',
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
  ],
  validate,
  async (req, res) => {
    try {
      const { nome, email, senha } = req.body;

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
         VALUES ($1, $2, $3, false, true, true)
         RETURNING id, nome, email, is_admin, ativo, primeiro_acesso, created_at`,
        [nome, email, senhaHash]
      );

      const user = result.rows[0];
      const token = generateToken(user);

      res.status(201).json({
        message: 'Usuário registrado com sucesso',
        token,
        user
      });
    } catch (error) {
      console.error('❌ Erro ao registrar:', error);
      res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }
);

// POST /api/auth/change-password - Trocar senha
router.post('/change-password',
  [
    body('senhaAtual').notEmpty().withMessage('Senha atual é obrigatória'),
    body('novaSenha').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
  ],
  validate,
  async (req, res) => {
    try {
      const { email, senhaAtual, novaSenha } = req.body;

      // Buscar usuário
      const result = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const user = result.rows[0];

      // Verificar senha atual
      const senhaValida = await bcrypt.compare(senhaAtual, user.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      // Hash da nova senha
      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      // Atualizar senha
      await query(
        'UPDATE usuarios SET senha = $1, primeiro_acesso = false WHERE id = $2',
        [novaSenhaHash, user.id]
      );

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('❌ Erro ao trocar senha:', error);
      res.status(500).json({ error: 'Erro ao trocar senha' });
    }
  }
);

module.exports = router;
