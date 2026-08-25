import { supabase } from '../lib/supabase';
import type { Coupon } from '../types';

export async function validateCoupon(code: string, orderTotal: number): Promise<
  { valid: true; coupon: Coupon; discount: number } | { valid: false; message: string }
> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('status', 'active')
    .single();

  if (error || !data) return { valid: false, message: 'Mã giảm giá không tồn tại hoặc đã bị tắt.' };

  const coupon = data as Coupon;
  const now = new Date();
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    return { valid: false, message: 'Mã giảm giá chưa đến thời gian sử dụng.' };
  }
  if (coupon.end_date && new Date(coupon.end_date) < now) {
    return { valid: false, message: 'Mã giảm giá đã hết hạn.' };
  }
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng.' };
  }
  if (orderTotal < coupon.min_order_value) {
    return { valid: false, message: `Đơn hàng tối thiểu để áp dụng mã là ${coupon.min_order_value.toLocaleString('vi-VN')}đ.` };
  }

  const discount =
    coupon.discount_type === 'percent'
      ? Math.round((orderTotal * coupon.discount_value) / 100)
      : coupon.discount_value;

  return { valid: true, coupon, discount: Math.min(discount, orderTotal) };
}

export async function adminFetchCoupons() {
  const { data, error } = await supabase.from('coupons').select('*').order('code');
  if (error) throw error;
  return (data ?? []) as Coupon[];
}

export async function adminCreateCoupon(payload: Partial<Coupon>) {
  const { error } = await supabase.from('coupons').insert({ ...payload, code: payload.code?.toUpperCase() });
  if (error) throw error;
}

export async function adminUpdateCoupon(id: string, payload: Partial<Coupon>) {
  const { error } = await supabase.from('coupons').update(payload).eq('id', id);
  if (error) throw error;
}

export async function adminDeleteCoupon(id: string) {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
}
