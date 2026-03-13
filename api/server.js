const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Trust the first proxy (Render) for accurate rate limiting
app.set('trust proxy', 1);

// 1. Configure CORS (Simplified to prevent crashes)
const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'https://frontend-xi-eight-41.vercel.app',
    'https://gifty-s-imported-goods-website.vercel.app',
    process.env.PUBLIC_STOREFRONT_URL,
    process.env.ADMIN_DASHBOARD_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// 2. Security Headers (Temporarily Disabled for debugging)
// app.use(helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//     crossOriginEmbedderPolicy: false
// }));

// 3. Verbose Logger for Debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 4. Block hidden files and path traversal
const { blockHiddenFiles } = require('./src/middleware/security');
app.use(blockHiddenFiles);

// Configure Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    standardHeaders: true, 
    legacyHeaders: false, 
    message: 'Too many requests'
});

// Apply rate limiting
app.use(limiter);

// Middleware to parse JSON
app.use(express.json());

// Import Domain Routers
const publicRoutes = require('./src/routes/publicRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Keep-alive endpoint for cronjobs
app.get('/keep-alive', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is alive', timestamp: new Date().toISOString() });
});


// Obfuscation Middleware (Applies to all protected and public API responses)
const { obfuscateResponse } = require('./src/middleware/obfuscation');
app.use('/api/v1', obfuscateResponse);

// Public routes (Unsecured)
app.use('/api/v1/public', publicRoutes);

// Admin routes (Secured - restricted to owner only via Supabase Auth)
const { verifyAdminJWT, restrictToOwner } = require('./src/middleware/auth');
app.use('/api/v1/admin', verifyAdminJWT, restrictToOwner, adminRoutes);

// Final Error handling middleware
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err);
    
    // Set status code (default to 500)
    const statusCode = err.status || err.statusCode || 500;
    
    res.status(statusCode).json({ 
        error: err.name || 'Internal Server Error', 
        message: err.message || 'An unexpected error occurred',
        path: req.path
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
