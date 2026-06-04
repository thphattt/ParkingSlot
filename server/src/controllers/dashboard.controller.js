const Resident = require('../models/Resident');
const Vehicle = require('../models/Vehicle');
const ParkingSlot = require('../models/ParkingSlot');
const Contract = require('../models/Contract');

// @desc    Lấy thống kê dashboard
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    // Đếm tổng
    const [totalResidents, totalVehicles, totalSlots, totalContracts] = await Promise.all([
      Resident.countDocuments({ status: 'active' }),
      Vehicle.countDocuments({ status: 'active' }),
      ParkingSlot.countDocuments(),
      Contract.countDocuments({ status: 'active' }),
    ]);

    // Thống kê ô đỗ theo trạng thái
    const slotStats = await ParkingSlot.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const slotByStatus = slotStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});

    // Thống kê xe theo loại
    const vehicleStats = await Vehicle.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    const vehicleByType = vehicleStats.reduce((acc, v) => ({ ...acc, [v._id]: v.count }), {});

    // Hợp đồng sắp hết hạn (trong 30 ngày tới)
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const expiringContracts = await Contract.find({
      status: 'active',
      endDate: { $lte: thirtyDaysLater },
    })
      .populate('resident', 'fullName apartment building')
      .populate('vehicle', 'licensePlate type')
      .populate('slot', 'slotCode')
      .sort('endDate')
      .limit(5);

    // Cư dân mới (5 người gần nhất)
    const recentResidents = await Resident.find({ status: 'active' })
      .sort('-createdAt')
      .limit(5)
      .select('fullName apartment building phone createdAt');

    // Tỷ lệ lấp đầy
    const occupancyRate = totalSlots > 0
      ? Math.round(((slotByStatus.occupied || 0) + (slotByStatus.reserved || 0)) / totalSlots * 100)
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalResidents,
          totalVehicles,
          totalSlots,
          totalContracts,
          occupancyRate,
        },
        slotByStatus,
        vehicleByType,
        expiringContracts,
        recentResidents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};