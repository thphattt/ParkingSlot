import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ParkingCircle, FileText, Users, TrendingUp, ArrowRight, UserPlus } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import dashboardService from '../../services/dashboardService';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        setData(res.data.data);
      } catch (error) {
        console.error('Lỗi tải dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const overview = data?.overview || {};
  const slotByStatus = data?.slotByStatus || {};
  const recentResidents = data?.recentResidents || [];

  const stats = [
    {
      label: 'Tổng slot',
      value: loading ? '...' : overview.totalSlots || 0,
      icon: ParkingCircle,
      color: 'text-violet-500',
      desc: loading ? 'Đang tải...' : `${slotByStatus.available || 0} trống · ${slotByStatus.reserved || 0} đã đặt`,
    },
    {
      label: 'Đang sử dụng',
      value: loading ? '...' : (slotByStatus.occupied || 0) + (slotByStatus.reserved || 0),
      icon: Car,
      color: 'text-blue-500',
      desc: loading ? 'Đang tải...' : `Tỷ lệ lấp đầy ${overview.occupancyRate || 0}%`,
    },
    {
      label: 'Cư dân',
      value: loading ? '...' : overview.totalResidents || 0,
      icon: Users,
      color: 'text-emerald-500',
      desc: loading ? 'Đang tải...' : 'Đang hoạt động',
    },
    {
      label: 'Hợp đồng',
      value: loading ? '...' : overview.totalContracts || 0,
      icon: FileText,
      color: 'text-orange-500',
      desc: loading ? 'Đang tải...' : 'Đang hoạt động',
    },
  ];

  const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

  const quickActions = [
    { label: 'Thêm cư dân mới', icon: Users, color: 'text-emerald-500', path: '/residents' },
    { label: 'Đăng ký phương tiện', icon: Car, color: 'text-blue-500', path: '/vehicles' },
    { label: 'Tạo hợp đồng', icon: FileText, color: 'text-orange-500', path: '/contracts' },
    { label: 'Quản lý bãi đỗ', icon: ParkingCircle, color: 'text-violet-500', path: '/parking-slots' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner — giữ nguyên */}
      <section>
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-xl border border-transparent bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'security' ? 'Bảo vệ' : 'Cư dân'}
              </div>
              <h2 className="text-3xl font-bold">
                Xin chào, {user?.fullName}
              </h2>
              <p className="max-w-[600px] text-white/80">
                Chào mừng bạn đến với hệ thống quản lý bãi đỗ xe thông minh dành cho khu dân cư cao cấp.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-white/90">
                  <TrendingUp className="h-4 w-4" />
                  Xem báo cáo
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white bg-transparent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10">
                  Hướng dẫn sử dụng
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative h-40 w-40">
                <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
                <div className="absolute inset-4 rounded-full bg-white/20" />
                <div className="absolute inset-8 rounded-full bg-white/30" />
                <div className="absolute inset-12 rounded-full bg-white/40" />
                <div className="absolute inset-16 flex items-center justify-center rounded-full bg-white/50">
                  <ParkingCircle className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid — giữ nguyên layout, thay data */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Tổng quan</h2>
          <button className="inline-flex items-center gap-1 rounded-2xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="overflow-hidden rounded-3xl border-2 border-border bg-card p-6 transition-all duration-300 hover:border-[hsl(var(--primary)/0.5)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-muted`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="font-semibold text-3xl tracking-tight text-foreground">
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Recent Residents — thay "Chưa có hoạt động" bằng cư dân mới */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Cư dân mới</h2>
          <div className="rounded-3xl border border-border">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded-lg bg-muted" />
                      <div className="h-3 w-24 animate-pulse rounded-lg bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentResidents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Chưa có cư dân</p>
                <p className="text-sm mt-1">Thêm cư dân mới để bắt đầu</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentResidents.map((r) => (
                  <div key={r._id} className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {r.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{r.fullName}</p>
                        <p className="text-xs text-muted-foreground">{r.building}-{r.apartment} · {r.phone}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions — thêm navigate */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Thao tác nhanh</h2>
          <div className="rounded-3xl border border-border divide-y divide-border">
            {quickActions.map((action) => (
              <div key={action.label} className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <span className="font-medium text-foreground">{action.label}</span>
                </div>
                <button
                  onClick={() => navigate(action.path)}
                  className="inline-flex items-center rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Mở
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;