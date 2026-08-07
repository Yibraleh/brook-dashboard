function getWcAuth() {
  return Buffer.from(
    `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
  ).toString("base64");
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let url = `${process.env.WP_SITE_URL}/wp-json/wc/v3/products?per_page=100`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Basic ${getWcAuth()}` },
      cache: "no-store",
    });

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const images = body.imageId ? [{ id: body.imageId }] : [];

    // categories: array of category IDs (numbers or numeric strings)
    const categories = Array.isArray(body.categories) && body.categories.length > 0
      ? body.categories.map((id) => ({ id: Number(id) }))
      : []; // empty = WooCommerce will file it under "Uncategorized"

    const res = await fetch(
      `${process.env.WP_SITE_URL}/wp-json/wc/v3/products`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${getWcAuth()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: body.title,
          description: body.description,
          regular_price: body.price,
          images,
          categories,
        }),
      }
    );

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}