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

  return (
    <div className="min-h-screen flex bg-ink-50">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-ink-900 text-white/80 p-4">
        <div className="font-display text-xl text-white mb-6 px-2">Nến Thơm 4ever <span className="text-brand-400 text-sm">Admin</span></div>
        <nav className="space-y-1 flex-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
