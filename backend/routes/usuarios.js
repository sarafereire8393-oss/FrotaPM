const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// GET todos os usuários (apenas admin)
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, email, perfil FROM usuarios ORDER BY nome');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// PUT atualizar usuário
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nome, email, perfil } = req.body;

    const result = await pool.query(
      'UPDATE usuarios SET nome=$1, email=$2, perfil=$3 WHERE id=$4 RETURNING id, nome, email, perfil',
      [nome, email, perfil, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

module.exports = router;
