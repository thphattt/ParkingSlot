const Notification = require('../models/Notification');
const Resident = require('../models/Resident');
const Payment = require('../models/Payment');
const sendEmail = require('../utils/sendEmail');

// @desc    Lấy danh sách thông báo
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const query = {};
    if (type) query.type = type;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate('recipient', 'fullName apartment building')
      .populate('createdBy', 'fullName')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: notifications,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo thông báo mới (và gửi Email)
// @route   POST /api/notifications
exports.createNotification = async (req, res) => {
  try {
    const { title, content, type, recipient } = req.body;

    const notification = await Notification.create({
      title,
      content,
      type: type || 'general',
      recipient: recipient || null,
      createdBy: req.user._id,
    });

    // Nếu có chọn người nhận cụ thể, tìm xem họ có Email không để gửi
    if (recipient) {
      const resident = await Resident.findById(recipient);
      if (resident && resident.email) {
        await sendEmail({
          email: resident.email,
          subject: title,
          message: `
            <h3>Xin chào ${resident.fullName},</h3>
            <p>${content}</p>
            <br/>
            <i>Đây là email tự động từ Ban Quản Lý bãi đỗ xe. Vui lòng không trả lời.</i>
          `,
        });
      }
    }

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tự động nhắc nợ (Quét hóa đơn quá hạn)
// @route   POST /api/notifications/auto-remind
exports.autoRemindOverdue = async (req, res) => {
  try {
    // Tìm các hóa đơn đang overdue
    const overduePayments = await Payment.find({ status: 'overdue' }).populate('resident');

    if (overduePayments.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có hóa đơn nào quá hạn' });
    }

    let count = 0;
    for (const payment of overduePayments) {
      const title = `[Quan trọng] Nhắc nhở thanh toán cước tháng ${payment.month}/${payment.year}`;
      const content = `Kính gửi cư dân ${payment.resident.fullName}, hiện tại hóa đơn phí đỗ xe tháng ${payment.month}/${payment.year} của bạn đang quá hạn. Vui lòng thanh toán sớm nhất có thể.`;

      // Tạo thông báo vào DB
      await Notification.create({
        title,
        content,
        type: 'payment',
        recipient: payment.resident._id,
        createdBy: req.user._id,
      });
      count++;

      // Gửi Email nếu có
      if (payment.resident.email) {
        await sendEmail({
          email: payment.resident.email,
          subject: title,
          message: `<h3 style="color: red;">Xin chào ${payment.resident.fullName},</h3><p>${content}</p>`,
        });
      }
    }

    res.json({ success: true, message: `Đã tạo ${count} thông báo nhắc nợ và gửi Email` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa thông báo
// @route   DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa thông báo' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};