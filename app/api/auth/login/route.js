import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';

export async function POST(request) {
  const { username, password } = await request.json();

  const validUsername = process.env.DASHBOARD_USERNAME;
  const validPassword = process.env.DASHBOARD_PASSWORD;

  if (username !== validUsername || password !== validPassword) {
    return Response.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, sessionOptions);
  session.loggedIn = true;
  session.username = username;
  await session.save();

  return Response.json({ success: true });
}