const Contract = require('../models/Contract');
const ParkingSlot = require('../models/ParkingSlot');
const Resident = require('../models/Resident');
const Vehicle = require('../models/Vehicle');

const populateFields = [
  { path: 'resident', select: 'fullName phone apartment building' },
  { path: 'vehicle', select: 'licensePlate type brand model color' },
  { path: 'slot', select: 'slotCode floor zone type monthlyPrice' },
];

// @desc    Lấy tất cả hợp đồng
// @route   GET /api/contracts
exports.getContracts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, resident, sort = '-createdAt' } = req.query;

    const query = {};
    if (search) {
      query.contractCode = { $regex: search, $options: 'i' };
    }
    if (status) query.status = status;
    if (resident) query.resident = resident;

    const total = await Contract.countDocuments(query);
    const contracts = await Contract.find(query)
      .populate(populateFields)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: contracts,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy 1 hợp đồng
// @route   GET /api/contracts/:id
exports.getContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).populate(populateFields);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng' });
    }
    res.json({ success: true, data: contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo hợp đồng mới
// @route   POST /api/contracts
exports.createContract = async (req, res) => {
  try {
    const { resident, vehicle, slot, startDate, endDate, monthlyPrice, deposit, note } = req.body;

    // 1. Kiểm tra cư dân tồn tại
    const residentDoc = await Resident.findById(resident);
    if (!residentDoc) {
      return res.status(400).json({ success: false, message: 'Cư dân không tồn tại' });
    }

    // 2. Kiểm tra xe tồn tại + thuộc về cư dân
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(400).json({ success: false, message: 'Phương tiện không tồn tại' });
    }
    if (vehicleDoc.owner.toString() !== resident) {
      return res.status(400).json({ success: false, message: 'Phương tiện không thuộc về cư dân này' });
    }

    // 3. Kiểm tra ô đỗ tồn tại + đang trống
    const slotDoc = await ParkingSlot.findById(slot);
    if (!slotDoc) {
      return res.status(400).json({ success: false, message: 'Ô đỗ không tồn tại' });
    }
    if (slotDoc.status !== 'available') {
      return res.status(400).json({ success: false, message: `Ô đỗ ${slotDoc.slotCode} đang ${slotDoc.status}, không thể đăng ký` });
    }

    // 4. Kiểm tra loại xe phù hợp loại ô
    if (vehicleDoc.type !== slotDoc.type) {
      return res.status(400).json({
        success: false,
        message: `Loại xe (${vehicleDoc.type}) không phù hợp loại ô đỗ (${slotDoc.type})`,
      });
    }

    // 5. Kiểm tra xe chưa có hợp đồng active
    const existingContract = await Contract.findOne({ vehicle, status: 'active' });
    if (existingContract) {
      return res.status(400).json({ success: false, message: 'Phương tiện đã có hợp đồng đang hoạt động' });
    }

    // 6. Tạo hợp đồng
    const contract = await Contract.create({
      resident, vehicle, slot, startDate, endDate,
      monthlyPrice: monthlyPrice || slotDoc.monthlyPrice,
      deposit, note,
    });

    // 7. Cập nhật trạng thái ô đỗ → reserved
    slotDoc.status = 'reserved';
    await slotDoc.save();

    const populated = await contract.populate(populateFields);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hủy hợp đồng
// @route   PUT /api/contracts/:id/cancel
exports.cancelContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng' });
    }
    if (contract.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể hủy hợp đồng đang hoạt động' });
    }

    // Hủy hợp đồng
    contract.status = 'cancelled';
    await contract.save();

    // Trả ô đỗ về available
    await ParkingSlot.findByIdAndUpdate(contract.slot, { status: 'available' });

    const populated = await contract.populate(populateFields);
    res.json({ success: true, data: populated, message: 'Đã hủy hợp đồng' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa hợp đồng
// @route   DELETE /api/contracts/:id
exports.deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng' });
    }
    if (contract.status === 'active') {
      return res.status(400).json({ success: false, message: 'Không thể xóa hợp đồng đang hoạt động. Hãy hủy trước.' });
    }

    await contract.deleteOne();
    res.json({ success: true, message: 'Đã xóa hợp đồng' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};