const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const OWNER_EMAIL = process.env.OWNER_EMAIL;
const OWNER_PHONE = process.env.OWNER_PHONE;

// Authentication middleware using Supabase JWKS for ES256 verification
let verifyAdminJWT = (req, res, next) => next(); // Fallback

if (SUPABASE_URL) {
    try {
        verifyAdminJWT = jwt({
            secret: jwksRsa.expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`
            }),
            algorithms: ['RS256', 'ES256']
        });
    } catch (err) {
        console.error("Auth Middleware Error: Failed to initialize JWT protection", err.message);
    }
} else {
    console.error("CRITICAL: SUPABASE_URL is missing. Admin access will be disabled.");
}

// Authorization middleware to restrict to owner only
const restrictToOwner = (req, res, next) => {
    // Supabase attributes: email (for email auth) and phone (for phone auth)
    const userEmail = req.auth?.email;
    const userPhone = req.auth?.phone; // Supabase adds this for phone identity
    
    // Normalize phone for comparison (remove +)
    const normalizedPhone = userPhone ? userPhone.replace(/\+/g, '') : null;
    
    const isOwnerByEmail = userEmail && userEmail === OWNER_EMAIL;
    const isOwnerByPhone = normalizedPhone && normalizedPhone === OWNER_PHONE;

    if (!isOwnerByEmail && !isOwnerByPhone) {
        console.warn(`Access denied for: Email=${userEmail || 'N/A'}, Phone=${userPhone || 'N/A'}`);
        return res.status(403).json({ 
            error: 'Forbidden', 
            message: 'You do not have permission to access the admin dashboard.' 
        });
    }
    next();
};

module.exports = {
    verifyAdminJWT,
    restrictToOwner
};
