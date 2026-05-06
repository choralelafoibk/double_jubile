// ==================================================
// EVENEMENTS.JS - Page des événements du Jubilé
// Mise à jour : Mars 2026
// ==================================================

// Variables globales
let currentActiveNav = null;
let scrollTimeout = null;

// ==================================================
// 1. INITIALISATION PRINCIPALE
// ==================================================

function initEvenements() {
    console.log('🎪 Initialisation de la page événements (Mars 2026)...');
    
    // Initialiser toutes les fonctionnalités
    initNavigationEvenements();
    initSmoothScrolling();
    initMissModal();
    initActiveSectionObserver();
    initEventCardsAnimation();
    initCountdownForEvents();
    
    // Gérer le hash dans l'URL
    handleHashOnLoad();
    
    // Ajouter les styles dynamiques
    addDynamicStyles();
    
    console.log('✅ Page événements initialisée avec succès');
}

// ==================================================
// 2. NAVIGATION ÉVÉNEMENTS
// ==================================================

function initNavigationEvenements() {
    const navItems = document.querySelectorAll('.nav-event-item');
    
    if (navItems.length === 0) {
        console.warn('Aucun élément .nav-event-item trouvé');
        return;
    }
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (!targetId || targetId === '#') return;
            
            // Mettre à jour la classe active
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            currentActiveNav = this;
            
            // Défilement vers la section
            scrollToSection(targetId);
        });
    });
    
    console.log(`✅ Navigation initialisée (${navItems.length} éléments)`);
}

// ==================================================
// 3. DÉFILEMENT FLUIDE
// ==================================================

function scrollToSection(targetId) {
    const targetElement = document.querySelector(targetId);
    
    if (!targetElement) {
        console.warn(`Section ${targetId} non trouvée`);
        return;
    }
    
    const header = document.querySelector('.header');
    const headerHeight = header ? header.offsetHeight : 80;
    const targetPosition = targetElement.offsetTop - headerHeight - 20;
    
    window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth'
    });
}

function initSmoothScrolling() {
    // Pour tous les liens internes
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Éviter les doublons avec la navigation existante
        if (!anchor.classList.contains('nav-event-item')) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#' || href === '#top' || href === '#0') return;
                
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    scrollToSection(href);
                }
            });
        }
    });
}

// ==================================================
// 4. OBSERVER POUR METTRE À JOUR LA NAVIGATION ACTIVE
// ==================================================

function initActiveSectionObserver() {
    const sections = document.querySelectorAll('.evenement-detail');
    const navItems = document.querySelectorAll('.nav-event-item');
    
    if (sections.length === 0 || navItems.length === 0) return;
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-80px 0px -50% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = '#' + entry.target.id;
                
                navItems.forEach(item => {
                    const itemHref = item.getAttribute('href');
                    item.classList.remove('active');
                    
                    if (itemHref === currentId) {
                        item.classList.add('active');
                        currentActiveNav = item;
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
}

// ==================================================
// 5. ANIMATION DES CARTES D'ÉVÉNEMENTS
// ==================================================

function initEventCardsAnimation() {
    const cards = document.querySelectorAll('.edition-card, .feature-item, .option-card, .journee-card');
    
    if (cards.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 50);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

// ==================================================
// 6. GESTION DU HASH DANS L'URL
// ==================================================

function handleHashOnLoad() {
    if (window.location.hash) {
        const targetId = window.location.hash;
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            setTimeout(() => {
                scrollToSection(targetId);
                
                // Mettre à jour la navigation active
                const navItems = document.querySelectorAll('.nav-event-item');
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === targetId) {
                        item.classList.add('active');
                    }
                });
            }, 500);
        }
    }
}

// ==================================================
// 7. COMPTE À REBOURS POUR LES ÉVÉNEMENTS À VENIR
// ==================================================

function initCountdownForEvents() {
    const now = new Date();
    const upcomingEvents = [];
    
    // Récupérer tous les événements avec leurs dates
    const eventDates = [
        { id: 'coupe-2027', date: new Date(2027, 4, 20), name: 'Coupe de la Foi 2027' },
        { id: 'miabe-foire-2027', date: new Date(2027, 8, 15), name: 'Miabe Foire 2027' },
        { id: 'miss-be-kpota', date: new Date(2028, 2, 25), name: 'Miss Bè-Kpota 2028' },
        { id: 'jubile-cup', date: new Date(2028, 5, 16), name: 'Jubilé Cup 2028' },
        { id: 'miabe-foire-2028', date: new Date(2028, 8, 14), name: 'Miabe Foire 2028' },
        { id: 'concert-jubile', date: new Date(2028, 8, 28), name: 'Concert Jubilé 2028' },
        { id: 'semaine-jubile', date: new Date(2028, 8, 23), name: 'Semaine du Jubilé 2028' }
    ];
    
    // Trouver les événements à venir
    eventDates.forEach(event => {
        if (event.date > now) {
            upcomingEvents.push(event);
        }
    });
    
    // Trier par date
    upcomingEvents.sort((a, b) => a.date - b.date);
    
    // Ajouter un badge "À venir" sur les événements
    upcomingEvents.forEach(event => {
        const section = document.getElementById(event.id);
        if (section && !section.querySelector('.coming-soon-badge')) {
            const badge = document.createElement('div');
            badge.className = 'coming-soon-badge';
            badge.innerHTML = '<i class="fas fa-hourglass-half"></i> À venir';
            badge.style.cssText = `
                position: absolute;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, var(--gold), var(--gold-dark));
                color: var(--marine-blue);
                padding: 5px 12px;
                border-radius: 50px;
                font-size: 0.7rem;
                font-weight: bold;
                z-index: 10;
                box-shadow: var(--shadow-sm);
            `;
            section.style.position = 'relative';
            section.appendChild(badge);
        }
    });
    
    // Afficher le prochain événement
    if (upcomingEvents.length > 0) {
        displayNextEventBanner(upcomingEvents[0]);
    }
}

function displayNextEventBanner(event) {
    const banner = document.createElement('div');
    banner.className = 'next-event-banner';
    banner.innerHTML = `
        <div class="container">
            <div class="next-event-content">
                <i class="fas fa-bell"></i>
                <span>Prochain événement :</span>
                <strong>${event.name}</strong>
                <span>${formatDate(event.date)}</span>
                <div class="countdown-timer" data-date="${event.date.toISOString()}"></div>
            </div>
        </div>
    `;
    
    const heroSection = document.querySelector('.evenements-hero');
    if (heroSection) {
        heroSection.insertAdjacentElement('afterend', banner);
        
        // Démarrer le compte à rebours
        const countdownEl = banner.querySelector('.countdown-timer');
        if (countdownEl) {
            startCountdown(event.date, countdownEl);
        }
    }
}

function startCountdown(targetDate, element) {
    function update() {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();
        
        if (diff <= 0) {
            element.innerHTML = '<span class="event-started">🎉 Événement en cours ! 🎉</span>';
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        element.innerHTML = `
            <div class="countdown-item">
                <span class="countdown-number">${String(days).padStart(2, '0')}</span>
                <span class="countdown-label">jours</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">${String(hours).padStart(2, '0')}</span>
                <span class="countdown-label">heures</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">${String(minutes).padStart(2, '0')}</span>
                <span class="countdown-label">minutes</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">${String(seconds).padStart(2, '0')}</span>
                <span class="countdown-label">secondes</span>
            </div>
        `;
    }
    
    update();
    setInterval(update, 1000);
}

function formatDate(date) {
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// ==================================================
// 8. MODAL MISS BÈ-KPOTA
// ==================================================

function initMissModal() {
    const modal = document.getElementById('missModal');
    if (!modal) return;
    
    // Fermer le modal en cliquant en dehors
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeMissForm();
        }
    });
    
    // Empêcher la fermeture en cliquant à l'intérieur
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Fermer avec la touche Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeMissForm();
        }
    });
}

function openMissForm() {
    const modal = document.getElementById('missModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Animation d'entrée
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }
}

function closeMissForm() {
    const modal = document.getElementById('missModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function downloadMissForm() {
    const content = `========================================
FORMULAIRE DE CANDIDATURE
MISS BÈ-KPOTA 2028
========================================

📋 INFORMATIONS PERSONNELLES
----------------------------------------
Nom : ___________________________
Prénom : ________________________
Date de naissance : __/__/____
Lieu de naissance : _____________
Nationalité : ___________________
Adresse complète : ______________
_________________________________
Téléphone : _____________________
Email : _________________________

📚 FORMATION
----------------------------------------
Niveau d'études : _______________
Établissement : _________________
Diplômes obtenus : ______________
_________________________________

💼 EXPÉRIENCES
----------------------------------------
Expériences professionnelles : ___
_________________________________
Engagements associatifs : ________
_________________________________
Talents / compétences : __________
_________________________________

🏆 MOTIVATIONS
----------------------------------------
Pourquoi souhaitez-vous devenir Miss Bè-Kpota ?
__________________________________________________
__________________________________________________
__________________________________________________

📎 DOCUMENTS À FOURNIR
----------------------------------------
☐ Photocopie de la carte d'identité ou passeport
☐ 2 photos d'identité récentes
☐ Certificat de résidence ou attestation de paroisse
☐ Lettre de motivation
☐ Curriculum vitae
☐ Certificat médical

📜 DÉCLARATION SUR L'HONNEUR
----------------------------------------
Je soussignée, __________________________,
déclare sur l'honneur que les informations fournies sont exactes
et m'engage à respecter le règlement du concours.

Signature : ________________________
Date : __/__/____

========================================
INFORMATIONS DE DÉPÔT
========================================
📧 Par email : missbekpota@jubile.org
   Objet : "Candidature Miss Bè-Kpota - [VOTRE NOM]"

📍 En personne :
   Secrétariat de la Paroisse Sainte Maria Goretti
   Bè-Kpota, Lomé - Togo
   Horaires : Lundi-Vendredi, 9h-12h et 14h-17h

📅 Date limite : 15 Février 2028

========================================`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formulaire-miss-be-kpota-2028.txt';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    showNotification('Formulaire téléchargé ! Consultez les instructions de dépôt.', 'success', 3000);
}

// ==================================================
// 9. NOTIFICATIONS
// ==================================================

function showNotification(message, type = 'info', duration = 3000) {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `custom-notification custom-notification-${type}`;
    
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        info: '<i class="fas fa-info-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            ${icons[type] || icons.info}
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-fermeture
    const timeout = setTimeout(() => {
        closeNotification(notification);
    }, duration);
    
    // Fermeture au clic
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            clearTimeout(timeout);
            closeNotification(notification);
        });
    }
    
    function closeNotification(notif) {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }
}

// ==================================================
// 10. STYLES DYNAMIQUES
// ==================================================

function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Bannière prochain événement */
        .next-event-banner {
            background: linear-gradient(135deg, var(--marine-blue), var(--rose));
            color: white;
            padding: 15px 0;
            position: sticky;
            top: 80px;
            z-index: 99;
            box-shadow: var(--shadow-md);
        }
        
        .next-event-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            text-align: center;
        }
        
        .next-event-content i {
            font-size: 1.2rem;
        }
        
        .next-event-content strong {
            color: var(--gold);
        }
        
        .countdown-timer {
            display: flex;
            gap: 10px;
            background: rgba(0, 0, 0, 0.2);
            padding: 5px 15px;
            border-radius: 50px;
        }
        
        .countdown-timer .countdown-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 5px 8px;
        }
        
        .countdown-timer .countdown-number {
            font-size: 1rem;
            font-weight: bold;
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 6px;
            border-radius: 5px;
            min-width: 35px;
            text-align: center;
        }
        
        .countdown-timer .countdown-label {
            font-size: 0.6rem;
            text-transform: uppercase;
        }
        
        .event-started {
            background: var(--gold);
            color: var(--marine-blue);
            padding: 5px 15px;
            border-radius: 50px;
            font-weight: bold;
        }
        
        /* Notifications */
        .custom-notification {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: white;
            border-radius: 8px;
            padding: 15px 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            z-index: 10001;
            min-width: 280px;
            max-width: 400px;
            font-family: 'Montserrat', sans-serif;
        }
        
        .custom-notification.show {
            transform: translateX(0);
        }
        
        .custom-notification-success {
            border-left: 4px solid var(--gold);
        }
        
        .custom-notification-error {
            border-left: 4px solid var(--rose);
        }
        
        .custom-notification-info {
            border-left: 4px solid var(--marine-blue);
        }
        
        .custom-notification-warning {
            border-left: 4px solid var(--orange);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }
        
        .notification-content i {
            font-size: 1.2rem;
        }
        
        .custom-notification-success .notification-content i {
            color: var(--gold);
        }
        
        .custom-notification-error .notification-content i {
            color: var(--rose);
        }
        
        .custom-notification-info .notification-content i {
            color: var(--marine-blue);
        }
        
        .notification-close {
            background: none;
            border: none;
            cursor: pointer;
            color: #999;
            padding: 5px;
            transition: color 0.3s;
        }
        
        .notification-close:hover {
            color: #333;
        }
        
        /* Animation pour les cartes */
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
        
        /* Responsive */
        @media (max-width: 768px) {
            .next-event-banner {
                top: 70px;
                padding: 10px 0;
            }
            
            .next-event-content {
                gap: 10px;
                font-size: 0.9rem;
            }
            
            .countdown-timer {
                padding: 3px 10px;
            }
            
            .countdown-timer .countdown-item {
                padding: 3px 5px;
            }
            
            .countdown-timer .countdown-number {
                font-size: 0.8rem;
                min-width: 28px;
            }
            
            .custom-notification {
                left: 20px;
                right: 20px;
                bottom: 20px;
                min-width: auto;
                max-width: none;
            }
        }
        
        @media (max-width: 576px) {
            .next-event-content {
                flex-direction: column;
                gap: 5px;
            }
            
            .countdown-timer {
                margin-top: 5px;
            }
        }
        
        /* Réduction de mouvement */
        @media (prefers-reduced-motion: reduce) {
            .next-event-banner,
            .custom-notification,
            .edition-card,
            .feature-item,
            .option-card,
            .journee-card {
                animation-duration: 0.01ms !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// ==================================================
// 11. FONCTIONS UTILITAIRES SUPPLÉMENTAIRES
// ==================================================

// Ajouter des tooltips sur les dates
function initTooltips() {
    const dates = document.querySelectorAll('.evenement-date, .event-date');
    dates.forEach(date => {
        const dateText = date.textContent;
        if (dateText && dateText.includes('2027') || dateText.includes('2028')) {
            date.setAttribute('data-tooltip', 'Cliquez pour ajouter à votre agenda');
            date.style.cursor = 'pointer';
            
            date.addEventListener('click', function() {
                const eventSection = this.closest('.evenement-detail');
                const eventTitle = eventSection?.querySelector('h2')?.textContent || 'Événement';
                const eventDate = this.textContent;
                
                showNotification(`📅 ${eventTitle} - ${eventDate}`, 'info', 2000);
            });
        }
    });
}

// Ajouter des icônes de partage
function initShareButtons() {
    const sections = document.querySelectorAll('.evenement-detail');
    
    sections.forEach(section => {
        const shareBtn = document.createElement('button');
        shareBtn.className = 'share-event-btn';
        shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
        shareBtn.setAttribute('aria-label', 'Partager cet événement');
        shareBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 80px;
            background: var(--white);
            border: none;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: var(--shadow-sm);
            transition: var(--transition);
            z-index: 10;
        `;
        
        shareBtn.addEventListener('click', async () => {
            const url = window.location.href.split('#')[0] + '#' + section.id;
            const title = section.querySelector('h2')?.textContent || 'Événement Jubilé';
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: title,
                        text: `Découvrez ${title} du Jubilé 2027-2028`,
                        url: url
                    });
                } catch (err) {
                    copyToClipboard(url);
                }
            } else {
                copyToClipboard(url);
            }
        });
        
        section.style.position = 'relative';
        section.appendChild(shareBtn);
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Lien copié dans le presse-papier !', 'success', 2000);
    }).catch(() => {
        showNotification('Erreur lors de la copie', 'error', 2000);
    });
}

// ==================================================
// 12. EXPOSITION DES FONCTIONS GLOBALES
// ==================================================

// Exposer les fonctions globalement pour les appels HTML
window.openMissForm = openMissForm;
window.closeMissForm = closeMissForm;
window.downloadMissForm = downloadMissForm;
window.showNotification = showNotification;

// ==================================================
// 13. INITIALISATION AU CHARGEMENT
// ==================================================

document.addEventListener('DOMContentLoaded', function() {
    initEvenements();
    
    // Ajouter un petit délai pour les fonctionnalités supplémentaires
    setTimeout(() => {
        initTooltips();
        initShareButtons();
    }, 500);
});

// Gestion du scroll pour masquer/afficher la bannière
let lastScrollY = 0;
window.addEventListener('scroll', function() {
    const banner = document.querySelector('.next-event-banner');
    if (!banner) return;
    
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scroll vers le bas - masquer la bannière
        banner.style.transform = 'translateY(-100%)';
        banner.style.transition = 'transform 0.3s ease';
    } else if (currentScrollY < lastScrollY) {
        // Scroll vers le haut - afficher la bannière
        banner.style.transform = 'translateY(0)';
    }
    
    lastScrollY = currentScrollY;
});

// Préchargement des images de la galerie (optionnel)
function preloadImages() {
    const images = document.querySelectorAll('.event-image');
    images.forEach(img => {
        if (img.dataset.src) {
            const newImg = new Image();
            newImg.src = img.dataset.src;
        }
    });
}