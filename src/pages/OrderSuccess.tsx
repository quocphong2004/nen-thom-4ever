import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { fetchOrderById } from '../services/orderService';
import type { Order } from '../types';
import { formatCurrency } from '../utils/format';
import { LoadingState } from '../components/LoadingState';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetchOrderById(orderId).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [orderId]);

  if (loading) return <LoadingState />;
  if (!order) return <div className="container-page py-16 text-center">Không tìm thấy đơn hàng.</div>;

  return (
    <div className="container-page py-16 max-w-xl mx-auto text-center">
      <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h1 className="font-display text-2xl font-semibold mb-2">Đặt hàng thành công!</h1>
      <p className="text-ink-900/60 mb-6">Mã đơn hàng của bạn là <span className="font-semibold text-ink-900">{order.order_code}</span></p>

      <div className="card p-6 text-left mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-900/60">Phương thức thanh toán</span>
          <span>{order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-900/60">Tổng thanh toán</span>
          <span className="font-semibold text-brand-700">{formatCurrency(order.final_amount)}</span>
        </div>
        {order.payment_method === 'bank_transfer' && (
          <div className="mt-4 rounded-lg bg-brand-50 p-4 text-sm space-y-1">
            <p><strong>Ngân hàng:</strong> Vietcombank</p>
            <p><strong>Số tài khoản:</strong> 0123456789</p>
            <p><strong>Chủ tài khoản:</strong> CONG TY NEN THOM 4EVER</p>
            <p><strong>Nội dung CK:</strong> {order.order_code}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <Link to="/tai-khoan/don-hang" className="btn-secondary">Xem đơn hàng của tôi</Link>
        <Link to="/san-pham" className="btn-primary">Tiếp tục mua sắm</Link>
      </div>
    </div>
  );
}
