import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

const sectionMap = {
  '/dashboard/products': 'products',
  '/dashboard/posts': 'posts',
  '/dashboard/images': 'images',
  '/dashboard/users': 'users',
};

export async function middleware(request) {
  const response = NextResponse.next();
  const session = await getIronSession(request, response, sessionOptions);

  // Not logged in at all → send to login
  if (!session.loggedIn && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Logged in, but not super_admin → enforce per-section permissions
  if (session.loggedIn && session.role !== 'super_admin') {
    for (const [path, section] of Object.entries(sectionMap)) {
      if (request.nextUrl.pathname.startsWith(path)) {
        const access = session.permissions?.[section] || 'none';
        if (access === 'none') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: '/dashboard/:path*',
};