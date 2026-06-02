const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Họ tên là bắt buộc'],
      trim: true,
      maxlength: [100, 'Họ tên không quá 100 ký tự'],
      match: [/^[\p{L}\s]+$/u, 'Họ tên chỉ được chứa ký tự chữ và khoảng trắng'],
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      unique: true,
      match: [/^0\d{9}$/, 'Số điện thoại không hợp lệ (VD: 0901234567)'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    idCard: {
      type: String,
      required: [true, 'CCCD/CMND là bắt buộc'],
      unique: true,
      match: [/^\d{9,12}$/, 'CCCD/CMND phải là 9-12 chữ số'],
    },
    apartment: {
      type: String,
      required: [true, 'Số căn hộ là bắt buộc'],
      trim: true,
      uppercase: true,
    },
    building: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'A',
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: lấy phương tiện của cư dân
residentSchema.virtual('vehicles', {
  ref: 'Vehicle',
  localField: '_id',
  foreignField: 'owner',
});

// Index cho tìm kiếm
residentSchema.index({ fullName: 'text', phone: 'text', apartment: 'text' });
residentSchema.index({ apartment: 1, building: 1 });

module.exports = mongoose.model('Resident', residentSchema);