function getWpAuth() {
  return Buffer.from(
    `${process.env.WP_APP_USER}:${process.env.WP_APP_PASSWORD}`
  ).toString("base64");
}

// DELETE MEDIA
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const res = await fetch(
      `${process.env.WP_SITE_URL}/wp-json/wp/v2/media/${id}?force=true`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${getWpAuth()}`,
        },
      }
    );

    const text = await res.text();

    console.log("DELETE Status:", res.status);
    console.log("DELETE Response:", text);

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error(err);

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

// UPDATE MEDIA
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const res = await fetch(
      `${process.env.WP_SITE_URL}/wp-json/wp/v2/media/${id}`,
      {
        method: "POST", // WordPress uses POST for updates
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${getWpAuth()}`,
        },
        body: JSON.stringify({
          title: body.title,
          alt_text: body.altText,
          caption: body.caption,
        }),
      }
    );

    const text = await res.text();

    console.log("PATCH Status:", res.status);
    console.log("PATCH Response:", text);

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error(err);

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