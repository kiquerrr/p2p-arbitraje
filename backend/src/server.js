const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const generalCycleRoutes = require('./routes/generalCycleRoutes');
const orderRoutes = require('./routes/orderRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dailyCycleRoutes = require('./routes/dailyCycleRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'P2P Arbitrage API está corriendo',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/general-cycles', generalCycleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/vault', require('./routes/vaultRoutes'));
app.use('/api/daily-cycles', dailyCycleRoutes);

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada' 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🚀 P2P ARBITRAGE API SERVER         ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║   📡 Puerto: ${PORT}                      ║`);
  console.log(`║   🌐 Host: 0.0.0.0                     ║`);
  console.log(`║   🔧 Entorno: ${process.env.NODE_ENV}        ║`);
  console.log('╚════════════════════════════════════════╝');
});

module.exports = app;
