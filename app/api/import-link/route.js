import { NextResponse } from 'next/server';
import { parseHTML } from 'linkedom';
import { Readability } from '@mozilla/readability';
import sanitizeHtml from 'sanitize-html';
import { hasPostsAccess } from '@/lib/requirePostsAccess';

export const runtime = 'nodejs';
export const maxDuration = 30;

function isSafeUrl(str) {
  try {
    const u = new URL(str);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    const h = u.hostname;
    if (h === 'localhost' || /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) return false;
    return true;
  } catch {
    return false;
  }
}

function abs(src, base) {
  try { return new URL(src, base).href; } catch { return null; }
}

export async function POST(req) {
  if (!(await hasPostsAccess())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url || !isSafeUrl(url)) {
      return NextResponse.json({ error: 'Please enter a valid link.' }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `The site returned ${res.status}.` }, { status: 400 });
    }

    const html = await res.text();
    const finalUrl = res.url || url;
    const { document } = parseHTML(html);

    const og =
      document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
      document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
      null;
    const image = og ? abs(og, finalUrl) : null;

    document.querySelectorAll('img').forEach((img) => {
      let src =
        img.getAttribute('data-src') ||
        img.getAttribute('data-lazy-src') ||
        img.getAttribute('data-original') ||
        img.getAttribute('src');
      if (!src || src.startsWith('data:')) {
        const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
        if (srcset) src = srcset.split(',').pop().trim().split(' ')[0];
      }
      if (src) img.setAttribute('src', abs(src, finalUrl) || '');
    });

    const article = new Readability(document).parse();
    if (!article || !article.content) {
      return NextResponse.json({ error: "Couldn't extract an article from that link." }, { status: 422 });
    }

    const imgStyle = 'display:block;width:100%;margin:20px 0;border-radius:16px;';
    const clean = sanitizeHtml(article.content, {
      allowedTags: ['p', 'h2', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'strong', 'em', 'b', 'i', 'u', 'br'],
      allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'style'] },
      allowedSchemes: ['http', 'https'],
      transformTags: {
        h1: 'h2', h3: 'h2', h4: 'h2', h5: 'h2', h6: 'h2',
        a: (tag, attribs) => ({
          tagName: 'a',
          attribs: { href: abs(attribs.href || '', finalUrl) || '#', target: '_blank', rel: 'noopener noreferrer' },
        }),
        img: (tag, attribs) => ({
          tagName: 'img',
          attribs: { src: attribs.src || '', alt: attribs.alt || '', style: imgStyle },
        }),
      },
      exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src,
    });

      const host = new URL(finalUrl).hostname.replace(/^www\./, '');
    const siteName =
      document.querySelector('meta[property="og:site_name"]')?.getAttribute('content')?.trim() ||
      document.querySelector('meta[name="application-name"]')?.getAttribute('content')?.trim() ||
      host;

    const sourceBox = `<div style="display:flex;align-items:center;gap:10px;background:#f6f6f4;border-left:3px solid #111111;border-radius:10px;padding:12px 16px;margin:0 0 28px 0;font-size:14px;line-height:1.5;color:#444;">
      <span style="font-size:18px;line-height:1;">📰</span>
      <span>Originally published by <strong style="color:#111;">${siteName}</strong> — <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" style="color:#111;text-decoration:underline;font-weight:600;">Read the original article</a></span>
    </div>`;

    const withSource = `${sourceBox}${clean}`;

    return NextResponse.json({
      title: (article.title || '').trim(),
      html: withSource,
      image,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Import failed. The site may be blocking access.' }, { status: 500 });
  }
}