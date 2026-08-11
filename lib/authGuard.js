import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';

export async function getSession() {
  const cookieStore = await cookies();
  return await getIronSession(cookieStore, sessionOptions);
}

export async function requireAccess(section, level = 'view') {
  const session = await getSession();
  if (!session.loggedIn) return { ok: false, status: 401, message: 'Not logged in' };

  if (session.role === 'super_admin') return { ok: true, session };

  const access = session.permissions?.[section] || 'none';
  const levels = { none: 0, view: 1, manage: 2 };
  if (levels[access] < levels[level]) {
    return { ok: false, status: 403, message: 'Insufficient permissions' };
  }
  return { ok: true, session };
}