import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import residentService from '../../services/residentService';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import ResidentFormModal from './ResidentFormModal';
import toast from 'react-hot-toast';

const ResidentsPage = () => {
  // State
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editResident, setEditResident] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // Fetch residents
  const fetchResidents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await residentService.getAll(params);
      setResidents(data.data);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Lỗi tải danh sách cư dân:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]);
  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);
  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);
  // Handlers
  const handleCreate = () => {
    setEditResident(null);
    setModalOpen(true);
  };
  const handleEdit = (resident) => {
    setEditResident(resident);
    setModalOpen(true);
  };
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await residentService.delete(deleteConfirm._id);
      toast.success('Đã xóa cư dân')
      setDeleteConfirm(null);
      fetchResidents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };
  const handleSuccess = () => {
    setModalOpen(false);
    setEditResident(null);
    fetchResidents();
  };
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };
  // Table columns
  const columns = [
    {
      key: 'fullName',
      label: 'Họ tên',
      render: (val, row) => (
        <div>
          <p className="font-medium text-foreground">{val}</p>
          <p className="text-xs text-muted-foreground">{row.email || '—'}</p>
        </div>
      ),
    },
    { key: 'phone', label: 'Số điện thoại' },
    { key: 'idCard', label: 'CCCD/CMND' },
    {
      key: 'apartment',
      label: 'Căn hộ',
      render: (val, row) => (
        <span className="inline-flex items-center rounded-xl bg-muted px-2.5 py-1 text-xs font-semibold">
          {row.building}-{val}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (val) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            val === 'active'
              ? 'bg-emerald-500/10 text-emerald-600'
              : 'bg-red-500/10 text-red-500'
          }`}
        >
          {val === 'active' ? 'Hoạt động' : 'Ngưng'}
        </span>
      ),
    },
    {
      key: '_id',
      label: '',
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleEdit(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Chỉnh sửa"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteConfirm(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-8">
      {/* Page Header + Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Row 1: Title + Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Cư dân</h1>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {pagination.total}
            </span>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Thêm cư dân
          </button>
        </div>
        {/* Row 2: Search + Filter — cùng 1 hàng */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên, SĐT, căn hộ, CCCD..."
              className="w-full rounded-2xl border border-border bg-muted py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="py-2.5 rounded-2xl border border-border bg-muted px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          >
            <option value="">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngưng</option>
          </select>
        </div>
      </div>
      {/* Table */}
      <DataTable
        columns={columns}
        data={residents}
        loading={loading}
        emptyMessage="Chưa có cư dân nào"
        emptyIcon={Users}
      />
      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          onPageChange={handlePageChange}
        />
      )}
      {/* Form Modal */}
      <ResidentFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditResident(null);
        }}
        resident={editResident}
        onSuccess={handleSuccess}
      />
      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative mx-4 w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Bạn có chắc muốn xóa cư dân <strong>{deleteConfirm.fullName}</strong>?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
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
export default ResidentsPage;