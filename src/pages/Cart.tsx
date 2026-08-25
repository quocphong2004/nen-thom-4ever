import { Link, useNavigate } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useCart, getPrice } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { EmptyState } from '../components/LoadingState';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState title="Giỏ hàng của bạn đang trống" description="Hãy khám phá các sản phẩm nến thơm và tinh dầu của chúng tôi." />
        <div className="text-center mt-6">
          <Link to="/san-pham" className="btn-primary">Tiếp tục mua sắm</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl font-semibold mb-8">Giỏ hàng</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-4">
          {items.map((item) => {
            const key = `${item.product.id}-${item.variant?.id ?? 'default'}`;
            const price = getPrice(item.product, item.variant);
            const image = item.product.images?.[0]?.image_url;
            return (
              <div key={key} className="card p-4 flex gap-4">
                <Link to={`/san-pham/${item.product.slug}`} className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-brand-50">
                  {image && <img src={image} alt="" className="h-full w-full object-cover" />}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/san-pham/${item.product.slug}`} className="font-medium text-sm line-clamp-1">{item.product.name}</Link>
                  {item.variant && <p className="text-xs text-ink-900/50 mt-0.5">{item.variant.name}</p>}
                  <p className="text-brand-700 font-semibold mt-1">{formatCurrency(price)}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="inline-flex items-center rounded-lg border border-ink-900/15">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.variant?.id ?? null, item.quantity - 1)}
                        className="px-3 py-1 text-base"
                      >-</button>
                      <span className="px-3 py-1 text-sm min-w-[2rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.variant?.id ?? null, item.quantity + 1)}
                        className="px-3 py-1 text-base"
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.variant?.id ?? null)}
                      className="text-ink-900/40 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card p-6 h-fit">
          <h2 className="font-medium mb-4">Tóm tắt đơn hàng</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-ink-900/60">Tạm tính</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <p className="text-xs text-ink-900/40 mb-4">Phí vận chuyển và mã giảm giá sẽ được tính ở bước thanh toán.</p>
          <div className="border-t border-ink-900/10 pt-4 flex justify-between font-semibold mb-6">
            <span>Tổng cộng</span>
            <span className="text-brand-700">{formatCurrency(subtotal)}</span>
          </div>
          <button onClick={() => navigate('/thanh-toan')} className="btn-primary w-full">
            Tiến hành đặt hàng
          </button>
        </div>
      </div>
    </div>
  );
}
