import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const CATEGORIES = [
  'Health Tips', 'Medical News', 'Hospital Updates', 'Emergency Care',
  'Wellness', 'Technology', 'Patient Stories', 'Professional Insights',
  'Fitness', 'Mental Health', 'General'
];

const BlogPostEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: 'General',
    tags: '',
    featured_image: '',
    status: 'draft' as 'draft' | 'published',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('blogAdminToken');
    if (!token) {
      navigate('/blog-admin/login');
      return;
    }
    if (isEdit) fetchPost();
  }, [id, isEdit, navigate]);

  // Update preview whenever featured_image changes
  useEffect(() => {
    setImagePreview(formData.featured_image);
    setImageError(false);
  }, [formData.featured_image]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('blogAdminToken');
      const response = await axios.get(`${API_URL}/blog-admin/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const post = response.data.data;
      const imgUrl = post.featuredImage?.url || post.featured_image || '';
      setFormData({
        title: post.title || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        author: post.author?.name || '',
        category: post.category || 'General',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
        featured_image: imgUrl,
        status: post.status || 'draft',
        meta_title: post.metaTitle || '',
        meta_description: post.metaDescription || '',
        meta_keywords: Array.isArray(post.metaKeywords) ? post.metaKeywords.join(', ') : ''
      });
      setImagePreview(imgUrl);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      alert('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file upload to server
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setImageError(false);
    setUploadingImage(true);

    try {
      const token = localStorage.getItem('blogAdminToken');
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await axios.post(`${API_URL}/blog-admin/upload-image`, formDataUpload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const uploadedUrl = response.data.url;
        setFormData(prev => ({ ...prev, featured_image: uploadedUrl }));
        setImagePreview(uploadedUrl);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Image upload failed. Try using a URL instead.');
      setImagePreview('');
      setFormData(prev => ({ ...prev, featured_image: '' }));
    } finally {
      setUploadingImage(false);
      URL.revokeObjectURL(localUrl);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, featured_image: '' }));
    setImagePreview('');
    setImageError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingImage) {
      alert('Please wait for the image to finish uploading.');
      return;
    }
    setSaving(true);

    try {
      const token = localStorage.getItem('blogAdminToken');
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords
      };

      if (isEdit) {
        await axios.put(`${API_URL}/blog-admin/posts/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/blog-admin/posts`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate('/blog-admin/dashboard');
    } catch (error: any) {
      console.error('Failed to save post:', error);
      alert(error.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              {isEdit ? 'Edit Blog Post' : 'Create New Post'}
            </h1>
            <button
              onClick={() => navigate('/blog-admin/dashboard')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Basic Info ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text" name="title" value={formData.title} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
              <input
                type="text" name="author" value={formData.author} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Author name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category" value={formData.category} onChange={handleChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status" value={formData.status} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <input
                type="text" name="tags" value={formData.tags} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="health, wellness, medical"
              />
            </div>

            {/* ── Featured Image ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Featured Image</label>

              {/* Toggle between upload and URL */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    imageMode === 'upload'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    imageMode === 'url'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Image URL
                </button>
              </div>

              {/* Upload mode */}
              {imageMode === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                      uploadingImage
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-600">Uploading image...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">Click to upload image</span>
                        <span className="text-xs">JPG, PNG, GIF, WebP — max 5MB</span>
                      </div>
                    )}
                  </label>
                </div>
              )}

              {/* URL mode */}
              {imageMode === 'url' && (
                <input
                  type="text"
                  name="featured_image"
                  value={formData.featured_image}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/your-image.jpg"
                />
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3">
                  <div className="relative inline-block">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Preview:</p>
                    {imageError ? (
                      <div className="w-full max-w-sm h-40 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-xs">Image could not load</p>
                          <p className="text-xs text-gray-400">Check the URL is correct</p>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        onError={() => setImageError(true)}
                        className="max-w-sm w-full h-40 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Current URL display */}
              {formData.featured_image && (
                <p className="mt-2 text-xs text-gray-400 truncate">
                  📎 {formData.featured_image}
                </p>
              )}
            </div>
          </div>

          {/* ── Content ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Content</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
              <textarea
                name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief summary shown in blog list (auto-generated if empty)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
              <textarea
                name="content" value={formData.content} onChange={handleChange} required rows={18}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Write your blog post content here. You can use HTML tags for formatting..."
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Use HTML for formatting — &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;img src="..."&gt;
              </p>
            </div>
          </div>

          {/* ── SEO ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">SEO Settings <span className="text-sm font-normal text-gray-400">(optional)</span></h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
              <input
                type="text" name="meta_title" value={formData.meta_title} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Defaults to post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <textarea
                name="meta_description" value={formData.meta_description} onChange={handleChange} rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Defaults to excerpt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
              <input
                type="text" name="meta_keywords" value={formData.meta_keywords} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-between pb-8">
            <button
              type="button" onClick={() => navigate('/blog-admin/dashboard')}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              {/* Save as draft */}
              {formData.status === 'published' && (
                <button
                  type="button"
                  disabled={saving || uploadingImage}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, status: 'draft' }));
                    setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
              )}
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading image...
                  </>
                ) : (
                  isEdit ? 'Update Post' : (formData.status === 'published' ? 'Publish Post' : 'Save Draft')
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default BlogPostEditor;
