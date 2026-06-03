import { useState, useEffect, useCallback } from 'react';
import { ParkingCircle, Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import parkingSlotService from '../../services/parkingSlotService';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import ParkingSlotFormModal from './ParkingSlotFormModal';

const statusMap = {
  available: { label: 'Trống', class: 'bg-emerald-500/10 text-emerald-600' },
  occupied: { label: 'Đang đỗ', class: 'bg-blue-500/10 text-blue-600' },
  reserved: { label: 'Đã đặt', class: 'bg-amber-500/10 text-amber-600' },
  maintenance: { label: 'Bảo trì', class: 'bg-red-500/10 text-red-500' },
};

const ParkingSlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;

      const { data } = await parkingSlotService.getAll(params);
      setSlots(data.data);
      setStats(data.stats || {});
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Lỗi tải ô đỗ:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, typeFilter, statusFilter]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await parkingSlotService.delete(deleteConfirm._id);
      toast.success('Đã xóa ô đỗ');
      setDeleteConfirm(null);
      fetchSlots();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditSlot(null);
    fetchSlots();
  };

  const columns = [
    {
      key: 'slotCode',
      label: 'Mã ô đỗ',
      render: (val) => <span className="font-mono font-semibold text-foreground">{val}</span>,
    },
    { key: 'floor', label: 'Tầng' },
    { key: 'zone', label: 'Khu' },
    {
      key: 'type',
      label: 'Loại',
      render: (val) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
          val === 'car' ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'
        }`}>
          {val === 'car' ? 'Ô tô' : 'Xe máy'}
        </span>
      ),
    },
    {
      key: 'monthlyPrice',
      label: 'Giá/tháng',
      render: (val) => (
        <span className="text-foreground">
          {Number(val).toLocaleString('vi-VN')}đ
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (val) => {
        const s = statusMap[val] || { label: val, class: 'bg-muted text-muted-foreground' };
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${s.class}`}>
            {s.label}
          </span>
        );
      },
    },
    {
      key: '_id',
      label: '',
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setEditSlot(row); setModalOpen(true); }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteConfirm(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Stats cards data
  const statCards = [
    { key: 'available', label: 'Trống', color: 'emerald' },
    { key: 'reserved', label: 'Đã đặt', color: 'amber' },
    { key: 'occupied', label: 'Đang đỗ', color: 'blue' },
    { key: 'maintenance', label: 'Bảo trì', color: 'red' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10">
            <ParkingCircle className="h-5 w-5 text-violet-500" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Bãi đỗ xe</h1>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {pagination.total}
          </span>
        </div>
        <button onClick={() => { setEditSlot(null); setModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Thêm ô đỗ
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.key}
            className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold text-${s.color}-500`}>
              {stats[s.key] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo mã ô đỗ..."
            className="w-full rounded-2xl border border-border bg-muted py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
          className="rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
          <option value="">Tất cả loại</option>
          <option value="car">Ô tô</option>
          <option value="motorbike">Xe máy</option>
        </select>
        <select value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
          className="rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
          <option value="">Tất cả TT</option>
          <option value="available">Trống</option>
          <option value="occupied">Đang đỗ</option>
          <option value="reserved">Đã đặt</option>
          <option value="maintenance">Bảo trì</option>
        </select>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={slots} loading={loading}
        emptyMessage="Chưa có ô đỗ nào" emptyIcon={ParkingCircle} />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination page={pagination.page} pages={pagination.pages}
          total={pagination.total} onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))} />
      )}

      {/* Form Modal */}
      <ParkingSlotFormModal isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditSlot(null); }}
        slot={editSlot} onSuccess={handleSuccess} />

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Xóa ô đỗ <strong className="font-mono">{deleteConfirm.slotCode}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
                Hủy
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50">
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingSlotsPage;