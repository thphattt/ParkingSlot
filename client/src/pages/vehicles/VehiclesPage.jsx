import { useState, useEffect, useCallback } from "react";
import { Car, Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import vehicleService from "../../services/vehicleService";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
import VehicleFormModal from "./VehicleFormModal";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;

      const { data } = await vehicleService.getAll(params);
      setVehicles(data.data);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error("Lỗi tải phương tiện:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, typeFilter]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
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
      await vehicleService.delete(deleteConfirm._id);
      setDeleteConfirm(null);
      fetchVehicles();
    } catch (error) {
      alert(error.response?.data?.message || "Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditVehicle(null);
    fetchVehicles();
  };

  const columns = [
    {
      key: "licensePlate",
      label: "Biển số",
      render: (val) => (
        <span className="font-mono font-semibold text-foreground">{val}</span>
      ),
    },
    {
      key: "type",
      label: "Loại",
      render: (val) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            val === "car"
              ? "bg-blue-500/10 text-blue-600"
              : "bg-orange-500/10 text-orange-600"
          }`}
        >
          {val === "car" ? "Ô tô" : "Xe máy"}
        </span>
      ),
    },
    {
      key: "brand",
      label: "Hãng / Dòng",
      render: (val, row) => (
        <span className="text-foreground">
          {[val, row.model].filter(Boolean).join(" ") || "—"}
        </span>
      ),
    },
    { key: "color", label: "Màu", render: (val) => val || "—" },
    {
      key: "owner",
      label: "Chủ xe",
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
      key: "_id",
      label: "",
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setEditVehicle(row);
              setModalOpen(true);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteConfirm(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header + Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10">
              <Car className="h-5 w-5 text-blue-500" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Phương tiện
            </h1>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {pagination.total}
            </span>
          </div>
          <button
            onClick={() => {
              setEditVehicle(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Thêm phương tiện
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo biển số, hãng xe..."
              className="w-full rounded-2xl border border-border bg-muted py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          >
            <option value="">Tất cả</option>
            <option value="car">Ô tô</option>
            <option value="motorbike">Xe máy</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={vehicles}
        loading={loading}
        emptyMessage="Chưa có phương tiện nào"
        emptyIcon={Car}
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

      {/* Form Modal */}
      <VehicleFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditVehicle(null);
        }}
        vehicle={editVehicle}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Xóa phương tiện{" "}
              <strong className="font-mono">
                {deleteConfirm.licensePlate}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Hủy
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

export default VehiclesPage;
