const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
  {
    contractCode: {
      type: String,
      unique: true,
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      required: [true, 'Cư dân là bắt buộc'],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Phương tiện là bắt buộc'],
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSlot',
      required: [true, 'Ô đỗ xe là bắt buộc'],
    },
    startDate: {
      type: Date,
      required: [true, 'Ngày bắt đầu là bắt buộc'],
    },
    endDate: {
      type: Date,
      required: [true, 'Ngày kết thúc là bắt buộc'],
    },
    monthlyPrice: {
      type: Number,
      required: [true, 'Giá thuê tháng là bắt buộc'],
      min: [0, 'Giá không được âm'],
    },
    deposit: {
      type: Number,
      default: 0,
      min: [0, 'Tiền cọc không được âm'],
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
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

// Tự tạo mã hợp đồng: HD-20260603-001
contractSchema.pre('save', async function () {
  if (!this.contractCode) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Contract').countDocuments();
    this.contractCode = `HD-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }

  // Validate: endDate phải sau startDate
  if (this.endDate <= this.startDate) {
    throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
  }
});

// Index
contractSchema.index({ resident: 1 });
contractSchema.index({ vehicle: 1 });
contractSchema.index({ slot: 1 });
contractSchema.index({ status: 1 });

module.exports = mongoose.model('Contract', contractSchema);