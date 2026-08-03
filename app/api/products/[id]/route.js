function getWcAuth() {
  return Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64');
}

export async function PUT(request, { params }) {
  const body = await request.json();
  const res = await fetch(`${process.env.WP_SITE_URL}/wp-json/wc/v3/products/${params.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${getWcAuth()}`
    },
    body: JSON.stringify(body)
  });
  return Response.json(await res.json());
}

export async function DELETE(request, { params }) {
  const res = await fetch(`${process.env.WP_SITE_URL}/wp-json/wc/v3/products/${params.id}?force=true`, {
    method: 'DELETE',
    headers: { 'Authorization': `Basic ${getWcAuth()}` }
  });
  return Response.json(await res.json());
}