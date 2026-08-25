import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/productService';
import { fetchCategories, fetchScents } from '../services/categoryService';
import { fetchBanners } from '../services/bannerService';
import type { Product, Category, Scent, Banner } from '../types';
import ProductCard from '../components/ProductCard';
import { LoadingState, EmptyState } from '../components/LoadingState';

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [scents, setScents] = useState<Scent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [b, n, s, f, c, sc] = await Promise.all([
        fetchBanners('hero').catch(() => []),
        fetchProducts({ isNew: true, pageSize: 4 }).catch(() => ({ products: [] })),
        fetchProducts({ isBestSeller: true, pageSize: 4 }).catch(() => ({ products: [] })),
        fetchProducts({ isFeatured: true, pageSize: 8 }).catch(() => ({ products: [] })),
        fetchCategories().catch(() => []),
        fetchScents().catch(() => []),
      ]);
      setBanners(b);
      setNewProducts(n.products);
      setBestSellers(s.products);
      setFeatured(f.products);
      setCategories(c);
      setScents(sc);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingState label="Đang tải trang chủ..." />;

  const hero = banners[0];

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-brand-100 overflow-hidden">
        <div className="container-page py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-brand-600 font-medium tracking-wide uppercase text-xs mb-3">Handmade · 100% thiên nhiên</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink-900 leading-tight mb-4">
              Thắp sáng không gian, <br /> lan tỏa hương thơm
            </h1>
            <p className="text-ink-900/60 mb-8 max-w-md">
              Nến thơm và tinh dầu thủ công, chọn lọc từ nguyên liệu tự nhiên — món quà thư giãn cho tổ ấm của bạn.
            </p>
            <div className="flex gap-3">
              <Link to="/san-pham" className="btn-primary">Mua sắm ngay</Link>
              <Link to="/san-pham?featured=1" className="btn-secondary">Sản phẩm nổi bật</Link>
            </div>
          </div>
          <div className="aspect-square rounded-3xl bg-white/60 overflow-hidden">
            {hero?.image_url ? (
              <img src={hero.image_url} alt={hero.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-brand-400">
                🕯️ Banner sẽ hiển thị tại đây (Admin thêm trong mục Banner)
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DANH MỤC */}
      {categories.length > 0 && (
        <section className="container-page py-12">
          <h2 className="font-display text-2xl font-semibold mb-6">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link key={c.id} to={`/san-pham?category=${c.slug}`} className="card p-6 text-center hover:shadow-md transition">
                <p className="font-medium">{c.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SẢN PHẨM NỔI BẬT */}
      <section className="container-page py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold">Sản phẩm nổi bật</h2>
          <Link to="/san-pham?featured=1" className="text-sm text-brand-600 font-medium hover:underline">Xem tất cả</Link>
        </div>
        {featured.length === 0 ? (
          <EmptyState title="Chưa có sản phẩm nổi bật" description="Admin có thể đánh dấu sản phẩm nổi bật trong trang quản trị." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* SẢN PHẨM MỚI */}
      {newProducts.length > 0 && (
        <section className="container-page py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold">Sản phẩm mới</h2>
            <Link to="/san-pham?new=1" className="text-sm text-brand-600 font-medium hover:underline">Xem tất cả</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* BÁN CHẠY */}
      {bestSellers.length > 0 && (
        <section className="container-page py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold">Bán chạy nhất</h2>
            <Link to="/san-pham?best_seller=1" className="text-sm text-brand-600 font-medium hover:underline">Xem tất cả</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* MÙI HƯƠNG */}
      {scents.length > 0 && (
        <section className="bg-brand-50 py-12">
          <div className="container-page">
            <h2 className="font-display text-2xl font-semibold mb-6">Nhóm mùi hương</h2>
            <div className="flex flex-wrap gap-3">
              {scents.map((s) => (
                <Link key={s.id} to={`/san-pham?scent=${s.slug}`} className="rounded-full bg-white px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition">
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BRAND STORY */}
      <section className="container-page py-16 text-center max-w-2xl mx-auto">
        <h2 className="font-display text-2xl font-semibold mb-4">Về Nến Thơm 4ever</h2>
        <p className="text-ink-900/60 leading-relaxed">
          Chúng tôi tin rằng một mùi hương đúng có thể thay đổi cả không gian sống. Mỗi sản phẩm đều được
          làm thủ công từ sáp thiên nhiên và tinh dầu nguyên chất, mang đến trải nghiệm thư giãn trọn vẹn cho bạn và những người thân yêu.
        </p>
      </section>
    </div>
  );
}
