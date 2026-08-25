import { useEffect, useState } from 'react';
import { adminFetchCustomers, adminToggleCustomerActive } from '../../services/customerService';
import type { Profile } from '../../types';
import { formatDate } from '../../utils/format';
import { LoadingState, EmptyState } from '../../components/LoadingState';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const data = await adminFetchCustomers();
    setCustomers(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(id: string, current: boolean) {
    await adminToggleCustomerActive(id, !current);
    load();
  }

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Quản lý khách hàng</h1>

      <input
        placeholder="Tìm theo tên, email, số điện thoại..."
        className="input-field max-w-sm mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState title="Chưa có khách hàng nào" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/5 text-left text-xs text-ink-900/50 uppercase">
              <tr>
                <th className="px-4 py-3">Họ tên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Ngày đăng ký</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-ink-900/5">
                  <td className="px-4 py-3 font-medium">{c.full_name ?? '(Chưa cập nhật)'}</td>
                  <td className="px-4 py-3 text-ink-900/60">{c.email}</td>
                  <td className="px-4 py-3 text-ink-900/60">{c.phone ?? '-'}</td>
                  <td className="px-4 py-3 text-ink-900/60">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs rounded-full px-2 py-1 ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.is_active ? 'Đang hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleToggle(c.id, c.is_active)} className="text-xs font-medium text-brand-600 hover:underline">
                      {c.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                    </button>
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
