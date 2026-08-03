'use client';
import { useEffect, useState } from 'react';

export default function ImagesPage() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

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

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/media', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.id) {
      setStatus('✅ Uploaded!');
      setFile(null);
      loadImages();
    } else {
      setStatus('❌ ' + (data.error || 'Upload failed'));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this image?')) return;
    await fetch(`/api/media/${id}`, { method: 'DELETE' });
    loadImages();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🖼️ Images</h1>

      <form onSubmit={handleUpload} className="bg-white rounded-2xl shadow-sm border p-8 max-w-xl mb-10 space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border border-dashed rounded-lg p-3"
        />
        <button className="bg-[#1a1a1a] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d4af37] transition">
          Upload Image
        </button>
        {status && <p className="text-sm">{status}</p>}
      </form>

      <h2 className="text-xl font-semibold mb-4">Media Library</h2>
      <div className="grid grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="bg-white border rounded-xl p-2">
            <img src={img.source_url} className="w-full h-32 object-cover rounded-lg mb-2" />
            <button
              onClick={() => handleDelete(img.id)}
              className="text-xs border border-red-300 text-red-600 px-2 py-1 rounded-md hover:bg-red-50 w-full"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}