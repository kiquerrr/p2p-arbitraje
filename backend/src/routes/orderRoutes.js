const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/calculate-buy-price', orderController.calculateBuyPrice);
router.post('/calculate-sell-price', orderController.calculateSellPrice);
router.post('/publish-buy', orderController.publishBuyOrder);
router.post('/publish-sell', orderController.publishSellOrder);
router.get('/daily-cycle/:daily_cycle_id', orderController.listOrders);
router.put('/:order_id/cancel', orderController.cancelOrder);

module.exports = router;
