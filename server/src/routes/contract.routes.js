const express = require('express');
const router = express.Router();
const {
  getContracts,
  getContract,
  createContract,
  cancelContract,
  deleteContract,
} = require('../controllers/contract.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

// Tất cả: Chỉ Admin
router.get('/', authorize('admin'), getContracts);
router.get('/:id', authorize('admin'), getContract);
router.post('/', authorize('admin'), createContract);
router.put('/:id/cancel', authorize('admin'), cancelContract);
router.delete('/:id', authorize('admin'), deleteContract);

module.exports = router;