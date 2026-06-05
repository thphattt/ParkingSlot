const express = require('express');
const router = express.Router();
const {
  createPaymentLink,
  handleWebhook,
  checkPayment,
} = require('../controllers/payos.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Webhook KHÔNG cần auth — PayOS gọi trực tiếp
router.post('/webhook', handleWebhook);

// Các route khác cần auth
router.post('/create/:paymentId', protect, authorize('admin'), createPaymentLink);
router.get('/check/:orderCode', protect, checkPayment);

module.exports = router;