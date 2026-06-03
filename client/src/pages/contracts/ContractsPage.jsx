import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Search,
  Eye,
  XCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import contractService from "../../services/contractService";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
import ContractFormModal from "./ContractFormModal";

const statusMap = {
  active: {
    label: "Đang hoạt động",
    class: "bg-emerald-500/10 text-emerald-600",
  },
  expired: { label: "Hết hạn", class: "bg-amber-500/10 text-amber-600" },
  cancelled: { label: "Đã hủy", class: "bg-red-500/10 text-red-500" },
};

const ContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const { data } = await contractService.getAll(params);
      setContracts(data.data);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error("Lỗi tải hợp đồng:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCancel = async () => {
    if (!cancelConfirm) return;
    setCancelling(true);
    try {
      await contractService.cancel(cancelConfirm._id);
      toast.success("Đã hủy hợp đồng");
      setCancelConfirm(null);
      fetchContracts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Hủy thất bại");
    } finally {
      setCancelling(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await contractService.delete(deleteConfirm._id);
      toast.success("Đã xóa hợp đồng");
      setDeleteConfirm(null);
      fetchContracts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const columns = [
    {
      key: "contractCode",
      label: "Mã HĐ",
      render: (val) => (
        <span className="font-mono font-semibold text-foreground">{val}</span>
      ),
    },
    {
      key: "resident",
      label: "Cư dân",
      render: (val) =>
        val ? (
          <div>
            <p className="font-medium text-foreground">{val.fullName}</p>
            <p className="text-xs text-muted-foreground">
              {val.building}-{val.apartment}
            </p>
          </div>
        ) : (
          "—"
        ),
    },
    {
      key: "vehicle",
      label: "Phương tiện",
      render: (val) =>
        val ? (
          <div>
            <p className="font-mono text-foreground">{val.licensePlate}</p>
            <p className="text-xs text-muted-foreground">
              {val.type === "car" ? "Ô tô" : "Xe máy"}
            </p>
          </div>
        ) : (
          "—"
        ),
    },
    {
      key: "slot",
      label: "Ô đỗ",
      render: (val) =>
        val ? (
          <span className="inline-flex items-center rounded-xl bg-muted px-2.5 py-1 text-xs font-semibold">
            {val.slotCode}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "startDate",
      label: "Thời hạn",
      render: (val, row) => (
        <div className="text-sm">
          <p className="text-foreground">{formatDate(val)}</p>
          <p className="text-xs text-muted-foreground">
            → {formatDate(row.endDate)}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (val) => {
        const s = statusMap[val] || {
          label: val,
          class: "bg-muted text-muted-foreground",
        };
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${s.class}`}
          >
            {s.label}
          </span>
        );
      },
    },
    {
      key: "_id",
      label: "",
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status === "active" && (
            <button
              onClick={() => setCancelConfirm(row)}
              title="Hủy hợp đồng"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-600"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
          {row.status !== "active" && (
            <button
              onClick={() => setDeleteConfirm(row)}
              title="Xóa"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10">
            <FileText className="h-5 w-5 text-cyan-500" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Hợp đồng</h1>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {pagination.total}
          </span>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tạo hợp đồng
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo mã hợp đồng..."
            className="w-full rounded-2xl border border-border bg-muted py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
        >
          <option value="">Tất cả</option>
          <option value="active">Đang HĐ</option>
          <option value="expired">Hết hạn</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={contracts}
        loading={loading}
        emptyMessage="Chưa có hợp đồng nào"
        emptyIcon={FileText}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />
      )}

      {/* Create Modal */}
      <ContractFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          fetchContracts();
        }}
      />

      {/* Cancel Confirm */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Hủy hợp đồng
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Hủy hợp đồng{" "}
              <strong className="font-mono">
                {cancelConfirm.contractCode}
              </strong>
              ?
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Ô đỗ sẽ trở về trạng thái trống.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelConfirm(null)}
                className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Đóng
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                Hủy HĐ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Xóa hợp đồng
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Xóa hợp đồng{" "}
              <strong className="font-mono">
                {deleteConfirm.contractCode}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Đóng
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
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

export default ContractsPage;
