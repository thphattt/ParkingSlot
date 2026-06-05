const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

// Xem thông báo: Tất cả đều được xem
router.get('/', notificationController.getNotifications);

// Tạo, nhắc nợ, xóa: Chỉ Admin
router.post('/', authorize('admin'), notificationController.createNotification);
router.post('/auto-remind', authorize('admin'), notificationController.autoRemindOverdue);
router.delete('/:id', authorize('admin'), notificationController.deleteNotification);

module.exports = router;