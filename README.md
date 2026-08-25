# Nến Thơm 4ever — Website Thương mại điện tử

Website bán nến thơm & tinh dầu thủ công. Xây dựng bằng **React + TypeScript + Vite + Tailwind CSS + React Router + Supabase**.

## 1. Cấu trúc dự án

```
src/
├── components/     # Component dùng chung (Header, Footer, ProductCard...)
├── context/        # AuthContext (đăng nhập), CartContext (giỏ hàng)
├── layouts/        # MainLayout (khách hàng), AccountLayout, AdminLayout
├── pages/          # Các trang khách hàng
│   ├── account/     # Trang tài khoản khách hàng
│   └── admin/        # Trang quản trị Admin
├── services/       # Hàm gọi Supabase (products, orders, categories...)
├── types/          # Định nghĩa TypeScript khớp với database
├── utils/          # Hàm tiện ích (format tiền, ngày, slug...)
└── lib/supabase.ts # Khởi tạo Supabase client

supabase/
└── schema.sql      # Toàn bộ câu lệnh SQL tạo bảng + phân quyền (RLS)
```

## 2. Cài đặt phần mềm cần thiết

1. **Node.js** (bản LTS mới nhất): https://nodejs.org
2. **VS Code**: https://code.visualstudio.com
3. **Git**: https://git-scm.com

Kiểm tra đã cài đặt thành công:

```bash
node -v
npm -v
git --version
```

## 3. Tạo project Supabase (miễn phí)

1. Vào https://supabase.com → **New Project**.
2. Đặt tên project (VD: `nen-thom-4ever`), chọn mật khẩu database, chọn region gần Việt Nam (Singapore).
3. Đợi project khởi tạo xong (khoảng 2 phút).
4. Vào **SQL Editor** (menu bên trái) → **New query** → mở file `supabase/schema.sql` trong project này, copy toàn bộ nội dung, dán vào và bấm **Run**.
   - Lệnh này sẽ tạo toàn bộ bảng (products, orders, categories...) và thiết lập phân quyền Admin/Khách hàng.
5. Vào **Storage** (menu bên trái) → **New bucket**:
   - Tạo bucket tên `product-images`, tick **Public bucket**.
   - Tạo bucket tên `banner-images`, tick **Public bucket**.
6. Vào **Project Settings → API**:
   - Copy **Project URL** và **anon public key**, sẽ dùng ở bước tiếp theo.

## 4. Cài đặt project trên máy

```bash
# Giải nén / mở thư mục project trong VS Code, sau đó mở Terminal:
npm install
```

Tạo file `.env` từ mẫu:

```bash
cp .env.example .env
```

Mở file `.env` vừa tạo, dán URL và anon key từ Supabase vào:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxx
```

Chạy project:

```bash
npm run dev
```

Mở trình duyệt tại địa chỉ hiện trong terminal (thường là `http://localhost:5173`).

## 5. Tạo tài khoản Admin đầu tiên

1. Vào website, chọn **Đăng ký** (`/dang-ky`) → tạo 1 tài khoản bất kỳ (VD: `admin@nenthom4ever.com`).
2. Vào lại Supabase → **SQL Editor** → chạy lệnh sau (thay email tương ứng):

```sql
update profiles set role = 'admin' where email = 'admin@nenthom4ever.com';
```

3. Truy cập `/admin/dang-nhap` và đăng nhập bằng tài khoản vừa nâng quyền.

## 6. Nhập dữ liệu mẫu ban đầu

Sau khi đăng nhập trang quản trị (`/admin`), nhập dữ liệu theo thứ tự:

1. **Danh mục** (`/admin/danh-muc`) — VD: Nến thơm, Tinh dầu, Gift Set.
2. **Mùi hương** (`/admin/mui-huong`) — VD: Lavender, Vanilla, Rose, Citrus.
3. **Sản phẩm** (`/admin/san-pham`) — thêm sản phẩm, chọn danh mục/mùi hương, upload hình ảnh, thêm biến thể (khối lượng khác nhau) nếu cần.
4. **Banner** (`/admin/banner`) — upload banner cho trang chủ.
5. **Mã giảm giá** (`/admin/ma-giam-gia`) — tùy chọn.

Sau khi nhập xong, mở lại trang chủ website — dữ liệu sẽ hiển thị ngay mà không cần sửa code hay build lại.

## 7. Các trang chính

### Khách hàng
| Đường dẫn | Mô tả |
|---|---|
| `/` | Trang chủ |
| `/san-pham` | Danh sách sản phẩm (tìm kiếm, lọc, sắp xếp) |
| `/san-pham/:slug` | Chi tiết sản phẩm |
| `/gio-hang` | Giỏ hàng |
| `/thanh-toan` | Thanh toán / đặt hàng |
| `/dang-nhap`, `/dang-ky` | Đăng nhập / Đăng ký |
| `/tai-khoan/*` | Tài khoản: thông tin, địa chỉ, đơn hàng, yêu thích |

### Admin
| Đường dẫn | Mô tả |
|---|---|
| `/admin/dang-nhap` | Đăng nhập quản trị |
| `/admin` | Dashboard tổng quan doanh thu |
| `/admin/san-pham` | Quản lý sản phẩm |
| `/admin/danh-muc`, `/admin/mui-huong` | Quản lý danh mục, mùi hương |
| `/admin/don-hang` | Quản lý đơn hàng, cập nhật trạng thái |
| `/admin/khach-hang` | Quản lý khách hàng |
| `/admin/danh-gia` | Duyệt/ẩn đánh giá |
| `/admin/ma-giam-gia` | Quản lý mã giảm giá |
| `/admin/banner` | Quản lý banner trang chủ |

## 8. Build production & triển khai

```bash
npm run build
```

File build nằm trong thư mục `dist/`. Có thể triển khai lên các nền tảng hosting tĩnh như **Vercel**, **Netlify**, hoặc **Cloudflare Pages** (kéo thả thư mục `dist` hoặc kết nối GitHub repo, nhớ khai báo 2 biến môi trường `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` trong phần cài đặt của hosting).

## 9. Backup source bằng Git

```bash
git init
git add .
git commit -m "Khởi tạo dự án Nến Thơm 4ever"
```

Sau đó tạo repo trên GitHub và đẩy code lên:

```bash
git remote add origin https://github.com/<username>/<ten-repo>.git
git branch -M main
git push -u origin main
```

⚠️ File `.env` đã được thêm vào `.gitignore` — **không commit file này lên Git** vì chứa thông tin kết nối Supabase.

## 10. Đã hoàn thành trong bản MVP này

- Đăng ký / đăng nhập (Supabase Auth), phân quyền Admin/Khách hàng qua RLS.
- Trang chủ: banner, sản phẩm mới/nổi bật/bán chạy, danh mục, mùi hương.
- Danh sách sản phẩm: tìm kiếm, lọc (danh mục, mùi hương, giá), sắp xếp, phân trang.
- Chi tiết sản phẩm: hình ảnh, biến thể, mùi hương, tab mô tả/thành phần/hướng dẫn/đánh giá, sản phẩm liên quan.
- Giỏ hàng (lưu localStorage), thanh toán (COD + chuyển khoản), mã giảm giá.
- Theo dõi trạng thái đơn hàng, lịch sử mua hàng, hủy đơn khi chưa xử lý.
- Đánh giá sản phẩm, wishlist, quản lý địa chỉ giao hàng.
- Admin: Dashboard doanh thu, CRUD sản phẩm/danh mục/mùi hương/mã giảm giá/banner, quản lý đơn hàng, khách hàng, duyệt đánh giá.
- Responsive, mobile-first, có bottom navigation trên di động.
- Loading / Empty / Error state ở các trang dữ liệu động.

## 11. Có thể mở rộng sau (theo tài liệu yêu cầu)

- Cá nhân hóa nến (custom_orders).
- Thanh toán online (cổng thanh toán VNPay/Momo...).
- PWA (Web App Manifest + Service Worker) để "Add to Home Screen".
- Thông báo, chat hỗ trợ, thống kê nâng cao (biểu đồ doanh thu theo ngày/tháng).

## 12. Lưu ý bảo mật

- Không commit `.env` hay bất kỳ secret/API key nào lên Git.
- RLS (Row Level Security) đã được bật cho toàn bộ bảng — khách hàng không thể tự sửa dữ liệu sản phẩm hay đơn hàng của người khác.
- Luôn dùng HTTPS khi triển khai production (Vercel/Netlify tự cấp HTTPS miễn phí).
