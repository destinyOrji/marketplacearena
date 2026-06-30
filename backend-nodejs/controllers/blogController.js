const BlogPost = require('../models/BlogPost');

/**
 * Get all published blog posts (public)
 * GET /api/blog/posts
 */
exports.getAllPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search,
      tag 
    } = req.query;

    const query = { 
      status: 'published',
      publishedAt: { $lte: new Date() }
    };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Search in title and content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .select('-content') // Exclude full content for list view
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      BlogPost.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        postsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message
    });
  }
};

/**
 * Get single blog post by slug (public)
 * GET /api/blog/posts/:slug
 */
exports.getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await BlogPost.findOne({ 
      slug,
      status: 'published'
    }).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count (fire and forget)
    BlogPost.findByIdAndUpdate(post._id, { $inc: { viewCount: 1 } }).exec();

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      error: error.message
    });
  }
};

/**
 * Get featured posts (public)
 * GET /api/blog/posts/featured
 */
exports.getFeaturedPosts = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const posts = await BlogPost.getFeatured(parseInt(limit));

    res.json({
      success: true,
      data: posts
    });

  } catch (error) {
    console.error('Error fetching featured posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured posts',
      error: error.message
    });
  }
};

/**
 * Get related posts (public)
 * GET /api/blog/posts/:slug/related
 */
exports.getRelatedPosts = async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 3 } = req.query;

    // Find current post
    const currentPost = await BlogPost.findOne({ slug }).lean();
    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Find related posts by category and tags
    const relatedPosts = await BlogPost.find({
      _id: { $ne: currentPost._id },
      status: 'published',
      $or: [
        { category: currentPost.category },
        { tags: { $in: currentPost.tags || [] } }
      ]
    })
    .select('-content')
    .sort({ publishedAt: -1 })
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      data: relatedPosts
    });

  } catch (error) {
    console.error('Error fetching related posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related posts',
      error: error.message
    });
  }
};

/**
 * Get all categories with post counts (public)
 * GET /api/blog/categories
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await BlogPost.aggregate([
      { 
        $match: { 
          status: 'published',
          publishedAt: { $lte: new Date() }
        } 
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: categories.map(cat => ({
        name: cat._id,
        count: cat.count
      }))
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

/**
 * Search blog posts (public)
 * GET /api/blog/search
 */
exports.searchPosts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const posts = await BlogPost.find({
      status: 'published',
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    })
    .select('-content')
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      data: posts,
      count: posts.length
    });

  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};
