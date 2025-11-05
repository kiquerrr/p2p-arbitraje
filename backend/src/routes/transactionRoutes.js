const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/register-buy', transactionController.registerBuyExecution);
router.post('/register-sell', transactionController.registerSellExecution);
router.get('/daily-cycle/:daily_cycle_id', transactionController.listTransactions);

module.exports = router;
