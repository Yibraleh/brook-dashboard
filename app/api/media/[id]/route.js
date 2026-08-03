function getWpAuth() {
  return Buffer.from(`${process.env.WP_APP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64');
}

export async function DELETE(request, { params }) {
  const res = await fetch(`${process.env.WP_SITE_URL}/wp-json/wp/v2/media/${params.id}?force=true`, {
    method: 'DELETE',
    headers: { 'Authorization': `Basic ${getWpAuth()}` }
  });
  return Response.json(await res.json());
}