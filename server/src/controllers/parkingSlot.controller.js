const ParkingSlot = require('../models/ParkingSlot');

// @desc    Lấy tất cả ô đỗ
// @route   GET /api/parking-slots
exports.getParkingSlots = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type, status, floor, zone, sort = 'slotCode' } = req.query;

    const query = {};
    if (search) {
      query.slotCode = { $regex: search, $options: 'i' };
    }
    if (type) query.type = type;
    if (status) query.status = status;
    if (floor) query.floor = floor.toUpperCase();
    if (zone) query.zone = zone.toUpperCase();

    const total = await ParkingSlot.countDocuments(query);
    const slots = await ParkingSlot.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Thống kê nhanh
    const stats = await ParkingSlot.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: slots,
      stats: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy 1 ô đỗ
// @route   GET /api/parking-slots/:id
exports.getParkingSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ô đỗ' });
    }
    res.json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo ô đỗ mới
// @route   POST /api/parking-slots
exports.createParkingSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.create(req.body);
    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Mã ô đỗ đã tồn tại' });
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo nhiều ô đỗ cùng lúc (bulk)
// @route   POST /api/parking-slots/bulk
exports.createBulkParkingSlots = async (req, res) => {
  try {
    const { floor, zone, type, monthlyPrice, startNumber, endNumber } = req.body;

    if (!floor || !type || !monthlyPrice || !startNumber || !endNumber) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }

    const slots = [];
    for (let i = startNumber; i <= endNumber; i++) {
      const num = String(i).padStart(2, '0');
      slots.push({
        slotCode: `${floor}-${zone || 'A'}${num}`,
        floor,
        zone: zone || 'A',
        type,
        monthlyPrice,
      });
    }

    const created = await ParkingSlot.insertMany(slots, { ordered: false });
    res.status(201).json({ success: true, data: created, count: created.length });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Một số mã ô đỗ đã tồn tại' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật ô đỗ
// @route   PUT /api/parking-slots/:id
exports.updateParkingSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ô đỗ' });
    }
    res.json({ success: true, data: slot });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Mã ô đỗ đã tồn tại' });
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa ô đỗ
// @route   DELETE /api/parking-slots/:id
exports.deleteParkingSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ô đỗ' });
    }
    if (slot.status === 'occupied' || slot.status === 'reserved') {
      return res.status(400).json({ success: false, message: 'Không thể xóa ô đỗ đang sử dụng hoặc đã đặt' });
    }
    await slot.deleteOne();
    res.json({ success: true, message: 'Đã xóa ô đỗ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};