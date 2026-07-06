const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// GET todas as manutenções
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT m.*, v.prefixo FROM manutencao m JOIN viaturas v ON m.viatura_id = v.id ORDER BY m.data DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar manutenções' });
  }
});

// GET manutenção por viatura
router.get('/viatura/:viatura_id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM manutencao WHERE viatura_id = $1 ORDER BY data DESC',
      [req.params.viatura_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar manutenções' });
  }
});

// POST nova manutenção
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { viatura_id, tipo, descricao, data, custo, responsavel, proxima_manutencao } = req.body;

    const result = await pool.query(
      'INSERT INTO manutencao (viatura_id, tipo, descricao, data, custo, responsavel, proxima_manutencao) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [viatura_id, tipo, descricao, data, custo, responsavel, proxima_manutencao]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar manutenção' });
  }
});

// PUT atualizar manutenção
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { viatura_id, tipo, descricao, data, custo, responsavel, proxima_manutencao } = req.body;

    const result = await pool.query(
      'UPDATE manutencao SET viatura_id=$1, tipo=$2, descricao=$3, data=$4, custo=$5, responsavel=$6, proxima_manutencao=$7 WHERE id=$8 RETURNING *',
      [viatura_id, tipo, descricao, data, custo, responsavel, proxima_manutencao, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manutenção não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar manutenção' });
  }
});

module.exports = router;
