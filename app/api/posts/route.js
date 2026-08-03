function getWpAuth() {
  return Buffer.from(`${process.env.WP_APP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64');
}

export async function GET() {
  try {
    const res = await fetch(`${process.env.WP_SITE_URL}/wp-json/wp/v2/posts?per_page=50`, {
      headers: { 'Authorization': `Basic ${getWpAuth()}` }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('WP Posts API error:', res.status, errText);
      return Response.json({ error: errText }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error('Fetch failed (posts):', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const res = await fetch(`${process.env.WP_SITE_URL}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${getWpAuth()}`
      },
      body: JSON.stringify({
        title: body.title,
        content: body.content,
        status: body.status || 'draft',
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('WP Posts API error:', res.status, errText);
      return Response.json({ error: errText }, { status: res.status });
    }

    return Response.json(await res.json());
  } catch (err) {
    console.error('Fetch failed (posts POST):', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}