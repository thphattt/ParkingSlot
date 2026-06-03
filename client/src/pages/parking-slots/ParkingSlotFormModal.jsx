import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import parkingSlotService from '../../services/parkingSlotService';

const ParkingSlotFormModal = ({ isOpen, onClose, slot, onSuccess }) => {
  const isEdit = !!slot;
  const [mode, setMode] = useState('single'); // 'single' hoặc 'bulk'

  const [form, setForm] = useState({
    slotCode: '', floor: '', zone: 'A', type: 'car',
    monthlyPrice: '', status: 'available', note: '',
  });

  const [bulkForm, setBulkForm] = useState({
    floor: '', zone: 'A', type: 'car',
    monthlyPrice: '', startNumber: '', endNumber: '',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slot) {
      setMode('single');
      setForm({
        slotCode: slot.slotCode || '',
        floor: slot.floor || '',
        zone: slot.zone || 'A',
        type: slot.type || 'car',
        monthlyPrice: slot.monthlyPrice || '',
        status: slot.status || 'available',
        note: slot.note || '',
      });
    } else {
      setForm({
        slotCode: '', floor: '', zone: 'A', type: 'car',
        monthlyPrice: '', status: 'available', note: '',
      });
      setBulkForm({
        floor: '', zone: 'A', type: 'car',
        monthlyPrice: '', startNumber: '', endNumber: '',
      });
    }
    setError('');
  }, [slot, isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleBulkChange = (e) => {
    setBulkForm({ ...bulkForm, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEdit) {
        const cleanData = {};
        Object.entries(form).forEach(([key, value]) => {
          if (value !== '' && value !== null) cleanData[key] = value;
        });
        await parkingSlotService.update(slot._id, cleanData);
        toast.success('Cập nhật ô đỗ thành công!');
      } else if (mode === 'bulk') {
        await parkingSlotService.createBulk({
          ...bulkForm,
          monthlyPrice: Number(bulkForm.monthlyPrice),
          startNumber: Number(bulkForm.startNumber),
          endNumber: Number(bulkForm.endNumber),
        });
        toast.success('Tạo hàng loạt ô đỗ thành công!');
      } else {
        const cleanData = {};
        Object.entries(form).forEach(([key, value]) => {
          if (value !== '' && value !== null) cleanData[key] = value;
        });
        cleanData.monthlyPrice = Number(cleanData.monthlyPrice);
        await parkingSlotService.create(cleanData);
        toast.success('Thêm ô đỗ thành công!');
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
      <button type="button" onClick={onClose}
        className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
        Hủy
      </button>
      <button type="submit" form="slot-form" disabled={saving}
        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {isEdit ? 'Cập nhật' : mode === 'bulk' ? 'Tạo hàng loạt' : 'Tạo mới'}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={isEdit ? 'Chỉnh sửa ô đỗ' : 'Thêm ô đỗ xe'} footer={footer} size="lg">

      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Toggle Single/Bulk — chỉ hiện khi tạo mới */}
      {!isEdit && (
        <div className="mb-4 flex rounded-2xl bg-muted p-1">
          <button type="button"
            onClick={() => setMode('single')}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'single' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}>
            Tạo đơn lẻ
          </button>
          <button type="button"
            onClick={() => setMode('bulk')}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'bulk' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}>
            Tạo hàng loạt
          </button>
        </div>
      )}

      <form id="slot-form" onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        {/* === SINGLE MODE hoặc EDIT === */}
        {(mode === 'single' || isEdit) && (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Mã ô đỗ *</label>
              <input name="slotCode" value={form.slotCode} onChange={handleChange} required
                placeholder="B1-A01"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Tầng *</label>
              <input name="floor" value={form.floor} onChange={handleChange} required placeholder="B1"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Khu</label>
              <input name="zone" onChange={handleChange} placeholder="A(Ô tô), M(Xe máy)"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Loại ô đỗ *</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="car">Ô tô</option>
                <option value="motorbike">Xe máy</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Giá thuê/tháng (VNĐ) *</label>
              <input name="monthlyPrice" type="number" value={form.monthlyPrice} onChange={handleChange}
                required placeholder="1500000"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            {isEdit && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Trạng thái</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
                  <option value="available">Trống</option>
                  <option value="occupied">Đang đỗ</option>
                  <option value="reserved">Đã đặt</option>
                  <option value="maintenance">Bảo trì</option>
                </select>
              </div>
            )}
          </>
        )}

        {/* === BULK MODE === */}
        {mode === 'bulk' && !isEdit && (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Tầng *</label>
              <input name="floor" value={bulkForm.floor} onChange={handleBulkChange} required
                placeholder="B1"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Khu</label>
              <input name="zone" onChange={handleBulkChange} placeholder="A(Ô tô), M(Xe máy)"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Loại ô đỗ *</label>
              <select name="type" value={bulkForm.type} onChange={handleBulkChange}
                className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="car">Ô tô</option>
                <option value="motorbike">Xe máy</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Giá thuê/tháng (VNĐ) *</label>
              <input name="monthlyPrice" type="number" value={bulkForm.monthlyPrice}
                onChange={handleBulkChange} required placeholder="1500000"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Số bắt đầu *</label>
              <input name="startNumber" type="number" value={bulkForm.startNumber}
                onChange={handleBulkChange} required placeholder="1"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Số kết thúc *</label>
              <input name="endNumber" type="number" value={bulkForm.endNumber}
                onChange={handleBulkChange} required placeholder="20"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="md:col-span-2 rounded-2xl bg-blue-500/10 px-4 py-3 text-sm text-blue-600">
              💡 Sẽ tạo ô đỗ từ <strong>{bulkForm.floor || '??'}-{bulkForm.zone || 'A'}{String(bulkForm.startNumber || '??').padStart(2, '0')}</strong> đến <strong>{bulkForm.floor || '??'}-{bulkForm.zone || 'A'}{String(bulkForm.endNumber || '??').padStart(2, '0')}</strong>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export default ParkingSlotFormModal;