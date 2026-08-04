'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ImageIcon,
  Package,
  FileText,
  ArrowRight,
} from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    products: 0,
    posts: 0,
    images: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats({
          products: data.products || 0,
          posts: data.posts || 0,
          images: data.images || 0,
        });
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const cards = [
    {
      title: 'Products',
      value: stats.products,
      href: '/dashboard/products',
      color: 'from-blue-500 to-cyan-500',
      icon: <Package size={30} />,
    },
    {
      title: 'Blog Posts',
      value: stats.posts,
      href: '/dashboard/posts',
      color: 'from-purple-500 to-pink-500',
      icon: <FileText size={30} />,
    },
    {
      title: 'Media Files',
      value: stats.images,
      href: '/dashboard/images',
      color: 'from-orange-500 to-red-500',
      icon: <ImageIcon size={30} />,
    },
  ];

  const actions = [
    {
      title: 'Manage Images',
      desc: 'Upload and organize gallery images.',
      href: '/dashboard/images',
      icon: <ImageIcon size={34} />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Manage Products',
      desc: 'Create and edit WooCommerce products.',
      href: '/dashboard/products',
      icon: <Package size={34} />,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Manage Posts',
      desc: 'Write and publish blog articles.',
      href: '/dashboard/posts',
      icon: <FileText size={34} />,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-10">

      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 p-10 text-white shadow-2xl">
        <p className="text-blue-200 font-medium">
          Welcome back 👋
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Brook Dashboard
        </h1>

        <p className="mt-3 max-w-2xl text-slate-300">
          Manage products, media files, and blog content from one beautiful
          dashboard.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="block overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div className={`h-2 bg-gradient-to-r ${card.color}`} />

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-4xl font-bold text-gray-900">
                    {loading ? (
                      <span className="inline-block w-10 h-8 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      card.value
                    )}
                  </h2>
                </div>

                <div className={`rounded-xl p-4 bg-gradient-to-r ${card.color} text-white shadow-lg`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Quick Actions
          </h2>

          <p className="text-gray-500">
            Choose what you would like to manage.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
            >
              <div className={`inline-flex rounded-2xl p-4 ${action.color}`}>
                {action.icon}
              </div>

              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                {action.title}
              </h3>

              <p className="mt-3 text-gray-500">
                {action.desc}
              </p>

              <div className="mt-8 flex items-center gap-2 font-medium text-blue-600">
                Open
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}