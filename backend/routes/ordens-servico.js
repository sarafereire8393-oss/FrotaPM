const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// GET todas as ordens
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT os.*, v.prefixo FROM ordens_servico os JOIN viaturas v ON os.viatura_id = v.id ORDER BY os.data DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar ordens' });
  }
});

// POST nova ordem
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { viatura_id, problema, mecanico, status } = req.body;

    const result = await pool.query(
      'INSERT INTO ordens_servico (viatura_id, problema, mecanico, data, status) VALUES ($1, $2, $3, NOW(), $4) RETURNING *',
      [viatura_id, problema, mecanico, status || 'aberta']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar ordem' });
  }
});

// PUT atualizar ordem
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { viatura_id, problema, mecanico, status } = req.body;

    const result = await pool.query(
      'UPDATE ordens_servico SET viatura_id=$1, problema=$2, mecanico=$3, status=$4 WHERE id=$5 RETURNING *',
      [viatura_id, problema, mecanico, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar ordem' });
  }
});

module.exports = router;
