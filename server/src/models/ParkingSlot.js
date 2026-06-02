const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
    slotCode: {
      type: String,
      required: [true, 'Mã ô đỗ là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    floor: {
      type: String,
      required: [true, 'Tầng là bắt buộc'],
      trim: true,
      uppercase: true,
    },
    zone: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'A',
    },
    type: {
      type: String,
      required: [true, 'Loại ô đỗ là bắt buộc'],
      enum: {
        values: ['car', 'motorbike'],
        message: 'Loại ô đỗ phải là car hoặc motorbike',
      },
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available',
    },
    monthlyPrice: {
      type: Number,
      required: [true, 'Giá thuê tháng là bắt buộc'],
      min: [0, 'Giá không được âm'],
    },
    note: {
      type: String,
      maxlength: [500, 'Ghi chú không quá 500 ký tự'],
    },
  },
  {
    timestamps: true,
  }
);

// Index
parkingSlotSchema.index({ floor: 1, zone: 1 });
parkingSlotSchema.index({ status: 1, type: 1 });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);