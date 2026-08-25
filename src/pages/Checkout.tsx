import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, getPrice } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { validateCoupon } from '../services/couponService';
import { formatCurrency } from '../utils/format';
import type { PaymentMethod } from '../types';

const SHIPPING_FEE = 30000;

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    email: profile?.email ?? '',
    province: '',
    district: '',
    ward: '',
    addressDetail: '',
    note: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [couponInput, setCouponInput] = useState('');
  const [couponResult, setCouponResult] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-ink-900/60">Giỏ hàng trống, không thể thanh toán.</p>
      </div>
    );
  }

  const discount = couponResult?.discount ?? 0;
  const finalAmount = Math.max(0, subtotal - discount + SHIPPING_FEE);

  function handleChange(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleApplyCoupon() {
    setCouponError('');
    if (!couponInput.trim()) return;
    const result = await validateCoupon(couponInput, subtotal);
    if (result.valid) {
      setCouponResult({ code: result.coupon.code, discount: result.discount });
    } else {
      setCouponResult(null);
      setCouponError(result.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.phone || !form.province || !form.district || !form.ward || !form.addressDetail) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng bắt buộc.');
      return;
    }
    setSubmitting(true);
    try {
      const order = await createOrder({
        userId: user?.id ?? null,
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || null,
        province: form.province,
        district: form.district,
        ward: form.ward,
        addressDetail: form.addressDetail,
        note: form.note || null,
        paymentMethod,
        shippingFee: SHIPPING_FEE,
        discountAmount: discount,
        couponCode: couponResult?.code ?? null,
        items,
      });
      clearCart();
      navigate(`/dat-hang-thanh-cong/${order.id}`);
    } catch (err: any) {
      setError(err.message ?? 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl font-semibold mb-8">Thanh toán</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-medium mb-4">Thông tin giao hàng</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Họ và tên *" className="input-field" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />
              <input required placeholder="Số điện thoại *" className="input-field" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              <input placeholder="Email" type="email" className="input-field sm:col-span-2" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
              <input required placeholder="Tỉnh/Thành phố *" className="input-field" value={form.province} onChange={(e) => handleChange('province', e.target.value)} />
              <input required placeholder="Quận/Huyện *" className="input-field" value={form.district} onChange={(e) => handleChange('district', e.target.value)} />
              <input required placeholder="Phường/Xã *" className="input-field" value={form.ward} onChange={(e) => handleChange('ward', e.target.value)} />
              <input required placeholder="Địa chỉ cụ thể (số nhà, đường) *" className="input-field sm:col-span-2" value={form.addressDetail} onChange={(e) => handleChange('addressDetail', e.target.value)} />
              <textarea placeholder="Ghi chú đơn hàng" className="input-field sm:col-span-2" rows={3} value={form.note} onChange={(e) => handleChange('note', e.target.value)} />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-medium mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-lg border border-ink-900/10 p-3 cursor-pointer has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
                <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <div>
                  <p className="text-sm font-medium">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-xs text-ink-900/50">Thanh toán bằng tiền mặt khi nhận sản phẩm.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-ink-900/10 p-3 cursor-pointer has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
                <input type="radio" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} />
                <div>
                  <p className="text-sm font-medium">Chuyển khoản ngân hàng</p>
                  <p className="text-xs text-ink-900/50">Thông tin chuyển khoản sẽ hiển thị sau khi đặt hàng thành công.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="card p-6 h-fit space-y-4">
          <h2 className="font-medium">Đơn hàng ({items.length} sản phẩm)</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.variant?.id ?? 'd'}`} className="flex justify-between text-sm">
                <span className="text-ink-900/70">{item.product.name}{item.variant ? ` (${item.variant.name})` : ''} x{item.quantity}</span>
                <span>{formatCurrency(getPrice(item.product, item.variant) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              placeholder="Mã giảm giá"
              className="input-field"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
            />
            <button type="button" onClick={handleApplyCoupon} className="btn-secondary !px-4 !py-2 text-sm whitespace-nowrap">Áp dụng</button>
          </div>
          {couponError && <p className="text-xs text-red-500">{couponError}</p>}
          {couponResult && <p className="text-xs text-green-600">Đã áp dụng mã {couponResult.code}</p>}

          <div className="border-t border-ink-900/10 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-900/60">Tạm tính</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-ink-900/60">Giảm giá</span><span>-{formatCurrency(discount)}</span></div>
            <div className="flex justify-between"><span className="text-ink-900/60">Phí vận chuyển</span><span>{formatCurrency(SHIPPING_FEE)}</span></div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-ink-900/10">
              <span>Tổng thanh toán</span><span className="text-brand-700">{formatCurrency(finalAmount)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </button>
        </div>
      </form>
    </div>
  );
}
