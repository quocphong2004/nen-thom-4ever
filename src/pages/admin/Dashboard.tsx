import { useEffect, useState } from 'react';
import { adminDashboardStats } from '../../services/orderService';
import { formatCurrency } from '../../utils/format';
import { LoadingState } from '../../components/LoadingState';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export default function Dashboard() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminDashboardStats>> | null>(null);

  useEffect(() => { adminDashboardStats().then(setStats); }, []);

  if (!stats) return <LoadingState />;

  const cards = [
    { label: 'Tổng doanh thu', value: formatCurrency(stats.totalRevenue) },
    { label: 'Doanh thu hôm nay', value: formatCurrency(stats.revenueToday) },
    { label: 'Tổng đơn hàng', value: stats.totalOrders },
    { label: 'Tổng khách hàng', value: stats.totalCustomers },
    { label: 'Tổng sản phẩm', value: stats.totalProducts },
    { label: 'Sản phẩm sắp hết hàng', value: stats.lowStockCount },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Tổng quan</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs text-ink-900/50 mb-1">{c.label}</p>
            <p className="text-xl font-semibold text-brand-700">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-medium mb-4">Đơn hàng theo trạng thái</h2>
        <div className="space-y-2">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-ink-900/60">{label}</span>
              <span className="font-medium">{stats.byStatus[key] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
