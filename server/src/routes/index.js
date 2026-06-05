const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const residentRoutes = require('./resident.routes');
const vehicleRoutes = require('./vehicle.routes');
const parkingSlotRoutes = require('./parkingSlot.routes');
const contractRoutes = require('./contract.routes');
const dashboardRoutes = require('./dashboard.routes');
const parkingLogRoutes = require('./parkingLog.routes');
const paymentRoutes = require('./payment.routes');
const payosRoutes = require('./payos.routes');
const reportRoutes = require('./report.routes');
const notificationRoutes = require('./notification.routes');

router.use('/auth', authRoutes);
router.use('/residents', residentRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/parking-slots', parkingSlotRoutes);
router.use('/contracts', contractRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/parking-logs', parkingLogRoutes);
router.use('/payments', paymentRoutes);
router.use('/payos', payosRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes)

module.exports = router;