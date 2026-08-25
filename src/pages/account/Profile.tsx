import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', profile.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="card p-6 max-w-lg">
      <h1 className="font-display text-xl font-semibold mb-6">Thông tin cá nhân</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Họ và tên</label>
          <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Email</label>
          <input className="input-field bg-ink-900/5" value={profile?.email ?? ''} disabled />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Số điện thoại</label>
          <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Đang lưu...' : saved ? 'Đã lưu ✓' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
}
