import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { signIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError('Email hoặc mật khẩu không đúng.');
      return;
    }
    // Đợi profile được load rồi kiểm tra quyền — điều hướng vẫn thực hiện,
    // RequireAdmin sẽ tự đá về nếu tài khoản không phải admin.
    navigate('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-900 px-4">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold text-center mb-1">Nến Thơm 4ever</h1>
        <p className="text-center text-sm text-ink-900/50 mb-6">Đăng nhập trang quản trị</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="email" placeholder="Email quản trị" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" placeholder="Mật khẩu" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!isAdmin && email && !error && (
            <p className="text-xs text-ink-900/40">
              Lưu ý: tài khoản phải được cấp quyền admin trong bảng <code>profiles</code>.
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
