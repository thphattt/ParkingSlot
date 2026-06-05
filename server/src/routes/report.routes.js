const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/', reportController.getReports);

module.exports = router;
