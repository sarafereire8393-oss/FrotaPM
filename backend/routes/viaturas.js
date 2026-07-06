const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// GET todas as viaturas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM viaturas ORDER BY prefixo');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar viaturas' });
  }
});

// GET viatura por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM viaturas WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viatura não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar viatura' });
  }
});

// POST nova viatura
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { prefixo, placa, modelo, ano, chassi, km, unidade, status } = req.body;

    const result = await pool.query(
      'INSERT INTO viaturas (prefixo, placa, modelo, ano, chassi, km, unidade, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [prefixo, placa, modelo, ano, chassi, km, unidade, status || 'operacional']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar viatura' });
  }
});

// PUT atualizar viatura
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { prefixo, placa, modelo, ano, chassi, km, unidade, status } = req.body;

    const result = await pool.query(
      'UPDATE viaturas SET prefixo=$1, placa=$2, modelo=$3, ano=$4, chassi=$5, km=$6, unidade=$7, status=$8 WHERE id=$9 RETURNING *',
      [prefixo, placa, modelo, ano, chassi, km, unidade, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viatura não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar viatura' });
  }
});

// DELETE viatura
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM viaturas WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viatura não encontrada' });
    }

    res.json({ mensagem: 'Viatura deletada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar viatura' });
  }
});

module.exports = router;
