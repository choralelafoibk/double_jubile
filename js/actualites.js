// ============================================
// ACTUALITES.JS - Page des actualités du Jubilé
// Mise à jour : Mars 2026
// ============================================

// Données des articles pour le modal
const articlesData = {
    1: {
        title: "Lancement officiel des préparatifs du Jubilé",
        author: "Alex KOUEVI",
        date: "1 Février 2026",
        views: 245,
        image: "https://placehold.co/800x400/0a1f44/white?text=Lancement+Jubilé",
        badge: "🎯 Préparatifs",
        tags: ["lancement", "comité", "planification"],
        content: `
            <p>C'est avec une grande joie et beaucoup d'émotion que nous annonçons le lancement officiel des préparatifs des célébrations du Jubilé 2027-2028. Après plusieurs mois de réflexion et de consultations, le comité de pilotage est désormais pleinement opérationnel.</p>
            
            <h3>Une structure solide pour des célébrations mémorables</h3>
            <p>Sous la direction d'Alex KOUEVI, maître de chant de la Chorale La Foi, sept commissions ont été mises en place.</p>
            <ul>
                <li>Programmation Artistique & Musicale</li>
                <li>Événements Spirituels & Commémoratifs</li>
                <li>Logistique & Production</li>
                <li>Communication & Médias</li>
                <li>Financement & Partenariats</li>
                <li>"The Voïx" - Concours Vocal</li>
                <li>Coordination Générale</li>
            </ul>
            
            <h3>Un calendrier sur 24 mois</h3>
            <p>Les célébrations s'étaleront de février 2027 à décembre 2028, avec deux temps forts.</p>
            
            <blockquote>
                "Ce Jubilé est l'occasion de célébrer notre riche héritage tout en traçant la voie pour les 25 prochaines années. Chaque voix compte, chaque contribution est précieuse."<br>
                <cite>- Alex KOUEVI, Maître de chant</cite>
            </blockquote>
        `,
        comments: []
    },
    2: {
        title: "Le concours 'The Voïx' dévoilé : deux éditions exceptionnelles",
        author: "Commission Culture",
        date: "10 Février 2026",
        views: 512,
        image: "https://placehold.co/800x400/e83e8c/white?text=The+Voïx",
        badge: "🎤 The Voïx",
        tags: ["concours", "musique", "talent", "vote"],
        content: `
            <p>Nous avons le plaisir de dévoiler en exclusivité les détails du concours vocal "The Voïx", l'un des événements phares des célébrations du Jubilé.</p>
            
            <h3>Deux éditions, deux formats</h3>
            <p><strong>Édition 2027 : Gratuite et accessible</strong><br>
            Une compétition entièrement gratuite pour découvrir les nouveaux talents de la musique sacrée.</p>
            
            <p><strong>Édition 2028 : Spéciale Jubilé avec votes payants</strong><br>
            Pour le 50ème anniversaire, une édition spéciale avec système de votes payants.</p>
            
            <h3>Comment participer ?</h3>
            <p>Les inscriptions seront ouvertes sur notre site à partir de mai 2026.</p>
            
            <blockquote>
                "The Voïx est plus qu'un concours, c'est une plateforme pour révéler les talents de demain."<br>
                <cite>- Commission Culture</cite>
            </blockquote>
        `,
        comments: []
    },
    3: {
        title: "Coupe de la Foi 2027 : le tournoi football qui unit la communauté",
        author: "Commission Sport",
        date: "5 Mars 2026",
        views: 387,
        image: "https://placehold.co/800x400/28a745/white?text=Coupe+de+la+Foi",
        badge: "⚽ Football",
        tags: ["football", "tournoi", "communauté"],
        content: `
            <p>La Commission Sport du Jubilé annonce le premier festival footballistique : la Coupe de la Foi 2027.</p>
            
            <h3>Un tournoi pour tous</h3>
            <p>8 à 12 équipes s'affronteront sur le terrain de Bè-Kpota.</p>
            
            <h3>Modalités d'inscription</h3>
            <ul>
                <li><strong>Date limite :</strong> 15 Mai 2027</li>
                <li><strong>Frais :</strong> 1 000 Fcfa par équipe</li>
                <li><strong>Contact :</strong> +228 79 28 82 09</li>
            </ul>
        `,
        comments: []
    }
    // Ajouter les autres articles ici...
};

// Variables globales
let currentArticleId = null;
let currentPage = 1;
const articlesPerPage = 6;

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📰 Initialisation de la page Actualités (Mars 2026)...');
    
    initStats();
    initFiltres();
    initArticleModals();
    initNewsletter();
    initPagination();
    initAnimations();
    
    console.log('✅ Page Actualités initialisée avec succès');
});

// ============================================
// STATISTIQUES HERO
// ============================================

function initStats() {
    const articleCount = document.querySelectorAll('.article-card').length;
    const firstEventDate = new Date(2027, 4, 20);
    const today = new Date();
    const daysDiff = Math.ceil((firstEventDate - today) / (1000 * 60 * 60 * 24));
    
    const articleCountEl = document.getElementById('articleCount');
    const joursRestantsEl = document.getElementById('joursRestants');
    
    if (articleCountEl) {
        animateCounter(articleCountEl, 0, articleCount);
    }
    
    if (joursRestantsEl && daysDiff > 0) {
        animateCounter(joursRestantsEl, 0, daysDiff);
    }
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
// FILTRES ET RECHERCHE
// ============================================

function initFiltres() {
    const categorieBtns = document.querySelectorAll('.categorie-btn');
    const rechercheInput = document.getElementById('rechercheInput');
    const triSelect = document.getElementById('triSelect');
    
    categorieBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categorieBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterAndDisplay();
        });
    });
    
    if (rechercheInput) {
        rechercheInput.addEventListener('input', () => filterAndDisplay());
    }
    
    if (triSelect) {
        triSelect.addEventListener('change', () => filterAndDisplay());
    }
    
    // Filtres du footer
    document.querySelectorAll('.footer-links a[data-categorie]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const categorie = link.getAttribute('data-categorie');
            const btn = document.querySelector(`.categorie-btn[data-categorie="${categorie}"]`);
            if (btn) {
                btn.click();
                document.querySelector('.articles-section').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function filterAndDisplay() {
    const activeCategorie = document.querySelector('.categorie-btn.active').getAttribute('data-categorie');
    const searchTerm = document.getElementById('rechercheInput')?.value.toLowerCase() || '';
    const tri = document.getElementById('triSelect')?.value || 'recent';
    
    const articles = document.querySelectorAll('.article-card');
    let visibleArticles = [];
    
    articles.forEach(article => {
        const categorie = article.getAttribute('data-categorie');
        const title = article.querySelector('h3').textContent.toLowerCase();
        const excerpt = article.querySelector('.article-excerpt').textContent.toLowerCase();
        const tags = Array.from(article.querySelectorAll('.tag')).map(t => t.textContent.toLowerCase());
        
        const matchesCategorie = activeCategorie === 'all' || categorie === activeCategorie;
        const matchesSearch = !searchTerm || 
            title.includes(searchTerm) || 
            excerpt.includes(searchTerm) ||
            tags.some(t => t.includes(searchTerm));
        
        if (matchesCategorie && matchesSearch) {
            visibleArticles.push(article);
            article.style.display = 'block';
            article.style.animation = 'fadeInCard 0.5s ease';
        } else {
            article.style.display = 'none';
        }
    });
    
    // Tri
    visibleArticles.sort((a, b) => {
        if (tri === 'recent') {
            return new Date(b.getAttribute('data-date')) - new Date(a.getAttribute('data-date'));
        } else if (tri === 'ancien') {
            return new Date(a.getAttribute('data-date')) - new Date(b.getAttribute('data-date'));
        } else if (tri === 'populaire') {
            return parseInt(b.getAttribute('data-popularite')) - parseInt(a.getAttribute('data-popularite'));
        }
        return 0;
    });
    
    // Réorganiser le DOM
    const grid = document.getElementById('articleGrid');
    if (grid) {
        visibleArticles.forEach(article => grid.appendChild(article));
    }
    
    // Mettre à jour le compteur
    const countEl = document.getElementById('articleCount');
    if (countEl) {
        countEl.textContent = visibleArticles.length;
    }
    
    // Réinitialiser la pagination
    currentPage = 1;
    updatePaginationDisplay(visibleArticles.length);
}

function updatePaginationDisplay(totalArticles) {
    const totalPages = Math.ceil(totalArticles / articlesPerPage);
    const pageNumbers = document.querySelector('.page-numbers');
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');
    
    if (!pageNumbers) return;
    
    pageNumbers.innerHTML = '';
    
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const btn = document.createElement('button');
        btn.className = `page-number${i === currentPage ? ' active' : ''}`;
        btn.textContent = i;
        btn.addEventListener('click', () => goToPage(i));
        pageNumbers.appendChild(btn);
    }
    
    if (totalPages > 5) {
        const dots = document.createElement('span');
        dots.className = 'page-dots';
        dots.textContent = '...';
        pageNumbers.appendChild(dots);
        
        const lastBtn = document.createElement('button');
        lastBtn.className = 'page-number';
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', () => goToPage(totalPages));
        pageNumbers.appendChild(lastBtn);
    }
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

function goToPage(page) {
    currentPage = page;
    const articles = Array.from(document.querySelectorAll('.article-card')).filter(a => a.style.display !== 'none');
    const start = (page - 1) * articlesPerPage;
    const end = start + articlesPerPage;
    
    articles.forEach((article, index) => {
        if (index >= start && index < end) {
            article.style.display = 'block';
        } else {
            article.style.display = 'none';
        }
    });
    
    updatePaginationDisplay(articles.length);
    
    // Scroll vers le haut des articles
    document.querySelector('.articles-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initPagination() {
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) goToPage(currentPage - 1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalArticles = document.querySelectorAll('.article-card').length;
            const totalPages = Math.ceil(totalArticles / articlesPerPage);
            if (currentPage < totalPages) goToPage(currentPage + 1);
        });
    }
    
    // Initial display
    filterAndDisplay();
}

// ============================================
// MODAL ARTICLES
// ============================================

function initArticleModals() {
    const articleBtns = document.querySelectorAll('.btn-article');
    const modal = document.getElementById('articleModal');
    
    if (!modal) return;
    
    articleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const articleId = btn.getAttribute('data-article');
            if (articleId) {
                loadArticleModal(articleId);
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    const modalClose = modal.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
    
    // Partage
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.classList[1];
            const url = window.location.href;
            const title = document.getElementById('modalArticleTitle')?.textContent || '';
            
            let shareUrl = '';
            if (platform === 'facebook') {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            } else if (platform === 'whatsapp') {
                shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
            } else if (platform === 'email') {
                shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
            }
            
            if (shareUrl) window.open(shareUrl, '_blank');
        });
    });
    
    // Formulaire commentaire
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addComment();
        });
    }
}

function loadArticleModal(articleId) {
    const article = articlesData[articleId];
    if (!article) return;
    
    currentArticleId = articleId;
    
    document.getElementById('modalArticleTitle').textContent = article.title;
    document.getElementById('modalArticleAuthor').textContent = article.author;
    document.getElementById('modalArticleDate').textContent = article.date;
    document.getElementById('modalArticleViews').textContent = article.views;
    document.getElementById('modalArticleImage').src = article.image;
    document.getElementById('modalArticleContent').innerHTML = article.content;
    
    const badge = document.querySelector('.article-modal-badge');
    if (badge) badge.textContent = article.badge;
    
    const tagsContainer = document.getElementById('modalArticleTags');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
        article.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });
    }
    
    const commentsCount = document.getElementById('commentsCount');
    if (commentsCount) commentsCount.textContent = article.comments?.length || 0;
    
    loadComments(article.comments || []);
}

function loadComments(comments) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">Aucun commentaire pour le moment. Soyez le premier à commenter !</p>';
        return;
    }
    
    commentsList.innerHTML = '';
    comments.forEach(comment => {
        const commentEl = document.createElement('div');
        commentEl.className = 'commentaire-card';
        commentEl.innerHTML = `
            <div class="commentaire-header">
                <div class="commentaire-auteur">
                    <div class="auteur-avatar">${comment.avatar || comment.author.substring(0, 2).toUpperCase()}</div>
                    <div class="auteur-info">
                        <h5>${comment.author}</h5>
                        <span class="commentaire-date">${comment.date || 'À l\'instant'}</span>
                    </div>
                </div>
            </div>
            <div class="commentaire-content">
                <p>${comment.content}</p>
            </div>
            <div class="commentaire-actions">
                <button class="action-btn like-btn" data-comment="${comment.id || Date.now()}">
                    <i class="fas fa-thumbs-up"></i> ${comment.likes || 0}
                </button>
            </div>
        `;
        commentsList.appendChild(commentEl);
    });
    
    // Gestion des likes
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const likeSpan = this.querySelector('i').nextSibling;
            const currentLikes = parseInt(likeSpan.textContent) || 0;
            likeSpan.textContent = currentLikes + 1;
            this.disabled = true;
            this.classList.add('liked');
        });
    });
}

function addComment() {
    const name = document.getElementById('commentName')?.value.trim();
    const email = document.getElementById('commentEmail')?.value.trim();
    const text = document.getElementById('commentText')?.value.trim();
    
    if (!name || !email || !text) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Veuillez entrer une adresse email valide');
        return;
    }
    
    const newComment = {
        id: Date.now(),
        author: name,
        avatar: name.substring(0, 2).toUpperCase(),
        date: 'À l\'instant',
        content: text,
        likes: 0
    };
    
    if (articlesData[currentArticleId]) {
        if (!articlesData[currentArticleId].comments) articlesData[currentArticleId].comments = [];
        articlesData[currentArticleId].comments.push(newComment);
        
        loadComments(articlesData[currentArticleId].comments);
        
        const commentsCount = document.getElementById('commentsCount');
        if (commentsCount) commentsCount.textContent = articlesData[currentArticleId].comments.length;
        
        document.getElementById('commentText').value = '';
        alert('Merci pour votre commentaire !');
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function closeModal() {
    const modal = document.getElementById('articleModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// NEWSLETTER
// ============================================

function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('newsletterEmail')?.value.trim();
        const consent = document.getElementById('newsletterConsent')?.checked;
        
        if (!email) {
            alert('Veuillez entrer votre adresse email');
            return;
        }
        
        if (!isValidEmail(email)) {
            alert('Veuillez entrer une adresse email valide');
            return;
        }
        
        if (!consent) {
            alert('Veuillez accepter de recevoir les actualités');
            return;
        }
        
        alert('Merci pour votre inscription à la newsletter ! Vous recevrez bientôt nos actualités.');
        form.reset();
    });
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
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.article-card, .newsletter-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// ============================================
// FONCTIONS EXPOSÉES GLOBALEMENT
// ============================================

window.closeModal = closeModal;