import { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import {
  fetchCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
} from '../../services/categoryService';
import type { Category } from '../../types';
import { slugify } from '../../utils/format';
import { LoadingState, EmptyState } from '../../components/LoadingState';

const EMPTY = { name: '', description: '', status: 'active' as const, sort_order: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof EMPTY & { id?: string }>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setCategories(await fetchCategories(false));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(EMPTY);
    setShowForm(true);
  }

  function openEdit(c: Category) {
    setForm({ id: c.id, name: c.name, description: c.description ?? '', status: c.status as 'active', sort_order: c.sort_order });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name) { setError('Vui lòng nhập tên danh mục.'); return; }
    try {
      const payload = { name: form.name, slug: slugify(form.name), description: form.description, status: form.status, sort_order: form.sort_order };
      if (form.id) await adminUpdateCategory(form.id, payload);
      else await adminCreateCategory(payload);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message ?? 'Có lỗi khi lưu danh mục.');
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Xóa danh mục "${name}"?`)) return;
    await adminDeleteCategory(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Danh mục</h1>
        <button onClick={openNew} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1"><PlusIcon className="h-4 w-4" /> Thêm danh mục</button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="card p-4 mb-6 space-y-3 max-w-lg">
          <input required placeholder="Tên danh mục *" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea placeholder="Mô tả" className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex items-center gap-3">
            <select className="input-field !w-auto" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="active">Hiển thị</option>
              <option value="inactive">Ẩn</option>
            </select>
            <input type="number" placeholder="Thứ tự" className="input-field !w-24" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary !py-2 !px-4 text-sm">Lưu</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary !py-2 !px-4 text-sm">Hủy</button>
          </div>
        </form>
      )}

      {loading ? <LoadingState /> : categories.length === 0 ? (
        <EmptyState title="Chưa có danh mục nào" />
      ) : (
        <div className="card divide-y divide-ink-900/5">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-ink-900/40">{c.status === 'active' ? 'Đang hiển thị' : 'Đã ẩn'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-ink-900/5"><PencilIcon className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><TrashIcon className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
