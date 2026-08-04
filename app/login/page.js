'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json().catch(() => ({ error: 'Server error' }));
      setLoading(false);
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoading(false);
      setError('Request failed — please try again');
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 relative bg-cover bg-center"
      style={{ backgroundImage: `url('/login-bj.jpg')` }}
    >
      {/* Dark overlay so form stays readable over the artwork */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <form
        onSubmit={handleLogin}
        className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 mb-4">
            <span className="text-3xl font-bold text-white">B</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">Brook Yeshitila</h2>
          <p className="text-gray-300 text-sm mt-1">Gallery Dashboard</p>
        </div>

        <label className="block text-gray-300 mb-2 text-sm">Username</label>
        <input
          className="w-full p-3 rounded-lg mb-4 bg-white/90 text-gray-900 placeholder-gray-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="block text-gray-300 mb-2 text-sm">Password</label>
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            className="w-full p-3 pr-12 rounded-lg bg-white/90 text-gray-900 placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-white text-black font-semibold text-lg hover:bg-[#d4af37] hover:text-white transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Lost your password? Contact your administrator.
        </p>
      </form>
    </main>
  );
}