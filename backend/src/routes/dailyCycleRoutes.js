const express = require('express');
const router = express.Router();
const dailyCycleController = require('../controllers/dailyCycleController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/:id/status', dailyCycleController.getStatus);
router.post('/:id/close', dailyCycleController.closeDay);

module.exports = router;
