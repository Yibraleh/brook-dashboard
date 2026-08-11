import { requireAccess } from '@/lib/authGuard';

function getWpAuth() {
  return Buffer.from(
    `${process.env.WP_APP_USER}:${process.env.WP_APP_PASSWORD}`
  ).toString("base64");
}

export async function GET() {
  const guard = await requireAccess('posts', 'view');
  if (!guard.ok) return Response.json({ error: guard.message }, { status: guard.status });

  try {
    const res = await fetch(
      `${process.env.WP_SITE_URL}/wp-json/wp/v2/posts?per_page=100&status=any&context=edit`,
      {
        headers: {
          Authorization: `Basic ${getWpAuth()}`,
        },
        cache: "no-store",
      }
    );

    const text = await res.text();

    if (!res.ok) {
      console.error(text);
      return new Response(text, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(text, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const guard = await requireAccess('posts', 'manage');
  if (!guard.ok) return Response.json({ error: guard.message }, { status: guard.status });

  try {
    const body = await request.json();

    const res = await fetch(
      `${process.env.WP_SITE_URL}/wp-json/wp/v2/posts`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${getWpAuth()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: body.title,
          content: body.content,
          status: body.status || "draft",
          ...(body.featuredMediaId ? { featured_media: body.featuredMediaId } : {}),
        }),
      }
    );

    const text = await res.text();

    if (!res.ok) {
      console.error(text);
      return new Response(text, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(text, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}