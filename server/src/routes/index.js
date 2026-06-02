const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const residentRoutes = require('./resident.routes');

router.use('/auth', authRoutes);
router.use('/residents', residentRoutes);

module.exports = router;