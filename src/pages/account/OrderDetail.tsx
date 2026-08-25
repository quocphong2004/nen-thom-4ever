import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { fetchOrderById } from '../../services/orderService';
import type { Order } from '../../types';
import { formatCurrency, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_STEPS } from '../../utils/format';
import { LoadingState } from '../../components/LoadingState';

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetchOrderById(orderId).then((o) => { setOrder(o); setLoading(false); });
  }, [orderId]);

  if (loading) return <LoadingState />;
  if (!order) return <p>Không tìm thấy đơn hàng.</p>;

  const currentStepIndex = ORDER_STATUS_STEPS.indexOf(order.order_status);
  const cancelled = order.order_status === 'cancelled';

  return (
    <div>
      <h1 className="font-display text-xl font-semibold mb-1">Đơn hàng #{order.order_code}</h1>
      <p className="text-sm text-ink-900/50 mb-6">Ngày đặt: {formatDate(order.created_at)}</p>

      {cancelled ? (
        <div className="card p-4 bg-red-50 text-red-700 text-sm mb-6">Đơn hàng này đã bị hủy.</div>
      ) : (
        <div className="card p-6 mb-6">
          <div className="flex justify-between">
            {ORDER_STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center text-center relative">
                {i > 0 && (
                  <div className={`absolute top-3 right-1/2 w-full h-0.5 ${i <= currentStepIndex ? 'bg-brand-500' : 'bg-ink-900/10'}`} />
                )}
                <CheckCircleIcon className={`h-6 w-6 z-10 bg-white ${i <= currentStepIndex ? 'text-brand-500' : 'text-ink-900/20'}`} />
                <p className={`text-[11px] mt-2 ${i <= currentStepIndex ? 'text-ink-900 font-medium' : 'text-ink-900/40'}`}>
                  {ORDER_STATUS_LABEL[step]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6 mb-6">
        <h2 className="font-medium mb-3">Sản phẩm</h2>
        <div className="space-y-2">
          {order.items?.map((it) => (
            <div key={it.id} className="flex justify-between text-sm">
              <span>{it.product_name}{it.variant_name ? ` (${it.variant_name})` : ''} x{it.quantity}</span>
              <span>{formatCurrency(it.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-ink-900/10 mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-ink-900/60">Tạm tính</span><span>{formatCurrency(order.total_amount)}</span></div>
          <div className="flex justify-between"><span className="text-ink-900/60">Giảm giá</span><span>-{formatCurrency(order.discount_amount)}</span></div>
          <div className="flex justify-between"><span className="text-ink-900/60">Phí vận chuyển</span><span>{formatCurrency(order.shipping_fee)}</span></div>
          <div className="flex justify-between font-semibold pt-2 border-t border-ink-900/10"><span>Tổng</span><span className="text-brand-700">{formatCurrency(order.final_amount)}</span></div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-medium mb-3">Thông tin giao hàng</h2>
        <p className="text-sm">{order.full_name} · {order.phone}</p>
        <p className="text-sm text-ink-900/60 mt-1">{order.address_detail}, {order.ward}, {order.district}, {order.province}</p>
        {order.note && <p className="text-sm text-ink-900/60 mt-2">Ghi chú: {order.note}</p>}
      </div>
    </div>
  );
}
