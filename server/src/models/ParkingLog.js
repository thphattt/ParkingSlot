const mongoose = require('mongoose');

const parkingLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Phương tiện là bắt buộc'],
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSlot',
    },
    type: {
      type: String,
      enum: ['entry', 'exit'],
      required: [true, 'Loại (vào/ra) là bắt buộc'],
    },
    licensePlate: {
      type: String,
      required: true,
      uppercase: true,
    },
    gate: {
      type: String,
      default: 'Cổng chính',
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Index để query nhanh
parkingLogSchema.index({ vehicle: 1, createdAt: -1 });
parkingLogSchema.index({ type: 1, createdAt: -1 });
parkingLogSchema.index({ licensePlate: 1 });

module.exports = mongoose.model('ParkingLog', parkingLogSchema);