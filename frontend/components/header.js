class AppHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Determine active path to highlight current page
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';

        this.innerHTML = `
            <header class="navbar fade-in-down">
                <a href="index.html" class="logo" style="text-decoration:none;">
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
                    <a href="index.html" class="nav-link ${currentPath === 'index.html' ? 'active' : ''}">Home</a>
                    <a href="products.html" class="nav-link ${currentPath === 'products.html' ? 'active' : ''}">Products</a>
                    <a href="about.html" class="nav-link ${currentPath === 'about.html' ? 'active' : ''}">About</a>
                    <a href="contact.html" class="nav-link ${currentPath === 'contact.html' ? 'active' : ''}">Contact Us</a>
                </nav>

                <button class="icon-btn mobile-menu-btn" aria-label="Open Menu" id="menu-toggle">
                    <span class="material-symbols-outlined">menu</span>
                </button>

                <!-- Mobile Menu Overlay -->
                <div class="mobile-menu-overlay" id="mobile-menu">
                    <div class="mobile-menu-content">
                        <button class="icon-btn close-menu-btn" aria-label="Close Menu" id="menu-close">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                        <nav class="mobile-nav">
                            <a href="index.html" class="mobile-nav-link ${currentPath === 'index.html' ? 'active' : ''}">Home</a>
                            <a href="products.html" class="mobile-nav-link ${currentPath === 'products.html' ? 'active' : ''}">Products</a>
                            <a href="about.html" class="mobile-nav-link ${currentPath === 'about.html' ? 'active' : ''}">About</a>
                            <a href="contact.html" class="mobile-nav-link ${currentPath === 'contact.html' ? 'active' : ''}">Contact Us</a>
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
            });
        }

        if (menuClose && mobileMenu) {
            menuClose.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                document.querySelector('main')?.classList.remove('blur-content');
            });
        }

        // Close menu on link click
        const mobileLinks = this.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                document.querySelector('main')?.classList.remove('blur-content');
            });
        });
    }
}

customElements.define('app-header', AppHeader);
