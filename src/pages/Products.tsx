import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/productService';
import { fetchCategories, fetchScents } from '../services/categoryService';
import type { Product, Category, Scent, ProductFilters } from '../types';
import ProductCard from '../components/ProductCard';
import { LoadingState, EmptyState } from '../components/LoadingState';

const PAGE_SIZE = 12;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [scents, setScents] = useState<Scent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') ?? '';
  const categorySlug = searchParams.get('category') ?? '';
  const scentSlug = searchParams.get('scent') ?? '';
  const priceRange = searchParams.get('price') ?? '';
  const sort = (searchParams.get('sort') as ProductFilters['sort']) ?? 'newest';
  const isNew = searchParams.get('new') === '1';
  const isFeatured = searchParams.get('featured') === '1';
  const isBestSeller = searchParams.get('best_seller') === '1';
  const page = Number(searchParams.get('page') ?? '1');

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchScents().then(setScents).catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const category = categories.find((c) => c.slug === categorySlug);
      const scent = scents.find((s) => s.slug === scentSlug);
      let minPrice: number | undefined;
      let maxPrice: number | undefined;
      if (priceRange === 'under100') maxPrice = 100000;
      if (priceRange === '100-200') { minPrice = 100000; maxPrice = 200000; }
      if (priceRange === 'over200') minPrice = 200000;

      try {
        const result = await fetchProducts({
          search,
          categoryId: category?.id,
          scentId: scent?.id,
          minPrice,
          maxPrice,
          isNew,
          isFeatured,
          isBestSeller,
          sort,
          page,
          pageSize: PAGE_SIZE,
        });
        setProducts(result.products);
        setTotal(result.total);
      } catch {
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categorySlug, scentSlug, priceRange, sort, isNew, isFeatured, isBestSeller, page, categories, scents]);

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl font-semibold mb-2">Sản phẩm</h1>
      <p className="text-ink-900/50 text-sm mb-6">{total} sản phẩm</p>

      <button
        className="lg:hidden btn-secondary !py-2 !px-4 text-xs mb-4"
        onClick={() => setFiltersOpen((v) => !v)}
      >
        {filtersOpen ? 'Ẩn bộ lọc' : 'Bộ lọc & sắp xếp'}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block space-y-6`}>
          <div className="card p-4">
            <h3 className="font-medium text-sm mb-3">Danh mục</h3>
            <div className="space-y-2">
              <button onClick={() => updateParam('category', null)} className={`block text-sm ${!categorySlug ? 'text-brand-600 font-medium' : 'text-ink-900/60'}`}>
                Tất cả
              </button>
              {categories.map((c) => (
                <button key={c.id} onClick={() => updateParam('category', c.slug)} className={`block text-sm ${categorySlug === c.slug ? 'text-brand-600 font-medium' : 'text-ink-900/60'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-medium text-sm mb-3">Mùi hương</h3>
            <div className="space-y-2">
              <button onClick={() => updateParam('scent', null)} className={`block text-sm ${!scentSlug ? 'text-brand-600 font-medium' : 'text-ink-900/60'}`}>
                Tất cả
              </button>
              {scents.map((s) => (
                <button key={s.id} onClick={() => updateParam('scent', s.slug)} className={`block text-sm ${scentSlug === s.slug ? 'text-brand-600 font-medium' : 'text-ink-900/60'}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-medium text-sm mb-3">Khoảng giá</h3>
            <div className="space-y-2">
              {[
                { key: '', label: 'Tất cả' },
                { key: 'under100', label: 'Dưới 100.000đ' },
                { key: '100-200', label: '100.000đ - 200.000đ' },
                { key: 'over200', label: 'Trên 200.000đ' },
              ].map((opt) => (
                <button key={opt.key} onClick={() => updateParam('price', opt.key || null)} className={`block text-sm ${priceRange === opt.key ? 'text-brand-600 font-medium' : 'text-ink-900/60'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="flex justify-end mb-4">
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="input-field !w-auto text-sm"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
              <option value="best_selling">Bán chạy</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>

          {loading ? (
            <LoadingState />
          ) : products.length === 0 ? (
            <EmptyState title="Không tìm thấy sản phẩm phù hợp" description="Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm." />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateParam('page', String(p))}
                      className={`h-9 w-9 rounded-full text-sm ${p === page ? 'bg-brand-600 text-white' : 'bg-white text-ink-900/70 ring-1 ring-ink-900/10'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
