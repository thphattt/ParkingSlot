const User = require('../models/User');

// @desc    Lấy thông tin cá nhân
// @route   GET /api/settings/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/settings/profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phone },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user, message: 'Cập nhật thành công!' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Đổi mật khẩu (ai cũng tự đổi được của mình)
// @route   PUT /api/settings/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới tối thiểu 6 ký tự' });
    }

    // Phải dùng .select('+password') vì field password có select: false trong model
    const user = await User.findById(req.user._id).select('+password');

    // Xác thực mật khẩu cũ
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    }

    user.password = newPassword;
    await user.save(); // Mongoose sẽ tự hash lại nhờ pre-save hook

    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== QUẢN LÝ NHÂN VIÊN (Chỉ Admin) ====================

// @desc    Lấy danh sách tất cả tài khoản
// @route   GET /api/settings/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await User.countDocuments();
    const users = await User.find()
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: users,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo tài khoản nhân viên mới
// @route   POST /api/settings/users
exports.createUser = async (req, res) => {
  try {
    const { email, password, fullName, phone, role } = req.body;

    const user = await User.create({ email, password, fullName, phone, role });

    res.status(201).json({ success: true, data: user, message: 'Tạo tài khoản thành công!' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng' });
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Kích hoạt / Vô hiệu hóa tài khoản
// @route   PUT /api/settings/users/:id/toggle
exports.toggleUserStatus = async (req, res) => {
  try {
    // Không cho Admin tự khóa mình
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Không thể tự vô hiệu hóa tài khoản của mình' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      data: user,
      message: user.isActive ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hóa tài khoản',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset mật khẩu về "123456" (Admin dùng khi nhân viên quên MK)
// @route   PUT /api/settings/users/:id/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });

    user.password = '123456'; // Sẽ được tự hash bởi pre-save hook
    await user.save();

    res.json({ success: true, message: `Đã reset mật khẩu của ${user.fullName} về "123456"` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa tài khoản
// @route   DELETE /api/settings/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Không thể tự xóa tài khoản của mình' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });

    res.json({ success: true, message: 'Đã xóa tài khoản' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};