const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const BlogPost = require('../models/BlogPost');

// Simple blog admin authentication middleware
const blogAdminAuth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        if (decoded.role !== 'blog-admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Blog Admin Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Simple hardcoded credentials (you can change these)
        const BLOG_ADMIN_EMAIL = process.env.BLOG_ADMIN_EMAIL || 'blog@healthmarketarena.com';
        const BLOG_ADMIN_PASSWORD = process.env.BLOG_ADMIN_PASSWORD || 'blogadmin123';

        if (email === BLOG_ADMIN_EMAIL && password === BLOG_ADMIN_PASSWORD) {
            const token = jwt.sign(
                { email, role: 'blog-admin' },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            return res.json({
                success: true,
                token,
                admin: { email, name: 'Blog Admin' }
            });
        }

        res.status(401).json({ success: false, message: 'Invalid credentials' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all blog posts (with optional status filter)
router.get('/posts', blogAdminAuth, async (req, res) => {
    try {
        const { status, page = 1, limit = 100 } = req.query;
        
        const query = status ? { status } : {};
        const posts = await BlogPost.find(query)
            .sort({ created_at: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await BlogPost.countDocuments(query);

        res.json({
            success: true,
            data: posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single blog post
router.get('/posts/:id', blogAdminAuth, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new blog post
router.post('/posts', blogAdminAuth, async (req, res) => {
    try {
        const postData = {
            ...req.body,
            created_by: req.admin.email,
            published_at: req.body.status === 'published' ? new Date() : null
        };

        const post = new BlogPost(postData);
        await post.save();

        res.status(201).json({
            success: true,
            data: post,
            message: 'Blog post created successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update blog post
router.put('/posts/:id', blogAdminAuth, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // If changing from draft to published, set published_at
        if (req.body.status === 'published' && post.status === 'draft') {
            req.body.published_at = new Date();
        }

        // If changing from published to draft, clear published_at
        if (req.body.status === 'draft' && post.status === 'published') {
            req.body.published_at = null;
        }

        Object.assign(post, req.body);
        await post.save();

        res.json({
            success: true,
            data: post,
            message: 'Blog post updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete blog post
router.delete('/posts/:id', blogAdminAuth, async (req, res) => {
    try {
        const post = await BlogPost.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        res.json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
