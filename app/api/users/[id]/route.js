import { requireAccess } from '@/lib/authGuard';
import { updateUserPermissions, setUserActive, deleteUser } from '@/lib/users';

export async function PATCH(request, { params }) {
  const guard = await requireAccess('users', 'manage');
  if (!guard.ok) return Response.json({ error: guard.message }, { status: guard.status });

  const { id } = await params;
  const body = await request.json();

  if (body.permissions) await updateUserPermissions(id, body.permissions);
  if (typeof body.active === 'boolean') await setUserActive(id, body.active);

  return Response.json({ success: true });
}

export async function DELETE(request, { params }) {
  const guard = await requireAccess('users', 'manage');
  if (!guard.ok) return Response.json({ error: guard.message }, { status: guard.status });

  const { id } = await params;
  const session = guard.session;
  if (id === session.userId) {
    return Response.json({ error: "You can't delete your own account" }, { status: 400 });
  }

  await deleteUser(id);
  return Response.json({ success: true });
}