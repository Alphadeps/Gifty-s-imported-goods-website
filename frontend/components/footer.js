class AppFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const currentYear = new Date().getFullYear();
        this.innerHTML = `
            <footer class="premium-footer">
                <div class="footer-container">
                    
                    <!-- Footer Links Grid -->
                    <div class="footer-links-grid fade-in-up">
                        
                        <!-- Column 1: Navigation -->
                        <div class="footer-column">
                            <h4 class="footer-col-heading">Quick Links</h4>
                            <ul class="footer-list">
                                <li><a href="index.html">Home</a></li>
                                <li><a href="products.html">Products</a></li>
                                <li><a href="about.html">About Us</a></li>
                                <li><a href="contact.html">Contact Us</a></li>
                                <li><a href="privacy-policy.html">Privacy Policy</a></li>
                            </ul>
                        </div>

                        <div class="footer-column">
                            <h4 class="footer-col-heading">Connect With Us</h4>
                            <ul class="footer-list">
                                <li><a href="contact.html">Visit Our Store</a></li>
                                <li><a href="https://wa.me/${window.CONFIG?.WHATSAPP_NUMBER || ''}" target="_blank">WhatsApp Us</a></li>
                                <li><a href="tel:${window.CONFIG?.OWNER_PHONE || ''}">Call Us</a></li>
                            </ul>
                        </div>
                    </div>

                    <!-- Footer Bottom -->
                    <div class="footer-bottom fade-in-up" style="animation-delay: 0.2s">
                        <div class="social-icons">
                            <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                            <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                            <a href="#" aria-label="Pinterest"><i class="fa-brands fa-pinterest-p"></i></a>
                            <a href="#" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
                        </div>
                        
                        <p class="copyright-text">
                            &copy; ${currentYear} Atsupi's Cosmetics Trading. All Rights Reserved.
                        </p>

                        <!-- Floating Chat Button Placeholder (From Image) -->
                        <a href="contact.html" class="footer-cta primary-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Message Us
                        </a>
                    </div>
                </div>
            </footer>
            <!-- FontAwesome for Social Icons (temporary CDN link inside component) -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        `;
    }
}

customElements.define('app-footer', AppFooter);
