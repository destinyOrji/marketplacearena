const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

/**
 * Public Blog Routes
 * Base path: /api/blog
 */

// Get all published posts with pagination and filters
router.get('/posts', blogController.getAllPosts);

// Get featured posts
router.get('/featured', blogController.getFeaturedPosts);

// Get all categories
router.get('/categories', blogController.getCategories);

// Search posts
router.get('/search', blogController.searchPosts);

// Get single post by slug (must be last to avoid conflicts)
router.get('/posts/:slug', blogController.getPostBySlug);

// Get related posts
router.get('/posts/:slug/related', blogController.getRelatedPosts);

module.exports = router;
