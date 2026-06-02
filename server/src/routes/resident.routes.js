const express = require('express');
const router = express.Router();
const {
  getResidents,
  getResident,
  createResident,
  updateResident,
  deleteResident,
} = require('../controllers/resident.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Tất cả routes cần đăng nhập + quyền admin
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getResidents).post(createResident);
router.route('/:id').get(getResident).put(updateResident).delete(deleteResident);

module.exports = router;