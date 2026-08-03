'use client';
import { useEffect, useState } from 'react';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', status: 'draft' });
  const [status, setStatus] = useState('');

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📝 Blog Posts</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-8 max-w-xl mb-10 space-y-4">
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            className="w-full border rounded-lg p-3"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Content</label>
          <textarea
            className="w-full border rounded-lg p-3 min-h-[140px]"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Status</label>
          <select
            className="w-full border rounded-lg p-3"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="publish">Publish</option>
          </select>
        </div>
        <button className="bg-[#1a1a1a] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d4af37] transition">
          Add Post
        </button>
        {status && <p className="text-sm">{status}</p>}
      </form>

      <h2 className="text-xl font-semibold mb-4">All Posts</h2>
      <div className="space-y-4">
        {posts.map((p) => (
          <div key={p.id} className="bg-white border rounded-xl p-4">
            <h3 className="font-semibold" dangerouslySetInnerHTML={{ __html: p.title.rendered }} />
            <span className="text-xs text-gray-400">{p.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}