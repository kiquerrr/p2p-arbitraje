const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vaultController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/status', vaultController.getStatus);
router.post('/deposit', vaultController.addDeposit);
router.post('/transfer-to-cycle', vaultController.transferToCycle);
router.get('/movements', vaultController.getMovements);

router.post('/transfer-from-cycle', vaultController.transferFromCycle);
module.exports = router;
