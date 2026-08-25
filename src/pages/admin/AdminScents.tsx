import { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { fetchScents, adminCreateScent, adminUpdateScent, adminDeleteScent } from '../../services/categoryService';
import type { Scent } from '../../types';
import { slugify } from '../../utils/format';
import { LoadingState, EmptyState } from '../../components/LoadingState';

const EMPTY = { name: '', description: '', status: 'active' as 'active' | 'inactive' };

export default function AdminScents() {
  const [scents, setScents] = useState<Scent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const data = await fetchScents(false);
    setScents(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(s: Scent) {
    setEditingId(s.id);
    setForm({ name: s.name, description: s.description ?? '', status: s.status });
    setShowForm(true);
  }

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { name: form.name, slug: slugify(form.name), description: form.description || null, status: form.status };
    if (editingId) {
      await adminUpdateScent(editingId, payload);
    } else {
      await adminCreateScent(payload);
    }
    setShowForm(false);
    setForm(EMPTY);
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Xóa mùi hương "${name}"?`)) return;
    await adminDeleteScent(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Quản lý mùi hương</h1>
        <button onClick={startCreate} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1">
          <PlusIcon className="h-4 w-4" /> Thêm mùi hương
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 mb-6 grid sm:grid-cols-2 gap-3">
          <input required placeholder="Tên mùi hương (VD: Lavender)" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ẩn</option>
          </select>
          <textarea placeholder="Mô tả đặc điểm (VD: Dịu nhẹ, thư giãn...)" className="input-field sm:col-span-2" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-primary">Lưu</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingState />
      ) : scents.length === 0 ? (
        <EmptyState title="Chưa có mùi hương nào" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scents.map((s) => (
            <div key={s.id} className="card p-4">
              <div className="flex justify-between items-start mb-1">
                <p className="font-medium">{s.name}</p>
                <span className={`text-xs rounded-full px-2 py-0.5 ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-ink-900/10 text-ink-900/50'}`}>
                  {s.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                </span>
              </div>
              {s.description && <p className="text-xs text-ink-900/50 mb-3">{s.description}</p>}
              <div className="flex gap-2">
                <button onClick={() => startEdit(s)} className="p-1.5 rounded hover:bg-ink-900/5"><PencilIcon className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><TrashIcon className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
