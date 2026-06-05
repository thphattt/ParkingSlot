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

// Xem danh sách: Admin + Bảo vệ
router.get('/', authorize('admin', 'security'), getContracts);
router.get('/:id', authorize('admin', 'security'), getContract);

// Tạo / Hủy / Xóa: Chỉ Admin
router.post('/', authorize('admin'), createContract);
router.put('/:id/cancel', authorize('admin'), cancelContract);
router.delete('/:id', authorize('admin'), deleteContract);

module.exports = router;