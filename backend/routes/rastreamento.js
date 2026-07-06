const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// GET posição atual de todas as viaturas
router.get('/posicoes-atuais', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (viatura_id) r.*, v.prefixo, v.placa 
       FROM rastreamento r 
       JOIN viaturas v ON r.viatura_id = v.id 
       ORDER BY viatura_id, data_hora DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar posições' });
  }
});

// GET histórico de rastreamento
router.get('/historico/:viatura_id', authMiddleware, async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    let query = 'SELECT * FROM rastreamento WHERE viatura_id = $1';
    let params = [req.params.viatura_id];

    if (dataInicio && dataFim) {
      query += ' AND data_hora BETWEEN $2 AND $3';
      params.push(dataInicio, dataFim);
    }

    query += ' ORDER BY data_hora DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

// POST novo rastreamento
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { viatura_id, latitude, longitude, velocidade } = req.body;

    const result = await pool.query(
      'INSERT INTO rastreamento (viatura_id, latitude, longitude, velocidade, data_hora) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [viatura_id, latitude, longitude, velocidade]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar rastreamento' });
  }
});

module.exports = router;
