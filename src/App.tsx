import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import MainLayout from './layouts/MainLayout';
import AccountLayout from './layouts/AccountLayout';
import AdminLayout from './layouts/AdminLayout';
import { RequireAuth, RequireAdmin } from './components/ProtectedRoute';

// Khách hàng
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';

// Tài khoản khách hàng
import Profile from './pages/account/Profile';
import Addresses from './pages/account/Addresses';
import Orders from './pages/account/Orders';
import OrderDetail from './pages/account/OrderDetail';
import Wishlist from './pages/account/Wishlist';

// Admin
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminScents from './pages/admin/AdminScents';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminBanners from './pages/admin/AdminBanners';

function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-semibold mb-2">404</h1>
      <p className="text-ink-900/50">Trang bạn tìm không tồn tại.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* ---------- KHÁCH HÀNG ---------- */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/san-pham" element={<Products />} />
              <Route path="/san-pham/:slug" element={<ProductDetail />} />
              <Route path="/gio-hang" element={<Cart />} />
              <Route path="/thanh-toan" element={<Checkout />} />
              <Route path="/dat-hang-thanh-cong/:orderId" element={<OrderSuccess />} />
              <Route path="/dang-nhap" element={<Login />} />
              <Route path="/dang-ky" element={<Register />} />

              {/* Tài khoản khách hàng (cần đăng nhập) */}
              <Route
                path="/tai-khoan"
                element={
                  <RequireAuth>
                    <AccountLayout />
                  </RequireAuth>
                }
              >
                <Route path="thong-tin" element={<Profile />} />
                <Route path="dia-chi" element={<Addresses />} />
                <Route path="don-hang" element={<Orders />} />
                <Route path="don-hang/:orderId" element={<OrderDetail />} />
                <Route path="yeu-thich" element={<Wishlist />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>

            {/* ---------- ADMIN ---------- */}
            <Route path="/admin/dang-nhap" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="san-pham" element={<AdminProducts />} />
              <Route path="san-pham/:productId" element={<AdminProductForm />} />
              <Route path="danh-muc" element={<AdminCategories />} />
              <Route path="mui-huong" element={<AdminScents />} />
              <Route path="don-hang" element={<AdminOrders />} />
              <Route path="don-hang/:orderId" element={<AdminOrderDetail />} />
              <Route path="khach-hang" element={<AdminCustomers />} />
              <Route path="danh-gia" element={<AdminReviews />} />
              <Route path="ma-giam-gia" element={<AdminCoupons />} />
              <Route path="banner" element={<AdminBanners />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
