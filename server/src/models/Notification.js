const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề là bắt buộc'],
    },
    content: {
      type: String,
      required: [true, 'Nội dung là bắt buộc'],
    },
    type: {
      type: String,
      enum: ['system', 'payment', 'maintenance', 'general'],
      default: 'general',
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      // Nếu recipient rỗng (null) => Thông báo gửi cho TẤT CẢ mọi người
    },
    isRead: {
      type: Boolean,
      default: false,
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

// Đánh index để sau này lọc thông báo cho nhanh
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);