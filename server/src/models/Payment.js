const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: [true, 'Hợp đồng là bắt buộc'],
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      required: [true, 'Cư dân là bắt buộc'],
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSlot',
    },
    amount: {
      type: Number,
      required: [true, 'Số tiền là bắt buộc'],
      min: [0, 'Số tiền không được âm'],
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending',
    },
    paidDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'transfer', 'card'],
    },
    note: {
      type: String,
      maxlength: [500, 'Ghi chú không quá 500 ký tự'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Không tạo trùng hóa đơn cho cùng HĐ + tháng + năm
paymentSchema.index({ contract: 1, month: 1, year: 1 }, { unique: true });
paymentSchema.index({ status: 1 });
paymentSchema.index({ resident: 1 });

module.exports = mongoose.model('Payment', paymentSchema);