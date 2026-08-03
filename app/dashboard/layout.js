export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      <nav className="bg-[#1a1a1a] text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center gap-8 px-6 py-5">
          <span className="text-xl font-bold">B</span>
          <a href="/dashboard" className="font-semibold hover:text-[#d4af37] transition">Dashboard</a>
          <a href="/dashboard/images" className="font-semibold hover:text-[#d4af37] transition">Image</a>
          <a href="/dashboard/products" className="font-semibold hover:text-[#d4af37] transition">Product</a>
          <a href="/dashboard/posts" className="font-semibold hover:text-[#d4af37] transition">Post</a>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}