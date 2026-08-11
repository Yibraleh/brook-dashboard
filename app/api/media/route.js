import { requireAccess } from '@/lib/authGuard';

function getWpAuth() {
  return Buffer.from(`${process.env.WP_APP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64');
}

export async function GET() {
  const guard = await requireAccess('images', 'view');
  if (!guard.ok) return Response.json({ error: guard.message }, { status: guard.status });

  try {
    const res = await fetch(`${process.env.WP_SITE_URL}/wp-json/wp/v2/media?per_page=100&media_type=image`, {
      headers: { 'Authorization': `Basic ${getWpAuth()}` }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('WP Media API error:', res.status, errText);
      return Response.json({ error: errText }, { status: res.status });
    }

    return Response.json(await res.json());
  } catch (err) {
    console.error('Fetch failed (media):', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const guard = await requireAccess('images', 'manage');
  if (!guard.ok) return Response.json({ error: guard.message }, { status: guard.status });

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const purpose = formData.get('purpose') || 'general';

    const buffer = Buffer.from(await file.arrayBuffer());

    const response = await fetch(`${process.env.WP_SITE_URL}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${getWpAuth()}`,
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Type': file.type
      },
      body: buffer
    });

    const data = await response.json();

    if (purpose === 'post-cover' && data.id) {
      await fetch(`${process.env.WP_SITE_URL}/wp-json/wp/v2/media/${data.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${getWpAuth()}`
        },
        body: JSON.stringify({ alt_text: '__post_cover__' })
      });
    }

    return Response.json(data);
  } catch (err) {
    console.error('Upload failed:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}