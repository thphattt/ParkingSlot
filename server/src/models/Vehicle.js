const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    licensePlate: {
      type: String,
      required: [true, 'Biển số xe là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[0-9]{2}[A-Z]{1,2}[0-9\-\.]{4,6}$/, 'Biển số không đúng định dạng (VD: 51F12345, 30A-123.45)'],
    },
    type: {
      type: String,
      required: [true, 'Loại phương tiện là bắt buộc'],
      enum: {
        values: ['car', 'motorbike'],
        message: 'Loại phương tiện phải là car hoặc motorbike',
      },
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [50, 'Hãng xe không quá 50 ký tự'],
    },
    model: {
      type: String,
      trim: true,
      maxlength: [50, 'Dòng xe không quá 50 ký tự'],
    },
    color: {
      type: String,
      trim: true,
      maxlength: [30, 'Màu xe không quá 30 ký tự'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      required: [true, 'Chủ xe (cư dân) là bắt buộc'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
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

// Index (licensePlate đã có index từ unique:true, không cần khai báo lại)
vehicleSchema.index({ owner: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);