const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Load environment variables
// Always load .env first, then .env.production overrides (if present)
// This ensures PAYSTACK_SECRET_KEY and other production vars are always available
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.production', override: true });

// Debug: log env loading status (remove in production)
console.log(`📋 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`📋 MONGODB_URI: ${process.env.MONGODB_URI ? '✓ set' : '✗ MISSING - check .env.production'}`);
console.log(`📋 EMAIL_USER: ${process.env.EMAIL_USER ? '✓ set' : '✗ not set (email OTP will log to console)'}`);

if (!process.env.MONGODB_URI) {
    console.error('❌ FATAL: MONGODB_URI is not set. Check .env or .env.production file.');
    console.error('Current working directory:', process.cwd());
    const fs = require('fs');
    console.error('.env exists:', fs.existsSync('.env'));
    console.error('.env.production exists:', fs.existsSync('.env.production'));
    process.exit(1);
}

const app = express();

// Trust proxy (required when behind Nginx)
app.set('trust proxy', 1);

// Security Middleware
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again after 15 minutes.'
        });
    },
});

// Apply rate limiter to all routes
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased from 50 — mobile networks share IPs
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts, please try again after 15 minutes.'
        });
    },
});

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// CORS configuration — allow the production domain, localhost variants, and requests
// with no Origin header (mobile apps, Postman, direct API calls)
const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://healthmarketarena.com',
    'https://healthmarketarena.com',
    'https://www.healthmarketarena.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman, same-server requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow any subdomain of healthmarketarena.com
        if (/^https?:\/\/([a-z0-9-]+\.)?healthmarketarena\.com$/.test(origin)) {
            return callback(null, true);
        }
        // In development, allow everything
        if (process.env.NODE_ENV !== 'production') return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200, // Some mobile browsers choke on 204
}));

// ⚠️  Webhook route MUST be registered BEFORE express.json() so it receives the raw body
// Paystack signature verification requires the raw, unparsed request body
app.use('/api/webhooks', require('./routes/webhooks'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/otp', authLimiter, require('./routes/auth')); // OTP alias for frontend
app.use('/api/users', require('./routes/users'));
app.use('/api/professionals', require('./routes/professionals'));
app.use('/api/gym-physio', require('./routes/gymphysio'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/ambulance', require('./routes/ambulance'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/client', require('./routes/client'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
const { providerRouter } = require('./routes/subscriptions');
app.use('/api/subscriptions/provider', providerRouter);
app.use('/api/notifications', require('./routes/notifications'));

// Debug routes (only in development)
if (process.env.NODE_ENV !== 'production') {
    app.use('/api/debug', require('./routes/debug'));
}

// Temporary admin setup routes (REMOVE IN PRODUCTION!)
// These routes allow creating admin users without authentication
// Only for initial setup and testing
app.use('/api/temp', require('./routes/temp-admin-setup'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Health Market Arena API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// 404 handler — always JSON, never HTML
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Global error handler — always JSON
app.use((error, req, res, next) => {
    console.error('Error:', error);

    // CORS errors
    if (error.message && error.message.startsWith('CORS:')) {
        return res.status(403).json({ success: false, message: error.message });
    }

    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 API URL: http://localhost:${PORT}/api`);
});