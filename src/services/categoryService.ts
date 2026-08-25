import { supabase } from '../lib/supabase';
import type { Category, Scent } from '../types';

export async function fetchCategories(activeOnly = true) {
  let query = supabase.from('categories').select('*').order('sort_order', { ascending: true });
  if (activeOnly) query = query.eq('status', 'active');
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchScents(activeOnly = true) {
  let query = supabase.from('scents').select('*').order('name', { ascending: true });
  if (activeOnly) query = query.eq('status', 'active');
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Scent[];
}

export async function adminCreateCategory(payload: Partial<Category>) {
  const { data, error } = await supabase.from('categories').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function adminUpdateCategory(id: string, payload: Partial<Category>) {
  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function adminDeleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function adminCreateScent(payload: Partial<Scent>) {
  const { data, error } = await supabase.from('scents').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function adminUpdateScent(id: string, payload: Partial<Scent>) {
  const { data, error } = await supabase.from('scents').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function adminDeleteScent(id: string) {
  const { error } = await supabase.from('scents').delete().eq('id', id);
  if (error) throw error;
}
