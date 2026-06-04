const express = require('express');
const router = express.Router();
const {
  generateMonthly,
  getPayments,
  markAsPaid,
  deletePayment,
} = require('../controllers/payment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(authorize('admin'));

router.post('/generate', generateMonthly);
router.get('/', getPayments);
router.put('/:id/pay', markAsPaid);
router.delete('/:id', deletePayment);

module.exports = router;