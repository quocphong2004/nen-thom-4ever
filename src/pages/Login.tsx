import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    const from = (location.state as any)?.from?.pathname ?? '/';
    navigate(from, { replace: true });
  }

  return (
    <div className="container-page py-16 max-w-md mx-auto">
      <h1 className="font-display text-2xl font-semibold mb-6 text-center">Đăng nhập</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <input required type="email" placeholder="Email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" placeholder="Mật khẩu" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="text-center text-sm text-ink-900/60 mt-4">
        Chưa có tài khoản? <Link to="/dang-ky" className="text-brand-600 font-medium">Đăng ký ngay</Link>
      </p>
    </div>
  );
}
