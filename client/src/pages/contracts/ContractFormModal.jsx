import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import contractService from "../../services/contractService";
import residentService from "../../services/residentService";
import vehicleService from "../../services/vehicleService";
import parkingSlotService from "../../services/parkingSlotService";

const ContractFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    resident: "",
    vehicle: "",
    slot: "",
    startDate: "",
    endDate: "",
    deposit: "",
    note: "",
  });

  const [residents, setResidents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load cư dân
  useEffect(() => {
    if (isOpen) {
      residentService
        .getAll({ limit: 100, status: "active" })
        .then(({ data }) => setResidents(data.data))
        .catch(() => {});
      setForm({
        resident: "",
        vehicle: "",
        slot: "",
        startDate: "",
        endDate: "",
        deposit: "",
        note: "",
      });
      setVehicles([]);
      setSlots([]);
      setError("");
    }
  }, [isOpen]);

  // Khi chọn cư dân → load xe của cư dân đó
  useEffect(() => {
    if (form.resident) {
      vehicleService
        .getAll({ owner: form.resident, limit: 100 })
        .then(({ data }) => setVehicles(data.data))
        .catch(() => {});
      setForm((prev) => ({ ...prev, vehicle: "" }));
    } else {
      setVehicles([]);
    }
  }, [form.resident]);

  // Khi chọn loại xe → load ô đỗ cùng loại + trống
  useEffect(() => {
    if (form.vehicle) {
      const selectedVehicle = vehicles.find((v) => v._id === form.vehicle);
      if (selectedVehicle) {
        parkingSlotService
          .getAll({
            type: selectedVehicle.type,
            status: "available",
            limit: 100,
          })
          .then(({ data }) => setSlots(data.data))
          .catch(() => {});
      }
      setForm((prev) => ({ ...prev, slot: "" }));
    } else {
      setSlots([]);
    }
  }, [form.vehicle, vehicles]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const cleanData = {};
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== null) cleanData[key] = value;
    });
    if (cleanData.deposit) cleanData.deposit = Number(cleanData.deposit);

    try {
      await contractService.create(cleanData);
      toast.success("Tạo hợp đồng thành công!");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
      toast.error("Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  };

  // Tìm giá ô đỗ đã chọn để hiển thị
  const selectedSlot = slots.find((s) => s._id === form.slot);

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
        form="contract-form"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Tạo hợp đồng
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo hợp đồng mới"
      footer={footer}
      size="lg"
    >
      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <form
        id="contract-form"
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* Bước 1: Chọn cư dân */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Bước 1: Chọn cư dân *
          </label>
          <select
            name="resident"
            value={form.resident}
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

        {/* Bước 2: Chọn xe (phụ thuộc cư dân) */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Bước 2: Chọn phương tiện *
          </label>
          <select
            name="vehicle"
            value={form.vehicle}
            onChange={handleChange}
            required
            disabled={!form.resident}
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
          >
            <option value="">
              {!form.resident
                ? "— Chọn cư dân trước —"
                : vehicles.length === 0
                  ? "— Không có xe —"
                  : "— Chọn xe —"}
            </option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.licensePlate} — {v.type === "car" ? "Ô tô" : "Xe máy"} —{" "}
                {v.brand} {v.model}
              </option>
            ))}
          </select>
        </div>

        {/* Bước 3: Chọn ô đỗ (phụ thuộc loại xe) */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Bước 3: Chọn ô đỗ *
          </label>
          <select
            name="slot"
            value={form.slot}
            onChange={handleChange}
            required
            disabled={!form.vehicle}
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
          >
            <option value="">
              {!form.vehicle
                ? "— Chọn xe trước —"
                : slots.length === 0
                  ? "— Không có ô trống —"
                  : "— Chọn ô đỗ —"}
            </option>
            {slots.map((s) => (
              <option key={s._id} value={s._id}>
                {s.slotCode} — Tầng {s.floor} Khu {s.zone} —{" "}
                {Number(s.monthlyPrice).toLocaleString("vi-VN")}đ/tháng
              </option>
            ))}
          </select>
        </div>

        {/* Ngày bắt đầu */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Ngày bắt đầu *
          </label>
          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Ngày kết thúc */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Ngày kết thúc *
          </label>
          <input
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Tiền cọc */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Tiền cọc (VNĐ)
          </label>
          <input
            name="deposit"
            type="number"
            value={form.deposit}
            onChange={handleChange}
            placeholder="0"
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Giá thuê — tự lấy từ ô đỗ */}
        {selectedSlot && (
          <div className="flex items-center">
            <div className="rounded-2xl bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-600">
              Giá thuê:{" "}
              {Number(selectedSlot.monthlyPrice).toLocaleString("vi-VN")}đ/tháng
            </div>
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

export default ContractFormModal;
