const Vehicle = require('../models/Vehicle');
const Resident = require('../models/Resident');

// @desc    Lấy tất cả phương tiện
// @route   GET /api/vehicles
exports.getVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status, owner, sort = '-createdAt' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { licensePlate: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }
    if (type) query.type = type;
    if (status) query.status = status;
    if (owner) query.owner = owner;

    const total = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
      .populate('owner', 'fullName phone apartment building')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: vehicles,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy 1 phương tiện
// @route   GET /api/vehicles/:id
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('owner', 'fullName phone apartment building email');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phương tiện' });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo phương tiện mới
// @route   POST /api/vehicles
exports.createVehicle = async (req, res) => {
  try {
    // Kiểm tra cư dân có tồn tại không
    const resident = await Resident.findById(req.body.owner);
    if (!resident) {
      return res.status(400).json({ success: false, message: 'Cư dân không tồn tại' });
    }

    const vehicle = await Vehicle.create(req.body);
    const populated = await vehicle.populate('owner', 'fullName phone apartment building');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Biển số xe đã tồn tại' });
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật phương tiện
// @route   PUT /api/vehicles/:id
exports.updateVehicle = async (req, res) => {
  try {
    // Nếu đổi owner, kiểm tra cư dân mới có tồn tại
    if (req.body.owner) {
      const resident = await Resident.findById(req.body.owner);
      if (!resident) {
        return res.status(400).json({ success: false, message: 'Cư dân không tồn tại' });
      }
    }

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('owner', 'fullName phone apartment building');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phương tiện' });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Biển số xe đã tồn tại' });
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa phương tiện
// @route   DELETE /api/vehicles/:id
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phương tiện' });
    }
    res.json({ success: true, message: 'Đã xóa phương tiện' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};