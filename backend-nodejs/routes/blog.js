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

// ─── RSS Feed ─────────────────────────────────────────────────────────────────
router.get('/rss', async (req, res) => {
    try {
        const posts = await BlogPost.find({ status: 'published' })
            .sort({ publishedAt: -1 })
            .limit(20);

        const siteUrl = 'https://healthmarketarena.com';

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
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>Health Market Arena Blog</title>
        <link>${siteUrl}/blog</link>
        <description>Stay informed with the latest health insights, medical news, and wellness tips</description>
        <language>en-us</language>
        <atom:link href="${siteUrl}/api/blog/rss" rel="self" type="application/rss+xml" />
        <image>
            <url>${siteUrl}/logo192.png</url>
            <title>Health Market Arena</title>
            <link>${siteUrl}</link>
        </image>
        ${items}
    </channel>
</rss>`;

        res.set('Content-Type', 'application/rss+xml; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(rss);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── Sitemap ──────────────────────────────────────────────────────────────────
router.get('/sitemap.xml', async (req, res) => {
    try {
        const posts = await BlogPost.find({ status: 'published' })
            .select('slug publishedAt updatedAt')
            .sort({ publishedAt: -1 });

        const siteUrl = 'https://healthmarketarena.com';

        const postUrls = posts.map(post => `
    <url>
        <loc>${siteUrl}/blog/${post.slug}</loc>
        <lastmod>${new Date(post.updatedAt || post.publishedAt).toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`).join('');

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>${siteUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
    <url><loc>${siteUrl}/blog</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
    ${postUrls}
</urlset>`;

        res.set('Content-Type', 'application/xml; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(sitemap);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── Pre-render for Google/Facebook bots ──────────────────────────────────────
router.get('/prerender/:slug', async (req, res) => {
    try {
        const post = await BlogPost.findOne({
            slug: req.params.slug,
            status: 'published'
        });

        if (!post) {
            return res.status(404).send('<html><body>Post not found</body></html>');
        }

        const siteUrl = 'https://healthmarketarena.com';
        const postUrl = `${siteUrl}/blog/${post.slug}`;
        const imageUrl = post.featuredImage && post.featuredImage.url
            ? post.featuredImage.url
            : `${siteUrl}/logo192.png`;
        const metaTitle = post.metaTitle || post.title;
        const metaDesc = post.metaDescription || post.excerpt || '';
        const plainContent = post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 500) : '';

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${metaTitle} | Health Market Arena</title>
    <meta name="description" content="${metaDesc}">
    <meta property="og:title" content="${metaTitle}">
    <meta property="og:description" content="${metaDesc}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${postUrl}">
    <meta property="og:type" content="article">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${metaTitle}">
    <meta name="twitter:description" content="${metaDesc}">
    <meta name="twitter:image" content="${imageUrl}">
    <link rel="canonical" href="${postUrl}">
    <script>window.location.href = "${postUrl}";</script>
</head>
<body>
    <article>
        <h1>${post.title}</h1>
        <p>${post.excerpt || ''}</p>
        <p>${plainContent}</p>
        <a href="${postUrl}">Read full article on Health Market Arena</a>
    </article>
</body>
</html>`;

        res.set('Content-Type', 'text/html; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(html);
    } catch (error) {
        res.status(500).send('<html><body>Server error</body></html>');
    }
});

// Get single post by slug (must be last to avoid conflicts)
router.get('/posts/:slug', blogController.getPostBySlug);

// Get related posts
router.get('/posts/:slug/related', blogController.getRelatedPosts);

module.exports = router;
