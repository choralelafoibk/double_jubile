// Configuration
const ADMIN_CONFIG = {
    password: "ChoraleLaFOI2028",
    codeLength: 6,
    codeChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    storageKey: "theVoixAdminCodes",
    voteStorageKey: "theVoixVotes",
    usedCodesKey: "theVoixUsedCodes"
};

// ============================================
// VERROUILLAGE APRÈS 5 MINUTES D'INACTIVITÉ
// ============================================

let adminInactivityTimer;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes en millisecondes

// Réinitialiser le timer d'inactivité
function resetAdminInactivityTimer() {
    console.log("🔄 Timer d'inactivité réinitialisé");
    
    // Arrêter le timer existant
    clearTimeout(adminInactivityTimer);
    
    // Démarrer un nouveau timer seulement si l'admin est connecté
    if (adminState.isAuthenticated) {
        adminInactivityTimer = setTimeout(() => {
            console.log("⏰ Timer déclenché - Vérification inactivité...");
            checkAndLockAdmin();
        }, INACTIVITY_TIMEOUT);
    }
}

// Vérifier et verrouiller l'admin
function checkAndLockAdmin() {
    if (adminState.isAuthenticated) {
        console.log("🔒 Verrouillage automatique après 5 minutes d'inactivité");
        
        // Sauvegarder l'état si nécessaire
        saveAdminData();
        
        // Déconnecter
        adminState.isAuthenticated = false;
        
        // Cacher l'interface admin
        document.getElementById('adminInterface').style.display = 'none';
        
        // Afficher la protection par mot de passe
        const passwordProtection = document.getElementById('passwordProtection');
        passwordProtection.style.display = 'block';
        
        // Message d'information
        const messageDiv = document.getElementById('passwordMessage');
        if (messageDiv) {
            messageDiv.className = 'message error show';
            messageDiv.innerHTML = `
                <div style="text-align: center;">
                    <h4 style="margin-bottom: 10px;">🔒 Session expirée</h4>
                    <p>Déconnexion automatique après 5 minutes d'inactivité</p>
                    <p><small>Pour votre sécurité, veuillez vous reconnecter</small></p>
                </div>
            `;
            messageDiv.style.display = 'block';
            
            // Cacher le message après 5 secondes
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
        
        // Réinitialiser le champ mot de passe
        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

// Configurer la surveillance d'activité
function setupAdminActivityMonitoring() {
    console.log("👁️ Surveillance d'activité activée");
    
    // ÉVÉNEMENTS qui réinitialisent le timer (activité utilisateur)
    const activityEvents = [
        'mousemove', 'mousedown', 'click', 'scroll',
        'keypress', 'keydown', 'touchstart', 'touchmove'
    ];
    
    // Ajouter des écouteurs pour tous les événements d'activité
    activityEvents.forEach(event => {
        document.addEventListener(event, resetAdminInactivityTimer, { passive: true });
    });
    
    // Événements de focus (quand l'utilisateur revient sur l'onglet)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && adminState.isAuthenticated) {
            console.log("📱 Utilisateur de retour sur l'onglet");
            resetAdminInactivityTimer();
        }
    });
    
    // Démarrer le timer initial
    resetAdminInactivityTimer();
    
    // Afficher une notification discrète
    showAdminMessage('🔒 Sécurité activée : Verrouillage après 5 minutes d\'inactivité', 'info', 3000);
}

// MODIFIER initializeAdmin() :
function initializeAdmin() {
    checkAdminAuth();
    setupAdminEventListeners();
    
    if (adminState.isAuthenticated) {
        loadAdminData();
        setupAdminActivityMonitoring(); // AJOUTER CETTE LIGNE
    }
}

// MODIFIER handleAdminLogin() pour démarrer la surveillance après connexion :
function handleAdminLogin() {
    const passwordInput = document.getElementById('adminPassword');
    const messageDiv = document.getElementById('passwordMessage');
    
    if (!passwordInput) return;
    
    const password = passwordInput.value.trim();
    
    if (password === ADMIN_CONFIG.password) {
        adminState.isAuthenticated = true;
        
        // NE PAS SAUVEGARDER dans localStorage (pas de session permanente)
        
        showAdminInterface();
        loadAdminData();
        
        // DÉMARRER LA SURVEILLANCE APRÈS CONNEXION
        setupAdminActivityMonitoring();
        
        if (messageDiv) {
            messageDiv.className = 'message success show';
            messageDiv.innerHTML = `
                <div style="text-align: center;">
                    <h4 style="margin-bottom: 10px;">🔓 Connexion réussie</h4>
                    <p>Sécurité activée : Verrouillage après 5 minutes d'inactivité</p>
                </div>
            `;
            messageDiv.style.display = 'block';
            setTimeout(() => messageDiv.style.display = 'none', 3000);
        }
    } else {
        // ... code existant pour erreur ...
    }
}

// MODIFIER logoutAdmin() pour nettoyer le timer :
window.logoutAdmin = function() {
    // Arrêter le timer d'inactivité
    clearTimeout(adminInactivityTimer);
    
    adminState.isAuthenticated = false;
    
    // Nettoyer le localStorage
    localStorage.removeItem('theVoixAdminAuth');
    localStorage.removeItem('theVoixAdminAuthTime');
    
    // Recharger la page pour réinitialiser tout
    location.reload();
};

// État de l'application
let adminState = {
    isAuthenticated: false,
    codesByPack: {
        simple: [],
        decouverte: [],
        passion: [],
        jubile: [],
        custom: []
    },
    usedCodes: [],
    stats: {
        totalCodes: 0,
        totalVotes: 0,
        totalRevenue: 0,
        usedCodes: 0
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    checkAdminAuth();
    setupAdminEventListeners();
    
    if (adminState.isAuthenticated) {
        loadAdminData();
    }
}

// AJOUTER CES FONCTIONS
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (adminState.isAuthenticated) {
        inactivityTimer = setTimeout(logoutAdminForInactivity, 5 * 60 * 1000); // 5 minutes
    }
}

function logoutAdminForInactivity() {
    if (adminState.isAuthenticated) {
        showAdminMessage('Session expirée après 5 minutes d\'inactivité', 'error');
        logoutAdmin();
    }
}

function setupActivityMonitoring() {
    // Redémarrer le timer sur toute interaction
    ['mousemove', 'keypress', 'click', 'scroll'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer);
    });
    
    // Démarrer le timer initial
    resetInactivityTimer();
}

// MODIFIER initializeAdmin() pour inclure :
function initializeAdmin() {
    checkAdminAuth();
    setupAdminEventListeners();
    setupAutoLogout();
    setupActivityMonitoring(); // AJOUTER CETTE LIGNE
    
    if (adminState.isAuthenticated) {
        loadAdminData();
    }
}

function checkAdminAuth() {
    // Toujours montrer la protection par mot de passe
    // Pas de sauvegarde de session dans localStorage
    showPasswordProtection();
}

function showPasswordProtection() {
    document.getElementById('passwordProtection').style.display = 'block';
    document.getElementById('adminInterface').style.display = 'none';
    
    setTimeout(() => {
        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput) passwordInput.focus();
    }, 100);
}

function showAdminInterface() {
    document.getElementById('passwordProtection').style.display = 'none';
    document.getElementById('adminInterface').style.display = 'block';
    updateAdminStats();
}

function setupAdminEventListeners() {
    // Mot de passe
    document.getElementById('submitPassword')?.addEventListener('click', handleAdminLogin);
    document.getElementById('adminPassword')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleAdminLogin();
    });
    
    // Type de code
    document.getElementById('codeType')?.addEventListener('change', function() {
        const isCustom = this.value === 'custom';
        document.getElementById('customVotesGroup').style.display = isCustom ? 'block' : 'none';
        updatePriceByType(this.value);
    });
    
    // Génération de codes
    document.getElementById('generateCodesBtn')?.addEventListener('click', generateCodes);
    
    // Actions
    document.getElementById('exportBtn')?.addEventListener('click', exportToPDF);
    document.getElementById('printBtn')?.addEventListener('click', printCodes);
    document.getElementById('clearBtn')?.addEventListener('click', clearAllCodes);
    document.getElementById('resetVotesBtn')?.addEventListener('click', resetAllCandidatesVotes);
    
    // Fermeture du modal
    document.querySelector('.modal-close')?.addEventListener('click', () => {
        document.getElementById('confirmationModal').classList.remove('active');
    });

    // AJOUTER CET ÉCOUTEUR
    document.getElementById('toggleAdminPassword')?.addEventListener('click', function() {
        const passwordInput = document.getElementById('adminPassword');
        const icon = this.querySelector('i');
    
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    });
}

function setupAutoLogout() {
    // Déconnexion quand l'utilisateur quitte la page
    window.addEventListener('beforeunload', function() {
        if (adminState.isAuthenticated) {
            // Ne rien sauvegarder - déconnexion implicite
        }
    });
    
    // Déconnexion quand la page est cachée (onglet changé)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && adminState.isAuthenticated) {
            // Optionnel : déconnecter quand l'onglet n'est plus actif
            // adminState.isAuthenticated = false;
            // showPasswordProtection();
        }
    });
}

// Appelez cette fonction dans initializeAdmin()
function initializeAdmin() {
    checkAdminAuth();
    setupAdminEventListeners();
    setupAutoLogout(); // <-- AJOUTEZ CETTE LIGNE
    
    if (adminState.isAuthenticated) {
        loadAdminData();
    }
}

function handleAdminLogin() {
    const passwordInput = document.getElementById('adminPassword');
    const messageDiv = document.getElementById('passwordMessage');
    
    if (!passwordInput) return;
    
    const password = passwordInput.value.trim();
    
    if (password === ADMIN_CONFIG.password) {
        adminState.isAuthenticated = true;
        
        // NE PAS SAUVEGARDER dans localStorage
        // localStorage.setItem('theVoixAdminAuth', 'true');
        // localStorage.setItem('theVoixAdminAuthTime', Date.now().toString());
        
        showAdminInterface();
        loadAdminData();
        
        if (messageDiv) {
            messageDiv.className = 'message success show';
            messageDiv.textContent = 'Authentification réussie !';
            messageDiv.style.display = 'block';
            setTimeout(() => messageDiv.style.display = 'none', 3000);
        }
    } else {
        if (messageDiv) {
            messageDiv.className = 'message error show';
            messageDiv.textContent = 'Mot de passe incorrect';
            messageDiv.style.display = 'block';
        }
        
        passwordInput.value = '';
        passwordInput.focus();
        passwordInput.style.borderColor = 'var(--chorale-red)';
        setTimeout(() => passwordInput.style.borderColor = '', 1000);
    }
}

// DÉFINITIONS DES PACKS CORRECTES
const PACKS_CONFIG = {
    simple: { name: "Vote Simple", votes: 1, price: 200 },
    decouverte: { name: "Pack Découverte", votes: 3, price: 500 },
    passion: { name: "Pack Passion", votes: 10, price: 1500 },
    jubile: { name: "Pack Jubilé", votes: 25, price: 3000 },
    custom: { name: "Personnalisé", votes: 1, price: 200 }
};

function updatePriceByType(type) {
    const priceInput = document.getElementById('codePrice');
    const customVotesGroup = document.getElementById('customVotesGroup');
    const customVotesInput = document.getElementById('customVotes');
    
    if (!priceInput) return;
    
    if (type === 'custom') {
        // Pour personnalisé, permettre la modification
        priceInput.value = 200;
        priceInput.disabled = false;
        if (customVotesGroup) customVotesGroup.style.display = 'block';
        if (customVotesInput) customVotesInput.disabled = false;
    } else {
        // Pour les packs standards, fixer les valeurs
        const pack = PACKS_CONFIG[type];
        if (pack) {
            priceInput.value = pack.price;
            priceInput.disabled = true;
            if (customVotesGroup) customVotesGroup.style.display = 'none';
            if (customVotesInput) {
                customVotesInput.value = pack.votes;
                customVotesInput.disabled = true;
            }
        }
    }
}

function generateCodes() {
    if (!adminState.isAuthenticated) {
        showAdminMessage('Connectez-vous d\'abord', 'error');
        return;
    }
    
    const typeSelect = document.getElementById('codeType');
    const quantityInput = document.getElementById('codeQuantity');
    const priceInput = document.getElementById('codePrice');
    const customVotesInput = document.getElementById('customVotes');
    
    if (!typeSelect || !quantityInput || !priceInput) return;
    
    const type = typeSelect.value;
    let votes, price;
    
    // DÉTERMINER LES VALEURS EN FONCTION DU TYPE
    if (type === 'custom') {
        votes = parseInt(customVotesInput?.value) || 1;
        price = parseInt(priceInput.value) || 200;
    } else {
        const pack = PACKS_CONFIG[type];
        votes = pack.votes;
        price = pack.price;
    }
    
    const quantity = parseInt(quantityInput.value) || 10;
    
    if (quantity < 1 || quantity > 100) {
        showAdminMessage('Nombre de codes : 1-100', 'error');
        return;
    }
    
    if (price < 100 || price > 10000) {
        showAdminMessage('Prix : 100-10 000 FCFA', 'error');
        return;
    }
    
    // Générer les codes UNIQUES
    const newCodes = [];
    const existingCodes = getAllExistingCodes();
    
    for (let i = 0; i < quantity; i++) {
        let code;
        let attempts = 0;
        
        // Générer un code unique
        do {
            code = generateRandomCode();
            attempts++;
            if (attempts > 100) {
                showAdminMessage('Erreur : Impossible de générer des codes uniques', 'error');
                return;
            }
        } while (existingCodes.includes(code) || adminState.usedCodes.includes(code));
        
        newCodes.push({
            code: code,
            votes: votes,
            price: price,
            type: type,
            packName: getPackName(type),
            votesPerCode: votes,
            pricePerCode: price,
            generatedAt: new Date().toISOString(),
            used: false,
            usedAt: null,
            usedBy: null
        });

        // AJOUTER CETTE LOGIQUE APRÈS la création des codes :
        if (type === 'passion' || type === 'jubile') {
            console.log(`⚠️ Code pack ${type} : Donne ${votes} votes d'un coup`);
            // Ces codes donneront tous les votes en une seule utilisation
        }
        
        existingCodes.push(code);
    }
    
    // Ajouter au pack correspondant
    if (!adminState.codesByPack[type]) {
        adminState.codesByPack[type] = [];
    }
    adminState.codesByPack[type].push(...newCodes);
    
    // Sauvegarder
    saveAdminData();
    
    // Mettre à jour l'affichage
    displayGeneratedCodes(newCodes, type);
    updateAdminStats();
    
    // Afficher confirmation
    showGenerationConfirmation(newCodes, votes, price, type);
    
    // Réinitialiser le formulaire
    document.getElementById('codeQuantity').value = 10;
}

function getAllExistingCodes() {
    const allCodes = [];
    for (const packType in adminState.codesByPack) {
        adminState.codesByPack[packType].forEach(code => {
            allCodes.push(code.code);
        });
    }
    return allCodes;
}

function generateRandomCode() {
    let code = '';
    for (let i = 0; i < ADMIN_CONFIG.codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * ADMIN_CONFIG.codeChars.length);
        code += ADMIN_CONFIG.codeChars[randomIndex];
    }
    return code;
}

function getPackName(type) {
    return PACKS_CONFIG[type]?.name || type;
}

function displayGeneratedCodes(newCodes, type) {
    const codesList = document.getElementById('codesList');
    if (!codesList) return;
    
    const noCodes = codesList.querySelector('.no-codes');
    if (noCodes) noCodes.remove();
    
    newCodes.forEach(codeData => {
        const codeItem = document.createElement('div');
        codeItem.className = 'code-item';
        codeItem.innerHTML = `
            <div class="code-info">
                <div class="code-value">${codeData.code}</div>
                <div class="code-details">
                    <strong>${getPackName(type)}</strong><br>
                    ${codeData.votes} vote(s) - ${codeData.price} FCFA<br>
                    <small>Généré le ${new Date().toLocaleDateString('fr-FR')}</small>
                </div>
            </div>
            <div class="code-status status-unused">Disponible</div>
        `;
        codesList.prepend(codeItem);
    });
}

function showGenerationConfirmation(codes, votes, price, type) {
    const modal = document.getElementById('confirmationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    modalTitle.textContent = 'Codes générés avec succès !';
    
    const totalRevenue = codes.length * price;
    const totalVotes = codes.length * votes;
    const packName = getPackName(type);
    
    const modalContent = `
        <p><strong>${codes.length} codes</strong> générés pour le pack <strong>${packName}</strong></p>
        
        <div style="background: var(--light); padding: 15px; border-radius: var(--border-radius); margin: 15px 0;">
            <p><i class="fas fa-vote-yea"></i> <strong>${totalVotes} votes</strong> au total</p>
            <p><i class="fas fa-franc-sign"></i> <strong>${totalRevenue} FCFA</strong> de revenus potentiels</p>
            <p><i class="fas fa-money-bill-wave"></i> Prix unitaire : <strong>${price} FCFA</strong></p>
            <p><i class="fas fa-box"></i> Votes par code : <strong>${votes}</strong></p>
        </div>
        
        <h4>Premiers codes générés :</h4>
        <div style="max-height: 150px; overflow-y: auto; background: var(--light); padding: 10px; 
                    border-radius: var(--border-radius); font-family: 'Courier New', monospace; margin: 10px 0;">
            ${codes.slice(0, 5).map(c => `${c.code} (${votes} votes)`).join('<br>')}
            ${codes.length > 5 ? '<br>...' : ''}
        </div>
        
        <div class="warning" style="margin: 15px 0; padding: 10px; background: #FEF3C7; border-radius: 5px; border-left: 4px solid #F59E0B;">
            <i class="fas fa-exclamation-triangle"></i>
            <strong> Important :</strong> Ces codes sont spécifiques au pack <strong>${packName}</strong><br>
            Ils ne peuvent être utilisés que pour ce pack.
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button class="action-btn" onclick="copyAllCodesToClipboard()" style="flex: 1;">
                <i class="fas fa-copy"></i> Copier les codes
            </button>
            <button class="action-btn" onclick="exportToPDF()" style="flex: 1;">
                <i class="fas fa-file-pdf"></i> Exporter PDF
            </button>
        </div>
    `;
    
    modalBody.innerHTML = modalContent;
    modal.classList.add('active');
}

function exportToPDF() {
    if (adminState.stats.totalCodes === 0) {
        showAdminMessage('Aucun code à exporter', 'warning');
        return;
    }
    
    const packTypes = Object.keys(adminState.codesByPack).filter(type => adminState.codesByPack[type].length > 0);
    
    if (packTypes.length === 0) {
        showAdminMessage('Aucun code disponible pour export', 'warning');
        return;
    }
    
    showPackSelectionModal(packTypes);
}

function showPackSelectionModal(packTypes) {
    const modal = document.getElementById('confirmationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    modalTitle.textContent = 'Exporter en PDF';
    
    let optionsHTML = '';
    packTypes.forEach(packType => {
        const packName = getPackName(packType);
        const codeCount = adminState.codesByPack[packType].length;
        const unusedCount = adminState.codesByPack[packType].filter(c => !c.used).length;
        const packConfig = PACKS_CONFIG[packType];
        
        optionsHTML += `
            <div class="pack-option" style="margin: 10px 0; padding: 15px; background: var(--light); border-radius: var(--border-radius); cursor: pointer;"
                 onclick="generatePDFForPack('${packType}')">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${packName}</strong>
                        <div style="font-size: 0.9em; color: var(--gray);">
                            ${codeCount} codes (${unusedCount} disponibles)<br>
                            ${packConfig?.votes || 1} vote(s) - ${packConfig?.price || 200} FCFA par code
                        </div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `;
    });
    
    optionsHTML += `
        <div class="pack-option" style="margin: 10px 0; padding: 15px; background: var(--light); border-radius: var(--border-radius); cursor: pointer;"
             onclick="generatePDFForAllPacks()">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>Tous les packs</strong>
                    <div style="font-size: 0.9em; color: var(--gray);">
                        Toutes les catégories combinées
                    </div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
        </div>
    `;
    
    modalBody.innerHTML = `
        <p>Sélectionnez le pack à exporter :</p>
        ${optionsHTML}
        <button class="action-btn" onclick="document.getElementById('confirmationModal').classList.remove('active')" 
                style="margin-top: 20px; width: 100%;">
            <i class="fas fa-times"></i> Annuler
        </button>
    `;
    
    modal.classList.add('active');
}

function generatePDFForPack(packType) {
    const codes = adminState.codesByPack[packType];
    if (codes.length === 0) {
        showAdminMessage('Aucun code dans ce pack', 'warning');
        return;
    }
    
    const packName = getPackName(packType);
    const packConfig = PACKS_CONFIG[packType];
    const htmlContent = createPDFContentForPack(packType, packName, codes);
    
    const opt = {
        margin: 10,
        filename: `codes_${packName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(htmlContent).set(opt).save();
    document.getElementById('confirmationModal').classList.remove('active');
    showAdminMessage(`PDF "${packName}" généré avec succès`, 'success');
}

function generatePDFForAllPacks() {
    const htmlContent = createPDFContentForAllPacks();
    
    const opt = {
        margin: 10,
        filename: `codes_all_packs_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(htmlContent).set(opt).save();
    document.getElementById('confirmationModal').classList.remove('active');
    showAdminMessage('PDF de tous les packs généré', 'success');
}

function createPDFContentForPack(packType, packName, codes) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');
    const timeStr = now.toLocaleTimeString('fr-FR');
    const packConfig = PACKS_CONFIG[packType];
    
    // Trier les codes par ordre alphabétique
    const sortedCodes = [...codes].sort((a, b) => a.code.localeCompare(b.code));
    const unusedCodes = sortedCodes.filter(c => !c.used);
    
    let content = `
        <html>
        <head>
            <style>
                /* FORMAT A4 STANDARD */
                @page {
                    size: A4;
                    margin: 20mm;
                }
                
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0;
                    padding: 0;
                    font-size: 12px;
                }
                
                /* CONTENEUR PRINCIPAL */
                .container {
                    width: 170mm; /* 210 - 2×20mm */
                    margin: 0 auto;
                    padding: 0;
                }
                
                /* EN-TÊTE SIMPLE */
                .header { 
                    text-align: center; 
                    margin-bottom: 15px;
                    border-bottom: 2px solid #1E3A8A;
                    padding-bottom: 10px;
                }
                
                h1 { 
                    color: #1E3A8A; 
                    margin: 0 0 5px 0;
                    font-size: 22px;
                }
                
                h2 { 
                    color: #EC4899; 
                    margin: 0 0 10px 0;
                    font-size: 18px;
                }
                
                /* INFOS PACK */
                .pack-info {
                    background: #f8fafc;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 15px 0;
                    border: 1px solid #e2e8f0;
                }
                
                /* SECTION DES CODES */
                .codes-section {
                    margin: 20px 0;
                }
                
                .section-title {
                    color: #1E3A8A;
                    font-size: 16px;
                    margin-bottom: 10px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #cbd5e0;
                }
                
                /* TABLEAU DES CODES - FORMAT RECTANGLE */
                .codes-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                
                .codes-table th {
                    background: #1E3A8A;
                    color: white;
                    padding: 10px;
                    text-align: left;
                    font-weight: 600;
                }
                
                .codes-table td {
                    padding: 12px 10px;
                    border-bottom: 1px solid #e2e8f0;
                    vertical-align: middle;
                }
                
                .codes-table tr:nth-child(even) {
                    background: #f8fafc;
                }
                
                .codes-table tr:hover {
                    background: #f0f9ff;
                }
                
                /* STYLE DES CODES */
                .code-cell {
                    font-family: 'Courier New', monospace;
                    font-size: 16px;
                    font-weight: bold;
                    color: #1E3A8A;
                    letter-spacing: 1px;
                }
                
                .number-cell {
                    width: 50px;
                    text-align: center;
                    font-weight: bold;
                    color: #4a5568;
                }
                
                .details-cell {
                    font-size: 13px;
                    color: #4a5568;
                }
                
                .status-cell {
                    width: 100px;
                    text-align: center;
                }
                
                .status-available {
                    color: #38a169;
                    font-weight: 600;
                }
                
                .status-used {
                    color: #e53e3e;
                    font-weight: 600;
                }
                
                /* AVERTISSEMENT */
                .warning {
                    background: #fffaf0;
                    border-left: 4px solid #dd6b20;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 0 5px 5px 0;
                }
                
                /* PIED DE PAGE */
                .footer {
                    margin-top: 40px;
                    padding-top: 15px;
                    border-top: 1px solid #e2e8f0;
                    text-align: center;
                    font-size: 11px;
                    color: #718096;
                }
                
                /* SAUT DE PAGE NATUREL */
                .page-break {
                    page-break-before: always;
                    padding-top: 30px;
                }
                
                /* POUR L'IMPRESSION */
                @media print {
                    body {
                        font-size: 11px;
                    }
                    
                    .codes-table td {
                        padding: 8px 6px;
                    }
                    
                    .code-cell {
                        font-size: 14px;
                    }
                    
                    .container {
                        width: 100%;
                        margin: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- EN-TÊTE -->
                <div class="header">
                    <h1>CODES DE VOTE - THE VOÏX 2028</h1>
                    <h2>${packName.toUpperCase()}</h2>
                    <div style="color: #718096; font-size: 14px;">
                        Exporté le ${dateStr} à ${timeStr}
                    </div>
                </div>
                
                <!-- INFOS PACK -->
                <div class="pack-info">
                    <table style="width: 100%; margin-bottom: 10px;">
                        <tr>
                            <td width="50%" style="vertical-align: top;">
                                <div style="margin-bottom: 5px;"><strong>Pack :</strong> ${packName}</div>
                                <div style="margin-bottom: 5px;"><strong>Votes par code :</strong> ${packConfig?.votes || 1}</div>
                                <div style="margin-bottom: 5px;"><strong>Prix par code :</strong> ${packConfig?.price || 200} FCFA</div>
                            </td>
                            <td width="50%" style="vertical-align: top;">
                                <div style="margin-bottom: 5px;"><strong>Total codes :</strong> ${codes.length}</div>
                                <div style="margin-bottom: 5px;"><strong>Codes disponibles :</strong> ${unusedCodes.length}</div>
                                <div style="margin-bottom: 5px;"><strong>Valeur totale :</strong> ${unusedCodes.reduce((sum, c) => sum + c.price, 0)} FCFA</div>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <!-- AVERTISSEMENT -->
                <div class="warning">
                    <div style="font-weight: bold; color: #dd6b20; margin-bottom: 8px;">⚠️ IMPORTANT</div>
                    <div style="font-size: 13px;">
                        • Chaque code donne droit à <strong>${packConfig?.votes || 1} vote(s)</strong><br>
                        • Saisir le code en <strong>MAJUSCULES</strong><br>
                        • Un code ne peut être utilisé <strong>qu'une seule fois</strong><br>
                        • Ces codes sont spécifiques au pack <strong>${packName}</strong>
                    </div>
                </div>
                
                <!-- CODES DISPONIBLES -->
                <div class="codes-section">
                    <div class="section-title">
                        CODES DISPONIBLES (${unusedCodes.length})
                    </div>
                    
                    ${unusedCodes.length > 0 ? `
                        <table class="codes-table">
                            <thead>
                                <tr>
                                    <th width="50">N°</th>
                                    <th>CODE</th>
                                    <th>DÉTAILS</th>
                                    <th width="100">STATUT</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${unusedCodes.map((code, index) => `
                                    <tr>
                                        <td class="number-cell">${index + 1}</td>
                                        <td class="code-cell">${code.code}</td>
                                        <td class="details-cell">
                                            <strong>${packName}</strong><br>
                                            ${code.votes} vote(s) - ${code.price} FCFA
                                        </td>
                                        <td class="status-cell status-available">● DISPONIBLE</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : `
                        <div style="text-align: center; padding: 40px; color: #a0aec0; font-style: italic;">
                            Aucun code disponible pour ce pack
                        </div>
                    `}
                </div>
                
                <!-- CODES UTILISÉS (si existants) -->
                ${(() => {
                    const usedCodes = sortedCodes.filter(c => c.used);
                    if (usedCodes.length > 0) {
                        return `
                            <div class="page-break"></div>
                            <div class="codes-section">
                                <div class="section-title" style="color: #e53e3e;">
                                    CODES UTILISÉS (${usedCodes.length})
                                </div>
                                <table class="codes-table">
                                    <thead>
                                        <tr>
                                            <th width="50">N°</th>
                                            <th>CODE</th>
                                            <th>DÉTAILS</th>
                                            <th width="100">STATUT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${usedCodes.map((code, index) => `
                                            <tr style="opacity: 0.7;">
                                                <td class="number-cell">${index + 1}</td>
                                                <td class="code-cell" style="text-decoration: line-through; color: #718096;">${code.code}</td>
                                                <td class="details-cell">
                                                    <strong>${packName}</strong><br>
                                                    ${code.votes} vote(s) - ${code.price} FCFA<br>
                                                    <small>Utilisé le ${code.usedAt ? new Date(code.usedAt).toLocaleDateString('fr-FR') : 'N/A'}</small>
                                                </td>
                                                <td class="status-cell status-used">● UTILISÉ</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `;
                    }
                    return '';
                })()}
                
                <!-- PIED DE PAGE -->
                <div class="footer">
                    <div style="margin-bottom: 5px;">
                        © ${new Date().getFullYear()} The Voïx - Concours vocal du Jubilé
                    </div>
                    <div style="font-size: 10px; color: #a0aec0;">
                        Pack : ${packName} | Administrateur : Alex KOUEVI | Tél: +228 79 28 82 09 / +228 91 60 09 45
                    </div>
                    <div style="font-size: 10px; color: #a0aec0; margin-top: 5px;">
                        Document confidentiel - Ne pas diffuser
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return content;
}

function copyAllCodesToClipboard() {
    let codesText = "CODES THE VOÏX 2028\n";
    codesText += "====================\n\n";
    
    for (const [packType, codes] of Object.entries(adminState.codesByPack)) {
        if (codes.length > 0) {
            const packName = getPackName(packType);
            const packConfig = PACKS_CONFIG[packType];
            
            codesText += `${packName.toUpperCase()}:\n`;
            codesText += `${packConfig?.votes || 1} vote(s) - ${packConfig?.price || 200} FCFA par code\n`;
            codesText += "=".repeat(packName.length) + "\n";
            
            codes.forEach(code => {
                const status = code.used ? 'UTILISÉ' : 'DISPONIBLE';
                codesText += `${code.code} | ${code.votes} vote(s) | ${code.price} FCFA | ${status}\n`;
            });
            
            codesText += "\n";
        }
    }
    
    navigator.clipboard.writeText(codesText).then(() => {
        showAdminMessage('Tous les codes copiés !', 'success');
    }).catch(err => {
        console.error('Erreur:', err);
        showAdminMessage('Erreur lors de la copie', 'error');
    });
}

function printCodes() {
    const packTypes = Object.keys(adminState.codesByPack).filter(type => adminState.codesByPack[type].length > 0);
    
    if (packTypes.length === 0) {
        showAdminMessage('Aucun code à imprimer', 'warning');
        return;
    }
    
    const modal = document.getElementById('confirmationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Imprimer les codes';
    
    let optionsHTML = '';
    packTypes.forEach(packType => {
        const packName = getPackName(packType);
        const codeCount = adminState.codesByPack[packType].length;
        const packConfig = PACKS_CONFIG[packType];
        
        optionsHTML += `
            <div class="pack-option" style="margin: 10px 0; padding: 15px; background: var(--light); border-radius: var(--border-radius); cursor: pointer;"
                 onclick="printPack('${packType}')">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${packName}</strong>
                        <div style="font-size: 0.9em; color: var(--gray);">
                            ${codeCount} codes | ${packConfig?.votes || 1} vote(s) - ${packConfig?.price || 200} FCFA
                        </div>
                    </div>
                    <i class="fas fa-print"></i>
                </div>
            </div>
        `;
    });
    
    modalBody.innerHTML = `
        <p>Sélectionnez le pack à imprimer :</p>
        ${optionsHTML}
        <button class="action-btn" onclick="document.getElementById('confirmationModal').classList.remove('active')" 
                style="margin-top: 20px; width: 100%;">
            <i class="fas fa-times"></i> Annuler
        </button>
    `;
    
    modal.classList.add('active');
}

function printPack(packType) {
    const codes = adminState.codesByPack[packType];
    const packName = getPackName(packType);
    const packConfig = PACKS_CONFIG[packType];
    const unusedCodes = codes.filter(c => !c.used);
    
    const printContent = `
        <html>
        <head>
            <title>${packName} - The Voïx 2028</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #1E3A8A; text-align: center; }
                .header { margin-bottom: 20px; text-align: center; }
                .pack-info { background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #1E3A8A; }
                .code-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
                .code-card { border: 2px solid #1E3A8A; padding: 15px; text-align: center; border-radius: 8px; background: #f8fafc; }
                .code-value { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #1E3A8A; letter-spacing: 1px; }
                .code-details { font-size: 12px; color: #4b5563; margin-top: 8px; }
                .footer { margin-top: 40px; font-size: 11px; color: #6b7280; text-align: center; }
                .warning { background: #fef3c7; padding: 10px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #F59E0B; }
                @media print {
                    .code-card { break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${packName.toUpperCase()}</h1>
                <p>The Voïx 2028 - Codes de vote spécifiques</p>
                <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            
            <div class="pack-info">
                <p><strong>Configuration du pack :</strong></p>
                <p>• Votes par code : <strong>${packConfig?.votes || 1}</strong></p>
                <p>• Prix par code : <strong>${packConfig?.price || 200} FCFA</strong></p>
                <p>• Codes disponibles : <strong>${unusedCodes.length}</strong></p>
                <p>• Valeur totale : <strong>${codes.reduce((sum, c) => sum + c.price, 0)} FCFA</strong></p>
            </div>
            
            <div class="warning">
                <strong>ATTENTION :</strong> Ces codes sont spécifiques au pack <strong>${packName}</strong><br>
                Ils ne peuvent être utilisés que pour ce pack (${packConfig?.votes || 1} vote(s) - ${packConfig?.price || 200} FCFA).
            </div>
            
            <div class="code-grid">
    ${unusedCodes.map((code, index) => `
        <div class="code-card">
            <div style="position: absolute; top: 5px; left: 5px; background: #1E3A8A; color: white; width: 20px; height: 20px; border-radius: 50%; font-size: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                ${index + 1}
            </div>
            <div class="code-value">${code.code}</div>
            <div class="code-details">
                <strong>${packName}</strong><br>
                ${code.votes} VOTE(S)<br>
                ${code.price} FCFA
            </div>
        </div>
    `).join('')}
</div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} The Voïx - Concours vocal du Jubilé</p>
                <p>www.thevoix.com | Contact: +228 79 28 82 09</p>
                <p>Code confidentiel - Spécifique au pack ${packName} - À utiliser une seule fois</p>
            </div>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
    
    document.getElementById('confirmationModal').classList.remove('active');
}

function clearAllCodes() {
    if (adminState.stats.totalCodes === 0) {
        showAdminMessage('Aucun code à effacer', 'warning');
        return;
    }
    
    if (confirm('Effacer TOUS les codes de TOUS les packs ? Cette action est irréversible.')) {
        adminState.codesByPack = {
            simple: [], decouverte: [], passion: [], jubile: [], custom: []
        };
        adminState.usedCodes = [];
        saveAdminData();
        updateAdminStats();
        
        const codesList = document.getElementById('codesList');
        if (codesList) {
            codesList.innerHTML = '<div class="no-codes">Aucun code généré</div>';
        }
        
        showAdminMessage('Tous les codes ont été effacés', 'success');
    }
}

function resetAllCandidatesVotes() {
    if (confirm('Remettre à zéro les votes de TOUS les candidats ? Cette action est irréversible.')) {
        try {
            // Réinitialiser les votes des candidats
            const candidatesKey = "theVoixCandidates_v2";
            const candidates = JSON.parse(localStorage.getItem(candidatesKey) || '[]');
            
            if (candidates.length === 0) {
                showAdminMessage('Aucun candidat trouvé', 'warning');
                return;
            }
            
            // Remettre tous les votes à zéro
            candidates.forEach(candidate => {
                candidate.votes = 0;
            });
            
            // Sauvegarder les candidats avec votes à zéro
            localStorage.setItem(candidatesKey, JSON.stringify(candidates));
            
            // Effacer aussi l'historique des votes
            const votesKey = "theVoixVotes";
            localStorage.setItem(votesKey, JSON.stringify([]));
            
            // Marquer tous les codes comme non utilisés
            for (const packType in adminState.codesByPack) {
                adminState.codesByPack[packType].forEach(code => {
                    code.used = false;
                    code.usedAt = null;
                    code.usedBy = null;
                    code.usedForCandidate = null;
                });
            }
            
            // Sauvegarder les données admin
            saveAdminData();
            
            // Mettre à jour les statistiques
            updateAdminStats();
            
            showAdminMessage(`Votes remis à zéro pour ${candidates.length} candidat(s)`, 'success');
            
        } catch (error) {
            console.error('Erreur lors de la réinitialisation:', error);
            showAdminMessage('Erreur lors de la réinitialisation', 'error');
        }
    }
}

function loadAdminData() {
    try {
        const savedData = localStorage.getItem(ADMIN_CONFIG.storageKey);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            adminState.codesByPack = parsed.codesByPack || {
                simple: [], decouverte: [], passion: [], jubile: [], custom: []
            };
            
            const usedCodesData = localStorage.getItem(ADMIN_CONFIG.usedCodesKey);
            if (usedCodesData) {
                adminState.usedCodes = JSON.parse(usedCodesData);
            }
            
            syncWithVoteData();
            updateCodesDisplay();
            updateAdminStats();
        }
    } catch (e) {
        console.error('Erreur:', e);
        showAdminMessage('Erreur de chargement', 'error');
    }
}

// Dans admin.js - Assurez-vous que cette fonction existe et est correcte
function saveAdminData() {
    console.log("💾 Sauvegarde des données admin...");
    
    try {
        const dataToSave = {
            codesByPack: adminState.codesByPack,
            lastUpdate: new Date().toISOString(),
            totalStats: adminState.stats,
            version: "3.0"
        };
        
        // UTILISER LA BONNE CLÉ - doit correspondre avec vote.js
        localStorage.setItem('theVoixAdminCodes', JSON.stringify(dataToSave));
        
        console.log("✅ Données sauvegardées avec succès");
        
        // Mettre à jour l'affichage
        setTimeout(() => {
            updateCodesDisplay();
            updateAdminStats();
        }, 100);
        
    } catch (e) {
        console.error("❌ Erreur sauvegarde:", e);
        showAdminMessage('Erreur lors de la sauvegarde', 'error');
    }
}

// MODIFIER loadAdminData() aussi :
function loadAdminData() {
    try {
        const savedData = localStorage.getItem(SHARED_CONFIG.adminKey);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            adminState.codesByPack = parsed.codesByPack || {
                simple: [], decouverte: [], passion: [], jubile: [], custom: []
            };
            
            updateCodesDisplay();
            updateAdminStats();
        }
    } catch (e) {
        console.error('Erreur:', e);
        showAdminMessage('Erreur de chargement', 'error');
    }
}

function syncWithVoteData() {
    try {
        const voteData = localStorage.getItem(ADMIN_CONFIG.voteStorageKey);
        if (voteData) {
            const parsedVoteData = JSON.parse(voteData);
            // Les données de vote sont sauvegardées directement comme un tableau dans vote.js
            const usedCodes = Array.isArray(parsedVoteData) ? parsedVoteData : (parsedVoteData.votesHistory || []);
            
            usedCodes.forEach(vote => {
                if (vote.ticketCode && !adminState.usedCodes.includes(vote.ticketCode)) {
                    adminState.usedCodes.push(vote.ticketCode);
                    
                    for (const [packType, codes] of Object.entries(adminState.codesByPack)) {
                        const codeIndex = codes.findIndex(c => c.code === vote.ticketCode);
                        if (codeIndex !== -1) {
                            adminState.codesByPack[packType][codeIndex].used = true;
                            adminState.codesByPack[packType][codeIndex].usedAt = vote.timestamp || new Date().toISOString();
                            adminState.codesByPack[packType][codeIndex].usedBy = vote.userId || 'Inconnu';
                            adminState.codesByPack[packType][codeIndex].usedForCandidate = vote.candidateId || null;
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.error('Erreur sync:', e);
    }
}

function updateAdminStats() {
    try {
        let totalCodes = 0;
        let totalVotes = 0;
        let totalRevenue = 0;
        let usedCodes = 0;
        
        for (const codes of Object.values(adminState.codesByPack)) {
            totalCodes += codes.length;
            totalVotes += codes.reduce((sum, code) => sum + code.votes, 0);
            totalRevenue += codes.reduce((sum, code) => sum + code.price, 0);
            usedCodes += codes.filter(code => code.used).length;
        }
        
        adminState.stats = { totalCodes, totalVotes, totalRevenue, usedCodes };
        
        document.getElementById('totalCodes').textContent = totalCodes;
        document.getElementById('totalVotes').textContent = totalVotes;
        document.getElementById('totalRevenue').textContent = totalRevenue;
        document.getElementById('usedCodes').textContent = usedCodes;
        
    } catch (e) {
        console.error('Erreur stats:', e);
    }
}

function updateCodesDisplay() {
    const codesList = document.getElementById('codesList');
    if (!codesList) return;
    
    // Réinitialiser complètement
    codesList.innerHTML = '';
    
    let hasCodes = false;
    let totalCodes = 0;
    
    // Parcourir tous les packs
    for (const [packType, codes] of Object.entries(adminState.codesByPack)) {
        if (codes && codes.length > 0) {
            hasCodes = true;
            totalCodes += codes.length;
            
            const packName = getPackName(packType);
            const packConfig = PACKS_CONFIG[packType];
            
            // Créer l'en-tête du pack
            const packHeader = document.createElement('div');
            packHeader.className = 'pack-header';
            packHeader.style.background = 'var(--rita-blue)';
            packHeader.style.color = 'white';
            packHeader.style.padding = '15px';
            packHeader.style.borderRadius = '5px';
            packHeader.style.margin = '15px 0 10px 0';
            packHeader.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${packName}</strong>
                        <div style="font-size: 0.9em; opacity: 0.9;">
                            ${codes.length} code(s) | ${packConfig?.votes || 1} vote(s) - ${packConfig?.price || 200} FCFA
                        </div>
                    </div>
                    <div style="font-size: 0.9em;">
                        <span style="background: var(--chorale-yellow); color: var(--rita-blue); padding: 3px 8px; border-radius: 10px; font-weight: bold;">
                            ${codes.filter(c => !c.used).length} disponible(s)
                        </span>
                    </div>
                </div>
            `;
            
            codesList.appendChild(packHeader);
            
            // Trier les codes par date (plus récents en premier)
            const sortedCodes = [...codes].sort((a, b) => 
                new Date(b.generatedAt) - new Date(a.generatedAt)
            );
            
            // Afficher TOUS les codes
            sortedCodes.forEach(codeData => {
                const codeItem = document.createElement('div');
                codeItem.className = 'code-item';
                codeItem.style.opacity = codeData.used ? '0.6' : '1';
                codeItem.style.marginBottom = '5px';
    
                codeItem.innerHTML = `
                    <div class="code-info" style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="code-value" style="font-family: 'Courier New', monospace; font-size: 1.2rem; font-weight: 700; letter-spacing: 1px; color: var(--rita-blue); background: var(--light); padding: 5px 10px; border-radius: 5px;">
                                ${codeData.code}
                            </div>
                        </div>
                        <div class="code-details" style="color: var(--gray); font-size: 0.9rem;">
                            <div><strong>${packName}</strong></div>
                            <div>${codeData.votes} vote(s) - ${codeData.price} FCFA</div>
                            <div style="font-size: 0.8em;">
                                Généré le ${new Date(codeData.generatedAt).toLocaleDateString('fr-FR')}
                                ${codeData.used ? `<br>Utilisé le ${codeData.usedAt ? new Date(codeData.usedAt).toLocaleDateString('fr-FR') : 'N/A'}` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="code-status ${codeData.used ? 'status-used' : 'status-unused'}" style="padding: 5px 10px; border-radius: 15px; font-size: 0.85rem; font-weight: 600;">
                        ${codeData.used ? 'Utilisé' : 'Disponible'}
                    </div>
                `;
    
                codesList.appendChild(codeItem);
            });
            
            // Ajouter un séparateur entre les packs
            const separator = document.createElement('div');
            separator.style.height = '2px';
            separator.style.background = 'var(--light)';
            separator.style.margin = '20px 0';
            codesList.appendChild(separator);
        }
    }
    
    // Si aucun code, afficher un message
    if (!hasCodes) {
        codesList.innerHTML = `
            <div class="no-codes" style="text-align: center; padding: 40px; color: var(--gray);">
                <i class="fas fa-key" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                <h3 style="margin-bottom: 10px;">Aucun code généré</h3>
                <p>Utilisez le formulaire ci-dessus pour générer vos premiers codes.</p>
            </div>
        `;
    }
    
    console.log(`📊 ${totalCodes} codes affichés`);
}

function showAdminMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type} show`;
    messageDiv.textContent = text;
    messageDiv.style.margin = '10px 0';
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '5px';
    
    const adminContent = document.querySelector('.admin-content');
    if (adminContent) {
        adminContent.insertBefore(messageDiv, adminContent.firstChild);
        setTimeout(() => messageDiv.remove(), 5000);
    }
}

// Fonctions globales
window.TheVoixAdmin = {
    generateSingleCode: function(votes = 1, price = 200, packType = 'simple') {
        if (!adminState.isAuthenticated) {
            return 'Veuillez vous connecter d\'abord';
        }
        
        let code;
        let attempts = 0;
        const existingCodes = getAllExistingCodes();
        
        do {
            code = generateRandomCode();
            attempts++;
            if (attempts > 100) {
                return 'Erreur : Impossible de générer un code unique';
            }
        } while (existingCodes.includes(code) || adminState.usedCodes.includes(code));
        
        const codeData = {
            code: code,
            votes: votes,
            price: price,
            type: packType,
            packName: getPackName(packType),
            votesPerCode: votes,
            pricePerCode: price,
            generatedAt: new Date().toISOString(),
            used: false,
            usedAt: null,
            usedBy: null
        };
        
        if (!adminState.codesByPack[packType]) {
            adminState.codesByPack[packType] = [];
        }
        adminState.codesByPack[packType].push(codeData);
        
        saveAdminData();
        updateAdminStats();
        updateCodesDisplay();
        
        showAdminMessage(`Code généré : ${code} (${votes} vote(s) - ${price} FCFA - ${getPackName(packType)})`, 'success');
        return code;
    },
    
    checkCodeStatus: function(code) {
        for (const [packType, codes] of Object.entries(adminState.codesByPack)) {
            const codeData = codes.find(c => c.code === code.toUpperCase());
            if (codeData) {
                return {
                    ...codeData,
                    packName: getPackName(packType),
                    packConfig: PACKS_CONFIG[packType],
                    canBeUsed: !codeData.used && !adminState.usedCodes.includes(code.toUpperCase())
                };
            }
        }
        
        return { error: 'Code non trouvé', canBeUsed: false };
    },
    
    useCode: function(code, userId = 'System') {
        const codeStatus = this.checkCodeStatus(code);
        
        if (codeStatus.error) {
            return { success: false, message: 'Code invalide' };
        }
        
        if (!codeStatus.canBeUsed) {
            return { success: false, message: 'Code déjà utilisé' };
        }
        
        codeStatus.used = true;
        codeStatus.usedAt = new Date().toISOString();
        codeStatus.usedBy = userId;
        
        if (!adminState.usedCodes.includes(code.toUpperCase())) {
            adminState.usedCodes.push(code.toUpperCase());
        }
        
        for (const [packType, codes] of Object.entries(adminState.codesByPack)) {
            const codeIndex = codes.findIndex(c => c.code === code.toUpperCase());
            if (codeIndex !== -1) {
                adminState.codesByPack[packType][codeIndex] = codeStatus;
                break;
            }
        }
        
        saveAdminData();
        updateAdminStats();
        updateCodesDisplay();
        
        return { 
            success: true, 
            message: 'Code utilisé avec succès',
            votes: codeStatus.votes,
            price: codeStatus.price,
            packType: codeStatus.type,
            packName: codeStatus.packName
        };
    },
    
    getStats: function() {
        return adminState.stats;
    },
    
    getPackStats: function(packType) {
        const codes = adminState.codesByPack[packType] || [];
        return {
            total: codes.length,
            available: codes.filter(c => !c.used).length,
            used: codes.filter(c => c.used).length,
            revenue: codes.reduce((sum, c) => sum + c.price, 0),
            votes: codes.reduce((sum, c) => sum + c.votes, 0),
            packName: getPackName(packType),
            packConfig: PACKS_CONFIG[packType]
        };
    },
    
    logout: function() {
        localStorage.removeItem('theVoixAdminAuth');
        localStorage.removeItem('theVoixAdminAuthTime');
        location.reload();
    },
    
    generateTestCodes: function() {
        if (!adminState.isAuthenticated) {
            return 'Veuillez vous connecter d\'abord';
        }
        
        const testPacks = [
            { type: 'simple', votes: 1, price: 200, count: 5 },
            { type: 'decouverte', votes: 3, price: 500, count: 4 },
            { type: 'passion', votes: 10, price: 1500, count: 3 },
            { type: 'jubile', votes: 25, price: 3000, count: 2 }
        ];
        
        testPacks.forEach(pack => {
            for (let i = 0; i < pack.count; i++) {
                this.generateSingleCode(pack.votes, pack.price, pack.type);
            }
        });
        
        return 'Codes de test générés';
    }
};

// Fonction pour vérifier un code depuis la page de vote
function verifyCodeFromVote(code, userId, expectedPackType, expectedPrix, expectedVotes) {
    const result = TheVoixAdmin.checkCodeStatus(code);
    
    if (result.error || !result.canBeUsed) {
        return { 
            success: false, 
            message: result.error || 'Code déjà utilisé ou invalide' 
        };
    }
    
    // Vérifier que le code correspond au pack attendu
    if (result.type !== expectedPackType) {
        return { 
            success: false, 
            message: `Ce code est pour le pack ${result.packName}, mais vous avez acheté le pack ${getPackName(expectedPackType)}` 
        };
    }
    
    // Vérifier le prix
    if (result.price !== expectedPrix) {
        return { 
            success: false, 
            message: `Ce code vaut ${result.price} FCFA, mais votre pack vaut ${expectedPrix} FCFA` 
        };
    }
    
    // Vérifier le nombre de votes
    if (result.votes !== expectedVotes) {
        return { 
            success: false, 
            message: `Ce code donne ${result.votes} vote(s), mais votre pack donne ${expectedVotes} vote(s)` 
        };
    }
    
    // Utiliser le code
    return TheVoixAdmin.useCode(code, userId);
}

// Fonction pour récupérer les statistiques publiques
function getPublicStats() {
    return {
        totalVotes: adminState.stats.totalVotes,
        usedVotes: adminState.stats.usedCodes,
        availableVotes: adminState.stats.totalCodes - adminState.stats.usedCodes,
        revenue: adminState.stats.totalRevenue
    };
}

// Dans la section de l'API, ajoutez :
window.TheVoixAdminAPI = {
    verifyCode: verifyCodeFromVote,
    getStats: getPublicStats,
    generateCode: function(votes, price, packType) {
        return TheVoixAdmin.generateSingleCode(votes, price, packType);
    },
    
    // Nouvelle fonction pour vérifier la compatibilité d'un code avec un pack
    verifyCodeForPack: function(code, packType, prix, votes) {
        return verifyCodeFromVote(code, 'system', packType, prix, votes);
    }
};

// Dans la section des fonctions globales, ajoutez :
window.logoutAdmin = function() {
    adminState.isAuthenticated = false;
    
    // Nettoyer le localStorage si des données y sont restées
    localStorage.removeItem('theVoixAdminAuth');
    localStorage.removeItem('theVoixAdminAuthTime');
    
    // Recharger la page pour réinitialiser tout
    location.reload();
};

// Et ajoutez un bouton de déconnexion dans admin.html (optionnel)
// Ajoutez dans le header, après le subtitle :


function forceRefreshDisplay() {
    updateCodesDisplay();
    updateAdminStats();
    
    // Forcer le reflow
    const codesList = document.getElementById('codesList');
    if (codesList) {
        codesList.style.display = 'none';
        codesList.offsetHeight; // Force reflow
        codesList.style.display = 'block';
    }
    
    showAdminMessage('Affichage actualisé', 'success');
}

function fixDisplayIssues() {
    console.log("🔧 Réparation de l'affichage...");
    
    // 1. Forcer le rechargement des données
    loadAdminData();
    
    // 2. Vider complètement le conteneur
    const codesList = document.getElementById('codesList');
    if (codesList) {
        codesList.innerHTML = '';
        
        // 3. Forcer un reflow
        codesList.style.display = 'none';
        setTimeout(() => {
            codesList.style.display = 'block';
            
            // 4. Re-afficher les codes
            updateCodesDisplay();
            
            // 5. Forcer un scroll pour tout afficher
            setTimeout(() => {
                codesList.scrollTop = 0;
            }, 100);
            
        }, 100);
    }
    
    // 6. Mettre à jour les statistiques
    updateAdminStats();
    
    showAdminMessage("Affichage réparé", "success");
}

// Ajoutez à la fin de admin.js
function diagnoseDisplayProblem() {
    console.log("🔍 Diagnostic de l'affichage...");
    
    // 1. Vérifier les données dans localStorage
    const adminData = localStorage.getItem(ADMIN_CONFIG.storageKey);
    console.log("Données brutes dans localStorage:", adminData ? "PRÉSENTES" : "ABSENTES");
    
    if (adminData) {
        try {
            const parsed = JSON.parse(adminData);
            console.log("Structure des données:", parsed);
            
            if (parsed.codesByPack) {
                let totalCodes = 0;
                for (const [pack, codes] of Object.entries(parsed.codesByPack)) {
                    console.log(`Pack ${pack}: ${codes.length} codes`);
                    totalCodes += codes.length;
                }
                console.log(`Total: ${totalCodes} codes`);
            } else {
                console.error("❌ Structure codesByPack manquante!");
            }
        } catch (e) {
            console.error("❌ Erreur parsing:", e);
        }
    }
    
    // 2. Vérifier l'état dans adminState
    console.log("État adminState:", adminState);
    
    // 3. Vérifier le DOM
    const codesList = document.getElementById('codesList');
    console.log("Élément codesList:", codesList ? "TROUVÉ" : "NON TROUVÉ");
    
    if (codesList) {
        console.log("Nombre d'enfants:", codesList.children.length);
        console.log("HTML interne:", codesList.innerHTML.length, "caractères");
    }
    
    // 4. Forcer le rafraîchissement
    console.log("Forçage du rafraîchissement...");
    loadAdminData();
    updateCodesDisplay();
    updateAdminStats();
    
    showAdminMessage("Diagnostic terminé - Voir la console", "info");
}

// Redémarrer le timer sur les interactions
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);

// Exposez la fonction
window.diagnoseDisplayProblem = diagnoseDisplayProblem;

// Exposez la fonction
window.fixDisplayIssues = fixDisplayIssues;
// Exposez la fonction
window.forceRefreshDisplay = forceRefreshDisplay;

// ============================================
// API PUBLIQUE POUR vote.js
// ============================================

// Exposer les fonctions pour le système de vote
window.TheVoixAdminAPI = {
    // Vérifier un ticket
    verifyTicket: function(code, packType, expectedPrice, expectedVotes) {
        try {
            const adminData = localStorage.getItem('theVoixAdminCodes');
            if (!adminData) {
                return { valid: false, error: "Aucun ticket disponible" };
            }
            
            const data = JSON.parse(adminData);
            const codesByPack = data.codesByPack || {};
            
            let foundCode = null;
            let foundPackType = null;
            
            for (const [type, codes] of Object.entries(codesByPack)) {
                const codeData = codes.find(c => c.code === code);
                if (codeData) {
                    foundCode = codeData;
                    foundPackType = type;
                    break;
                }
            }
            
            if (!foundCode) {
                return { valid: false, error: "Code ticket invalide" };
            }
            
            if (foundCode.used === true) {
                return { valid: false, error: "Ce code a déjà été utilisé" };
            }
            
            // Mapping des noms de packs
            const packMapping = {
                "Vote Simple": "simple",
                "Pack Découverte": "decouverte",
                "Pack Passion": "passion",
                "Pack Jubilé": "jubile"
            };
            
            const expectedType = packMapping[packType] || packType;
            
            if (foundPackType !== expectedType) {
                const packNames = {
                    simple: "Vote Simple",
                    decouverte: "Pack Découverte",
                    passion: "Pack Passion",
                    jubile: "Pack Jubilé"
                };
                return { valid: false, error: `Ce ticket est pour le pack "${packNames[foundPackType]}"` };
            }
            
            if (foundCode.price !== expectedPrice) {
                return { valid: false, error: `Ce ticket vaut ${foundCode.price} FCFA` };
            }
            
            if (foundCode.votes !== expectedVotes) {
                return { valid: false, error: `Ce ticket donne ${foundCode.votes} vote(s)` };
            }
            
            return {
                valid: true,
                codeData: foundCode,
                votes: foundCode.votes,
                price: foundCode.price
            };
            
        } catch (error) {
            console.error("Erreur vérification:", error);
            return { valid: false, error: "Erreur système" };
        }
    },
    
    // Utiliser un ticket
    useTicket: function(code, userId, candidateId) {
        try {
            const adminData = localStorage.getItem('theVoixAdminCodes');
            if (!adminData) {
                return { success: false };
            }
            
            let data = JSON.parse(adminData);
            let found = false;
            let ticketData = null;
            
            for (const [type, codes] of Object.entries(data.codesByPack)) {
                const codeIndex = codes.findIndex(c => c.code === code);
                if (codeIndex !== -1 && !codes[codeIndex].used) {
                    codes[codeIndex].used = true;
                    codes[codeIndex].usedAt = new Date().toISOString();
                    codes[codeIndex].usedBy = userId;
                    codes[codeIndex].usedForCandidate = candidateId;
                    ticketData = codes[codeIndex];
                    found = true;
                    break;
                }
            }
            
            if (found) {
                localStorage.setItem('theVoixAdminCodes', JSON.stringify(data));
                return { success: true, votes: ticketData.votes, price: ticketData.price };
            }
            
            return { success: false };
            
        } catch (error) {
            console.error("Erreur utilisation:", error);
            return { success: false };
        }
    },
    
    // Obtenir les statistiques
    getStats: function() {
        return adminState.stats;
    }
};

console.log("✅ Admin API exposée pour le système de tickets");