'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/dashboard/login');
  }

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
    },
    {
      name: 'Images',
      href: '/dashboard/images',
    },
    {
      name: 'Products',
      href: '/dashboard/products',
    },
    {
      name: 'Posts',
      href: '/dashboard/posts',
    },
    {
      name: 'Users',
      href: '/dashboard/users',
    },
  ];

  function isActive(href) {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }

    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7]">

      {/* Premium Black Header */}
      <header className="sticky top-0 z-50 bg-black text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]">

        <div className="max-w-6xl mx-auto px-6">

          <div className="h-[78px] flex items-center justify-between">

            {/* Brand */}
            <Link
              href="/dashboard"
              className="group flex items-center gap-3"
            >
              <div
                className="
                  relative
                  flex items-center justify-center
                  w-10 h-10
                  rounded-xl
                  bg-white
                  text-black
                  text-lg
                  font-bold
                  shadow-lg
                  transition-all duration-300
                  group-hover:rounded-full
                  group-hover:bg-[#d4af37]
                  group-hover:text-white
                "
              >
                B
              </div>

              <div className="leading-none">
                <div className="text-lg font-bold tracking-tight">
                  Brook
                </div>

                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-1">
                  Dashboard
                </div>
              </div>
            </Link>


            {/* Navigation */}
            <nav
              className="
                hidden md:flex
                items-center
                gap-1
                p-1.5
                rounded-2xl
                bg-white/[0.06]
                border border-white/[0.08]
              "
            >
              {navItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative
                      px-4
                      py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      transition-all
                      duration-300

                      ${
                        active
                          ? `
                            bg-white
                            text-black
                            shadow-[0_4px_15px_rgba(255,255,255,0.08)]
                          `
                          : `
                            text-gray-400
                            hover:text-white
                            hover:bg-white/[0.08]
                          `
                      }
                    `}
                  >
                    {item.name}

                    {active && (
                      <span
                        className="
                          absolute
                          left-1/2
                          -translate-x-1/2
                          bottom-[-5px]
                          w-1.5
                          h-1.5
                          rounded-full
                          bg-[#d4af37]
                          shadow-[0_0_8px_rgba(212,175,55,0.8)]
                        "
                      />
                    )}
                  </Link>
                );
              })}
            </nav>


            {/* Logout */}
            <button
              onClick={handleLogout}
              className="
                group
                flex items-center gap-2
                px-4
                py-2.5
                rounded-xl
                border border-white/10
                bg-white/[0.04]
                text-sm
                font-medium
                text-gray-400

                transition-all
                duration-300

                hover:border-red-500/30
                hover:bg-red-500/10
                hover:text-red-400

                active:scale-95
              "
            >
              <LogOut
                size={16}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                "
              />

              <span>Logout</span>
            </button>

          </div>

        </div>

        {/* Gold accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />

      </header>


      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {children}
      </main>

    </div>
  );
}