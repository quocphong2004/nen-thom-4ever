import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminFetchOrders, adminUpdateOrderStatus } from '../../services/orderService';
import type { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDate, ORDER_STATUS_LABEL } from '../../utils/format';
import { LoadingState, EmptyState } from '../../components/LoadingState';

const STATUS_OPTIONS: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const data = await adminFetchOrders(statusFilter);
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function handleStatusChange(id: string, status: OrderStatus) {
    await adminUpdateOrderStatus(id, status);
    load();
  }

  const filtered = orders.filter(
    (o) =>
      !search ||
      o.order_code.toLowerCase().includes(search.toLowerCase()) ||
      o.full_name.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search)
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Quản lý đơn hàng</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-ink-900/10 text-ink-900/60'}`}
          >
            {s === 'all' ? 'Tất cả' : ORDER_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <input
        placeholder="Tìm theo mã đơn, tên, số điện thoại..."
        className="input-field max-w-sm mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState title="Không có đơn hàng nào" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/5 text-left text-xs text-ink-900/50 uppercase">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Ngày đặt</th>
                <th className="px-4 py-3">Tổng tiền</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-t border-ink-900/5">
                  <td className="px-4 py-3 font-medium">{o.order_code}</td>
                  <td className="px-4 py-3">
                    <p>{o.full_name}</p>
                    <p className="text-xs text-ink-900/50">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-900/60">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-brand-700">{formatCurrency(o.final_amount)}</td>
                  <td className="px-4 py-3 text-ink-900/60">{o.payment_method === 'cod' ? 'COD' : 'Chuyển khoản'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.order_status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                      className="input-field !py-1.5 !px-2 text-xs"
                    >
                      {(['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'] as OrderStatus[]).map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/don-hang/${o.id}`} className="text-brand-600 text-xs font-medium hover:underline">Chi tiết</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
