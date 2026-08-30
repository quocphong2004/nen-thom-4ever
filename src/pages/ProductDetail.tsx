import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';
import { fetchProductBySlug, fetchRelatedProducts } from '../services/productService';
import { fetchProductReviews, createReview } from '../services/reviewService';
import { uploadImage } from '../services/storageService';
import { PRODUCT_IMAGE_BUCKET } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Product, ProductVariant, Review } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency, formatDate } from '../utils/format';
import { LoadingState, EmptyState } from '../components/LoadingState';
import ProductCard from '../components/ProductCard';

const TABS = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'ingredients', label: 'Thành phần' },
  { key: 'usage', label: 'Hướng dẫn sử dụng' },
  { key: 'storage', label: 'Bảo quản' },
  { key: 'safety', label: 'Lưu ý an toàn' },
  { key: 'reviews', label: 'Đánh giá' },
] as const;

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('overview');
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { user, profile } = useAuth();

  // Form viết đánh giá
  const [myRating, setMyRating] = useState(5);
  const [myContent, setMyContent] = useState('');
  const [myImageFile, setMyImageFile] = useState<File | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  async function loadProductAndReviews(currentSlug: string) {
    const p = await fetchProductBySlug(currentSlug);
    if (!p) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setProduct(p);
    setSelectedVariant((prev) => p.variants?.find((v) => v.id === prev?.id) ?? p.variants?.[0] ?? null);
    const [rel, rev] = await Promise.all([
      fetchRelatedProducts(p.category_id, p.id),
      fetchProductReviews(p.id),
    ]);
    setRelated(rel);
    setReviews(rev);
    setLoading(false);
  }

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setAdded(false);
    setActiveImage(0);
    setReviewSuccess(false);
    loadProductAndReviews(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) return <LoadingState label="Đang tải sản phẩm..." />;
  if (notFound || !product) {
    return (
      <div className="container-page py-16">
        <EmptyState title="Không tìm thấy sản phẩm" description="Sản phẩm có thể đã bị gỡ hoặc không còn tồn tại." />
        <div className="text-center mt-4">
          <Link to="/san-pham" className="text-brand-600 font-medium hover:underline">Quay lại danh sách sản phẩm</Link>
        </div>
      </div>
    );
  }

  const price = selectedVariant ? selectedVariant.sale_price ?? selectedVariant.price : product.sale_price ?? product.price;
  const originalPrice = selectedVariant ? selectedVariant.price : product.price;
  const hasSale = price < originalPrice;
  const stock = selectedVariant ? selectedVariant.stock : product.stock;
  const outOfStock = stock <= 0 || product.status === 'out_of_stock';
  const images = product.images?.length ? product.images : [];

  function handleAddToCart() {
    if (!product) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !product) return;
    setReviewError('');
    setSubmittingReview(true);
    try {
      let imageUrl: string | null = null;
      if (myImageFile) {
        imageUrl = await uploadImage(PRODUCT_IMAGE_BUCKET, myImageFile);
      }
      await createReview({
        userId: user.id,
        productId: product.id,
        orderId: null,
        rating: myRating,
        content: myContent,
        imageUrl,
      });
      setMyContent('');
      setMyImageFile(null);
      setMyRating(5);
      setReviewSuccess(true);
      await loadProductAndReviews(product.slug);
    } catch (err: any) {
      setReviewError(err.message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="container-page py-8">
      <nav className="text-xs text-ink-900/50 mb-6">
        <Link to="/">Trang chủ</Link> / <Link to="/san-pham">Sản phẩm</Link> / <span className="text-ink-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-brand-50 mb-3">
            {images[activeImage] ? (
              <img src={images[activeImage].image_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-brand-300">Chưa có hình ảnh</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 rounded-lg overflow-hidden ring-2 ${i === activeImage ? 'ring-brand-500' : 'ring-transparent'}`}
                >
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 text-sm text-ink-900/50 mb-4">
            <StarIcon className="h-4 w-4 text-amber-400" />
            {product.rating_avg?.toFixed(1) ?? '0.0'}/5 · {product.rating_count ?? 0} đánh giá
            <span className="mx-1">·</span> Mã: {product.code}
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-bold text-brand-700">{formatCurrency(price)}</span>
            {hasSale && <span className="text-base text-ink-900/40 line-through">{formatCurrency(originalPrice)}</span>}
          </div>

          {product.scents && product.scents.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Mùi hương</p>
              <div className="flex flex-wrap gap-2">
                {product.scents.map((s) => (
                  <span key={s.id} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">{s.name}</span>
                ))}
              </div>
            </div>
          )}

          {product.variants && product.variants.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Khối lượng / dung tích</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`rounded-lg border px-4 py-2 text-sm ${
                      selectedVariant?.id === v.id ? 'border-brand-600 bg-brand-50 text-brand-700 font-medium' : 'border-ink-900/15 text-ink-900/70'
                    }`}
                  >
                    {v.name}{v.weight ? ` (${v.weight})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Số lượng</p>
            <div className="inline-flex items-center rounded-lg border border-ink-900/15">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-2 text-lg">-</button>
              <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))} className="px-4 py-2 text-lg">+</button>
            </div>
            {stock > 0 && stock <= 5 && <p className="text-xs text-amber-600 mt-2">Chỉ còn {stock} sản phẩm</p>}
          </div>

          <div className="flex gap-3">
            <button onClick={handleAddToCart} disabled={outOfStock} className="btn-primary flex-1">
              {outOfStock ? 'Hết hàng' : added ? 'Đã thêm vào giỏ ✓' : 'Thêm vào giỏ hàng'}
            </button>
          </div>

          {product.short_description && (
            <p className="text-sm text-ink-900/60 mt-6 leading-relaxed">{product.short_description}</p>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="mt-12">
        <div className="flex gap-1 overflow-x-auto border-b border-ink-900/10 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 -mb-px ${
                tab === t.key ? 'border-brand-600 text-brand-700 font-medium' : 'border-transparent text-ink-900/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-w-3xl text-sm leading-relaxed text-ink-900/70 whitespace-pre-line">
          {tab === 'overview' && (product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.')}
          {tab === 'ingredients' && (product.ingredients || 'Chưa có thông tin thành phần.')}
          {tab === 'usage' && (product.usage_instructions || 'Chưa có hướng dẫn sử dụng.')}
          {tab === 'storage' && (product.storage_instructions || 'Chưa có hướng dẫn bảo quản.')}
          {tab === 'safety' && (product.safety_notes || 'Chưa có lưu ý an toàn.')}
          {tab === 'reviews' && (
            <div className="space-y-6">
              {/* Form viết đánh giá */}
              <div className="card p-4 not-prose">
                <h3 className="font-medium text-ink-900 mb-3">Viết đánh giá của bạn</h3>
                {!user ? (
                  <p className="text-sm">
                    <Link to="/dang-nhap" className="text-brand-600 font-medium hover:underline">Đăng nhập</Link> để viết đánh giá cho sản phẩm này.
                  </p>
                ) : reviewSuccess ? (
                  <p className="text-sm text-green-600">Cảm ơn bạn đã đánh giá! Đánh giá của bạn đã được đăng.</p>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-ink-900/60">Chấm điểm:</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button type="button" key={i} onClick={() => setMyRating(i + 1)}>
                            <StarIcon className={`h-6 w-6 ${i < myRating ? 'text-amber-400' : 'text-ink-900/15'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      required
                      placeholder={`Cảm nhận của bạn về ${profile?.full_name ?? 'sản phẩm'}...`}
                      className="input-field"
                      rows={3}
                      value={myContent}
                      onChange={(e) => setMyContent(e.target.value)}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="input-field text-xs"
                      onChange={(e) => setMyImageFile(e.target.files?.[0] ?? null)}
                    />
                    {reviewError && <p className="text-sm text-red-500">{reviewError}</p>}
                    <button type="submit" disabled={submittingReview} className="btn-primary !py-2 !px-5 text-sm">
                      {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </form>
                )}
              </div>

              {reviews.length === 0 ? (
                <p>Chưa có đánh giá nào cho sản phẩm này.</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-ink-900">{r.profile?.full_name ?? 'Khách hàng'}</p>
                      <p className="text-xs text-ink-900/40">{formatDate(r.created_at)}</p>
                    </div>
                    <div className="flex mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className={`h-4 w-4 ${i < r.rating ? 'text-amber-400' : 'text-ink-900/15'}`} />
                      ))}
                    </div>
                    {r.content && <p>{r.content}</p>}
                    {r.image_url && <img src={r.image_url} alt="" className="mt-2 h-24 w-24 object-cover rounded-lg" />}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-semibold mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}