const BlogPost = require('../../models/BlogPost');
const slugify = require('slugify');

/**
 * Get all blog posts for admin (including drafts)
 * GET /api/admin/blog/posts
 */
exports.getAllPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      category,
      search 
    } = req.query;

    const query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .select('-content') // Exclude full content
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      BlogPost.countDocuments(query)
    ]);

    // Get stats
    const stats = await BlogPost.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObject = stats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        postsPerPage: parseInt(limit)
      },
      stats: {
        total: total,
        published: statsObject.published || 0,
        draft: statsObject.draft || 0,
        scheduled: statsObject.scheduled || 0,
        archived: statsObject.archived || 0
      }
    });

  } catch (error) {
    console.error('Error fetching admin blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message
    });
  }
};

/**
 * Get single blog post by ID for editing
 * GET /api/admin/blog/posts/:id
 */
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

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
 * Create new blog post
 * POST /api/admin/blog/posts
 */
exports.createPost = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
      allowComments,
      isFeatured,
      scheduledFor
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Generate slug if not provided
    let postSlug = slug;
    if (!postSlug) {
      postSlug = slugify(title, { lower: true, strict: true });
    } else {
      postSlug = slugify(postSlug, { lower: true, strict: true });
    }

    // Check if slug already exists
    const existingPost = await BlogPost.findOne({ slug: postSlug });
    if (existingPost) {
      // Append timestamp to make it unique
      postSlug = `${postSlug}-${Date.now()}`;
    }

    // Get admin info from req.admin (set by adminAuth middleware)
    const author = {
      id: req.admin._id,
      name: req.admin.name || req.admin.email,
      avatar: req.admin.avatar || null
    };

    // Create post
    const post = new BlogPost({
      title,
      slug: postSlug,
      excerpt,
      content,
      featuredImage,
      author,
      category: category || 'General',
      tags: tags || [],
      status: status || 'draft',
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      metaKeywords: metaKeywords || [],
      allowComments: allowComments !== undefined ? allowComments : true,
      isFeatured: isFeatured || false,
      scheduledFor: scheduledFor || null
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: post
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog post',
      error: error.message
    });
  }
};

/**
 * Update blog post
 * PUT /api/admin/blog/posts/:id
 */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If slug is being updated, ensure it's unique
    if (updates.slug) {
      updates.slug = slugify(updates.slug, { lower: true, strict: true });
      const existingPost = await BlogPost.findOne({ 
        slug: updates.slug,
        _id: { $ne: id }
      });
      if (existingPost) {
        return res.status(400).json({
          success: false,
          message: 'A post with this slug already exists'
        });
      }
    }

    const post = await BlogPost.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: post
    });

  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog post',
      error: error.message
    });
  }
};

/**
 * Delete blog post
 * DELETE /api/admin/blog/posts/:id
 */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post',
      error: error.message
    });
  }
};

/**
 * Publish blog post (and trigger social sharing)
 * POST /api/admin/blog/posts/:id/publish
 */
exports.publishPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { autoShare = false } = req.body;

    const post = await BlogPost.findByIdAndUpdate(
      id,
      { 
        status: 'published',
        publishedAt: new Date()
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // TODO: Trigger social media sharing if autoShare is true
    // This will be implemented in Phase 3
    if (autoShare) {
      console.log('Auto-share will be implemented in Phase 3');
      // await socialMediaService.shareToAllPlatforms(post);
    }

    res.json({
      success: true,
      message: 'Blog post published successfully',
      data: post
    });

  } catch (error) {
    console.error('Error publishing blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish blog post',
      error: error.message
    });
  }
};

/**
 * Bulk delete posts
 * POST /api/admin/blog/posts/bulk-delete
 */
exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post IDs are required'
      });
    }

    const result = await BlogPost.deleteMany({
      _id: { $in: ids }
    });

    res.json({
      success: true,
      message: `${result.deletedCount} blog post(s) deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error bulk deleting posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog posts',
      error: error.message
    });
  }
};

/**
 * Get blog analytics
 * GET /api/admin/blog/analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    // Total posts
    const totalPosts = await BlogPost.countDocuments();

    // Posts by status
    const postsByStatus = await BlogPost.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Total views
    const viewsResult = await BlogPost.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewCount' }
        }
      }
    ]);

    // Most viewed posts
    const mostViewed = await BlogPost.find({ status: 'published' })
      .select('title slug viewCount')
      .sort({ viewCount: -1 })
      .limit(5)
      .lean();

    // Posts by category
    const postsByCategory = await BlogPost.aggregate([
      {
        $match: { status: 'published' }
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

    // Recent posts
    const recentPosts = await BlogPost.find()
      .select('title status publishedAt viewCount')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        totalPosts,
        totalViews: viewsResult[0]?.totalViews || 0,
        postsByStatus: postsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        mostViewed,
        postsByCategory: postsByCategory.map(cat => ({
          category: cat._id,
          count: cat.count
        })),
        recentPosts
      }
    });

  } catch (error) {
    console.error('Error fetching blog analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog analytics',
      error: error.message
    });
  }
};
