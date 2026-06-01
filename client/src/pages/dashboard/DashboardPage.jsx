import { Car, ParkingCircle, FileText, Users, TrendingUp, ArrowRight } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const DashboardPage = () => {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Tổng slot', value: '—', icon: ParkingCircle, color: 'text-violet-500', desc: 'Chưa có dữ liệu' },
    { label: 'Đang sử dụng', value: '—', icon: Car, color: 'text-blue-500', desc: 'Chưa có dữ liệu' },
    { label: 'Cư dân', value: '—', icon: Users, color: 'text-emerald-500', desc: 'Chưa có dữ liệu' },
    { label: 'Hợp đồng', value: '—', icon: FileText, color: 'text-orange-500', desc: 'Chưa có dữ liệu' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner — gradient like Designali */}
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
            {/* Decorative circles — matching template DNA */}
            <div className="hidden lg:block">
              <div className="relative h-40 w-40">
                <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
                <div className="absolute inset-4 rounded-full bg-white/20" />
                <div className="absolute inset-8 rounded-full bg-white/30" />
                <div className="absolute inset-12 rounded-full bg-white/40" />
                <div className="absolute inset-16 flex items-center justify-center rounded-full bg-white/50">
                  <ParkingCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
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
        {/* Recent Activity */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Hoạt động gần đây</h2>
          <div className="rounded-3xl border border-border">
            <div className="p-8 text-center text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Chưa có hoạt động</p>
              <p className="text-sm mt-1">Dữ liệu sẽ hiển thị khi có xe vào/ra</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Thao tác nhanh</h2>
          <div className="rounded-3xl border border-border divide-y divide-border">
            {[
              { label: 'Thêm cư dân mới', icon: Users, color: 'text-emerald-500' },
              { label: 'Đăng ký phương tiện', icon: Car, color: 'text-blue-500' },
              { label: 'Tạo hợp đồng', icon: FileText, color: 'text-orange-500' },
              { label: 'Ghi nhận xe vào', icon: ParkingCircle, color: 'text-violet-500' },
            ].map((action) => (
              <div key={action.label} className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <span className="font-medium text-foreground">{action.label}</span>
                </div>
                <button className="inline-flex items-center rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
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