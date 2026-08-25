import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';
import type { Product } from '../types';
import { formatCurrency } from '../utils/format';

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0]?.image_url;
  const hasSale = product.sale_price != null && product.sale_price < product.price;
  const outOfStock = product.status === 'out_of_stock' || product.stock <= 0;

  return (
    <Link to={`/san-pham/${product.slug}`} className="card group overflow-hidden block">
      <div className="relative aspect-square bg-brand-50 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-brand-300 text-sm">
            Chưa có hình ảnh
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_new && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">Mới</span>}
          {product.is_best_seller && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">Bán chạy</span>}
          {hasSale && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">Giảm giá</span>}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">Hết hàng</span>
          </div>
        )}
      </div>
      <div className="p-4">
        {product.category && (
          <p className="text-[11px] uppercase tracking-wide text-brand-500 mb-1">{product.category.name}</p>
        )}
        <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
        <div className="mt-2 flex items-center gap-1 text-xs text-ink-900/50">
          <StarIcon className="h-4 w-4 text-amber-400" />
          {product.rating_avg?.toFixed(1) ?? '0.0'} ({product.rating_count ?? 0})
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-semibold text-brand-700">
            {formatCurrency(hasSale ? product.sale_price! : product.price)}
          </span>
          {hasSale && (
            <span className="text-xs text-ink-900/40 line-through">{formatCurrency(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
