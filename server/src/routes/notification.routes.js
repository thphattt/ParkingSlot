const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect); 
router.use(authorize('admin')); 

router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.post('/auto-remind', notificationController.autoRemindOverdue);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;