import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, ShoppingBagIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { totalQuantity } = useCart();
  const { user, profile, signOut } = useAuth();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/san-pham?search=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-ink-900/5">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="font-display text-2xl font-bold text-brand-700 shrink-0">
          Nến Thơm <span className="text-brand-500">4ever</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-900/80">
          <Link to="/san-pham" className="hover:text-brand-600">Sản phẩm</Link>
          <Link to="/san-pham?category=nen-thom" className="hover:text-brand-600">Nến thơm</Link>
          <Link to="/san-pham?category=tinh-dau" className="hover:text-brand-600">Tinh dầu</Link>
          <Link to="/san-pham?featured=1" className="hover:text-brand-600">Nổi bật</Link>
        </nav>

        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm items-center gap-2 rounded-full border border-ink-900/10 px-4 py-2">
          <MagnifyingGlassIcon className="h-4 w-4 text-ink-900/40 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm nến, tinh dầu, mùi hương..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/gio-hang" className="relative p-2 hover:text-brand-600">
            <ShoppingBagIcon className="h-6 w-6" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {totalQuantity}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/tai-khoan/don-hang" className="p-2 hover:text-brand-600" title={profile?.full_name ?? 'Tài khoản'}>
                <UserIcon className="h-6 w-6" />
              </Link>
              <button onClick={() => signOut()} className="text-xs text-ink-900/60 hover:text-brand-600">
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/dang-nhap" className="hidden md:inline-flex btn-secondary !px-4 !py-2 text-xs">
              Đăng nhập
            </Link>
          )}

          <button className="md:hidden p-2" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-ink-900/5 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-full border border-ink-900/10 px-4 py-2">
            <MagnifyingGlassIcon className="h-4 w-4 text-ink-900/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </form>
          <Link to="/san-pham" onClick={() => setMenuOpen(false)} className="block py-1 text-sm font-medium">Sản phẩm</Link>
          <Link to="/san-pham?featured=1" onClick={() => setMenuOpen(false)} className="block py-1 text-sm font-medium">Nổi bật</Link>
          {user ? (
            <>
              <Link to="/tai-khoan/don-hang" onClick={() => setMenuOpen(false)} className="block py-1 text-sm font-medium">Tài khoản</Link>
              <button onClick={() => { signOut(); setMenuOpen(false); }} className="block py-1 text-sm font-medium text-left">Đăng xuất</button>
            </>
          ) : (
            <Link to="/dang-nhap" onClick={() => setMenuOpen(false)} className="block py-1 text-sm font-medium">Đăng nhập</Link>
          )}
        </div>
      )}
    </header>
  );
}
