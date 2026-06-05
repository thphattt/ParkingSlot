import { useState, useEffect } from 'react';
import { Settings, User, Lock, Users, Eye, EyeOff, Save, Loader2, Plus, RefreshCw, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';
import settingsService from '../../services/settingsService';
import useAuthStore from '../../stores/authStore';

const roleMap = {
  admin: { label: 'Quản trị viên', class: 'bg-violet-500/10 text-violet-600' },
  security: { label: 'Bảo vệ', class: 'bg-blue-500/10 text-blue-600' },
  resident: { label: 'Cư dân', class: 'bg-slate-500/10 text-slate-500' },
};

export default function SettingsPage() {
  const authUser = useAuthStore((state) => state.user);
  const isAdmin = authUser?.role === 'admin';
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Hồ sơ', icon: User },
    { id: 'password', label: 'Mật khẩu', icon: Lock },
    ...(isAdmin ? [{ id: 'users', label: 'Nhân viên', icon: Users }] : []),
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10">
          <Settings className="h-5 w-5 text-violet-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cài đặt</h1>
          <p className="text-sm text-muted-foreground">Quản lý tài khoản và hệ thống</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-2xl bg-muted p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="max-w-2xl">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'password' && <PasswordTab />}
        {activeTab === 'users' && isAdmin && <UsersTab />}
      </div>
    </div>
  );
}

// ── Tab Hồ sơ ────────────────────────────────────────
function ProfileTab() {
  const [form, setForm] = useState({ fullName: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService.getProfile().then(({ data }) => {
      setForm({
        fullName: data.data.fullName || '',
        phone: data.data.phone || '',
        email: data.data.email || '',
      });
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateProfile({ fullName: form.fullName, phone: form.phone });
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-8 space-y-6">
      <h2 className="font-semibold text-foreground text-lg">Thông tin cá nhân</h2>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Họ tên</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Email <span className="text-xs italic">(không thể thay đổi)</span></label>
          <input
            disabled
            value={form.email}
            className="w-full rounded-2xl border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Số điện thoại</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0901234567"
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
}

// ── Tab Đổi mật khẩu ─────────────────────────────────
function PasswordTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);

  const notMatch = form.confirmPassword && form.newPassword !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (notMatch) return toast.error('Mật khẩu xác nhận không khớp!');
    setSaving(true);
    try {
      await settingsService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi đổi mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-8 space-y-6">
      <h2 className="font-semibold text-foreground text-lg">Đổi mật khẩu</h2>
      <div className="space-y-4">
        {/* Mật khẩu hiện tại */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Mật khẩu hiện tại</label>
          <div className="relative">
            <input
              required
              type={show.current ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-border px-4 py-2.5 pr-11 text-sm text-foreground bg-muted focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <button type="button" onClick={() => setShow({ ...show, current: !show.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mật khẩu mới */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Mật khẩu mới</label>
          <div className="relative">
            <input
              required
              type={show.new ? 'text' : 'password'}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full rounded-2xl border border-border px-4 py-2.5 pr-11 text-sm text-foreground bg-muted focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <button type="button" onClick={() => setShow({ ...show, new: !show.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu mới */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Xác nhận mật khẩu mới</label>
          <div className="relative">
            <input
              required
              type={show.confirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Nhập lại mật khẩu mới"
              className={`w-full rounded-2xl border px-4 py-2.5 pr-11 text-sm text-foreground bg-muted focus:outline-none focus:ring-2 focus:ring-ring/20 ${
                notMatch ? 'border-red-500' : 'border-border'
              }`}
            />
            <button type="button" onClick={() => setShow({ ...show, confirm: !show.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {notMatch && <p className="mt-1 text-xs text-red-500">Mật khẩu không khớp</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving || notMatch} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Đổi mật khẩu
        </button>
      </div>
    </form>
  );
}

// ── Tab Nhân viên (Admin) ─────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '', role: 'security' });
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await settingsService.getUsers({ limit: 50 });
      setUsers(data.data);
    } catch { toast.error('Lỗi tải danh sách'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await settingsService.createUser(form);
      toast.success('Tạo tài khoản thành công!');
      setShowCreate(false);
      setForm({ email: '', password: '', fullName: '', phone: '', role: 'security' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi tạo tài khoản');
    } finally { setCreating(false); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await settingsService.toggleUserStatus(id);
      toast.success(data.message);
      fetchUsers();
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleReset = async (id, name) => {
    if (!window.confirm(`Reset mật khẩu của ${name} về "123456"?`)) return;
    try {
      const { data } = await settingsService.resetPassword(id);
      toast.success(data.message);
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa tài khoản này? Không thể hoàn tác!')) return;
    try {
      await settingsService.deleteUser(id);
      toast.success('Đã xóa tài khoản');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Xóa thất bại'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground text-lg">Quản lý nhân viên</h2>
        <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Thêm tài khoản
        </button>
      </div>

      {/* Form tạo mới */}
      {showCreate && (
        <form onSubmit={handleCreate} className="rounded-3xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-medium text-foreground">Tài khoản mới</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Họ tên *</label>
              <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Mật khẩu *</label>
              <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Tối thiểu 6 ký tự" className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Số điện thoại</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Vai trò *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="security">Bảo vệ</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-2xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Hủy</button>
            <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Tạo tài khoản
            </button>
          </div>
        </form>
      )}

      {/* Danh sách */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Nhân viên</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Vai trò</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Trạng thái</th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const role = roleMap[u.role] || roleMap.resident;
                return (
                  <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{u.fullName}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${role.class}`}>{role.label}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${u.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                        {u.isActive ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button title="Kích hoạt / Vô hiệu hóa" onClick={() => handleToggle(u._id)} className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground">
                          {u.isActive ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                        </button>
                        <button title="Reset mật khẩu về 123456" onClick={() => handleReset(u._id, u.fullName)} className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500">
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button title="Xóa tài khoản" onClick={() => handleDelete(u._id)} className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}