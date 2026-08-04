function getWcAuth() {
  return Buffer.from(`${process.env.WC_KEY}:${process.env.WC_SECRET}`).toString('base64');
}
function getWpAuth() {
  return Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64');
}

export async function GET() {
  try {
    const [productsRes, postsRes, mediaRes] = await Promise.all([
      fetch(`${process.env.WP_URL}/wp-json/wc/v3/products?per_page=1`, {
        headers: { 'Authorization': `Basic ${getWcAuth()}` }
      }),
      fetch(`${process.env.WP_URL}/wp-json/wp/v2/posts?per_page=1`, {
        headers: { 'Authorization': `Basic ${getWpAuth()}` }
      }),
      fetch(`${process.env.WP_URL}/wp-json/wp/v2/media?per_page=1&media_type=image`, {
        headers: { 'Authorization': `Basic ${getWpAuth()}` }
      }),
    ]);

    const stats = {
      products: parseInt(productsRes.headers.get('X-WP-Total') || '0'),
      posts: parseInt(postsRes.headers.get('X-WP-Total') || '0'),
      images: parseInt(mediaRes.headers.get('X-WP-Total') || '0'),
    };

    return Response.json(stats);
  } catch (err) {
    console.error('Stats fetch failed:', err);
    return Response.json({ products: 0, posts: 0, images: 0 }, { status: 500 });
  }
}