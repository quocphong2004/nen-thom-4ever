import { supabase } from '../lib/supabase';
import type { Banner } from '../types';

export async function fetchBanners(position?: Banner['position']) {
  let query = supabase.from('banners').select('*').eq('status', 'active').order('sort_order');
  if (position) query = query.eq('position', position);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Banner[];
}

export async function adminFetchAllBanners() {
  const { data, error } = await supabase.from('banners').select('*').order('sort_order');
  if (error) throw error;
  return (data ?? []) as Banner[];
}

export async function adminCreateBanner(payload: Partial<Banner>) {
  const { error } = await supabase.from('banners').insert(payload);
  if (error) throw error;
}

export async function adminUpdateBanner(id: string, payload: Partial<Banner>) {
  const { error } = await supabase.from('banners').update(payload).eq('id', id);
  if (error) throw error;
}

export async function adminDeleteBanner(id: string) {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw error;
}
