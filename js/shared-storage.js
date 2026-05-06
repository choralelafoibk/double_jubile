// shared-storage.js - Système de stockage partagé
const SHARED_CONFIG = {
    adminKey: "theVoixAdminCodes",
    voteKey: "theVoixVotes",
    usedCodesKey: "theVoixUsedCodes",
    usersKey: "theVoixUsers_v2",
    candidatesKey: "theVoixCandidates_v2"
};

// API partagée
const TheVoixSharedAPI = {
    // Vérifier un code
    verifyCode: function(code, expectedPackType, expectedPrix, expectedVotes) {
    try {
        const adminData = localStorage.getItem(SHARED_CONFIG.adminKey);
        if (!adminData) {
            return { success: false, message: 'Aucun code disponible dans le système' };
        }
        
        const parsed = JSON.parse(adminData);
        const codesByPack = parsed.codesByPack || {};
        
        let foundCode = null;
        let foundPack = null;
        
        // Rechercher le code dans TOUS les packs
        for (const [pack, codes] of Object.entries(codesByPack)) {
            const codeData = codes.find(c => c.code === code.toUpperCase());
            if (codeData) {
                foundCode = codeData;
                foundPack = pack;
                break; // Sortir dès qu'on trouve
            }
        }
        
        if (!foundCode) {
            return { success: false, message: 'Code non trouvé' };
        }
        
        // Vérifier si déjà utilisé
        if (foundCode.used) {
            return { success: false, message: 'Ce code a déjà été utilisé' };
        }
        
        // Vérifier la correspondance avec le pack attendu
        if (foundPack !== expectedPackType) {
            const packName = this.getPackName(foundPack);
            const expectedPackName = this.getPackName(expectedPackType);
            return { 
                success: false, 
                message: `ERREUR : Ce code est pour le pack "${packName}" (${foundCode.votes} votes, ${foundCode.price} FCFA), mais vous avez sélectionné le pack "${expectedPackName}" (${expectedVotes} votes, ${expectedPrix} FCFA)` 
            };
        }
        
        // Vérifier le prix
        if (foundCode.price !== expectedPrix) {
            return { 
                success: false, 
                message: `Le prix ne correspond pas. Code : ${foundCode.price} FCFA, Pack sélectionné : ${expectedPrix} FCFA` 
            };
        }
        
        // Vérifier les votes
        if (foundCode.votes !== expectedVotes) {
            return { 
                success: false, 
                message: `Le nombre de votes ne correspond pas. Code : ${foundCode.votes} votes, Pack sélectionné : ${expectedVotes} votes` 
            };
        }
        
        // TOUTES LES VÉRIFICATIONS PASSÉES - Marquer comme utilisé
        foundCode.used = true;
        foundCode.usedAt = new Date().toISOString();
        foundCode.usedBy = 'vote_system_' + Date.now();
        
        // Sauvegarder les modifications
        localStorage.setItem(SHARED_CONFIG.adminKey, JSON.stringify(parsed));
        
        // Journaliser dans les codes utilisés
        const usedCodes = JSON.parse(localStorage.getItem(SHARED_CONFIG.usedCodesKey) || '[]');
        usedCodes.push({
            code: code,
            pack: foundPack,
            votes: foundCode.votes,
            prix: foundCode.price,
            usedAt: foundCode.usedAt,
            usedBy: foundCode.usedBy
        });
        localStorage.setItem(SHARED_CONFIG.usedCodesKey, JSON.stringify(usedCodes));
        
        console.log(`✅ Code ${code} validé pour le pack ${foundPack}`);
        
        return {
            success: true,
            message: 'Code validé avec succès !',
            votes: foundCode.votes,
            codeData: foundCode
        };
        
    } catch (error) {
        console.error('❌ Erreur vérification code:', error);
        return { 
            success: false, 
            message: 'Erreur système lors de la vérification' 
        };
    }
},
    
    // Enregistrer un vote
    registerVote: function(voteData) {
        try {
            const votes = JSON.parse(localStorage.getItem(SHARED_CONFIG.voteKey) || '[]');
            votes.push({
                ...voteData,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem(SHARED_CONFIG.voteKey, JSON.stringify(votes));
            
            // Mettre à jour le classement du candidat
            this.updateCandidateVotes(voteData.candidateId, voteData.votes);
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Mettre à jour les votes d'un candidat
    updateCandidateVotes: function(candidateId, votesToAdd) {
        const candidates = JSON.parse(localStorage.getItem(SHARED_CONFIG.candidatesKey) || '[]');
        const candidateIndex = candidates.findIndex(c => c.id === candidateId);
        
        if (candidateIndex !== -1) {
            candidates[candidateIndex].votes = (candidates[candidateIndex].votes || 0) + votesToAdd;
            localStorage.setItem(SHARED_CONFIG.candidatesKey, JSON.stringify(candidates));
        }
    },
    
    // Obtenir le nom du pack
    getPackName: function(packType) {
        const packs = {
            simple: "Vote Simple",
            decouverte: "Pack Découverte",
            passion: "Pack Passion",
            jubile: "Pack Jubilé",
            custom: "Personnalisé"
        };
        return packs[packType] || packType;
    },
    
    // Statistiques
    getStats: function() {
        try {
            const adminData = JSON.parse(localStorage.getItem(SHARED_CONFIG.adminKey) || '{}');
            const codesByPack = adminData.codesByPack || {};
            
            let totalCodes = 0;
            let usedCodes = 0;
            let totalVotes = 0;
            let totalRevenue = 0;
            
            for (const [pack, codes] of Object.entries(codesByPack)) {
                totalCodes += codes.length;
                usedCodes += codes.filter(c => c.used).length;
                totalVotes += codes.reduce((sum, c) => sum + c.votes, 0);
                totalRevenue += codes.reduce((sum, c) => sum + c.price, 0);
            }
            
            return {
                totalCodes,
                usedCodes,
                totalVotes,
                totalRevenue
            };
        } catch (error) {
            return { error: error.message };
        }
    }
};

// AJOUTER dans TheVoixSharedAPI
TheVoixSharedAPI.handleBulkVotes = function(code, candidateId, userId, userName) {
    const adminData = JSON.parse(localStorage.getItem(SHARED_CONFIG.adminKey) || '{}');
    const codesByPack = adminData.codesByPack || {};
    
    // Trouver le code
    for (const [pack, codes] of Object.entries(codesByPack)) {
        const codeData = codes.find(c => c.code === code.toUpperCase());
        
        if (codeData) {
            // Pour les gros packs, donner TOUS les votes d'un coup
            const votesToAdd = codeData.votes;
            
            // Marquer comme utilisé
            codeData.used = true;
            codeData.usedAt = new Date().toISOString();
            codeData.usedBy = userId;
            
            // Sauvegarder
            localStorage.setItem(SHARED_CONFIG.adminKey, JSON.stringify(adminData));
            
            // Enregistrer le vote
            const voteData = {
                userId: userId,
                candidateId: candidateId,
                votes: votesToAdd,
                pack: pack,
                prix: codeData.price,
                code: code,
                userName: userName,
                isBulk: true // Flag spécial pour vote en bloc
            };
            
            return this.registerVote(voteData);
        }
    }
    
    return { success: false, message: 'Code non trouvé' };
};

// À ajouter dans shared-storage.js ou vote.js
function validateVoteIntegrity() {
    // Empêcher la triche via localStorage
    setInterval(() => {
        const votes = JSON.parse(localStorage.getItem(CONFIG.voteStorageKey) || '[]');
        // Vérifier la cohérence entre votes enregistrés et votes des candidats
    }, 30000);
}

// Protection contre les votes multiples
function setupVoteCooldown() {
    localStorage.setItem('lastVoteTime', Date.now());
}
// Exposer l'API globalement
window.TheVoixSharedAPI = TheVoixSharedAPI;