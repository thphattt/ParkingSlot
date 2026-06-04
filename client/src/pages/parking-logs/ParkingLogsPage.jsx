import { useState, useEffect, useCallback } from 'react';
import { LogIn, LogOut, Search, Car, Clock, User, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import parkingLogService from '../../services/parkingLogService';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';

const ParkingLogsPage = () => {
  // Input biển số
  const [plate, setPlate] = useState('');
  const [gate, setGate] = useState('Cổng chính');
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // Xe đang trong bãi
  const [currentVehicles, setCurrentVehicles] = useState([]);
  const [loadingCurrent, setLoadingCurrent] = useState(true);

  // Lịch sử
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [typeFilter, setTypeFilter] = useState('');

  // Fetch xe đang trong bãi
  const fetchCurrent = useCallback(async () => {
    setLoadingCurrent(true);
    try {
      const { data } = await parkingLogService.getCurrent();
      setCurrentVehicles(data.data);
    } catch (error) {
      console.error('Lỗi:', error);
    } finally {
      setLoadingCurrent(false);
    }
  }, []);

  // Fetch lịch sử
  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (typeFilter) params.type = typeFilter;

      const { data } = await parkingLogService.getLogs(params);
      setLogs(data.data);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Lỗi:', error);
    } finally {
      setLoadingLogs(false);
    }
  }, [pagination.page, pagination.limit, typeFilter]);

  useEffect(() => { fetchCurrent(); }, [fetchCurrent]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Xử lý VÀO / RA
  const handleAction = async (type) => {
    if (!plate.trim()) {
      toast.error('Vui lòng nhập biển số xe');
      return;
    }

    setProcessing(true);
    setLastResult(null);

    try {
      const action = type === 'entry' ? parkingLogService.entry : parkingLogService.exit;
      const { data } = await action({ licensePlate: plate.trim(), gate });

      setLastResult({ type, ...data });
      toast.success(data.message);
      setPlate('');

      // Refresh data
      fetchCurrent();
      fetchLogs();
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(msg);
      setLastResult({ type, error: msg });
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit',
    });
  };

  const formatTimeFull = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  // Columns cho lịch sử
  const logColumns = [
    {
      key: 'type',
      label: 'Loại',
      render: (val) => (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
          val === 'entry' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'
        }`}>
          {val === 'entry' ? <LogIn className="h-3 w-3" /> : <LogOut className="h-3 w-3" />}
          {val === 'entry' ? 'Vào' : 'Ra'}
        </span>
      ),
    },
    {
      key: 'licensePlate',
      label: 'Biển số',
      render: (val) => <span className="font-mono font-semibold text-foreground">{val}</span>,
    },
    {
      key: 'slot',
      label: 'Ô đỗ',
      render: (val) => val ? (
        <span className="inline-flex items-center rounded-xl bg-muted px-2.5 py-1 text-xs font-semibold">
          {val.slotCode}
        </span>
      ) : '—',
    },
    {
      key: 'recordedBy',
      label: 'Ghi nhận bởi',
      render: (val) => val?.fullName || '—',
    },
    {
      key: 'createdAt',
      label: 'Thời gian',
      render: (val) => (
        <span className="text-sm text-muted-foreground">{formatTimeFull(val)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10">
          <Car className="h-5 w-5 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Vào / Ra</h1>
          <p className="text-sm text-muted-foreground">Ghi nhận xe vào ra bãi đỗ</p>
        </div>
      </div>

      {/* Scanner Card */}
      <div className="rounded-3xl border-2 border-border bg-card p-6 transition-all hover:border-primary/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* Biển số input */}
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Biển số xe</label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && plate) handleAction('entry');
              }}
              placeholder="Nhập biển số... VD: 51F12345"
              className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-lg font-mono font-semibold text-foreground uppercase placeholder:text-muted-foreground placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-ring/20"
              autoFocus
            />
          </div>

          {/* Cổng */}
          <div className="w-full md:w-40">
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Cổng</label>
            <select value={gate} onChange={(e) => setGate(e.target.value)}
              className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
              <option>Cổng chính</option>
              <option>Cổng A</option>
              <option>Cổng B</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('entry')}
              disabled={processing || !plate.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              XE VÀO
            </button>
            <button
              onClick={() => handleAction('exit')}
              disabled={processing || !plate.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              XE RA
            </button>
          </div>
        </div>

        {/* Kết quả */}
        {lastResult && !lastResult.error && (
          <div className={`mt-4 rounded-2xl p-4 ${
            lastResult.type === 'entry' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-orange-500/10 border border-orange-500/30'
          }`}>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono font-semibold">{lastResult.data?.vehicle?.licensePlate}</span>
                <span className="text-muted-foreground">
                  {lastResult.data?.vehicle?.type === 'car' ? 'Ô tô' : 'Xe máy'}
                </span>
              </div>
              {lastResult.data?.vehicle?.owner && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{lastResult.data.vehicle.owner.fullName}</span>
                  <span className="text-muted-foreground">
                    ({lastResult.data.vehicle.owner.building}-{lastResult.data.vehicle.owner.apartment})
                  </span>
                </div>
              )}
              {lastResult.data?.slot && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Ô {lastResult.data.slot.slotCode}</span>
                </div>
              )}
              {lastResult.data?.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Thời gian đỗ: <strong>{lastResult.data.duration}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}

        {lastResult?.error && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {lastResult.error}
          </div>
        )}
      </div>

      {/* Xe đang trong bãi */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Xe đang trong bãi
            <span className="ml-2 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-sm font-medium text-emerald-600">
              {currentVehicles.length}
            </span>
          </h2>
        </div>

        {loadingCurrent ? (
          <div className="rounded-3xl border border-border p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
                  <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
                  <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
                </div>
              ))}
            </div>
          </div>
        ) : currentVehicles.length === 0 ? (
          <div className="rounded-3xl border border-border p-8 text-center">
            <Car className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="font-medium text-muted-foreground">Bãi trống</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {currentVehicles.map((item, idx) => (
              <div key={idx}
                className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-semibold text-foreground">{item.licensePlate}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.vehicle?.type === 'car' ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'
                  }`}>
                    {item.vehicle?.type === 'car' ? 'Ô tô' : 'Xe máy'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.vehicle?.owner?.fullName || '—'} · {item.vehicle?.owner?.building}-{item.vehicle?.owner?.apartment}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Ô {item.slot?.slotCode || '—'}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(item.entryTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lịch sử */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Lịch sử vào/ra</h2>
          <select value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
            className="rounded-2xl border border-border bg-muted px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
            <option value="">Tất cả</option>
            <option value="entry">Vào</option>
            <option value="exit">Ra</option>
          </select>
        </div>

        <DataTable columns={logColumns} data={logs} loading={loadingLogs}
          emptyMessage="Chưa có lịch sử" emptyIcon={Car} />

        {pagination.pages > 1 && (
          <div className="mt-4">
            <Pagination page={pagination.page} pages={pagination.pages}
              total={pagination.total} onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingLogsPage;