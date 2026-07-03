const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const BlogPost = require('../models/BlogPost');

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

// RSS Feed - Buffer/Zapier/RSS readers use this
router.get('/rss', async (req, res) => {
    try {
        const posts = await BlogPost.find({ status: 'published' })
            .sort({ publishedAt: -1 })
            .limit(20);

        const siteUrl = 'https://healthmarketarena.com';
        const feedUrl = `${siteUrl}/api/blog/rss`;

        const items = posts.map(post => {
            const postUrl = `${siteUrl}/blog/${post.slug}`;
            const imageTag = post.featuredImage && post.featuredImage.url
                ? `<enclosure url="${post.featuredImage.url}" type="image/jpeg" />`
                : '';
            const pubDate = post.publishedAt
                ? new Date(post.publishedAt).toUTCString()
                : new Date(post.createdAt).toUTCString();

            return `
        <item>
            <title><![CDATA[${post.title}]]></title>
            <link>${postUrl}</link>
            <guid isPermaLink="true">${postUrl}</guid>
            <description><![CDATA[${post.excerpt || ''}]]></description>
            <author>${post.author && post.author.name ? post.author.name : 'Health Market Arena'}</author>
            <category>${post.category || 'General'}</category>
            <pubDate>${pubDate}</pubDate>
            ${imageTag}
        </item>`;
        }).join('\n');

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
    <channel>
        <title>Health Market Arena Blog</title>
        <link>${siteUrl}/blog</link>
        <description>Stay informed with the latest health insights, medical news, and wellness tips</description>
        <language>en-us</language>
        <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
        <image>
            <url>${siteUrl}/logo192.png</url>
            <title>Health Market Arena</title>
            <link>${siteUrl}</link>
        </image>
        ${items}
    </channel>
</rss>`;

        res.set('Content-Type', 'application/rss+xml; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=3600'); // cache 1 hour
        res.send(rss);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single post by slug (must be last to avoid conflicts)
router.get('/posts/:slug', blogController.getPostBySlug);

// Get related posts
router.get('/posts/:slug/related', blogController.getRelatedPosts);

module.exports = router;
