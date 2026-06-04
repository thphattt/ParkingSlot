const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/stats', authorize('admin', 'security'), getStats);

module.exports = router;