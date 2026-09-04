import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brand } from '../components/ui';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <Navigate
        to={user.role === 'SUPER_ADMIN' ? '/super-admin/restaurants' : '/app'}
        replace
      />
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = await login(email, password);
      if (!remember) {
        // token already in localStorage; remember is UI-only for V1
      }
      nav(u.role === 'SUPER_ADMIN' ? '/super-admin/restaurants' : '/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div
        className="hidden lg:flex relative overflow-hidden items-end p-10 text-white"
        style={{
          background:
            'linear-gradient(160deg, rgba(11,27,58,0.85), rgba(37,99,235,0.55)), url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80) center/cover',
        }}
      >
        <div>
          <Brand light />
          <h1 className="text-4xl font-bold mt-8 leading-tight">
            Smart billing for
            <br />
            modern restaurants
          </h1>
          <p className="mt-3 text-blue-100 max-w-md">
            Manage menus, orders, kitchen tickets, invoices, and reports in one multi-tenant system.
          </p>
        </div>
      </div>

      <div className="grid place-items-center p-6 bg-white">
        <form onSubmit={submit} className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:justify-start">
            <Brand full />
          </div>
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-[var(--rb-muted)] mt-2 mb-8">Sign in to continue to RestoPilot</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 text-red-700 border border-red-100 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            className="input mb-4"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
          />

          <label className="block text-sm font-medium mb-1.5">Password</label>
          <input
            className="input mb-4"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <label className="flex items-center gap-2 text-sm text-slate-600 mb-6">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>

          <button className="btn btn-primary w-full py-3" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
