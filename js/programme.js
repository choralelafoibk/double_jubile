// =============================================================
// PROGRAMME.JS - FONCTIONS SPÉCIFIQUES À LA PAGE PROGRAMME
// Mise à jour : Mars 2026
// =============================================================

// Variables globales
let currentFilter = 'all';
let countdownInterval = null;

// =============================================================
// 1. INITIALISATION PRINCIPALE
// =============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page Programme - Initialisation (Mars 2026)');
    
    // Initialiser toutes les fonctionnalités
    initFiltres();
    animateMoisCards();
    initAnneeBadges();
    initProchainEvent();
    initExport();
    initScrollToEvents();
    
    // Ajouter les styles dynamiques
    addDynamicStyles();
    
    // Afficher un message de bienvenue avec l'année en cours
    const currentYear = new Date().getFullYear();
    if (currentYear === 2026) {
        showWelcomeMessage();
    }
    
    // Mettre à jour l'année dans le footer
    updateFooterYear();
});

// =============================================================
// 2. GESTION DES FILTRES
// =============================================================

function initFiltres() {
    const filtres = document.querySelectorAll('.filtre-btn');
    const moisCards = document.querySelectorAll('.mois-card');
    const eventItems = document.querySelectorAll('.event-item');
    const calendrierAnnees = document.querySelectorAll('.calendrier-annee');

    if (!filtres.length) return;

    filtres.forEach(filtre => {
        filtre.addEventListener('click', () => {
            // Mettre à jour la classe active
            filtres.forEach(f => f.classList.remove('active'));
            filtre.classList.add('active');

            const filtreValue = filtre.dataset.filtre;
            currentFilter = filtreValue;

            // Réinitialiser l'affichage
            resetDisplay(moisCards, calendrierAnnees);

            if (filtreValue === 'all') {
                showAllEvents(moisCards, eventItems, calendrierAnnees);
            } else if (filtreValue === '2027' || filtreValue === '2028') {
                filterByYear(filtreValue, moisCards, eventItems, calendrierAnnees);
            } else {
                filterByCategory(filtreValue, moisCards, eventItems, calendrierAnnees);
            }

            // Compter et afficher le nombre d'événements visibles
            updateEventCount(eventItems);
        });
    });
}

function resetDisplay(moisCards, calendrierAnnees) {
    // Afficher tous les mois et années
    moisCards.forEach(card => {
        card.style.display = 'block';
        card.classList.remove('hidden');
    });
    
    calendrierAnnees.forEach(annee => {
        annee.style.display = 'block';
        annee.classList.remove('hidden');
    });
    
    // Réinitialiser l'affichage des événements
    document.querySelectorAll('.event-item').forEach(item => {
        item.style.display = 'block';
        item.style.opacity = '1';
        item.classList.remove('hidden');
    });
}

function showAllEvents(moisCards, eventItems, calendrierAnnees) {
    // Tout afficher - déjà fait par resetDisplay
    animateReveal(moisCards);
}

function filterByYear(year, moisCards, eventItems, calendrierAnnees) {
    // Cacher les années qui ne correspondent pas
    calendrierAnnees.forEach(annee => {
        const anneeId = annee.id;
        if (anneeId === `annee-${year}`) {
            annee.style.display = 'block';
            annee.classList.remove('hidden');
        } else {
            annee.style.display = 'none';
            annee.classList.add('hidden');
        }
    });

    // Filtrer les événements par année
    eventItems.forEach(item => {
        const moisCard = item.closest('.mois-card');
        if (moisCard && moisCard.dataset.annee === year) {
            item.style.display = 'block';
            item.style.opacity = '1';
            item.classList.remove('hidden');
        } else {
            item.style.display = 'none';
            item.style.opacity = '0';
            item.classList.add('hidden');
        }
    });

    // Cacher les mois vides dans l'année visible
    const visibleAnnee = document.querySelector(`#annee-${year}`);
    if (visibleAnnee) {
        const moisCardsInYear = visibleAnnee.querySelectorAll('.mois-card');
        moisCardsInYear.forEach(card => {
            const visibleEvents = card.querySelectorAll('.event-item:not([style*="display: none"])');
            if (visibleEvents.length === 0) {
                card.style.display = 'none';
                card.classList.add('hidden');
            } else {
                card.style.display = 'block';
                card.classList.remove('hidden');
            }
        });
    }
}

function filterByCategory(category, moisCards, eventItems, calendrierAnnees) {
    // Afficher toutes les années
    calendrierAnnees.forEach(annee => {
        annee.style.display = 'block';
        annee.classList.remove('hidden');
    });

    // Filtrer par catégorie
    eventItems.forEach(item => {
        const itemCategory = item.dataset.categorie;
        if (itemCategory === category) {
            item.style.display = 'block';
            item.style.opacity = '1';
            item.classList.remove('hidden');
        } else {
            item.style.display = 'none';
            item.style.opacity = '0';
            item.classList.add('hidden');
        }
    });

    // Cacher les mois et années vides
    moisCards.forEach(card => {
        const visibleEvents = card.querySelectorAll('.event-item:not([style*="display: none"])');
        if (visibleEvents.length === 0) {
            card.style.display = 'none';
            card.classList.add('hidden');
        } else {
            card.style.display = 'block';
            card.classList.remove('hidden');
        }
    });

    calendrierAnnees.forEach(annee => {
        const visibleCards = annee.querySelectorAll('.mois-card:not([style*="display: none"])');
        if (visibleCards.length === 0) {
            annee.style.display = 'none';
            annee.classList.add('hidden');
        }
    });
}

function updateEventCount(eventItems) {
    const visibleCount = Array.from(eventItems).filter(item => 
        item.style.display !== 'none' && !item.classList.contains('hidden')
    ).length;
    
    // Afficher le compteur (optionnel)
    const countBadge = document.querySelector('.event-count-badge');
    if (countBadge) {
        countBadge.textContent = `${visibleCount} événements`;
    }
}

function animateReveal(elements) {
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.style.animation = 'fadeIn 0.5s ease forwards';
            setTimeout(() => {
                el.style.animation = '';
            }, 500);
        }, index * 50);
    });
}

// =============================================================
// 3. ANIMATION DES CARTES MOIS
// =============================================================

function animateMoisCards() {
    const moisCards = document.querySelectorAll('.mois-card');
    
    if (!('IntersectionObserver' in window)) {
        // Fallback pour les anciens navigateurs
        moisCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    moisCards.forEach(card => {
        if (!card.classList.contains('animated')) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            card.classList.add('animated');
            observer.observe(card);
        }
    });
}

// =============================================================
// 4. GESTION DES BADGES D'ANNÉE
// =============================================================

function initAnneeBadges() {
    const periodBadges = document.querySelectorAll('.period-badge');
    const calendrierAnnees = document.querySelectorAll('.calendrier-annee');

    if (!periodBadges.length) return;

    periodBadges.forEach(badge => {
        badge.addEventListener('click', () => {
            // Mettre à jour les badges actifs
            periodBadges.forEach(b => b.classList.remove('active'));
            badge.classList.add('active');

            const year = badge.dataset.year || badge.textContent.trim().substring(0, 4);
            
            // Afficher/masquer les années
            let targetAnnee = null;
            
            calendrierAnnees.forEach(annee => {
                const anneeId = annee.id;
                if (anneeId === `annee-${year}`) {
                    annee.style.display = 'block';
                    annee.classList.remove('hidden');
                    targetAnnee = annee;
                } else {
                    annee.style.display = 'none';
                    annee.classList.add('hidden');
                }
            });

            // Scroller vers l'année sélectionnée
            if (targetAnnee) {
                setTimeout(() => {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 100;
                    const targetPosition = targetAnnee.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        });
    });
}

// =============================================================
// 5. PROCHAIN ÉVÉNEMENT ET COMPTE À REBOURS
// =============================================================

function initProchainEvent() {
    const events = Array.from(document.querySelectorAll('.event-item'));
    const now = new Date();
    
    // Parcourir tous les événements pour trouver le prochain
    let nextEvent = null;
    let smallestDiff = Infinity;
    
    events.forEach(event => {
        const dateText = event.querySelector('.event-date')?.textContent;
        if (dateText) {
            const eventDate = parseDate(dateText);
            if (eventDate && eventDate > now) {
                const diff = eventDate.getTime() - now.getTime();
                if (diff < smallestDiff) {
                    smallestDiff = diff;
                    nextEvent = event;
                }
            }
        }
    });
    
    // Afficher le prochain événement
    if (nextEvent) {
        displayNextEvent(nextEvent);
    } else {
        // Aucun événement à venir
        displayNoUpcomingEvent();
    }
}

function parseDate(dateText) {
    const months = {
        'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
        'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
    };
    
    // Nettoyer le texte
    const cleanText = dateText.toLowerCase().replace(/[^\w\s]/g, '');
    const parts = cleanText.split(' ');
    
    // Chercher le jour et le mois
    let day = null;
    let month = null;
    let year = null;
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        // Chercher le jour (nombre)
        if (!isNaN(parseInt(part)) && parseInt(part) <= 31) {
            day = parseInt(part);
        }
        // Chercher le mois
        if (months[part] !== undefined) {
            month = months[part];
        }
        // Chercher l'année
        if (part.length === 4 && !isNaN(parseInt(part)) && parseInt(part) >= 2024) {
            year = parseInt(part);
        }
    }
    
    if (day && month !== undefined) {
        const now = new Date();
        // Si l'année n'est pas spécifiée, utiliser l'année courante ou suivante
        if (!year) {
            let candidateYear = now.getFullYear();
            let eventDate = new Date(candidateYear, month, day);
            if (eventDate < now) {
                candidateYear++;
                eventDate = new Date(candidateYear, month, day);
            }
            year = candidateYear;
        }
        return new Date(year, month, day);
    }
    
    return null;
}

function displayNextEvent(event) {
    const eventTitle = event.querySelector('h5')?.textContent || 'Événement à venir';
    const eventDesc = event.querySelector('p')?.textContent || '';
    const eventDate = event.querySelector('.event-date')?.textContent || 'Date à confirmer';
    const eventLieu = event.querySelector('.event-lieu')?.textContent || 'Lieu à confirmer';
    const eventDateObj = parseDate(eventDate);
    
    // Créer la bannière
    const nextEventSection = document.createElement('div');
    nextEventSection.className = 'next-event-banner';
    nextEventSection.innerHTML = `
        <div class="container">
            <div class="next-event-content">
                <h3><i class="fas fa-bell"></i> Prochain Événement</h3>
                <div class="next-event-details">
                    <h4>${escapeHtml(eventTitle)}</h4>
                    <p>${escapeHtml(eventDesc.substring(0, 100))}${eventDesc.length > 100 ? '...' : ''}</p>
                    <div class="next-event-date">
                        <i class="fas fa-calendar-alt"></i> ${eventDate}
                        ${eventLieu ? `<i class="fas fa-map-marker-alt" style="margin-left: 15px;"></i> ${eventLieu}` : ''}
                    </div>
                    <div class="countdown" id="countdown-timer"></div>
                </div>
            </div>
        </div>
    `;
    
    const calendrierSection = document.querySelector('.calendrier-section');
    if (calendrierSection) {
        calendrierSection.insertBefore(nextEventSection, calendrierSection.firstChild);
        
        // Démarrer le compte à rebours
        if (eventDateObj) {
            startCountdown(eventDateObj);
        }
    }
}

function displayNoUpcomingEvent() {
    const nextEventSection = document.createElement('div');
    nextEventSection.className = 'next-event-banner';
    nextEventSection.innerHTML = `
        <div class="container">
            <div class="next-event-content">
                <h3><i class="fas fa-calendar-check"></i> Tous les événements sont passés</h3>
                <div class="next-event-details">
                    <p>Merci d'avoir participé au Jubilé 2027-2028 !</p>
                    <p>Revenez bientôt pour découvrir nos prochaines activités.</p>
                </div>
            </div>
        </div>
    `;
    
    const calendrierSection = document.querySelector('.calendrier-section');
    if (calendrierSection) {
        calendrierSection.insertBefore(nextEventSection, calendrierSection.firstChild);
    }
}

function startCountdown(targetDate) {
    // Arrêter l'intervalle existant
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    function updateCountdown() {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();
        const countdownElement = document.getElementById('countdown-timer');
        
        if (!countdownElement) return;
        
        if (diff <= 0) {
            countdownElement.innerHTML = '<div class="countdown-finished">🎉 L\'événement a commencé ! 🎉</div>';
            if (countdownInterval) clearInterval(countdownInterval);
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        countdownElement.innerHTML = `
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
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// =============================================================
// 6. EXPORT PDF ET ICS
// =============================================================

function initExport() {
    const pdfBtn = document.getElementById('downloadPDFBtn');
    const icsBtn = document.getElementById('downloadICSBtn');
    
    if (pdfBtn) {
        pdfBtn.addEventListener('click', (e) => {
            e.preventDefault();
            generatePDF();
        });
    }
    
    if (icsBtn) {
        icsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            downloadICS();
        });
    }
}

function generatePDF() {
    // Afficher une notification
    showNotification('Génération du PDF en cours...', 'info', 2000);
    
    try {
        // Vérifier si jsPDF est disponible
        if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
            generatePDFWithJSPDF();
        } else {
            // Fallback : télécharger un fichier HTML
            downloadHTMLAlternative();
        }
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        downloadHTMLAlternative();
    }
}

function generatePDFWithJSPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    // Couleurs
    const marineBlue = [10, 31, 68];
    const rose = [232, 62, 140];
    const gold = [255, 215, 0];
    
    // Titre
    doc.setFontSize(24);
    doc.setTextColor(...marineBlue);
    doc.text('PROGRAMME DU JUBILÉ 2027-2028', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(...rose);
    doc.text('50 ans de l\'Association Sainte Rita & 25 ans de la Chorale La Foi', 105, 30, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 105, 38, { align: 'center' });
    
    // Récupérer les événements
    const events2027 = getEventsForPDF('2027');
    const events2028 = getEventsForPDF('2028');
    
    let yPosition = 50;
    
    // Section 2027
    doc.setFontSize(16);
    doc.setTextColor(...marineBlue);
    doc.text('📅 2027 - 25 ans de la Chorale La Foi', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    
    events2027.forEach(event => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...rose);
        doc.text(`${event.date}`, 20, yPosition);
        yPosition += 5;
        
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...marineBlue);
        doc.text(event.titre, 20, yPosition);
        yPosition += 5;
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(80, 80, 80);
        const splitDesc = doc.splitTextToSize(event.description, 170);
        doc.text(splitDesc, 20, yPosition);
        yPosition += splitDesc.length * 5;
        
        doc.setTextColor(100, 100, 100);
        doc.text(`📍 ${event.lieu}`, 20, yPosition);
        yPosition += 8;
    });
    
    // Section 2028
    if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
    } else {
        yPosition += 5;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(...marineBlue);
    doc.text('📅 2028 - 50 ans Sainte Rita', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    
    events2028.forEach(event => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...gold);
        doc.text(`${event.date}`, 20, yPosition);
        yPosition += 5;
        
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...marineBlue);
        doc.text(event.titre, 20, yPosition);
        yPosition += 5;
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(80, 80, 80);
        const splitDesc = doc.splitTextToSize(event.description, 170);
        doc.text(splitDesc, 20, yPosition);
        yPosition += splitDesc.length * 5;
        
        doc.setTextColor(100, 100, 100);
        doc.text(`📍 ${event.lieu}`, 20, yPosition);
        yPosition += 8;
    });
    
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i}/${pageCount} - Jubilé 2027-2028 - choralelafoi@gmail.com`, 105, 290, { align: 'center' });
    }
    
    // Télécharger
    doc.save('Programme-Jubile-2027-2028.pdf');
    showNotification('PDF généré avec succès !', 'success', 3000);
}

function getEventsForPDF(year) {
    const events = [];
    const yearSection = document.getElementById(`annee-${year}`);
    
    if (yearSection) {
        const moisCards = yearSection.querySelectorAll('.mois-card');
        
        moisCards.forEach(card => {
            const eventItems = card.querySelectorAll('.event-item');
            
            eventItems.forEach(item => {
                const eventDate = item.querySelector('.event-date')?.textContent || 'Date à confirmer';
                const eventTitle = item.querySelector('h5')?.textContent || 'Titre';
                const eventDesc = item.querySelector('p')?.textContent || 'Description';
                const eventLieu = item.querySelector('.event-lieu')?.textContent?.replace('📍', '').trim() || 'Lieu à confirmer';
                
                events.push({
                    date: eventDate,
                    titre: eventTitle,
                    description: eventDesc,
                    lieu: eventLieu
                });
            });
        });
    }
    
    return events;
}

function downloadHTMLAlternative() {
    const content = generateHTMLContent();
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Programme-Jubile-2027-2028.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showNotification('Document téléchargé (format HTML)', 'info', 3000);
}

function generateHTMLContent() {
    const events2027 = getEventsForPDF('2027');
    const events2028 = getEventsForPDF('2028');
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Programme Jubilé 2027-2028</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #0a1f44; text-align: center; border-bottom: 3px solid #e83e8c; padding-bottom: 10px; }
        h2 { color: #0a1f44; margin-top: 30px; border-left: 4px solid #ffd700; padding-left: 15px; }
        .event { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #e83e8c; }
        .date { font-weight: bold; color: #e83e8c; }
        .location { color: #6c757d; font-style: italic; margin-top: 5px; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #95a5a6; }
    </style>
</head>
<body>
    <h1>PROGRAMME DU JUBILÉ 2027-2028</h1>
    <p style="text-align: center;">50 ans de Sainte Rita & 25 ans de la Chorale La Foi</p>
    <p style="text-align: center;"><strong>Généré le :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
    
    <h2>📅 2027 - 25 ans de la Chorale La Foi</h2>
    ${events2027.map(event => `
        <div class="event">
            <div class="date">${event.date}</div>
            <strong>${event.titre}</strong>
            <p>${event.description}</p>
            <div class="location">📍 ${event.lieu}</div>
        </div>
    `).join('')}
    
    <h2>📅 2028 - 50 ans de l'Association Sainte Rita</h2>
    ${events2028.map(event => `
        <div class="event">
            <div class="date">${event.date}</div>
            <strong>${event.titre}</strong>
            <p>${event.description}</p>
            <div class="location">📍 ${event.lieu}</div>
        </div>
    `).join('')}
    
    <div class="footer">
        <p>Jubilé 2027-2028 - Paroisse Sainte Rita - Chorale La Foi</p>
        <p>Bè-Kpota, Lomé - Togo | choralelafoi@gmail.com | +228 79 28 82 09</p>
    </div>
</body>
</html>`;
}

function downloadICS() {
    try {
        const events = getAllEventsForICS();
        const icsContent = generateICSContent(events);
        
        const bom = "\uFEFF";
        const content = bom + icsContent;
        const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'jubile-2027-2028.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        showNotification('Calendrier téléchargé ! Importez-le dans votre agenda.', 'success', 3000);
    } catch (error) {
        console.error('Erreur lors de la génération du fichier ICS:', error);
        showNotification('Erreur lors de la génération du calendrier', 'error', 3000);
    }
}

function getAllEventsForICS() {
    const events = [];
    const eventItems = document.querySelectorAll('.event-item');
    
    eventItems.forEach(item => {
        const title = item.querySelector('h5')?.textContent;
        const dateText = item.querySelector('.event-date')?.textContent;
        const description = item.querySelector('p')?.textContent;
        const lieu = item.querySelector('.event-lieu')?.textContent?.replace('📍', '').trim();
        
        if (title && dateText) {
            const eventDate = parseDate(dateText);
            if (eventDate) {
                events.push({
                    title: title,
                    date: eventDate,
                    description: description || '',
                    location: lieu || 'Lomé, Togo'
                });
            }
        }
    });
    
    return events;
}

function generateICSContent(events) {
    const now = new Date();
    const formattedNow = formatDateForICS(now);
    
    let ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Jubilé 2027-2028//FR",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:Jubilé 2027-2028",
        "X-WR-CALDESC:Programme des célébrations du Jubilé",
        "X-WR-TIMEZONE:Africa/Lome"
    ].join("\n") + "\n";
    
    events.forEach((event, index) => {
        const startDate = formatDateForICS(event.date);
        const endDate = formatDateForICS(new Date(event.date.getTime() + 2 * 60 * 60 * 1000));
        
        const safeTitle = escapeICSString(event.title);
        const safeDesc = escapeICSString(event.description);
        const safeLocation = escapeICSString(event.location);
        
        const eventLines = [
            "BEGIN:VEVENT",
            `UID:${Date.now()}-${index}@jubile-sainterita.org`,
            `DTSTAMP:${formattedNow}`,
            `DTSTART:${startDate}`,
            `DTEND:${endDate}`,
            `SUMMARY:${safeTitle}`,
            `DESCRIPTION:${safeDesc}`,
            `LOCATION:${safeLocation}`,
            "STATUS:CONFIRMED",
            "SEQUENCE:0",
            "END:VEVENT"
        ];
        
        ics += eventLines.join("\n") + "\n";
    });
    
    ics += "END:VCALENDAR";
    return ics;
}

function formatDateForICS(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\..+/, '') + 'Z';
}

function escapeICSString(str) {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

// =============================================================
// 7. FONCTIONS UTILITAIRES
// =============================================================

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
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(timeout);
        closeNotification(notification);
    });
    
    function closeNotification(notif) {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showWelcomeMessage() {
    setTimeout(() => {
        showNotification('Bienvenue sur le programme du Jubilé 2027-2028 ! Préparez-vous pour les célébrations à venir.', 'info', 5000);
    }, 1000);
}

function updateFooterYear() {
    const footerBottom = document.querySelector('.footer-bottom p:first-child');
    if (footerBottom) {
        const currentYear = new Date().getFullYear();
        footerBottom.innerHTML = `&copy; ${currentYear}-2028 Jubilé Association Sainte Rita & Chorale La Foi. Tous droits réservés`;
    }
}

function initScrollToEvents() {
    // Vérifier s'il y a un hash dans l'URL
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 100;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }, 500);
        }
    }
}

function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .custom-notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: white;
            border-radius: 8px;
            padding: 15px 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            z-index: 10000;
            min-width: 280px;
            max-width: 400px;
        }
        
        .custom-notification.show {
            transform: translateX(0);
        }
        
        .custom-notification-success {
            border-left: 4px solid #ffd700;
        }
        
        .custom-notification-error {
            border-left: 4px solid #e83e8c;
        }
        
        .custom-notification-info {
            border-left: 4px solid #0a1f44;
        }
        
        .custom-notification-warning {
            border-left: 4px solid #ff9800;
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
            color: #ffd700;
        }
        
        .custom-notification-error .notification-content i {
            color: #e83e8c;
        }
        
        .custom-notification-info .notification-content i {
            color: #0a1f44;
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
        
        .countdown-finished {
            font-size: 1rem;
            font-weight: bold;
            padding: 10px;
        }
        
        .hidden {
            display: none !important;
        }
        
        @media (max-width: 768px) {
            .custom-notification {
                left: 20px;
                right: 20px;
                min-width: auto;
                max-width: none;
            }
        }
    `;
    document.head.appendChild(style);
}

// =============================================================
// 8. EXPORT DES FONCTIONS POUR USAGE EXTERNE
// =============================================================

window.jubileProgramme = {
    initFiltres,
    generatePDF,
    downloadICS,
    showNotification,
    getEventsForPDF
};