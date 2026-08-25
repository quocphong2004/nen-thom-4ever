import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, Squares2X2Icon, ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';

const items = [
  { to: '/', label: 'Trang chủ', icon: HomeIcon },
  { to: '/san-pham', label: 'Sản phẩm', icon: Squares2X2Icon },
  { to: '/gio-hang', label: 'Giỏ hàng', icon: ShoppingBagIcon },
  { to: '/tai-khoan/don-hang', label: 'Tài khoản', icon: UserIcon },
];

export default function BottomNav() {
  const location = useLocation();
  const { totalQuantity } = useCart();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink-900/10 grid grid-cols-4">
      {items.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`relative flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] ${
              active ? 'text-brand-600' : 'text-ink-900/50'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
            {to === '/gio-hang' && totalQuantity > 0 && (
              <span className="absolute top-1 right-1/3 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                {totalQuantity}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
