// Theme toggle handler (detection is inline in <head> to prevent flash)
const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for fade-in animations on scroll
// Using progressive enhancement - content is visible by default
const initFadeAnimations = () => {
    const fadeElements = document.querySelectorAll('.fade-in');

    // Only add animations if user hasn't disabled motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        // Just ensure all content is visible
        fadeElements.forEach(el => el.classList.add('visible'));
        return;
    }

    // Add js-enabled class for progressive enhancement
    fadeElements.forEach(el => {
        if (!el.classList.contains('js-enabled')) {
            el.classList.add('js-enabled');
            // Force reflow
            void el.offsetHeight;
        }
    });

    // Enhanced observer options for better performance
    const observerOptions = {
        threshold: 0.05, // Lower threshold for earlier triggering
        rootMargin: '0px 0px -20px 0px' // Trigger slightly before element is in view
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    // Observe all fade-in elements with js-enabled class
    document.querySelectorAll('.fade-in.js-enabled').forEach(el => {
        observer.observe(el);
    });

    // Failsafe: ensure content is visible after 3 seconds
    setTimeout(() => {
        fadeElements.forEach(el => {
            if (!el.classList.contains('visible')) {
                el.classList.add('visible');
            }
        });
    }, 3000);
};

// Initialize fade animations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFadeAnimations);
} else {
    // DOM already loaded
    initFadeAnimations();
}



// Header background change on scroll
const header = document.querySelector('.header');
const scrollThreshold = 100; // Pixels to scroll before changing header background

if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            // Use CSS variable for header background to support dark mode
            // But we need to handle the transparency change.
            // Let's just toggle a class instead of inline styles.
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Mobile menu functionality
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('nav-links-open');
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    });
}
