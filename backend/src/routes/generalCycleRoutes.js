const express = require('express');
const router = express.Router();
const generalCycleController = require('../controllers/generalCycleController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', generalCycleController.create);
router.get('/', generalCycleController.list);
router.get('/:id', generalCycleController.getById);
router.put('/:id/complete', generalCycleController.complete);

module.exports = router;
