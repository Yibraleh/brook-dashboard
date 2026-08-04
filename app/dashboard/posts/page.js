'use client';
import { useEffect, useState } from 'react';
import {
  PenSquare,
  NotebookPen,
  X,
  Trash2,
  Save,
  Search,
  Clock,
} from 'lucide-react';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', status: 'draft' });
  const [status, setStatus] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  async function loadPosts() {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { loadPosts(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Saving...');
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (data.id) {
      setStatus('✅ Post created!');
      setForm({ title: '', content: '', status: 'draft' });
      loadPosts();
    } else {
      setStatus('❌ ' + (data.error || 'Error creating post'));
    }
  }

  function openPost(post) {
    setSelectedPost(post);
    setEditForm({
      title: stripHtml(post.title.rendered),
      content: stripHtml(post.content.rendered),
      status: post.status,
    });
  }

  function closeModal() {
    setSelectedPost(null);
    setEditForm(null);
  }

  async function handleUpdate() {
    setSaving(true);
    const res = await fetch(`/api/posts/${selectedPost.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    const data = await res.json();
    setSaving(false);
    if (data.id) {
      closeModal();
      loadPosts();
    } else {
      alert('Failed to update: ' + (data.error || 'Unknown error'));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this post permanently?')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    closeModal();
    loadPosts();
  }

  function stripHtml(html) {
    return html.replace(/<[^>]+>/g, '');
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function readTime(content) {
    const words = stripHtml(content).split(/\s+/).length;
    return Math.max(1, Math.round(words / 200)) + ' min read';
  }

  function statusBadge(s) {
    if (s === 'publish') return 'bg-green-100 text-green-700';
    if (s === 'private') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  }

  const filteredPosts = posts.filter((p) =>
    stripHtml(p.title.rendered).toLowerCase().includes(search.toLowerCase())
  );

  const inputStyles =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  return (
    <div className="space-y-10">

      {/* Hero header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-10 text-white shadow-2xl">
        <p className="text-indigo-200 font-medium flex items-center gap-2">
          <NotebookPen size={18} /> Blog Management
        </p>
        <h1 className="mt-2 text-4xl font-bold">Blog Posts</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Create, edit and organize your Brook articles.
        </p>
      </div>

      {/* Create new post */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm max-w-2xl">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <PenSquare size={20} className="text-indigo-600" />
          Create New Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Title</label>
            <input
              className={`${inputStyles} text-lg font-medium`}
              placeholder="Enter a beautiful title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Content</label>
            <textarea
              className={`${inputStyles} min-h-[320px] text-[17px] leading-8 resize-y`}
              placeholder="Start writing your story..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Status</label>
            <select
              className={inputStyles}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="publish">Publish</option>
            </select>
          </div>

          <button className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-4 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl">
            Publish Post
          </button>

          {status && <p className="text-sm text-slate-600">{status}</p>}
        </form>
      </div>

      {/* Search */}
      <div className="max-w-2xl">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-5 py-3 text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* All Posts */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">All Posts</h2>

        {filteredPosts.length === 0 && (
          <p className="text-slate-400 text-sm">No posts found.</p>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {filteredPosts.map((p) => (
            <button
              key={p.id}
              onClick={() => openPost(p)}
              className="group text-left rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {stripHtml(p.title.rendered)}
                </h3>
                <span className={`flex-shrink-0 text-xs px-3 py-1 rounded-full font-medium ${statusBadge(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <p className="text-[15px] leading-7 text-slate-500 mb-4">
                {stripHtml(p.content.rendered).slice(0, 170)}...
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>{formatDate(p.date)}</span>
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {readTime(p.content.rendered)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail / Edit Modal */}
      {selectedPost && editForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[30px] shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[88vh] overflow-y-auto p-8 relative">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-8">Edit Blog Post</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Title</label>
                <input
                  className={`${inputStyles} text-lg font-medium`}
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Content</label>
                <textarea
                  className={`${inputStyles} min-h-[350px] text-[17px] leading-8 resize-y`}
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Status</label>
                <select
                  className={inputStyles}
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="publish">Publish</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => handleDelete(selectedPost.id)}
                className="flex items-center justify-center gap-2 border border-red-300 text-red-600 px-6 py-3 rounded-2xl font-semibold hover:bg-red-50 transition"
              >
                <Trash2 size={18} />
                Delete
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}