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
router.use(authorize('admin', 'security'));

router.route('/').get(getVehicles).post(createVehicle);
router.route('/:id').get(getVehicle).put(updateVehicle).delete(deleteVehicle);

module.exports = router;