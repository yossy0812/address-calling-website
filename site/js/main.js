/**
 * Main JavaScript for Address Calling Website
 */

// ============================================
// DOM Ready
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initHeroSlideshow();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initCounterAnimation();
    initFormValidation();
    initStickyHeader();
});

// ============================================
// Hero Slideshow
// ============================================
function initHeroSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds

    function nextSlide() {
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');

        // Move to next slide
        currentSlide = (currentSlide + 1) % slides.length;

        // Add active class to new slide
        slides[currentSlide].classList.add('active');
    }

    // Auto advance slides
    setInterval(nextSlide, slideInterval);
}

// ============================================
// Mobile Menu Toggle
// ============================================
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        toggle.classList.toggle('active');

        // Toggle aria-expanded
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Close menu when clicking nav link
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// Add CSS for mobile menu
const mobileMenuStyles = document.createElement('style');
mobileMenuStyles.textContent = `
    @media (max-width: 1023px) {
        .nav {
            position: fixed;
            top: var(--header-height);
            right: -100%;
            width: 250px;
            height: calc(100vh - var(--header-height));
            background-color: white;
            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
            transition: right 0.3s ease;
            z-index: 999;
            padding: 2rem;
        }

        .nav.active {
            right: 0;
        }

        .nav-list {
            flex-direction: column;
            gap: 1rem;
        }

        .mobile-menu-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(8px, 8px);
        }

        .mobile-menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }

        .mobile-menu-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -7px);
        }
    }
`;
document.head.appendChild(mobileMenuStyles);

// ============================================
// Smooth Scroll
// ============================================
function initSmoothScroll() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// Scroll Animations
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    const animatedElements = document.querySelectorAll(
        '.service-card, .stat-item, .feature-card, ' +
        '.reason-card, .case-study-card, .pricing-card, ' +
        '.story-card, .detail-item, .audience-card, ' +
        '.curriculum-item, .faq-item'
    );

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// ============================================
// Counter Animation
// ============================================
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number[data-count]');

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                animateCounter(counter);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-count'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toFixed(1);
            clearInterval(timer);
        } else {
            element.textContent = current.toFixed(1);
        }
    }, 16);
}

// ============================================
// Form Validation
// ============================================
function initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate form
            if (!validateForm(form)) {
                return;
            }

            // Show success message
            showFormSuccess(form);

            // In production, you would send the form data to a server here
            // Example:
            // const formData = new FormData(form);
            // fetch('/api/contact', {
            //     method: 'POST',
            //     body: formData
            // })
            // .then(response => response.json())
            // .then(data => {
            //     showFormSuccess(form);
            // })
            // .catch(error => {
            //     showFormError(form, error.message);
            // });
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                // Remove error state on input
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    const errorMsg = this.parentElement.querySelector('.error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    // Validate email
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        if (input.value && !isValidEmail(input.value)) {
            showFieldError(input, 'メールアドレスの形式が正しくありません');
            isValid = false;
        }
    });

    // Validate phone
    const phoneInputs = form.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        if (input.value && !isValidPhone(input.value)) {
            showFieldError(input, '電話番号の形式が正しくありません');
            isValid = false;
        }
    });

    // Validate checkbox (privacy policy)
    const privacyCheckbox = form.querySelector('input[name="privacy"]');
    if (privacyCheckbox && !privacyCheckbox.checked) {
        showFieldError(privacyCheckbox, 'プライバシーポリシーに同意してください');
        isValid = false;
    }

    return isValid;
}

function validateField(field) {
    // Clear previous error
    field.classList.remove('error');
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Check if required field is empty
    if (field.hasAttribute('required') && !field.value.trim()) {
        showFieldError(field, 'この項目は必須です');
        return false;
    }

    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');

    // Remove existing error message
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#FF0000';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';

    field.parentElement.appendChild(errorDiv);
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function isValidPhone(phone) {
    // Japanese phone number format (flexible)
    const regex = /^[0-9-+()]{10,}$/;
    return regex.test(phone);
}

function showFormSuccess(form) {
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success-message';
    successDiv.innerHTML = `
        <div style="
            background-color: #4CAF50;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            margin-top: 1rem;
            animation: fadeIn 0.5s ease;
        ">
            <strong>送信完了</strong><br>
            お問い合わせありがとうございます。<br>
            担当者より折り返しご連絡させていただきます。
        </div>
    `;

    // Insert success message
    form.appendChild(successDiv);

    // Reset form
    form.reset();

    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Remove success message after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function showFormError(form, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-message';
    errorDiv.innerHTML = `
        <div style="
            background-color: #f44336;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            margin-top: 1rem;
        ">
            <strong>エラー</strong><br>
            ${message}
        </div>
    `;

    form.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Add error input style
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .form-input.error,
    .form-textarea.error {
        border-color: #FF0000;
    }
`;
document.head.appendChild(errorStyles);

// ============================================
// Sticky Header
// ============================================
function initStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Optional: Hide header on scroll down, show on scroll up
        // if (currentScroll > lastScroll && currentScroll > 200) {
        //     header.style.transform = 'translateY(-100%)';
        // } else {
        //     header.style.transform = 'translateY(0)';
        // }

        lastScroll = currentScroll;
    });
}

// Add scrolled header style
const headerStyles = document.createElement('style');
headerStyles.textContent = `
    .header.scrolled {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
    }

    .header {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(headerStyles);

// ============================================
// Page Load Animations
// ============================================
window.addEventListener('load', function() {
    // Fade in hero section
    const hero = document.querySelector('.hero, .page-hero');
    if (hero) {
        hero.style.opacity = '0';
        setTimeout(() => {
            hero.style.transition = 'opacity 0.8s ease';
            hero.style.opacity = '1';
        }, 100);
    }
});

// ============================================
// Intersection Observer Polyfill Check
// ============================================
if (!('IntersectionObserver' in window)) {
    console.warn('IntersectionObserver is not supported. Animations may not work properly.');
    // Fallback: Show all animated elements immediately
    const animatedElements = document.querySelectorAll('[style*="opacity: 0"]');
    animatedElements.forEach(el => {
        el.style.opacity = '1';
    });
}

// ============================================
// Utility Functions
// ============================================

/**
 * Debounce function to limit rate of function execution
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit rate of function execution
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// Back to Top Button (Optional)
// ============================================
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.setAttribute('aria-label', 'ページトップへ戻る');
    document.body.appendChild(backToTopBtn);

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
        .back-to-top {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            background-color: var(--color-primary);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .back-to-top.visible {
            opacity: 1;
            visibility: visible;
        }

        .back-to-top:hover {
            background-color: var(--color-primary-dark);
            transform: translateY(-5px);
        }
    `;
    document.head.appendChild(styles);

    // Show/hide on scroll
    window.addEventListener('scroll', throttle(() => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }, 200));

    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Uncomment to enable back to top button
// initBackToTop();

// ============================================
// Console Welcome Message
// ============================================
console.log('%cADDRESS CALLING Inc.', 'font-size: 24px; font-weight: bold; color: #0066FF;');
console.log('%cロジスティクスを、AIで再設計する。', 'font-size: 14px; color: #666;');
console.log('Website: https://addresscalling.jp');
