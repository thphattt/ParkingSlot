const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware: Bảo vệ route — chỉ user đã đăng nhập mới vào được
const protect = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ header: "Bearer eyJhbGci..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để truy cập',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user từ token, kiểm tra còn tồn tại không
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị khóa',
      });
    }

    // Gắn user vào request để các handler sau dùng
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ',
    });
  }
};

// Middleware: Kiểm tra quyền — chỉ cho phép các role được chỉ định
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role "${req.user.role}" không có quyền truy cập`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };