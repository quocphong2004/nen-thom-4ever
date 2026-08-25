import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrderById, adminUpdateOrderStatus } from '../../services/orderService';
import type { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDate, ORDER_STATUS_LABEL } from '../../utils/format';
import { LoadingState } from '../../components/LoadingState';

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!orderId) return;
    setLoading(true);
    const o = await fetchOrderById(orderId);
    setOrder(o);
    setLoading(false);
  }

  useEffect(() => { load(); }, [orderId]);

  async function handleStatusChange(status: OrderStatus) {
    if (!order) return;
    await adminUpdateOrderStatus(order.id, status);
    load();
  }

  if (loading) return <LoadingState />;
  if (!order) return <p>Không tìm thấy đơn hàng.</p>;

  return (
    <div>
      <Link to="/admin/don-hang" className="text-sm text-brand-600 hover:underline">&larr; Quay lại danh sách đơn hàng</Link>
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Đơn hàng #{order.order_code}</h1>
          <p className="text-sm text-ink-900/50">Ngày đặt: {formatDate(order.created_at)}</p>
        </div>
        <select
          value={order.order_status}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          className="input-field !w-auto"
        >
          {(['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'] as OrderStatus[]).map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        <div className="card p-6">
          <h2 className="font-medium mb-4">Sản phẩm ({order.items?.length ?? 0})</h2>
          <div className="space-y-3">
            {order.items?.map((it) => (
              <div key={it.id} className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-brand-50 overflow-hidden shrink-0">
                  {it.image_url && <img src={it.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{it.product_name}{it.variant_name ? ` (${it.variant_name})` : ''}</p>
                  <p className="text-ink-900/50">Số lượng: {it.quantity} × {formatCurrency(it.price)}</p>
                </div>
                <p className="font-medium">{formatCurrency(it.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-ink-900/10 mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-ink-900/60">Tạm tính</span><span>{formatCurrency(order.total_amount)}</span></div>
            <div className="flex justify-between"><span className="text-ink-900/60">Giảm giá {order.coupon_code ? `(${order.coupon_code})` : ''}</span><span>-{formatCurrency(order.discount_amount)}</span></div>
            <div className="flex justify-between"><span className="text-ink-900/60">Phí vận chuyển</span><span>{formatCurrency(order.shipping_fee)}</span></div>
            <div className="flex justify-between font-semibold pt-2 border-t border-ink-900/10"><span>Tổng</span><span className="text-brand-700">{formatCurrency(order.final_amount)}</span></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-medium mb-3">Khách hàng</h2>
            <p className="text-sm">{order.full_name}</p>
            <p className="text-sm text-ink-900/60">{order.phone}</p>
            {order.email && <p className="text-sm text-ink-900/60">{order.email}</p>}
          </div>
          <div className="card p-6">
            <h2 className="font-medium mb-3">Địa chỉ giao hàng</h2>
            <p className="text-sm text-ink-900/60">{order.address_detail}, {order.ward}, {order.district}, {order.province}</p>
            {order.note && <p className="text-sm text-ink-900/60 mt-2">Ghi chú: {order.note}</p>}
          </div>
          <div className="card p-6">
            <h2 className="font-medium mb-3">Thanh toán</h2>
            <p className="text-sm text-ink-900/60">
              Phương thức: {order.payment_method === 'cod' ? 'COD' : 'Chuyển khoản ngân hàng'}
            </p>
            <p className="text-sm text-ink-900/60">
              Trạng thái: {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
