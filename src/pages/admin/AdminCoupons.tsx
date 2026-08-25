import { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { adminFetchCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from '../../services/couponService';
import type { Coupon } from '../../types';
import { formatCurrency } from '../../utils/format';
import { LoadingState, EmptyState } from '../../components/LoadingState';

const EMPTY = {
  code: '',
  discount_type: 'percent' as 'percent' | 'amount',
  discount_value: 0,
  min_order_value: 0,
  start_date: '',
  end_date: '',
  usage_limit: '',
  status: 'active' as 'active' | 'inactive',
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);

  async function load() {
    setLoading(true);
    const data = await adminFetchCoupons();
    setCoupons(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function startEdit(c: Coupon) {
    setEditingId(c.id);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order_value: c.min_order_value,
      start_date: c.start_date?.slice(0, 10) ?? '',
      end_date: c.end_date?.slice(0, 10) ?? '',
      usage_limit: c.usage_limit?.toString() ?? '',
      status: c.status,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      code: form.code,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_value: Number(form.min_order_value),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      status: form.status,
    };
    if (editingId) {
      await adminUpdateCoupon(editingId, payload);
    } else {
      await adminCreateCoupon(payload);
    }
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Xóa mã giảm giá "${code}"?`)) return;
    await adminDeleteCoupon(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Quản lý mã giảm giá</h1>
        <button onClick={startCreate} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1">
          <PlusIcon className="h-4 w-4" /> Tạo mã mới
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 mb-6 grid sm:grid-cols-2 gap-3">
          <input required placeholder="Mã (VD: WELCOME10)" className="input-field" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <select className="input-field" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}>
            <option value="percent">Giảm theo %</option>
            <option value="amount">Giảm số tiền cố định</option>
          </select>
          <input required type="number" placeholder={form.discount_type === 'percent' ? 'Phần trăm giảm (VD: 10)' : 'Số tiền giảm (VD: 50000)'} className="input-field" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
          <input type="number" placeholder="Giá trị đơn hàng tối thiểu" className="input-field" value={form.min_order_value} onChange={(e) => setForm({ ...form, min_order_value: Number(e.target.value) })} />
          <input type="date" placeholder="Ngày bắt đầu" className="input-field" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <input type="date" placeholder="Ngày kết thúc" className="input-field" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <input type="number" placeholder="Số lượt sử dụng tối đa (để trống = không giới hạn)" className="input-field" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} />
          <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
            <option value="active">Kích hoạt</option>
            <option value="inactive">Tắt</option>
          </select>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-primary">Lưu</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingState />
      ) : coupons.length === 0 ? (
        <EmptyState title="Chưa có mã giảm giá nào" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/5 text-left text-xs text-ink-900/50 uppercase">
              <tr>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Giá trị giảm</th>
                <th className="px-4 py-3">Đơn tối thiểu</th>
                <th className="px-4 py-3">Đã dùng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t border-ink-900/5">
                  <td className="px-4 py-3 font-medium">{c.code}</td>
                  <td className="px-4 py-3">{c.discount_type === 'percent' ? `${c.discount_value}%` : formatCurrency(c.discount_value)}</td>
                  <td className="px-4 py-3 text-ink-900/60">{formatCurrency(c.min_order_value)}</td>
                  <td className="px-4 py-3 text-ink-900/60">{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs rounded-full px-2 py-1 ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-ink-900/10 text-ink-900/50'}`}>
                      {c.status === 'active' ? 'Kích hoạt' : 'Tắt'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => startEdit(c)} className="p-1.5 rounded hover:bg-ink-900/5"><PencilIcon className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(c.id, c.code)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
