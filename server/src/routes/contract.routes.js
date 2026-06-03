const express = require('express');
const router = express.Router();
const {
  getContracts,
  getContract,
  createContract,
  cancelContract,
  deleteContract,
} = require('../controllers/contract.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getContracts).post(createContract);
router.route('/:id').get(getContract).delete(deleteContract);
router.put('/:id/cancel', cancelContract);

module.exports = router;