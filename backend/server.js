const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/viaturas', require('./routes/viaturas'));
app.use('/api/manutencao', require('./routes/manutencao'));
app.use('/api/rastreamento', require('./routes/rastreamento'));
app.use('/api/ordens-servico', require('./routes/ordens-servico'));
app.use('/api/relatorios', require('./routes/relatorios'));
app.use('/api/usuarios', require('./routes/usuarios'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor FrotaPM rodando na porta ${PORT}`);
});
