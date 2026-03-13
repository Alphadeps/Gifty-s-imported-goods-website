/**
 * config.js
 * Primary configuration for the storefront.
 * This file uses placeholders that should be replaced with environment variables.
 */
window.CONFIG = {
    // API and Auth Configuration
    Backend_URL: "VITE_BACKEND_URL_PLACEHOLDER", // e.g. https://api.yoursite.com
    SUPABASE_URL: "VITE_SUPABASE_URL_PLACEHOLDER",
    SUPABASE_KEY: "VITE_SUPABASE_ANON_KEY_PLACEHOLDER", // Use public 'anon' key only
    
    // Business Identity
    OWNER_PHONE: "VITE_OWNER_PHONE_PLACEHOLDER", // e.g. 233244304354
    OWNER_EMAIL: "VITE_OWNER_EMAIL_PLACEHOLDER",
    WHATSAPP_NUMBER: "VITE_WHATSAPP_NUMBER_PLACEHOLDER", // Numbers only, no '+'
    
    // Location Details
    STORE_LOCATION: "Tema community 1, Site 1, opposite the stadium",
    BUSINESS_HOURS: "Mon - Sat: 9:00 AM - 7:00 PM",
    
    DEV_MODE: false
};
