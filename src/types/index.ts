// Các type này ánh xạ trực tiếp theo bảng trong supabase/schema.sql
// Không hard-code dữ liệu sản phẩm ở đây — chỉ định nghĩa cấu trúc.

export type UserRole = 'admin' | 'customer';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: 'active' | 'inactive';
  sort_order: number;
  created_at: string;
}

export interface Scent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'active' | 'inactive';
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  weight: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  code: string;
  short_description: string | null;
  description: string | null;
  ingredients: string | null;
  usage_instructions: string | null;
  storage_instructions: string | null;
  safety_notes: string | null;
  usage_duration: string | null;
  suitable_space: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  is_new: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  // quan hệ (join khi query)
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  scents?: Scent[];
}

export interface CartItem {
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'bank_transfer';
export type PaymentStatus = 'unpaid' | 'paid';

export interface Order {
  id: string;
  order_code: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  province: string;
  district: string;
  ward: string;
  address_detail: string;
  note: string | null;
  total_amount: number;
  discount_amount: number;
  shipping_fee: number;
  final_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  image_url: string | null;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number;
  content: string | null;
  image_url: string | null;
  status: 'pending' | 'approved' | 'hidden';
  created_at: string;
  profile?: Profile;
}

export type DiscountType = 'percent' | 'amount';

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number | null;
  used_count: number;
  status: 'active' | 'inactive';
}

export interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  position: 'hero' | 'promo' | 'collection';
  sort_order: number;
  status: 'active' | 'inactive';
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address_detail: string;
  is_default: boolean;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  scentId?: string;
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'best_selling' | 'rating';
  page?: number;
  pageSize?: number;
}
