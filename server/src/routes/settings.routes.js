const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  createUser,
  toggleUserStatus,
  resetPassword,
  deleteUser,
} = require('../controllers/settings.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Tất cả routes đều cần đăng nhập
router.use(protect);

// ── Cá nhân (ai cũng dùng được) ─────────────────────
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// ── Quản lý nhân viên (Chỉ Admin) ───────────────────
router.get('/users', authorize('admin'), getUsers);
router.post('/users', authorize('admin'), createUser);
router.put('/users/:id/toggle', authorize('admin'), toggleUserStatus);
router.put('/users/:id/reset-password', authorize('admin'), resetPassword);
router.delete('/users/:id', authorize('admin'), deleteUser);

module.exports = router;