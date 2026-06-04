const ParkingLog = require('../models/ParkingLog');
const Vehicle = require('../models/Vehicle');
const Contract = require('../models/Contract');
const ParkingSlot = require('../models/ParkingSlot');

// @desc    Ghi nhận xe VÀO
// @route   POST /api/parking-logs/entry
exports.recordEntry = async (req, res) => {
  try {
    const { licensePlate, gate, note } = req.body;

    if (!licensePlate) {
      return res.status(400).json({ success: false, message: 'Biển số xe là bắt buộc' });
    }

    // 1. Tìm xe theo biển số
    const vehicle = await Vehicle.findOne({
      licensePlate: licensePlate.toUpperCase(),
      status: 'active',
    }).populate('owner', 'fullName phone apartment building');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Xe chưa đăng ký trong hệ thống' });
    }

    // 2. Kiểm tra xe có đang trong bãi không (đã entry mà chưa exit)
    const lastLog = await ParkingLog.findOne({ vehicle: vehicle._id })
      .sort('-createdAt');

    if (lastLog && lastLog.type === 'entry') {
      return res.status(400).json({
        success: false,
        message: 'Xe đang trong bãi, chưa ghi nhận ra',
      });
    }

    // 3. Tìm hợp đồng active
    const contract = await Contract.findOne({
      vehicle: vehicle._id,
      status: 'active',
    }).populate('slot', 'slotCode floor zone');

    if (!contract) {
      return res.status(400).json({
        success: false,
        message: 'Xe chưa có hợp đồng. Vui lòng tạo hợp đồng trước.',
      });
    }

    // 4. Ghi log
    const log = await ParkingLog.create({
      vehicle: vehicle._id,
      contract: contract._id,
      slot: contract.slot._id,
      type: 'entry',
      licensePlate: vehicle.licensePlate,
      gate: gate || 'Cổng chính',
      recordedBy: req.user._id,
      note,
    });

    // 5. Cập nhật ô đỗ: reserved → occupied
    await ParkingSlot.findByIdAndUpdate(contract.slot._id, { status: 'occupied' });

    res.status(201).json({
      success: true,
      message: `Xe ${vehicle.licensePlate} đã vào bãi`,
      data: {
        log,
        vehicle: {
          licensePlate: vehicle.licensePlate,
          type: vehicle.type,
          brand: vehicle.brand,
          model: vehicle.model,
          color: vehicle.color,
          owner: vehicle.owner,
        },
        slot: contract.slot,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Ghi nhận xe RA
// @route   POST /api/parking-logs/exit
exports.recordExit = async (req, res) => {
  try {
    const { licensePlate, gate, note } = req.body;

    if (!licensePlate) {
      return res.status(400).json({ success: false, message: 'Biển số xe là bắt buộc' });
    }

    // 1. Tìm xe
    const vehicle = await Vehicle.findOne({
      licensePlate: licensePlate.toUpperCase(),
      status: 'active',
    }).populate('owner', 'fullName phone apartment building');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Xe chưa đăng ký trong hệ thống' });
    }

    // 2. Kiểm tra xe có đang trong bãi không
    const lastLog = await ParkingLog.findOne({ vehicle: vehicle._id })
      .sort('-createdAt');

    if (!lastLog || lastLog.type === 'exit') {
      return res.status(400).json({
        success: false,
        message: 'Xe chưa vào bãi hoặc đã ra rồi',
      });
    }

    // 3. Tìm hợp đồng
    const contract = await Contract.findOne({
      vehicle: vehicle._id,
      status: 'active',
    }).populate('slot', 'slotCode floor zone');

    // 4. Ghi log
    const log = await ParkingLog.create({
      vehicle: vehicle._id,
      contract: contract?._id,
      slot: contract?.slot?._id,
      type: 'exit',
      licensePlate: vehicle.licensePlate,
      gate: gate || 'Cổng chính',
      recordedBy: req.user._id,
      note,
    });

    // 5. Cập nhật ô đỗ: occupied → reserved
    if (contract?.slot) {
      await ParkingSlot.findByIdAndUpdate(contract.slot._id, { status: 'reserved' });
    }

    // Tính thời gian đỗ
    const entryTime = lastLog.createdAt;
    const exitTime = log.createdAt;
    const durationMs = exitTime - entryTime;
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);

    res.status(201).json({
      success: true,
      message: `Xe ${vehicle.licensePlate} đã ra khỏi bãi`,
      data: {
        log,
        vehicle: {
          licensePlate: vehicle.licensePlate,
          type: vehicle.type,
          owner: vehicle.owner,
        },
        duration: `${hours}h ${minutes}p`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy lịch sử vào/ra
// @route   GET /api/parking-logs
exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, search, sort = '-createdAt' } = req.query;

    const query = {};
    if (type) query.type = type;
    if (search) {
      query.licensePlate = { $regex: search, $options: 'i' };
    }

    const total = await ParkingLog.countDocuments(query);
    const logs = await ParkingLog.find(query)
      .populate('vehicle', 'licensePlate type brand model color')
      .populate('slot', 'slotCode floor zone')
      .populate('recordedBy', 'fullName')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: logs,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy xe đang trong bãi
// @route   GET /api/parking-logs/current
exports.getCurrentVehicles = async (req, res) => {
  try {
    // Tìm tất cả entry logs chưa có exit tương ứng
    const entryLogs = await ParkingLog.aggregate([
      { $sort: { vehicle: 1, createdAt: -1 } },
      {
        $group: {
          _id: '$vehicle',
          lastType: { $first: '$type' },
          lastTime: { $first: '$createdAt' },
          lastSlot: { $first: '$slot' },
          licensePlate: { $first: '$licensePlate' },
        },
      },
      { $match: { lastType: 'entry' } },
      { $sort: { lastTime: -1 } },
    ]);

    // Populate thông tin
    const vehicleIds = entryLogs.map((e) => e._id);
    const vehicles = await Vehicle.find({ _id: { $in: vehicleIds } })
      .populate('owner', 'fullName phone apartment building');

    const slotIds = entryLogs.filter((e) => e.lastSlot).map((e) => e.lastSlot);
    const slots = await require('../models/ParkingSlot').find({ _id: { $in: slotIds } });

    const result = entryLogs.map((entry) => {
      const vehicle = vehicles.find((v) => v._id.toString() === entry._id.toString());
      const slot = slots.find((s) => s._id.toString() === entry.lastSlot?.toString());
      return {
        vehicle,
        slot,
        licensePlate: entry.licensePlate,
        entryTime: entry.lastTime,
      };
    });

    res.json({
      success: true,
      data: result,
      total: result.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};