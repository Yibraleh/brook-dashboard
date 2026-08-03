'use client';
import { useEffect, useState } from 'react';

export default function DashboardHome() {
  const [stats, setStats] = useState({ products: 0, posts: 0, images: 0 });

  useEffect(() => {
    async function loadStats() {
      const [p, po, m] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/posts').then(r => r.json()),
        fetch('/api/media').then(r => r.json()),
      ]);
      setStats({
        products: Array.isArray(p) ? p.length : 0,
        posts: Array.isArray(po) ? po.length : 0,
        images: Array.isArray(m) ? m.length : 0,
      });
    }
    loadStats();
  }, []);

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#1a1a1a]">👋 Welcome back, Brook</h1>
        <p className="text-gray-500 mt-2">Manage your gallery content from one place</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Products', value: stats.products },
          { label: 'Blog Posts', value: stats.posts },
          { label: 'Media Files', value: stats.images },
        ].map((s) => (
          <div key={s.label} className="bg-[#1a1a1a] text-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm opacity-70 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[
          { title: 'Image', href: '/dashboard/images', icon: '🖼️' },
          { title: 'Product', href: '/dashboard/products', icon: '🛍️' },
          { title: 'Post', href: '/dashboard/posts', icon: '📝' },
        ].map((card) => (
          <a
            key={card.title}
            href={card.href}
            className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <div className="text-4xl mb-3">{card.icon}</div>
            <h2 className="text-xl font-semibold text-[#1a1a1a]">{card.title}</h2>
          </a>
        ))}
      </div>
    </div>
  );
}