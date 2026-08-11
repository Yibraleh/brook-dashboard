import { countUsers, createUser } from '@/lib/users';

export async function POST() {
  const existing = await countUsers();
  if (existing > 0) {
    return Response.json({ error: 'Already bootstrapped' }, { status: 400 });
  }

  const username = process.env.DASHBOARD_USERNAME;
  const password = process.env.DASHBOARD_PASSWORD;

  if (!username || !password) {
    return Response.json({ error: 'Missing DASHBOARD_USERNAME/PASSWORD in env' }, { status: 400 });
  }

  const user = await createUser({
    username,
    password,
    role: 'super_admin',
    permissions: { products: 'manage', posts: 'manage', images: 'manage', users: 'manage' },
  });

  return Response.json({ success: true, username: user.username });
}