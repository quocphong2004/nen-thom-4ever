import { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { Address } from '../../types';
import { LoadingState, EmptyState } from '../../components/LoadingState';

const EMPTY_FORM = { full_name: '', phone: '', province: '', district: '', ward: '', address_detail: '' };

export default function Addresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id);
    setAddresses((data ?? []) as Address[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [user]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    await supabase.from('addresses').insert({ ...form, user_id: user.id, is_default: addresses.length === 0 });
    setForm(EMPTY_FORM);
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    await supabase.from('addresses').delete().eq('id', id);
    load();
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold">Địa chỉ giao hàng</h1>
        <button onClick={() => setShowForm((v) => !v)} className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-1">
          <PlusIcon className="h-4 w-4" /> Thêm địa chỉ
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-4 mb-6 grid sm:grid-cols-2 gap-3">
          <input required placeholder="Họ tên người nhận" className="input-field" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <input required placeholder="Số điện thoại" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input required placeholder="Tỉnh/Thành phố" className="input-field" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
          <input required placeholder="Quận/Huyện" className="input-field" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <input required placeholder="Phường/Xã" className="input-field" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
          <input required placeholder="Địa chỉ chi tiết" className="input-field" value={form.address_detail} onChange={(e) => setForm({ ...form, address_detail: e.target.value })} />
          <button type="submit" className="btn-primary sm:col-span-2">Lưu địa chỉ</button>
        </form>
      )}

      {addresses.length === 0 ? (
        <EmptyState title="Chưa có địa chỉ nào" description="Thêm địa chỉ để đặt hàng nhanh hơn." />
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="card p-4 flex justify-between items-start">
              <div className="text-sm">
                <p className="font-medium">{a.full_name} · {a.phone} {a.is_default && <span className="ml-2 text-xs text-brand-600">(Mặc định)</span>}</p>
                <p className="text-ink-900/60 mt-1">{a.address_detail}, {a.ward}, {a.district}, {a.province}</p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="text-ink-900/40 hover:text-red-500"><TrashIcon className="h-5 w-5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
