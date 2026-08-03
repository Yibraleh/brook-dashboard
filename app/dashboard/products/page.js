'use client';
import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', price: '' });
  const [status, setStatus] = useState('');

  async function loadProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.id) {
        setStatus('✅ Product added!');
        setForm({ title: '', description: '', price: '' });
        loadProducts();
      } else {
        setStatus('❌ ' + (data.error || 'Error adding product'));
        console.error('Add product error:', data);
      }
    } catch (err) {
      setStatus('❌ Request failed');
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    loadProducts();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🛍️ Products</h1>

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
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            className="w-full border rounded-lg p-3 min-h-[120px]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Price</label>
          <input
            type="number"
            className="w-full border rounded-lg p-3"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <button className="bg-[#1a1a1a] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d4af37] transition">
          Add Product
        </button>
        {status && <p className="text-sm">{status}</p>}
      </form>

      <h2 className="text-xl font-semibold mb-4">Manage Products</h2>
      <div className="space-y-4">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 bg-white border rounded-xl p-4">
            {p.images?.[0] && (
              <img src={p.images[0].src} className="w-20 h-20 object-cover rounded-lg" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{p.name} <span className="text-gray-400 text-sm">#{p.id}</span></h3>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-sm border border-red-300 text-red-600 px-3 py-1 rounded-md hover:bg-red-50"
                >
                  Delete
                </button>
                <a
                  href={p.permalink}
                  target="_blank"
                  className="text-sm border px-3 py-1 rounded-md hover:bg-gray-50"
                >
                  View
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}