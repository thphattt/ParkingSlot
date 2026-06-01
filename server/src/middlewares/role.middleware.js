// Middleware: Kiểm tra role — chỉ cho phép các role chỉ định
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role "${req.user.role}" không có quyền truy cập`,
      });
    }

    next();
  };
};

module.exports = { authorize };