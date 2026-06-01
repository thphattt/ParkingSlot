const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');

router.use('/auth', authRoutes);

// Sẽ thêm các routes khác ở đây sau:
// router.use('/users', userRoutes);
// router.use('/residents', residentRoutes);
// ...

module.exports = router;