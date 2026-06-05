import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

// Bọc các route cần kiểm tra role
// allowedRoles: mảng các role được phép vào, VD: ['admin']
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user) return null;

  if (!allowedRoles.includes(user.role)) {
    // Không có quyền → chuyển về Dashboard thay vì hiện trang lỗi
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
