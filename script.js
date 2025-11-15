// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}

// --- Initialize DOM functionality ---
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Initialize all functionality
    initNavigation();
    initSmoothScrolling();
    initFAQ();
    initExternalLinks();
    initContactButtons();
    initMembershipButtons();
});

// --- Navigation functionality ---
function initNavigation() {
    const navbar = document.getElementById('navigation');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = mobileMenuButton.querySelector('.menu-icon');
    const closeIcon = mobileMenuButton.querySelector('.close-icon');

    function handleScroll() {
        const isScrolled = window.scrollY > 50;
        if (isScrolled) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    function toggleMobileMenu() {
        const isOpen = mobileMenu.classList.contains('active');
        if (isOpen) {
            mobileMenu.classList.remove('active');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        } else {
            mobileMenu.classList.add('active');
            menuIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
        }
    }

    window.addEventListener('scroll', handleScroll);
    mobileMenuButton.addEventListener('click', toggleMobileMenu);

    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        });
    });

    handleScroll();
}

// --- Smooth scrolling functionality ---
function initSmoothScrolling() {
    function scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const scrollElements = document.querySelectorAll('[data-section]');
    scrollElements.forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = element.getAttribute('data-section');
            scrollToSection(sectionId);
        });
    });

    const logoButton = document.getElementById('logo-button');
    if (logoButton) {
        logoButton.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToSection('home');
        });
    }
}

// --- FAQ accordion functionality ---
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach((item) => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherIcon = otherItem.querySelector('.faq-icon');
                    otherAnswer.classList.remove('active');
                    otherIcon.style.transform = 'rotate(0deg)';
                    otherIcon.style.color = 'var(--muted-foreground)';
                }
            });

            if (isActive) {
                item.classList.remove('active');
                answer.classList.remove('active');
                icon.style.transform = 'rotate(0deg)';
                icon.style.color = 'var(--muted-foreground)';
            } else {
                item.classList.add('active');
                answer.classList.add('active');
                icon.style.transform = 'rotate(180deg)';
                icon.style.color = 'var(--primary)';
            }
        });
    });
}

// --- External links functionality ---
function initExternalLinks() {
    const makeRequestBtn = document.getElementById('make-request-btn');
    if (makeRequestBtn) {
        makeRequestBtn.addEventListener('click', () => {
            window.open('https://overseerr.movierequest.work/', '_blank');
        });
    }

    const plexProfileBtn = document.getElementById('plex-profile-btn');
    if (plexProfileBtn) {
        plexProfileBtn.addEventListener('click', () => {
            window.open('https://l.plex.tv/B8NDphP', '_blank');
        });
    }

    const downloadButtons = document.querySelectorAll('.download-btn[data-url]');
    downloadButtons.forEach(button => {
        button.addEventListener('click', () => {
            const url = button.getAttribute('data-url');
            if (url) {
                window.open(url, '_blank');
            }
        });
    });

    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert('This social media link would be implemented in a real application');
        });
    });

    const placeholderLinks = [
        'support-link-help-center',
        'support-link-contact',
        'support-link-status-page',
        'legal-link-privacy-policy',
        'legal-link-terms-of-service'
    ];

    placeholderLinks.forEach(linkId => {
        const link = document.querySelector(`[data-testid="${linkId}"]`);
        if (link) {
            link.addEventListener('click', () => {
                alert('This link would be implemented in a real application');
            });
        }
    });
}

// --- Contact buttons functionality ---
function initContactButtons() {
    const whatsappButtons = [
        document.getElementById('whatsapp-btn'),
        document.getElementById('footer-whatsapp-btn')
    ];

    whatsappButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                window.open('https://wa.me/447481861478', '_blank');
            });
        }
    });

    const callButtons = [
        document.getElementById('call-btn'),
        document.getElementById('footer-call-btn')
    ];

    callButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                window.open('tel:+447481861478', '_blank');
            });
        }
    });

    const emailButtons = [
        document.getElementById('email-btn'),
        document.getElementById('footer-email-btn')
    ];

    emailButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                window.open('mailto:jacobnathan1718@gmail.com', '_blank');
            });
        }
    });

    const footerContactBtn = document.getElementById('footer-contact-btn');
    if (footerContactBtn) {
        footerContactBtn.addEventListener('click', () => {
            showContactAlert();
        });
    }
}

// --- Membership buttons functionality ---
function initMembershipButtons() {
    const joinButtons = document.querySelectorAll('.join-btn');
    
    joinButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.open('https://ko-fi.com/jnathan34/tiers', '_blank');
        });
    });
}

// --- Show contact information alert ---
function showContactAlert() {
    const contactInfo = `Contact Jacob Nathan:

Phone: 07481 861478
Email: jacobnathan1718@gmail.com

Bank Transfer Details:
Name: Jacob Nathan
Account: 58925008
Sort Code: 09-01-28`;
    
    alert(contactInfo);
}

// --- Utility function to handle responsive behavior ---
function handleResize() {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');

    if (window.innerWidth >= 768) {
        mobileMenu.classList.remove('active');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
}

window.addEventListener('resize', handleResize);

// --- Reinitialize icons on visibility change ---
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && typeof lucide !== 'undefined') {
        setTimeout(() => {
            lucide.createIcons();
        }, 100);
    }
});

function reinitializeIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// --- Export functions for other scripts ---
window.PlexServerApp = {
    scrollToSection: function(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    },
    showContactAlert: showContactAlert,
    reinitializeIcons: reinitializeIcons
};
