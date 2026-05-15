// ============================================
// CONTACT.JS - Page contact du Jubilé
// Version finale - Mai 2026
// OUVERTURE GMAIL WEB DIRECT
// ============================================

// Configuration
const CONTACT_CONFIG = {
    GMAIL_ADDRESS: "choralelafoi@gmail.com",
    PHONE_NUMBER: "79 28 82 09"
};

// Notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<div class="notification-content">${type === 'success' ? '✅' : '❌'} ${message}</div>`;
    document.body.appendChild(notification);
    setTimeout(function() { notification.remove(); }, 5000);
}

// Copier email
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showNotification('Email copié !', 'success');
}

// Ouvrir maps
function openMaps() {
    window.open('https://www.google.com/maps/search/?api=1&query=Paroisse+Sainte+Rita+Bè-Kpota+Lomé+Togo', '_blank');
}

// ============================================
// FONCTION PRINCIPALE - OUVERTURE GMAIL WEB
// ============================================

function sendEmailToGmail(subject, body) {
    const email = CONTACT_CONFIG.GMAIL_ADDRESS;
    // Construction de l'URL Gmail Web
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // Ouvre dans un nouvel onglet
    window.open(gmailUrl, '_blank');
}

// Fermer modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// INSCRIPTIONS TOURNOIS
// ============================================

function openInscriptionForm(eventType) {
    const modal = document.getElementById('inscriptionModal');
    const content = document.getElementById('modalContent');
    let title, price, date;
    
    if (eventType === 'coupe-foi') {
        title = 'Coupe de la Foi 2027';
        price = '1 000';
        date = '20-21 Mai 2027';
    } else {
        title = 'Jubilé Cup 2028';
        price = '2 500';
        date = '16-17 Juin 2028';
    }
    
    content.innerHTML = `
        <h3>Inscription ${title}</h3>
        <p>Dates: ${date} | Frais: ${price} FCFA</p>
        <form id="modalForm">
            <input type="text" id="teamName" placeholder="Nom équipe *" required>
            <input type="text" id="teamCaptain" placeholder="Capitaine *" required>
            <input type="tel" id="teamPhone" placeholder="Téléphone *" required>
            <input type="email" id="teamEmail" placeholder="Email *" required>
            <textarea id="teamMembers" rows="3" placeholder="Liste des joueurs *" required></textarea>
            <div class="payment-info">💰 Paiement: ${price} FCFA sur ${CONTACT_CONFIG.PHONE_NUMBER}</div>
            <button type="submit" class="btn btn-primary">Envoyer l'inscription</button>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    document.getElementById('modalForm').onsubmit = function(e) {
        e.preventDefault();
        
        const teamName = document.getElementById('teamName').value;
        const teamCaptain = document.getElementById('teamCaptain').value;
        const teamPhone = document.getElementById('teamPhone').value;
        const teamEmail = document.getElementById('teamEmail').value;
        const teamMembers = document.getElementById('teamMembers').value;
        
        const sujet = `INSCRIPTION ${title} - ${teamName}`;
        const corps = `INSCRIPTION ${title}\n\nDate d'envoi: ${new Date().toLocaleString('fr-FR')}\n\nÉQUIPE\nNom: ${teamName}\nCapitaine: ${teamCaptain}\nTéléphone: ${teamPhone}\nEmail: ${teamEmail}\n\nJOUEURS\n${teamMembers}\n\nFRAIS D'INSCRIPTION\nMontant: ${price} FCFA\nÀ payer sur: ${CONTACT_CONFIG.PHONE_NUMBER}`;
        
        sendEmailToGmail(sujet, corps);
        showNotification('✅ Gmail s\'ouvre. Vérifiez et envoyez.', 'success');
        
        setTimeout(function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 2000);
    };
}

// ============================================
// THE VOÏX CANDIDATURES
// ============================================

function openTheVoixForm(edition) {
    const modal = document.getElementById('theVoixModal');
    const content = document.getElementById('theVoixModalContent');
    const is2027 = (edition === '2027');
    
    content.innerHTML = `
        <h3>Candidature The Voïx ${edition}</h3>
        <p>${is2027 ? 'Concours gratuit' : 'Frais: 5 000 FCFA'}</p>
        <form id="theVoixFormModal">
            <input type="text" id="nom" placeholder="Nom *" required>
            <input type="text" id="prenom" placeholder="Prénom *" required>
            <input type="email" id="email" placeholder="Email *" required>
            <input type="tel" id="phone" placeholder="Téléphone *" required>
            <select id="categorie" required>
                <option value="">Catégorie *</option>
                <option value="soliste">Soliste</option>
                <option value="duo">Duo</option>
                <option value="groupe">Groupe</option>
            </select>
            <input type="text" id="chant" placeholder="Chant à interpréter *" required>
            <textarea id="bio" rows="3" placeholder="Biographie *" required></textarea>
            <input type="password" id="password" placeholder="Mot de passe *" required>
            <input type="password" id="confirmPassword" placeholder="Confirmer mot de passe *" required>
            ${!is2027 ? '<div class="payment-info">💰 Paiement: 5 000 FCFA sur ' + CONTACT_CONFIG.PHONE_NUMBER + '</div>' : ''}
            <button type="submit" class="btn btn-primary">Envoyer candidature</button>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    document.getElementById('theVoixFormModal').onsubmit = function(e) {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirmPassword').value;
        
        if (password !== confirm) {
            showNotification('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('Le mot de passe doit contenir au moins 6 caractères', 'error');
            return;
        }
        
        const nom = document.getElementById('nom').value;
        const prenom = document.getElementById('prenom').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const categorie = document.getElementById('categorie').value;
        const chant = document.getElementById('chant').value;
        const bio = document.getElementById('bio').value;
        
        const sujet = `CANDIDATURE THE VOÏX ${edition} - ${prenom} ${nom}`;
        const corps = `CANDIDATURE THE VOÏX ${edition}\n\nDate d'envoi: ${new Date().toLocaleString('fr-FR')}\n\nINFORMATIONS PERSONNELLES\nNom: ${nom}\nPrénom: ${prenom}\nEmail: ${email}\nTéléphone: ${phone}\n\nINFORMATIONS ARTISTIQUES\nCatégorie: ${categorie}\nChant: ${chant}\n\nBiographie:\n${bio}\n\nFRAIS D'INSCRIPTION\n${is2027 ? 'Édition GRATUITE 2027' : 'Montant: 5 000 FCFA\nPaiement: ' + CONTACT_CONFIG.PHONE_NUMBER}`;
        
        sendEmailToGmail(sujet, corps);
        
        // Sauvegarder utilisateur
        const users = JSON.parse(localStorage.getItem('theVoixUsers_v2') || '[]');
        const existingUser = users.find(function(u) { return u.email === email; });
        
        if (!existingUser) {
            users.push({
                id: Date.now().toString(),
                nom: nom,
                prenom: prenom,
                email: email,
                phone: phone,
                password: btoa(password),
                type: "CANDIDAT",
                role: "candidat",
                edition: edition,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('theVoixUsers_v2', JSON.stringify(users));
            localStorage.setItem('theVoixCurrentUser', JSON.stringify(users[users.length - 1]));
        }
        
        showNotification('✅ Gmail s\'ouvre. Vérifiez et envoyez.', 'success');
        
        setTimeout(function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 2000);
    };
}

// ============================================
// STANDS MIABE FOIRE
// ============================================

function openStandForm(edition) {
    const is2027 = (edition === 'miabe-2027');
    const modal = document.getElementById('inscriptionModal');
    const content = document.getElementById('modalContent');
    const price = is2027 ? '1 500' : '3 000';
    const year = is2027 ? '2027' : '2028';
    const date = is2027 ? '15-17 Septembre 2027' : '14-16 Septembre 2028';
    
    content.innerHTML = `
        <h3>Stand Miabe Foire ${year}</h3>
        <p>Dates: ${date} | Prix: ${price} FCFA</p>
        <form id="modalForm">
            <input type="text" id="company" placeholder="Entreprise/Artisan *" required>
            <select id="activity" required>
                <option value="">Type activité *</option>
                <option value="artisanat">Artisanat</option>
                <option value="alimentation">Alimentation</option>
                <option value="textile">Textile</option>
            </select>
            <input type="text" id="contactPerson" placeholder="Personne contact *" required>
            <input type="tel" id="contactPhone" placeholder="Téléphone *" required>
            <input type="email" id="contactEmail" placeholder="Email *" required>
            <div class="payment-info">💰 Paiement: ${price} FCFA sur ${CONTACT_CONFIG.PHONE_NUMBER}</div>
            <button type="submit" class="btn btn-primary">Réserver mon stand</button>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    document.getElementById('modalForm').onsubmit = function(e) {
        e.preventDefault();
        
        const company = document.getElementById('company').value;
        const activity = document.getElementById('activity').value;
        const contactPerson = document.getElementById('contactPerson').value;
        const contactPhone = document.getElementById('contactPhone').value;
        const contactEmail = document.getElementById('contactEmail').value;
        
        const sujet = `RÉSERVATION STAND MIABE FOIRE ${year} - ${company}`;
        const corps = `RÉSERVATION STAND MIABE FOIRE ${year}\n\nDate d'envoi: ${new Date().toLocaleString('fr-FR')}\n\nENTREPRISE\nNom: ${company}\nActivité: ${activity}\n\nCONTACT\nPersonne: ${contactPerson}\nTéléphone: ${contactPhone}\nEmail: ${contactEmail}\n\nPAIEMENT\nMontant: ${price} FCFA\nÀ payer sur: ${CONTACT_CONFIG.PHONE_NUMBER}`;
        
        sendEmailToGmail(sujet, corps);
        showNotification('✅ Gmail s\'ouvre. Vérifiez et envoyez.', 'success');
        
        setTimeout(function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 2000);
    };
}

// ============================================
// AUTRES FORMULAIRES
// ============================================

function openReservationForm() {
    const modal = document.getElementById('inscriptionModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <h3>Préréservation Concert Jubilé</h3>
        <p>Réservations ouvertes en Janvier 2028</p>
        <form id="modalForm">
            <input type="text" id="name" placeholder="Nom complet *" required>
            <input type="email" id="email" placeholder="Email *" required>
            <input type="tel" id="phone" placeholder="Téléphone *" required>
            <button type="submit" class="btn btn-primary">Être notifié</button>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    document.getElementById('modalForm').onsubmit = function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        
        const sujet = `PRÉRÉSERVATION CONCERT JUBILÉ - ${name}`;
        const corps = `PRÉRÉSERVATION CONCERT JUBILÉ\n\nDate: ${new Date().toLocaleString('fr-FR')}\n\nNom: ${name}\nEmail: ${email}\nTéléphone: ${phone}\n\nVous serez notifié en Janvier 2028.`;
        
        sendEmailToGmail(sujet, corps);
        showNotification('✅ Gmail s\'ouvre. Vérifiez et envoyez.', 'success');
        
        setTimeout(function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 2000);
    };
}

function openDonForm() {
    const modal = document.getElementById('inscriptionModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <h3>Faire un don</h3>
        <form id="modalForm">
            <input type="text" id="name" placeholder="Nom complet *" required>
            <input type="email" id="email" placeholder="Email *" required>
            <input type="tel" id="phone" placeholder="Téléphone *" required>
            <select id="amount" required>
                <option value="">Montant *</option>
                <option value="5000">5 000 FCFA</option>
                <option value="10000">10 000 FCFA</option>
                <option value="25000">25 000 FCFA</option>
                <option value="50000">50 000 FCFA</option>
            </select>
            <textarea id="message" rows="3" placeholder="Message"></textarea>
            <div class="payment-info">💰 Paiement: ${CONTACT_CONFIG.PHONE_NUMBER}</div>
            <button type="submit" class="btn btn-primary">Envoyer</button>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    document.getElementById('modalForm').onsubmit = function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const amount = document.getElementById('amount').value;
        const message = document.getElementById('message').value;
        
        const sujet = `PROMESSE DE DON - ${name}`;
        const corps = `PROMESSE DE DON\n\nNom: ${name}\nEmail: ${email}\nTéléphone: ${phone}\nMontant: ${amount} FCFA\nMessage: ${message || 'Aucun'}\n\nPaiement: ${CONTACT_CONFIG.PHONE_NUMBER}`;
        
        sendEmailToGmail(sujet, corps);
        showNotification('✅ Gmail s\'ouvre. Vérifiez et envoyez.', 'success');
        
        setTimeout(function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 2000);
    };
}

function openMaterielForm() {
    const modal = document.getElementById('inscriptionModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <h3>Don matériel</h3>
        <form id="modalForm">
            <input type="text" id="name" placeholder="Nom complet *" required>
            <input type="email" id="email" placeholder="Email *" required>
            <input type="tel" id="phone" placeholder="Téléphone *" required>
            <select id="type" required>
                <option value="">Type matériel *</option>
                <option value="audio">Matériel audio</option>
                <option value="sport">Sport</option>
                <option value="deco">Décoration</option>
                <option value="autre">Autre</option>
            </select>
            <textarea id="description" rows="3" placeholder="Description *" required></textarea>
            <button type="submit" class="btn btn-primary">Proposer</button>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    document.getElementById('modalForm').onsubmit = function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const type = document.getElementById('type').value;
        const description = document.getElementById('description').value;
        
        const sujet = `DON MATÉRIEL - ${name}`;
        const corps = `DON MATÉRIEL\n\nNom: ${name}\nEmail: ${email}\nTéléphone: ${phone}\nType: ${type}\nDescription: ${description}`;
        
        sendEmailToGmail(sujet, corps);
        showNotification('✅ Gmail s\'ouvre. Vérifiez et envoyez.', 'success');
        
        setTimeout(function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 2000);
    };
}

function openPartnershipForm() {
    const modal = document.getElementById('inscriptionModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <h3>Devenir partenaire</h3>
        <form id="modalForm">
            <input type="text" id="company" placeholder="Entreprise *" required>
            <input type="text" id="contact" placeholder="Contact *" required>
            <input type="email" id="email" placeholder="Email *" required>
            <input type="tel" id="phone" placeholder="Téléphone *" required>
            <select id="type" required>
                <option value="">Type partenariat *</option>
                <option value="financier">Financier</option>
                <option value="materiel">Matériel</option>
                <option value="service">Service</option>
            </select>
            <textarea id="message" rows="3" placeholder="Message *" required></textarea>
            <button type="submit" class="btn btn-primary">Envoyer</button>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    document.getElementById('modalForm').onsubmit = function(e) {
        e.preventDefault();
        
        const company = document.getElementById('company').value;
        const contact = document.getElementById('contact').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const type = document.getElementById('type').value;
        const message = document.getElementById('message').value;
        
        const sujet = `PARTENARIAT - ${company}`;
        const corps = `PARTENARIAT\n\nEntreprise: ${company}\nContact: ${contact}\nEmail: ${email}\nTéléphone: ${phone}\nType: ${type}\nMessage: ${message}`;
        
        sendEmailToGmail(sujet, corps);
        showNotification('✅ Gmail s\'ouvre. Vérifiez et envoyez.', 'success');
        
        setTimeout(function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 2000);
    };
}

function openMissForm() {
    const modal = document.getElementById('missModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
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
    const sujet = "CANDIDATURE MISS BÈ-KPOTA 2028";
    const corps = `CANDIDATURE MISS BÈ-KPOTA 2028\n\nDOSSIER À FOURNIR:\n- Formulaire rempli\n- CV + photo\n- Lettre de motivation\n\nEnvoyer à: ${CONTACT_CONFIG.GMAIL_ADDRESS}\nDate limite: 15 Février 2028`;
    
    sendEmailToGmail(sujet, corps);
    showNotification('✅ Gmail s\'ouvre. Vérifiez et envoyez.', 'success');
}

// ============================================
// FORMULAIRES PRINCIPAUX
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("Page contact initialisée");
    
    // Formulaire de contact
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.onsubmit = function(e) {
            e.preventDefault();
            
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const phone = document.getElementById('contactPhone').value;
            const subject = document.getElementById('contactSubject').value;
            const message = document.getElementById('contactMessage').value;
            
            const sujet = `CONTACT - ${name} - ${subject}`;
            const corps = `CONTACT\n\nNom: ${name}\nEmail: ${email}\nTéléphone: ${phone || 'Non fourni'}\nSujet: ${subject}\n\nMessage:\n${message}`;
            
            sendEmailToGmail(sujet, corps);
            showNotification('✅ Gmail s\'ouvre. Vérifiez et envoyez.', 'success');
            contactForm.reset();
        };
    }
    
    // Formulaire bénévolat
    const benevoleForm = document.getElementById('benevoleForm');
    if (benevoleForm) {
        benevoleForm.onsubmit = function(e) {
            e.preventDefault();
            
            const dispos = [];
            if (document.getElementById('benevoleDispo1') && document.getElementById('benevoleDispo1').checked) dispos.push('Coupe Foi 2027');
            if (document.getElementById('benevoleDispo2') && document.getElementById('benevoleDispo2').checked) dispos.push('The Voïx 2027');
            if (document.getElementById('benevoleDispo3') && document.getElementById('benevoleDispo3').checked) dispos.push('Miabe Foire 2027');
            if (document.getElementById('benevoleDispo4') && document.getElementById('benevoleDispo4').checked) dispos.push('Jubilé Cup 2028');
            if (document.getElementById('benevoleDispo5') && document.getElementById('benevoleDispo5').checked) dispos.push('Concert 2028');
            
            const name = document.getElementById('benevoleName').value;
            const email = document.getElementById('benevoleEmail').value;
            const phone = document.getElementById('benevolePhone').value;
            const area = document.getElementById('benevoleArea').value;
            const motivation = document.getElementById('benevoleMotivation').value;
            
            const sujet = `BÉNÉVOLAT - ${name}`;
            const corps = `BÉNÉVOLAT\n\nNom: ${name}\nEmail: ${email}\nTéléphone: ${phone}\nDomaine: ${area}\nDisponibilités: ${dispos.join(', ')}\n\nMotivation:\n${motivation}`;
            
            sendEmailToGmail(sujet, corps);
            showNotification('✅ Gmail s\'ouvre. Vérifiez et envoyez.', 'success');
            benevoleForm.reset();
        };
    }
    
    // Fermeture des modals
    const closeButtons = document.querySelectorAll('.modal .modal-close');
    for (var i = 0; i < closeButtons.length; i++) {
        closeButtons[i].onclick = function() {
            var modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };
    }
    
    // Fermeture en cliquant à l'extérieur
    const modals = document.querySelectorAll('.modal');
    for (var i = 0; i < modals.length; i++) {
        modals[i].onclick = function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };
    }
});