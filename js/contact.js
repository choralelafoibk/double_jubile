// ============================================
// CONTACT.JS - Page contact du Jubilé
// Mise à jour : Mars 2026
// ============================================

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    
    notification.querySelector('.notification-close').onclick = () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    };
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Email copié dans le presse-papier !', 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('Email copié dans le presse-papier !', 'success');
    });
}

function openMaps() {
    window.open('https://www.google.com/maps/search/?api=1&query=Paroisse+Sainte+Rita+Bè-Kpota+Lomé+Togo', '_blank');
}

// ============================================
// ENVOI EMAIL GMAIL
// ============================================

function sendEmailToGmail(subject, body) {
    const email = "choralelafoi@gmail.com";
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    return true;
}

function validateForm(form) {
    let isValid = true;
    const required = form.querySelectorAll('[required]');
    
    required.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#dc3545';
            isValid = false;
            field.addEventListener('input', () => { if (field.value.trim()) field.style.borderColor = ''; }, { once: true });
        }
    });
    
    const emails = form.querySelectorAll('input[type="email"]');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    emails.forEach(field => {
        const email = field.value.trim();
        if (email && !emailRegex.test(email)) {
            field.style.borderColor = '#dc3545';
            isValid = false;
            field.addEventListener('input', () => { if (emailRegex.test(field.value.trim())) field.style.borderColor = ''; }, { once: true });
        }
    });
    
    return isValid;
}

// ============================================
// FORMULAIRES MODAUX
// ============================================

function openInscriptionForm(eventType) {
    const modal = document.getElementById('inscriptionModal');
    const modalContent = document.getElementById('modalContent');
    let title = '', description = '', price = '', date = '';
    
    if (eventType === 'coupe-foi') {
        title = 'Coupe de la Foi 2027';
        price = '1 000 Fcfa';
        date = '20-21 Mai 2027';
        description = 'Tournoi de football - Inscription par équipe';
    } else {
        title = 'Jubilé Cup 2028';
        price = '2 500 Fcfa';
        date = '16-17 Juin 2028';
        description = 'Tournoi de football - Catégories Hommes, Femmes, Vétérans';
    }
    
    modalContent.innerHTML = `
        <h3><i class="fas fa-futbol"></i> Inscription ${title}</h3>
        <p><strong>Dates :</strong> ${date}</p>
        <p><strong>Frais :</strong> ${price} par équipe</p>
        
        <form id="inscriptionForm">
            <div class="form-group"><label>Nom de l'équipe *</label><input type="text" id="teamName" required></div>
            <div class="form-row"><div class="form-group"><label>Capitaine *</label><input type="text" id="teamCaptain" required></div>
            <div class="form-group"><label>Téléphone *</label><input type="tel" id="teamPhone" required></div></div>
            <div class="form-group"><label>Email *</label><input type="email" id="teamEmail" required></div>
            <div class="form-group"><label>Liste des joueurs *</label><textarea id="teamMembers" rows="4" required placeholder="Noms et prénoms des joueurs"></textarea></div>
            <div class="payment-info"><h5><i class="fas fa-money-bill-wave"></i> Paiement</h5><p>Montant : ${price}<br>Mobile Money : +228 79 28 82 09</p></div>
            <div class="checkbox-group"><input type="checkbox" id="acceptRules" required><label>J'accepte le règlement du tournoi</label></div>
            <div class="modal-buttons"><button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Envoyer l'inscription</button></div>
            <div class="submission-info"><p><i class="fas fa-info-circle"></i> Votre inscription sera envoyée à choralelafoi@gmail.com</p></div>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const form = modalContent.querySelector('form');
    if (form) form.onsubmit = (e) => { e.preventDefault(); handleInscriptionSubmit(form, eventType, title); };
}

function handleInscriptionSubmit(form, eventType, title) {
    if (!validateForm(form)) { showNotification('Veuillez remplir tous les champs.', 'error'); return; }
    
    const data = { teamName: document.getElementById('teamName')?.value, teamCaptain: document.getElementById('teamCaptain')?.value, teamPhone: document.getElementById('teamPhone')?.value, teamEmail: document.getElementById('teamEmail')?.value, teamMembers: document.getElementById('teamMembers')?.value };
    const date = new Date().toLocaleString('fr-FR');
    const sujet = `${eventType === 'coupe-foi' ? '⚽' : '🏆'} INSCRIPTION ${title} - ${data.teamName}`;
    const corps = `INSCRIPTION ${title}\n\n📅 Date : ${date}\n\n👥 ÉQUIPE\n• Nom : ${data.teamName}\n• Capitaine : ${data.teamCaptain}\n• Téléphone : ${data.teamPhone}\n• Email : ${data.teamEmail}\n\n👥 JOUEURS\n${data.teamMembers}\n\n💰 Frais : ${eventType === 'coupe-foi' ? '1 000' : '2 500'} FCFA à payer sur 79 28 82 09`;
    
    sendEmailToGmail(sujet, corps);
    showNotification('✅ Inscription prête ! Vérifiez l\'email et cliquez sur Envoyer.', 'success', 8000);
    form.reset();
    setTimeout(() => closeModal('inscriptionModal'), 2000);
}

function openTheVoixForm(edition) {
    const modal = document.getElementById('theVoixModal');
    const modalContent = document.getElementById('theVoixModalContent');
    const is2027 = edition === '2027';
    
    modalContent.innerHTML = `
        <h3><i class="fas fa-microphone-alt"></i> Candidature The Voïx ${is2027 ? '2027' : '2028'}</h3>
        <div class="payment-info"><h5>Édition ${is2027 ? 'Gratuite' : 'Spéciale'}</h5><p>${is2027 ? 'Concours gratuit' : 'Frais : 5 000 FCFA | Votes : 200 FCFA'}</p></div>
        <form id="theVoixForm">
            <div class="form-row"><div class="form-group"><label>Nom *</label><input type="text" id="nom" required></div><div class="form-group"><label>Prénom *</label><input type="text" id="prenom" required></div></div>
            <div class="form-row"><div class="form-group"><label>Email *</label><input type="email" id="email" required></div><div class="form-group"><label>Téléphone *</label><input type="tel" id="phone" required></div></div>
            <div class="form-row"><div class="form-group"><label>Catégorie *</label><select id="categorie" required><option value="">Sélectionnez</option><option value="soliste">Soliste</option><option value="duo">Duo</option><option value="groupe">Groupe</option></select></div>
            <div class="form-group"><label>Chant *</label><input type="text" id="chant" required placeholder="Ave Maria..."></div></div>
            <div class="form-group"><label>Biographie *</label><textarea id="bio" rows="3" required></textarea></div>
            ${!is2027 ? `<div class="payment-info"><h5><i class="fas fa-money-bill-wave"></i> Paiement 2028</h5><p>5 000 FCFA sur 98 02 55 05 / 91 60 09 45<br>Envoyer capture au 79 28 82 09</p></div>` : ''}
            <div class="checkbox-group"><input type="checkbox" id="accept" required><label>J'accepte le règlement</label></div>
            <div class="modal-buttons"><button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Envoyer candidature</button></div>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const form = modalContent.querySelector('form');
    if (form) form.onsubmit = (e) => { e.preventDefault(); handleTheVoixSubmit(form, edition); };
}

function handleTheVoixSubmit(form, edition) {
    if (!validateForm(form)) { showNotification('Veuillez remplir tous les champs.', 'error'); return; }
    
    const data = { nom: document.getElementById('nom')?.value, prenom: document.getElementById('prenom')?.value, email: document.getElementById('email')?.value, phone: document.getElementById('phone')?.value, categorie: document.getElementById('categorie')?.value, chant: document.getElementById('chant')?.value, bio: document.getElementById('bio')?.value };
    const date = new Date().toLocaleString('fr-FR');
    const sujet = `🎤 CANDIDATURE THE VOÏX ${edition} - ${data.prenom} ${data.nom}`;
    const corps = `CANDIDATURE THE VOÏX ${edition}\n\n📅 ${date}\n\n👤 CANDIDAT\n• ${data.nom} ${data.prenom}\n• ${data.email}\n• ${data.phone}\n\n🎵 MUSIQUE\n• Catégorie : ${data.categorie}\n• Chant : ${data.chant}\n• Biographie : ${data.bio}\n\n💰 ${edition === '2028' ? 'Frais : 5 000 FCFA à payer' : 'Édition gratuite'}`;
    
    sendEmailToGmail(sujet, corps);
    showNotification('✅ Candidature prête ! Vérifiez l\'email et envoyez.', 'success', 8000);
    form.reset();
    setTimeout(() => closeModal('theVoixModal'), 2000);
}

function openStandForm(edition) {
    const is2027 = edition === 'miabe-2027';
    const modal = document.getElementById('inscriptionModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h3><i class="fas fa-store"></i> Réservation Stand Miabe Foire ${is2027 ? '2027' : '2028'}</h3>
        <p><strong>Dates :</strong> ${is2027 ? '15-17 Septembre 2027' : '14-16 Septembre 2028'}</p>
        <p><strong>Prix :</strong> ${is2027 ? '1 500' : '3 000'} Fcfa</p>
        <form id="standForm">
            <div class="form-group"><label>Entreprise / Artisan *</label><input type="text" id="company" required></div>
            <div class="form-group"><label>Type d'activité *</label><select id="activity" required><option value="">Choisir</option><option value="artisanat">Artisanat</option><option value="alimentation">Alimentation</option><option value="textile">Textile</option></select></div>
            <div class="form-row"><div class="form-group"><label>Contact *</label><input type="text" id="contactPerson" required></div><div class="form-group"><label>Téléphone *</label><input type="tel" id="contactPhone" required></div></div>
            <div class="form-group"><label>Email *</label><input type="email" id="contactEmail" required></div>
            <div class="payment-info"><h5><i class="fas fa-money-bill-wave"></i> Paiement</h5><p>${is2027 ? '1 500' : '3 000'} FCFA sur 79 28 82 09</p></div>
            <div class="checkbox-group"><input type="checkbox" id="accept" required><label>J'accepte les conditions</label></div>
            <div class="modal-buttons"><button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Réserver mon stand</button></div>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const form = modalContent.querySelector('form');
    if (form) form.onsubmit = (e) => { e.preventDefault(); handleStandSubmit(form, edition); };
}

function handleStandSubmit(form, edition) {
    if (!validateForm(form)) { showNotification('Veuillez remplir tous les champs.', 'error'); return; }
    
    const data = { company: document.getElementById('company')?.value, activity: document.getElementById('activity')?.value, contactPerson: document.getElementById('contactPerson')?.value, contactPhone: document.getElementById('contactPhone')?.value, contactEmail: document.getElementById('contactEmail')?.value };
    const is2027 = edition === 'miabe-2027';
    const sujet = `🏪 RÉSERVATION STAND MIABE FOIRE ${is2027 ? '2027' : '2028'} - ${data.company}`;
    const corps = `RÉSERVATION STAND MIABE FOIRE ${is2027 ? '2027' : '2028'}\n\n🏢 ENTREPRISE\n• ${data.company}\n• Activité : ${data.activity}\n\n👤 CONTACT\n• ${data.contactPerson}\n• ${data.contactPhone}\n• ${data.contactEmail}\n\n💰 Frais : ${is2027 ? '1 500' : '3 000'} FCFA à payer sur 79 28 82 09`;
    
    sendEmailToGmail(sujet, corps);
    showNotification('✅ Réservation prête ! Vérifiez l\'email.', 'success', 8000);
    form.reset();
    setTimeout(() => closeModal('inscriptionModal'), 2000);
}

function openReservationForm() {
    const modal = document.getElementById('inscriptionModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h3><i class="fas fa-music"></i> Préréservation Concert Jubilé</h3>
        <p>Réservations ouvertes en Janvier 2028. Inscrivez-vous pour être notifié :</p>
        <form id="reservationForm">
            <div class="form-row"><div class="form-group"><label>Nom *</label><input type="text" id="name" required></div><div class="form-group"><label>Email *</label><input type="email" id="email" required></div></div>
            <div class="form-group"><label>Téléphone *</label><input type="tel" id="phone" required></div>
            <div class="checkbox-group"><input type="checkbox" id="newsletter" checked><label>Recevoir les actualités</label></div>
            <div class="modal-buttons"><button type="submit" class="btn btn-primary"><i class="fas fa-bell"></i> Être notifié</button></div>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const form = modalContent.querySelector('form');
    if (form) form.onsubmit = (e) => { e.preventDefault(); handleReservationSubmit(form); };
}

function handleReservationSubmit(form) {
    if (!validateForm(form)) { showNotification('Veuillez remplir tous les champs.', 'error'); return; }
    
    const data = { name: document.getElementById('name')?.value, email: document.getElementById('email')?.value, phone: document.getElementById('phone')?.value };
    const sujet = `🎵 PRÉRÉSERVATION CONCERT JUBILÉ - ${data.name}`;
    const corps = `PRÉRÉSERVATION CONCERT JUBILÉ\n\n👤 ${data.name}\n📧 ${data.email}\n📱 ${data.phone}\n\nVous serez notifié en Janvier 2028 pour l'ouverture des réservations.`;
    
    sendEmailToGmail(sujet, corps);
    showNotification('✅ Demande envoyée ! Vous serez notifié en Janvier 2028.', 'success');
    form.reset();
    setTimeout(() => closeModal('inscriptionModal'), 2000);
}

function openDonForm() {
    const modal = document.getElementById('inscriptionModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h3><i class="fas fa-hand-holding-usd"></i> Faire un don</h3>
        <p>Soutenez les célébrations du Jubilé 2027-2028</p>
        <form id="donForm">
            <div class="form-row"><div class="form-group"><label>Nom *</label><input type="text" id="name" required></div><div class="form-group"><label>Email *</label><input type="email" id="email" required></div></div>
            <div class="form-group"><label>Téléphone *</label><input type="tel" id="phone" required></div>
            <div class="form-group"><label>Montant *</label><select id="amount" required><option value="">Choisir</option><option value="5000">5 000 FCFA</option><option value="10000">10 000 FCFA</option><option value="25000">25 000 FCFA</option><option value="50000">50 000 FCFA</option><option value="autre">Autre montant</option></select></div>
            <div class="form-group"><label>Message (optionnel)</label><textarea id="message" rows="3"></textarea></div>
            <div class="payment-info"><h5><i class="fas fa-money-bill-wave"></i> Informations de paiement</h5><p>Mobile Money : +228 79 28 82 09<br>Wave : +228 79 28 82 09</p></div>
            <div class="modal-buttons"><button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Envoyer ma promesse de don</button></div>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const form = modalContent.querySelector('form');
    if (form) form.onsubmit = (e) => { e.preventDefault(); handleDonSubmit(form); };
}

function handleDonSubmit(form) {
    if (!validateForm(form)) { showNotification('Veuillez remplir tous les champs.', 'error'); return; }
    
    const data = { name: document.getElementById('name')?.value, email: document.getElementById('email')?.value, phone: document.getElementById('phone')?.value, amount: document.getElementById('amount')?.value, message: document.getElementById('message')?.value };
    const sujet = `❤️ PROMESSE DE DON JUBILÉ - ${data.name}`;
    const corps = `PROMESSE DE DON JUBILÉ\n\n👤 ${data.name}\n📧 ${data.email}\n📱 ${data.phone}\n💰 Montant : ${data.amount} FCFA\n\n💬 Message : ${data.message || 'Aucun'}\n\nPaiement : Mobile Money 79 28 82 09`;
    
    sendEmailToGmail(sujet, corps);
    showNotification('✅ Merci pour votre soutien ! Votre promesse de don a été enregistrée.', 'success');
    form.reset();
    setTimeout(() => closeModal('inscriptionModal'), 2000);
}

function openMaterielForm() {
    const modal = document.getElementById('inscriptionModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h3><i class="fas fa-gift"></i> Proposer un don matériel</h3>
        <form id="materielForm">
            <div class="form-row"><div class="form-group"><label>Nom *</label><input type="text" id="name" required></div><div class="form-group"><label>Email *</label><input type="email" id="email" required></div></div>
            <div class="form-group"><label>Téléphone *</label><input type="tel" id="phone" required></div>
            <div class="form-group"><label>Type de matériel *</label><select id="type" required><option value="">Choisir</option><option value="audio">Matériel audio</option><option value="sport">Équipement sportif</option><option value="deco">Décoration</option><option value="autre">Autre</option></select></div>
            <div class="form-group"><label>Description du matériel *</label><textarea id="description" rows="4" required></textarea></div>
            <div class="modal-buttons"><button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Proposer mon don</button></div>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const form = modalContent.querySelector('form');
    if (form) form.onsubmit = (e) => { e.preventDefault(); handleMaterielSubmit(form); };
}

function handleMaterielSubmit(form) {
    if (!validateForm(form)) { showNotification('Veuillez remplir tous les champs.', 'error'); return; }
    
    const data = { name: document.getElementById('name')?.value, email: document.getElementById('email')?.value, phone: document.getElementById('phone')?.value, type: document.getElementById('type')?.value, description: document.getElementById('description')?.value };
    const sujet = `🎁 DON MATÉRIEL JUBILÉ - ${data.name}`;
    const corps = `DON MATÉRIEL JUBILÉ\n\n👤 ${data.name}\n📧 ${data.email}\n📱 ${data.phone}\n📦 Type : ${data.type}\n📝 Description : ${data.description}`;
    
    sendEmailToGmail(sujet, corps);
    showNotification('✅ Merci pour votre générosité ! Nous vous contacterons rapidement.', 'success');
    form.reset();
    setTimeout(() => closeModal('inscriptionModal'), 2000);
}

function openPartnershipForm() {
    const modal = document.getElementById('inscriptionModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h3><i class="fas fa-briefcase"></i> Devenir partenaire</h3>
        <form id="partnershipForm">
            <div class="form-row"><div class="form-group"><label>Entreprise *</label><input type="text" id="company" required></div><div class="form-group"><label>Nom contact *</label><input type="text" id="contact" required></div></div>
            <div class="form-row"><div class="form-group"><label>Email *</label><input type="email" id="email" required></div><div class="form-group"><label>Téléphone *</label><input type="tel" id="phone" required></div></div>
            <div class="form-group"><label>Type de partenariat *</label><select id="type" required><option value="">Choisir</option><option value="financier">Financier</option><option value="materiel">Matériel</option><option value="service">Service</option></select></div>
            <div class="form-group"><label>Message *</label><textarea id="message" rows="4" required></textarea></div>
            <div class="modal-buttons"><button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Envoyer ma proposition</button></div>
        </form>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const form = modalContent.querySelector('form');
    if (form) form.onsubmit = (e) => { e.preventDefault(); handlePartnershipSubmit(form); };
}

function handlePartnershipSubmit(form) {
    if (!validateForm(form)) { showNotification('Veuillez remplir tous les champs.', 'error'); return; }
    
    const data = { company: document.getElementById('company')?.value, contact: document.getElementById('contact')?.value, email: document.getElementById('email')?.value, phone: document.getElementById('phone')?.value, type: document.getElementById('type')?.value, message: document.getElementById('message')?.value };
    const sujet = `🤝 PARTENARIAT JUBILÉ - ${data.company}`;
    const corps = `PARTENARIAT JUBILÉ\n\n🏢 ${data.company}\n👤 ${data.contact}\n📧 ${data.email}\n📱 ${data.phone}\n📋 Type : ${data.type}\n💬 Message : ${data.message}`;
    
    sendEmailToGmail(sujet, corps);
    showNotification('✅ Proposition envoyée ! Nous vous contacterons rapidement.', 'success');
    form.reset();
    setTimeout(() => closeModal('inscriptionModal'), 2000);
}

function openMissForm() {
    document.getElementById('missModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeMissForm() {
    document.getElementById('missModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function downloadMissForm() {
    const sujet = "👑 CANDIDATURE MISS BÈ-KPOTA 2028";
    const corps = "CANDIDATURE MISS BÈ-KPOTA 2028\n\n📋 DOSSIER À FOURNIR\n• Formulaire de candidature rempli\n• CV + photo d'identité\n• Lettre de motivation\n\n📧 Envoyer à : choralelafoi@gmail.com\n📅 Date limite : 15 Février 2028";
    sendEmailToGmail(sujet, corps);
    showNotification('✅ Formulaire prêt ! Vérifiez votre email.', 'success');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ============================================
// FORMULAIRES PRINCIPAUX
// ============================================

function handleContactSubmit(form) {
    if (!validateForm(form)) { showNotification('Veuillez remplir tous les champs.', 'error'); return; }
    
    const data = { name: document.getElementById('contactName')?.value, email: document.getElementById('contactEmail')?.value, phone: document.getElementById('contactPhone')?.value, subject: document.getElementById('contactSubject')?.value, message: document.getElementById('contactMessage')?.value };
    const sujet = `📧 CONTACT JUBILÉ - ${data.name} - ${data.subject}`;
    const corps = `CONTACT JUBILÉ\n\n👤 ${data.name}\n📧 ${data.email}\n📱 ${data.phone || 'Non fourni'}\n📋 Sujet : ${data.subject}\n\n💬 MESSAGE\n${data.message}`;
    
    sendEmailToGmail(sujet, corps);
    showNotification('✅ Message envoyé ! Nous vous répondrons sous 48h.', 'success');
    form.reset();
}

function handleBenevoleSubmit(form) {
    if (!validateForm(form)) { showNotification('Veuillez remplir tous les champs.', 'error'); return; }
    
    const dispos = [];
    if (document.getElementById('benevoleDispo1')?.checked) dispos.push('Coupe de la Foi 2027');
    if (document.getElementById('benevoleDispo2')?.checked) dispos.push('The Voïx 2027');
    if (document.getElementById('benevoleDispo3')?.checked) dispos.push('Miabe Foire 2027');
    if (document.getElementById('benevoleDispo4')?.checked) dispos.push('Jubilé Cup 2028');
    if (document.getElementById('benevoleDispo5')?.checked) dispos.push('Concert Jubilé 2028');
    
    const data = { name: document.getElementById('benevoleName')?.value, email: document.getElementById('benevoleEmail')?.value, phone: document.getElementById('benevolePhone')?.value, area: document.getElementById('benevoleArea')?.value, motivation: document.getElementById('benevoleMotivation')?.value, disponibilites: dispos.join(', ') };
    const sujet = `🤝 BÉNÉVOLAT JUBILÉ - ${data.name}`;
    const corps = `CANDIDATURE BÉNÉVOLE\n\n👤 ${data.name}\n📧 ${data.email}\n📱 ${data.phone}\n🎯 Domaine : ${data.area}\n📅 Disponibilités : ${data.disponibilites || 'Non spécifiées'}\n\n💪 MOTIVATION\n${data.motivation}`;
    
    sendEmailToGmail(sujet, corps);
    showNotification('✅ Candidature envoyée ! Merci pour votre engagement.', 'success');
    form.reset();
    
    // Animation de confirmation
    const container = document.querySelector('.benevole-form');
    const confirmation = document.createElement('div');
    confirmation.className = 'confirmation-animation';
    confirmation.innerHTML = '<div class="confirmation-content"><i class="fas fa-hands-helping"></i><h4>Merci de votre engagement !</h4><p>Vous recevrez un email de confirmation.</p></div>';
    container.appendChild(confirmation);
    setTimeout(() => confirmation.remove(), 5000);
}

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Formulaires principaux
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.onsubmit = (e) => { e.preventDefault(); handleContactSubmit(contactForm); };
    
    const benevoleForm = document.getElementById('benevoleForm');
    if (benevoleForm) benevoleForm.onsubmit = (e) => { e.preventDefault(); handleBenevoleSubmit(benevoleForm); };
    
    // Fermeture des modals
    document.querySelectorAll('.modal .modal-close').forEach(btn => {
        btn.onclick = () => { btn.closest('.modal').style.display = 'none'; document.body.style.overflow = 'auto'; };
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.onclick = (e) => { if (e.target === modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; } };
    });
    
    // Animation au scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.style.opacity = '1'; });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.event-inscription-card, .foire-edition-card, .contact-info-card, .soutien-card, .social-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
    
    // Style d'animation
    const style = document.createElement('style');
    style.textContent = `
        .confirmation-animation { background: linear-gradient(135deg, var(--gold), var(--rose)); color: white; padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center; animation: fadeInUp 0.5s ease; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);
});

// Navigation fluide
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
        }
    });
});