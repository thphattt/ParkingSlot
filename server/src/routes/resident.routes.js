const express = require('express');
const router = express.Router();
const {
  getResidents,
  getResident,
  createResident,
  updateResident,
  deleteResident,
} = require('../controllers/resident.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

// Xem danh sách: Admin + Bảo vệ
router.get('/', authorize('admin', 'security'), getResidents);
router.get('/:id', authorize('admin', 'security'), getResident);

// Tạo / Sửa / Xóa: Chỉ Admin
router.post('/', authorize('admin'), createResident);
router.put('/:id', authorize('admin'), updateResident);
router.delete('/:id', authorize('admin'), deleteResident);

module.exports = router;