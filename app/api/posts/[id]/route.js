function getWpAuth() {
  return Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64');
}

export async function GET(request, { params }) {
  try {
    const res = await fetch(`${process.env.WP_URL}/wp-json/wp/v2/posts/${params.id}`, {
      headers: { 'Authorization': `Basic ${getWpAuth()}` }
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

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const res = await fetch(`${process.env.WP_URL}/wp-json/wp/v2/posts/${params.id}`, {
      method: 'POST', // WP REST API uses POST for updates too
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${getWpAuth()}`
      },
      body: JSON.stringify({
        title: body.title,
        content: body.content,
        status: body.status,
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

export async function DELETE(request, { params }) {
  try {
    const res = await fetch(`${process.env.WP_URL}/wp-json/wp/v2/posts/${params.id}?force=true`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${getWpAuth()}` }
    });
    return Response.json(await res.json());
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}