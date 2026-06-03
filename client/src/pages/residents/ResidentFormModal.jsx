import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import residentService from "../../services/residentService";
import toast from "react-hot-toast";

const ResidentFormModal = ({ isOpen, onClose, resident, onSuccess }) => {
  const isEdit = !!resident;

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    idCard: "",
    apartment: "",
    building: "A",
    status: "active",
    note: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Khi mở modal edit → điền dữ liệu cũ
  useEffect(() => {
    if (resident) {
      setForm({
        fullName: resident.fullName || "",
        phone: resident.phone || "",
        email: resident.email || "",
        idCard: resident.idCard || "",
        apartment: resident.apartment || "",
        building: resident.building || "A",
        status: resident.status || "active",
        note: resident.note || "",
      });
    } else {
      setForm({
        fullName: "",
        phone: "",
        email: "",
        idCard: "",
        apartment: "",
        building: "A",
        status: "active",
        note: "",
      });
    }
    setError("");
  }, [resident, isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isEdit) {
        await residentService.update(resident._id, form);
      } else {
        await residentService.create(form);
      }
      onSuccess();
      try {
        if (isEdit) {
          await residentService.update(resident._id, form);
          toast.success("Cập nhật cư dân thành công!");
        } else {
          await residentService.create(form);
          toast.success("Thêm cư dân thành công!");
        }
        onSuccess();
        onClose();
      } catch (err) {
        setError(err.response?.data?.message || "Có lỗi xảy ra");
        toast.error("Thao tác thất bại");
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
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
        form="resident-form"
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
      title={isEdit ? "Chỉnh sửa cư dân" : "Thêm cư dân mới"}
      footer={footer}
      size="lg"
    >
      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <form
        id="resident-form"
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* Họ tên — full width */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Họ tên *
          </label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* SĐT */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Số điện thoại *
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="0901234567"
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Email
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* CCCD */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            CCCD/CMND *
          </label>
          <input
            name="idCard"
            value={form.idCard}
            onChange={handleChange}
            required
            placeholder="012345678901"
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Căn hộ */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Căn hộ *
          </label>
          <input
            name="apartment"
            value={form.apartment}
            onChange={handleChange}
            required
            placeholder="1201"
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Tòa nhà */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Tòa nhà
          </label>
          <input
            name="building"
            value={form.building}
            onChange={handleChange}
            placeholder="A"
            className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Trạng thái — chỉ hiện khi edit */}
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

        {/* Ghi chú — full width */}
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

export default ResidentFormModal;
