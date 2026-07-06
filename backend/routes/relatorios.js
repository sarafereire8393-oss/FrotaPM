const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// GET relatório de manutenção
router.get('/manutencao', authMiddleware, async (req, res) => {
  try {
    const { dataInicio, dataFim, viatura_id, unidade } = req.query;

    let query = 'SELECT m.*, v.prefixo, v.placa FROM manutencao m JOIN viaturas v ON m.viatura_id = v.id WHERE 1=1';
    let params = [];
    let paramCount = 1;

    if (dataInicio && dataFim) {
      query += ` AND m.data BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(dataInicio, dataFim);
      paramCount += 2;
    }

    if (viatura_id) {
      query += ` AND m.viatura_id = $${paramCount}`;
      params.push(viatura_id);
      paramCount++;
    }

    if (unidade) {
      query += ` AND v.unidade = $${paramCount}`;
      params.push(unidade);
    }

    const result = await pool.query(query + ' ORDER BY m.data DESC', params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// GET relatório de disponibilidade
router.get('/disponibilidade', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        status,
        COUNT(*) as quantidade
      FROM viaturas 
      GROUP BY status`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// GET relatório financeiro
router.get('/financeiro', authMiddleware, async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    let query = 'SELECT v.prefixo, SUM(m.custo) as total_gasto FROM manutencao m JOIN viaturas v ON m.viatura_id = v.id WHERE 1=1';
    let params = [];

    if (dataInicio && dataFim) {
      query += ' AND m.data BETWEEN $1 AND $2';
      params.push(dataInicio, dataFim);
    }

    query += ' GROUP BY v.prefixo ORDER BY total_gasto DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

module.exports = router;
