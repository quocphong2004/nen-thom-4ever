import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-white/80 mt-16 pb-16 md:pb-0">
      <div className="container-page py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-xl text-white mb-3">Nến Thơm 4ever</h3>
          <p className="text-sm leading-relaxed">
            Nến thơm & tinh dầu thủ công — thắp lên không gian thư giãn cho tổ ấm của bạn.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Mua sắm</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/san-pham" className="hover:text-brand-300">Tất cả sản phẩm</Link></li>
            <li><Link to="/san-pham?featured=1" className="hover:text-brand-300">Sản phẩm nổi bật</Link></li>
            <li><Link to="/san-pham?best_seller=1" className="hover:text-brand-300">Bán chạy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/tai-khoan/don-hang" className="hover:text-brand-300">Theo dõi đơn hàng</Link></li>
            <li><Link to="/dang-nhap" className="hover:text-brand-300">Đăng nhập / Đăng ký</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Liên hệ</h4>
          <p className="text-sm">Hotline: 1900 0000</p>
          <p className="text-sm">Email: hello@nenthom4ever.vn</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Nến Thơm 4ever. All rights reserved.
      </div>
    </footer>
  );
}
