function getWpAuth() {
  return Buffer.from(
    `${process.env.WP_APP_USER}:${process.env.WP_APP_PASSWORD}`
  ).toString("base64");
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const res = await fetch(
      `${process.env.WP_SITE_URL}/wp-json/wp/v2/posts/${id}?context=edit`,
      {
        headers: {
          Authorization: `Basic ${getWpAuth()}`,
        },
      }
    );

    const text = await res.text();

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

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const body = await request.json();

    const res = await fetch(
      `${process.env.WP_SITE_URL}/wp-json/wp/v2/posts/${id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${getWpAuth()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: body.title,
          content: body.content,
          status: body.status,
        }),
      }
    );

    const text = await res.text();

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
      `${process.env.WP_SITE_URL}/wp-json/wp/v2/posts/${id}?force=true`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${getWpAuth()}`,
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