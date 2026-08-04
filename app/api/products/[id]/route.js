function getWcAuth() {
  return Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64');
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const res = await fetch(`${process.env.WP_SITE_URL}/wp-json/wc/v3/products/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${getWcAuth()}`
      },
      body: JSON.stringify({
        name: body.title,
        description: body.description,
        regular_price: body.price,
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
  const res = await fetch(`${process.env.WP_SITE_URL}/wp-json/wc/v3/products/${params.id}?force=true`, {
    method: 'DELETE',
    headers: { 'Authorization': `Basic ${getWcAuth()}` }
  });
  return Response.json(await res.json());
}