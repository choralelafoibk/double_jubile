// ============================================
// GALERIE.JS - Page galerie du Jubilé
// ============================================

// Données des médias
const mediaData = {
    "1": {
        type: 'photo',
        title: 'Première répétition',
        date: '2003-09-15',
        displayDate: '15 Septembre 2003',
        description: 'La toute première répétition de la Chorale La Foi avec les 12 membres fondateurs dans la salle paroissiale de Sainte Rita.',
        likes: 45,
        image: 'https://placehold.co/800x600/0a1f44/white?text=Première+répétition+2003',
        tags: ['historique', 'fondation'],
        author: 'Archives Chorale',
        category: 'historique'
    },
    "2": {
        type: 'photo',
        title: 'Concert de Noël 2010',
        date: '2010-12-24',
        displayDate: '24 Décembre 2010',
        description: 'Premier concert de Noël après la sortie de notre premier album "Louange". Une soirée mémorable avec plus de 200 personnes.',
        likes: 89,
        image: 'https://placehold.co/800x600/e83e8c/white?text=Concert+Noël+2010',
        tags: ['concert', 'noël', 'album'],
        author: 'Jean Kodjo',
        category: 'concerts'
    },
    "3": {
        type: 'photo',
        title: 'Tournoi amical 2018',
        date: '2018-05-20',
        displayDate: '20 Mai 2018',
        description: 'Premier tournoi de football entre les pupitres de la chorale. Les ténors ont remporté la coupe cette année-là !',
        likes: 67,
        image: 'https://placehold.co/800x600/28a745/white?text=Tournoi+2018',
        tags: ['football', 'tournoi', 'communauté'],
        author: 'Commission Sport',
        category: 'football'
    },
    "4": {
        type: 'photo',
        title: 'Alex KOUEVI - Maître de chant',
        date: '2015-06-10',
        displayDate: '10 Juin 2015',
        description: 'Portrait officiel après la victoire au Concours National de Chant Sacré. Un moment de fierté pour toute la chorale.',
        likes: 102,
        image: 'https://placehold.co/800x600/ffc107/white?text=Alex+Kouevi',
        tags: ['portrait', 'direction', 'récompense'],
        author: 'Studio Photo Pro',
        category: 'portraits'
    },
    "9": {
        type: 'photo',
        title: 'The Voïx - Édition 2027',
        date: '2027-07-15',
        displayDate: 'Juillet 2027',
        description: 'Concours vocal gratuit. Présélections en ligne, finale intégrée au concert de septembre. Inscriptions ouvertes à partir de mai 2026.',
        likes: 0,
        image: 'https://placehold.co/800x600/6f42c1/white?text=The+Voïx+2027',
        tags: ['the-voix', 'concours', 'musique', 'à venir'],
        author: 'Comité Jubilé',
        category: 'the-voix',
        futureEvent: true
    },
    "12": {
        type: 'photo',
        title: 'Miss Bè-Kpota 2028',
        date: '2028-03-10',
        displayDate: '10 Mars 2028',
        description: 'Première édition du concours célébrant la beauté, l\'intelligence et le leadership des jeunes filles de la paroisse.',
        likes: 0,
        image: 'https://placehold.co/800x600/ffc107/white?text=Miss+Bè-Kpota+2028',
        tags: ['miss', 'concours', 'culture', 'à venir'],
        author: 'Comité Jubilé',
        category: 'miss-be-kpota',
        futureEvent: true
    },
    "13": {
        type: 'photo',
        title: 'Semaine du Jubilé',
        date: '2028-09-23',
        displayDate: '23-29 Septembre 2028',
        description: '7 jours exceptionnels : conférences, célébrations, répétitions solennelles et Mega Concert Anniversaire.',
        likes: 0,
        image: 'https://placehold.co/800x600/0a1f44/white?text=Semaine+Jubilé+2028',
        tags: ['semaine', 'jubilé', 'célébration', 'à venir'],
        author: 'Comité Jubilé',
        category: 'evenements',
        futureEvent: true
    }
};

// Données des vidéos
const videoData = {
    'concert-noel-2022': {
        type: 'video',
        title: 'Concert de Noël 2022',
        date: '2022-12-24',
        displayDate: '24 Décembre 2022',
        description: 'Extrait du concert complet disponible sur notre chaîne YouTube. Chants traditionnels et créations originales.',
        likes: 123,
        videoId: 'dQw4w9WgXcQ',
        tags: ['vidéo', 'concert', 'noël'],
        author: 'Chorale La Foi',
        category: 'videos'
    }
};

// Variables globales
let currentMediaIndex = 0;
let currentMediaType = 'photo';
let currentMediaId = null;
let currentMediaItems = [];
let allMediaItems = [];

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📸 Initialisation de la galerie (Mars 2026)...');
    
    initStats();
    initFiltres();
    initLightbox();
    initUploadModal();
    initLoadMore();
    initAnimations();
    initFooterFilters();
    
    console.log('✅ Galerie initialisée avec succès');
});

// ============================================
// STATISTIQUES HERO
// ============================================

function initStats() {
    const photoItems = document.querySelectorAll('.galerie-item:not(.videos)').length;
    const videoItems = document.querySelectorAll('.galerie-item.videos').length;
    const albumItems = document.querySelectorAll('.album-card').length;
    
    const photoCount = document.getElementById('photoCount');
    const videoCount = document.getElementById('videoCount');
    const albumCount = document.getElementById('albumCount');
    
    if (photoCount) animateCounter(photoCount, 0, photoItems);
    if (videoCount) animateCounter(videoCount, 0, videoItems);
    if (albumCount) albumCount.textContent = albumItems;
    
    // Stocker tous les éléments
    allMediaItems = Array.from(document.querySelectorAll('.galerie-item'));
}

function animateCounter(element, start, end) {
    const duration = 1000;
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ============================================
// FILTRES ET TRI
// ============================================

function initFiltres() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const triSelect = document.getElementById('triGalerie');
    const viewModeSelect = document.getElementById('viewMode');
    const galerieGrid = document.getElementById('galerieGrid');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const type = btn.getAttribute('data-type');
            filterMedia(type, triSelect.value);
        });
    });
    
    if (triSelect) {
        triSelect.addEventListener('change', () => {
            const activeType = document.querySelector('.nav-btn.active').getAttribute('data-type');
            filterMedia(activeType, triSelect.value);
        });
    }
    
    if (viewModeSelect) {
        viewModeSelect.addEventListener('change', () => {
            const mode = viewModeSelect.value;
            if (mode === 'masonry') {
                galerieGrid.classList.add('masonry');
            } else {
                galerieGrid.classList.remove('masonry');
            }
        });
    }
    
    // Initial filter
    filterMedia('all', 'recent');
}

function filterMedia(type, tri) {
    const mediaItems = allMediaItems;
    let visibleItems = [];
    
    mediaItems.forEach(item => {
        let itemType = 'other';
        const classes = Array.from(item.classList);
        
        if (classes.includes('videos')) itemType = 'videos';
        else if (classes.includes('historique')) itemType = 'historique';
        else if (classes.includes('concerts')) itemType = 'concerts';
        else if (classes.includes('football')) itemType = 'football';
        else if (classes.includes('evenements')) itemType = 'evenements';
        else if (classes.includes('portraits')) itemType = 'portraits';
        else if (classes.includes('the-voix')) itemType = 'the-voix';
        else if (classes.includes('miss-be-kpota')) itemType = 'miss-be-kpota';
        
        const matches = type === 'all' || itemType === type;
        
        if (matches) {
            item.style.display = 'block';
            item.style.animation = 'fadeInCard 0.5s ease';
            visibleItems.push(item);
        } else {
            item.style.display = 'none';
        }
    });
    
    sortMedia(visibleItems, tri);
    currentMediaItems = visibleItems;
    updateMediaCounts();
}

function sortMedia(items, tri) {
    const container = document.querySelector('.galerie-grid');
    if (!container) return;
    
    const itemsArray = Array.from(items);
    
    switch(tri) {
        case 'recent':
            itemsArray.sort((a, b) => {
                const dateA = new Date(a.getAttribute('data-date'));
                const dateB = new Date(b.getAttribute('data-date'));
                return dateB - dateA;
            });
            break;
        case 'ancien':
            itemsArray.sort((a, b) => {
                const dateA = new Date(a.getAttribute('data-date'));
                const dateB = new Date(b.getAttribute('data-date'));
                return dateA - dateB;
            });
            break;
        case 'populaire':
            itemsArray.sort((a, b) => {
                const likesA = parseInt(a.getAttribute('data-likes')) || 0;
                const likesB = parseInt(b.getAttribute('data-likes')) || 0;
                return likesB - likesA;
            });
            break;
    }
    
    itemsArray.forEach(item => container.appendChild(item));
}

function updateMediaCounts() {
    const visiblePhotos = document.querySelectorAll('.galerie-item:not(.videos)[style*="block"]').length;
    const visibleVideos = document.querySelectorAll('.galerie-item.videos[style*="block"]').length;
    
    const photoCount = document.getElementById('photoCount');
    const videoCount = document.getElementById('videoCount');
    
    if (photoCount) photoCount.textContent = visiblePhotos;
    if (videoCount) videoCount.textContent = visibleVideos;
}

function initFooterFilters() {
    document.querySelectorAll('.footer-links a[data-type]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const type = link.getAttribute('data-type');
            const navBtn = document.querySelector(`.nav-btn[data-type="${type}"]`);
            if (navBtn) {
                navBtn.click();
                document.querySelector('.galerie-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ============================================
// LIGHTBOX
// ============================================

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    const viewBtns = document.querySelectorAll('.view-btn');
    const playBtns = document.querySelectorAll('.play-btn');
    
    // Boutons de visualisation
    viewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const mediaId = btn.getAttribute('data-id');
            const item = btn.closest('.galerie-item');
            const itemIndex = currentMediaItems.indexOf(item);
            
            if (mediaId && mediaData[mediaId]) {
                currentMediaId = mediaId;
                currentMediaType = 'photo';
                currentMediaIndex = itemIndex !== -1 ? itemIndex : 0;
                openLightbox('photo', mediaId);
            }
        });
    });
    
    // Boutons de lecture vidéo
    playBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoId = btn.getAttribute('data-video');
            const item = btn.closest('.galerie-item');
            const itemIndex = currentMediaItems.indexOf(item);
            
            if (videoId && videoData[videoId]) {
                currentMediaId = videoId;
                currentMediaType = 'video';
                currentMediaIndex = itemIndex !== -1 ? itemIndex : 0;
                openLightbox('video', videoId);
            }
        });
    });
    
    // Gestion des likes
    initLikeButtons();
    
    // Fermeture
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', prevMedia);
    if (lightboxNext) lightboxNext.addEventListener('click', nextMedia);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape': closeLightbox(); break;
            case 'ArrowRight': nextMedia(); break;
            case 'ArrowLeft': prevMedia(); break;
        }
    });
    
    // Boutons d'action lightbox
    initLightboxActions();
}

function openLightbox(type, id) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxVideo = document.getElementById('lightboxVideo');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDate = document.getElementById('lightboxDate');
    const lightboxDesc = document.getElementById('lightboxDesc');
    const lightboxLikes = document.getElementById('lightboxLikes');
    
    if (type === 'photo' && mediaData[id]) {
        const media = mediaData[id];
        lightboxImage.src = media.image;
        lightboxImage.style.display = 'block';
        lightboxVideo.style.display = 'none';
        lightboxVideo.innerHTML = '';
        lightboxTitle.textContent = media.title;
        lightboxDate.textContent = media.displayDate;
        lightboxDesc.textContent = media.description;
        lightboxLikes.textContent = media.likes;
        
        // Stocker l'ID pour les actions
        lightbox.setAttribute('data-current-id', id);
        lightbox.setAttribute('data-current-type', 'photo');
        
    } else if (type === 'video' && videoData[id]) {
        const video = videoData[id];
        lightboxImage.style.display = 'none';
        lightboxVideo.style.display = 'block';
        lightboxVideo.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0" 
                title="${video.title}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
        lightboxTitle.textContent = video.title;
        lightboxDate.textContent = video.displayDate;
        lightboxDesc.textContent = video.description;
        lightboxLikes.textContent = video.likes;
        
        lightbox.setAttribute('data-current-id', id);
        lightbox.setAttribute('data-current-type', 'video');
    }
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateLightboxNav();
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxVideo = document.getElementById('lightboxVideo');
    
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Arrêter la vidéo
        if (lightboxVideo) {
            lightboxVideo.innerHTML = '';
        }
    }
}

function nextMedia() {
    if (currentMediaIndex < currentMediaItems.length - 1) {
        currentMediaIndex++;
        const nextItem = currentMediaItems[currentMediaIndex];
        const viewBtn = nextItem.querySelector('.view-btn');
        const playBtn = nextItem.querySelector('.play-btn');
        
        if (viewBtn) {
            const mediaId = viewBtn.getAttribute('data-id');
            openLightbox('photo', mediaId);
        } else if (playBtn) {
            const videoId = playBtn.getAttribute('data-video');
            openLightbox('video', videoId);
        }
    }
}

function prevMedia() {
    if (currentMediaIndex > 0) {
        currentMediaIndex--;
        const prevItem = currentMediaItems[currentMediaIndex];
        const viewBtn = prevItem.querySelector('.view-btn');
        const playBtn = prevItem.querySelector('.play-btn');
        
        if (viewBtn) {
            const mediaId = viewBtn.getAttribute('data-id');
            openLightbox('photo', mediaId);
        } else if (playBtn) {
            const videoId = playBtn.getAttribute('data-video');
            openLightbox('video', videoId);
        }
    }
}

function updateLightboxNav() {
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    if (lightboxPrev) lightboxPrev.style.display = currentMediaIndex > 0 ? 'flex' : 'none';
    if (lightboxNext) lightboxNext.style.display = currentMediaIndex < currentMediaItems.length - 1 ? 'flex' : 'none';
}

function initLightboxActions() {
    const likeBtn = document.querySelector('.lightbox-actions .like-btn');
    const downloadBtn = document.querySelector('.lightbox-actions .download-btn');
    const shareBtn = document.querySelector('.lightbox-actions .share-btn');
    
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            const likeSpan = likeBtn.querySelector('span');
            const currentLikes = parseInt(likeSpan.textContent) || 0;
            likeSpan.textContent = currentLikes + 1;
            
            const icon = likeBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#d32f2f';
            }
            
            likeBtn.disabled = true;
            showNotification('Merci pour votre soutien ! ❤️', 'success', 2000);
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const lightbox = document.getElementById('lightbox');
            const type = lightbox.getAttribute('data-current-type');
            const id = lightbox.getAttribute('data-current-id');
            
            if (type === 'photo' && mediaData[id]) {
                const media = mediaData[id];
                const link = document.createElement('a');
                link.href = media.image;
                link.download = `${media.title.replace(/\s+/g, '-')}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showNotification('Téléchargement démarré', 'success', 2000);
            } else {
                showNotification('Téléchargement non disponible pour les vidéos', 'info', 3000);
            }
        });
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const title = document.getElementById('lightboxTitle')?.textContent || 'Photo de la galerie';
            const url = window.location.href;
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: title,
                        text: 'Découvrez cette photo de la galerie du Jubilé',
                        url: url
                    });
                } catch (err) {
                    console.log('Partage annulé');
                }
            } else {
                try {
                    await navigator.clipboard.writeText(`${title} - ${url}`);
                    showNotification('Lien copié dans le presse-papier', 'success', 2000);
                } catch (err) {
                    showNotification('Impossible de copier le lien', 'error', 2000);
                }
            }
        });
    }
}

function initLikeButtons() {
    const likeBtns = document.querySelectorAll('.galerie-item .like-btn');
    
    likeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const likeCountSpan = this.querySelector('.like-count');
            if (likeCountSpan) {
                const currentLikes = parseInt(likeCountSpan.textContent) || 0;
                likeCountSpan.textContent = currentLikes + 1;
                
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    icon.style.color = '#d32f2f';
                }
                
                const parentItem = this.closest('.galerie-item');
                if (parentItem) {
                    parentItem.setAttribute('data-likes', currentLikes + 1);
                }
                
                this.disabled = true;
                showNotification('Merci pour votre like ! ❤️', 'success', 1500);
            }
        });
    });
}

// ============================================
// UPLOAD MODAL
// ============================================

function initUploadModal() {
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    if (!uploadBtn || !uploadModal) return;
    
    const uploadClose = uploadModal.querySelector('.modal-close');
    const uploadForm = document.getElementById('uploadForm');
    const uploadArea = document.getElementById('uploadArea');
    const browseBtn = document.getElementById('browseBtn');
    const photoUpload = document.getElementById('photoUpload');
    const uploadPreview = document.getElementById('uploadPreview');
    
    let selectedFile = null;
    
    uploadBtn.addEventListener('click', () => {
        uploadModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    
    if (uploadClose) {
        uploadClose.addEventListener('click', closeUploadModal);
    }
    
    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) closeUploadModal();
    });
    
    if (uploadArea) {
        uploadArea.addEventListener('click', () => photoUpload.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--rose)';
            uploadArea.style.background = 'var(--marine-blue-light)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--marine-blue)';
            uploadArea.style.background = 'transparent';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--marine-blue)';
            uploadArea.style.background = 'transparent';
            
            if (e.dataTransfer.files.length > 0) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });
    }
    
    if (browseBtn) {
        browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            photoUpload.click();
        });
    }
    
    if (photoUpload) {
        photoUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }
    
    function handleFileSelect(file) {
        if (!file.type.match('image.*')) {
            showNotification('Veuillez sélectionner une image (JPG, PNG, etc.)', 'error', 3000);
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showNotification('L\'image est trop volumineuse (max 5MB)', 'error', 3000);
            return;
        }
        
        selectedFile = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            if (uploadPreview) {
                uploadPreview.innerHTML = `
                    <img src="${e.target.result}" alt="Prévisualisation">
                    <p>${file.name} (${(file.size / 1024).toFixed(0)} KB)</p>
                    <button type="button" class="btn btn-outline" id="removePreview">
                        <i class="fas fa-times"></i> Supprimer
                    </button>
                `;
                uploadPreview.style.display = 'block';
                
                const removeBtn = document.getElementById('removePreview');
                if (removeBtn) {
                    removeBtn.addEventListener('click', () => {
                        selectedFile = null;
                        uploadPreview.style.display = 'none';
                        photoUpload.value = '';
                    });
                }
            }
        };
        reader.readAsDataURL(file);
    }
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!selectedFile) {
                showNotification('Veuillez sélectionner une photo', 'error', 3000);
                return;
            }
            
            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                showNotification('Photo envoyée avec succès ! Elle sera publiée après modération.', 'success', 4000);
                closeUploadModal();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
    
    function closeUploadModal() {
        uploadModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (uploadForm) uploadForm.reset();
        if (uploadPreview) uploadPreview.style.display = 'none';
        if (photoUpload) photoUpload.value = '';
        selectedFile = null;
    }
}

// ============================================
// LOAD MORE
// ============================================

function initLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    let currentPage = 1;
    
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
        loadMoreBtn.disabled = true;
        
        setTimeout(() => {
            const newItems = simulateNewItems(currentPage);
            const galerieGrid = document.getElementById('galerieGrid');
            
            newItems.forEach(item => {
                const newItem = createMediaItem(item);
                galerieGrid.appendChild(newItem);
                allMediaItems.push(newItem);
            });
            
            loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Charger plus de médias';
            loadMoreBtn.disabled = false;
            
            initLightbox();
            initLikeButtons();
            updateMediaCounts();
            
            showNotification(`${newItems.length} nouveaux médias chargés`, 'success', 3000);
            
            if (currentPage >= 3) {
                loadMoreBtn.style.display = 'none';
            }
        }, 1500);
    });
}

function simulateNewItems(page) {
    const newItems = [];
    const categories = ['historique', 'concerts', 'football', 'evenements', 'portraits'];
    const titles = ['Souvenir du Jubilé', 'Moment de partage', 'Répétition générale', 'Célébration communautaire', 'Préparatifs en cours'];
    
    for (let i = 1; i <= 3; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        newItems.push({
            id: `new-${page}-${i}`,
            type: 'photo',
            title: `${titles[Math.floor(Math.random() * titles.length)]} ${i}`,
            date: '2024-01-15',
            displayDate: '15 Janvier 2024',
            description: 'Nouvelle photo ajoutée à la galerie.',
            likes: Math.floor(Math.random() * 50),
            image: 'https://placehold.co/600x400/0a1f44/white?text=Nouvelle+photo',
            category: category,
            tags: [category, 'nouveau'],
            author: 'Utilisateur'
        });
    }
    
    return newItems;
}

function createMediaItem(data) {
    const item = document.createElement('div');
    item.className = `galerie-item ${data.category}`;
    item.setAttribute('data-date', data.date);
    item.setAttribute('data-likes', data.likes);
    
    item.innerHTML = `
        <div class="galerie-media">
            <img src="${data.image}" alt="${data.title}" loading="lazy">
            <div class="media-overlay">
                <button class="media-btn view-btn" data-id="${data.id}">
                    <i class="fas fa-expand"></i>
                </button>
                <button class="media-btn like-btn">
                    <i class="far fa-heart"></i>
                    <span class="like-count">${data.likes}</span>
                </button>
            </div>
        </div>
        <div class="galerie-info">
            <h4>${data.title}</h4>
            <p class="media-date">${data.displayDate}</p>
            <p class="media-desc">${data.description}</p>
            <div class="media-tags">
                ${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    return item;
}

// ============================================
// ANIMATIONS SCROLL
// ============================================

function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    document.querySelectorAll('.galerie-item, .album-card, .download-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// ============================================
// NOTIFICATION
// ============================================

function showNotification(message, type = 'info', duration = 3000) {
    const existingNotifications = document.querySelectorAll('.galerie-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `galerie-notification galerie-notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    if (!document.querySelector('#galerie-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'galerie-notification-styles';
        style.textContent = `
            .galerie-notification {
                position: fixed;
                bottom: 30px;
                right: 30px;
                padding: 15px 25px;
                border-radius: 12px;
                color: white;
                z-index: 9999;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                font-family: 'Montserrat', sans-serif;
                font-size: 0.9rem;
                max-width: 400px;
            }
            
            .galerie-notification-success {
                background: linear-gradient(135deg, #28a745, #1e7e34);
            }
            
            .galerie-notification-error {
                background: linear-gradient(135deg, #dc3545, #b02a37);
            }
            
            .galerie-notification-info {
                background: linear-gradient(135deg, #17a2b8, #117a8b);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .notification-content i {
                font-size: 1.2rem;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @media (max-width: 768px) {
                .galerie-notification {
                    left: 20px;
                    right: 20px;
                    bottom: 20px;
                    max-width: none;
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ============================================
// FONCTIONS EXPOSÉES GLOBALEMENT
// ============================================

window.closeLightbox = closeLightbox;
window.closeUploadModal = function() {
    const modal = document.getElementById('uploadModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
};