import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
  viewCount: number;
}

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    if (post) {
      // Update page title
      document.title = `${post.title} | Health Market Arena Blog`;

      // Add Open Graph meta tags for social media sharing
      const metaTags = [
        { property: 'og:title', content: post.title },
        { property: 'og:description', content: post.excerpt },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: window.location.href },
        { property: 'og:site_name', content: 'Health Market Arena' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: post.title },
        { name: 'twitter:description', content: post.excerpt },
        { name: 'description', content: post.excerpt },
      ];

      // Add featured image if available
      if (post.featuredImage?.url) {
        metaTags.push(
          { property: 'og:image', content: post.featuredImage.url },
          { name: 'twitter:image', content: post.featuredImage.url }
        );
      }

      // Add author if available
      if (post.author?.name) {
        metaTags.push(
          { property: 'article:author', content: post.author.name },
          { name: 'author', content: post.author.name }
        );
      }

      // Add published date
      if (post.publishedAt) {
        metaTags.push({ property: 'article:published_time', content: post.publishedAt });
      }

      // Add category and tags
      if (post.category) {
        metaTags.push({ property: 'article:section', content: post.category });
      }
      if (post.tags && post.tags.length > 0) {
        post.tags.forEach(tag => {
          metaTags.push({ property: 'article:tag', content: tag });
        });
      }

      // Remove existing meta tags and add new ones
      metaTags.forEach(({ property, name, content }) => {
        const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
        let tag = document.querySelector(selector) as HTMLMetaElement;
        
        if (!tag) {
          tag = document.createElement('meta');
          if (property) tag.setAttribute('property', property);
          if (name) tag.setAttribute('name', name);
          document.head.appendChild(tag);
        }
        
        tag.content = content;
      });

      // Cleanup function to reset title when component unmounts
      return () => {
        document.title = 'Health Market Arena';
      };
    }
  }, [post]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API_URL}/blog/posts/${slug}`);
      if (response.data.success) {
        setPost(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching blog post:', err);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This blog post does not exist.'}</p>
          <Link
            to="/blog"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/blog"
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          {/* Category */}
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full mb-4">
            {post.category}
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 mb-6">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b">
            <div className="flex items-center gap-3">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
                  {post.author.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{post.author.name}</p>
                <p className="text-sm text-gray-500">{formatDate(post.publishedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{post.readTime} min read</span>
              <span>•</span>
              <span>{post.viewCount} views</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage?.url && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={post.featuredImage.url}
              alt={post.featuredImage.alt || post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="border-t pt-6 mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share Buttons */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Share this article:</h3>
          <div className="flex gap-3">
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${post.title}`, '_blank')}
              className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium"
            >
              Twitter
            </button>
            <button
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank')}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
            >
              LinkedIn
            </button>
            <button
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Facebook
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage;
