// vote.js - Version finale CORRIGÉE (sans doublons)

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    adminStorageKey: "theVoixAdminCodes",
    voteStorageKey: "theVoixVotes",
    userStorageKey: "theVoixUsers_v2",
    currentUserKey: "theVoixCurrentUser",
    candidatesKey: "theVoixCandidates_v2",
    voteEndDate: new Date("2028-12-31T23:59:59").getTime(),
    WHATSAPP_NUMBER: "22879288209",
    GMAIL_ADDRESS: "choralelafoi@gmail.com"
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
    selectedRole: null
};

// ============================================
// API DE VÉRIFICATION DES TICKETS - UNIQUE
// ============================================

const TicketAPI = {
    verifyTicket: function(code, packName, expectedPrice, expectedVotes) {
        return new Promise((resolve) => {
            try {
                console.log("🔍 Vérification ticket:", code);
                
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
                        error: `❌ Ce ticket est pour le pack "${packNames[foundPackType]}" (${foundCode.votes} votes, ${foundCode.price} FCFA)` 
                    });
                    return;
                }
                
                if (foundCode.price !== expectedPrice) {
                    resolve({ valid: false, error: `❌ Ce ticket vaut ${foundCode.price} FCFA` });
                    return;
                }
                
                if (foundCode.votes !== expectedVotes) {
                    resolve({ valid: false, error: `❌ Ce ticket donne ${foundCode.votes} vote(s)` });
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
// MODAL DE TICKET - VERSION UNIQUE ET FONCTIONNELLE
// ============================================

function createTicketModal() {
    console.log("🎫 Création du modal ticket...");

    const oldModal = document.getElementById('ticketModal');
    if (oldModal) {
        console.log("🗑️ Suppression de l'ancien modal");
        oldModal.remove();
    }

    const modalHTML = `
        <div id="ticketModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; display: none; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 20px; max-width: 500px; width: 90%; padding: 30px; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <button id="closeTicketModalBtn" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">&times;</button>
                <div style="text-align: center; font-size: 48px; margin-bottom: 20px; color: #F59E0B;">
                    <i class="fas fa-ticket-alt"></i>
                </div>
                <h3 style="text-align: center; margin-bottom: 10px;">Saisie du code ticket</h3>
                <p style="text-align: center; color: #666; margin-bottom: 20px;">Veuillez saisir le code reçu après votre achat</p>

                <div id="ticketPackInfo" style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin: 20px 0; font-size: 14px;"></div>

                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Code ticket (6 caractères)</label>
                    <input type="text" id="ticketCodeInput" style="width: 100%; padding: 15px; font-size: 20px; text-align: center; letter-spacing: 5px; font-family: monospace; text-transform: uppercase; border: 2px solid #e2e8f0; border-radius: 10px;" maxlength="6" autocomplete="off" placeholder="EX: ABC123">
                </div>

                <div id="ticketMessage" style="margin: 15px 0; font-size: 14px;"></div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button id="cancelTicketBtn" style="flex: 1; padding: 12px; background: transparent; border: 2px solid #1E3A8A; color: #1E3A8A; border-radius: 50px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-times"></i> Annuler
                    </button>
                    <button id="validateTicketBtn" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #1E3A8A, #EC4899); color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-check"></i> Valider le vote
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log("✅ Modal ticket inséré dans le DOM");

    // Attacher les événements immédiatement après l'insertion
    attachTicketModalEvents();
    console.log("✅ Modal de ticket créé avec événements");
}

function attachTicketModalEvents() {
    console.log("🔗 Attachement des événements de la modal ticket");

    // Utiliser setTimeout pour s'assurer que le DOM est mis à jour
    setTimeout(() => {
        const closeBtn = document.getElementById('closeTicketModalBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                hideTicketModal();
            });
            console.log("✅ Événement closeBtn attaché");
        }

        const cancelBtn = document.getElementById('cancelTicketBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                hideTicketModal();
                hideVotePage();
                appState.pendingVote = null;
                appState.selectedCandidate = null;
                showMessage("Vote annulé", "info");
            });
            console.log("✅ Événement cancelBtn attaché");
        }

        const validateBtn = document.getElementById('validateTicketBtn');
        if (validateBtn) {
            validateBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("🔘 Bouton Valider cliqué - appel de validateTicketAndVote");
                validateTicketAndVote();
            });
            console.log("✅ Événement validateBtn attaché");
        } else {
            console.error("❌ Bouton validateTicketBtn non trouvé");
        }

        const codeInput = document.getElementById('ticketCodeInput');
        if (codeInput) {
            codeInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log("🔘 Enter pressé dans le champ code - appel de validateTicketAndVote");
                    validateTicketAndVote();
                }
            });
            codeInput.addEventListener('input', function(e) {
                this.value = this.value.toUpperCase();
            });
            console.log("✅ Événements codeInput attachés");
        }
    }, 100);
}

function showTicketModal() {
    const modal = document.getElementById('ticketModal');
    const packInfo = document.getElementById('ticketPackInfo');
    const messageDiv = document.getElementById('ticketMessage');
    const codeInput = document.getElementById('ticketCodeInput');
    
    if (!modal) {
        createTicketModal();
        setTimeout(() => showTicketModal(), 100);
        return;
    }
    
    if (!appState.pendingVote || !appState.selectedCandidate) {
        showMessage("Erreur: données de vote manquantes", "error");
        return;
    }
    
    if (packInfo) {
        packInfo.innerHTML = `
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                <div><strong>📦 Pack :</strong> ${appState.pendingVote.packName}</div>
                <div><strong>🗳️ Votes :</strong> ${appState.pendingVote.votes}</div>
                <div><strong>💰 Prix :</strong> ${appState.pendingVote.price} FCFA</div>
                <div><strong>🎤 Candidat :</strong> ${appState.selectedCandidate.prenom} ${appState.selectedCandidate.nom}</div>
            </div>
        `;
    }
    
    if (messageDiv) messageDiv.innerHTML = '';
    if (codeInput) {
        codeInput.value = '';
        setTimeout(() => codeInput.focus(), 100);
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    console.log("✅ Modal affichée");
}

function hideTicketModal() {
    const modal = document.getElementById('ticketModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// VALIDATION DU VOTE - VERSION UNIQUE
// ============================================

async function validateTicketAndVote() {
    console.log("🎫 validateTicketAndVote appelée - début");

    const codeInput = document.getElementById('ticketCodeInput');
    const messageDiv = document.getElementById('ticketMessage');
    const validateBtn = document.getElementById('validateTicketBtn');

    if (!codeInput) {
        console.error("❌ codeInput non trouvé");
        showMessage("Erreur technique", "error");
        return;
    }

    const ticketCode = codeInput.value.trim().toUpperCase();
    console.log("📝 Code saisi:", ticketCode);

    if (!ticketCode) {
        console.log("⚠️ Aucun code saisi");
        if (messageDiv) {
            messageDiv.innerHTML = '<div style="background: #FEE2E2; color: #991B1B; padding: 12px; border-radius: 8px;">❌ Veuillez saisir un code ticket</div>';
        }
        return;
    }

    if (!appState.pendingVote || !appState.selectedCandidate) {
        console.error("❌ Données de vote manquantes:", { pendingVote: appState.pendingVote, selectedCandidate: appState.selectedCandidate });
        showMessage("Erreur: aucun vote en cours", "error");
        return;
    }

    console.log("✅ Données de vote présentes:", {
        packName: appState.pendingVote.packName,
        votes: appState.pendingVote.votes,
        price: appState.pendingVote.price,
        candidate: `${appState.selectedCandidate.prenom} ${appState.selectedCandidate.nom}`
    });

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
            if (messageDiv) messageDiv.innerHTML = `<div style="background: #FEE2E2; color: #991B1B; padding: 12px; border-radius: 8px;">${verification.error}</div>`;
            return;
        }
        
        const useResult = await TicketAPI.useTicket(
            ticketCode,
            appState.currentUser?.id || "anonymous",
            appState.selectedCandidate.id,
            `${appState.selectedCandidate.prenom} ${appState.selectedCandidate.nom}`
        );
        
        if (!useResult.success) {
            if (messageDiv) messageDiv.innerHTML = `<div style="background: #FEE2E2; color: #991B1B; padding: 12px; border-radius: 8px;">${useResult.error}</div>`;
            return;
        }
        
        updateClassement();
        updateCandidateSelect();
        
        if (messageDiv) {
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
        if (messageDiv) messageDiv.innerHTML = `<div style="background: #FEE2E2; color: #991B1B; padding: 12px; border-radius: 8px;">Erreur: ${error.message}</div>`;
    } finally {
        if (validateBtn) {
            validateBtn.disabled = false;
            validateBtn.innerHTML = '<i class="fas fa-check"></i> Valider le vote';
        }
    }
}

// ============================================
// GESTION DES PACKS DE VOTES
// ============================================

function handlePackSelection(packName, votes, price) {
    console.log("🛒 handlePackSelection appelée:", { packName, votes, price });
    console.log("👤 Utilisateur actuel:", appState.currentUser);

    if (!appState.currentUser) {
        console.log("❌ Aucun utilisateur connecté");
        showMessage("Veuillez vous connecter pour voter", "error");
        showAuthPage('votant');
        return;
    }

    if (appState.currentUser.type !== "VOTANT" && appState.currentUser.role !== "votant") {
        console.log("❌ Utilisateur pas votant:", appState.currentUser.type);
        showMessage("Seuls les comptes votants peuvent voter", "error");
        return;
    }

    console.log("✅ Utilisateur votant validé, préparation du vote");
    appState.pendingVote = {
        packName,
        votes,
        price,
        packType: PACK_BY_NAME[packName]?.type || packName.toLowerCase(),
        timestamp: Date.now()
    };

    console.log("🗳️ Vote en attente défini:", appState.pendingVote);
    showVotePage(packName, votes, price);
}

function showVotePage(packName, votes, price) {
    console.log("📄 showVotePage appelée:", { packName, votes, price });

    updateCandidateSelect();

    const votePage = document.getElementById('votePage');
    const votePageSubtitle = document.getElementById('votePageSubtitle');
    const packDetails = document.getElementById('packDetails');
    const summaryPack = document.getElementById('summaryPack');
    const summaryVotes = document.getElementById('summaryVotes');
    const summaryPrice = document.getElementById('summaryPrice');

    if (votePageSubtitle) {
        votePageSubtitle.textContent = `Vous achetez ${packName} pour ${price} FCFA`;
        console.log("✅ Sous-titre défini");
    }

    if (packDetails) {
        packDetails.innerHTML = `<div style="display: flex; gap: 15px; justify-content: center;"><div><strong>${packName}</strong></div><div>${votes} votes</div><div>${price} FCFA</div></div>`;
        console.log("✅ Détails du pack définis");
    }

    if (summaryPack) summaryPack.textContent = packName;
    if (summaryVotes) summaryVotes.textContent = votes;
    if (summaryPrice) summaryPrice.textContent = price;

    if (votePage) {
        votePage.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log("✅ Page de vote affichée");
    } else {
        console.error("❌ Élément votePage non trouvé");
    }
}

function hideVotePage() {
    const votePage = document.getElementById('votePage');
    if (votePage) votePage.style.display = 'none';
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
    check2027AuthStatus();
    setupRealTimeUpdates();
    setupMobileMenu();
    
    switchEdition(appState.currentEdition);
    createTicketModal();
    
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
            console.log("🔄 Candidats remis aux valeurs par défaut");
        } else {
            appState.candidates = loaded;
        }
        updateCandidateSelect();
    } catch (error) {
        appState.candidates = getDefaultCandidates();
        updateCandidateSelect();
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

// ============================================
// ÉCOUTEURS D'ÉVÉNEMENTS
// ============================================

function setupEventListeners() {
    console.log("🔗 Configuration des événements...");

    // Boutons d'édition
    document.querySelectorAll('.edition-btn').forEach(btn => {
        btn.addEventListener('click', () => switchEdition(btn.dataset.edition));
        console.log("✅ Événement edition-btn attaché");
    });

    // Boutons d'achat de packs
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
        console.log("✅ Événement acheter-pack attaché");
    });

    // Boutons de création de compte
    document.querySelectorAll('.create-account-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log("🆕 Bouton créer compte cliqué:", btn.dataset.role);
            handleCreateAccount(btn.dataset.role);
        });
        console.log("✅ Événement create-account-btn attaché");
    });

    // Boutons de connexion
    document.querySelectorAll('.show-login-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log("🔑 Bouton se connecter cliqué");
            showAuthPage('login');
        });
        console.log("✅ Événement show-login-btn attaché");
    });

    // Boutons de déconnexion
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', handleLogout);
        console.log("✅ Événement logout-btn attaché");
    });

    // Boutons de validation de vote
    const validateVoteBtn = document.getElementById('validateVoteBtn');
    if (validateVoteBtn) {
        validateVoteBtn.addEventListener('click', selectCandidateAndShowTicket);
        console.log("✅ Événement validateVoteBtn attaché");
    }

    // Bouton réinitialiser les candidats
    const resetCandidatesBtn = document.getElementById('resetCandidatesBtn');
    if (resetCandidatesBtn) {
        resetCandidatesBtn.addEventListener('click', resetCandidatesToDefault);
        console.log("✅ Événement resetCandidatesBtn attaché");
    }

    // Boutons d'annulation de vote
    const cancelVoteBtn = document.getElementById('cancelVoteBtn');
    if (cancelVoteBtn) {
        cancelVoteBtn.addEventListener('click', hideVotePage);
        console.log("✅ Événement cancelVoteBtn attaché");
    }

    // Fermeture des pages
    const authPageClose = document.getElementById('authPageClose');
    if (authPageClose) {
        authPageClose.addEventListener('click', hideAuthPage);
        console.log("✅ Événement authPageClose attaché");
    }

    const votePageClose = document.getElementById('votePageClose');
    if (votePageClose) {
        votePageClose.addEventListener('click', hideVotePage);
        console.log("✅ Événement votePageClose attaché");
    }

    // Formulaires
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("📝 Formulaire de connexion soumis");
            handleLogin();
        });
        console.log("✅ Événement loginForm attaché");
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("📝 Formulaire d'inscription soumis");
            handleRegister();
        });
        console.log("✅ Événement registerForm attaché");
    }

    // Onglets d'authentification
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
        console.log("✅ Événement auth-tab attaché");
    });

    // Liens de basculement
    document.querySelectorAll('.switch-to-login').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("🔄 Basculement vers connexion");
            switchAuthTab('login');
        });
        console.log("✅ Événement switch-to-login attaché");
    });

    // Édition 2027
    const btnInscription = document.getElementById('btnInscription2027');
    if (btnInscription) {
        btnInscription.addEventListener('click', showInscriptionForm);
        console.log("✅ Événement btnInscription2027 attaché");
    }

    const btnConnexion = document.getElementById('btnConnexion2027');
    if (btnConnexion) {
        btnConnexion.addEventListener('click', showConnexionForm);
        console.log("✅ Événement btnConnexion2027 attaché");
    }

    const btnAnnulerInscription = document.getElementById('btnAnnulerInscription');
    if (btnAnnulerInscription) {
        btnAnnulerInscription.addEventListener('click', retourBoutons2027);
        console.log("✅ Événement btnAnnulerInscription attaché");
    }

    const btnAnnulerConnexion = document.getElementById('btnAnnulerConnexion');
    if (btnAnnulerConnexion) {
        btnAnnulerConnexion.addEventListener('click', retourBoutons2027);
        console.log("✅ Événement btnAnnulerConnexion attaché");
    }

    const candidatureForm = document.getElementById('candidatureForm2027');
    if (candidatureForm) {
        candidatureForm.addEventListener('submit', handleCandidature2027);
        console.log("✅ Événement candidatureForm2027 attaché");
    }

    const loginForm2027 = document.getElementById('loginForm2027');
    if (loginForm2027) {
        loginForm2027.addEventListener('submit', handleLogin2027);
        console.log("✅ Événement loginForm2027 attaché");
    }

    const logoutBtn2027 = document.getElementById('logout2027Btn');
    if (logoutBtn2027) {
        logoutBtn2027.addEventListener('click', logout2027);
        console.log("✅ Événement logoutBtn2027 attaché");
    }

    console.log("🎉 Tous les événements configurés !");
}

function showMessage(text, type, duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<div class="notification-content">${type === 'success' ? '✅' : '❌'} ${text}</div>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), duration);
}

function switchEdition(edition) {
    appState.currentEdition = edition;
    document.querySelectorAll('.edition-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.edition === edition));
    const edition2027 = document.getElementById('edition-2027');
    const edition2028 = document.getElementById('edition-2028');
    if (edition2027) edition2027.style.display = edition === "2027" ? "block" : "none";
    if (edition2028) edition2028.style.display = edition === "2028" ? "block" : "none";
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

// ============================================
// AUTHENTIFICATION
// ============================================

function checkLoggedInUser() {
    try {
        const savedUser = localStorage.getItem(CONFIG.currentUserKey);
        if (savedUser) {
            appState.currentUser = JSON.parse(savedUser);
            updateUserDisplay();
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
        authPage.style.display = 'block';
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

function hideAuthPage() {
    const authPage = document.getElementById('authPage');
    if (authPage) authPage.style.display = 'none';
    document.body.style.overflow = 'auto';
    const authTabs = document.querySelector('.auth-tabs');
    if (authTabs) authTabs.style.display = 'flex';
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
    console.log("🔑 Tentative de connexion...");
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

        // Pour les votants, faire défiler vers la section des packs de votes
        if (user.type === "VOTANT") {
            console.log("🗳️ Redirection vers les packs de votes pour le votant connecté");
            setTimeout(() => {
                const achatSection = document.getElementById('achat-votes-section');
                if (achatSection) {
                    achatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Mettre en évidence la section
                    achatSection.style.boxShadow = '0 0 20px rgba(30, 58, 138, 0.3)';
                    setTimeout(() => {
                        achatSection.style.boxShadow = '';
                    }, 3000);
                }
            }, 1000);
        }
    } else {
        showMessage("Email ou mot de passe incorrect", "error");
    }
}

function handleRegister() {
    console.log("📝 Tentative d'inscription...");
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

    // Pour les votants, faire défiler vers la section des packs de votes
    if (userType === "VOTANT") {
        console.log("🗳️ Redirection vers les packs de votes pour le votant");
        setTimeout(() => {
            const achatSection = document.getElementById('achat-votes-section');
            if (achatSection) {
                achatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Mettre en évidence la section
                achatSection.style.boxShadow = '0 0 20px rgba(30, 58, 138, 0.3)';
                setTimeout(() => {
                    achatSection.style.boxShadow = '';
                }, 3000);
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

function check2027AuthStatus() {
    const authButtons = document.getElementById('authButtons2027');
    if (authButtons) authButtons.style.display = 'flex';
}

function showInscriptionForm() {
    const form = document.getElementById('formInscription2027');
    const authButtons = document.getElementById('authButtons2027');
    if (form) form.style.display = 'block';
    if (authButtons) authButtons.style.display = 'none';
}

function showConnexionForm() {
    const form = document.getElementById('formConnexion2027');
    const authButtons = document.getElementById('authButtons2027');
    if (form) form.style.display = 'block';
    if (authButtons) authButtons.style.display = 'none';
}

function retourBoutons2027() {
    const authButtons = document.getElementById('authButtons2027');
    if (authButtons) authButtons.style.display = 'flex';
    const formInscription = document.getElementById('formInscription2027');
    const formConnexion = document.getElementById('formConnexion2027');
    if (formInscription) formInscription.style.display = 'none';
    if (formConnexion) formConnexion.style.display = 'none';
}

function handleCandidature2027(event) { event.preventDefault(); showMessage("Candidature enregistrée !", "success"); retourBoutons2027(); }
function handleLogin2027(event) { event.preventDefault(); showMessage("Connexion réussie !", "success"); retourBoutons2027(); }
function logout2027() { showMessage("Déconnexion réussie", "success"); }

window.TicketAPI = TicketAPI;
window.appState = appState;