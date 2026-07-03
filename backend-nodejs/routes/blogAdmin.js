const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const BlogPost = require('../models/BlogPost');
const BlogAdmin = require('../models/BlogAdmin');
const mongoose = require('mongoose');

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100);
}

async function uniqueSlug(baseSlug) {
    let slug = baseSlug;
    let count = 1;
    while (await BlogPost.findOne({ slug })) {
        slug = `${baseSlug}-${count}`;
        count++;
    }
    return slug;
}

const VALID_CATEGORIES = [
    'Health Tips', 'Medical News', 'Hospital Updates', 'Emergency Care',
    'Wellness', 'Technology', 'Patient Stories', 'Professional Insights',
    'Fitness', 'Mental Health', 'General'
];

const CATEGORY_MAP = {
    'health': 'Health Tips', 'Health': 'Health Tips',
    'medical': 'Medical News', 'Medical': 'Medical News',
    'news': 'Medical News', 'News': 'Medical News',
    'wellness': 'Wellness', 'technology': 'Technology',
    'fitness': 'Fitness', 'mental health': 'Mental Health',
    'hospital': 'Hospital Updates', 'emergency': 'Emergency Care',
    'patient': 'Patient Stories', 'professional': 'Professional Insights',
    'general': 'General',
};

function normalizeCategory(cat) {
    if (!cat) return 'General';
    if (VALID_CATEGORIES.includes(cat)) return cat;
    return CATEGORY_MAP[cat] || 'General';
}

// ─── Auth Middleware ─────────────────────────────────────────────────────────

const blogAdminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        if (decoded.role !== 'blog-admin' && decoded.role !== 'blog-editor') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Load admin from DB to confirm they are still active
        const admin = await BlogAdmin.findById(decoded.id);
        if (!admin || !admin.isActive) {
            return res.status(401).json({ success: false, message: 'Account not found or disabled' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

// ─── Login ───────────────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Find admin in database (include password field)
        const admin = await BlogAdmin.findOne({ email: email.toLowerCase() }).select('+password');

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!admin.isActive) {
            return res.status(401).json({ success: false, message: 'Account is disabled. Contact the platform admin.' });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save({ validateBeforeSave: false });

        // Sign JWT
        const token = jwt.sign(
            { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                avatar: admin.avatar
            }
        });
    } catch (error) {
        console.error('Blog admin login error:', error.message);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// ─── Change Password ──────────────────────────────────────────────────────────

router.put('/change-password', blogAdminAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const admin = await BlogAdmin.findById(req.admin._id).select('+password');
        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        admin.password = newPassword;
        await admin.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── Get Profile ──────────────────────────────────────────────────────────────

router.get('/profile', blogAdminAuth, async (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.admin._id,
            name: req.admin.name,
            email: req.admin.email,
            role: req.admin.role,
            avatar: req.admin.avatar,
            lastLogin: req.admin.lastLogin
        }
    });
});

// ─── Update Profile ───────────────────────────────────────────────────────────

router.put('/profile', blogAdminAuth, async (req, res) => {
    try {
        const { name, avatar } = req.body;
        const admin = await BlogAdmin.findById(req.admin._id);

        if (name) admin.name = name;
        if (avatar) admin.avatar = avatar;

        await admin.save();

        res.json({
            success: true,
            message: 'Profile updated',
            data: { id: admin._id, name: admin.name, email: admin.email, avatar: admin.avatar }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── Blog Posts CRUD ──────────────────────────────────────────────────────────

// Get all posts
router.get('/posts', blogAdminAuth, async (req, res) => {
    try {
        const { status, page = 1, limit = 100 } = req.query;
        const query = status ? { status } : {};

        const posts = await BlogPost.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await BlogPost.countDocuments(query);

        res.json({
            success: true,
            data: posts,
            pagination: { page: parseInt(page), limit: parseInt(limit), total }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single post
router.get('/posts/:id', blogAdminAuth, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create post
router.post('/posts', blogAdminAuth, async (req, res) => {
    try {
        const {
            title, content, excerpt, author, category, tags,
            featured_image, featuredImage, status,
            meta_title, meta_description, meta_keywords, seo
        } = req.body;

        if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
        if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

        const baseSlug = generateSlug(title);
        const slug = await uniqueSlug(baseSlug);

        const authorName = typeof author === 'string' ? author : (author?.name || req.admin.name);
        const imageUrl = featured_image || (typeof featuredImage === 'string' ? featuredImage : featuredImage?.url) || '';

        const postData = {
            title,
            slug,
            content,
            excerpt: excerpt || '',
            author: {
                id: req.admin._id,  // Use the real DB admin ID
                name: authorName,
                avatar: req.admin.avatar
            },
            category: normalizeCategory(category),
            tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
            featuredImage: imageUrl ? { url: imageUrl, alt: title } : undefined,
            status: status || 'draft',
            publishedAt: status === 'published' ? new Date() : undefined,
            metaTitle: meta_title || (seo && seo.meta_title) || '',
            metaDescription: meta_description || (seo && seo.meta_description) || '',
            metaKeywords: meta_keywords
                ? (typeof meta_keywords === 'string' ? meta_keywords.split(',').map(k => k.trim()).filter(Boolean) : meta_keywords)
                : (seo && seo.meta_keywords ? [seo.meta_keywords] : []),
        };

        const post = new BlogPost(postData);
        await post.save();

        res.status(201).json({ success: true, data: post, message: 'Blog post created successfully' });
    } catch (error) {
        console.error('Blog post creation error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update post
router.put('/posts/:id', blogAdminAuth, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const {
            title, content, excerpt, author, category, tags,
            featured_image, featuredImage, status,
            meta_title, meta_description, meta_keywords, seo
        } = req.body;

        if (title) post.title = title;
        if (content !== undefined) post.content = content;
        if (excerpt !== undefined) post.excerpt = excerpt;
        if (category) post.category = normalizeCategory(category);
        if (tags !== undefined) {
            post.tags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
        }
        if (author) {
            post.author = {
                id: req.admin._id,
                name: typeof author === 'string' ? author : (author?.name || req.admin.name),
            };
        }

        const imageUrl = featured_image || (typeof featuredImage === 'string' ? featuredImage : featuredImage?.url);
        if (imageUrl !== undefined) {
            post.featuredImage = imageUrl ? { url: imageUrl, alt: post.title } : undefined;
        }

        if (status && status !== post.status) {
            post.status = status;
            if (status === 'published' && !post.publishedAt) post.publishedAt = new Date();
            if (status === 'draft') post.publishedAt = undefined;
        }

        if (meta_title || (seo && seo.meta_title)) post.metaTitle = meta_title || seo.meta_title;
        if (meta_description || (seo && seo.meta_description)) post.metaDescription = meta_description || seo.meta_description;
        if (meta_keywords) {
            post.metaKeywords = typeof meta_keywords === 'string'
                ? meta_keywords.split(',').map(k => k.trim()).filter(Boolean)
                : meta_keywords;
        }

        await post.save();
        res.json({ success: true, data: post, message: 'Blog post updated successfully' });
    } catch (error) {
        console.error('Blog post update error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete post
router.delete('/posts/:id', blogAdminAuth, async (req, res) => {
    try {
        const post = await BlogPost.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        res.json({ success: true, message: 'Blog post deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
