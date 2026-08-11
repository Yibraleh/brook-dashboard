import { requireAccess } from '@/lib/authGuard';
import { listUsers, createUser } from '@/lib/users';

export async function GET() {
  const guard = await requireAccess('users', 'manage');
  if (!guard.ok) return Response.json({ error: guard.message }, { status: guard.status });

  const users = await listUsers();
  return Response.json(users);
}

export async function POST(request) {
  const guard = await requireAccess('users', 'manage');
  if (!guard.ok) return Response.json({ error: guard.message }, { status: guard.status });

  try {
    const body = await request.json();
    const user = await createUser(body);
    return Response.json({ success: true, id: user.id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}