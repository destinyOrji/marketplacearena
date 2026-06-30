import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  status: 'draft' | 'published';
  featured_image?: string;
  category: string;
  tags: string[];
  published_at?: string;
  views: number;
  likes: number;
  shares: number;
  created_at: string;
}

const BlogAdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [admin, setAdmin] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('blogAdminToken');
    const adminData = localStorage.getItem('blogAdmin');
    
    if (!token || !adminData) {
      navigate('/blog-admin/login');
      return;
    }
    
    setAdmin(JSON.parse(adminData));
    fetchPosts();
  }, [filter, navigate]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('blogAdminToken');
      const response = await axios.get(`${API_URL}/blog-admin/posts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: filter === 'all' ? undefined : filter }
      });
      setPosts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const token = localStorage.getItem('blogAdminToken');
      await axios.delete(`${API_URL}/blog-admin/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('blogAdminToken');
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await axios.put(`${API_URL}/blog-admin/posts/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('blogAdminToken');
    localStorage.removeItem('blogAdmin');
    navigate('/blog-admin/login');
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Blog Admin</h1>
                <p className="text-sm text-gray-500">Health Market Arena</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {admin && (
                <span className="text-sm text-gray-600">
                  👤 {admin.name || admin.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
              <p className="text-sm text-gray-500 mt-1">Create and manage blog posts</p>
            </div>
            <Link
              to="/blog-admin/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Create Post
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Posts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Published</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.published}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.draft}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">📄</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex gap-2">
                {(['all', 'published', 'draft'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-4">Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-12 text-center">
                <span className="text-6xl">📝</span>
                <p className="text-gray-500 mt-4">No blog posts found</p>
                <Link
                  to="/blog-admin/create"
                  className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first post →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <div key={post._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {post.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              post.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {post.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>👁️ {post.views} views</span>
                          <span>❤️ {post.likes} likes</span>
                          <span>📅 {new Date(post.created_at).toLocaleDateString()}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/blog-admin/edit/${post._id}`}
                          className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(post._id, post.status)}
                          className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {post.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogAdminDashboard;
