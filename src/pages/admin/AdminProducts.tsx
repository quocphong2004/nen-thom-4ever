import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { adminFetchProducts, adminDeleteProduct } from '../../services/productService';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/format';
import { LoadingState, EmptyState } from '../../components/LoadingState';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const data = await adminFetchProducts(search);
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Xóa sản phẩm "${name}"? Hành động này không thể hoàn tác.`)) return;
    await adminDeleteProduct(id);
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-semibold">Sản phẩm</h1>
        <Link to="/admin/san-pham/moi" className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1">
          <PlusIcon className="h-4 w-4" /> Thêm sản phẩm
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2 max-w-sm">
        <input placeholder="Tìm theo tên hoặc mã..." className="input-field" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="submit" className="btn-secondary !px-4 !py-2 text-sm">Tìm</button>
      </form>

      {loading ? (
        <LoadingState />
      ) : products.length === 0 ? (
        <EmptyState title="Chưa có sản phẩm nào" description="Nhấn “Thêm sản phẩm” để bắt đầu." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-900/5 text-left text-xs uppercase text-ink-900/50">
              <tr>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Tồn kho</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-ink-900/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-brand-50 overflow-hidden shrink-0">
                        {p.images?.[0] && <img src={p.images[0].image_url} className="h-full w-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{p.name}</p>
                        <p className="text-xs text-ink-900/40">{p.category?.name ?? 'Chưa phân loại'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-900/60">{p.code}</td>
                  <td className="px-4 py-3">{formatCurrency(p.sale_price ?? p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 5 ? 'text-red-500 font-medium' : ''}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      p.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-ink-900/5 text-ink-900/50'
                    }`}>
                      {p.status === 'active' ? 'Đang bán' : p.status === 'out_of_stock' ? 'Hết hàng' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/san-pham/${p.id}`} className="p-1.5 rounded hover:bg-ink-900/5"><PencilIcon className="h-4 w-4" /></Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><TrashIcon className="h-4 w-4" /></button>
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
