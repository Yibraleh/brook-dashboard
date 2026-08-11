'use client';
import { useEffect, useState, useRef } from 'react';
import {
  PenSquare,
  NotebookPen,
  X,
  Trash2,
  Save,
  Search,
  Clock,
  Bold,
  Italic,
  Heading2,
  ImagePlus,
  UploadCloud,
  Loader2,
  Undo2,
} from 'lucide-react';

/* Uploads a file to the WP media endpoint and returns { id, source_url } */
async function uploadImageFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/media', { method: 'POST', body: formData });
  const data = await res.json();
  return data;
}

/* ---------- Rich text editor used for both Create and Edit ---------- */
function RichEditor({ editorRef, initialHtml, onChange, minHeight = '320px' }) {
  const inlineImageInput = useRef(null);
  const pendingAlign = useRef('full');
  const [activeStates, setActiveStates] = useState({ bold: false, italic: false, h2: false });

  useEffect(() => {
    if (editorRef.current && initialHtml !== undefined) {
      editorRef.current.innerHTML = initialHtml || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateActiveStates() {
    const el = editorRef.current;
    if (!el) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const anchorNode = selection.anchorNode;
    if (!anchorNode || !el.contains(anchorNode)) return;

    let isBold = false;
    let isItalic = false;
    let isH2 = false;
    try {
      isBold = document.queryCommandState('bold');
      isItalic = document.queryCommandState('italic');
      const block = document.queryCommandValue('formatBlock');
      isH2 = (block || '').toLowerCase() === 'h2';
    } catch (err) {
      // some browsers throw if selection isn't inside a contentEditable
    }

    setActiveStates({ bold: isBold, italic: isItalic, h2: isH2 });
  }

  useEffect(() => {
    document.addEventListener('selectionchange', updateActiveStates);
    return () => document.removeEventListener('selectionchange', updateActiveStates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function focusEditor() {
    editorRef.current?.focus();
  }

  function exec(command, value = null) {
    focusEditor();
    document.execCommand(command, false, value);
    onChange(editorRef.current.innerHTML);
    updateActiveStates();
  }

  function insertSubtitle() {
    focusEditor();
    const isCurrentlyH2 = (document.queryCommandValue('formatBlock') || '').toLowerCase() === 'h2';
    document.execCommand('formatBlock', false, isCurrentlyH2 ? 'p' : 'h2');
    onChange(editorRef.current.innerHTML);
    updateActiveStates();
  }

  function triggerImageInsert(align) {
    pendingAlign.current = align;
    inlineImageInput.current?.click();
  }

  async function handleInlineImage(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    focusEditor();

    // Show a temporary local preview immediately so it feels responsive
    const localUrl = URL.createObjectURL(file);
    const classes =
      pendingAlign.current === 'left'
        ? 'float-left w-1/3 mr-5 mb-2 rounded-xl'
        : pendingAlign.current === 'right'
        ? 'float-right w-1/3 ml-5 mb-2 rounded-xl'
        : 'w-full my-4 rounded-2xl';

    const placeholderId = `img-${Date.now()}`;
    document.execCommand(
      'insertHTML',
      false,
      `<img id="${placeholderId}" src="${localUrl}" class="${classes}" />`
    );
    onChange(editorRef.current.innerHTML);

    const data = await uploadImageFile(file);
    if (data.source_url) {
      const placeholder = editorRef.current.querySelector(`#${placeholderId}`);
      if (placeholder) {
        placeholder.src = data.source_url;
        placeholder.removeAttribute('id');
        onChange(editorRef.current.innerHTML);
      }
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-black focus-within:bg-white focus-within:ring-4 focus-within:ring-gray-100 transition-all duration-300 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-white px-3 py-2">
        <button
          type="button"
          onClick={() => exec('undo')}
          className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={() => exec('bold')}
          className={`p-2 rounded-lg transition-colors ${
            activeStates.bold ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => exec('italic')}
          className={`p-2 rounded-lg transition-colors ${
            activeStates.italic ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={insertSubtitle}
          className={`p-2 rounded-lg transition-colors ${
            activeStates.h2 ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Subtitle"
        >
          <Heading2 size={16} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={() => triggerImageInsert('left')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
          title="Insert image, wrap text on the right"
        >
          <ImagePlus size={16} /> Left
        </button>
        <button
          type="button"
          onClick={() => triggerImageInsert('right')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
          title="Insert image, wrap text on the left"
        >
          <ImagePlus size={16} /> Right
        </button>
        <button
          type="button"
          onClick={() => triggerImageInsert('full')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
          title="Insert full-width image"
        >
          <ImagePlus size={16} /> Full width
        </button>

        <input
          ref={inlineImageInput}
          type="file"
          accept="image/*"
          onChange={handleInlineImage}
          className="hidden"
        />
      </div>

      {/* Editable content area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => { onChange(e.currentTarget.innerHTML); updateActiveStates(); }}
        onKeyUp={updateActiveStates}
        onMouseUp={updateActiveStates}
        onFocus={updateActiveStates}
        className="prose-editor px-5 py-4 text-[17px] leading-8 text-gray-900 outline-none overflow-auto [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_img]:shadow-md [&_p]:mb-4 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        style={{ minHeight }}
        data-placeholder="Start writing your story... use the toolbar to add a subtitle or an image."
      />
    </div>
  );
}

/* Cover image uploader — shows a live hero-style preview of how it becomes the post header */
function CoverImageUploader({ preview, onSelect, onRemove, title }) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-600 mb-2">
        Cover Image <span className="text-gray-400 font-normal">(shown as the post header)</span>
      </label>

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden shadow-md group">
          <img src={preview} className="w-full h-64 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <p className="absolute bottom-4 left-5 right-5 text-white text-2xl font-bold drop-shadow-md line-clamp-2">
            {title || 'Your post title will appear here'}
          </p>
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-3 right-3 rounded-full bg-black/70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
            title="Remove cover image"
          >
            <X size={16} />
          </button>
          <label className="absolute top-3 left-3 rounded-full bg-white/90 text-black text-xs font-semibold px-3 py-1.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
            Replace
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onSelect(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); onSelect(e.dataTransfer.files[0]); }}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 cursor-pointer transition-all
            ${dragOver ? 'border-black bg-gray-100' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
        >
          <UploadCloud size={30} className="text-gray-400" />
          <p className="text-gray-500 text-sm">
            Drag & drop a cover image, or <span className="text-black font-medium underline">browse</span>
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onSelect(e.target.files[0])}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', status: 'draft' });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [status, setStatus] = useState('');
  const [saving, setSavingCreate] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const createEditorRef = useRef(null);
  const editEditorRef = useRef(null);

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

  function handleCoverSelect(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function removeCover() {
    setCoverFile(null);
    setCoverPreview(null);
  }

  function handleEditCoverSelect(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setEditCoverFile(file);
    setEditCoverPreview(URL.createObjectURL(file));
  }

  function removeEditCover() {
    setEditCoverFile(null);
    setEditCoverPreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSavingCreate(true);
    setStatus('Saving...');

    try {
      let featuredMediaId = null;
      if (coverFile) {
        const uploaded = await uploadImageFile(coverFile);
        if (uploaded.id) featuredMediaId = uploaded.id;
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, featuredMediaId })
      });
      const data = await res.json();
      if (data.id) {
        setStatus('✅ Post created!');
        setForm({ title: '', content: '', status: 'draft' });
        setCoverFile(null);
        setCoverPreview(null);
        if (createEditorRef.current) createEditorRef.current.innerHTML = '';
        loadPosts();
      } else {
        setStatus('❌ ' + (data.error || 'Error creating post'));
      }
    } catch (err) {
      setStatus('❌ Request failed');
      console.error(err);
    } finally {
      setSavingCreate(false);
    }
  }

  function openPost(post) {
    setSelectedPost(post);
    setEditForm({
      title: stripHtml(post.title.rendered),
      content: post.content.rendered,
      status: post.status,
    });
    setEditCoverFile(null);
    setEditCoverPreview(post.featured_media_url || null);
  }

  function closeModal() {
    setSelectedPost(null);
    setEditForm(null);
    setEditCoverFile(null);
    setEditCoverPreview(null);
  }

  async function handleUpdate() {
    setUpdating(true);
    try {
      let featuredMediaId;
      if (editCoverFile) {
        const uploaded = await uploadImageFile(editCoverFile);
        if (uploaded.id) featuredMediaId = uploaded.id;
      }

      const res = await fetch(`/api/posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, ...(featuredMediaId ? { featuredMediaId } : {}) })
      });
      const data = await res.json();
      if (data.id) {
        closeModal();
        loadPosts();
      } else {
        alert('Failed to update: ' + (data.error || 'Unknown error'));
      }
    } finally {
      setUpdating(false);
    }
  }

  function requestDelete(id) {
    setConfirmDeleteId(id);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/posts/${confirmDeleteId}`, { method: 'DELETE' });
      setConfirmDeleteId(null);
      closeModal();
      loadPosts();
    } finally {
      setDeleting(false);
    }
  }

  function stripHtml(html) {
    return (html || '').replace(/<[^>]+>/g, '');
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function readTime(content) {
    const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200)) + ' min read';
  }

  function statusBadge(s) {
    if (s === 'publish') return 'bg-black text-white';
    if (s === 'private') return 'bg-white border border-black text-black';
    return 'bg-gray-200 text-gray-700';
  }

  const filteredPosts = posts.filter((p) =>
    stripHtml(p.title.rendered).toLowerCase().includes(search.toLowerCase())
  );

  const inputStyles =
    "w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-black focus:bg-white focus:ring-4 focus:ring-gray-100";

  return (
    <div className="space-y-10">

      {/* Hero header */}
      <div className="rounded-3xl bg-black p-10 text-white shadow-2xl">
        <p className="text-gray-400 font-medium flex items-center gap-2">
          <NotebookPen size={18} /> Blog Management
        </p>
        <h1 className="mt-2 text-4xl font-bold">Blog Posts</h1>
        <p className="mt-3 max-w-2xl text-gray-300">
          Create, edit and organize your Brook articles.
        </p>
      </div>

      {/* Create new post */}
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm max-w-3xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <PenSquare size={20} className="text-black" />
          Create New Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <CoverImageUploader
            preview={coverPreview}
            onSelect={handleCoverSelect}
            onRemove={removeCover}
            title={form.title}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Title</label>
            <input
              className={`${inputStyles} text-lg font-medium`}
              placeholder="Enter a beautiful title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Content</label>
            <RichEditor
              editorRef={createEditorRef}
              initialHtml=""
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Status</label>
            <select
              className={inputStyles}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="publish">Publish</option>
            </select>
          </div>

          <button
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:bg-gray-900 disabled:opacity-50 disabled:hover:scale-100"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <PenSquare size={18} />}
            {saving ? 'Publishing...' : 'Publish Post'}
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
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* All Posts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Posts</h2>

        {filteredPosts.length === 0 && (
          <p className="text-gray-400 text-sm">No posts found.</p>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {filteredPosts.map((p) => (
            <button
              key={p.id}
              onClick={() => openPost(p)}
              className="group text-left rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-black hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-black transition">
                  {stripHtml(p.title.rendered)}
                </h3>
                <span className={`flex-shrink-0 text-xs px-3 py-1 rounded-full font-medium ${statusBadge(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <p className="text-[15px] leading-7 text-gray-500 mb-4">
                {stripHtml(p.content.rendered).slice(0, 170)}...
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-400">
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
          <div className="bg-white rounded-[30px] shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-gray-400 hover:text-black transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-8">Edit Blog Post</h2>

            <div className="space-y-5">
              <CoverImageUploader
                preview={editCoverPreview}
                onSelect={handleEditCoverSelect}
                onRemove={removeEditCover}
                title={editForm.title}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Title</label>
                <input
                  className={`${inputStyles} text-lg font-medium`}
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Content</label>
                <RichEditor
                  editorRef={editEditorRef}
                  initialHtml={editForm.content}
                  onChange={(html) => setEditForm((f) => ({ ...f, content: html }))}
                  minHeight="350px"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Status</label>
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

            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => requestDelete(selectedPost.id)}
                className="flex items-center justify-center gap-2 border border-gray-300 text-gray-900 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
              >
                <Trash2 size={18} />
                Delete
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-black py-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:bg-gray-900"
              >
                <Save size={18} />
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation — centered, never anchored to the top */}
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