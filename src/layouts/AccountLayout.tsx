import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/tai-khoan/thong-tin', label: 'Thông tin cá nhân' },
  { to: '/tai-khoan/dia-chi', label: 'Địa chỉ' },
  { to: '/tai-khoan/don-hang', label: 'Đơn hàng' },
  { to: '/tai-khoan/yeu-thich', label: 'Sản phẩm yêu thích' },
];

export default function AccountLayout() {
  const { profile, signOut } = useAuth();

  return (
    <div className="container-page py-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
      <aside className="card p-4 h-fit">
        <p className="font-medium mb-4 px-2">{profile?.full_name ?? 'Tài khoản của tôi'}</p>
        <nav className="space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-brand-50 text-brand-700 font-medium' : 'text-ink-900/70 hover:bg-ink-900/5'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={() => signOut()}
            className="w-full text-left rounded-lg px-3 py-2 text-sm text-ink-900/70 hover:bg-ink-900/5"
          >
            Đăng xuất
          </button>
        </nav>
      </aside>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
