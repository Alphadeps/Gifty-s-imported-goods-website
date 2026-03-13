/**
 * configController.js
 * Controller to expose public environment variables to the frontend.
 */

const configController = {
    getPublicConfig: (req, res) => {
        try {
            // Only expose SAFE, public variables. 
            // NEVER include DATABASE_URL, SUPABASE_JWT_SECRET, or SERVICE_ROLE_KEYS here.
            const publicConfig = {
                Backend_URL: process.env.BACKEND_URL || '', // Should match the actual host
                SUPABASE_URL: process.env.SUPABASE_URL || '',
                SUPABASE_KEY: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '',
                
                OWNER_PHONE: process.env.OWNER_PHONE || '',
                OWNER_EMAIL: process.env.OWNER_EMAIL || '',
                WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER || process.env.OWNER_PHONE || '',
                
                STORE_LOCATION: process.env.STORE_LOCATION || "Tema community 1, Site 1, opposite the stadium",
                BUSINESS_HOURS: process.env.BUSINESS_HOURS || "Mon - Sat: 9:00 AM - 7:00 PM",
                
                DEV_MODE: process.env.NODE_ENV === 'development'
            };

            res.status(200).json(publicConfig);
        } catch (error) {
            console.error('Error fetching public config:', error);
            res.status(500).json({ error: 'Failed to retrieve configuration' });
        }
    }
};

module.exports = configController;
