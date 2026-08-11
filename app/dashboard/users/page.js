'use client';
import { useEffect, useState } from 'react';
import { Users, UserPlus, Trash2, Power, Loader2 } from 'lucide-react';

const SECTIONS = ['products', 'posts', 'images', 'users'];
const LEVELS = ['none', 'view', 'manage'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [forbidden, setForbidden] = useState(false);
  const [form, setForm] = useState({
    username: '', password: '', role: 'user',
    permissions: { products: 'none', posts: 'none', images: 'none', users: 'none' },
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  async function loadUsers() {
    const res = await fetch('/api/users');
    if (res.status === 403 || res.status === 401) { setForbidden(true); return; }
    setUsers(await res.json());
  }

  useEffect(() => { loadUsers(); }, []);

  function setPerm(section, level) {
    setForm((f) => ({ ...f, permissions: { ...f.permissions, [section]: level } }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setStatus('✅ User created');
      setForm({ username: '', password: '', role: 'user', permissions: { products: 'none', posts: 'none', images: 'none', users: 'none' } });
      loadUsers();
    } else {
      setStatus('❌ ' + (data.error || 'Failed'));
    }
  }

  async function toggleActive(u) {
    await fetch(`/api/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !u.active })
    });
    loadUsers();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this user permanently?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    loadUsers();
  }

  if (forbidden) {
    return <div className="text-center py-20 text-gray-500">You don't have access to manage users.</div>;
  }

  const inputStyles = "w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-900 outline-none focus:border-black focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all";

  return (
    <div className="space-y-10">
      <div className="rounded-3xl bg-black p-10 text-white shadow-2xl">
        <p className="text-gray-400 flex items-center gap-2"><Users size={18} /> Access Control</p>
        <h1 className="mt-2 text-4xl font-bold">Manage Users</h1>
        <p className="mt-3 text-gray-300">Control who can access each part of the dashboard.</p>
      </div>

      <form onSubmit={handleCreate} className="rounded-3xl border bg-white p-8 shadow-sm max-w-2xl space-y-5">
        <h2 className="text-xl font-bold flex items-center gap-2"><UserPlus size={20} /> Add New User</h2>

        <input className={inputStyles} placeholder="Username" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input type="password" className={inputStyles} placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />

        <select className={inputStyles} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <div>
          <p className="font-semibold text-gray-700 mb-3">Section Permissions</p>
          <div className="space-y-3">
            {SECTIONS.map((section) => (
              <div key={section} className="flex items-center justify-between">
                <span className="capitalize text-gray-600">{section}</span>
                <div className="flex gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPerm(section, level)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                        ${form.permissions[section] === level ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button disabled={saving} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white hover:bg-gray-900 transition disabled:opacity-50">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
          {saving ? 'Creating...' : 'Create User'}
        </button>
        {status && <p className="text-sm">{status}</p>}
      </form>

      <div>
        <h2 className="text-2xl font-bold mb-4">Current Users</h2>
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="bg-white border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold">{u.username}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'super_admin' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {u.role}
                  </span>
                  {!u.active && <span className="text-xs text-red-600 ml-2">Disabled</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(u)} className="p-2 rounded-lg hover:bg-gray-100" title="Enable/Disable">
                    <Power size={18} className={u.active ? 'text-green-600' : 'text-gray-400'} />
                  </button>
                  {u.role !== 'super_admin' && (
                    <button onClick={() => handleDelete(u.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {SECTIONS.map((s) => (
                  <span key={s} className="capitalize">{s}: <b>{u.permissions?.[s] || 'none'}</b></span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}