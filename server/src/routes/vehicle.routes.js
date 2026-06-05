const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicle.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

// Xem danh sách: Admin + Bảo vệ
router.get('/', authorize('admin', 'security'), getVehicles);
router.get('/:id', authorize('admin', 'security'), getVehicle);

// Tạo / Sửa / Xóa: Chỉ Admin
router.post('/', authorize('admin'), createVehicle);
router.put('/:id', authorize('admin'), updateVehicle);
router.delete('/:id', authorize('admin'), deleteVehicle);

module.exports = router;