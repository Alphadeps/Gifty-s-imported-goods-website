const fs = require('fs');
const path = require('path');

/**
 * inject-env.js
 * 
 * This script runs during the Vercel build process.
 * It reads environment variables from the Vercel dashboard 
 * and injects them into the frontend/config.js file.
 */

const configPath = path.join(__dirname, 'frontend', 'config.js');

const configContent = `
/**
 * config.js
 * Generated at build time by inject-env.js
 */
window.CONFIG = {
    Backend_URL: "${process.env.Backend_URL || 'https://gifty-s-imported-goods-website.onrender.com'}",
    SUPABASE_URL: "${process.env.SUPABASE_URL || ''}",
    SUPABASE_KEY: "${process.env.SUPABASE_KEY || ''}",
    
    OWNER_PHONE: "${process.env.OWNER_PHONE || ''}",
    OWNER_EMAIL: "${process.env.OWNER_EMAIL || ''}",
    WHATSAPP_NUMBER: "${process.env.WHATSAPP_NUMBER || ''}",
    
    STORE_LOCATION: "${process.env.STORE_LOCATION || 'Tema community 1, Site 1, opposite the stadium'}",
    BUSINESS_HOURS: "${process.env.BUSINESS_HOURS || 'Mon - Sat: 9:00 AM - 7:00 PM'}",
    
    DEV_MODE: ${process.env.NODE_ENV === 'development'}
};
`;

try {
    fs.writeFileSync(configPath, configContent);
    console.log('Successfully injected environment variables into config.js');
} catch (error) {
    console.error('Failed to inject environment variables:', error);
    process.exit(1);
}
