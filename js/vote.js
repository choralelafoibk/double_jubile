// vote.js - Version finale avec remplacement de la section après inscription

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
    PAYMENT_NUMBER: "22898025505"
};

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
// API DE VÉRIFICATION DES TICKETS
// ============================================

const TicketAPI = {
    verifyTicket: function(code, packName, expectedPrice, expectedVotes) {
        return new Promise((resolve) => {
            try {
                const adminData = localStorage.getItem(CONFIG.adminStorageKey);
                if (!adminData) {
                    resolve({ valid: false, error: "Aucun ticket disponible" });
                    return;
                }
                
                const data = JSON.parse(adminData);
                const codesByPack = data.codesByPack || {};
                
                let foundCode = null;
                let foundPackType = null;
                
                for (const [packType, codes] of Object.entries(codesByPack)) {
                    const codeData = codes.find(c => c.code === code.toUpperCase());
                    if (codeData) {
                        foundCode = codeData;
                        foundPackType = packType;
                        break;
                    }
                }
                
                if (!foundCode) {
                    resolve({ valid: false, error: "❌ Code ticket invalide" });
                    return;
                }
                
                if (foundCode.used === true) {
                    resolve({ valid: false, error: "❌ Ce code a déjà été utilisé" });
                    return;
                }
                
                const expectedPackType = PACK_BY_NAME[packName]?.type || packName.toLowerCase();
                
                if (foundPackType !== expectedPackType) {
                    const packNames = {
                        simple: "Vote Simple",
                        decouverte: "Pack Découverte",
                        passion: "Pack Passion",
                        jubile: "Pack Jubilé"
                    };
                    resolve({ 
                        valid: false, 
                        error: `❌ Ce ticket est pour le pack "${packNames[foundPackType]}"` 
                    });
                    return;
                }
                
                resolve({
                    valid: true,
                    codeData: foundCode,
                    votes: foundCode.votes,
                    price: foundCode.price,
                    packType: foundPackType
                });
                
            } catch (error) {
                resolve({ valid: false, error: "Erreur système" });
            }
        });
    },
    
    useTicket: function(code, userId, candidateId, candidateName) {
        return new Promise((resolve) => {
            try {
                const adminData = localStorage.getItem(CONFIG.adminStorageKey);
                if (!adminData) {
                    resolve({ success: false, error: "Données admin non trouvées" });
                    return;
                }
                
                let data = JSON.parse(adminData);
                let found = false;
                let ticketData = null;
                let packType = null;
                
                for (const [type, codes] of Object.entries(data.codesByPack)) {
                    const codeIndex = codes.findIndex(c => c.code === code.toUpperCase());
                    if (codeIndex !== -1 && !codes[codeIndex].used) {
                        codes[codeIndex].used = true;
                        codes[codeIndex].usedAt = new Date().toISOString();
                        codes[codeIndex].usedBy = userId;
                        codes[codeIndex].usedForCandidate = candidateId;
                        ticketData = codes[codeIndex];
                        packType = type;
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    resolve({ success: false, error: "Ticket non trouvé ou déjà utilisé" });
                    return;
                }
                
                localStorage.setItem(CONFIG.adminStorageKey, JSON.stringify(data));
                
                const votesToAdd = ticketData.votes;
                let candidates = JSON.parse(localStorage.getItem(CONFIG.candidatesKey) || '[]');
                const candidateIndex = candidates.findIndex(c => c.id === candidateId);
                
                if (candidateIndex !== -1) {
                    candidates[candidateIndex].votes = (candidates[candidateIndex].votes || 0) + votesToAdd;
                    localStorage.setItem(CONFIG.candidatesKey, JSON.stringify(candidates));
                    appState.candidates = candidates;
                }
                
                const voteRecord = {
                    id: Date.now().toString(),
                    ticketCode: code.toUpperCase(),
                    candidateId: candidateId,
                    candidateName: candidateName,
                    votes: votesToAdd,
                    price: ticketData.price,
                    packType: packType,
                    packName: this.getPackName(packType),
                    userId: userId,
                    userName: appState.currentUser ? `${appState.currentUser.prenom} ${appState.currentUser.nom}` : "Anonymous",
                    timestamp: new Date().toISOString()
                };
                
                const votesHistory = JSON.parse(localStorage.getItem(CONFIG.voteStorageKey) || '[]');
                votesHistory.push(voteRecord);
                localStorage.setItem(CONFIG.voteStorageKey, JSON.stringify(votesHistory));
                
                resolve({ success: true, votes: votesToAdd, price: ticketData.price, packName: this.getPackName(packType) });
                
            } catch (error) {
                resolve({ success: false, error: "Erreur système" });
            }
        });
    },
    
    getPackName: function(packType) {
        const names = { simple: "Vote Simple", decouverte: "Pack Découverte", passion: "Pack Passion", jubile: "Pack Jubilé" };
        return names[packType] || packType;
    },
    
    getStats: function() {
        try {
            const adminData = localStorage.getItem(CONFIG.adminStorageKey);
            if (!adminData) return { total: 0, used: 0, available: 0 };
            const data = JSON.parse(adminData);
            const codesByPack = data.codesByPack || {};
            let total = 0, used = 0;
            for (const codes of Object.values(codesByPack)) {
                total += codes.length;
                used += codes.filter(c => c.used).length;
            }
            return { total, used, available: total - used };
        } catch (error) {
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
    
    switchEdition('2027');
    
    const stats = TicketAPI.getStats();
    console.log(`📊 Tickets disponibles: ${stats.available}/${stats.total}`);
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
        const loaded = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(loaded) || loaded.length === 0) {
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
    notification.innerHTML = `<div class="notification-content">${type === 'success' ? '✅' : '❌'} ${text}</div>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), duration);
}

// ============================================
// FORMULAIRE CANDIDATURE 2027 - AVEC REMPLACEMENT DE SECTION
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
            
            <div style="background: #fef3c7; border-radius: 15px; padding: 20px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 10px;">💰</div>
                <h3 style="color: #92400e; margin-bottom: 10px;">Frais d'inscription : 5 000 FCFA</h3>
                <p style="color: #92400e; margin-bottom: 10px;">Les frais d'inscription sont à envoyer après validation de votre dossier</p>
                <div style="background: white; border-radius: 10px; padding: 15px; margin-top: 10px;">
                    <p><strong>📱 Numéro de paiement :</strong> +228 ${CONFIG.PAYMENT_NUMBER}</p>
                    <p><strong>💳 Méthodes acceptées :</strong> Flooz, Mixx By Yas, Mobile Money</p>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
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
    
    const candidatures = JSON.parse(localStorage.getItem(CONFIG.candidatures2027Key) || '[]');
    candidatures.push(candidature);
    localStorage.setItem(CONFIG.candidatures2027Key, JSON.stringify(candidatures));
    
    // Email
    const subject = encodeURIComponent(`CANDIDATURE THE VOÏX 2027 - ${candidature.prenom} ${candidature.nom}`);
    
    const categories = {
        'soliste': 'Soliste',
        'duo': 'Duo',
        'groupe': 'Groupe'
    };
    
    const emailBody = 
        `CANDIDATURE THE VOÏX 2027
==========================================

👤 INFORMATIONS PERSONNELLES
Nom : ${candidature.nom.toUpperCase()} ${candidature.prenom}
Email : ${candidature.email}
Téléphone : ${candidature.telephone}

🎵 INFORMATIONS ARTISTIQUES
Catégorie : ${categories[candidature.categorie] || candidature.categorie}
Chant : ${candidature.chant}

📝 Biographie :
${candidature.biographie}

💰 FRAIS D'INSCRIPTION : 5 000 FCFA
Numéro de paiement : +228 ${CONFIG.PAYMENT_NUMBER}

---
Soumis le : ${new Date().toLocaleString('fr-FR')}`;
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONFIG.GMAIL_ADDRESS}&su=${subject}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, '_blank');
    
    // Créer le compte utilisateur
    const users = JSON.parse(localStorage.getItem(CONFIG.userStorageKey) || '[]');
    const existingUser = users.find(u => u.email === candidature.email);
    
    if (!existingUser) {
        const newUser = {
            id: Date.now().toString(),
            nom: candidature.nom,
            prenom: candidature.prenom,
            email: candidature.email,
            phone: candidature.telephone,
            password: btoa(candidature.password),
            type: "CANDIDAT",
            role: "candidat",
            createdAt: new Date().toISOString(),
            edition: "2027",
            candidatureSoumise: true
        };
        users.push(newUser);
        localStorage.setItem(CONFIG.userStorageKey, JSON.stringify(users));
        appState.currentUser = newUser;
        localStorage.setItem(CONFIG.currentUserKey, JSON.stringify(newUser));
    }
    
    // REMPLACER TOUTE LA SECTION PAR LE MESSAGE DE BIENVENUE
    replaceSectionWithWelcomeMessage(candidature);
    
    appState.pendingCandidature = null;
    
    // Afficher le modal de confirmation
    showPaymentReminderModal(candidature);
}

function replaceSectionWithWelcomeMessage(candidature) {
    console.log("🎉 Remplacement de la section par le message de bienvenue");
    
    // Trouver le conteneur principal de la section d'inscription
    const inscriptionSection = document.querySelector('.inscription-candidat-section');
    if (!inscriptionSection) {
        console.error("Section .inscription-candidat-section non trouvée");
        return;
    }
    
    // Sauvegarder le contenu original pour pouvoir le restaurer lors de la déconnexion
    if (!inscriptionSection.getAttribute('data-original-content')) {
        inscriptionSection.setAttribute('data-original-content', inscriptionSection.innerHTML);
    }
    
    // Remplacer par le message de bienvenue
    inscriptionSection.innerHTML = `
        <div class="welcome-card" style="background: linear-gradient(135deg, #1E3A8A, #EC4899); border-radius: 20px; padding: 40px; text-align: center; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
            <div style="font-size: 80px; margin-bottom: 20px;">
                <i class="fas fa-microphone-alt"></i>
            </div>
            <h2 style="font-size: 28px; margin-bottom: 10px;">Bienvenue ${candidature.prenom} ${candidature.nom} !</h2>
            <p style="font-size: 18px; margin-bottom: 20px; opacity: 0.95;">Votre candidature a été enregistrée avec succès.</p>
            
            <div style="background: rgba(255,255,255,0.15); border-radius: 15px; padding: 20px; margin: 20px 0; text-align: left;">
                <h3 style="margin-bottom: 15px;"><i class="fas fa-info-circle"></i> Prochaines étapes :</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 12px;">✅ <strong>1.</strong> Un email de confirmation a été ouvert</li>
                    <li style="margin-bottom: 12px;">💰 <strong>2.</strong> Envoyez les frais d'inscription (5 000 FCFA) au <strong>+228 ${CONFIG.PAYMENT_NUMBER}</strong></li>
                    <li style="margin-bottom: 12px;">📱 <strong>3.</strong> Envoyez la capture d'écran sur WhatsApp</li>
                    <li>⏳ <strong>4.</strong> Votre dossier sera traité sous 48h</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                <button id="logoutFromWelcome2027" class="btn" style="background: white; color: #1E3A8A; border: none; padding: 12px 30px; border-radius: 50px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-sign-out-alt"></i> Déconnexion
                </button>
            </div>
        </div>
        
        <!-- Ajouter un style pour le bouton -->
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
    
    // Mettre à jour l'affichage utilisateur
    updateUserDisplay();
}

function logout2027AndRestoreSection() {
    console.log("🚪 Déconnexion et restauration de la section originale");
    
    // Déconnecter l'utilisateur
    appState.currentUser = null;
    localStorage.removeItem(CONFIG.currentUserKey);
    
    // Restaurer la section originale
    const inscriptionSection = document.querySelector('.inscription-candidat-section');
    if (inscriptionSection) {
        const originalContent = inscriptionSection.getAttribute('data-original-content');
        if (originalContent) {
            inscriptionSection.innerHTML = originalContent;
            // Réattacher les événements après restauration
            reattach2027Events();
        }
    }
    
    showMessage("✅ Déconnexion réussie", "success");
}

function reattach2027Events() {
    // Réattacher les événements pour l'édition 2027 après restauration
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

function showPaymentReminderModal(candidature) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 30px; max-width: 450px; width: 90%; padding: 35px; text-align: center;">
            <div style="font-size: 60px; margin-bottom: 15px;">🎉</div>
            <h2 style="color: #1E3A8A;">Inscription confirmée !</h2>
            <p style="margin: 15px 0;">Merci ${candidature.prenom} pour votre candidature.</p>
            
            <div style="background: #fef3c7; border-radius: 15px; padding: 20px; margin: 20px 0;">
                <p><strong>💰 Frais d'inscription : 5 000 FCFA</strong></p>
                <p>📱 Envoyez au : <strong>+228 ${CONFIG.PAYMENT_NUMBER}</strong></p>
                <p>📝 Référence : <strong>THEVOIX_${candidature.nom}</strong></p>
                <hr>
                <p><i class="fas fa-whatsapp"></i> Envoyez la capture sur WhatsApp</p>
            </div>
            
            <button id="closeModalBtn" style="background: linear-gradient(135deg, #1E3A8A, #EC4899); color: white; border: none; padding: 12px 35px; border-radius: 50px; cursor: pointer; font-weight: bold;">
                J'ai compris
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeModalBtn')?.addEventListener('click', () => {
        modal.remove();
    });
    
    setTimeout(() => {
        if (document.body.contains(modal)) modal.remove();
    }, 8000);
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
        
        // Remplacer la section par le message de bienvenue
        const inscriptionSection = document.querySelector('.inscription-candidat-section');
        if (inscriptionSection && !inscriptionSection.getAttribute('data-original-content')) {
            inscriptionSection.setAttribute('data-original-content', inscriptionSection.innerHTML);
        }
        
        replaceSectionWithWelcomeMessage({
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
// GESTION DES PACKS DE VOTES ET AUTRES FONCTIONS
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
            
            // Vérifier si l'utilisateur est un candidat 2027 connecté
            if (appState.currentUser.type === "CANDIDAT" && appState.currentUser.edition === "2027") {
                const inscriptionSection = document.querySelector('.inscription-candidat-section');
                if (inscriptionSection && !inscriptionSection.getAttribute('data-original-content')) {
                    inscriptionSection.setAttribute('data-original-content', inscriptionSection.innerHTML);
                    replaceSectionWithWelcomeMessage({
                        prenom: appState.currentUser.prenom,
                        nom: appState.currentUser.nom
                    });
                }
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
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    if (!email || !password) {
        showMessage("Veuillez remplir tous les champs", "error");
        return;
    }
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === btoa(password));
    if (user) {
        appState.currentUser = user;
        localStorage.setItem(CONFIG.currentUserKey, JSON.stringify(user));
        showMessage(`Bienvenue ${user.prenom} ${user.nom} !`, "success");
        hideAuthPage();
        updateUserDisplay();
        
        if (user.type === "VOTANT") {
            setTimeout(() => {
                const achatSection = document.getElementById('achat-votes-section');
                if (achatSection) {
                    achatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 1000);
        }
    } else {
        showMessage("Email ou mot de passe incorrect", "error");
    }
}

function handleRegister() {
    const nom = document.getElementById('registerNom')?.value.trim();
    const prenom = document.getElementById('registerPrenom')?.value.trim();
    const email = document.getElementById('registerEmail')?.value.trim();
    const phone = document.getElementById('registerPhone')?.value.trim();
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
    
    if (!nom || !prenom || !email || !phone || !password || !confirmPassword) {
        showMessage("Veuillez remplir tous les champs", "error");
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage("Les mots de passe ne correspondent pas", "error");
        return;
    }
    
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        showMessage(`Un compte existe déjà avec l'email ${email}`, "error");
        return;
    }
    
    let userType = appState.selectedRole === "candidat" ? "CANDIDAT" : "VOTANT";
    const newUser = {
        id: Date.now().toString(),
        nom,
        prenom,
        email,
        phone,
        password: btoa(password),
        type: userType,
        role: appState.selectedRole,
        createdAt: new Date().toISOString(),
        edition: "2028"
    };
    
    users.push(newUser);
    saveUsers(users);
    appState.currentUser = newUser;
    localStorage.setItem(CONFIG.currentUserKey, JSON.stringify(newUser));
    
    showMessage(`Compte ${userType} créé avec succès !`, "success");
    hideAuthPage();
    updateUserDisplay();
    
    if (userType === "VOTANT") {
        setTimeout(() => {
            const achatSection = document.getElementById('achat-votes-section');
            if (achatSection) {
                achatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 1000);
    }
}

function updateUserDisplay() {
    const authLoginSection = document.getElementById('authLoginSection2028');
    const candidateDashboard = document.getElementById('candidateDashboard2028');
    const voterDashboard = document.getElementById('voterDashboard2028');
    
    if (!appState.currentUser) {
        if (authLoginSection) authLoginSection.style.display = 'block';
        if (candidateDashboard) candidateDashboard.style.display = 'none';
        if (voterDashboard) voterDashboard.style.display = 'none';
    } else {
        if (authLoginSection) authLoginSection.style.display = 'none';
        const userType = appState.currentUser.type;
        if (userType === "VOTANT") {
            if (voterDashboard) {
                voterDashboard.style.display = 'block';
                const voterName = document.getElementById('voterName');
                if (voterName) voterName.textContent = `${appState.currentUser.prenom} ${appState.currentUser.nom}`;
            }
            if (candidateDashboard) candidateDashboard.style.display = 'none';
        } else if (userType === "CANDIDAT") {
            if (candidateDashboard) {
                candidateDashboard.style.display = 'block';
                const candidateName = document.getElementById('candidateName');
                if (candidateName) candidateName.textContent = `${appState.currentUser.prenom} ${appState.currentUser.nom}`;
                
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
        appState.currentUser = null;
        localStorage.removeItem(CONFIG.currentUserKey);
        updateUserDisplay();
        showMessage("✅ Déconnexion réussie", "success");
    }
}

function resetCandidatesToDefault() {
    const defaultCandidates = getDefaultCandidates();
    localStorage.setItem(CONFIG.candidatesKey, JSON.stringify(defaultCandidates));
    appState.candidates = defaultCandidates;
    updateCandidateSelect();
    updateClassement();
    showMessage('✅ Tous les candidats ont été réinitialisés', 'success');
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
    
    const validateVoteBtn = document.getElementById('validateVoteBtn');
    if (validateVoteBtn) {
        validateVoteBtn.addEventListener('click', selectCandidateAndShowTicket);
    }
    
    const resetCandidatesBtn = document.getElementById('resetCandidatesBtn');
    if (resetCandidatesBtn) {
        resetCandidatesBtn.addEventListener('click', resetCandidatesToDefault);
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

window.TicketAPI = TicketAPI;
window.appState = appState;
window.showCandidatureForm = showCandidatureForm;
window.validateTicketAndVote = validateTicketAndVote;