import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  ChartBarIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  TagIcon,
  TicketIcon,
  Squares2X2Icon,
  PhotoIcon,
  StarIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Tổng quan', icon: ChartBarIcon, end: true },
  { to: '/admin/san-pham', label: 'Sản phẩm', icon: CubeIcon },
  { to: '/admin/danh-muc', label: 'Danh mục', icon: Squares2X2Icon },
  { to: '/admin/mui-huong', label: 'Mùi hương', icon: TagIcon },
  { to: '/admin/don-hang', label: 'Đơn hàng', icon: ClipboardDocumentListIcon },
  { to: '/admin/khach-hang', label: 'Khách hàng', icon: UsersIcon },
  { to: '/admin/danh-gia', label: 'Đánh giá', icon: StarIcon },
  { to: '/admin/ma-giam-gia', label: 'Mã giảm giá', icon: TicketIcon },
  { to: '/admin/banner', label: 'Banner', icon: PhotoIcon },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="font-display text-xl text-white mb-6 px-2">
        Nến Thơm 4ever <span className="text-brand-400 text-sm">Admin</span>
      </div>
      <nav className="space-y-1 flex-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                isActive ? 'bg-brand-600 text-white' : 'hover:bg-white/5'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 pt-4 mt-4">
        <p className="text-xs text-white/50 px-2 mb-2">{profile?.full_name ?? 'Admin'}</p>
        <button onClick={() => signOut()} className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-white/5">
          Đăng xuất
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-ink-50">
      {/* Sidebar cố định trên desktop */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-ink-900 text-white/80 p-4">
        {sidebarContent}
      </aside>

      {/* Overlay + drawer trượt ra trên mobile */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative z-50 w-64 max-w-[80%] flex flex-col bg-ink-900 text-white/80 p-4">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
              aria-label="Đóng menu"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Thanh header có nút hamburger, chỉ hiện trên mobile */}
        <header className="md:hidden flex items-center justify-between bg-ink-900 text-white px-4 py-3 sticky top-0 z-30">
          <span className="font-display text-lg">
            Nến Thơm 4ever <span className="text-brand-400 text-sm">Admin</span>
          </span>
          <button onClick={() => setMenuOpen(true)} aria-label="Mở menu">
            <Bars3Icon className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
