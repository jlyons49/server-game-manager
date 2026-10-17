// ==========================================================================
// HEFTY RACCOON GAMES - ARCADE PORTAL APPLICATION LOGIC
// Domain: game.heftyracoon.com
// ==========================================================================

import { fallbackGamesData } from './games-data.js';

class GamePortalApp {
  constructor() {
    this.catalog = null;
    this.games = [];
    this.categories = [];
    
    // Filter & Pagination State
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'featured';
    this.viewMode = 'grid'; // 'grid' | 'list'
    this.currentPage = 1;
    this.itemsPerPage = 12; // Scalable chunk size for arbitrarily large number of games
    
    // Active Modals State
    this.activeGame = null;

    // DOM Elements Cache
    this.dom = {
      heroSection: document.getElementById('hero-section'),
      spotlightCard: document.getElementById('spotlight-card'),
      spotlightTitle: document.getElementById('spotlight-title'),
      spotlightSubtitle: document.getElementById('spotlight-subtitle'),
      spotlightDesc: document.getElementById('spotlight-desc'),
      spotlightTags: document.getElementById('spotlight-tags'),
      spotlightRating: document.getElementById('spotlight-rating'),
      spotlightCategory: document.getElementById('spotlight-category'),
      spotlightVersion: document.getElementById('spotlight-version'),
      spotlightIcon: document.getElementById('spotlight-icon'),
      btnSpotlightPlay: document.getElementById('btn-spotlight-play'),
      btnSpotlightDetails: document.getElementById('btn-spotlight-details'),
      
      searchInput: document.getElementById('game-search'),
      categoriesBar: document.getElementById('categories-bar'),
      resultsCount: document.getElementById('results-count'),
      sortSelect: document.getElementById('sort-select'),
      viewGridBtn: document.getElementById('view-grid'),
      viewListBtn: document.getElementById('view-list'),
      gamesGrid: document.getElementById('games-grid'),
      paginationControls: document.getElementById('pagination-controls'),
      headerGameCount: document.getElementById('header-game-count'),

      // Details Modal
      detailsModal: document.getElementById('details-modal'),
      btnCloseDetails: document.getElementById('btn-close-details'),
      modalTitle: document.getElementById('modal-game-title'),
      modalTagline: document.getElementById('modal-game-tagline'),
      modalGenre: document.getElementById('modal-meta-genre'),
      modalControls: document.getElementById('modal-meta-controls'),
      modalVersion: document.getElementById('modal-meta-version'),
      modalDesc: document.getElementById('modal-game-desc'),
      modalFeaturesList: document.getElementById('modal-features-list'),
      btnModalLaunch: document.getElementById('btn-modal-launch'),
      btnModalShare: document.getElementById('btn-modal-share')
    };

    this.init();
  }

  async init() {
    await this.loadCatalog();
    this.bindEvents();
    this.renderCategories();
    this.renderSpotlight();
    this.applyRoutingFromHash();
    this.renderCatalog();
  }

  async loadCatalog() {
    try {
      const response = await fetch('games.json?v=' + Date.now());
      if (!response.ok) throw new Error('HTTP ' + response.status);
      this.catalog = await response.json();
    } catch (err) {
      console.warn('Falling back to embedded games data:', err);
      this.catalog = fallbackGamesData;
    }

    this.games = this.catalog.games || [];
    this.categories = this.catalog.categories || [];
    
    if (this.dom.headerGameCount) {
      this.dom.headerGameCount.textContent = `${this.games.length} Games Active`;
    }
  }

  bindEvents() {
    // Search input (with debounce)
    let searchDebounce;
    this.dom.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.currentPage = 1;
        this.renderCatalog();
      }, 150);
    });

    // Keyboard shortcut '/' to search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.dom.searchInput) {
        e.preventDefault();
        this.dom.searchInput.focus();
        this.dom.searchInput.select();
      } else if (e.key === 'Escape') {
        if (this.dom.detailsModal.classList.contains('active')) {
          this.closeDetailsModal();
        }
      }
    });

    // Sorting
    this.dom.sortSelect.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.currentPage = 1;
      this.renderCatalog();
    });

    // View mode toggle
    this.dom.viewGridBtn.addEventListener('click', () => {
      this.viewMode = 'grid';
      this.dom.viewGridBtn.classList.add('active');
      this.dom.viewListBtn.classList.remove('active');
      this.dom.gamesGrid.classList.remove('list-view');
    });

    this.dom.viewListBtn.addEventListener('click', () => {
      this.viewMode = 'list';
      this.dom.viewListBtn.classList.add('active');
      this.dom.viewGridBtn.classList.remove('active');
      this.dom.gamesGrid.classList.add('list-view');
    });

    // Details Modal Controls
    this.dom.btnCloseDetails.addEventListener('click', () => this.closeDetailsModal());
    this.dom.detailsModal.addEventListener('click', (e) => {
      if (e.target === this.dom.detailsModal) this.closeDetailsModal();
    });
    this.dom.btnModalLaunch.addEventListener('click', () => {
      const g = this.activeGame;
      this.closeDetailsModal();
      if (g) this.launchGame(g);
    });
    this.dom.btnModalShare.addEventListener('click', () => {
      if (this.activeGame) {
        const shareUrl = `${window.location.origin}${window.location.pathname}#play=${this.activeGame.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
          const original = this.dom.btnModalShare.innerHTML;
          this.dom.btnModalShare.innerHTML = '<span>✔ Link Copied!</span>';
          setTimeout(() => {
            this.dom.btnModalShare.innerHTML = original;
          }, 2000);
        });
      }
    });

    // Spotlight Buttons
    this.dom.btnSpotlightPlay.addEventListener('click', () => {
      const featuredGame = this.games.find(g => g.featured) || this.games[0];
      if (featuredGame) this.launchGame(featuredGame);
    });
    this.dom.btnSpotlightDetails.addEventListener('click', () => {
      const featuredGame = this.games.find(g => g.featured) || this.games[0];
      if (featuredGame) this.openDetailsModal(featuredGame);
    });

    // Hash change routing
    window.addEventListener('hashchange', () => this.applyRoutingFromHash());

    // Back to top
    const backTop = document.getElementById('link-back-top');
    if (backTop) {
      backTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // How to add link
    const howToAdd = document.getElementById('link-how-to-add');
    if (howToAdd) {
      howToAdd.addEventListener('click', (e) => {
        e.preventDefault();
        alert("To add a new game:\n1. Place the game folder inside the /games/ directory\n2. Add its metadata to games.json\n3. Git push! It deploys automatically to game.heftyracoon.com.");
      });
    }
  }

  applyRoutingFromHash() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const playId = params.get('play');
    const detailsId = params.get('game');
    const category = params.get('category');
    const search = params.get('search');

    if (playId) {
      const game = this.games.find(g => g.id === playId);
      if (game) this.launchGame(game, false);
    } else if (detailsId) {
      const game = this.games.find(g => g.id === detailsId);
      if (game) this.openDetailsModal(game);
    }

    if (category) {
      this.activeCategory = category;
      this.renderCategories();
    }
    if (search) {
      this.searchQuery = search.toLowerCase();
      this.dom.searchInput.value = search;
    }
  }

  renderCategories() {
    this.dom.categoriesBar.innerHTML = '';
    this.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `category-tab ${this.activeCategory === cat.id ? 'active' : ''}`;
      btn.innerHTML = `<span>${cat.icon || '🎮'}</span> <span>${cat.label}</span>`;
      btn.addEventListener('click', () => {
        this.activeCategory = cat.id;
        this.currentPage = 1;
        this.renderCategories();
        this.renderCatalog();
      });
      this.dom.categoriesBar.appendChild(btn);
    });
  }

  renderSpotlight() {
    const featured = this.games.find(g => g.featured) || this.games[0];
    if (!featured) {
      this.dom.heroSection.style.display = 'none';
      return;
    }

    this.dom.heroSection.style.display = 'block';
    this.dom.spotlightTitle.textContent = featured.title;
    this.dom.spotlightSubtitle.textContent = featured.subtitle || featured.tagline;
    this.dom.spotlightDesc.textContent = featured.description;
    this.dom.spotlightRating.textContent = `${featured.rating || '5.0'} ★`;
    this.dom.spotlightCategory.textContent = featured.category.toUpperCase();
    this.dom.spotlightVersion.textContent = `v${featured.version || '1.0'}`;
    this.dom.spotlightIcon.textContent = featured.icon || '🕹️';

    this.dom.spotlightTags.innerHTML = (featured.tags || [])
      .slice(0, 4)
      .map(tag => `<span class="tag-pill">${tag}</span>`)
      .join('');
  }

  getFilteredGames() {
    let result = [...this.games];

    // 1. Category Filter
    if (this.activeCategory !== 'all') {
      result = result.filter(g => {
        if (this.activeCategory === 'featured') return g.featured;
        return g.category === this.activeCategory || (g.categories && g.categories.includes(this.activeCategory));
      });
    }

    // 2. Search Query Filter
    if (this.searchQuery) {
      const q = this.searchQuery;
      result = result.filter(g => {
        const inTitle = g.title.toLowerCase().includes(q);
        const inDesc = (g.description || '').toLowerCase().includes(q);
        const inTagline = (g.tagline || '').toLowerCase().includes(q);
        const inTags = (g.tags || []).some(t => t.toLowerCase().includes(q));
        const inCat = (g.category || '').toLowerCase().includes(q);
        return inTitle || inDesc || inTagline || inTags || inCat;
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (this.sortBy === 'featured') {
        if (a.featured !== b.featured) return b.featured ? 1 : -1;
        return (b.rating || 0) - (a.rating || 0);
      } else if (this.sortBy === 'rating-desc') {
        return (b.rating || 0) - (a.rating || 0);
      } else if (this.sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      } else if (this.sortBy === 'newest') {
        return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
      }
      return 0;
    });

    return result;
  }

  renderCatalog() {
    const filtered = this.getFilteredGames();
    const totalCount = filtered.length;
    
    // Update live count indicator
    this.dom.resultsCount.innerHTML = `Showing <b>${Math.min(filtered.length, this.itemsPerPage)}</b> of <b>${totalCount}</b> games`;

    // Empty state
    if (totalCount === 0) {
      this.dom.gamesGrid.innerHTML = `
        <div class="empty-catalog">
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">No games found</h3>
          <p class="empty-desc">We couldn't find any games matching "${this.searchQuery}". Try a different keyword or category.</p>
          <button class="btn-secondary" id="btn-clear-search">Clear Search Filter</button>
        </div>
      `;
      const clearBtn = document.getElementById('btn-clear-search');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.dom.searchInput.value = '';
          this.activeCategory = 'all';
          this.renderCategories();
          this.renderCatalog();
        });
      }
      this.dom.paginationControls.innerHTML = '';
      return;
    }

    // Pagination slice
    const totalPages = Math.ceil(totalCount / this.itemsPerPage);
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const pageGames = filtered.slice(startIndex, startIndex + this.itemsPerPage);

    // Render Game Cards
    this.dom.gamesGrid.innerHTML = '';
    pageGames.forEach(game => {
      const card = this.createGameCard(game);
      this.dom.gamesGrid.appendChild(card);
    });

    // Render Pagination Controls (Supports arbitrarily large number of games)
    this.renderPagination(totalPages);
  }

  createGameCard(game) {
    const card = document.createElement('article');
    card.className = 'game-card';
    card.setAttribute('data-id', game.id);

    const gradient = game.coverGradient || 'linear-gradient(135deg, #1e3a8a 0%, #4338ca 50%, #6d28d9 100%)';
    const badgeText = game.badge || (game.featured ? 'FEATURED' : (game.category || 'GAME').toUpperCase());
    const isHot = game.badge && game.badge.includes('HOT');

    card.innerHTML = `
      <div class="card-banner">
        <div class="card-banner-bg" style="background: ${gradient}"></div>
        <div class="card-badges">
          <span class="badge-tag ${isHot ? 'hot' : ''}">${badgeText}</span>
          <span class="badge-tag rating">★ ${game.rating || '5.0'}</span>
        </div>
        <div class="card-icon-overlay">${game.icon || '🕹️'}</div>
      </div>

      <div class="card-body">
        <h3 class="card-title">${game.title}</h3>
        <p class="card-tagline">${game.tagline || game.subtitle || ''}</p>
        <p class="card-desc">${game.description || ''}</p>

        <div class="card-tags">
          ${(game.tags || []).slice(0, 3).map(tag => `<span class="tag-pill">${tag}</span>`).join('')}
        </div>

        <div class="card-footer">
          <button class="btn-card-play" data-action="play">
            <span>▶ Play Now</span>
          </button>
          <button class="btn-card-details" data-action="details" title="View Game Info">
            <span>Details</span>
          </button>
        </div>
      </div>
    `;

    // Event listeners
    card.querySelector('[data-action="play"]').addEventListener('click', (e) => {
      e.stopPropagation();
      this.launchGame(game);
    });

    card.querySelector('[data-action="details"]').addEventListener('click', (e) => {
      e.stopPropagation();
      this.openDetailsModal(game);
    });

    card.addEventListener('click', () => {
      this.openDetailsModal(game);
    });

    return card;
  }

  renderPagination(totalPages) {
    if (totalPages <= 1) {
      this.dom.paginationControls.innerHTML = '';
      return;
    }

    let html = `
      <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">◀ Prev</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      // Show first, last, and window around current
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        html += `<span style="color: var(--text-dim); padding: 0 4px;">…</span>`;
      }
    }

    html += `
      <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">Next ▶</button>
    `;

    this.dom.paginationControls.innerHTML = html;

    this.dom.paginationControls.querySelectorAll('.page-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-page'), 10);
        if (page >= 1 && page <= totalPages && page !== this.currentPage) {
          this.currentPage = page;
          this.renderCatalog();
          window.scrollTo({ top: this.dom.categoriesBar.offsetTop - 80, behavior: 'smooth' });
        }
      });
    });
  }

  launchGame(game) {
    if (game && game.entryUrl) {
      window.location.href = game.entryUrl;
    }
  }

  openDetailsModal(game) {
    this.activeGame = game;
    this.dom.modalTitle.textContent = game.title;
    this.dom.modalTagline.textContent = game.tagline || game.subtitle || '';
    this.dom.modalGenre.textContent = (game.category || 'Arcade').toUpperCase();
    this.dom.modalControls.textContent = game.controls || 'Keyboard / Touch';
    this.dom.modalVersion.textContent = `v${game.version || '1.0.0'}`;
    this.dom.modalDesc.textContent = game.description || 'No description available.';

    const features = game.features || [
      'High-performance pure Web execution (Zero installation)',
      'Responsive design with full touch and keyboard controls',
      'Modern HTML5, Canvas, and Web Audio API integration'
    ];

    this.dom.modalFeaturesList.innerHTML = features
      .map(f => `<li>${f}</li>`)
      .join('');

    this.dom.detailsModal.classList.add('active');
    this.dom.detailsModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  closeDetailsModal() {
    this.dom.detailsModal.classList.remove('active');
    this.dom.detailsModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.activeGame = null;
  }
}

// Instantiate once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.__GAME_PORTAL__ = new GamePortalApp();
});
