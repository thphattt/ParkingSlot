import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Calendar as CalendarIcon,
  Filter,
  Loader2,
  Download
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts';
import reportService from '../../services/reportService';
import toast from 'react-hot-toast';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b', '#3b82f6'];

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    revenue: [],
    contracts: [],
    slots: [],
    traffic: []
  });

  // Filters
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.getReports({ startDate, endDate });
      setData(res.data.data);
    } catch (error) {
      toast.error('Lỗi tải dữ liệu báo cáo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatMoney = (val) => Number(val).toLocaleString('vi-VN') + 'đ';

  const CustomTooltip = ({ active, payload, label, isMoney }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
          <p className="font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-semibold">
              {entry.name}: {isMoney ? formatMoney(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Báo cáo & Thống kê</h1>
            <p className="text-sm text-muted-foreground">Phân tích dữ liệu hệ thống</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-2">
          <div className="flex items-center gap-2 px-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Lọc:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-border bg-muted px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-border bg-muted px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: AreaChart (Revenue) & LineChart (Traffic) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">Doanh thu</h3>
                <p className="text-sm text-muted-foreground">Biến động doanh thu theo tháng</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      tickFormatter={(val) => `${val / 1000000}M`} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dx={-10}
                    />
                    <RechartsTooltip content={<CustomTooltip isMoney={true} />} />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      name="Doanh thu"
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Traffic Chart */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">Lưu lượng xe ra/vào</h3>
                <p className="text-sm text-muted-foreground">Tần suất theo khung giờ trong ngày</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.traffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <RechartsTooltip content={<CustomTooltip isMoney={false} />} />
                    <Line 
                      type="smooth" 
                      dataKey="entries" 
                      name="Lượt ra/vào"
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: "#f59e0b", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: PieCharts (Contracts & Slots) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Contracts Pie */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-foreground">Trạng thái Hợp đồng</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.contracts}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.contracts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip isMoney={false} />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', color: 'hsl(var(--foreground))' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Slots Pie */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-foreground">Trạng thái Ô đỗ</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.slots}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.slots.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip isMoney={false} />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', color: 'hsl(var(--foreground))' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Summary Info */}
            <div className="flex flex-col justify-center rounded-3xl border border-border bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6">
              <h3 className="mb-6 text-xl font-semibold text-foreground">Tổng quan Kì báo cáo</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {formatMoney(data.revenue.reduce((sum, item) => sum + item.total, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng lượt ra vào</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {data.traffic.reduce((sum, item) => sum + item.entries, 0)} <span className="text-lg font-medium text-muted-foreground">lượt</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
