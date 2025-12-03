// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Check for saved theme preference or system preference
const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
} else if (systemTheme === 'dark') {
    html.setAttribute('data-theme', 'dark');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
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
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all fade-in elements
document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Form submission simulation
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        const sendingText = 'Sending...';
        const successMessage = 'Thank you for your message! I will get back to you soon.';
        const submissionTimeout = 1500;

        submitBtn.textContent = sendingText;
        submitBtn.disabled = true;

        // Simulate form submission with a timeout
        setTimeout(() => {
            alert(successMessage);
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, submissionTimeout);
    });
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

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('nav-links-open');
    });
}
