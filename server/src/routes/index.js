const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const residentRoutes = require('./resident.routes');
const vehicleRoutes = require('./vehicle.routes');

router.use('/auth', authRoutes);
router.use('/residents', residentRoutes);
router.use('/vehicles', vehicleRoutes);

module.exports = router;