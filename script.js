// DOM Elements
const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const btnText = document.getElementById('btnText');
const resultContainer = document.getElementById('resultContainer');
const shortUrlInput = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const navbar = document.getElementById('navbar');

// URL shortening storage (in-memory for demo)
const urlDatabase = new Map();
let urlCounter = 1000;

// Generate random short code
function generateShortCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Validate URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.getElementById('toastContainer').appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Shorten URL function
async function shortenUrl() {
    const url = urlInput.value.trim();

    // Reset states
    urlInput.classList.remove('error', 'success');

    if (!url) {
        urlInput.classList.add('error');
        showToast('Please enter a URL', 'error');
        return;
    }

    if (!isValidUrl(url)) {
        urlInput.classList.add('error');
        showToast('Please enter a valid URL (include http:// or https://)', 'error');
        return;
    }

    // Show loading state
    shortenBtn.disabled = true;
    btnText.innerHTML = '<span class="loading"></span>Shortening...';

    try {
        // Simulate API delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if URL already shortened
        let shortCode;
        const existingEntry = [...urlDatabase.entries()].find(([_, data]) => data.originalUrl === url);

        if (existingEntry) {
            shortCode = existingEntry[0];
        } else {
            // Generate new short code
            shortCode = generateShortCode();
            urlDatabase.set(shortCode, {
                originalUrl: url,
                shortUrl: `https://lnk.sh/${shortCode}`,
                createdAt: new Date(),
                clicks: 0
            });
        }

        const shortUrl = `https://lnk.sh/${shortCode}`;

        // Show success state
        urlInput.classList.add('success');
        shortUrlInput.value = shortUrl;
        resultContainer.classList.add('show');

        showToast('URL shortened successfully!');

    } catch (error) {
        showToast('Failed to shorten URL. Please try again.', 'error');
        urlInput.classList.add('error');
    } finally {
        // Reset button state
        shortenBtn.disabled = false;
        btnText.innerHTML = '✨ Shorten URL';
    }
}

// Copy to clipboard function
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(shortUrlInput.value);
        copyBtn.textContent = '✅ Copied!';
        copyBtn.classList.add('copied');
        showToast('Copied to clipboard!');

        setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (error) {
        // Fallback for older browsers
        shortUrlInput.select();
        document.execCommand('copy');
        showToast('Copied to clipboard!');
    }
}

// Animate stats on scroll
function animateStats() {
    const stats = [
        { element: document.getElementById('linksCount'), target: 1000000, suffix: 'M+', current: 0 },
        { element: document.getElementById('clicksCount'), target: 50000000, suffix: 'M+', current: 0 },
        { element: document.getElementById('usersCount'), target: 100000, suffix: 'K+', current: 0 },
        { element: document.getElementById('uptimeCount'), target: 99.9, suffix: '%', current: 0 }
    ];

    stats.forEach(stat => {
        const increment = stat.target / 100;
        const timer = setInterval(() => {
            stat.current += increment;

            if (stat.current >= stat.target) {
                stat.current = stat.target;
                clearInterval(timer);
            }

            let displayValue;
            if (stat.suffix === 'M+' && stat.target >= 1000000) {
                displayValue = (stat.current / 1000000).toFixed(stat.current >= stat.target ? 0 : 1) + 'M+';
            } else if (stat.suffix === 'K+') {
                displayValue = (stat.current / 1000).toFixed(0) + 'K+';
            } else if (stat.suffix === '%') {
                displayValue = stat.current.toFixed(1) + '%';
            } else {
                displayValue = Math.floor(stat.current).toLocaleString() + stat.suffix;
            }

            stat.element.textContent = displayValue;
        }, 30);
    });
}

// Navbar scroll effect
function handleNavbarScroll() {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize intersection observer for animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('stats-section')) {
                    animateStats();
                    observer.unobserve(entry.target);
                }

                if (entry.target.classList.contains('feature-card')) {
                    entry.target.style.animationDelay = `${Math.random() * 0.5}s`;
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements
    document.querySelectorAll('.stats-section, .feature-card').forEach(el => {
        observer.observe(el);
    });
}

// Add real-time URL validation
function initUrlValidation() {
    let validationTimeout;

    urlInput.addEventListener('input', () => {
        clearTimeout(validationTimeout);
        urlInput.classList.remove('error', 'success');

        validationTimeout = setTimeout(() => {
            const url = urlInput.value.trim();
            if (url) {
                if (isValidUrl(url)) {
                    urlInput.classList.add('success');
                } else {
                    urlInput.classList.add('error');
                }
            }
        }, 500);
    });
}

// Handle Enter key in input
function initKeyboardShortcuts() {
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            shortenUrl();
        }
    });

    // Global shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to shorten
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!shortenBtn.disabled) {
                shortenUrl();
            }
        }

        // Escape to clear input
        if (e.key === 'Escape') {
            urlInput.value = '';
            urlInput.classList.remove('error', 'success');
            resultContainer.classList.remove('show');
            urlInput.focus();
        }
    });
}

// Add particle effects on button click
function createParticleEffect(element) {
    const rect = element.getBoundingClientRect();
    const particles = 8;

    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: var(--primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
        `;

        document.body.appendChild(particle);

        const angle = (i / particles) * Math.PI * 2;
        const velocity = 100;
        const distance = 100;

        particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }).addEventListener('finish', () => {
            particle.remove();
        });
    }
}

// Enhanced shorten button with effects
function enhanceShortenButton() {
    shortenBtn.addEventListener('click', () => {
        createParticleEffect(shortenBtn);
        shortenUrl();
    });
}

// Add URL suggestions/autocomplete
function initUrlSuggestions() {
    const commonDomains = [
        'https://www.google.com/',
        'https://www.youtube.com/',
        'https://www.facebook.com/',
        'https://www.twitter.com/',
        'https://www.instagram.com/',
        'https://www.linkedin.com/',
        'https://www.github.com/',
        'https://www.stackoverflow.com/'
    ];

    const datalist = document.createElement('datalist');
    datalist.id = 'url-suggestions';

    commonDomains.forEach(domain => {
        const option = document.createElement('option');
        option.value = domain;
        datalist.appendChild(option);
    });

    document.body.appendChild(datalist);
    urlInput.setAttribute('list', 'url-suggestions');
}

// Add URL preview functionality
function addUrlPreview() {
    let previewTimeout;
    const preview = document.createElement('div');
    preview.className = 'url-preview';
    preview.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        padding: 1rem;
        margin-top: 0.5rem;
        color: white;
        font-size: 0.9rem;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 100;
    `;

    urlInput.parentElement.style.position = 'relative';
    urlInput.parentElement.appendChild(preview);

    urlInput.addEventListener('input', () => {
        clearTimeout(previewTimeout);

        previewTimeout = setTimeout(() => {
            const url = urlInput.value.trim();
            if (url && isValidUrl(url)) {
                try {
                    const urlObj = new URL(url);
                    preview.innerHTML = `
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">URL Preview:</div>
                        <div>Domain: ${urlObj.hostname}</div>
                        <div>Protocol: ${urlObj.protocol}</div>
                        ${urlObj.pathname !== '/' ? `<div>Path: ${urlObj.pathname}</div>` : ''}
                    `;
                    preview.style.opacity = '1';
                    preview.style.transform = 'translateY(0)';
                } catch (e) {
                    preview.style.opacity = '0';
                }
            } else {
                preview.style.opacity = '0';
                preview.style.transform = 'translateY(-10px)';
            }
        }, 300);
    });

    // Hide preview when clicking outside
    document.addEventListener('click', (e) => {
        if (!urlInput.parentElement.contains(e.target)) {
            preview.style.opacity = '0';
            preview.style.transform = 'translateY(-10px)';
        }
    });
}

// Initialize all functionality
function init() {
    // Core functionality
    enhanceShortenButton();
    copyBtn.addEventListener('click', copyToClipboard);

    // UI enhancements
    initSmoothScrolling();
    initScrollAnimations();
    initUrlValidation();
    initKeyboardShortcuts();
    initUrlSuggestions();
    addUrlPreview();

    // Scroll effects
    window.addEventListener('scroll', handleNavbarScroll);

    // Focus input on load
    setTimeout(() => urlInput.focus(), 1000);

    console.log('🔗 LinkShrink initialized successfully!');
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

// Add some demo functionality
window.addEventListener('load', () => {
    // Add demo button for testing
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('claude')) {
        const demoBtn = document.createElement('button');
        demoBtn.textContent = '🎯 Try Demo URL';
        demoBtn.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 2rem;
            padding: 0.8rem 1.2rem;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            transition: all 0.3s ease;
        `;

        demoBtn.addEventListener('click', () => {
            const demoUrls = [
                'https://www.example.com/very/long/path/that/needs/shortening',
                'https://github.com/user/repository/blob/main/src/components/VeryLongComponentName.js',
                'https://stackoverflow.com/questions/12345678/how-to-create-a-very-long-question-title',
                'https://docs.google.com/document/d/1234567890abcdef/edit?usp=sharing'
            ];
            const randomUrl = demoUrls[Math.floor(Math.random() * demoUrls.length)];
            urlInput.value = randomUrl;
            urlInput.dispatchEvent(new Event('input'));
            urlInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        demoBtn.addEventListener('mouseenter', () => {
            demoBtn.style.transform = 'translateY(-2px) scale(1.05)';
        });

        demoBtn.addEventListener('mouseleave', () => {
            demoBtn.style.transform = 'translateY(0) scale(1)';
        });

        document.body.appendChild(demoBtn);
    }
});