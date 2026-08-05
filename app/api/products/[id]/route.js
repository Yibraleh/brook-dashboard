function getWcAuth() {
  return Buffer.from(
    `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
  ).toString("base64");
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const body = await request.json();

    const res = await fetch(
      `${process.env.WP_SITE_URL}/wp-json/wc/v3/products/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Basic ${getWcAuth()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: body.title,
          description: body.description,
          regular_price: body.price,
        }),
      }
    );

    const text = await res.text();

    console.log("PUT STATUS:", res.status);
    console.log("PUT RESPONSE:", text);

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return Response.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const res = await fetch(
      `${process.env.WP_SITE_URL}/wp-json/wc/v3/products/${id}?force=true`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${getWcAuth()}`,
        },
      }
    );

    const text = await res.text();

    console.log("DELETE STATUS:", res.status);
    console.log("DELETE RESPONSE:", text);

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return Response.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}