const Payment = require('../models/Payment');
const Contract = require('../models/Contract');

// @desc    Tạo hóa đơn hàng tháng cho tất cả HĐ active
// @route   POST /api/payments/generate
exports.generateMonthly = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Tháng và năm là bắt buộc' });
    }

    // Tìm tất cả HĐ active
    const contracts = await Contract.find({ status: 'active' })
      .populate('resident', 'fullName')
      .populate('slot', 'monthlyPrice slotCode');

    if (contracts.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có hợp đồng active' });
    }

    let created = 0;
    let skipped = 0;
    const errors = [];

    for (const contract of contracts) {
      try {
        // Kiểm tra đã có hóa đơn chưa
        const exists = await Payment.findOne({
          contract: contract._id,
          month: Number(month),
          year: Number(year),
        });

        if (exists) {
          skipped++;
          continue;
        }

        // Kiểm tra xem hợp đồng có hiệu lực trong tháng được chọn không
        // Nếu startDate > cuối tháng đó, hoặc endDate < đầu tháng đó -> bỏ qua
        const targetMonthStart = new Date(year, month - 1, 1);
        const targetMonthEnd = new Date(year, month, 0, 23, 59, 59);

        if (contract.startDate > targetMonthEnd || contract.endDate < targetMonthStart) {
          skipped++;
          continue;
        }

        await Payment.create({
          contract: contract._id,
          resident: contract.resident._id || contract.resident,
          slot: contract.slot?._id,
          amount: contract.monthlyPrice || contract.slot?.monthlyPrice || 0,
          month: Number(month),
          year: Number(year),
          dueDate: new Date(year, month - 1, 5, 23, 59, 59),
          status: 'pending',
          createdBy: req.user._id,
        });
        created++;
      } catch (err) {
        errors.push(`HĐ ${contract.contractCode}: ${err.message}`);
      }
    }

    res.status(201).json({
      success: true,
      message: `Đã tạo ${created} hóa đơn, bỏ qua ${skipped} (đã tồn tại)`,
      data: { created, skipped, errors },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy danh sách hóa đơn
// @route   GET /api/payments
exports.getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, month, year, search } = req.query;

    // Tự động quét và cập nhật các hóa đơn quá hạn (chưa thanh toán & đã qua ngày 5)
    await Payment.updateMany({
      status: 'pending',
      dueDate: { $lt: new Date() }
    }, {
      $set: { status: 'overdue' }
    });

    const query = {};
    if (status) query.status = status;
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    // Nếu có search → tìm resident trước
    if (search) {
      const Resident = require('../models/Resident');
      const residents = await Resident.find({
        fullName: { $regex: search, $options: 'i' },
      }).select('_id');
      query.resident = { $in: residents.map((r) => r._id) };
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('resident', 'fullName phone apartment building')
      .populate('contract', 'contractCode')
      .populate('slot', 'slotCode floor zone')
      .sort('-year -month -createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Thống kê nhanh
    const stats = await Payment.aggregate([
      { $match: month && year ? { month: Number(month), year: Number(year) } : {} },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const statsSummary = stats.reduce((acc, s) => ({
      ...acc,
      [s._id]: { count: s.count, totalAmount: s.totalAmount },
    }), {});

    res.json({
      success: true,
      data: payments,
      stats: statsSummary,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Đánh dấu đã thanh toán
// @route   PUT /api/payments/:id/pay
exports.markAsPaid = async (req, res) => {
  try {
    const { paymentMethod, note } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn' });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Hóa đơn đã thanh toán rồi' });
    }

    payment.status = 'paid';
    payment.paidDate = new Date();
    payment.paymentMethod = paymentMethod || 'cash';
    if (note) payment.note = note;
    await payment.save();

    res.json({
      success: true,
      message: 'Đã ghi nhận thanh toán',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa hóa đơn
// @route   DELETE /api/payments/:id
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn' });
    }

    await payment.deleteOne();
    res.json({ success: true, message: 'Đã xóa hóa đơn' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};