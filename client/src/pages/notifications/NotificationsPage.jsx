import { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, Search, Plus, Trash2, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";
import notificationService from "../../services/notificationService";
import residentService from "../../services/residentService";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";

const typeMap = {
  system: { label: "Hệ thống", class: "bg-slate-500/10 text-slate-600" },
  payment: { label: "Nhắc nợ", class: "bg-red-500/10 text-red-600" },
  maintenance: { label: "Bảo trì", class: "bg-amber-500/10 text-amber-600" },
  general: { label: "Chung", class: "bg-blue-500/10 text-blue-600" },
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [typeFilter, setTypeFilter] = useState("");

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [residents, setResidents] = useState([]); // List for dropdown

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general",
    recipient: "",
  });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (typeFilter) params.type = typeFilter;

      const { data } = await notificationService.getAll(params);
      setNotifications(data.data);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (error) {
      toast.error("Lỗi tải thông báo");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, typeFilter]);

  // Lấy danh sách cư dân để đổ vào dropdown
  const fetchResidents = async () => {
    try {
      const { data } = await residentService.getAll({ limit: 1000 });
      setResidents(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchResidents();
  }, [fetchNotifications]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await notificationService.create(formData);
      toast.success("Tạo thông báo thành công!");
      setCreateModal(false);
      setFormData({ title: "", content: "", type: "general", recipient: "" });
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi tạo thông báo");
    } finally {
      setCreating(false);
    }
  };

  const handleAutoRemind = async () => {
    if (!window.confirm("Hệ thống sẽ gửi Email nhắc nợ đến TẤT CẢ hóa đơn quá hạn. Tiếp tục?")) return;
    setReminding(true);
    try {
      const { data } = await notificationService.autoRemind();
      toast.success(data.message);
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi nhắc nợ tự động");
    } finally {
      setReminding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa thông báo này?")) return;
    try {
      await notificationService.delete(id);
      toast.success("Đã xóa");
      fetchNotifications();
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  };

  const columns = [
    {
      key: "title",
      label: "Tiêu đề",
      render: (val, row) => (
        <div>
          <p className="font-medium text-foreground">{val}</p>
          <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">{row.content}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Phân loại",
      render: (val) => {
        const s = typeMap[val] || typeMap.general;
        return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${s.class}`}>{s.label}</span>;
      },
    },
    {
      key: "recipient",
      label: "Người nhận",
      render: (val) => val ? <span className="text-sm font-medium">{val.fullName} - {val.apartment}</span> : <span className="text-sm italic text-muted-foreground">Tất cả cư dân</span>,
    },
    {
      key: "createdAt",
      label: "Ngày gửi",
      render: (val) => <span className="text-sm text-muted-foreground">{new Date(val).toLocaleString('vi-VN')}</span>,
    },
    {
      key: "_id",
      label: "",
      render: (val) => (
        <div className="flex items-center justify-end">
          <button onClick={() => handleDelete(val)} className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10">
            <Bell className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Thông báo</h1>
            <p className="text-sm text-muted-foreground">Nhật ký hệ thống & Chăm sóc cư dân</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleAutoRemind} disabled={reminding} className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/20 disabled:opacity-50">
            {reminding ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
            Auto Nhắc nợ
          </button>
          <button onClick={() => setCreateModal(true)} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Tạo thông báo
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPagination(prev => ({...prev, page: 1})) }} className="rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-ring/20">
          <option value="">Tất cả phân loại</option>
          <option value="system">Hệ thống</option>
          <option value="payment">Nhắc nợ</option>
          <option value="maintenance">Bảo trì</option>
          <option value="general">Thông báo chung</option>
        </select>
      </div>

      <DataTable columns={columns} data={notifications} loading={loading} emptyMessage="Chưa có thông báo nào" emptyIcon={Bell} />
      {pagination.pages > 1 && <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={(p) => setPagination(prev => ({...prev, page: p}))} />}

      {/* Modal Tạo */}
      {createModal && (
        <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Tạo thông báo mới">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Tiêu đề</label>
              <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm focus:ring-2" placeholder="VD: Lịch cúp điện ngày mai" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Người nhận (Bỏ trống = Gửi tất cả)</label>
              <select value={formData.recipient} onChange={(e) => setFormData({...formData, recipient: e.target.value})} className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm focus:ring-2">
                <option value="">-- Gửi tất cả cư dân --</option>
                {residents.map(r => (
                  <option key={r._id} value={r._id}>{r.fullName} ({r.apartment})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Phân loại</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm focus:ring-2">
                <option value="general">Thông báo chung</option>
                <option value="maintenance">Bảo trì</option>
                <option value="payment">Nhắc nợ</option>
                <option value="system">Hệ thống</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Nội dung</label>
              <textarea required rows="4" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm focus:ring-2"></textarea>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setCreateModal(false)} className="rounded-2xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Hủy</button>
              <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Gửi thông báo
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
export default NotificationsPage;