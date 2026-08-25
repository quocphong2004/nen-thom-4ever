import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate('/dang-nhap'), 2000);
  }

  if (success) {
    return (
      <div className="container-page py-16 max-w-md mx-auto text-center">
        <h1 className="font-display text-2xl font-semibold mb-2">Đăng ký thành công!</h1>
        <p className="text-ink-900/60">Đang chuyển đến trang đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="container-page py-16 max-w-md mx-auto">
      <h1 className="font-display text-2xl font-semibold mb-6 text-center">Tạo tài khoản</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <input required placeholder="Họ và tên" className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input required type="email" placeholder="Email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" placeholder="Mật khẩu (tối thiểu 6 ký tự)" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
        </button>
      </form>
      <p className="text-center text-sm text-ink-900/60 mt-4">
        Đã có tài khoản? <Link to="/dang-nhap" className="text-brand-600 font-medium">Đăng nhập</Link>
      </p>
    </div>
  );
}
