const { expressjwt: jwt } = require('express-jwt');

// Ensure the SUPABASE_JWT_SECRET environment variable is loaded
if (!process.env.SUPABASE_JWT_SECRET) {
    console.error("FATAL ERROR: SUPABASE_JWT_SECRET is not defined in the environment.");
    process.exit(1);
}

// Authentication middleware using Supabase
const verifyAdminJWT = jwt({
    // Supabase signs tokens with a single symmetric secret key
    secret: process.env.SUPABASE_JWT_SECRET,

    // We expect the HS256 algorithm from Supabase (unlike RS256 from Auth0)
    algorithms: ['HS256']
});

module.exports = {
    verifyAdminJWT
};
