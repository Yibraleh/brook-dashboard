'use client';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      {/* Branded header with artwork background */}
      <nav
        className="relative sticky top-0 z-50 bg-cover bg-center"
        style={{ backgroundImage: `url('/dashboard.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-white">B</span>
            <a href="/dashboard" className="font-semibold text-white hover:text-[#d4af37] transition">Dashboard</a>
            <a href="/dashboard/images" className="font-semibold text-white hover:text-[#d4af37] transition">Image</a>
            <a href="/dashboard/products" className="font-semibold text-white hover:text-[#d4af37] transition">Product</a>
            <a href="/dashboard/posts" className="font-semibold text-white hover:text-[#d4af37] transition">Post</a>
          </div>
          <button onClick={handleLogout} className="text-sm text-white hover:text-[#d4af37]">Logout</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}