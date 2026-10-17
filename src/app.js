// ==========================================================================
// HEFTY RACCOON'S GAMING SHRINE - APPLICATION LOGIC
// Domain: game.heftyracoon.com (Authentic Late-90s Web Experience)
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
    this.currentPage = 1;
    this.itemsPerPage = 12; // Scalable chunk size for arbitrarily large number of games
    
    // Active Modals State
    this.activeGame = null;

    // DOM Elements Cache
    this.dom = {
      heroSection: document.getElementById('hero-section'),
      spotlightTitle: document.getElementById('spotlight-title'),
      spotlightSubtitle: document.getElementById('spotlight-subtitle'),
      spotlightDesc: document.getElementById('spotlight-desc'),
      spotlightTags: document.getElementById('spotlight-tags'),
      spotlightRating: document.getElementById('spotlight-rating'),
      spotlightCategory: document.getElementById('spotlight-category'),
      spotlightIcon: document.getElementById('spotlight-icon'),
      btnSpotlightPlay: document.getElementById('btn-spotlight-play'),
      btnSpotlightDetails: document.getElementById('btn-spotlight-details'),
      
      searchInput: document.getElementById('game-search'),
      categoriesBar: document.getElementById('categories-bar'),
      resultsCount: document.getElementById('results-count'),
      sortSelect: document.getElementById('sort-select'),
      gamesGrid: document.getElementById('games-grid'),
      paginationControls: document.getElementById('pagination-controls'),
      headerGameCount: document.getElementById('header-game-count'),
      visitorCounterVal: document.getElementById('visitor-counter-val'),

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
    this.initVisitorCounter();
    await this.loadCatalog();
    this.bindEvents();
    this.renderCategories();
    this.renderSpotlight();
    this.applyRoutingFromHash();
    this.renderCatalog();
  }

  async initVisitorCounter() {
    let count = 1337;
    try {
      const res = await fetch('/api/counter?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === 'number') {
          count = data.count;
          try {
            localStorage.setItem('hefty_retro_visits', count.toString());
          } catch (_) {}
        }
      } else {
        throw new Error('API status ' + res.status);
      }
    } catch (_) {
      // Fallback to localStorage if API is unreachable (e.g. offline preview)
      try {
        let stored = parseInt(localStorage.getItem('hefty_retro_visits') || '1337', 10);
        count = stored + 1;
        localStorage.setItem('hefty_retro_visits', count.toString());
      } catch (e) {
        count = 1338;
      }
    }

    this.renderCounter(count);
  }

  renderCounter(count) {
    if (!this.dom.visitorCounterVal) return;
    const formatted = String(count).padStart(6, '0');
    this.dom.visitorCounterVal.innerHTML = formatted
      .split('')
      .map(d => `<span class="digit">${d}</span>`)
      .join('');
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
      this.dom.headerGameCount.textContent = `${this.games.length} Games Loaded`;
    }
  }

  bindEvents() {
    // Search input (with debounce)
    let searchDebounce;
    if (this.dom.searchInput) {
      this.dom.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          this.currentPage = 1;
          this.renderCatalog();
        }, 150);
      });
    }

    // Keyboard shortcut '/' to search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.dom.searchInput) {
        e.preventDefault();
        if (this.dom.searchInput) {
          this.dom.searchInput.focus();
          this.dom.searchInput.select();
        }
      } else if (e.key === 'Escape') {
        if (this.dom.detailsModal && this.dom.detailsModal.classList.contains('active')) {
          this.closeDetailsModal();
        }
      }
    });

    // Sorting
    if (this.dom.sortSelect) {
      this.dom.sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.currentPage = 1;
        this.renderCatalog();
      });
    }

    // Details Modal Controls
    if (this.dom.btnCloseDetails) {
      this.dom.btnCloseDetails.addEventListener('click', () => this.closeDetailsModal());
    }
    if (this.dom.detailsModal) {
      this.dom.detailsModal.addEventListener('click', (e) => {
        if (e.target === this.dom.detailsModal) this.closeDetailsModal();
      });
    }
    if (this.dom.btnModalLaunch) {
      this.dom.btnModalLaunch.addEventListener('click', () => {
        const g = this.activeGame;
        this.closeDetailsModal();
        if (g) this.launchGame(g);
      });
    }
    if (this.dom.btnModalShare) {
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
    }

    // Spotlight Buttons
    if (this.dom.btnSpotlightPlay) {
      this.dom.btnSpotlightPlay.addEventListener('click', () => {
        const featuredGame = this.games.find(g => g.featured) || this.games[0];
        if (featuredGame) this.launchGame(featuredGame);
      });
    }
    if (this.dom.btnSpotlightDetails) {
      this.dom.btnSpotlightDetails.addEventListener('click', () => {
        const featuredGame = this.games.find(g => g.featured) || this.games[0];
        if (featuredGame) this.openDetailsModal(featuredGame);
      });
    }

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

    // 90s Guestbook Sign Button
    const guestbookBtn = document.getElementById('btn-guestbook');
    if (guestbookBtn) {
      guestbookBtn.addEventListener('click', () => {
        const handle = prompt("★ SIGN HEFTY RACCOON'S GUESTBOOK ★\nEnter your name or screen handle:", "Gamer_2000");
        if (handle) {
          alert(`★ THANK YOU, ${handle.toUpperCase()}! ★\nYour entry was recorded in the guestbook! Keep on gaming!`);
        }
      });
    }

    // Webring Links
    const prevWebring = document.getElementById('link-webring-prev');
    const nextWebring = document.getElementById('link-webring-next');
    [prevWebring, nextWebring].forEach(link => {
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          alert("❖ RACCOON WEBRING ❖\nTraveling to the adjacent homepage on the webring!");
        });
      }
    });
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
      if (game) this.launchGame(game);
    } else if (detailsId) {
      const game = this.games.find(g => g.id === detailsId);
      if (game) this.openDetailsModal(game);
    }

    if (category) {
      this.activeCategory = category;
      this.renderCategories();
    }
    if (search && this.dom.searchInput) {
      this.searchQuery = search.toLowerCase();
      this.dom.searchInput.value = search;
    }
  }

  renderCategories() {
    if (!this.dom.categoriesBar) return;
    this.dom.categoriesBar.innerHTML = '<span class="categories-label">Jump to:</span>';
    
    this.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `geo-btn ${this.activeCategory === cat.id ? 'active' : ''}`;
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
      if (this.dom.heroSection) this.dom.heroSection.style.display = 'none';
      return;
    }

    if (this.dom.heroSection) this.dom.heroSection.style.display = 'block';
    if (this.dom.spotlightTitle) this.dom.spotlightTitle.textContent = featured.title;
    if (this.dom.spotlightSubtitle) this.dom.spotlightSubtitle.textContent = featured.subtitle || featured.tagline;
    if (this.dom.spotlightDesc) this.dom.spotlightDesc.textContent = featured.description;
    if (this.dom.spotlightRating) this.dom.spotlightRating.textContent = `${featured.rating || '5.0'} ★`;
    if (this.dom.spotlightCategory) this.dom.spotlightCategory.textContent = featured.category.toUpperCase();
    if (this.dom.spotlightIcon) this.dom.spotlightIcon.textContent = featured.icon || '🕹️';

    if (this.dom.spotlightTags) {
      this.dom.spotlightTags.innerHTML = (featured.tags || [])
        .slice(0, 4)
        .map(tag => `<span class="tag-bracket">[${tag}]</span>`)
        .join(' ');
    }
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
    if (this.dom.resultsCount) {
      this.dom.resultsCount.textContent = `Showing ${Math.min(filtered.length, this.itemsPerPage)} of ${totalCount} games`;
    }

    // Empty state
    if (totalCount === 0) {
      this.dom.gamesGrid.innerHTML = `
        <div class="empty-state-box">
          <p style="font-size: 1.1rem; color: #ffff00; margin-bottom: 8px;"><b>No games found matching "${this.searchQuery}"</b></p>
          <p style="color: #cccccc; margin-bottom: 12px;">Try searching for a different keyword or resetting your filter.</p>
          <button class="geo-btn" id="btn-clear-search">Clear Search Filter</button>
        </div>
      `;
      const clearBtn = document.getElementById('btn-clear-search');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.searchQuery = '';
          if (this.dom.searchInput) this.dom.searchInput.value = '';
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

    // Render Game Entries
    this.dom.gamesGrid.innerHTML = '';
    pageGames.forEach(game => {
      const card = this.createGameCard(game);
      this.dom.gamesGrid.appendChild(card);
    });

    // Render Pagination Controls
    this.renderPagination(totalPages);
  }

  createGameCard(game) {
    const card = document.createElement('article');
    card.className = 'game-entry';
    card.setAttribute('data-id', game.id);

    const tagsHtml = (game.tags || [])
      .slice(0, 4)
      .map(t => `<span class="tag-bracket">[${t}]</span>`)
      .join(' ');

    card.innerHTML = `
      <div class="game-thumb-box">${game.icon || '🕹️'}</div>
      <div class="game-details">
        <div class="game-header-row">
          <a class="game-title-link" data-action="play">${game.title}</a>
          <span class="game-rating-text">${(game.category || 'Arcade').toUpperCase()} • ★ ${game.rating || '5.0'}</span>
        </div>
        <p class="game-summary">${game.description || game.tagline || ''}</p>
        <div class="tag-list">${tagsHtml}</div>
        <div class="game-action-bar">
          <div>
            <button class="btn-play-primary" data-action="play">▶ PLAY NOW!</button>
            <button class="geo-btn" data-action="details">ℹ Instructions</button>
          </div>
          <span style="font-size: 0.8rem; color: #a0c0a0; font-family: var(--font-mono);">Version v${game.version || '1.0'}</span>
        </div>
      </div>
    `;

    // Event listeners
    card.querySelectorAll('[data-action="play"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.launchGame(game);
      });
    });

    card.querySelector('[data-action="details"]').addEventListener('click', (e) => {
      e.stopPropagation();
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
      <button class="geo-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">◀ Prev</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        html += `<button class="geo-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        html += `<span style="padding: 0 4px; color: #aaa;">…</span>`;
      }
    }

    html += `
      <button class="geo-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">Next ▶</button>
    `;

    this.dom.paginationControls.innerHTML = html;

    this.dom.paginationControls.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-page'), 10);
        if (page >= 1 && page <= totalPages && page !== this.currentPage) {
          this.currentPage = page;
          this.renderCatalog();
          window.scrollTo({ top: this.dom.categoriesBar.offsetTop - 40, behavior: 'smooth' });
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
    this.dom.modalControls.textContent = game.controls || 'Keyboard / Mouse / Touch';
    this.dom.modalVersion.textContent = `v${game.version || '1.0.0'}`;
    this.dom.modalDesc.textContent = game.description || 'No description available.';

    const features = game.features || [
      'High-performance pure Web execution (Zero installation)',
      'Full touch and keyboard controls supported',
      'HTML5 Canvas graphics and sound'
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
