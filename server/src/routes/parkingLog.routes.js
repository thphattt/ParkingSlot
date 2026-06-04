const express = require('express');
const router = express.Router();
const {
  recordEntry,
  recordExit,
  getLogs,
  getCurrentVehicles,
} = require('../controllers/parkingLog.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(authorize('admin', 'security'));

router.post('/entry', recordEntry);
router.post('/exit', recordExit);
router.get('/', getLogs);
router.get('/current', getCurrentVehicles);

module.exports = router;