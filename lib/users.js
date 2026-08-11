import { supabaseAdmin } from './supabaseAdmin';
import bcrypt from 'bcryptjs';

export const SECTIONS = ['products', 'posts', 'images', 'users'];

export async function getUserByUsername(username) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  return data;
}

export async function verifyUser(username, password) {
  const user = await getUserByUsername(username);
  if (!user || !user.active) return null;
  const valid = await bcrypt.compare(password, user.password_hash);
  return valid ? user : null;
}

export async function getUserPermissions(userId) {
  const { data } = await supabaseAdmin
    .from('permissions')
    .select('section, access')
    .eq('user_id', userId);

  const map = {};
  SECTIONS.forEach((s) => (map[s] = 'none'));
  (data || []).forEach((p) => (map[p.section] = p.access));
  return map;
}

export async function createUser({ username, password, role, permissions }) {
  const existing = await getUserByUsername(username);
  if (existing) throw new Error('Username already exists');

  const password_hash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({ username, password_hash, role })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const permRows = SECTIONS.map((section) => ({
    user_id: user.id,
    section,
    access: permissions?.[section] || 'none',
  }));
  await supabaseAdmin.from('permissions').insert(permRows);

  return user;
}

export async function updateUserPermissions(userId, permissions) {
  for (const section of SECTIONS) {
    await supabaseAdmin
      .from('permissions')
      .upsert(
        { user_id: userId, section, access: permissions[section] || 'none' },
        { onConflict: 'user_id,section' }
      );
  }
}

export async function listUsers() {
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, username, role, active, created_at')
    .order('created_at', { ascending: true });

  const withPerms = await Promise.all(
    (users || []).map(async (u) => ({
      ...u,
      permissions: await getUserPermissions(u.id),
    }))
  );
  return withPerms;
}

export async function setUserActive(userId, active) {
  await supabaseAdmin.from('users').update({ active }).eq('id', userId);
}

export async function deleteUser(userId) {
  await supabaseAdmin.from('users').delete().eq('id', userId);
}

export async function countUsers() {
  const { count } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}