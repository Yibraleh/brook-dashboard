import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { verifyUser, getUserPermissions } from '@/lib/users';

export async function POST(request) {
  const { username, password } = await request.json();

  const user = await verifyUser(username, password);
  if (!user) {
    return Response.json({ error: 'Invalid username or password, or account disabled' }, { status: 401 });
  }

  const permissions = await getUserPermissions(user.id);

  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, sessionOptions);
  session.loggedIn = true;
  session.userId = user.id;
  session.username = user.username;
  session.role = user.role;
  session.permissions = permissions;
  await session.save();

  return Response.json({ success: true, role: user.role });
}