function getWcAuth() {
  return Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64');
}
function getWpAuth() {
  return Buffer.from(`${process.env.WP_APP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let url = `${process.env.WP_SITE_URL}/wp-json/wc/v3/products?per_page=50`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const res = await fetch(url, {
      headers: { 'Authorization': `Basic ${getWcAuth()}` }
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

export async function POST(request) {
  try {
    const body = await request.json();

    let images = [];
    // If an image was uploaded first (via /api/media) and its URL passed in
    if (body.imageId) {
      images = [{ id: body.imageId }];
    }

    const res = await fetch(`${process.env.WP_SITE_URL}/wp-json/wc/v3/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${getWcAuth()}`
      },
      body: JSON.stringify({
        name: body.title,
        description: body.description,
        regular_price: body.price,
        images,
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