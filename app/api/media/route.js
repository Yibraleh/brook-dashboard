function getWpAuth() {
  return Buffer.from(`${process.env.WP_APP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64');
}

export async function GET() {
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
  const formData = await request.formData();
  const file = formData.get('file');

  const auth = Buffer.from(
    `${process.env.WP_APP_USER}:${process.env.WP_APP_PASSWORD}`
  ).toString('base64');

  const buffer = Buffer.from(await file.arrayBuffer());

  const response = await fetch(`${process.env.WP_SITE_URL}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Disposition': `attachment; filename="${file.name}"`,
      'Content-Type': file.type
    },
    body: buffer
  });

  const data = await response.json();
  return Response.json(data);
}