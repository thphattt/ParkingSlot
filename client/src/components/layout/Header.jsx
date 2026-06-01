import { Bell, Cloud, MessageSquare, PanelLeft } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">ParkingSlot Dashboard</h1>

        <div className="flex items-center gap-3">
          {/* Action buttons — rounded-2xl like template */}
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Cloud className="h-5 w-5" />
          </button>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <MessageSquare className="h-5 w-5" />
          </button>

          {/* Notification with badge */}
          <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              3
            </span>
          </button>

          {/* User avatar */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[hsl(var(--primary))] bg-muted text-sm font-semibold transition-colors hover:bg-accent"
            >
              {getInitials(user?.fullName)}
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl z-20">
                  <div className="px-3 py-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;