const Resident = require('../models/Resident');

// @desc    Lấy tất cả cư dân (phân trang, search, filter)
// @route   GET /api/residents
exports.getResidents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, building, sort = '-createdAt' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { apartment: { $regex: search, $options: 'i' } },
        { idCard: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (building) query.building = building.toUpperCase();

    const total = await Resident.countDocuments(query);
    const residents = await Resident.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: residents,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy 1 cư dân
// @route   GET /api/residents/:id
exports.getResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id).populate('vehicles');
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cư dân' });
    }
    res.json({ success: true, data: resident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo cư dân mới
// @route   POST /api/residents
exports.createResident = async (req, res) => {
  try {
    const resident = await Resident.create(req.body);
    res.status(201).json({ success: true, data: resident });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const messages = { phone: 'Số điện thoại đã tồn tại', idCard: 'CCCD/CMND đã tồn tại' };
      return res.status(400).json({ success: false, message: messages[field] || `${field} đã tồn tại` });
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật cư dân
// @route   PUT /api/residents/:id
exports.updateResident = async (req, res) => {
  try {
    const resident = await Resident.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cư dân' });
    }
    res.json({ success: true, data: resident });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const messages = { phone: 'Số điện thoại đã tồn tại', idCard: 'CCCD/CMND đã tồn tại' };
      return res.status(400).json({ success: false, message: messages[field] || `${field} đã tồn tại` });
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa cư dân
// @route   DELETE /api/residents/:id
exports.deleteResident = async (req, res) => {
  try {
    const resident = await Resident.findByIdAndDelete(req.params.id);
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cư dân' });
    }
    res.json({ success: true, message: 'Đã xóa cư dân' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};