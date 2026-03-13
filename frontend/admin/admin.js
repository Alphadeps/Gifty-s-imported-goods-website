/**
 * admin.js
 * Core logic for the Admin Dashboard.
 * Handles authentication, API communication, and common UI interactions.
 */

const API_BASE_URL = window.CONFIG?.Backend_URL || 'http://localhost:8080';
const ADMIN_API_URL = `${API_BASE_URL}/api/v1/admin`;

// --- Supabase Configuration ---
let supabaseClient = null;

const initSupabase = () => {
    // Pull configuration from config.js
    const supabaseUrl = window.CONFIG?.SUPABASE_URL;
    const supabaseKey = window.CONFIG?.SUPABASE_KEY;
    
    if (window.supabase && supabaseUrl && supabaseKey) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    }
};

// --- Authentication Logic ---

const OWNER_EMAIL = "amagimpa@gmail.com";
const OWNER_PHONE = "233244304354"; // Format required by Supabase (E.164)

const auth = {
    // Initialize Auth Client
    init: async () => {
        initSupabase();
        await auth.checkAuth();
    },

    // Check if user is authenticated
    isAuthenticated: async () => {
        if (!supabaseClient) initSupabase();
        if (!supabaseClient) return false;
        
        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error) throw error;
            
            // If session exists, ensure local user state is also present
            if (session && !localStorage.getItem('admin_user')) {
                localStorage.setItem('admin_user', JSON.stringify(session.user));
            }
            
            return !!session;
        } catch (e) {
            console.error("Auth check failed:", e);
            return false;
        }
    },

    // Login with Supabase (Email/Password)
    login: async (email, password) => {
        if (!supabaseClient) initSupabase();
        
        // Strict frontend check for owner email
        if (email !== "amagimpa@gmail.com") {
            throw new Error("Access Denied: Non-owner account.");
        }

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
        if (!supabaseClient) initSupabase();
        await supabaseClient.auth.signOut();
        localStorage.removeItem('admin_user');
        window.location.href = 'login.html';
    },

    // Enforce authentication on protected pages
    checkAuth: async () => {
        // Bypass auth if in development mode
        if (window.CONFIG?.DEV_MODE) {
            console.log("Admin: Auth bypass enabled (DEV_MODE)");
            return;
        }
        
        const isAuth = await auth.isAuthenticated();
        const isLoginPage = window.location.pathname.includes('login.html');

        if (!isAuth && !isLoginPage) {
            window.location.href = 'login.html';
        } else if (isAuth && isLoginPage) {
            window.location.href = 'products.html';
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
        if (normalizedPhone !== OWNER_PHONE) {
            throw new Error("Access Denied: Non-owner phone number.");
        }

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
        
        // Security check
        if (email !== "amagimpa@gmail.com") {
            throw new Error("Invalid request. Access Restricted.");
        }

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
            const data = await originalJson();
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
    // Basic toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg text-white shadow-xl transform transition-all duration-300 translate-y-[-20px] opacity-0 ${
        type === 'success' ? 'bg-primary' : 'bg-red-500'
    }`;
    toast.innerText = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-[-20px]', 'opacity-0');
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        toast.classList.add('translate-y-[-20px]', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
