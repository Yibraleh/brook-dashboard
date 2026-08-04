function getWpAuth() {
  return Buffer.from(`${process.env.WP_APP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64');
}

export async function DELETE(request, { params }) {
  const res = await fetch(`${process.env.WP_SITE_URL}/wp-json/wp/v2/media/${params.id}?force=true`, {
    method: 'DELETE',
    headers: { 'Authorization': `Basic ${getWpAuth()}` }
  });
  return Response.json(await res.json());
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const res = await fetch(`${process.env.WP_SITE_URL}/wp-json/wp/v2/media/${params.id}`, {
      method: 'POST', // WP REST API uses POST for updates
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${getWpAuth()}`
      },
      body: JSON.stringify({
        alt_text: body.altText,
        caption: body.caption,
        title: body.title,
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: errText }, { status: res.status });
    }

    return Response.json(await res.json());
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}