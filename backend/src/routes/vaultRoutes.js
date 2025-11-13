const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vaultController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/status', vaultController.getStatus);
router.post('/deposit', vaultController.addDeposit);
router.post('/transfer-to-cycle', vaultController.transferToCycle);
router.post('/transfer-from-cycle', vaultController.transferFromCycle);
// Obtener movimientos de la bóveda
router.get("/movements", vaultController.getMovements);
module.exports = router;
