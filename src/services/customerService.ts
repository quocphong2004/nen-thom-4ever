import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

export async function adminFetchCustomers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function adminToggleCustomerActive(id: string, isActive: boolean) {
  const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}

export async function adminFetchCustomerOrderStats(userId: string) {
  const { data, error } = await supabase.from('orders').select('final_amount').eq('user_id', userId);
  if (error) throw error;
  const orders = data ?? [];
  return {
    orderCount: orders.length,
    totalSpent: orders.reduce((sum, o) => sum + Number(o.final_amount), 0),
  };
}
