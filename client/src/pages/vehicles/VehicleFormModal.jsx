import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import vehicleService from "../../services/vehicleService";
import residentService from "../../services/residentService";
import toast from "react-hot-toast";

const VehicleFormModal = ({ isOpen, onClose, vehicle, onSuccess }) => {
  const isEdit = !!vehicle;

  const [form, setForm] = useState({
    licensePlate: "",
    type: "car",
    brand: "",
    model: "",
    color: "",
    owner: "",
    status: "active",
    note: "",
  });
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load danh sách cư dân cho dropdown
  useEffect(() => {
    if (isOpen) {
      residentService
        .getAll({ limit: 100, status: "active" })
        .then(({ data }) => setResidents(data.data))
        .catch(() => {});
    }
  }, [isOpen]);

  // Điền form khi edit
  useEffect(() => {
    if (vehicle) {
      setForm({
        licensePlate: vehicle.licensePlate || "",
        type: vehicle.type || "car",
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        color: vehicle.color || "",
        owner: vehicle.owner?._id || vehicle.owner || "",
        status: vehicle.status || "active",
        note: vehicle.note || "",
      });
    } else {
      setForm({
        licensePlate: "",
        type: "car",
        brand: "",
        model: "",
        color: "",
        owner: "",
        status: "active",
        note: "",
      });
    }
    setError("");
  }, [vehicle, isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setError('');

  // Xóa field rỗng
  const cleanData = {};
  Object.entries(form).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      cleanData[key] = value;
    }
  });

  try {
    if (isEdit) {
      await vehicleService.update(vehicle._id, cleanData);
      toast.success('Cập nhật phương tiện thành công!');
    } else {
      await vehicleService.create(cleanData);
      toast.success('Thêm phương tiện thành công!');
    }
    onSuccess();
    onClose();
  } catch (err) {
    setError(err.response?.data?.message || 'Có lỗi xảy ra');
    toast.error('Thao tác thất bại');
  } finally {
    setSaving(false);
  }
};

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
      >
        Hủy
      </button>
      <button
        type="submit"
        form="vehicle-form"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isEdit ? "Cập nhật" : "Tạo mới"}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa phương tiện" : "Thêm phương tiện"}
      footer={footer}
      size="lg"
    >
      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <form
        id="vehicle-form"
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* Biển số */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Biển số xe *
          </label>
          <input
            name="licensePlate"
            value={form.licensePlate}
            onChange={handleChange}
            required
            placeholder="51F-12345"
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Loại xe */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Loại xe *
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          >
            <option value="car">Ô tô</option>
            <option value="motorbike">Xe máy</option>
          </select>
        </div>

        {/* Chủ xe — dropdown cư dân */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Chủ xe (cư dân) *
          </label>
          <select
            name="owner"
            value={form.owner}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          >
            <option value="">— Chọn cư dân —</option>
            {residents.map((r) => (
              <option key={r._id} value={r._id}>
                {r.fullName} — {r.building}-{r.apartment} — {r.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Hãng xe */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Hãng xe
          </label>
          <input
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="Toyota, Honda..."
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Dòng xe */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Dòng xe
          </label>
          <input
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="Camry, SH 150i..."
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Màu xe */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Màu xe
          </label>
          <input
            name="color"
            value={form.color}
            onChange={handleChange}
            placeholder="Trắng, Đen..."
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Trạng thái — chỉ khi edit */}
        {isEdit && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Trạng thái
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngưng</option>
            </select>
          </div>
        )}

        {/* Ghi chú */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Ghi chú
          </label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};

export default VehicleFormModal;
