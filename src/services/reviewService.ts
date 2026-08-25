import { supabase } from '../lib/supabase';
import type { Review } from '../types';

export async function fetchProductReviews(productId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profile:profiles(*)')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function createReview(payload: {
  userId: string;
  productId: string;
  orderId: string | null;
  rating: number;
  content: string;
  imageUrl: string | null;
}) {
  const { error } = await supabase.from('reviews').insert({
    user_id: payload.userId,
    product_id: payload.productId,
    order_id: payload.orderId,
    rating: payload.rating,
    content: payload.content,
    image_url: payload.imageUrl,
  });
  if (error) throw error;
}

export async function adminFetchReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profile:profiles(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function adminSetReviewStatus(id: string, status: 'approved' | 'hidden') {
  const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
  if (error) throw error;
}
