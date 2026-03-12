const { expressjwt: jwt } = require('express-jwt');

// Configuration
// Supabase signs tokens with a single symmetric secret key
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'amagimpa@gmail.com';
const OWNER_PHONE = process.env.OWNER_PHONE || '233244304354';

if (!SUPABASE_JWT_SECRET) {
    console.error("FATAL ERROR: SUPABASE_JWT_SECRET missing in .env");
    process.exit(1);
}

// Authentication middleware using Supabase
const verifyAdminJWT = jwt({
    secret: SUPABASE_JWT_SECRET,
    algorithms: ['HS256']
});

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
