import { supabase } from '../lib/supabase';
import type { CartItem, Order, OrderStatus, PaymentMethod } from '../types';
import { generateOrderCode } from '../utils/format';
import { getPrice } from '../context/CartContext';

export interface CreateOrderInput {
  userId: string | null;
  fullName: string;
  phone: string;
  email: string | null;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  note: string | null;
  paymentMethod: PaymentMethod;
  shippingFee: number;
  discountAmount: number;
  couponCode: string | null;
  items: CartItem[];
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const totalAmount = input.items.reduce(
    (sum, i) => sum + getPrice(i.product, i.variant) * i.quantity,
    0
  );
  const finalAmount = Math.max(0, totalAmount - input.discountAmount + input.shippingFee);

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      order_code: generateOrderCode(),
      user_id: input.userId,
      full_name: input.fullName,
      phone: input.phone,
      email: input.email,
      province: input.province,
      district: input.district,
      ward: input.ward,
      address_detail: input.addressDetail,
      note: input.note,
      total_amount: totalAmount,
      discount_amount: input.discountAmount,
      shipping_fee: input.shippingFee,
      final_amount: finalAmount,
      payment_method: input.paymentMethod,
      payment_status: 'unpaid',
      order_status: 'pending',
      coupon_code: input.couponCode,
    })
    .select()
    .single();

  if (error) throw error;

  const orderItems = input.items.map((i) => ({
    order_id: order.id,
    product_id: i.product.id,
    variant_id: i.variant?.id ?? null,
    product_name: i.product.name,
    variant_name: i.variant?.name ?? null,
    image_url: i.product.images?.[0]?.image_url ?? null,
    quantity: i.quantity,
    price: getPrice(i.product, i.variant),
    subtotal: getPrice(i.product, i.variant) * i.quantity,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  return order as Order;
}

export async function fetchMyOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function fetchOrderById(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Order;
}

export async function cancelOrder(id: string) {
  const { error } = await supabase
    .from('orders')
    .update({ order_status: 'cancelled' })
    .eq('id', id)
    .eq('order_status', 'pending');
  if (error) throw error;
}

// ---------------- ADMIN ----------------

export async function adminFetchOrders(statusFilter?: OrderStatus | 'all') {
  let query = supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false });
  if (statusFilter && statusFilter !== 'all') query = query.eq('order_status', statusFilter);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function adminUpdateOrderStatus(id: string, status: OrderStatus) {
  const { error } = await supabase
    .from('orders')
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function adminDashboardStats() {
  const [{ count: totalOrders }, { count: totalCustomers }, { count: totalProducts }, { data: orders }] =
    await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('final_amount, order_status, created_at'),
    ]);

  const revenue = (orders ?? [])
    .filter((o) => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.final_amount), 0);

  const today = new Date().toISOString().slice(0, 10);
  const revenueToday = (orders ?? [])
    .filter((o) => o.order_status !== 'cancelled' && o.created_at.startsWith(today))
    .reduce((sum, o) => sum + Number(o.final_amount), 0);

  const byStatus = (orders ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.order_status] = (acc[o.order_status] ?? 0) + 1;
    return acc;
  }, {});

  const { count: lowStockCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .lte('stock', 5)
    .eq('status', 'active');

  return {
    totalOrders: totalOrders ?? 0,
    totalCustomers: totalCustomers ?? 0,
    totalProducts: totalProducts ?? 0,
    totalRevenue: revenue,
    revenueToday,
    byStatus,
    lowStockCount: lowStockCount ?? 0,
  };
}
