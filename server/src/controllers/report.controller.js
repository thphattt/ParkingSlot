const Payment = require('../models/Payment');
const Contract = require('../models/Contract');
const ParkingSlot = require('../models/ParkingSlot');
const ParkingLog = require('../models/ParkingLog');

// @desc    Lấy tất cả báo cáo (Doanh thu, Hợp đồng, Bãi đỗ, Lưu lượng)
// @route   GET /api/reports
exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(`${endDate}T23:59:59.999Z`),
        },
      };
    } else {
      // Default: current year
      const currentYear = new Date().getFullYear();
      dateFilter = {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
        },
      };
    }

    // 1. Doanh thu theo tháng
    const revenueFilter = { status: 'paid' };
    if (startDate && endDate) {
      revenueFilter.paidDate = {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }

    const revenueRaw = await Payment.aggregate([
      { $match: revenueFilter },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const revenue = revenueRaw.map((item) => ({
      name: `T${item._id.month}/${item._id.year}`,
      total: item.totalAmount,
    }));

    // 2. Trạng thái Hợp đồng
    const contractRaw = await Contract.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const contractMap = {
      active: 'Hoạt động',
      expired: 'Hết hạn',
      cancelled: 'Đã hủy',
    };
    const contracts = contractRaw.map((item) => ({
      name: contractMap[item._id] || item._id,
      value: item.count,
    }));

    // 3. Trạng thái Ô đỗ
    const slotRaw = await ParkingSlot.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const slotMap = {
      available: 'Trống',
      occupied: 'Đang đỗ',
      reserved: 'Đã thuê',
      maintenance: 'Bảo trì',
    };
    const slots = slotRaw.map((item) => ({
      name: slotMap[item._id] || item._id,
      value: item.count,
    }));

    // 4. Lưu lượng ra vào theo khung giờ
    const trafficRaw = await ParkingLog.aggregate([
      { $match: dateFilter },
      {
        $project: {
          hour: { $hour: { date: '$createdAt', timezone: '+07:00' } },
        },
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing hours
    const traffic = Array.from({ length: 24 }, (_, i) => {
      const match = trafficRaw.find((t) => t._id === i);
      return {
        name: `${i}h`,
        entries: match ? match.count : 0,
      };
    });

    res.json({
      success: true,
      data: {
        revenue,
        contracts,
        slots,
        traffic,
      },
    });
  } catch (error) {
    console.error('Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
