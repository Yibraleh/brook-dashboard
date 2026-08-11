'use client';
import { useEffect, useState, useRef } from 'react';
import {
  ImageIcon,
  UploadCloud,
  X,
  Trash2,
  Save,
  Search,
  Loader2,
} from 'lucide-react';

export default function ImagesPage() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadImages() {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { loadImages(); }, []);

  function handleFileSelect(selectedFile) {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setStatus('');
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setStatus('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.id) {
        setStatus('✅ Uploaded successfully!');
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadImages();
      } else {
        setStatus('❌ ' + (data.error || 'Upload failed'));
      }
    } catch (err) {
      setStatus('❌ Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function openImage(img) {
    setSelectedImage(img);
    setEditForm({
      title: img.title?.rendered || '',
      altText: img.alt_text || '',
      caption: img.caption?.rendered?.replace(/<[^>]+>/g, '') || '',
    });
  }

  function closeModal() {
    setSelectedImage(null);
    setEditForm(null);
  }

  async function handleSaveDetails() {
    setSaving(true);
    const res = await fetch(`/api/media/${selectedImage.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    const data = await res.json();
    setSaving(false);
    if (data.id) {
      closeModal();
      loadImages();
    } else {
      alert('Failed to save: ' + (data.error || 'Unknown error'));
    }
  }

  function requestDelete(id) {
  setConfirmDeleteId(id);
}

async function confirmDelete() {
  if (!confirmDeleteId) return;

  setDeleting(true);
  try {
    await fetch(`/api/media/${confirmDeleteId}`, {
      method: 'DELETE',
    });

    setConfirmDeleteId(null);
    closeModal();
    loadImages();
  } finally {
    setDeleting(false);
  }
}
  const filteredImages = images.filter((img) =>
    (img.title?.rendered || '').toLowerCase().includes(search.toLowerCase())
  );

  const inputStyles =
    "w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-black focus:bg-white focus:ring-4 focus:ring-gray-100";

  return (
    <div className="space-y-10">

      {/* Hero header */}
      <div className="rounded-3xl bg-black p-10 text-white shadow-2xl">
        <p className="text-gray-400 font-medium flex items-center gap-2">
          <ImageIcon size={18} /> Media Library
        </p>
        <h1 className="mt-2 text-4xl font-bold">Gallery Images</h1>
        <p className="mt-3 max-w-2xl text-gray-300">
          Upload, organize, and edit your artwork photos.
        </p>
      </div>

      {/* Upload card with drag & drop */}
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm max-w-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <UploadCloud size={20} className="text-black" />
          Upload New Image
        </h2>

        <form onSubmit={handleUpload} className="space-y-5">
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all
              ${dragOver ? 'border-black bg-gray-100' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
          >
            {previewUrl ? (
              <img src={previewUrl} className="w-40 h-40 object-cover rounded-xl shadow-md" />
            ) : (
              <>
                <UploadCloud size={36} className="text-gray-400" />
                <p className="text-gray-500 text-sm">
                  Drag & drop an image here, or <span className="text-black font-medium underline">browse</span>
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

          {file && (
            <p className="text-sm text-gray-500">Selected: {file.name}</p>
          )}

          <button
            disabled={!file || uploading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:bg-gray-900 disabled:opacity-50 disabled:hover:scale-100"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>

          {status && <p className="text-sm text-gray-600">{status}</p>}
        </form>
      </div>

      {/* Search */}
      <div className="max-w-2xl">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-5 py-3 text-gray-800 outline-none focus:border-black focus:ring-4 focus:ring-gray-100 transition-all"
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Media Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Media Library</h2>

        {filteredImages.length === 0 && (
          <p className="text-gray-400 text-sm">No images found.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {filteredImages.map((img) => (
            <button
              key={img.id}
              onClick={() => openImage(img)}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={img.source_url}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity">
                  View & Edit
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Image Detail / Edit Modal */}
      {selectedImage && editForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[30px] shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[88vh] overflow-y-auto p-8 relative">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-gray-400 hover:text-black transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Image</h2>

            <img
              src={selectedImage.source_url}
              className="w-full max-h-72 object-contain rounded-2xl bg-gray-50 mb-6"
            />

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Title</label>
                <input
                  className={inputStyles}
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Alt Text</label>
                <input
                  className={inputStyles}
                  placeholder="Describe the image for accessibility & SEO"
                  value={editForm.altText}
                  onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Caption</label>
                <textarea
                  className={`${inputStyles} min-h-[100px] resize-y`}
                  value={editForm.caption}
                  onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => requestDelete(selectedImage.id)}
                className="flex items-center justify-center gap-2 border border-gray-300 text-gray-900 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
              >
                <Trash2 size={18} />
                Delete
              </button>
              <button
                onClick={handleSaveDetails}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-black py-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:bg-gray-900"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-6">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-sm w-full p-7 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
              <Trash2 size={20} className="text-gray-900" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete this post?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This can't be undone. The post will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-2xl border border-gray-300 py-3 font-semibold text-gray-900 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-2xl bg-black py-3 font-semibold text-white hover:bg-gray-900 transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}