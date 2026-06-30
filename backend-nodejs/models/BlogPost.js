const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  excerpt: {
    type: String,
    maxLength: [300, 'Excerpt cannot exceed 300 characters'],
    default: ''
  },
  
  content: {
    type: String,
    required: [true, 'Post content is required']
  },
  
  featuredImage: {
    url: String,
    alt: String,
    width: Number,
    height: Number
  },
  
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    name: String,
    avatar: String
  },
  
  category: {
    type: String,
    enum: [
      'Health Tips',
      'Medical News',
      'Hospital Updates',
      'Emergency Care',
      'Wellness',
      'Technology',
      'Patient Stories',
      'Professional Insights',
      'Fitness',
      'Mental Health',
      'General'
    ],
    default: 'General'
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'archived'],
    default: 'draft'
  },
  
  publishedAt: Date,
  scheduledFor: Date,
  
  // SEO Fields
  metaTitle: {
    type: String,
    maxLength: [60, 'Meta title cannot exceed 60 characters']
  },
  
  metaDescription: {
    type: String,
    maxLength: [160, 'Meta description cannot exceed 160 characters']
  },
  
  metaKeywords: [{
    type: String,
    trim: true
  }],
  
  // Social Media Sharing
  socialShared: {
    twitter: {
      shared: { type: Boolean, default: false },
      sharedAt: Date,
      postId: String
    },
    linkedin: {
      shared: { type: Boolean, default: false },
      sharedAt: Date,
      postId: String
    },
    facebook: {
      shared: { type: Boolean, default: false },
      sharedAt: Date,
      postId: String
    }
  },
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  
  shareCount: {
    type: Number,
    default: 0
  },
  
  likeCount: {
    type: Number,
    default: 0
  },
  
  // Settings
  allowComments: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Read time estimate (in minutes)
  readTime: {
    type: Number,
    default: 5
  }
  
}, {
  timestamps: true
});

// Indexes for better query performance
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ category: 1, status: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ 'author.id': 1 });

// Virtual for URL
blogPostSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

// Method to increment view count
blogPostSchema.methods.incrementViews = async function() {
  this.viewCount += 1;
  return await this.save();
};

// Static method to get published posts
blogPostSchema.statics.getPublished = function(filters = {}) {
  return this.find({ 
    status: 'published',
    publishedAt: { $lte: new Date() },
    ...filters
  }).sort({ publishedAt: -1 });
};

// Static method to get featured posts
blogPostSchema.statics.getFeatured = function(limit = 3) {
  return this.find({ 
    status: 'published',
    isFeatured: true,
    publishedAt: { $lte: new Date() }
  })
  .sort({ publishedAt: -1 })
  .limit(limit);
};

// Pre-save hook to calculate read time
blogPostSchema.pre('save', function(next) {
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Pre-save hook to auto-generate excerpt if not provided
blogPostSchema.pre('save', function(next) {
  if (!this.excerpt && this.content) {
    // Strip HTML tags and get first 150 characters
    const plainText = this.content.replace(/<[^>]*>/g, '');
    this.excerpt = plainText.substring(0, 150).trim() + '...';
  }
  next();
});

// Pre-save hook to set publishedAt date
blogPostSchema.pre('save', function(next) {
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;
