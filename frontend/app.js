// app.js

/**
 * BlurHash decoder implementation (Tiny version)
 */
const blurhashDecoder = {
    decode: (blurhash, width, height, punch = 1) => {
        const decode83 = (str) => {
            const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";
            let val = 0;
            for (let i = 0; i < str.length; i++) {
                val = val * 83 + characters.indexOf(str[i]);
            }
            return val;
        };

        const sRGBToLinear = (value) => {
            let v = value / 255;
            if (v <= 0.04045) return v / 12.92;
            else return Math.pow((v + 0.055) / 1.055, 2.4);
        };

        const linearToSRGB = (value) => {
            let v = Math.max(0, Math.min(1, value));
            if (v <= 0.0031308) return Math.round(v * 12.92 * 255 + 0.5);
            else return Math.round((1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255 + 0.5);
        };

        const sign = (n) => (n < 0 ? -1 : 1);

        const sizeFlag = decode83(blurhash[0]);
        const numX = (sizeFlag % 9) + 1;
        const numY = Math.floor(sizeFlag / 9) + 1;
        const quantMaxAC = (decode83(blurhash[1]) + 1) / 166;

        const colors = [];
        for (let i = 0; i < numX * numY; i++) {
            if (i === 0) {
                const value = decode83(blurhash.substring(2, 6));
                colors.push([sRGBToLinear(value >> 16), sRGBToLinear((value >> 8) & 255), sRGBToLinear(value & 255)]);
            } else {
                const value = decode83(blurhash.substring(6 + (i - 1) * 2, 8 + (i - 1) * 2));
                colors.push([
                    sign(Math.floor(value / (19 * 19)) - 9) * Math.pow(Math.abs(Math.floor(value / (19 * 19)) - 9) / 9, 2) * quantMaxAC * punch,
                    sign((Math.floor(value / 19) % 19) - 9) * Math.pow(Math.abs((Math.floor(value / 19) % 19) - 9) / 9, 2) * quantMaxAC * punch,
                    sign((value % 19) - 9) * Math.pow(Math.abs((value % 19) - 9) / 9, 2) * quantMaxAC * punch
                ]);
            }
        }

        const pixels = new Uint8ClampedArray(width * height * 4);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0;
                for (let j = 0; j < numY; j++) {
                    for (let i = 0; i < numX; i++) {
                        const basis = Math.cos((Math.PI * x * i) / width) * Math.cos((Math.PI * y * j) / height);
                        const color = colors[j * numX + i];
                        r += color[0] * basis;
                        g += color[1] * basis;
                        b += color[2] * basis;
                    }
                }
                const intR = linearToSRGB(r);
                const intG = linearToSRGB(g);
                const intB = linearToSRGB(b);
                pixels[4 * (y * width + x)] = intR;
                pixels[4 * (y * width + x) + 1] = intG;
                pixels[4 * (y * width + x) + 2] = intB;
                pixels[4 * (y * width + x) + 3] = 255;
            }
        }
        return pixels;
    }
};

function renderBlurhashToCanvas(canvas, blurhash) {
    if (!blurhash) return;
    const width = 32;
    const height = 32;
    const pixels = blurhashDecoder.decode(blurhash, width, height);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
}

let API_BASE_URL = '';

/**
 * Initialize Application Configuration Dynamically
 * Fetches public environment variables from the backend server.
 */
/**
 * Initialize Application Configuration Dynamically
 * Prioritizes Vercel-injected values, falls back to dynamic fetch or hardcoded Render URL.
 */
async function initAppConfig() {
    const renderUrl = 'https://gifty-s-imported-goods-website.onrender.com';
    
    // 1. Check if Vercel already injected config via config.js
    if (window.CONFIG && window.CONFIG.Backend_URL && !window.CONFIG.Backend_URL.includes('PLACEHOLDER')) {
        API_BASE_URL = `${window.CONFIG.Backend_URL}/api/v1/public`;
        console.log('Using pre-configured API:', API_BASE_URL);
        window.dispatchEvent(new CustomEvent('configLoaded'));
        return true;
    }

    // 2. Fallback: Dynamically fetch from Render
    try {
        console.log('Fetching config from Render...');
        const response = await fetch(`${renderUrl}/api/v1/public/config`);
        const config = await response.json();
        
        window.CONFIG = config;
        API_BASE_URL = `${config.Backend_URL || renderUrl}/api/v1/public`;
        
        console.log('Dynamic configuration loaded:', API_BASE_URL);
        window.dispatchEvent(new CustomEvent('configLoaded'));
        return true;
    } catch (error) {
        console.error('Configuration fallback failed:', error);
        API_BASE_URL = `${renderUrl}/api/v1/public`;
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Load config first
    await initAppConfig();

    // Initialization for interactions and PWA
    // Robust path detection (handles index, index.html, /products, products.html etc)
    const rawPath = window.location.pathname.toLowerCase();

    // Smooth Parallax effect on scroll for hero background
    const heroBg = document.querySelector('.parallax-img');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                // Subtle parallax shift
                heroBg.style.transform = `translateY(${scrollY * 0.15}px)`;
            }
        });
    }

    // Page Specific Logic
    const isIndex = rawPath === '/' || rawPath.endsWith('index.html') || rawPath.endsWith('index') || rawPath === '';
    const isDetails = rawPath.includes('product-details.html') || rawPath.includes('/product-details');
    const isProducts = !isDetails && (rawPath.includes('products.html') || rawPath.endsWith('/products'));
    const isContact = rawPath.includes('contact.html') || rawPath.endsWith('/contact');

    if (isIndex) {
        loadFeaturedProducts();
    } else if (isDetails) {
        loadProductDetails();
    } else if (isProducts) {
        loadAllProducts();
    } else if (isContact) {
        initContactForm();
    }

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
});

// --- API Functions ---

/**
 * De-obfuscation helper
 */
async function handleResponse(response) {
    const data = await response.json();
    if (data && data._d && typeof data._d === 'string') {
        try {
            // Robust UTF-8 Base64 decoding
            const decodedString = decodeURIComponent(escape(atob(data._d)));
            return JSON.parse(decodedString);
        } catch (e) {
            try {
                return JSON.parse(atob(data._d));
            } catch (e2) {
                console.error("De-obfuscation failed:", e2);
                return data;
            }
        }
    }
    return data;
}


async function loadFeaturedProducts() {
    const gallery = document.getElementById('featured-gallery');
    if (!gallery) return;

    // Show skeletons
    gallery.innerHTML = Array(3).fill(0).map(() => `
        <article class="product-card">
            <div class="product-image-wrapper skeleton"></div>
            <div class="product-info space-y-2">
                <div class="skeleton-text skeleton w-3/4"></div>
                <div class="skeleton-text skeleton w-1/2"></div>
            </div>
        </article>
    `).join('');

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const result = await handleResponse(response);
        const products = result.data || result; 

        const featured = products.slice(0, 3);
        gallery.innerHTML = featured.map(product => renderProductCard(product)).join('');
        window.dispatchEvent(new CustomEvent('contentLoaded'));
    } catch (error) {
        console.error('Error loading products:', error);
        gallery.innerHTML = '<p class="error-msg">Failed to load products. Please try again later.</p>';
    }
}

async function loadAllProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    // Show grid skeletons
    grid.innerHTML = Array(8).fill(0).map(() => `
        <article class="product-card">
            <div class="product-image-wrapper skeleton"></div>
            <div class="product-info space-y-2">
                <div class="skeleton-text skeleton w-3/4"></div>
                <div class="skeleton-text skeleton w-1/2"></div>
            </div>
        </article>
    `).join('');

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const result = await handleResponse(response);
        const products = result.data || result;

        grid.innerHTML = products.map(product => renderProductCard(product)).join('');
        window.dispatchEvent(new CustomEvent('contentLoaded'));
        
        // Load dynamic categories for filtering
        await loadCategories();

        // Check for URL category filter
        const urlParams = new URLSearchParams(window.location.search);
        const catFilter = urlParams.get('category');
        if (catFilter) {
            const btn = document.querySelector(`.filter-btn[data-category="${catFilter}"]`);
            if (btn) btn.click();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = '<p class="error-msg">Failed to load product catalog.</p>';
    }
}

async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        const productsPath = window.location.pathname.includes('.html') ? 'products.html' : 'products';
        window.location.href = productsPath;
        return;
    }

    // Show skeletons in specific areas
    const titleEl = document.getElementById('product-title');
    const priceEl = document.getElementById('product-price');
    const descEl = document.getElementById('product-description');
    const imgEl = document.getElementById('product-main-image');

    if (titleEl) titleEl.innerHTML = '<div class="skeleton skeleton-text w-64 h-8"></div>';
    if (priceEl) priceEl.innerHTML = '<div class="skeleton skeleton-text w-24"></div>';
    if (descEl) descEl.innerHTML = '<div class="skeleton skeleton-text w-full h-32"></div>';
    if (imgEl) imgEl.parentElement.classList.add('skeleton');

    try {
        const response = await fetch(`${API_BASE_URL}/products/${slug}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const product = await handleResponse(response);
        if (!product) throw new Error('Product not found');

        // Populate DOM
        const mainImg = document.getElementById('product-main-image');
        if (mainImg) {
            mainImg.parentElement.classList.remove('skeleton');
            mainImg.src = (product.image_urls && product.image_urls.length > 0) ? product.image_urls[0] : 'placeholder.jpg';
            mainImg.alt = product.name;
        }

        document.getElementById('breadcrumb-current').textContent = product.name;
        document.getElementById('product-title').textContent = product.name;
        
        const priceEl = document.getElementById('product-price');
        if (product.new_price && product.new_price > 0 && product.new_price < product.current_price) {
            priceEl.innerHTML = `<span class="price-new">₵${product.new_price}</span> <span class="price-old ml-2">₵${product.current_price}</span>`;
        } else {
            priceEl.textContent = `₵${product.current_price}`;
        }
        
        const descriptionContainer = document.getElementById('product-description');
        if (descriptionContainer) {
            descriptionContainer.innerHTML = `<p>${product.description || 'No description available for this premium product.'}</p>`;
        }

        // Populate Features Grid
        const featuresList = document.getElementById('product-features');
        if (featuresList) {
            const attributes = product.attributes || {};
            const entries = Object.entries(attributes);
            
            if (entries.length > 0) {
                featuresList.innerHTML = entries
                    .map(([key, value]) => `
                        <li class="feature-item">
                            <span class="feature-key">${key}</span>
                            <span class="feature-val">${value}</span>
                        </li>
                    `).join('');
            } else {
                featuresList.innerHTML = `
                    <li class="feature-item">
                        <span class="feature-key">Quality</span>
                        <span class="feature-val">Premium Imported</span>
                    </li>
                    <li class="feature-item">
                        <span class="feature-key">Availability</span>
                        <span class="feature-val">In Stock</span>
                    </li>
                `;
            }
        }

        // Load Related Products
        loadRelatedProducts(product.category_id, product.id);

        // Update WhatsApp Button
        const waBtn = document.getElementById('buy-whatsapp-btn');
        if (waBtn) {
            const message = encodeURIComponent(`Hello Atsupi's, I am interested in purchasing the ${product.name} (₵${product.current_price}). Is it available?`);
            const phone = window.CONFIG?.WHATSAPP_NUMBER || '';
            waBtn.href = `https://wa.me/${phone}?text=${message}`;
        }

        // Set Dynamic Page Title
        document.title = `${product.name} - Atsupi's Cosmetics`;

    } catch (error) {
        console.error('Error loading product details:', error);
        const section = document.querySelector('.product-details-section');
        if (section) {
            section.innerHTML = `
                <div class="error-container fade-in-up" style="text-align:center; padding: 100px var(--space-md);">
                    <h2 style="font-family:var(--font-serif); font-size: 2.5rem; margin-bottom: var(--space-md);">Product Not Found</h2>
                    <p style="color:var(--clr-text-muted); margin-bottom: var(--space-xl);">We couldn't find the product you're looking for. It might have been moved or removed.</p>
                    <a href="products.html" class="primary-btn dark-btn" style="display:inline-block;">Back to Collection</a>
                </div>
            `;
        }
    }
}

async function loadRelatedProducts(categoryId, currentId) {
    const grid = document.getElementById('related-products-grid');
    if (!grid) return;

    // Show skeletons
    grid.innerHTML = Array(4).fill(0).map(() => `
        <article class="product-card">
            <div class="product-image-wrapper skeleton"></div>
            <div class="product-info space-y-2">
                <div class="skeleton-text skeleton w-3/4"></div>
                <div class="skeleton-text skeleton w-1/2"></div>
            </div>
        </article>
    `).join('');

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const allProducts = await handleResponse(response);
        
        // Filter by category and exclude current
        let related = allProducts.filter(p => p.category_id === categoryId && p.id !== currentId);
        
        // If not enough related in same category, just pick some others
        if (related.length < 4) {
            const others = allProducts.filter(p => p.id !== currentId && p.category_id !== categoryId);
            related = [...related, ...others].slice(0, 4);
        } else {
            related = related.slice(0, 4);
        }

        grid.innerHTML = related.map(product => renderProductCard(product)).join('');
    } catch (error) {
        console.error('Error loading related products:', error);
        grid.innerHTML = '<p>Discover more arrivals in our catalog.</p>';
    }
}

async function loadCategories() {
    const filterContainer = document.querySelector('.product-filters');
    if (!filterContainer) return;

    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Oops, we haven't got JSON!");
        }

        const categories = await handleResponse(response);

        if (categories && categories.length > 0) {
            // Keep the "All" button
            let filterHtml = '<button class="filter-btn active" data-filter="all">All</button>';
            
            filterHtml += categories.map(cat => `
                <button class="filter-btn" data-filter="${cat.slug}">${cat.name}</button>
            `).join('');

            filterContainer.innerHTML = filterHtml;
            
            // Re-initialize filtering logic with new buttons
            initFilters();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to existing hardcoded filters if API fails
        initFilters();
    }
}

function renderProductCard(product) {
    const categorySlug = product.category_slug || product.category_name?.toLowerCase().replace(/\s+/g, '-') || 'all';
    const useHtml = window.location.pathname.includes('.html');
    const detailsPath = useHtml ? 'product-details.html' : 'product-details';
    
    const isSale = product.new_price && product.new_price > 0 && product.new_price < product.current_price;
    const priceDisplay = isSale ? `
        <span class="price-old">₵${product.current_price}</span>
        <span class="price-new">₵${product.new_price}</span>
    ` : `<span class="product-price">₵${product.current_price}</span>`;

    const badge = isSale ? `<div class="badge-reduced">Reduced</div>` : '';
    
    // Create a unique ID for the canvas to render the blurhash
    const canvasId = `bh-${Math.random().toString(36).substr(2, 9)}`;

    // Set up the card HTML
    const html = `
        <article class="product-card group" data-category="${categorySlug}">
            <div class="product-image-wrapper">
                ${badge}
                ${product.blurhash ? `<canvas id="${canvasId}" class="blurhash-canvas" width="32" height="32"></canvas>` : ''}
                <img src="${product.image_urls?.[0] || 'placeholder.jpg'}" 
                     alt="${product.name}" 
                     class="product-image ${product.blurhash ? 'loading' : ''}"
                     onload="this.classList.remove('loading'); document.getElementById('${canvasId}')?.remove();">
                <a href="${detailsPath}?slug=${product.slug}" class="add-to-cart-btn" aria-label="View Details">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </a>
            </div>
            <div class="product-info">
                <div class="product-meta">
                    <h4 class="product-name">${product.name}</h4>
                    <div class="price-container">${priceDisplay}</div>
                </div>
                <p class="product-category">${product.category_name || 'Cosmetics'}</p>
            </div>
        </article>
    `;

    // Defer the canvas rendering until after the element is in the DOM
    if (product.blurhash) {
        setTimeout(() => {
            const canvas = document.getElementById(canvasId);
            if (canvas) renderBlurhashToCanvas(canvas, product.blurhash);
        }, 0);
    }

    return html;
}

function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter').toLowerCase();

            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

function initContactForm() {
    const form = document.querySelector('.inquiry-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const formData = {
            full_name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/inquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Thank you! Your inquiry has been sent successfully.');
                form.reset();
            } else {
                const error = await response.json();
                alert(error.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to connect to the server. Please check your connection.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}
