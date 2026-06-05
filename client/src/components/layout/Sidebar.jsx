import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Car, ParkingCircle,
  FileText, CreditCard, LogIn, BarChart3,
  Bell, Settings, Search, X
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Cư dân', path: '/residents', icon: Users, roles: ['admin', 'security'] },
    { name: 'Phương tiện', path: '/vehicles', icon: Car, roles: ['admin', 'security'] },
    { name: 'Bãi đỗ xe', path: '/parking-slots', icon: ParkingCircle, roles: ['admin', 'security'] },
    { name: 'Vào/Ra', path: '/parking-logs', icon: LogIn, roles: ['admin', 'security'] },
    { name: 'Hợp đồng', path: '/contracts', icon: FileText, roles: ['admin'] },
    { name: 'Thanh toán', path: '/payments', icon: CreditCard, roles: ['admin'] },
    { name: 'Báo cáo', path: '/reports', icon: BarChart3, roles: ['admin'] },
    { name: 'Thông báo', path: '/notifications', icon: Bell },
  ];

  const filteredItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleNav = (path) => {
    navigate(path);
    onClose?.(); // Đóng sidebar khi navigate trên mobile
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-border bg-background transition-transform duration-300 ease-in-out
      ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="flex h-full flex-col">
        {/* Logo + Close button */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              <ParkingCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">ParkingSlot</h2>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>
          {/* Nút đóng - chỉ hiện trên mobile */}
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              className="w-full rounded-2xl bg-muted py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tìm kiếm..."
            />
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <div className="space-y-1">
            {filteredItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom — Settings + User */}
        <div className="border-t border-border p-3">
          <div className="space-y-1">
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Settings className="h-5 w-5 shrink-0" />
              <span>Cài đặt</span>
            </NavLink>

            <div className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {getInitials(user?.fullName)}
                </span>
                <span className="text-foreground">{user?.fullName}</span>
              </div>
              <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {user?.role === 'admin' ? 'Admin' : user?.role === 'security' ? 'Guard' : 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;