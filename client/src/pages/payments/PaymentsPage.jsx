import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Plus,
  Search,
  Check,
  Trash2,
  Loader2,
  Calendar,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import paymentService from "../../services/paymentService";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";

const statusMap = {
  pending: { label: "Chờ TT", class: "bg-amber-500/10 text-amber-600" },
  paid: { label: "Đã TT", class: "bg-emerald-500/10 text-emerald-600" },
  overdue: { label: "Quá hạn", class: "bg-red-500/10 text-red-500" },
};
const PaymentsPage = () => {
  const [checkingOut, setCheckingOut] = useState(null);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 20,
  });

  // Filters
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Modals
  const [generateModal, setGenerateModal] = useState(false);
  const [genMonth, setGenMonth] = useState(now.getMonth() + 1);
  const [genYear, setGenYear] = useState(now.getFullYear());
  const [generating, setGenerating] = useState(false);

  const [payModal, setPayModal] = useState(null); // payment object
  const [payMethod, setPayMethod] = useState("cash");
  const [paying, setPaying] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (month) params.month = month;
      if (year) params.year = year;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const { data } = await paymentService.getAll(params);
      setPayments(data.data);
      setStats(data.stats || {});
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, month, year, statusFilter, search]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Kiểm tra kết quả từ PayOS redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      const orderCode = params.get("orderCode");
      if (orderCode) {
        // Gọi API check để cập nhật DB (backup cho webhook)
        paymentService.checkPayment(orderCode).catch(() => {});
      }
      toast.success("Thanh toán thành công!");
      window.history.replaceState({}, "", "/payments");
    }
    if (params.get("cancelled") === "true") {
      toast.error("Đã hủy thanh toán");
      window.history.replaceState({}, "", "/payments");
    }
  }, []);
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Tạo hóa đơn
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await paymentService.generate({
        month: genMonth,
        year: genYear,
      });
      toast.success(data.message);
      setGenerateModal(false);
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo thất bại");
    } finally {
      setGenerating(false);
    }
  };
  // PayOS Checkout
  const handlePayOS = async (payment) => {
    setCheckingOut(payment._id);
    try {
      const { data } = await paymentService.createPaymentLink(payment._id);
      window.location.href = data.data.checkoutUrl;
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi tạo link thanh toán");
      setCheckingOut(null);
    }
  };

  // Thanh toán
  const handlePay = async () => {
    if (!payModal) return;
    setPaying(true);
    try {
      await paymentService.markAsPaid(payModal._id, {
        paymentMethod: payMethod,
      });
      toast.success("Đã ghi nhận thanh toán");
      setPayModal(null);
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi");
    } finally {
      setPaying(false);
    }
  };

  // Xóa
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await paymentService.delete(deleteConfirm._id);
      toast.success("Đã xóa hóa đơn");
      setDeleteConfirm(null);
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const formatMoney = (val) => Number(val).toLocaleString("vi-VN") + "đ";

  const columns = [
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
      key: "contract",
      label: "Mã HĐ",
      render: (val) =>
        val ? (
          <span className="font-mono text-sm">{val.contractCode}</span>
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
      key: "amount",
      label: "Số tiền",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">
            {formatMoney(val)}
          </span>
          {row.dueDate && (
            <span className="text-[11px] text-muted-foreground">
              Hạn: {new Date(row.dueDate).toLocaleDateString('vi-VN')}
            </span>
          )}
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
      key: "paymentMethod",
      label: "Phương thức",
      render: (val) => {
        if (!val) return "—";
        const methods = {
          cash: "Tiền mặt",
          transfer: "Chuyển khoản",
          card: "Thẻ",
        };
        return <span className="text-sm">{methods[val] || val}</span>;
      },
    },
    {
      key: "_id",
      label: "",
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status === "pending" && (
            <>
              <button
                onClick={() => handlePayOS(row)}
                disabled={checkingOut === row._id}
                title="Thanh toán online (PayOS)"
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-violet-500/10 hover:text-violet-600"
              >
                {checkingOut === row._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => {
                  setPayModal(row);
                  setPayMethod("cash");
                }}
                title="Thanh toán thủ công"
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-600"
              >
                <Check className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setDeleteConfirm(row)}
            title="Xóa"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Stats summary
  const totalPending = stats.pending?.totalAmount || 0;
  const totalPaid = stats.paid?.totalAmount || 0;
  const countPending = stats.pending?.count || 0;
  const countPaid = stats.paid?.count || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-500/10">
            <CreditCard className="h-5 w-5 text-pink-500" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Thanh toán</h1>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {pagination.total}
          </span>
        </div>
        <button
          onClick={() => setGenerateModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tạo hóa đơn
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Chờ thanh toán</p>
          <p className="text-2xl font-bold text-amber-600">{countPending}</p>
          <p className="text-xs text-muted-foreground">
            {formatMoney(totalPending)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Đã thanh toán</p>
          <p className="text-2xl font-bold text-emerald-600">{countPaid}</p>
          <p className="text-xs text-muted-foreground">
            {formatMoney(totalPaid)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Tổng thu</p>
          <p className="text-2xl font-bold text-foreground">
            {formatMoney(totalPaid)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Còn thiếu</p>
          <p className="text-2xl font-bold text-red-500">
            {formatMoney(totalPending)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên cư dân..."
            className="w-full rounded-2xl border border-border bg-muted py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <select
          value={month}
          onChange={(e) => {
            setMonth(Number(e.target.value));
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Tháng {i + 1}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => {
            setYear(Number(e.target.value));
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
        >
          {[2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
        >
          <option value="">Tất cả</option>
          <option value="pending">Chờ TT</option>
          <option value="paid">Đã TT</option>
          <option value="overdue">Quá hạn</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        emptyMessage="Chưa có hóa đơn"
        emptyIcon={CreditCard}
      />

      {pagination.pages > 1 && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />
      )}

      {/* Generate Modal */}
      {generateModal && (
        <Modal
          isOpen={generateModal}
          onClose={() => setGenerateModal(false)}
          title="Tạo hóa đơn hàng tháng"
          footer={
            <>
              <button
                onClick={() => setGenerateModal(false)}
                className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Hủy
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
                Tạo hóa đơn
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="rounded-2xl bg-blue-500/10 px-4 py-3 text-sm text-blue-600">
              💡 Hệ thống sẽ tạo hóa đơn cho tất cả hợp đồng đang active. Hóa
              đơn đã tồn tại sẽ được bỏ qua.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Tháng
                </label>
                <select
                  value={genMonth}
                  onChange={(e) => setGenMonth(Number(e.target.value))}
                  className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Tháng {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Năm
                </label>
                <select
                  value={genYear}
                  onChange={(e) => setGenYear(Number(e.target.value))}
                  className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  {[2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Pay Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative mx-4 w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Xác nhận thanh toán
            </h3>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-muted-foreground">
                Cư dân:{" "}
                <strong className="text-foreground">
                  {payModal.resident?.fullName}
                </strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Số tiền:{" "}
                <strong className="text-foreground">
                  {formatMoney(payModal.amount)}
                </strong>
              </p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Phương thức
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="transfer">Chuyển khoản</option>
                  <option value="card">Thẻ</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPayModal(null)}
                className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Hủy
              </button>
              <button
                onClick={handlePay}
                disabled={paying}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {paying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative mx-4 w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Xóa hóa đơn
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Xóa hóa đơn của{" "}
              <strong>{deleteConfirm.resident?.fullName}</strong> —{" "}
              {formatMoney(deleteConfirm.amount)}?
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

export default PaymentsPage;
