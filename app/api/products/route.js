console.log('WP_URL is:', process.env.WP_SITE_URL);

function getWcAuth() {
  return Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64');
}

export async function GET(request) {
  try {
    const url = `${process.env.WP_SITE_URL}/wp-json/wc/v3/products?per_page=50`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Basic ${getWcAuth()}` }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('WooCommerce API error:', res.status, errText);
      return Response.json({ error: errText }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error('Fetch failed:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
   
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
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('WooCommerce API error:', res.status, errText);
      return Response.json({ error: errText }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error('Fetch failed:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}