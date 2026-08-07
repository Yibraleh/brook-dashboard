'use client';
import { useEffect, useState, useRef } from 'react';
import {
  ShoppingBag,
  UploadCloud,
  X,
  Trash2,
  Save,
  Search,
  DollarSign,
  Loader2,
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', price: '', categories: [] });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef(null);

  async function loadProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch('/api/products/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    }
  }

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  function handleFileSelect(selectedFile) {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  }

  function toggleCreateCategory(catId) {
    setForm((prev) => {
      const exists = prev.categories.includes(catId);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((id) => id !== catId)
          : [...prev.categories, catId],
      };
    });
  }

  function toggleEditCategory(catId) {
    setEditForm((prev) => {
      const exists = prev.categories.includes(catId);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((id) => id !== catId)
          : [...prev.categories, catId],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus('Saving...');

    try {
      let imageId = null;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/media', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.id) imageId = uploadData.id;
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageId })
      });
      const data = await res.json();

      if (data.id) {
        setStatus('✅ Product added!');
        setForm({ title: '', description: '', price: '', categories: [] });
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadProducts();
      } else {
        setStatus('❌ ' + (data.error || data.message || 'Error adding product'));
      }
    } catch (err) {
      setStatus('❌ Request failed');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function openProduct(p) {
    setSelectedProduct(p);
    setEditForm({
      title: p.name,
      description: p.description?.replace(/<[^>]+>/g, '') || '',
      price: p.regular_price || p.price || '',
      categories: p.categories?.map((c) => c.id) || [],
    });
  }

  function closeModal() {
    setSelectedProduct(null);
    setEditForm(null);
  }

  async function handleUpdate() {
    setUpdating(true);
    const res = await fetch(`/api/products/${selectedProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    const data = await res.json();
    setUpdating(false);
    if (data.id) {
      closeModal();
      loadProducts();
    } else {
      alert('Failed to update: ' + (data.error || data.message || 'Unknown error'));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product permanently?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    closeModal();
    loadProducts();
  }

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyles =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  function CategoryCheckboxes({ selected, onToggle }) {
    return (
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isChecked = selected.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggle(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
                ${isChecked
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
            >
              {cat.name}
            </button>
          );
        })}
        {categories.length === 0 && (
          <p className="text-sm text-slate-400">No categories found.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Hero header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-10 text-white shadow-2xl">
        <p className="text-indigo-200 font-medium flex items-center gap-2">
          <ShoppingBag size={18} /> Shop Management
        </p>
        <h1 className="mt-2 text-4xl font-bold">Products</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Add new artworks to your shop and manage your collection.
        </p>
      </div>

      {/* Create new product */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm max-w-2xl">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <ShoppingBag size={20} className="text-indigo-600" />
          Add New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Product Image</label>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all
                ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
            >
              {previewUrl ? (
                <img src={previewUrl} className="w-32 h-32 object-cover rounded-xl shadow-md" />
              ) : (
                <>
                  <UploadCloud size={32} className="text-slate-400" />
                  <p className="text-slate-500 text-sm">
                    Drag & drop, or <span className="text-indigo-600 font-medium">browse</span>
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Title</label>
            <input
              className={`${inputStyles} text-lg font-medium`}
              placeholder="Enter artwork title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Description</label>
            <textarea
              className={`${inputStyles} min-h-[140px] leading-7 resize-y`}
              placeholder="Describe the piece..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              Category <span className="text-slate-400 font-normal">(select one or more — leave blank for Uncategorized)</span>
            </label>
            <CategoryCheckboxes selected={form.categories} onToggle={toggleCreateCategory} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Price</label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                className={`${inputStyles} pl-11`}
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>

          <button
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-4 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
            {saving ? 'Adding...' : 'Add Product'}
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
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Products grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Products</h2>

        {filteredProducts.length === 0 && (
          <p className="text-slate-400 text-sm">No products found.</p>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => openProduct(p)}
              className="group text-left overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl"
            >
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0].src}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ShoppingBag size={40} />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1">
                  {p.name}
                </h3>
                <p className="text-sm text-slate-400 mb-2">#{p.id}</p>
                {p.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.categories.map((c) => (
                      <span key={c.id} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-lg font-semibold text-indigo-600">
                  ${p.regular_price || p.price || '—'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail / Edit Modal */}
      {selectedProduct && editForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[30px] shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[88vh] overflow-y-auto p-8 relative">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Product</h2>

            {selectedProduct.images?.[0] && (
              <img
                src={selectedProduct.images[0].src}
                className="w-full max-h-64 object-contain rounded-2xl bg-slate-50 mb-6"
              />
            )}

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
                <label className="block text-sm font-semibold text-slate-600 mb-2">Description</label>
                <textarea
                  className={`${inputStyles} min-h-[140px] leading-7 resize-y`}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Category <span className="text-slate-400 font-normal">(select one or more)</span>
                </label>
                <CategoryCheckboxes selected={editForm.categories} onToggle={toggleEditCategory} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Price</label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    className={`${inputStyles} pl-11`}
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => handleDelete(selectedProduct.id)}
                className="flex items-center justify-center gap-2 border border-red-300 text-red-600 px-6 py-3 rounded-2xl font-semibold hover:bg-red-50 transition"
              >
                <Trash2 size={18} />
                Delete
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                <Save size={18} />
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
              <a
                href={selectedProduct.permalink}
                target="_blank"
                className="flex items-center justify-center px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
              >
                View
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}