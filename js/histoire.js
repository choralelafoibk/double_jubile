// =====================================================
// HISTOIRE.JS - Page Histoire du Jubilé 2027-2028
// Mise à jour : Mars 2026
// =====================================================

// Variables globales
let countdownInterval = null;

// =====================================================
// 1. INITIALISATION PRINCIPALE
// =====================================================

function initHistoire() {
    console.log('📖 Initialisation de la page Histoire (Mars 2026)...');
    
    // Initialiser toutes les fonctionnalités
    animateTimeline();
    animateChiffres();
    initGalerie();
    initTemoignages();
    initMarch2026Updates();
    
    console.log('✅ Page Histoire initialisée avec succès');
}

// =====================================================
// 2. ANIMATION DE LA TIMELINE
// =====================================================

function animateTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (timelineItems.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3, rootMargin: '0px 0px -50px 0px' });
    
    timelineItems.forEach(item => observer.observe(item));
}

// =====================================================
// 3. ANIMATION DES CHIFFRES
// =====================================================

function animateChiffres() {
    const chiffres = document.querySelectorAll('.chiffre-number');
    
    if (chiffres.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                animateCounter(entry.target);
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.5 });
    
    chiffres.forEach(chiffre => observer.observe(chiffre));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        current += increment;
        
        if (step >= steps) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

// =====================================================
// 4. GALERIE LIGHTBOX
// =====================================================

function initGalerie() {
    const galerieItems = document.querySelectorAll('.galerie-item');
    
    if (galerieItems.length === 0) return;
    
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Fermer"><i class="fas fa-times"></i></button>
            <button class="lightbox-prev" aria-label="Précédent"><i class="fas fa-chevron-left"></i></button>
            <button class="lightbox-next" aria-label="Suivant"><i class="fas fa-chevron-right"></i></button>
            <img src="" alt="">
            <div class="lightbox-caption"></div>
        </div>
    `;
    document.body.appendChild(lightbox);
    
    let currentIndex = 0;
    const images = [];
    
    galerieItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const caption = item.querySelector('.galerie-overlay p');
        
        if (img) {
            images.push({
                src: img.src,
                alt: img.alt,
                caption: caption ? caption.textContent : ''
            });
            
            item.addEventListener('click', () => {
                currentIndex = index;
                openLightbox();
            });
        }
    });
    
    function openLightbox() {
        const lightboxImg = lightbox.querySelector('img');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        
        lightboxImg.src = images[currentIndex].src;
        lightboxImg.alt = images[currentIndex].alt;
        lightboxCaption.textContent = images[currentIndex].caption;
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeydown);
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleKeydown);
    }
    
    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        updateLightboxImage();
    }
    
    function prevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }
    
    function updateLightboxImage() {
        const lightboxImg = lightbox.querySelector('img');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = images[currentIndex].src;
            lightboxImg.alt = images[currentIndex].alt;
            lightboxCaption.textContent = images[currentIndex].caption;
            lightboxImg.style.opacity = '1';
        }, 200);
    }
    
    function handleKeydown(e) {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                nextImage();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
        }
    }
    
    // Événements
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-next').addEventListener('click', nextImage);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', prevImage);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// =====================================================
// 5. TÉMOIGNAGES INTERACTIFS (Lire plus / Lire moins)
// =====================================================

function initTemoignages() {
    const temoignages = document.querySelectorAll('.fondateur-temoignage');
    
    temoignages.forEach(temoignage => {
        const text = temoignage.textContent.trim();
        const maxLength = 150;
        
        if (text.length > maxLength) {
            const shortText = text.substring(0, maxLength) + '... ';
            const fullText = text;
            
            temoignage.innerHTML = `
                <span class="temoignage-short">${escapeHtml(shortText)}</span>
                <span class="temoignage-full" style="display: none;">${escapeHtml(fullText)}</span>
                <button class="read-more-btn" aria-expanded="false">Lire la suite</button>
            `;
            
            const shortSpan = temoignage.querySelector('.temoignage-short');
            const fullSpan = temoignage.querySelector('.temoignage-full');
            const readMoreBtn = temoignage.querySelector('.read-more-btn');
            
            readMoreBtn.addEventListener('click', () => {
                const isExpanded = readMoreBtn.getAttribute('aria-expanded') === 'true';
                
                if (!isExpanded) {
                    shortSpan.style.display = 'none';
                    fullSpan.style.display = 'inline';
                    readMoreBtn.textContent = 'Lire moins';
                    readMoreBtn.setAttribute('aria-expanded', 'true');
                } else {
                    shortSpan.style.display = 'inline';
                    fullSpan.style.display = 'none';
                    readMoreBtn.textContent = 'Lire la suite';
                    readMoreBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =====================================================
// 6. MISE À JOUR MARS 2026 - NOUVELLES FONCTIONNALITÉS
// =====================================================

function initMarch2026Updates() {
    console.log('📅 Activation des fonctionnalités Mars 2026...');
    
    // Ajouter les styles dynamiques
    addHistoryDynamicStyles();
    
    // Démarrer le compte à rebours jusqu'au début du Jubilé
    startJubileCountdown();
    
    // Ajouter des compteurs pour les événements futurs
    initEventCountdowns();
    
    // Ajouter des badges "À venir" sur les événements futurs
    addFutureBadges();
    
    // Afficher le mini compte à rebours dans la bannière
    updateMiniCountdown();
}

function addHistoryDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Lightbox Styles */
        .lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            cursor: pointer;
        }
        
        .lightbox.active {
            display: flex;
        }
        
        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            cursor: default;
        }
        
        .lightbox-content img {
            max-width: 100%;
            max-height: 80vh;
            display: block;
            margin: 0 auto;
            border-radius: 8px;
            transition: opacity 0.3s ease;
        }
        
        .lightbox-caption {
            color: #fff;
            text-align: center;
            margin-top: 20px;
            font-size: 1rem;
            font-family: 'Montserrat', sans-serif;
        }
        
        .lightbox-close,
        .lightbox-prev,
        .lightbox-next {
            position: absolute;
            background: rgba(10, 31, 68, 0.8);
            border: none;
            color: #fff;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }
        
        .lightbox-close:hover,
        .lightbox-prev:hover,
        .lightbox-next:hover {
            background: var(--gold);
            transform: scale(1.05);
        }
        
        .lightbox-close {
            top: -60px;
            right: 0;
        }
        
        .lightbox-prev {
            top: 50%;
            left: -60px;
            transform: translateY(-50%);
        }
        
        .lightbox-next {
            top: 50%;
            right: -60px;
            transform: translateY(-50%);
        }
        
        /* Read More Button */
        .read-more-btn {
            background: none;
            border: none;
            color: var(--rose);
            cursor: pointer;
            font-weight: 600;
            margin-left: 5px;
            padding: 0;
            font-size: 0.9rem;
            transition: color 0.3s ease;
        }
        
        .read-more-btn:hover {
            color: var(--gold);
            text-decoration: underline;
        }
        
        /* Countdown Styles */
        .countdown-timer-large {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            margin: 20px 0;
        }
        
        .countdown-item {
            background: rgba(255, 255, 255, 0.2);
            padding: 15px 20px;
            border-radius: 12px;
            min-width: 80px;
            text-align: center;
            backdrop-filter: blur(5px);
        }
        
        .countdown-number {
            font-size: 2rem;
            font-weight: bold;
            display: block;
            font-family: monospace;
        }
        
        .countdown-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .event-started {
            background: var(--gold);
            color: var(--marine-blue);
            padding: 10px 20px;
            border-radius: 50px;
            font-weight: bold;
            display: inline-block;
        }
        
        /* Responsive Lightbox */
        @media (max-width: 768px) {
            .lightbox-close {
                top: -50px;
                right: 0;
                width: 40px;
                height: 40px;
            }
            
            .lightbox-prev {
                left: -50px;
                width: 40px;
                height: 40px;
            }
            
            .lightbox-next {
                right: -50px;
                width: 40px;
                height: 40px;
            }
        }
        
        @media (max-width: 576px) {
            .lightbox-prev {
                left: 10px;
                top: auto;
                bottom: 20px;
                transform: none;
            }
            
            .lightbox-next {
                right: 10px;
                top: auto;
                bottom: 20px;
                transform: none;
            }
            
            .lightbox-close {
                top: 10px;
                right: 10px;
            }
        }
    `;
    document.head.appendChild(style);
}

function startJubileCountdown() {
    const startDate = new Date(2027, 1, 15); // 15 Février 2027
    const now = new Date();
    
    if (now < startDate) {
        const countdownContainer = document.createElement('div');
        countdownContainer.className = 'jubile-countdown-container';
        countdownContainer.innerHTML = `
            <div class="container">
                <div class="jubile-countdown">
                    <h3><i class="fas fa-hourglass-half"></i> J-${getDaysDifference(startDate)} avant le début du Jubilé !</h3>
                    <div class="countdown-timer-large" id="jubileCountdownTimer"></div>
                    <p>🎉 Les célébrations débutent en Février 2027 - Préparez-vous ! 🎉</p>
                </div>
            </div>
        `;
        
        const heroSection = document.querySelector('.histoire-hero');
        if (heroSection) {
            heroSection.insertAdjacentElement('afterend', countdownContainer);
            startCountdownTimer(startDate, 'jubileCountdownTimer');
        }
    }
}

function getDaysDifference(targetDate) {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function startCountdownTimer(targetDate, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    function update() {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();
        
        if (diff <= 0) {
            element.innerHTML = '<span class="event-started">🎉 Le Jubilé a commencé ! 🎉</span>';
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        element.innerHTML = `
            <div class="countdown-item">
                <span class="countdown-number">${String(days).padStart(2, '0')}</span>
                <span class="countdown-label">Jours</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">${String(hours).padStart(2, '0')}</span>
                <span class="countdown-label">Heures</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">${String(minutes).padStart(2, '0')}</span>
                <span class="countdown-label">Minutes</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">${String(seconds).padStart(2, '0')}</span>
                <span class="countdown-label">Secondes</span>
            </div>
        `;
    }
    
    update();
    setInterval(update, 1000);
}

function initEventCountdowns() {
    const countdownElements = document.querySelectorAll('.event-countdown');
    
    countdownElements.forEach(element => {
        const dateStr = element.getAttribute('data-date');
        if (dateStr) {
            const targetDate = new Date(dateStr);
            const now = new Date();
            
            if (targetDate > now) {
                startEventCountdown(targetDate, element);
            } else {
                element.innerHTML = '<span class="event-passed">✅ Événement passé</span>';
            }
        }
    });
}

function startEventCountdown(targetDate, element) {
    function update() {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();
        
        if (diff <= 0) {
            element.innerHTML = '<span class="event-started-small">🎉 Événement en cours !</span>';
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 30) {
            element.innerHTML = `<span class="countdown-number">📅 Dans ${days} jours</span>`;
        } else {
            element.innerHTML = `
                <span class="countdown-number">${String(days).padStart(2, '0')}j ${String(hours).padStart(2, '0')}h</span>
                <span class="countdown-label">avant l'événement</span>
            `;
        }
    }
    
    update();
    setInterval(update, 3600000); // Mise à jour toutes les heures
}

function addFutureBadges() {
    const now = new Date();
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        const yearElement = item.querySelector('.timeline-year');
        if (!yearElement) return;
        
        const yearText = yearElement.textContent;
        let isFuture = false;
        
        if (yearText.includes('2027') || yearText.includes('2028')) {
            const yearMatch = yearText.match(/(2027|2028)/);
            if (yearMatch) {
                const year = parseInt(yearMatch[1]);
                isFuture = year > now.getFullYear() || 
                          (year === now.getFullYear() && yearText.toLowerCase().includes('février') && now.getMonth() < 1);
            }
        }
        
        if (isFuture && !item.classList.contains('future-event')) {
            item.classList.add('future-event');
            const content = item.querySelector('.timeline-content');
            if (content && !content.querySelector('.badge-future')) {
                const h3 = content.querySelector('h3');
                if (h3) {
                    const badge = document.createElement('span');
                    badge.className = 'badge-future';
                    badge.innerHTML = '<i class="fas fa-clock"></i> À venir';
                    h3.appendChild(badge);
                }
            }
        }
    });
}

function updateMiniCountdown() {
    const miniCountdown = document.getElementById('miniCountdown');
    if (!miniCountdown) return;
    
    const startDate = new Date(2027, 1, 15);
    const now = new Date();
    
    if (now < startDate) {
        function update() {
            const diff = startDate.getTime() - now.getTime();
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
            miniCountdown.innerHTML = `Début dans ${days} jours`;
        }
        update();
        setInterval(update, 86400000); // Mise à jour toutes les 24h
    } else {
        miniCountdown.innerHTML = '🎉 Jubilé en cours !';
    }
}

// =====================================================
// 7. NOTIFICATION SYSTÈME
// =====================================================

function showNotification(message, type = 'info', duration = 3000) {
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
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    const timeout = setTimeout(() => closeNotification(notification), duration);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(timeout);
        closeNotification(notification);
    });
    
    function closeNotification(notif) {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }
}

// =====================================================
// 8. INITIALISATION AU CHARGEMENT
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    initHistoire();
    
    // Ajouter une petite animation de bienvenue
    setTimeout(() => {
        if (!sessionStorage.getItem('historyNotified')) {
            showNotification('Bienvenue sur la page Histoire du Jubilé 2027-2028 ! Découvrez notre parcours.', 'info', 5000);
            sessionStorage.setItem('historyNotified', 'true');
        }
    }, 1500);
});

// Exposer certaines fonctions globalement
window.showNotification = showNotification;