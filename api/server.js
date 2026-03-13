const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Trust the first proxy (Render) for accurate rate limiting
app.set('trust proxy', 1);

// Enable Strict SSL (Helmet covers many security headers, including HSTS)
app.use(helmet());

// Global Security Middleware (Block hidden files and path traversal)
const { blockHiddenFiles } = require('./src/middleware/security');
app.use(blockHiddenFiles);

// Configure CORS
// Allowing requests from the Public Storefront and Admin Dashboard domains
const allowedOrigins = [
    'http://localhost:3000', // Typical Next.js default port
    'http://localhost:3001', // Local Admin Dashboard
    'https://frontend-xi-eight-41.vercel.app',
    process.env.PUBLIC_STOREFRONT_URL,
    process.env.ADMIN_DASHBOARD_URL
].filter(Boolean); // Remove undefined values if env vars aren't set yet

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl) or null (file:// protocol for testing)
        // Also allow local network development origins
        const isLocalNetwork = origin && (
            origin.startsWith('http://127.0.0.1') || 
            origin.startsWith('http://localhost') || 
            origin.startsWith('http://192.168.')
        );

        if (!origin || origin === 'null' || isLocalNetwork || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Configure Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all requests
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

// Error handling middleware for express-jwt
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ error: 'Unauthorized', message: 'Invalid or missing token.' });
    } else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
