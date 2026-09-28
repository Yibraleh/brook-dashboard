import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export async function hasPostsAccess() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.loggedIn) return false;
  if (session.role === 'super_admin') return true;
  return (session.permissions?.posts || 'none') !== 'none';
}