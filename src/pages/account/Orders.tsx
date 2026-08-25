import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyOrders, cancelOrder } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import type { Order } from '../../types';
import { formatCurrency, formatDate, ORDER_STATUS_LABEL } from '../../utils/format';
import { LoadingState, EmptyState } from '../../components/LoadingState';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const data = await fetchMyOrders(user.id);
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [user]);

  async function handleCancel(id: string) {
    await cancelOrder(id);
    load();
  }

  if (loading) return <LoadingState />;
  if (orders.length === 0) {
    return <EmptyState title="Bạn chưa có đơn hàng nào" description="Các đơn hàng của bạn sẽ hiển thị tại đây." />;
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold mb-2">Đơn hàng của tôi</h1>
      {orders.map((o) => (
        <div key={o.id} className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <p className="font-medium">Đơn hàng #{o.order_code}</p>
              <p className="text-xs text-ink-900/50">{formatDate(o.created_at)}</p>
            </div>
            <span className="rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs font-medium">
              {ORDER_STATUS_LABEL[o.order_status] ?? o.order_status}
            </span>
          </div>
          <div className="space-y-1 mb-3">
            {o.items?.map((it) => (
              <div key={it.id} className="flex justify-between text-sm text-ink-900/70">
                <span>{it.product_name}{it.variant_name ? ` (${it.variant_name})` : ''} x{it.quantity}</span>
                <span>{formatCurrency(it.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-ink-900/10 pt-3">
            <p className="font-semibold">Tổng: <span className="text-brand-700">{formatCurrency(o.final_amount)}</span></p>
            <div className="flex gap-2">
              {o.order_status === 'pending' && (
                <button onClick={() => handleCancel(o.id)} className="text-xs text-red-500 hover:underline">Hủy đơn</button>
              )}
              <Link to={`/tai-khoan/don-hang/${o.id}`} className="text-xs text-brand-600 font-medium hover:underline">Xem chi tiết</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
