// vote.js - Version complète avec Gmail pour les deux éditions

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    adminStorageKey: "theVoixAdminCodes",
    voteStorageKey: "theVoixVotes",
    userStorageKey: "theVoixUsers_v2",
    currentUserKey: "theVoixCurrentUser",
    candidatesKey: "theVoixCandidates_v2",
    candidatures2027Key: "theVoixCandidatures2027",
    voteEndDate: new Date("2028-12-31T23:59:59").getTime(),
    WHATSAPP_NUMBER: "22879288209",
    GMAIL_ADDRESS: "choralelafoi@gmail.com",
    PAYMENT_NUMBER: "22879288209",
    T_MONEY_NUMBER: "91600945",
    FLOOZ_NUMBER: "79288209"
};

// Clé secrète locale pour la réinitialisation
CONFIG.resetSecret = 'JUBILE_RESET_2028';

const PACK_MAPPING = {
    "simple": { name: "Vote Simple", votes: 1, price: 200 },
    "decouverte": { name: "Pack Découverte", votes: 3, price: 500 },
    "passion": { name: "Pack Passion", votes: 10, price: 1500 },
    "jubile": { name: "Pack Jubilé", votes: 25, price: 3000 }
};

const PACK_BY_NAME = {
    "Vote Simple": { type: "simple", votes: 1, price: 200 },
    "Pack Découverte": { type: "decouverte", votes: 3, price: 500 },
    "Pack Passion": { type: "passion", votes: 10, price: 1500 },
    "Pack Jubilé": { type: "jubile", votes: 25, price: 3000 }
};

let appState = {
    currentUser: null,
    currentEdition: "2027",
    pendingVote: null,
    selectedCandidate: null,
    candidates: [],
    selectedRole: null,
    pendingCandidature: null
};

// ============================================
// API DE VÉRIFICATION DES TICKETS (BACKEND + FALLBACK LOCAL)
// ============================================

const BACKEND_BASE = window.BACKEND_BASE || 'http://localhost:3000';

const TicketAPI = {
    async verifyTicket(code, packName, expectedPrice, expectedVotes) {
        const upper = (code || '').toUpperCase();
        try {
            const res = await fetch(`${BACKEND_BASE}/api/tickets/${upper}`);
            if (res.ok) {
                const json = await res.json();
                if (!json.valid) return { valid: false, error: json.error || 'Code invalide' };
                const expectedPackType = PACK_BY_NAME[packName]?.type || packName.toLowerCase();
                if (json.ticket.pack_type !== expectedPackType) {
                    const names = { simple: 'Vote Simple', decouverte: 'Pack Découverte', passion: 'Pack Passion', jubile: 'Pack Jubilé' };
                    return { valid: false, error: `❌ Ce ticket est pour le pack "${names[json.ticket.pack_type]}"` };
                }
                return { valid: true, codeData: json.ticket, votes: json.ticket.votes, price: json.ticket.price, packType: json.ticket.pack_type };
            }
            return { valid: false, error: 'Erreur serveur - veuillez réessayer' };
        } catch (e) {
            console.error('❌ Erreur de connexion au backend:', e);
            return { valid: false, error: '⚠️ Serveur indisponible. Veuillez vérifier votre connexion ou contacter l\'administrateur.' };
        }
    },

    async useTicket(code, userId, candidateId, candidateName) {
        const upper = (code || '').toUpperCase();
        try {
            const res = await fetch(`${BACKEND_BASE}/api/tickets/use`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: upper, userId, candidateId, candidateName, userName: appState.currentUser ? `${appState.currentUser.prenom} ${appState.currentUser.nom}` : null })
            });
            if (res.ok) {
                const json = await res.json();
                if (json.success) {
                    return { success: true, votes: json.votes };
                }
                return { success: false, error: json.error || 'Erreur serveur' };
            }
            return { success: false, error: 'Erreur serveur - veuillez réessayer' };
        } catch (e) {
            console.error('❌ Erreur de connexion au backend:', e);
            return { success: false, error: '⚠️ Serveur indisponible. Veuillez vérifier votre connexion ou contacter l\'administrateur.' };
        }
    },

    getPackName(packType) {
        const names = { simple: "Vote Simple", decouverte: "Pack Découverte", passion: "Pack Passion", jubile: "Pack Jubilé" };
        return names[packType] || packType;
    },

    async getStats() {
        try {
            const res = await fetch(`${BACKEND_BASE}/api/stats`);
            if (res.ok) {
                const json = await res.json();
                return { total: json.total || 0, used: json.used || 0, available: json.available || 0 };
            }
            console.warn('Stats non disponibles');
            return { total: 0, used: 0, available: 0 };
        } catch (e) {
            console.error('❌ Impossible de récupérer les stats du serveur:', e);
            return { total: 0, used: 0, available: 0 };
        }
    }
};

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("🎵 Initialisation The Voïx");
    
    initializeStorage();
    checkLoggedInUser();
    loadCandidates();
    updateClassement();
    startChrono();
    setupEventListeners();
    setupRealTimeUpdates();
    setupMobileMenu();
    setupSecretResetObserver();
    
    // Sauvegarder la section d'inscription 2027 avant toute modification dynamique
    const inscriptionSection = document.querySelector('.inscription-candidat-section');
    if (inscriptionSection && !inscriptionSection.getAttribute('data-original-content')) {
        inscriptionSection.setAttribute('data-original-content', inscriptionSection.innerHTML);
    }
    
    switchEdition('2027');
    
    // Ne pas appeler le backend par défaut
    (async () => {
        if (window.BACKEND_BASE) {
            try {
                const stats = await TicketAPI.getStats();
                console.log(`📊 Tickets disponibles: ${stats.available}/${stats.total}`);
            } catch (e) {
                console.log('ℹ️ Impossible de récupérer les stats (backend)', e);
            }
        } else {
            console.log('ℹ️ Backend non configuré — stats désactivées (mode hors-ligne)');
        }
    })();
});

function getDefaultCandidates() {
    return [
        { id: "1", nom: "ADJO", prenom: "Marie", categorie: "soliste", votes: 0, photo: null, status: "validated" },
        { id: "2", nom: "KODJO", prenom: "Frères", categorie: "duo", votes: 0, photo: null, status: "validated" },
        { id: "3", nom: "AGBÉ", prenom: "Kossi", categorie: "soliste", votes: 0, photo: null, status: "validated" },
        { id: "4", nom: "ESPOIR", prenom: "Chœur", categorie: "groupe", votes: 0, photo: null, status: "validated" }
    ];
}

function initializeStorage() {
    try {
        if (!localStorage.getItem(CONFIG.candidatesKey)) {
            localStorage.setItem(CONFIG.candidatesKey, JSON.stringify(getDefaultCandidates()));
        }
        if (!localStorage.getItem(CONFIG.voteStorageKey)) localStorage.setItem(CONFIG.voteStorageKey, JSON.stringify([]));
        if (!localStorage.getItem(CONFIG.userStorageKey)) localStorage.setItem(CONFIG.userStorageKey, JSON.stringify([]));
        if (!localStorage.getItem(CONFIG.candidatures2027Key)) localStorage.setItem(CONFIG.candidatures2027Key, JSON.stringify([]));
        console.log("✅ Stockage initialisé");
    } catch (error) {
        console.error("❌ Erreur initialisation:", error);
    }
}

function loadCandidates() {
    try {
        const saved = localStorage.getItem(CONFIG.candidatesKey);
        const loaded = saved ? JSON.parse(saved) : null;
        if (!Array.isArray(loaded)) {
            const defaultCandidates = getDefaultCandidates();
            appState.candidates = defaultCandidates;
            localStorage.setItem(CONFIG.candidatesKey, JSON.stringify(defaultCandidates));
        } else {
            appState.candidates = loaded;
        }
        updateCandidateSelect();
    } catch (error) {
        appState.candidates = getDefaultCandidates();
        updateCandidateSelect();
    }
}

function updateCandidateSelect() {
    const candidateSelect = document.getElementById('candidateSelect');
    if (candidateSelect) {
        candidateSelect.innerHTML = '<option value="">Sélectionnez un candidat</option>' +
            appState.candidates.map(c => `<option value="${c.id}">${c.prenom} ${c.nom} - ${c.categorie} (${c.votes || 0} votes)</option>`).join('');
    }
}

function updateClassement() {
    const candidates = JSON.parse(localStorage.getItem(CONFIG.candidatesKey) || '[]');
    appState.candidates = candidates.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    
    const container = document.getElementById('classementTable');
    if (!container) return;
    
    let html = `<div class="classement-header"><span>Pos</span><span>Candidat</span><span>Catégorie</span><span>Votes</span></div>`;
    
    if (appState.candidates.length === 0) {
        html += '<div class="empty-message">Aucun candidat pour le moment</div>';
    } else {
        appState.candidates.forEach((c, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            html += `<div class="classement-item ${index === 0 ? 'position-1' : index === 1 ? 'position-2' : index === 2 ? 'position-3' : ''}">
                        <span class="position">${index + 1} ${medal}</span>
                        <span><strong>${c.prenom} ${c.nom}</strong></span>
                        <span>${c.categorie}</span>
                        <span class="votes">${c.votes || 0}</span>
                    </div>`;
        });
    }
    container.innerHTML = html;
}

function startChrono() {
    const endDate = CONFIG.voteEndDate;
    function update() {
        const d = Math.max(0, endDate - Date.now());
        const jours = Math.floor(d / (1000*60*60*24));
        const heures = Math.floor((d % (1000*60*60*24)) / (1000*60*60));
        const minutes = Math.floor((d % (1000*60*60)) / (1000*60));
        const secondes = Math.floor((d % (1000*60)) / 1000);
        const joursEl = document.getElementById('jours');
        const heuresEl = document.getElementById('heures');
        const minutesEl = document.getElementById('minutes');
        const secondesEl = document.getElementById('secondes');
        if (joursEl) joursEl.textContent = String(jours).padStart(2,'0');
        if (heuresEl) heuresEl.textContent = String(heures).padStart(2,'0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2,'0');
        if (secondesEl) secondesEl.textContent = String(secondes).padStart(2,'0');
    }
    update();
    setInterval(update, 1000);
}

function setupRealTimeUpdates() {
    setInterval(() => {
        if (appState.currentEdition === "2028" && document.visibilityState === 'visible') {
            loadCandidates();
            updateClassement();
        }
    }, 10000);
}

function setupMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileBtn && navLinks) mobileBtn.addEventListener('click', () => navLinks.classList.toggle('show'));
}

function switchEdition(edition) {
    appState.currentEdition = edition;
    document.querySelectorAll('.edition-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.edition === edition));
    const edition2027 = document.getElementById('edition-2027');
    const edition2028 = document.getElementById('edition-2028');
    if (edition2027) edition2027.style.display = edition === "2027" ? "block" : "none";
    if (edition2028) edition2028.style.display = edition === "2028" ? "block" : "none";
}

function showMessage(text, type, duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<div class="notification-content">${type === 'success' ? '✅' : type === 'info' ? 'ℹ️' : '❌'} ${text}</div>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), duration);
}

// ============================================
// FORMULAIRE CANDIDATURE 2027
// ============================================

function showCandidatureForm() {
    console.log("📝 Affichage formulaire candidature 2027");
    
    const formDiv = document.getElementById('formInscription2027');
    const authButtons = document.getElementById('authButtons2027');
    const formConnexion = document.getElementById('formConnexion2027');
    const recapDiv = document.getElementById('recapCandidature');
    
    if (formDiv) formDiv.style.display = 'block';
    if (authButtons) authButtons.style.display = 'none';
    if (formConnexion) formConnexion.style.display = 'none';
    if (recapDiv) recapDiv.style.display = 'none';
    
    const formElement = document.getElementById('candidatureForm2027');
    if (formElement) formElement.reset();
}

function showConnexionForm() {
    console.log("🔑 Affichage formulaire connexion 2027");
    
    const formDiv = document.getElementById('formConnexion2027');
    const authButtons = document.getElementById('authButtons2027');
    const formInscription = document.getElementById('formInscription2027');
    const recapDiv = document.getElementById('recapCandidature');
    
    if (formDiv) formDiv.style.display = 'block';
    if (authButtons) authButtons.style.display = 'none';
    if (formInscription) formInscription.style.display = 'none';
    if (recapDiv) recapDiv.style.display = 'none';
}

function retourBoutons2027() {
    console.log("🔙 Retour aux boutons 2027");
    
    const authButtons = document.getElementById('authButtons2027');
    const formInscription = document.getElementById('formInscription2027');
    const formConnexion = document.getElementById('formConnexion2027');
    const recapDiv = document.getElementById('recapCandidature');
    
    if (authButtons) authButtons.style.display = 'flex';
    if (formInscription) formInscription.style.display = 'none';
    if (formConnexion) formConnexion.style.display = 'none';
    if (recapDiv) recapDiv.style.display = 'none';
}

function handleCandidature2027(event) {
    event.preventDefault();
    console.log("📝 Traitement du formulaire de candidature 2027");
    
    const candidature = {
        id: Date.now().toString(),
        nom: document.getElementById('nom2027')?.value.trim() || '',
        prenom: document.getElementById('prenom2027')?.value.trim() || '',
        email: document.getElementById('email2027')?.value.trim() || '',
        telephone: document.getElementById('telephone2027')?.value.trim() || '',
        password: document.getElementById('password2027')?.value || '',
        confirmPassword: document.getElementById('confirmPassword2027')?.value || '',
        genre: document.getElementById('genre2027')?.value || '',
        categorie: document.getElementById('categorie2027')?.value || '',
        chant: document.getElementById('chant2027')?.value.trim() || '',
        biographie: document.getElementById('biographie2027')?.value.trim() || '',
        photo: document.getElementById('photo2027')?.files[0] || null,
        video: document.getElementById('video2027')?.files[0] || null,
        soumission: new Date().toISOString()
    };
    
    const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'password', 'categorie', 'chant', 'biographie'];
    const missingFields = requiredFields.filter(field => !candidature[field]);
    
    if (missingFields.length > 0) {
        showMessage(`Veuillez remplir tous les champs obligatoires`, "error");
        return;
    }
    
    if (candidature.password !== candidature.confirmPassword) {
        showMessage("Les mots de passe ne correspondent pas", "error");
        return;
    }
    
    if (candidature.password.length < 6) {
        showMessage("Le mot de passe doit contenir au moins 6 caractères", "error");
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidature.email)) {
        showMessage("Veuillez entrer un email valide", "error");
        return;
    }
    
    const phoneRegex = /^[0-9]{8,}$/;
    if (!phoneRegex.test(candidature.telephone.replace(/[\s\-+]/g, ''))) {
        showMessage("Veuillez entrer un numéro de téléphone valide", "error");
        return;
    }
    
    appState.pendingCandidature = candidature;
    showRecapCandidature2027(candidature);
}

function showRecapCandidature2027(candidature) {
    console.log("📄 Affichage du récapitulatif candidature 2027");
    
    let recapDiv = document.getElementById('recapCandidature');
    if (!recapDiv) {
        recapDiv = document.createElement('div');
        recapDiv.id = 'recapCandidature';
        recapDiv.style.cssText = 'display: none; margin-top: 30px;';
        const formInscription = document.getElementById('formInscription2027');
        if (formInscription && formInscription.parentNode) {
            formInscription.parentNode.insertBefore(recapDiv, formInscription.nextSibling);
        }
    }
    
    const categories = {
        'soliste': '🎤 Soliste',
        'duo': '👥 Duo',
        'groupe': '👨‍👩‍👧‍👦 Groupe'
    };
    
    const genres = {
        'homme': 'Homme',
        'femme': 'Femme',
        'autre': 'Autre'
    };
    
    recapDiv.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 50px;">📋</div>
                <h2 style="color: #1E3A8A; margin: 10px 0;">Récapitulatif de votre candidature</h2>
                <p style="color: #666;">Vérifiez attentivement toutes vos informations</p>
            </div>
            
            <div style="background: #f8fafc; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1E3A8A; margin-bottom: 15px;">👤 Informations personnelles</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
                    <div><strong>Nom complet :</strong> ${candidature.nom.toUpperCase()} ${candidature.prenom}</div>
                    <div><strong>Genre :</strong> ${genres[candidature.genre] || candidature.genre}</div>
                    <div><strong>Email :</strong> ${candidature.email}</div>
                    <div><strong>Téléphone :</strong> ${candidature.telephone}</div>
                </div>
            </div>
            
            <div style="background: #f8fafc; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1E3A8A; margin-bottom: 15px;">🎵 Informations artistiques</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
                    <div><strong>Catégorie :</strong> ${categories[candidature.categorie] || candidature.categorie}</div>
                    <div><strong>Chant à interpréter :</strong> "${candidature.chant}"</div>
                </div>
                <div style="margin-top: 15px;">
                    <strong>Biographie :</strong>
                    <p style="margin-top: 8px; color: #555; line-height: 1.5; background: white; padding: 12px; border-radius: 10px;">${candidature.biographie || 'Non renseignée'}</p>
                </div>
            </div>
            
            <div style="background: #d1fae5; border-radius: 15px; padding: 20px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 10px;">🎉</div>
                <h3 style="color: #065f46; margin-bottom: 10px;">Inscription gratuite 2027</h3>
                <p style="color: #065f46; margin-bottom: 10px;">Votre participation à l'édition 2027 est gratuite. Nous vous souhaitons plein de réussite et une belle performance !</p>
                <div style="background: white; border-radius: 10px; padding: 15px; margin-top: 10px;">
                    <p><strong>📱 Besoin d'aide ?</strong> Contactez-nous au <strong>+228 ${CONFIG.PAYMENT_NUMBER}</strong></p>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px; flex-wrap: wrap;">
                <button id="btnModifierCandidature2027" style="padding: 12px 30px; background: #e2e8f0; border: none; border-radius: 50px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button id="btnConfirmerCandidature2027" style="padding: 12px 30px; background: linear-gradient(135deg, #1E3A8A, #EC4899); border: none; border-radius: 50px; cursor: pointer; font-weight: 600; color: white;">
                    <i class="fas fa-check"></i> Confirmer et envoyer
                </button>
            </div>
        </div>
    `;
    
    recapDiv.style.display = 'block';
    const formDiv = document.getElementById('formInscription2027');
    if (formDiv) formDiv.style.display = 'none';
    
    document.getElementById('btnModifierCandidature2027')?.addEventListener('click', () => {
        recapDiv.style.display = 'none';
        if (formDiv) formDiv.style.display = 'block';
    });
    
    document.getElementById('btnConfirmerCandidature2027')?.addEventListener('click', () => confirmAndSendCandidature2027());
}

function confirmAndSendCandidature2027() {
    console.log("✉️ Confirmation et envoi de la candidature 2027");
    
    const candidature = appState.pendingCandidature;
    if (!candidature) {
        showMessage("Erreur: aucune candidature à envoyer", "error");
        return;
    }
    
    // Sauvegarder dans localStorage
    const candidatures = JSON.parse(localStorage.getItem(CONFIG.candidatures2027Key) || '[]');
    candidatures.push(candidature);
    localStorage.setItem(CONFIG.candidatures2027Key, JSON.stringify(candidatures));
    
    // Préparer l'email
    const categories = {
        'soliste': 'Soliste',
        'duo': 'Duo',
        'groupe': 'Groupe'
    };
    
    const genres = {
        'homme': 'Homme',
        'femme': 'Femme',
        'autre': 'Autre'
    };
    
    const subject = encodeURIComponent(`CANDIDATURE THE VOÏX 2027 - ${candidature.prenom} ${candidature.nom}`);
    
    const emailBody = `CANDIDATURE THE VOÏX 2027
==========================================

👤 INFORMATIONS PERSONNELLES
Nom : ${candidature.nom.toUpperCase()} ${candidature.prenom}
Genre : ${genres[candidature.genre] || candidature.genre}
Email : ${candidature.email}
Téléphone : ${candidature.telephone}

🎵 INFORMATIONS ARTISTIQUES
Catégorie : ${categories[candidature.categorie] || candidature.categorie}
Chant à interpréter : ${candidature.chant}

📝 Biographie :
${candidature.biographie}

📅 ÉDITION GRATUITE 2027
Aucun frais d'inscription n'est exigé pour cette édition.

📞 Pour assistance : +228 ${CONFIG.PAYMENT_NUMBER}

---
Candidature soumise le : ${new Date().toLocaleString('fr-FR')}`;

    // Ouvrir Gmail pour envoyer la candidature
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONFIG.GMAIL_ADDRESS}&su=${subject}&body=${encodeURIComponent(emailBody)}`;
    
    // Ouvrir Gmail dans un nouvel onglet
    const win = window.open(gmailUrl, '_blank');
    
    if (!win || win.closed || typeof win.closed === 'undefined') {
        // Fallback si le popup est bloqué
        const a = document.createElement('a');
        a.href = gmailUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
        console.log('Gmail URL (fallback):', gmailUrl);
        showMessage("📧 Si Gmail ne s'ouvre pas, cliquez sur le lien dans la console", "info", 5000);
    } else {
        showMessage("📧 Ouverture de Gmail... Envoyez votre candidature", "info", 3000);
    }
    
    // Sauvegarder le contenu original pour pouvoir le restaurer lors de la déconnexion
    const inscriptionSection = document.querySelector('.inscription-candidat-section');
    if (inscriptionSection && !inscriptionSection.getAttribute('data-original-content')) {
        inscriptionSection.setAttribute('data-original-content', inscriptionSection.innerHTML);
    }
    
    // Remplacer par le message de bienvenue APRÈS l'ouverture de Gmail
    setTimeout(() => {
        replaceWithWelcome2027(candidature);
    }, 500);
}

function replaceWithWelcome2027(candidature) {
    const inscriptionSection = document.querySelector('.inscription-candidat-section');
    if (!inscriptionSection) return;
    
    inscriptionSection.innerHTML = `
        <div class="welcome-card" style="background: linear-gradient(135deg, #1E3A8A, #EC4899); border-radius: 20px; padding: 40px; text-align: center; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
            <div style="font-size: 80px; margin-bottom: 20px;">
                <i class="fas fa-microphone-alt"></i>
            </div>
            <h2 style="font-size: 28px; margin-bottom: 10px;">Bienvenue ${candidature.prenom} ${candidature.nom} !</h2>
            <p style="font-size: 18px; margin-bottom: 20px; opacity: 0.95;">Votre candidature à l'édition 2027 a bien été reçue.</p>
            
            <div style="background: rgba(255,255,255,0.15); border-radius: 15px; padding: 20px; margin: 20px 0; text-align: left;">
                <h3 style="margin-bottom: 15px;"><i class="fas fa-heart"></i> Bravo et bonne chance !</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 12px;">✅ Votre inscription est gratuite pour l'édition 2027.</li>
                    <li style="margin-bottom: 12px;">💫 Préparez votre meilleure prestation, nous sommes heureux de vous avoir parmi les candidats.</li>
                    <li style="margin-bottom: 12px;">📩 Notre équipe vous contactera bientôt pour la suite du concours.</li>
                    <li>🎶 Restez confiant et donnez le meilleur de vous-même !</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
                <button id="logoutFromWelcome2027" class="btn" style="background: white; color: #1E3A8A; border: none; padding: 12px 30px; border-radius: 50px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-sign-out-alt"></i> Déconnexion
                </button>
                <a href="https://mail.google.com/" target="_blank" class="btn" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 12px 30px; border-radius: 50px; cursor: pointer; font-weight: bold; text-decoration: none;">
                    <i class="fas fa-envelope"></i> Voir ma candidature
                </a>
            </div>
        </div>
        
        <style>
            .welcome-card .btn:hover {
                transform: translateY(-2px);
                transition: transform 0.2s;
            }
        </style>
    `;
    
    // Attacher l'événement de déconnexion
    const logoutBtn = document.getElementById('logoutFromWelcome2027');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout2027AndRestoreSection();
        });
    }
}

function logout2027AndRestoreSection() {
    console.log("🚪 Déconnexion et restauration de la section originale");
    
    appState.currentUser = null;
    localStorage.removeItem(CONFIG.currentUserKey);
    
    const inscriptionSection = document.querySelector('.inscription-candidat-section');
    if (inscriptionSection) {
        const originalContent = inscriptionSection.getAttribute('data-original-content');
        if (originalContent) {
            inscriptionSection.innerHTML = originalContent;
            reattach2027Events();
            retourBoutons2027();
        }
    }
    
    showMessage("✅ Déconnexion réussie", "success");
}

function reattach2027Events() {
    const btnInscription = document.getElementById('btnInscription2027');
    if (btnInscription) {
        btnInscription.removeEventListener('click', showCandidatureForm);
        btnInscription.addEventListener('click', showCandidatureForm);
    }
    
    const btnConnexion = document.getElementById('btnConnexion2027');
    if (btnConnexion) {
        btnConnexion.removeEventListener('click', showConnexionForm);
        btnConnexion.addEventListener('click', showConnexionForm);
    }
    
    const btnAnnulerInscription = document.getElementById('btnAnnulerInscription');
    if (btnAnnulerInscription) {
        btnAnnulerInscription.removeEventListener('click', retourBoutons2027);
        btnAnnulerInscription.addEventListener('click', retourBoutons2027);
    }
    
    const btnAnnulerConnexion = document.getElementById('btnAnnulerConnexion');
    if (btnAnnulerConnexion) {
        btnAnnulerConnexion.removeEventListener('click', retourBoutons2027);
        btnAnnulerConnexion.addEventListener('click', retourBoutons2027);
    }
    
    const candidatureForm = document.getElementById('candidatureForm2027');
    if (candidatureForm) {
        candidatureForm.removeEventListener('submit', handleCandidature2027);
        candidatureForm.addEventListener('submit', handleCandidature2027);
    }
    
    const loginForm2027 = document.getElementById('loginForm2027');
    if (loginForm2027) {
        loginForm2027.removeEventListener('submit', handleLogin2027);
        loginForm2027.addEventListener('submit', handleLogin2027);
    }
    
    const logoutBtn2027 = document.getElementById('logout2027Btn');
    if (logoutBtn2027) {
        logoutBtn2027.removeEventListener('click', logout2027);
        logoutBtn2027.addEventListener('click', logout2027);
    }
}

function handleLogin2027(event) {
    event.preventDefault();
    console.log("🔑 Connexion 2027");
    
    const identifiant = document.getElementById('loginIdentifiant2027')?.value.trim();
    const password = document.getElementById('loginPassword2027')?.value;
    
    if (!identifiant || !password) {
        showMessage("Veuillez remplir tous les champs", "error");
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(CONFIG.userStorageKey) || '[]');
    const user = users.find(u => (u.email === identifiant || u.phone === identifiant) && u.password === btoa(password));
    
    if (user) {
        appState.currentUser = user;
        localStorage.setItem(CONFIG.currentUserKey, JSON.stringify(user));
        showMessage(`Bienvenue ${user.prenom} ${user.nom} !`, "success");
        
        const inscriptionSection = document.querySelector('.inscription-candidat-section');
        if (inscriptionSection && !inscriptionSection.getAttribute('data-original-content')) {
            inscriptionSection.setAttribute('data-original-content', inscriptionSection.innerHTML);
        }
        
        replaceWithWelcome2027({
            prenom: user.prenom,
            nom: user.nom
        });
    } else {
        showMessage("Identifiant ou mot de passe incorrect", "error");
    }
}

function logout2027() {
    if (confirm("Voulez-vous vous déconnecter ?")) {
        logout2027AndRestoreSection();
    }
}

// ============================================
// GESTION DES PACKS DE VOTES
// ============================================

function handlePackSelection(packName, votes, price) {
    if (!appState.currentUser) {
        showMessage("Veuillez vous connecter pour voter", "error");
        showAuthPage('votant');
        return;
    }
    
    if (appState.currentUser.type !== "VOTANT" && appState.currentUser.role !== "votant") {
        showMessage("Seuls les comptes votants peuvent voter", "error");
        return;
    }
    
    appState.pendingVote = {
        packName,
        votes,
        price,
        packType: PACK_BY_NAME[packName]?.type || packName.toLowerCase(),
        timestamp: Date.now()
    };
    
    showVotePage(packName, votes, price);
}

function showVotePage(packName, votes, price) {
    updateCandidateSelect();
    
    const votePage = document.getElementById('votePage');
    const votePageSubtitle = document.getElementById('votePageSubtitle');
    const packDetails = document.getElementById('packDetails');
    const summaryPack = document.getElementById('summaryPack');
    const summaryVotes = document.getElementById('summaryVotes');
    const summaryPrice = document.getElementById('summaryPrice');
    
    if (votePageSubtitle) {
        votePageSubtitle.textContent = `Vous achetez ${packName} pour ${price} FCFA`;
    }
    
    if (packDetails) {
        packDetails.innerHTML = `<div><strong>${packName}</strong> - ${votes} votes - ${price} FCFA</div>`;
    }
    
    if (summaryPack) summaryPack.textContent = packName;
    if (summaryVotes) summaryVotes.textContent = votes;
    if (summaryPrice) summaryPrice.textContent = price;
    
    if (votePage) {
        votePage.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideVotePage() {
    const votePage = document.getElementById('votePage');
    if (votePage) votePage.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function hideAuthPage() {
    const authPage = document.getElementById('authPage');
    if (authPage) authPage.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function selectCandidateAndShowTicket() {
    const candidateSelect = document.getElementById('candidateSelect');
    if (!candidateSelect) {
        showMessage("Erreur technique", "error");
        return;
    }
    
    const candidateId = candidateSelect.value;
    if (!candidateId) {
        showMessage("Veuillez sélectionner un candidat", "error");
        return;
    }
    
    const candidate = appState.candidates.find(c => c.id === candidateId);
    if (!candidate) {
        showMessage("Candidat non trouvé", "error");
        return;
    }
    
    if (!appState.pendingVote) {
        showMessage("Aucun pack sélectionné", "error");
        return;
    }
    
    appState.selectedCandidate = candidate;
    hideVotePage();
    setTimeout(() => showTicketModal(), 100);
}

function showTicketModal() {
    const modal = document.getElementById('ticketModal');
    const packInfo = document.getElementById('ticketPackInfo');
    const messageDiv = document.getElementById('ticketMessage');
    const codeInput = document.getElementById('ticketCodeInput');
    
    if (!modal) {
        console.error("Modal ticket non trouvé");
        showMessage("Erreur technique", "error");
        return;
    }
    
    if (!appState.pendingVote || !appState.selectedCandidate) {
        showMessage("Erreur: données de vote manquantes", "error");
        return;
    }
    
    if (packInfo) {
        packInfo.innerHTML = `
            <div><strong>📦 Pack :</strong> ${appState.pendingVote.packName}</div>
            <div><strong>🗳️ Votes :</strong> ${appState.pendingVote.votes}</div>
            <div><strong>💰 Prix :</strong> ${appState.pendingVote.price} FCFA</div>
            <div><strong>🎤 Candidat :</strong> ${appState.selectedCandidate.prenom} ${appState.selectedCandidate.nom}</div>
        `;
    }
    
    if (messageDiv) {
        messageDiv.style.display = 'none';
        messageDiv.innerHTML = '';
    }
    if (codeInput) {
        codeInput.value = '';
        setTimeout(() => codeInput.focus(), 100);
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideTicketModal() {
    const modal = document.getElementById('ticketModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

async function validateTicketAndVote() {
    const codeInput = document.getElementById('ticketCodeInput');
    const messageDiv = document.getElementById('ticketMessage');
    const validateBtn = document.getElementById('validateTicketBtn');
    
    if (!codeInput) {
        showMessage("Erreur technique", "error");
        return;
    }
    
    const ticketCode = codeInput.value.trim().toUpperCase();
    
    if (!ticketCode) {
        if (messageDiv) {
            messageDiv.style.display = 'block';
            messageDiv.innerHTML = '<div style="background: #FEE2E2; color: #991B1B; padding: 12px; border-radius: 8px;">❌ Veuillez saisir un code ticket</div>';
        }
        return;
    }
    
    if (!appState.pendingVote || !appState.selectedCandidate) {
        showMessage("Erreur: aucun vote en cours", "error");
        return;
    }
    
    if (validateBtn) {
        validateBtn.disabled = true;
        validateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Vérification...';
    }
    
    try {
        const verification = await TicketAPI.verifyTicket(
            ticketCode,
            appState.pendingVote.packName,
            appState.pendingVote.price,
            appState.pendingVote.votes
        );
        
        if (!verification.valid) {
            if (messageDiv) {
                messageDiv.style.display = 'block';
                messageDiv.innerHTML = `<div style="background: #FEE2E2; color: #991B1B; padding: 12px; border-radius: 8px;">${verification.error}</div>`;
            }
            return;
        }
        
        const useResult = await TicketAPI.useTicket(
            ticketCode,
            appState.currentUser?.id || "anonymous",
            appState.selectedCandidate.id,
            `${appState.selectedCandidate.prenom} ${appState.selectedCandidate.nom}`
        );
        
        if (!useResult.success) {
            if (messageDiv) {
                messageDiv.style.display = 'block';
                messageDiv.innerHTML = `<div style="background: #FEE2E2; color: #991B1B; padding: 12px; border-radius: 8px;">${useResult.error}</div>`;
            }
            return;
        }
        
        updateClassement();
        updateCandidateSelect();
        
        if (messageDiv) {
            messageDiv.style.display = 'block';
            messageDiv.innerHTML = `
                <div style="background: #D1FAE5; color: #065F46; padding: 12px; border-radius: 8px;">
                    ✅ Vote validé !<br>
                    ${useResult.votes} vote(s) pour ${appState.selectedCandidate.prenom} ${appState.selectedCandidate.nom}
                </div>
            `;
        }
        
        showMessage(`✅ ${useResult.votes} vote(s) pour ${appState.selectedCandidate.prenom} ${appState.selectedCandidate.nom}`, "success", 4000);
        
        setTimeout(() => {
            hideTicketModal();
            hideVotePage();
            appState.pendingVote = null;
            appState.selectedCandidate = null;
        }, 2000);
        
    } catch (error) {
        if (messageDiv) {
            messageDiv.style.display = 'block';
            messageDiv.innerHTML = `<div style="background: #FEE2E2; color: #991B1B; padding: 12px; border-radius: 8px;">Erreur: ${error.message}</div>`;
        }
    } finally {
        if (validateBtn) {
            validateBtn.disabled = false;
            validateBtn.innerHTML = '<i class="fas fa-check"></i> Valider le vote';
        }
    }
}

// ============================================
// AUTHENTIFICATION 2028
// ============================================

function checkLoggedInUser() {
    try {
        const savedUser = localStorage.getItem(CONFIG.currentUserKey);
        if (savedUser) {
            appState.currentUser = JSON.parse(savedUser);
            updateUserDisplay();
            
            if (appState.currentUser.type === "CANDIDAT" && appState.currentUser.edition === "2028") {
                setTimeout(() => {
                    const nomField = document.getElementById('candidateNom2028');
                    const prenomField = document.getElementById('candidatePrenom2028');
                    const emailField = document.getElementById('candidateEmail2028');
                    const telephoneField = document.getElementById('candidateTelephone2028');
                    
                    if (nomField) nomField.value = appState.currentUser.nom;
                    if (prenomField) prenomField.value = appState.currentUser.prenom;
                    if (emailField) emailField.value = appState.currentUser.email;
                    if (telephoneField) telephoneField.value = appState.currentUser.phone;
                }, 100);
            }
        }
    } catch (error) {
        localStorage.removeItem(CONFIG.currentUserKey);
    }
}

function getUsers() { return JSON.parse(localStorage.getItem(CONFIG.userStorageKey) || '[]'); }
function saveUsers(users) { localStorage.setItem(CONFIG.userStorageKey, JSON.stringify(users)); }
function handleCreateAccount(role) { appState.selectedRole = role; showAuthPage(role); }

function showAuthPage(role) {
    const subtitle = document.getElementById('authPageSubtitle');
    if (subtitle) subtitle.textContent = role === "candidat" ? "Compte candidat (5 000 FCFA)" : role === "votant" ? "Compte votant (Gratuit)" : "Connexion";
    const authPage = document.getElementById('authPage');
    if (authPage) {
        authPage.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    if (role === "login") {
        switchAuthTab('login');
    } else {
        setTimeout(() => {
            const authTabs = document.querySelector('.auth-tabs');
            if (authTabs) authTabs.style.display = 'none';
            switchAuthTab('register');
        }, 100);
    }
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    const form = document.getElementById(`${tab}Form`);
    if (form) form.classList.add('active');
    const infoDiv = document.getElementById('accountTypeInfo');
    const label = document.getElementById('accountTypeLabel');
    if (tab === 'register' && appState.selectedRole && infoDiv && label) {
        infoDiv.style.display = 'block';
        label.textContent = appState.selectedRole === "candidat" ? "Candidat" : "Votant";
    } else if (infoDiv) infoDiv.style.display = 'none';
}

function handleLogin() {
    console.log("🔑 Tentative de connexion édition 2028...");
    
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        showMessage("Veuillez remplir tous les champs", "error");
        return;
    }
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === btoa(password));
    
    if (!user) {
        showMessage("Email ou mot de passe incorrect", "error");
        return;
    }
    
    if (user.edition !== "2028") {
        showMessage("Ce compte n'est pas enregistré pour l'édition 2028", "error");
        return;
    }
    
    appState.currentUser = user;
    localStorage.setItem(CONFIG.currentUserKey, JSON.stringify(user));
    showMessage(`Bienvenue ${user.prenom} ${user.nom} !`, "success");
    hideAuthPage();
    
    updateUserDisplay();
    
    if (user.type === "VOTANT") {
        console.log("✅ Votant connecté");
        setTimeout(() => {
            const achatSection = document.getElementById('achat-votes-section');
            if (achatSection) {
                achatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 500);
    } else if (user.type === "CANDIDAT") {
        console.log("✅ Candidat connecté");
        setTimeout(() => {
            const candidateDashboard = document.getElementById('candidateDashboard2028');
            if (candidateDashboard && candidateDashboard.style.display === 'block') {
                candidateDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 500);
    }
}

function handleRegister() {
    console.log("📝 Tentative d'inscription édition 2028...");
    
    const nom = document.getElementById('registerNom')?.value.trim();
    const prenom = document.getElementById('registerPrenom')?.value.trim();
    const naissance = document.getElementById('registerNaissance')?.value || '';
    const sexe = document.getElementById('registerSexe')?.value || '';
    const phone = document.getElementById('registerPhone')?.value.trim();
    const email = document.getElementById('registerEmail')?.value.trim();
    const ville = document.getElementById('registerVille')?.value.trim() || '';
    const nomScene = document.getElementById('registerNomScene')?.value.trim() || '';
    const categorie = document.getElementById('registerCategorie')?.value || '';
    const talentDescription = document.getElementById('registerTalentDescription')?.value.trim() || '';
    const photoInput = document.getElementById('registerPhoto');
    const photoName = photoInput && photoInput.files && photoInput.files[0] ? photoInput.files[0].name : null;
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
    const reglementAccepted = document.getElementById('registerReglement')?.checked || false;
    const vraiInfos = document.getElementById('registerVraiInfos')?.checked || false;

    if (!nom || !prenom || !email || !phone || !password || !confirmPassword) {
        showMessage("Veuillez remplir tous les champs obligatoires", "error");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage("Veuillez entrer une adresse email valide", "error");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Les mots de passe ne correspondent pas", "error");
        return;
    }

    if (password.length < 6) {
        showMessage("Le mot de passe doit contenir au moins 6 caractères", "error");
        return;
    }
    
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        showMessage(`Un compte existe déjà avec l'email ${email}`, "error");
        return;
    }
    
    let userType = "";
    let userRole = "";
    
    if (appState.selectedRole === "candidat") {
        userType = "CANDIDAT";
        userRole = "candidat";
    } else if (appState.selectedRole === "votant") {
        userType = "VOTANT";
        userRole = "votant";
    } else {
        showMessage("Veuillez sélectionner un type de compte", "error");
        return;
    }

    // Si création d'un compte candidat, valider les champs spécifiques
    if (appState.selectedRole === 'candidat') {
        if (!naissance || !sexe || !ville || !nomScene || !categorie || !talentDescription) {
            showMessage('Veuillez remplir tous les champs du profil candidat', 'error');
            return;
        }
        if (!photoName) {
            showMessage('Veuillez téléverser une photo de profil', 'error');
            return;
        }
        if (!reglementAccepted) {
            showMessage('Veuillez accepter le règlement du concours', 'error');
            return;
        }
        if (!vraiInfos) {
            showMessage('Veuillez confirmer que les informations sont exactes', 'error');
            return;
        }
    }
    
    const newUser = {
        id: Date.now().toString(),
        nom: nom,
        prenom: prenom,
        naissance: naissance || null,
        sexe: sexe || null,
        email: email,
        phone: phone,
        ville: ville || null,
        nomScene: nomScene || null,
        categorie: categorie || null,
        talentDescription: talentDescription || null,
        photoName: photoName || null,
        reglementAccepted: reglementAccepted,
        vraiInfos: vraiInfos,
        password: btoa(password),
        type: userType,
        role: userRole,
        edition: "2028",
        createdAt: new Date().toISOString(),
        candidatureSoumise: false
    };
    
    users.push(newUser);
    saveUsers(users);
    appState.currentUser = newUser;
    localStorage.setItem(CONFIG.currentUserKey, JSON.stringify(newUser));

    if (newUser.type === 'CANDIDAT' && newUser.edition === '2028') {
        try {
            const candidates = JSON.parse(localStorage.getItem(CONFIG.candidatesKey) || '[]');
            const exists = candidates.find(c => c.email === newUser.email || c.id === newUser.id);
            if (!exists) {
                const placeholder = {
                    id: newUser.id,
                    nom: newUser.nom || '',
                    prenom: newUser.prenom || '',
                    naissance: newUser.naissance || null,
                    sexe: newUser.sexe || null,
                    email: newUser.email || newUser.phone || null,
                    phone: newUser.phone || null,
                    ville: newUser.ville || null,
                    nomScene: newUser.nomScene || null,
                    categorie: newUser.categorie || null,
                    talentDescription: newUser.talentDescription || null,
                    votes: 0,
                    photo: newUser.photoName || null,
                    status: 'pending',
                    edition: '2028',
                    createdAt: newUser.createdAt
                };
                candidates.push(placeholder);
                localStorage.setItem(CONFIG.candidatesKey, JSON.stringify(candidates));
                appState.candidates = candidates;
                updateCandidateSelect();
                updateClassement();
            }
        } catch (e) {
            console.error('Erreur lors de l ajout du candidat placeholder:', e);
        }
    }
    
    showMessage(`Compte ${userType} créé avec succès pour l'édition 2028 !`, "success");
    hideAuthPage();
    
    updateUserDisplay();
    
    if (userType === "VOTANT") {
        console.log("✅ Compte votant créé");
        setTimeout(() => {
            const achatSection = document.getElementById('achat-votes-section');
            if (achatSection) {
                achatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 500);
    } else if (userType === "CANDIDAT") {
        console.log("✅ Compte candidat créé");
        setTimeout(() => {
            const candidateDashboard = document.getElementById('candidateDashboard2028');
            if (candidateDashboard && candidateDashboard.style.display === 'block') {
                candidateDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 500);
    }

    setTimeout(() => {
        showMessage(`Félicitations ${newUser.prenom} ${newUser.nom} ! Votre compte a été créé.`, 'success', 6000);
    }, 700);
}

// ============================================
// GESTIONNAIRE CANDIDATURE 2028 - AVEC PAIEMENT
// ============================================

function handleCandidateApplication2028(event) {
    // Empêcher le rechargement de la page
    event.preventDefault();
    event.stopPropagation();
    
    console.log("📝 TRAITEMENT CANDIDATURE 2028 DÉMARRÉ");
    
    // Récupérer tous les champs du formulaire 2028
    const nomInput = document.getElementById('candidateNom2028');
    const prenomInput = document.getElementById('candidatePrenom2028');
    const emailInput = document.getElementById('candidateEmail2028');
    const phoneInput = document.getElementById('candidateTelephone2028');
    const genreInput = document.getElementById('candidateGenre2028');
    const categorieInput = document.getElementById('candidateCategorie2028');
    const chantInput = document.getElementById('candidateChant2028');
    const bioInput = document.getElementById('candidateBiographie2028');
    const photoInput = document.getElementById('candidatePhoto2028');
    const reglementInput = document.getElementById('candidateReglement2028');

    // Vérifier que tous les éléments existent
    if (!nomInput || !prenomInput || !emailInput || !phoneInput || !genreInput || 
        !categorieInput || !chantInput || !bioInput || !reglementInput) {
        console.error("❌ Certains champs du formulaire sont introuvables");
        showMessage("Erreur technique : champs du formulaire manquants", "error");
        return;
    }

    // Récupérer les valeurs
    const nom = nomInput.value.trim() || '';
    const prenom = prenomInput.value.trim() || '';
    const email = emailInput.value.trim() || '';
    const phone = phoneInput.value.trim() || '';
    const genre = genreInput.value || '';
    const categorie = categorieInput.value || '';
    const chant = chantInput.value.trim() || '';
    const bio = bioInput.value.trim() || '';
    const reglement = reglementInput.checked;

    // Vérification des champs obligatoires
    if (!nom || !prenom || !email || !phone || !genre || !categorie || !chant || !bio) {
        showMessage('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }

    if (!reglement) {
        showMessage('Veuillez accepter le règlement du concours', 'error');
        return;
    }

    // Vérification de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Veuillez entrer un email valide', 'error');
        return;
    }

    // Vérification du téléphone
    const phoneRegex = /^[0-9]{8,}$/;
    const cleanPhone = phone.replace(/[\s\-+()]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
        showMessage('Veuillez entrer un numéro de téléphone valide (8 chiffres minimum)', 'error');
        return;
    }

    // Créer l'objet candidat
    const candidate = {
        id: Date.now().toString(),
        nom: nom,
        prenom: prenom,
        email: email,
        phone: phone,
        genre: genre,
        categorie: categorie,
        chant: chant,
        biographie: bio,
        photoName: photoInput && photoInput.files && photoInput.files[0] ? photoInput.files[0].name : null,
        votes: 0,
        status: 'submitted',
        edition: '2028',
        frais_inscription: 5000,
        createdAt: new Date().toISOString()
    };

    console.log("✅ Candidat créé:", candidate);

    // Sauvegarder dans localStorage
    try {
        const candidates = JSON.parse(localStorage.getItem(CONFIG.candidatesKey) || '[]');
        candidates.push(candidate);
        localStorage.setItem(CONFIG.candidatesKey, JSON.stringify(candidates));
        appState.candidates = candidates;
        updateCandidateSelect();
        updateClassement();
        console.log("✅ Candidat sauvegardé dans localStorage");
    } catch (e) {
        console.error('❌ Erreur en sauvegardant le candidat 2028:', e);
        showMessage('Erreur lors de la sauvegarde', 'error');
        return;
    }

    // ============================================
    // PRÉPARATION ET ENVOI DE L'EMAIL VERS GMAIL
    // ============================================
    
    console.log("📧 Préparation de l'email pour Gmail...");
    
    // Mapping des catégories et genres
    const categories = {
        'soliste': '🎤 Soliste',
        'duo': '👥 Duo',
        'groupe': '👨‍👩‍👧‍👦 Groupe'
    };
    
    const genres = {
        'homme': 'Homme',
        'femme': 'Femme',
        'autre': 'Autre'
    };

    // Construction du sujet
    const subject = encodeURIComponent(`CANDIDATURE THE VOÏX 2028 - ${prenom} ${nom}`);

    // Construction du corps de l'email avec informations de paiement
    const emailBody = `CANDIDATURE THE VOÏX 2028 (Édition avec votes payants)
=========================================================

👤 INFORMATIONS PERSONNELLES
─────────────────────────────
Nom complet : ${nom.toUpperCase()} ${prenom}
Genre : ${genres[genre] || genre}
Email : ${email}
Téléphone : ${phone}

🎵 INFORMATIONS ARTISTIQUES
─────────────────────────────
Catégorie : ${categories[categorie] || categorie}
Chant à interpréter : "${chant}"

📝 BIOGRAPHIE MUSICALE
─────────────────────────────
${bio}

🖼️ PHOTO DU CANDIDAT
─────────────────────────────
${candidate.photoName || 'Non fournie'}

💰 FRAIS D'INSCRIPTION : 5 000 FCFA
─────────────────────────────
📱 MODES DE PAIEMENT ACCEPTÉS :

1️⃣ T-MONEY
   📞 Numéro : 91 60 09 45
   💰 Montant : 5 000 FCFA

2️⃣ FLOOZ
   📞 Numéro : 79 28 82 09
   💰 Montant : 5 000 FCFA

📸 PROCÉDURE DE PAIEMENT :
1. Effectuez le transfert de 5 000 FCFA via T-money ou Flooz
2. Faites une capture d'écran de la confirmation de paiement
3. Envoyez la capture sur WhatsApp au : +228 79 28 82 09

⚠️ IMPORTANT :
- Votre candidature ne sera validée qu'après réception du paiement
- Un reçu vous sera envoyé par email après validation
- Délai de validation : 24 à 48 heures

📋 STATUT DE LA CANDIDATURE
─────────────────────────────
✅ Candidature soumise le : ${new Date().toLocaleString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
})}

📞 Pour assistance : +228 79 28 82 09 (WhatsApp)

---
Ce message a été généré automatiquement depuis le site The Voïx.
Veuillez conserver une copie de cet email pour vos archives.`;

    // Construction de l'URL Gmail
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONFIG.GMAIL_ADDRESS}&su=${subject}&body=${encodeURIComponent(emailBody)}`;
    
    console.log("📧 URL Gmail générée avec succès");
    
    // Ouvrir Gmail dans un nouvel onglet
    const win = window.open(gmailUrl, '_blank');
    
    if (!win || win.closed || typeof win.closed === 'undefined') {
        // Fallback si le popup est bloqué
        console.log("⚠️ Popup bloqué, utilisation du fallback");
        const a = document.createElement('a');
        a.href = gmailUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
        console.log('📧 Gmail URL (fallback):', gmailUrl);
        showMessage("📧 Si Gmail ne s'ouvre pas, cliquez sur le lien dans la console", "info", 5000);
    } else {
        console.log("✅ Gmail ouvert avec succès");
        showMessage("📧 Ouverture de Gmail... Envoyez votre candidature", "info", 3000);
    }

    // Afficher le message de bienvenue APRÈS l'ouverture de Gmail
    setTimeout(() => {
        console.log("🎉 Affichage du message de bienvenue 2028");
        
        // Remplacer le formulaire par le message de bienvenue
        const candidateFormContainer = document.getElementById('candidateFormContainer');
        if (candidateFormContainer) {
            candidateFormContainer.innerHTML = `
                <div class="welcome-card" style="background: linear-gradient(135deg, #1E3A8A, #EC4899); border-radius: 20px; padding: 40px; text-align: center; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                    <div style="font-size: 80px; margin-bottom: 20px;">
                        <i class="fas fa-microphone-alt"></i>
                    </div>
                    <h2 style="font-size: 28px; margin-bottom: 10px;">Félicitations ${prenom} ${nom} !</h2>
                    <p style="font-size: 18px; margin-bottom: 20px; opacity: 0.95;">Votre candidature pour l'édition 2028 a bien été reçue.</p>
                    
                    <div style="background: rgba(255,255,255,0.15); border-radius: 15px; padding: 20px; margin: 20px 0; text-align: left;">
                        <h3 style="margin-bottom: 15px;"><i class="fas fa-star"></i> Prochaines étapes :</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin-bottom: 12px;">✅ Votre dossier a été transmis à l'équipe d'organisation.</li>
                            <li style="margin-bottom: 12px; background: rgba(255,215,0,0.2); padding: 10px; border-radius: 8px;">
                                <strong>💰 Paiement des frais d'inscription (5 000 FCFA)</strong><br>
                                <span style="font-size: 14px;">
                                    📱 T-money : 91 60 09 45<br>
                                    📱 Flooz : 79 28 82 09
                                </span>
                            </li>
                            <li style="margin-bottom: 12px;">📸 Envoyez la capture de paiement sur WhatsApp au +228 79 28 82 09</li>
                            <li>📩 Vous recevrez une confirmation sous 48h.</li>
                        </ul>
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
                        <a href="https://mail.google.com/" target="_blank" class="btn" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 12px 30px; border-radius: 50px; cursor: pointer; font-weight: bold; text-decoration: none;">
                            <i class="fas fa-envelope"></i> Voir ma candidature
                        </a>
                        <a href="https://wa.me/22879288209" target="_blank" class="btn" style="background: #25D366; color: white; border: none; padding: 12px 30px; border-radius: 50px; cursor: pointer; font-weight: bold; text-decoration: none;">
                            <i class="fab fa-whatsapp"></i> Envoyer le paiement
                        </a>
                        <button id="logoutFromWelcome2028" class="btn" style="background: white; color: #1E3A8A; border: none; padding: 12px 30px; border-radius: 50px; cursor: pointer; font-weight: bold;">
                            <i class="fas fa-sign-out-alt"></i> Déconnexion
                        </button>
                    </div>
                </div>
            `;
            
            // Attacher l'événement de déconnexion
            const logoutBtn = document.getElementById('logoutFromWelcome2028');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    handleLogout();
                    location.reload();
                });
            }
            console.log("✅ Message de bienvenue affiché");
        } else {
            console.warn("⚠️ candidateFormContainer non trouvé");
        }
        
        // Marquer que la candidature a été soumise
        if (appState.currentUser) {
            appState.currentUser.candidatureSoumise = true;
            const users = getUsers();
            const userIndex = users.findIndex(u => u.id === appState.currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].candidatureSoumise = true;
                saveUsers(users);
            }
            localStorage.setItem(CONFIG.currentUserKey, JSON.stringify(appState.currentUser));
        }
        
        showMessage(`✅ Candidature envoyée. Merci ${prenom} ${nom} !`, 'success', 6000);
        console.log("🎉 Processus terminé avec succès");
    }, 500);
}

// ============================================
// AFFICHAGE UTILISATEUR ET DÉCONNEXION
// ============================================

function updateUserDisplay() {
    const authLoginSection = document.getElementById('authLoginSection2028');
    const candidateDashboard = document.getElementById('candidateDashboard2028');
    const voterDashboard = document.getElementById('voterDashboard2028');
    
    if (!appState.currentUser) {
        if (authLoginSection) authLoginSection.style.display = 'block';
        if (candidateDashboard) candidateDashboard.style.display = 'none';
        if (voterDashboard) voterDashboard.style.display = 'none';
        console.log("👤 Aucun utilisateur connecté");
    } else {
        if (authLoginSection) authLoginSection.style.display = 'none';
        
        const userType = appState.currentUser.type;
        console.log(`👤 Utilisateur connecté : ${appState.currentUser.prenom} ${appState.currentUser.nom} (${userType})`);
        
        if (userType === "VOTANT") {
            if (voterDashboard) {
                voterDashboard.style.display = 'block';
                const voterName = document.getElementById('voterName');
                if (voterName) voterName.textContent = `${appState.currentUser.prenom} ${appState.currentUser.nom}`;
                console.log("✅ Dashboard VOTANT affiché");
            }
            if (candidateDashboard) candidateDashboard.style.display = 'none';
        } 
        else if (userType === "CANDIDAT") {
            if (candidateDashboard) {
                candidateDashboard.style.display = 'block';
                const candidateName = document.getElementById('candidateName');
                if (candidateName) candidateName.textContent = `${appState.currentUser.prenom} ${appState.currentUser.nom}`;
                console.log("✅ Dashboard CANDIDAT affiché");
                
                const nomField = document.getElementById('candidateNom2028');
                const prenomField = document.getElementById('candidatePrenom2028');
                const emailField = document.getElementById('candidateEmail2028');
                const telephoneField = document.getElementById('candidateTelephone2028');
                
                if (nomField) nomField.value = appState.currentUser.nom;
                if (prenomField) prenomField.value = appState.currentUser.prenom;
                if (emailField) emailField.value = appState.currentUser.email;
                if (telephoneField) telephoneField.value = appState.currentUser.phone;
            }
            if (voterDashboard) voterDashboard.style.display = 'none';
        }
    }
}

function handleLogout() {
    if (confirm("Voulez-vous vous déconnecter ?")) {
        const userName = appState.currentUser ? `${appState.currentUser.prenom} ${appState.currentUser.nom}` : "";
        appState.currentUser = null;
        localStorage.removeItem(CONFIG.currentUserKey);
        updateUserDisplay();
        showMessage(`✅ Déconnexion réussie${userName ? `, ${userName}` : ""}`, "success");
    }
}

// ============================================
// RÉINITIALISATION DES CANDIDATS (ADMIN)
// ============================================

function resetCandidatesToDefault() {
    const defaultCandidates = getDefaultCandidates();
    localStorage.setItem(CONFIG.candidatesKey, JSON.stringify(defaultCandidates));
    appState.candidates = defaultCandidates;
    updateCandidateSelect();
    updateClassement();
    showMessage('✅ Tous les candidats ont été réinitialisés', 'success');
}

function clearAllCandidates() {
    localStorage.setItem(CONFIG.candidatesKey, JSON.stringify([]));
    appState.candidates = [];
    updateCandidateSelect();
    updateClassement();
    showMessage('✅ Tous les candidats ont été effacés', 'success');
}

function secureResetCandidates() {
    try {
        const input = prompt('Code de réinitialisation (administrateur) :');
        if (input === null) return;
        if (String(input).trim() === String(CONFIG.resetSecret)) {
            const action = prompt("Code validé. Tapez 'DEFAUT' pour remettre les candidats par défaut, ou 'EFFACER' pour supprimer tous les candidats définitivement.");
            if (!action) {
                showMessage('Action annulée', 'error');
                return;
            }
            const act = String(action).trim().toUpperCase();
            if (act === 'DEFAUT') {
                if (confirm('Confirmer : remettre la liste par défaut (4 candidats) ?')) {
                    resetCandidatesToDefault();
                }
            } else if (act === 'EFFACER') {
                if (confirm('CONFIRMATION FINALE : effacer tous les candidats définitivement ?')) {
                    clearAllCandidates();
                }
            } else {
                showMessage('Action non reconnue. Opération annulée.', 'error');
            }
        } else {
            showMessage('Code incorrect ou non autorisé', 'error', 4000);
            console.warn('Tentative de réinitialisation avec code incorrect');
        }
    } catch (e) {
        console.error('Erreur lors de la réinitialisation sécurisée :', e);
        showMessage('Erreur lors de la réinitialisation', 'error');
    }
}

async function checkBackendStats() {
    const resultEl = document.getElementById('statsResult');
    if (!window.BACKEND_BASE) {
        const msg = 'Backend non configuré. Définir window.BACKEND_BASE (ex: http://localhost:3000) puis réessayer.';
        if (resultEl) resultEl.textContent = msg;
        showMessage('Backend non configuré — voir la console', 'error', 5000);
        console.log(msg);
        return;
    }

    try {
        const stats = await TicketAPI.getStats();
        const text = `📊 Tickets disponibles: ${stats.available}/${stats.total} — utilisés: ${stats.used || 0}`;
        if (resultEl) resultEl.textContent = text;
        showMessage('✅ Stats récupérées', 'success', 3000);
        console.log('Stats backend:', stats);
    } catch (e) {
        if (resultEl) resultEl.textContent = 'Erreur récupération stats: ' + (e.message || e);
        showMessage('Erreur récupération des stats', 'error', 5000);
        console.error('Erreur getStats():', e);
    }
}

// ============================================
// ÉCOUTEURS D'ÉVÉNEMENTS
// ============================================

function setupEventListeners() {
    document.querySelectorAll('.edition-btn').forEach(btn => {
        btn.addEventListener('click', () => switchEdition(btn.dataset.edition));
    });
    
    document.querySelectorAll('.acheter-pack').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const packName = btn.dataset.pack;
            let fullPackName = "";
            switch(packName) {
                case "simple": fullPackName = "Vote Simple"; break;
                case "decouverte": fullPackName = "Pack Découverte"; break;
                case "passion": fullPackName = "Pack Passion"; break;
                case "jubile": fullPackName = "Pack Jubilé"; break;
                default: fullPackName = packName;
            }
            handlePackSelection(fullPackName, parseInt(btn.dataset.votes), parseInt(btn.dataset.prix));
        });
    });
    
    document.querySelectorAll('.create-account-btn').forEach(btn => {
        btn.addEventListener('click', () => handleCreateAccount(btn.dataset.role));
    });
    
    document.querySelectorAll('.show-login-btn').forEach(btn => {
        btn.addEventListener('click', () => showAuthPage('login'));
    });
    
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', handleLogout);
    });

    // Debug: toggle preview of candidate form (useful during development)
    const toggleCandidateFormPreviewBtn = document.getElementById('toggleCandidateFormPreview');
    if (toggleCandidateFormPreviewBtn) {
        toggleCandidateFormPreviewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const candidateFormContainer = document.getElementById('candidateFormContainer');
            if (!candidateFormContainer) {
                console.warn('⚠️ candidateFormContainer introuvable');
                return;
            }
            if (candidateFormContainer.classList.contains('hidden')) {
                candidateFormContainer.classList.remove('hidden');
                candidateFormContainer.style.display = 'block';
                console.log('🔧 Aperçu du formulaire 2028 activé');
            } else {
                candidateFormContainer.classList.add('hidden');
                candidateFormContainer.style.display = '';
                console.log('🔧 Aperçu du formulaire 2028 désactivé');
            }
        });
    }

    // Debug: toggle entire candidate dashboard visibility (dev only)
    const toggleCandidateDashboardBtn = document.getElementById('toggleCandidateDashboardPreview');
    if (toggleCandidateDashboardBtn) {
        toggleCandidateDashboardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const candidateDashboard = document.getElementById('candidateDashboard2028');
            if (!candidateDashboard) {
                console.warn('⚠️ candidateDashboard2028 introuvable');
                return;
            }
            if (candidateDashboard.classList.contains('hidden')) {
                candidateDashboard.classList.remove('hidden');
                candidateDashboard.style.display = 'block';
                console.log('🔧 Dashboard candidat affiché (dev)');
            } else {
                candidateDashboard.classList.add('hidden');
                candidateDashboard.style.display = '';
                console.log('🔧 Dashboard candidat caché (dev)');
            }
        });
    }
    
    const validateVoteBtn = document.getElementById('validateVoteBtn');
    if (validateVoteBtn) {
        validateVoteBtn.addEventListener('click', selectCandidateAndShowTicket);
    }
    
    const resetCandidatesBtn = document.getElementById('resetCandidatesBtn');
    if (resetCandidatesBtn) {
        resetCandidatesBtn.addEventListener('click', secureResetCandidates);
        if (document.body.classList.contains('show-secret-reset')) {
            resetCandidatesBtn.classList.remove('hidden');
        }
    }

    const checkStatsBtn = document.getElementById('checkStatsBtn');
    if (checkStatsBtn) {
        checkStatsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            checkBackendStats();
        });
    }
    
    const cancelVoteBtn = document.getElementById('cancelVoteBtn');
    if (cancelVoteBtn) {
        cancelVoteBtn.addEventListener('click', hideVotePage);
    }
    
    const authPageClose = document.getElementById('authPageClose');
    if (authPageClose) {
        authPageClose.addEventListener('click', hideAuthPage);
    }
    
    const votePageClose = document.getElementById('votePageClose');
    if (votePageClose) {
        votePageClose.addEventListener('click', hideVotePage);
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleRegister();
        });
    }
    
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });
    
    document.querySelectorAll('.switch-to-login').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthTab('login');
        });
    });
    
    document.querySelectorAll('.switch-to-register').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchAuthTab('register');
        });
    });
    
    const btnInscription = document.getElementById('btnInscription2027');
    if (btnInscription) {
        btnInscription.addEventListener('click', showCandidatureForm);
    }
    
    const btnConnexion = document.getElementById('btnConnexion2027');
    if (btnConnexion) {
        btnConnexion.addEventListener('click', showConnexionForm);
    }
    
    const btnAnnulerInscription = document.getElementById('btnAnnulerInscription');
    if (btnAnnulerInscription) {
        btnAnnulerInscription.addEventListener('click', retourBoutons2027);
    }
    
    const btnAnnulerConnexion = document.getElementById('btnAnnulerConnexion');
    if (btnAnnulerConnexion) {
        btnAnnulerConnexion.addEventListener('click', retourBoutons2027);
    }
    
    const candidatureForm = document.getElementById('candidatureForm2027');
    if (candidatureForm) {
        candidatureForm.addEventListener('submit', handleCandidature2027);
    }
    
    const loginForm2027 = document.getElementById('loginForm2027');
    if (loginForm2027) {
        loginForm2027.addEventListener('submit', handleLogin2027);
    }
    
    const logoutBtn2027 = document.getElementById('logout2027Btn');
    if (logoutBtn2027) {
        logoutBtn2027.addEventListener('click', logout2027);
    }

    // Formulaire candidature 2028 - AVEC RÉATTACHEMENT
    const candidateAppForm = document.getElementById('candidateApplicationForm2028');
    if (candidateAppForm) {
        console.log("🔗 Formulaire 2028 trouvé, attachement de l'événement");
        
        // Supprimer les anciens écouteurs en clonant
        const newForm = candidateAppForm.cloneNode(true);
        candidateAppForm.parentNode.replaceChild(newForm, candidateAppForm);
        
        // Ajouter le nouvel écouteur
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("🔄 FORMULAIRE 2028 SOUMIS !");
            handleCandidateApplication2028(e);
        });
        console.log("✅ Événement 2028 attaché avec succès");
    } else {
        console.warn("⚠️ Formulaire 2028 non trouvé au chargement");
        // Réessayer après un délai
        setTimeout(() => {
            const form = document.getElementById('candidateApplicationForm2028');
            if (form) {
                console.log("🔗 Formulaire 2028 trouvé après délai");
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("🔄 FORMULAIRE 2028 SOUMIS (après délai)");
                    handleCandidateApplication2028(e);
                });
            } else {
                console.error("❌ Formulaire 2028 toujours non trouvé");
            }
        }, 2000);
    }
    
    const modalClose = document.getElementById('ticketModalClose');
    if (modalClose) {
        modalClose.addEventListener('click', hideTicketModal);
    }
    
    const cancelTicketBtn = document.getElementById('cancelTicketBtn');
    if (cancelTicketBtn) {
        cancelTicketBtn.addEventListener('click', () => {
            hideTicketModal();
            hideVotePage();
            appState.pendingVote = null;
            appState.selectedCandidate = null;
        });
    }
    
    const validateTicketBtn = document.getElementById('validateTicketBtn');
    if (validateTicketBtn) {
        validateTicketBtn.addEventListener('click', validateTicketAndVote);
    }
    
    const ticketCodeInput = document.getElementById('ticketCodeInput');
    if (ticketCodeInput) {
        ticketCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                validateTicketAndVote();
            }
        });
        ticketCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }
    
    console.log("🎉 Tous les événements configurés !");
}

// ============================================
// OBSERVER POUR LE BOUTON SECRET RESET
// ============================================

function setupSecretResetObserver() {
    try {
        const resetBtn = document.getElementById('resetCandidatesBtn');
        if (!resetBtn) return;

        if (document.body.classList.contains('show-secret-reset')) {
            resetBtn.classList.remove('hidden');
        } else {
            resetBtn.classList.add('hidden');
        }

        const observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    if (document.body.classList.contains('show-secret-reset')) {
                        resetBtn.classList.remove('hidden');
                    } else {
                        resetBtn.classList.add('hidden');
                    }
                }
            }
        });

        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        window._secretResetObserver = observer;
    } catch (e) {
        console.error('Erreur setupSecretResetObserver:', e);
    }
}

// ============================================
// EXPOSITION DES FONCTIONS POUR LA CONSOLE
// ============================================

window.TicketAPI = TicketAPI;
window.appState = appState;
window.showCandidatureForm = showCandidatureForm;
window.validateTicketAndVote = validateTicketAndVote;
window.resetCandidatesToDefault = resetCandidatesToDefault;
window.clearAllCandidates = clearAllCandidates;
window.secureResetCandidates = secureResetCandidates;
window.checkBackendStats = checkBackendStats;