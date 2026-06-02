const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const residentRoutes = require('./resident.routes');
const vehicleRoutes = require('./vehicle.routes');
const parkingSlotRoutes = require('./parkingSlot.routes');

router.use('/auth', authRoutes);
router.use('/residents', residentRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/parking-slots', parkingSlotRoutes);

module.exports = router;