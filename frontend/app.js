// app.js
let API_BASE_URL = '';

document.addEventListener('DOMContentLoaded', () => {

    // Set API_BASE_URL from config or fallback
    const backendUrl = window.CONFIG?.Backend_URL || 'http://localhost:8080';
    API_BASE_URL = `${backendUrl}/api/v1/public`;
    
    console.log('API Base URL:', API_BASE_URL);

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
    if (rawPath === '/' || rawPath.endsWith('index.html') || rawPath.endsWith('index') || rawPath === '') {
        loadFeaturedProducts();
    } else if (rawPath.includes('products.html') || rawPath.endsWith('/products')) {
        loadAllProducts();
    } else if (rawPath.includes('product-details.html') || rawPath.includes('/product-details')) {
        loadProductDetails();
    } else if (rawPath.includes('contact.html') || rawPath.endsWith('/contact')) {
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

async function loadFeaturedProducts() {
    const gallery = document.getElementById('featured-gallery');
    if (!gallery) return;

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const result = await response.json();
        const products = result.data || result; // Handle potential different API structures

        // Limit to first 3 for featured
        const featured = products.slice(0, 3);
        
        gallery.innerHTML = featured.map(product => renderProductCard(product)).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        gallery.innerHTML = '<p class="error-msg">Failed to load products. Please try again later.</p>';
    }
}

async function loadAllProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const result = await response.json();
        const products = result.data || result;

        grid.innerHTML = products.map(product => renderProductCard(product)).join('');
        
        // Load dynamic categories for filtering
        loadCategories();
    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = '<p class="error-msg">Failed to load product catalog.</p>';
    }
}

async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        window.location.href = 'products.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${slug}`);
        const result = await response.json();
        const product = result.data || result;

        if (!product) throw new Error('Product not found');

        // Populate DOM
        document.getElementById('product-main-image').src = product.image_urls?.[0] || 'placeholder.jpg';
        document.getElementById('product-main-image').alt = product.name;
        document.getElementById('breadcrumb-current').textContent = product.name;
        document.getElementById('product-title').textContent = product.name;
        document.getElementById('product-price').textContent = `₵${product.current_price}`;
        document.getElementById('product-description').innerHTML = `<p>${product.description || ''}</p>`;

        // Populate features if any (attributes)
        const featuresList = document.getElementById('product-features');
        if (product.attributes && Object.keys(product.attributes).length > 0) {
            featuresList.innerHTML = Object.entries(product.attributes)
                .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
                .join('');
        }

        // Update WhatsApp Button
        const waBtn = document.getElementById('buy-whatsapp-btn');
        const text = encodeURIComponent(`Hello Atsupi's, I would like to purchase the ${product.name} (₵${product.current_price})`);
        waBtn.href = `https://wa.me/233595812257?text=${text}`;

    } catch (error) {
        console.error('Error loading product details:', error);
        document.querySelector('.product-details-section').innerHTML = `
            <div class="error-container" style="text-align:center; padding: 50px;">
                <h2>Oops! Product not found.</h2>
                <a href="products.html" class="primary-btn dark-btn" style="display:inline-block; margin-top:20px;">Back to Catalog</a>
            </div>
        `;
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

        const categories = await response.json();

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
    // Determine category slug for filtering
    const categorySlug = product.category_slug || product.category_name?.toLowerCase().replace(/\s+/g, '-') || 'all';
    
    return `
        <article class="product-card group" data-category="${categorySlug}">
            <div class="product-image-wrapper">
                <img src="${product.image_urls?.[0] || 'placeholder.jpg'}" alt="${product.name}" class="product-image">
                <a href="product-details.html?slug=${product.slug}" class="add-to-cart-btn" aria-label="View Details">
                    <span class="material-symbols-outlined">arrow_forward</span>
                </a>
            </div>
            <div class="product-info">
                <div class="product-meta">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-price">₵${product.current_price}</p>
                </div>
                <p class="product-category">${product.category_name || 'Cosmetics'}</p>
            </div>
        </article>
    `;
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
