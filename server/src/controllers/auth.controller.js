const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// @desc    Đăng ký tài khoản
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng',
      });
    }

    // Tạo user mới (password tự động hash nhờ pre('save') middleware)
    const user = await User.create({
      email,
      password,
      fullName,
      phone,
    });

    // Tạo tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Lưu refresh token vào DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Gửi refresh token qua HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,    // JavaScript không đọc được → chống XSS
      secure: process.env.NODE_ENV === 'production', // HTTPS only trong production
      sameSite: 'strict', // Chống CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (milliseconds)
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        },
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu',
      });
    }

    // Tìm user + lấy password (vì select: false nên phải dùng +password)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    // Kiểm tra tài khoản có active không
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa. Liên hệ admin để hỗ trợ',
      });
    }

    // So sánh password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    // Tạo tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Cập nhật refresh token + last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Gửi refresh token qua cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        },
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// @desc    Đăng xuất
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Xóa refresh token trong DB
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    // Xóa cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// @desc    Làm mới Access Token
// @route   POST /api/auth/refresh-token
// @access  Public (nhưng cần refresh token cookie)
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy refresh token',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Tìm user và kiểm tra refresh token khớp không
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ',
      });
    }

    // Tạo access token mới
    const newAccessToken = generateAccessToken(user._id);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Refresh token hết hạn, vui lòng đăng nhập lại',
    });
  }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user, // Đã được gắn bởi protect middleware
    },
  });
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
};