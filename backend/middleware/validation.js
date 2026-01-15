const { validationResult } = require('express-validator');

// Middleware para validar resultados
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validação falhou',
      details: errors.array()
    });
  }
  next();
};

module.exports = { validate };
