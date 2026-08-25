import { supabase } from '../lib/supabase';
import type { Product, ProductFilters } from '../types';

const PRODUCT_SELECT = `
  *,
  category:categories(*),
  images:product_images(*),
  variants:product_variants(*),
  product_scents(scent:scents(*))
`;

function mapProduct(row: any): Product {
  return {
    ...row,
    scents: row.product_scents?.map((ps: any) => ps.scent).filter(Boolean) ?? [],
  };
}

export async function fetchProducts(filters: ProductFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('status', 'active');

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
  }
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice);
  if (filters.isNew) query = query.eq('is_new', true);
  if (filters.isFeatured) query = query.eq('is_featured', true);
  if (filters.isBestSeller) query = query.eq('is_best_seller', true);

  switch (filters.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'best_selling':
      query = query.order('is_best_seller', { ascending: false }).order('rating_count', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating_avg', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  let products = (data ?? []).map(mapProduct);

  // Lọc theo mùi hương (quan hệ nhiều-nhiều, lọc phía client sau khi join)
  if (filters.scentId) {
    products = products.filter((p) => p.scents?.some((s) => s.id === filters.scentId));
  }

  return { products, total: count ?? 0, page, pageSize };
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  if (error) return null;
  return mapProduct(data);
}

export async function fetchRelatedProducts(categoryId: string | null, excludeId: string, limit = 4) {
  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'active')
    .neq('id', excludeId)
    .limit(limit);
  if (categoryId) query = query.eq('category_id', categoryId);
  const { data } = await query;
  return (data ?? []).map(mapProduct);
}

// ---------------- ADMIN ----------------

export async function adminFetchProducts(search = '') {
  let query = supabase.from('products').select(PRODUCT_SELECT).order('created_at', { ascending: false });
  if (search) query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function adminCreateProduct(payload: Partial<Product>) {
  const { data, error } = await supabase.from('products').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function adminUpdateProduct(id: string, payload: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function adminDeleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function adminSetProductScents(productId: string, scentIds: string[]) {
  await supabase.from('product_scents').delete().eq('product_id', productId);
  if (scentIds.length === 0) return;
  const rows = scentIds.map((scent_id) => ({ product_id: productId, scent_id }));
  const { error } = await supabase.from('product_scents').insert(rows);
  if (error) throw error;
}

export async function adminAddProductImage(productId: string, imageUrl: string, sortOrder = 0) {
  const { error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, image_url: imageUrl, sort_order: sortOrder });
  if (error) throw error;
}

export async function adminDeleteProductImage(imageId: string) {
  const { error } = await supabase.from('product_images').delete().eq('id', imageId);
  if (error) throw error;
}

export async function adminUpsertVariant(variant: Partial<import('../types').ProductVariant>) {
  const { data, error } = await supabase.from('product_variants').upsert(variant).select().single();
  if (error) throw error;
  return data;
}

export async function adminDeleteVariant(id: string) {
  const { error } = await supabase.from('product_variants').delete().eq('id', id);
  if (error) throw error;
}
