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
      {/* Branded header */}
      <nav className="sticky top-0 z-50 bg-black">
        <div className="relative max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
          <span className="text-xl font-bold text-white">Brook</span>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
            <a href="/dashboard" className="font-semibold text-white hover:text-[#d4af37] transition">Dashboard</a>
            <a href="/dashboard/images" className="font-semibold text-white hover:text-[#d4af37] transition">Image</a>
            <a href="/dashboard/products" className="font-semibold text-white hover:text-[#d4af37] transition">Product</a>
            <a href="/dashboard/posts" className="font-semibold text-white hover:text-[#d4af37] transition">Post</a>
            <a href="/dashboard/users" className="font-semibold text-white hover:text-[#d4af37] transition">Users</a>
          </div>

          <button onClick={handleLogout} className="text-sm text-white hover:text-[#d4af37]">Logout</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}