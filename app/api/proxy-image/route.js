import { NextResponse } from 'next/server';
import { hasPostsAccess } from '@/lib/requirePostsAccess';

export const runtime = 'nodejs';

export async function GET(req) {
  if (!(await hasPostsAccess())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url).searchParams.get('url');
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol) ||
        /^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname)) {
      return NextResponse.json({ error: 'Bad URL' }, { status: 400 });
    }
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: u.origin },
      signal: AbortSignal.timeout(15000),
    });
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !type.startsWith('image/')) {
      return NextResponse.json({ error: 'Not an image' }, { status: 400 });
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'Too large' }, { status: 413 });
    }
    return new NextResponse(buf, { headers: { 'Content-Type': type } });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}