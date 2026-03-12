class AppHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Determine active path to highlight current page
        const rawPath = window.location.pathname.toLowerCase();
        const useHtml = rawPath.includes('.html');
        
        const isIndex = rawPath === '/' || rawPath.endsWith('index.html') || rawPath.endsWith('index') || rawPath === '';
        const isProducts = rawPath.includes('products.html') || rawPath.endsWith('/products');
        const isAbout = rawPath.includes('about.html') || rawPath.endsWith('/about');
        const isContact = rawPath.includes('contact.html') || rawPath.endsWith('/contact');

        const indexLink = useHtml ? 'index.html' : 'index';
        const productsLink = useHtml ? 'products.html' : 'products';
        const aboutLink = useHtml ? 'about.html' : 'about';
        const contactLink = useHtml ? 'contact.html' : 'contact';

        this.innerHTML = `
            <header class="navbar fade-in-down">
                <a href="${indexLink}" class="logo" style="text-decoration:none;">
                    <div class="logo-word">
                        <span class="logo-initial">A</span>
                        <span class="logo-rest">tsupi's</span>
                    </div>
                    <div class="logo-word">
                        <span class="logo-initial">C</span>
                        <span class="logo-rest">osmetics</span>
                    </div>
                    <div class="logo-word">
                        <span class="logo-initial">T</span>
                        <span class="logo-rest">rading</span>
                    </div>
                </a>
                
                <nav class="desktop-nav">
                    <a href="${indexLink}" class="nav-link ${isIndex ? 'active' : ''}">Home</a>
                    <a href="${productsLink}" class="nav-link ${isProducts ? 'active' : ''}">Products</a>
                    <a href="${aboutLink}" class="nav-link ${isAbout ? 'active' : ''}">About</a>
                    <a href="${contactLink}" class="nav-link ${isContact ? 'active' : ''}">Contact Us</a>
                </nav>

                <button class="icon-btn mobile-menu-btn" aria-label="Open Menu" id="menu-toggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>

                <!-- Mobile Menu Overlay -->
                <div class="mobile-menu-overlay" id="mobile-menu">
                    <div class="mobile-menu-content">
                        <button class="icon-btn close-menu-btn" aria-label="Close Menu" id="menu-close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <nav class="mobile-nav">
                            <a href="${indexLink}" class="mobile-nav-link ${isIndex ? 'active' : ''}">Home</a>
                            <a href="${productsLink}" class="mobile-nav-link ${isProducts ? 'active' : ''}">Products</a>
                            <a href="${aboutLink}" class="mobile-nav-link ${isAbout ? 'active' : ''}">About</a>
                            <a href="${contactLink}" class="mobile-nav-link ${isContact ? 'active' : ''}">Contact Us</a>
                        </nav>
                        <div class="mobile-menu-footer">
                            <p>© Atsupi's Cosmetics</p>
                        </div>
                    </div>
                </div>
            </header>
        `;

        // Add Toggle Logic
        const menuToggle = this.querySelector('#menu-toggle');
        const menuClose = this.querySelector('#menu-close');
        const mobileMenu = this.querySelector('#mobile-menu');

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
                document.querySelector('main')?.classList.add('blur-content');
                document.querySelector('app-footer')?.classList.add('blur-content');
            });
        }

        if (menuClose && mobileMenu) {
            menuClose.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                document.querySelector('main')?.classList.remove('blur-content');
                document.querySelector('app-footer')?.classList.remove('blur-content');
            });
        }

        // Close menu on link click
        const mobileLinks = this.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                document.querySelector('main')?.classList.remove('blur-content');
                document.querySelector('app-footer')?.classList.remove('blur-content');
            });
        });
    }
}

customElements.define('app-header', AppHeader);
