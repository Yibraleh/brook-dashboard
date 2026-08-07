function getWcAuth() {
  return Buffer.from(
    `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
  ).toString("base64");
}

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.WP_SITE_URL}/wp-json/wc/v3/products/categories?per_page=100`,
      {
        headers: {
          Authorization: `Basic ${getWcAuth()}`
        },
        cache: "no-store"
      }
    );

    const text = await res.text();

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}