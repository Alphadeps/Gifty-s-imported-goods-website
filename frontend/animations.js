/**
 * Minimalism Animation Observer
 * Handles scroll-triggered reveals and stagger effects
 */

document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                // Once visible, we can stop observing this element
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial observation call
    const initAnimations = () => {
        const animatedElements = document.querySelectorAll('.observe-fade, .observe-reveal-up, .observe-reveal-side');
        animatedElements.forEach(el => revealObserver.observe(el));
        
        // Handle auto-stagger logic for specific containers if needed
        const staggerContainers = document.querySelectorAll('.stagger-reveal');
        staggerContainers.forEach(container => {
            const children = container.children;
            Array.from(children).forEach((child, index) => {
                child.classList.add('observe-reveal-up');
                child.style.transitionDelay = `${(index + 1) * 0.1}s`;
                revealObserver.observe(child);
            });
        });
    };

    initAnimations();

    // Re-initialize if content is dynamically loaded (e.g. products)
    window.addEventListener('contentLoaded', initAnimations);
});
