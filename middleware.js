import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export async function middleware(request) {
  const response = NextResponse.next();
  const session = await getIronSession(request, response, sessionOptions);

  if (!session.loggedIn && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: '/dashboard/:path*',
};