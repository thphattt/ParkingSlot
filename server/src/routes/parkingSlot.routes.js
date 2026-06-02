const express = require('express');
const router = express.Router();
const {
  getParkingSlots,
  getParkingSlot,
  createParkingSlot,
  createBulkParkingSlots,
  updateParkingSlot,
  deleteParkingSlot,
} = require('../controllers/parkingSlot.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

// GET — admin + security đều xem được
router.get('/', authorize('admin', 'security'), getParkingSlots);
router.get('/:id', authorize('admin', 'security'), getParkingSlot);

// POST/PUT/DELETE — chỉ admin
router.post('/', authorize('admin'), createParkingSlot);
router.post('/bulk', authorize('admin'), createBulkParkingSlots);
router.put('/:id', authorize('admin'), updateParkingSlot);
router.delete('/:id', authorize('admin'), deleteParkingSlot);

module.exports = router;   