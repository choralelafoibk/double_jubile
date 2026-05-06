// =========================================================
// FONCTIONS GENERALES
// =========================================================

// Menu mobile
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
    
    function toggleMenu() {
        const isActive = navLinks.classList.contains('active');
        
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    function openMenu() {
        navLinks.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }
    
    function closeMenu() {
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
    
    mobileMenuBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);
    
    // Fermer le menu en cliquant sur un lien
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });
}    

// Header scroll effect avec optimisation
const header = document.querySelector('.header');
let lastScroll = 0;
let ticking = false;

if (header) {
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const currentScroll = window.pageYOffset;
            
                // Ajouter/retirer la classe scrolled
                if (currentScroll > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }

                // Cacher/afficher le header au scroll (optionnel)
                if (currentScroll > lastScroll && currentScroll > 100) {
                    // Scroll vers le bas
                    header.style.transform = 'translateY(-100%)';
                    header.style.transition = 'transform 0.3s ease';
                } else if (currentScroll < lastScroll) {
                    // Scroll vers le haut
                    header.style.transform = 'translateY(0)';
                    header.style.transition = 'transform 0.3s ease';
                }

                lastScroll = currentScroll;
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Animation au scroll avec Intersection Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            
            // Ajouter un style d'animation personnalisé
            if (entry.target.classList.contains('anniversaire-card')) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            } else if (entry.target.classList.contains('evenement-card')) {
                entry.target.style.animation = 'fadeInLeft 0.6s ease forwards';
            }
        }
    });
}, observerOptions);

// Observer les éléments
document.querySelectorAll('.anniversaire-card, .evenement-card, .timeline-item, .gallery-item').forEach(el => {
    observer.observe(el);
});

// Ajouter les animations CSS dynamiquement
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .anniversaire-card, .evenement-card, .timeline-item, .gallery-item {
        opacity: 0;
    }
    
    .anniversaire-card.animate, .evenement-card.animate, 
    .timeline-item.animate, .gallery-item.animate {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Compteur d'années avec animation
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 secondes
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.min(Math.ceil(current), target);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Observer les compteurs
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            initCounters();
            counterObserver.unobserve(entry.target);
        }
    });
});

// Observer les compteurs s'ils existent
document.querySelectorAll('.counter-section').forEach(el => {
    counterObserver.observe(el);
});

// Formater les dates
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Système de notifications amélioré
function showNotification(message, type = 'success', duration = 5000) {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Icônes selon le type
    const icons = {
        success: '<i class="fas fa-check-circle" style="color: #ffd700;"></i>',
        error: '<i class="fas fa-exclamation-circle" style="color: #e83e8c;"></i>',
        info: '<i class="fas fa-info-circle" style="color: #0a1f44;"></i>',
        warning: '<i class="fas fa-exclamation-triangle" style="color: #ffd700;"></i>'
    };
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            ${icons[type] || icons.success}
            <span>${message}</span>
        </div>
        <button class="notification-close" aria-label="Fermer">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Fermer la notification
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeNotification(notification);
        });
    }
    
    // Auto-fermeture
    let timeoutId = setTimeout(() => {
        closeNotification(notification);
    }, duration);
    
    // Pause au hover
    notification.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
    });
    
    notification.addEventListener('mouseleave', () => {
        timeoutId = setTimeout(() => {
            closeNotification(notification);
        }, duration);
    });
    
    function closeNotification(notif) {
        notif.classList.remove('show');
        setTimeout(() => {
            if (notif.parentNode) {
                notif.remove();
            }
        }, 300);
    }
}

// Chargement d'images lazy
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src], img.lazy');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.classList.add('loaded');
                        
                        // Ajouter un effet de fade
                        img.style.opacity = '0';
                        img.style.transition = 'opacity 0.3s ease';
                        
                        img.onload = () => {
                            img.style.opacity = '1';
                        };
                        
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback pour les anciens navigateurs
        lazyImages.forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
            }
        });
    }
}

// Système de thème (jour/nuit)
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.toggle('dark-theme', currentTheme === 'dark');
        
        // Mettre à jour l'icône
        updateThemeIcon(currentTheme);
        
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-theme');
            const newTheme = isDark ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            
            // Afficher une notification
            showNotification(`Thème ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`, 'info', 2000);
        });
    }
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre');
    }
}

// Gestion des formulaires avec validation
function initForms() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            const formData = new FormData(form);
            
            // Validation de base
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    showNotification(`Le champ ${field.name || 'requis'} est obligatoire`, 'error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) return;
            
            // Validation email
            const emailField = form.querySelector('input[type="email"]');
            if (emailField && emailField.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailField.value)) {
                    showNotification('Veuillez entrer une adresse email valide', 'error');
                    return;
                }
            }
            
            // Simulation d'envoi (remplacer par votre logique d'envoi réelle)
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;
            
            try {
                // Simuler une requête API
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Succès
                form.reset();
                showNotification('Formulaire envoyé avec succès !', 'success');
                
                // Redirection si spécifiée
                const redirectUrl = form.getAttribute('data-redirect');
                if (redirectUrl) {
                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 2000);
                }
                
            } catch (error) {
                showNotification('Une erreur est survenue. Veuillez réessayer.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    });
}

// Gestion des liens externes
function initExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.href.includes(window.location.host)) {
            link.addEventListener('click', (e) => {
                const confirmLeave = confirm('Vous allez quitter notre site. Souhaitez-vous continuer ?');
                if (!confirmLeave) {
                    e.preventDefault();
                }
            });
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

// Effet de parallaxe amélioré
function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.getAttribute('data-speed')) || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
}

// Scroll to top button
function initScrollTop() {
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollTopBtn.setAttribute('aria-label', 'Retour en haut');
    document.body.appendChild(scrollTopBtn);
    
    // Styles pour le bouton
    const btnStyle = document.createElement('style');
    btnStyle.textContent = `
        .scroll-top-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0a1f44, #e83e8c);
            color: white;
            border: none;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            z-index: 999;
        }
        
        .scroll-top-btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        
        @media (max-width: 768px) {
            .scroll-top-btn {
                bottom: 20px;
                right: 20px;
                width: 45px;
                height: 45px;
                font-size: 1rem;
            }
        }
    `;
    document.head.appendChild(btnStyle);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.style.display = 'flex';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Compte à rebours pour les événements
function initCountdown() {
    const countdownElements = document.querySelectorAll('.countdown');
    
    countdownElements.forEach(element => {
        const targetDate = new Date(element.getAttribute('data-date')).getTime();
        
        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;
            
            if (distance < 0) {
                element.innerHTML = 'Événement commencé !';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            element.innerHTML = `
                <div class="countdown-item">
                    <span class="countdown-number">${days}</span>
                    <span class="countdown-label">Jours</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${hours}</span>
                    <span class="countdown-label">Heures</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${minutes}</span>
                    <span class="countdown-label">Minutes</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${seconds}</span>
                    <span class="countdown-label">Secondes</span>
                </div>
            `;
        }
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    });
}

// Tooltips
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(element => {
        let tooltipElement = null;
        
        element.addEventListener('mouseenter', (e) => {
            const tooltipText = e.target.getAttribute('data-tooltip');
            
            tooltipElement = document.createElement('div');
            tooltipElement.className = 'tooltip';
            tooltipElement.textContent = tooltipText;
            
            const rect = e.target.getBoundingClientRect();
            tooltipElement.style.left = `${rect.left + rect.width / 2}px`;
            tooltipElement.style.top = `${rect.top - 10}px`;
            
            document.body.appendChild(tooltipElement);
            
            setTimeout(() => {
                if (tooltipElement) {
                    tooltipElement.style.transform = 'translateX(-50%) translateY(-100%)';
                    tooltipElement.classList.add('show');
                }
            }, 10);
        });
        
        element.addEventListener('mouseleave', () => {
            if (tooltipElement) {
                tooltipElement.remove();
                tooltipElement = null;
            }
        });
    });
    
    // Styles tooltips
    const tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = `
        .tooltip {
            position: fixed;
            background: #0a1f44;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.85rem;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transform: translateX(-50%) translateY(-100%);
            transition: opacity 0.2s ease;
            z-index: 10000;
            font-family: 'Montserrat', sans-serif;
        }
        
        .tooltip.show {
            opacity: 1;
        }
        
        .tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 5px;
            border-style: solid;
            border-color: #0a1f44 transparent transparent transparent;
        }
    `;
    document.head.appendChild(tooltipStyle);
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    console.log('Site Jubilé 2027-2028 - Chargé avec succès');
    
    // Initialiser toutes les fonctionnalités
    initLazyLoading();
    initThemeToggle();
    initForms();
    initExternalLinks();
    initParallax();
    initScrollTop();
    initCountdown();
    initTooltips();
    
    // Ajouter une classe au body pour indiquer que le JS est chargé
    document.body.classList.add('js-loaded');
    
    // Animation de bienvenue
    setTimeout(() => {
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            showNotification('Bienvenue sur le site du Jubilé 2027-2028 !', 'success', 4000);
        }
    }, 1000);
});

// Gestion des erreurs globales
window.addEventListener('error', (e) => {
    console.error('Erreur globale:', e.error);
    // Ne pas afficher d'erreur à l'utilisateur pour les erreurs mineures
});

// Prévenir le clic droit sur les images (optionnel)
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
});

// Performance : désactiver les animations sur les appareils à faible batterie
if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        if (battery.level < 0.2 && !battery.charging) {
            document.body.classList.add('reduce-motion');
            
            const reduceMotionStyle = document.createElement('style');
            reduceMotionStyle.textContent = `
                .reduce-motion * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(reduceMotionStyle);
        }
    });
}

// Export des fonctions utiles pour d'autres scripts
window.jubileSite = {
    showNotification,
    formatDate,
    initCounters
};