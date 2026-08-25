-- ============================================================
-- NẾN THƠM 4EVER — DATABASE SCHEMA (Supabase / PostgreSQL)
-- Chạy toàn bộ file này trong Supabase SQL Editor (1 lần duy nhất)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- PROFILES (mở rộng auth.users của Supabase)
-- ------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text not null default 'customer' check (role in ('admin','customer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Tự tạo profile khi có user mới đăng ký
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, 'customer');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  status text not null default 'active' check (status in ('active','inactive')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SCENTS (mùi hương)
-- ------------------------------------------------------------
create table if not exists scents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  status text not null default 'active' check (status in ('active','inactive'))
);

-- ------------------------------------------------------------
-- PRODUCTS
-- ------------------------------------------------------------
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  code text not null unique,
  short_description text,
  description text,
  ingredients text,
  usage_instructions text,
  storage_instructions text,
  safety_notes text,
  usage_duration text,
  suitable_space text,
  price numeric(12,0) not null default 0,
  sale_price numeric(12,0),
  stock int not null default 0,
  status text not null default 'active' check (status in ('active','inactive','out_of_stock')),
  is_new boolean not null default false,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  rating_avg numeric(2,1) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_status on products(status);

-- ------------------------------------------------------------
-- PRODUCT IMAGES
-- ------------------------------------------------------------
create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0
);

-- ------------------------------------------------------------
-- PRODUCT <-> SCENTS (nhiều-nhiều)
-- ------------------------------------------------------------
create table if not exists product_scents (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  scent_id uuid not null references scents(id) on delete cascade,
  unique(product_id, scent_id)
);

-- ------------------------------------------------------------
-- PRODUCT VARIANTS (khối lượng / dung tích khác nhau)
-- ------------------------------------------------------------
create table if not exists product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  weight text,
  price numeric(12,0) not null,
  sale_price numeric(12,0),
  stock int not null default 0,
  status text not null default 'active' check (status in ('active','inactive'))
);

-- ------------------------------------------------------------
-- ADDRESSES
-- ------------------------------------------------------------
create table if not exists addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  province text not null,
  district text not null,
  ward text not null,
  address_detail text not null,
  is_default boolean not null default false
);

-- ------------------------------------------------------------
-- ORDERS
-- ------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_code text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  province text not null,
  district text not null,
  ward text not null,
  address_detail text not null,
  note text,
  total_amount numeric(12,0) not null default 0,
  discount_amount numeric(12,0) not null default 0,
  shipping_fee numeric(12,0) not null default 0,
  final_amount numeric(12,0) not null default 0,
  payment_method text not null default 'cod' check (payment_method in ('cod','bank_transfer')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid')),
  order_status text not null default 'pending' check (order_status in ('pending','confirmed','preparing','shipping','delivered','cancelled')),
  coupon_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_status on orders(order_status);

-- ------------------------------------------------------------
-- ORDER ITEMS
-- ------------------------------------------------------------
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  variant_name text,
  image_url text,
  quantity int not null default 1,
  price numeric(12,0) not null,
  subtotal numeric(12,0) not null
);

-- ------------------------------------------------------------
-- REVIEWS
-- ------------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  content text,
  image_url text,
  status text not null default 'approved' check (status in ('pending','approved','hidden')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- COUPONS
-- ------------------------------------------------------------
create table if not exists coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','amount')),
  discount_value numeric(12,0) not null,
  min_order_value numeric(12,0) not null default 0,
  start_date timestamptz,
  end_date timestamptz,
  usage_limit int,
  used_count int not null default 0,
  status text not null default 'active' check (status in ('active','inactive'))
);

-- ------------------------------------------------------------
-- BANNERS
-- ------------------------------------------------------------
create table if not exists banners (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  image_url text not null,
  link_url text,
  position text not null default 'hero' check (position in ('hero','promo','collection')),
  sort_order int not null default 0,
  status text not null default 'active' check (status in ('active','inactive'))
);

-- ------------------------------------------------------------
-- WISHLIST
-- ------------------------------------------------------------
create table if not exists wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table categories enable row level security;
alter table scents enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_scents enable row level security;
alter table product_variants enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table coupons enable row level security;
alter table banners enable row level security;
alter table wishlist_items enable row level security;

-- Helper: kiểm tra người dùng hiện tại có phải admin không
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- PROFILES: user xem/sửa profile của mình, admin xem tất cả
create policy "profiles_select_own_or_admin" on profiles for select
  using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on profiles for update
  using (auth.uid() = id);
create policy "profiles_admin_all" on profiles for all
  using (public.is_admin());

-- Dữ liệu công khai (ai cũng đọc được): categories, scents, products, images, variants, banners
create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_write" on categories for insert with check (public.is_admin());
create policy "categories_admin_update" on categories for update using (public.is_admin());
create policy "categories_admin_delete" on categories for delete using (public.is_admin());

create policy "scents_public_read" on scents for select using (true);
create policy "scents_admin_write" on scents for insert with check (public.is_admin());
create policy "scents_admin_update" on scents for update using (public.is_admin());
create policy "scents_admin_delete" on scents for delete using (public.is_admin());

create policy "products_public_read" on products for select using (true);
create policy "products_admin_write" on products for insert with check (public.is_admin());
create policy "products_admin_update" on products for update using (public.is_admin());
create policy "products_admin_delete" on products for delete using (public.is_admin());

create policy "product_images_public_read" on product_images for select using (true);
create policy "product_images_admin_write" on product_images for insert with check (public.is_admin());
create policy "product_images_admin_update" on product_images for update using (public.is_admin());
create policy "product_images_admin_delete" on product_images for delete using (public.is_admin());

create policy "product_scents_public_read" on product_scents for select using (true);
create policy "product_scents_admin_write" on product_scents for insert with check (public.is_admin());
create policy "product_scents_admin_delete" on product_scents for delete using (public.is_admin());

create policy "product_variants_public_read" on product_variants for select using (true);
create policy "product_variants_admin_write" on product_variants for insert with check (public.is_admin());
create policy "product_variants_admin_update" on product_variants for update using (public.is_admin());
create policy "product_variants_admin_delete" on product_variants for delete using (public.is_admin());

create policy "banners_public_read" on banners for select using (true);
create policy "banners_admin_write" on banners for insert with check (public.is_admin());
create policy "banners_admin_update" on banners for update using (public.is_admin());
create policy "banners_admin_delete" on banners for delete using (public.is_admin());

-- ADDRESSES: chỉ chủ sở hữu (và admin) được thao tác
create policy "addresses_owner" on addresses for all
  using (auth.uid() = user_id or public.is_admin());

-- ORDERS: khách xem/tạo đơn của mình; admin xem & sửa tất cả
create policy "orders_select_own_or_admin" on orders for select
  using (auth.uid() = user_id or public.is_admin());
create policy "orders_insert_own_or_guest" on orders for insert
  with check (auth.uid() = user_id or user_id is null);
create policy "orders_update_admin_only" on orders for update
  using (public.is_admin());

create policy "order_items_select_own_or_admin" on order_items for select
  using (
    exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );
create policy "order_items_insert_with_order" on order_items for insert
  with check (
    exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or o.user_id is null))
  );

-- REVIEWS: ai cũng đọc được review đã duyệt; chỉ chủ review được tạo/sửa; admin toàn quyền
create policy "reviews_public_read_approved" on reviews for select
  using (status = 'approved' or auth.uid() = user_id or public.is_admin());
create policy "reviews_owner_insert" on reviews for insert
  with check (auth.uid() = user_id);
create policy "reviews_owner_update" on reviews for update
  using (auth.uid() = user_id or public.is_admin());
create policy "reviews_admin_delete" on reviews for delete
  using (public.is_admin());

-- COUPONS: khách chỉ cần đọc mã đang active để áp dụng; admin toàn quyền
create policy "coupons_public_read_active" on coupons for select using (status = 'active' or public.is_admin());
create policy "coupons_admin_write" on coupons for insert with check (public.is_admin());
create policy "coupons_admin_update" on coupons for update using (public.is_admin());
create policy "coupons_admin_delete" on coupons for delete using (public.is_admin());

-- WISHLIST: chỉ chủ sở hữu
create policy "wishlist_owner" on wishlist_items for all
  using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS (chạy sau khi tạo bucket trong Dashboard > Storage)
-- Tạo 2 bucket public: "product-images" và "banner-images"
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('product-images','product-images', true) on conflict do nothing;
-- insert into storage.buckets (id, name, public) values ('banner-images','banner-images', true) on conflict do nothing;

-- ============================================================
-- TÀI KHOẢN ADMIN ĐẦU TIÊN
-- Sau khi đăng ký 1 tài khoản bất kỳ trên website, chạy lệnh dưới đây
-- (thay email) để nâng tài khoản đó lên quyền admin:
-- update profiles set role = 'admin' where email = 'admin@nenthom4ever.com';
-- ============================================================
