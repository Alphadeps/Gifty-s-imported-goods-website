/**
 * admin.js
 * Core logic for the Admin Dashboard.
 * Handles authentication, API communication, and common UI interactions.
 */

let API_BASE_URL = '';
let ADMIN_API_URL = '';

/**
 * Initialize Admin Configuration Dynamically
 */
async function initAdminConfig() {
    const renderUrl = 'https://gifty-s-imported-goods-website.onrender.com';

    // 1. Check for build-time injection
    if (window.CONFIG && window.CONFIG.Backend_URL && !window.CONFIG.Backend_URL.includes('PLACEHOLDER')) {
        API_BASE_URL = window.CONFIG.Backend_URL;
        ADMIN_API_URL = `${API_BASE_URL}/api/v1/admin`;
        return true;
    }

    try {
        const response = await fetch(`${renderUrl}/api/v1/public/config`);
        const config = await response.json();
        window.CONFIG = config;
        
        API_BASE_URL = config.Backend_URL || config.BACKEND_URL || renderUrl;
        ADMIN_API_URL = `${API_BASE_URL}/api/v1/admin`;
        return true;
    } catch (error) {
        console.error('Admin Config Fallback Error:', error);
        API_BASE_URL = renderUrl;
        ADMIN_API_URL = `${API_BASE_URL}/api/v1/admin`;
        return false;
    }
}

// --- Supabase Configuration ---
let supabaseClient = null;

const initSupabase = () => {
    // Pull configuration from config.js
    const supabaseUrl = window.CONFIG?.SUPABASE_URL;
    const supabaseKey = window.CONFIG?.SUPABASE_KEY;
    
    if (window.supabase && supabaseUrl && supabaseKey) {
        // AGGRESSIVE: If we just logged out, don't even let Supabase look for a session
        const forceNoPersist = window.location.search.includes('logout=success');
        
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: !forceNoPersist,
                autoRefreshToken: !forceNoPersist,
                detectSessionInUrl: !forceNoPersist
            }
        });

        if (forceNoPersist) {
            console.log("Admin: Session persistence disabled for this visit.");
        }
    }
};

// --- Authentication Logic ---
const auth = {
    isLoggingOut: false,
    // Initialize Auth Client
    init: async () => {
        await initAdminConfig();
        initSupabase();
        await auth.checkAuth();
    },

    // Check if user is authenticated
    isAuthenticated: async () => {
        if (!supabaseClient) initSupabase();
        if (!supabaseClient) return false;
        
        try {
            // getSession is fast but can be stale; getUser is more authoritative
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) return false;

            const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
            if (userError || !user) {
                // If getUser fails but session existed, clean up
                localStorage.removeItem('admin_user');
                return false;
            }
            
            // If session exists, ensure local user state is also present
            if (!localStorage.getItem('admin_user')) {
                localStorage.setItem('admin_user', JSON.stringify(user));
            }
            
            return true;
        } catch (e) {
            console.error("Auth check failed:", e);
            return false;
        }
    },

    // Login with Supabase (Email/Password)
    login: async (email, password) => {
        if (!supabaseClient) initSupabase();

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        
        // Backend also verifies the email, so this is double-secured
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        return true;
    },

    logout: async () => {
        auth.isLoggingOut = true;
        if (!supabaseClient) initSupabase();
        
        try {
            // 0. Aggressive session reset
            await supabaseClient.auth.setSession({ access_token: null, refresh_token: null });
            await supabaseClient.auth.signOut({ scope: 'global' });
        } catch (e) {
            console.error("Logout error:", e);
        } finally {
            // 1. Clear all standard storage
            localStorage.clear(); 
            // Also iterate and remove supabase specific keys just in case
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.includes('supabase')) localStorage.removeItem(key);
            }
            sessionStorage.clear();
            
            // 2. Explicitly kill cookies
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const name = cookies[i].split("=")[0].trim();
                if (name.startsWith('sb-') || name.includes('supabase')) {
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/admin";
                }
            }

            // 3. NUCLEAR: Clear IndexedDB (Supabase hides tokens here)
            try {
                const dbs = await window.indexedDB.databases();
                for (const dbInfo of dbs) {
                    if (dbInfo.name && (dbInfo.name.includes('supabase') || dbInfo.name.includes('firebase'))) {
                        window.indexedDB.deleteDatabase(dbInfo.name);
                        console.log(`Admin: Deleted database ${dbInfo.name}`);
                    }
                }
            } catch (err) {
                console.error("IndexedDB clearing failed:", err);
            }

            // 4. Final delay and redirect
            setTimeout(() => {
                window.location.replace('login.html?logout=success');
            }, 500);
        }
    },

    // Enforce authentication on protected pages
    checkAuth: async () => {
        if (auth.isLoggingOut) return;
        
        // Skip check if we just logged out to prevent redirect loop
        if (window.location.search.includes('logout=success')) {
            console.log("Admin: Skipping auth check after logout");
            return;
        }

        // Bypass auth if in development mode
        if (window.CONFIG?.DEV_MODE) {
            console.log("Admin: Auth bypass enabled (DEV_MODE)");
            return;
        }
        
        const isAuth = await auth.isAuthenticated();
        const currentPath = window.location.pathname.toLowerCase();
        console.log("Admin: Auth Check - isAuth:", isAuth, "Path:", currentPath);
        
        // Robust check for login page across different URL formats (Vercel clean URLs vs .html)
        const isLoginPage = currentPath.endsWith('login') || currentPath.endsWith('login.html');

        if (!isAuth && !isLoginPage) {
            window.location.replace('login.html'); // Use replace to avoid history pollution
        } else if (isAuth && isLoginPage) {
            window.location.replace('products.html');
        }
    },

    getAuthHeader: async () => {
        if (!supabaseClient) initSupabase();
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            return session ? { 'Authorization': `Bearer ${session.access_token}` } : {};
        } catch (e) {
            console.error("Failed to get session:", e);
            return {};
        }
    },

    // --- Phone OTP Flow ---

    // 1. Request Phone OTP
    loginWithPhone: async (phone) => {
        if (!supabaseClient) initSupabase();

        // Security check - normalize phone to compare
        const normalizedPhone = phone.replace(/\+/g, '');

        const { error } = await supabaseClient.auth.signInWithOtp({
            phone: `+${normalizedPhone}`
        });

        if (error) throw error;
        return true;
    },

    // 2. Verify Phone OTP
    verifyPhoneOTP: async (phone, token) => {
        if (!supabaseClient) initSupabase();
        
        const normalizedPhone = phone.replace(/\+/g, '');
        const { data, error } = await supabaseClient.auth.verifyOtp({
            phone: `+${normalizedPhone}`,
            token,
            type: 'sms'
        });

        if (error) throw error;
        
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        return data; // session
    },

    // --- Forgot Password Flow ---
    
    // 1. Request OTP email
    requestPasswordReset: async (email) => {
        if (!supabaseClient) initSupabase();
        
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return true;
    },

    // 2. Verify OTP code
    verifyResetOTP: async (email, token) => {
        if (!supabaseClient) initSupabase();
        
        const { data, error } = await supabaseClient.auth.verifyOtp({
            email,
            token,
            type: 'recovery'
        });

        if (error) throw error;
        return data; // session
    },

    // 3. Update password (session is already created/active after OTP verification)
    updateUserPassword: async (newPassword) => {
        if (!supabaseClient) initSupabase();
        
        const { error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
        return true;
    }
};

// Protect the page immediately after script loads
// Note: We'll call auth.init() in the specific page scripts to handle callbacks
// auth.checkAuth(); 

// --- API Wrapper ---

async function adminFetch(endpoint, options = {}) {
    const authHeaders = await auth.getAuthHeader();
    const headers = {
        ...authHeaders
    };

    // If body is NOT FormData, set JSON Content-Type
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(`${window.CONFIG.Backend_URL}/api/v1/admin${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });

        if (response.status === 401) {
            auth.logout();
            return null;
        }

        // --- Response Obfuscation Layer ---
        const originalJson = response.json.bind(response);
        response.json = async () => {
            const text = await response.text();
            if (!text) return null;
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("JSON parse failed:", e);
                return text;
            }
            if (data && data._d && typeof data._d === 'string') {
                try {
                    // Robust UTF-8 Base64 decoding
                    const decodedString = decodeURIComponent(escape(atob(data._d)));
                    return JSON.parse(decodedString);
                } catch (e) {
                    try {
                        // Fallback to standard atob if decoding fails (for simple ASCII)
                        return JSON.parse(atob(data._d));
                    } catch (e2) {
                        console.error("De-obfuscation failed:", e2);
                        return data;
                    }
                }
            }
            return data;
        };

        return response;
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
}

// --- Common UI Helpers ---

function getSkeletonHTML(type, count = 1) {
    if (type === 'list') {
        return Array(count).fill(0).map(() => `
            <div class="flex items-center justify-between p-4 bg-surface dark:bg-surface-dark rounded-xl shadow-sm border border-muted/5 animate-pulse">
                <div class="skeleton skeleton-text w-32 h-5 mb-0"></div>
                <div class="skeleton w-8 h-8 rounded-full"></div>
            </div>
        `).join('');
    }
    if (type === 'card') {
        return Array(count).fill(0).map(() => `
            <div class="bg-surface dark:bg-surface-dark p-3 rounded-card shadow-card flex items-center gap-4 animate-pulse">
                <div class="w-16 h-16 rounded-lg skeleton flex-shrink-0"></div>
                <div class="flex-1 min-w-0 space-y-2">
                    <div class="skeleton skeleton-text w-3/4"></div>
                    <div class="skeleton skeleton-text w-1/4"></div>
                    <div class="skeleton skeleton-text w-1/2"></div>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="w-8 h-8 rounded-full skeleton"></div>
                    <div class="w-8 h-8 rounded-full skeleton"></div>
                </div>
            </div>
        `).join('');
    }
    return '';
}

function toggleLoading(selector, show) {
    const el = document.querySelector(selector);
    if (el) {
        el.style.display = show ? 'flex' : 'none';
    }
}

function showToast(message, type = 'success') {
    // Premium Minimalist Toast Implementation
    const toast = document.createElement('div');
    
    // Base Classes: Glassmorphism, Rounded, Shadow, Flex
    const baseClasses = "fixed top-8 right-8 z-[1000] flex items-center gap-4 px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-500 transform translate-x-12 opacity-0";
    
    // Type-Specific Styling
    const typeStyles = type === 'success' 
        ? "bg-white/80 dark:bg-slate-900/80 border-primary/20 text-primary shadow-primary/5" 
        : "bg-white/80 dark:bg-slate-900/80 border-red-500/20 text-red-500 shadow-red-500/5";

    const icon = type === 'success' 
        ? '<span class="material-symbols-outlined text-2xl font-bold">check_circle</span>'
        : '<span class="material-symbols-outlined text-2xl font-bold">error</span>';

    toast.className = `${baseClasses} ${typeStyles}`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            ${icon}
            <span class="text-[15px] font-bold tracking-tight uppercase">${message}</span>
        </div>
    `;

    document.body.appendChild(toast);
    
    // Animate In: Slide & Fade
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-12', 'opacity-0');
    });
    
    // Remove sequence
    setTimeout(() => {
        toast.classList.add('opacity-0', 'scale-95');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}
