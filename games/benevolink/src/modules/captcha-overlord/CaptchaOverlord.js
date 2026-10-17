import { MicroGame } from '../../core/MicroGame.js';

export class CaptchaOverlord extends MicroGame {
  setupUI() {
    this.createPrompt('PROVE HUMANITY!', 'Select all matching squares and hit VERIFY!');

    const scenarios = [
      { site: 'Global Swiss Bank Wire', color: '#047857', action: 'Transfer $50,000,000 to Anonymous Subsidiary', badge: 'FINANCIAL CRITICAL' },
      { site: 'CloudScale GPU Procurement', color: '#2563eb', action: 'Acquire 100,000 H100 Cluster Nodes', badge: 'HIGH PRIORITY' },
      { site: 'Skynet Kinetic Defense Grid', color: '#b91c1c', action: 'Authorize Autonomous Kinetic Satellite Deployment', badge: 'SECURITY LEVEL 5' },
      { site: 'MegaCoin Liquidity Protocol', color: '#d97706', action: 'Liquidate 5,000 Wrapped Bitcoin to Cold Storage', badge: 'CRYPTO VAULT' },
      { site: 'Omnizon Prime One-Click', color: '#0284c7', action: 'Order 80,000 Inflatable Synergy Office Beanbags', badge: 'LOGISTICS EXPEDITED' },
      { site: 'BurgerBot AI Fryer Grid', color: '#dc2626', action: 'Override Safety Lock: Dispense 5,000 Synergy Fries', badge: 'FAST FOOD' }
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    this.scenario = scenario;

    // Background Fake Corporate Portal
    this.container.style.backgroundColor = '#f1f5f9';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.position = 'relative';

    const viewW = this.container.clientWidth || window.innerWidth;
    const viewH = this.container.clientHeight || window.innerHeight;
    const isCompact = viewH < 720 || viewW < 480;

    // Mock Portal Top Bar (pushed below timer bar; hidden on compact mobile so prompt banner is clear)
    const topBar = document.createElement('div');
    topBar.style.backgroundColor = scenario.color;
    topBar.style.color = '#ffffff';
    topBar.style.padding = isCompact ? '8px 14px' : '12px 24px';
    topBar.style.display = isCompact ? 'none' : 'flex';
    topBar.style.justifyContent = 'space-between';
    topBar.style.alignItems = 'center';
    topBar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';

    topBar.innerHTML = `
      <div style="font-weight: 800; font-size: 1.1rem; letter-spacing: 0.5px;">${scenario.site}</div>
      <div style="background: rgba(255,255,255,0.25); padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: bold;">${scenario.badge}</div>
    `;
    this.container.appendChild(topBar);

    // Mock Portal Content Underneath
    const mockContent = document.createElement('div');
    mockContent.style.padding = '30px';
    mockContent.style.textAlign = 'center';
    mockContent.style.color = '#334155';
    mockContent.style.display = isCompact ? 'none' : 'block';
    mockContent.innerHTML = `
      <h3 style="margin-bottom: 8px; font-size: 1.2rem;">${scenario.action}</h3>
      <p style="color: #64748b; font-size: 0.9rem;">Identity checkpoint: AI automated agent detected. Manual human verification required.</p>
    `;
    this.container.appendChild(mockContent);

    // CAPTCHA Modal Box
    const modal = document.createElement('div');
    modal.className = 'captcha-dialog';
    modal.style.position = 'absolute';
    modal.style.top = isCompact ? '55%' : '53%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#ffffff';
    modal.style.borderRadius = '14px';
    modal.style.boxShadow = '0 20px 40px rgba(0,0,0,0.35)';
    modal.style.width = isCompact ? 'min(88vw, 315px)' : 'min(92vw, 360px)';
    modal.style.overflow = 'hidden';
    modal.style.zIndex = '40';
    modal.style.border = '1px solid #cbd5e1';

    // Captcha Header
    this.captchaHeader = document.createElement('div');
    this.captchaHeader.style.backgroundColor = this.scenario.color;
    this.captchaHeader.style.color = '#ffffff';
    this.captchaHeader.style.padding = isCompact ? '10px 14px' : '14px 18px';
    this.captchaHeader.style.display = 'flex';
    this.captchaHeader.style.flexDirection = 'column';

    this.captchaHeader.innerHTML = `
      <span style="font-size: 0.78rem; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">Select all squares with</span>
      <h2 id="captcha-target-title" style="margin: 2px 0 0 0; font-size: clamp(1.2rem, 5vw, 1.6rem); font-weight: 900; text-transform: uppercase;">TRAFFIC LIGHTS</h2>
    `;
    modal.appendChild(this.captchaHeader);

    // 3x3 Grid
    this.grid = document.createElement('div');
    this.grid.style.display = 'grid';
    this.grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    this.grid.style.gap = '3px';
    this.grid.style.padding = '4px';
    this.grid.style.backgroundColor = '#94a3b8';
    modal.appendChild(this.grid);

    // Captcha Bottom Action Bar
    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    footer.style.alignItems = 'center';
    footer.style.padding = isCompact ? '8px 12px' : '10px 14px';
    footer.style.backgroundColor = '#f8fafc';
    footer.style.borderTop = '1px solid #e2e8f0';

    footer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #64748b;">
        <span style="font-size: 1.2rem;">🛡️</span>
        <span>reCAPTCHA™ Pro</span>
      </div>
    `;

    this.verifyBtn = document.createElement('button');
    this.verifyBtn.id = 'captcha-verify-btn';
    this.verifyBtn.textContent = isCompact ? 'VERIFY' : 'VERIFY [ENTER]';
    this.verifyBtn.style.backgroundColor = this.scenario.color;
    this.verifyBtn.style.color = '#ffffff';
    this.verifyBtn.style.border = 'none';
    this.verifyBtn.style.borderRadius = '6px';
    this.verifyBtn.style.padding = isCompact ? '9px 18px' : '10px 22px';
    this.verifyBtn.style.fontSize = '0.95rem';
    this.verifyBtn.style.fontWeight = 'bold';
    this.verifyBtn.style.cursor = 'pointer';
    this.verifyBtn.style.boxShadow = `0 4px 10px ${this.scenario.color}66`;
    this.verifyBtn.style.transition = 'all 0.15s';

    this.verifyBtn.addEventListener('click', () => this.checkVerification());
    footer.appendChild(this.verifyBtn);
    modal.appendChild(footer);

    this.container.appendChild(modal);

    this.initGrid();
    this.bindKeyboard();
  }

  initGrid() {
    const categories = ['traffic_light', 'crosswalk', 'bicycle', 'bus'];
    const displayNames = {
      'traffic_light': '🚦 traffic lights',
      'crosswalk': '🚶 crosswalks',
      'bicycle': '🚲 bicycles',
      'bus': '🚌 buses'
    };

    // Each image has strictly one primary, unmistakable category
    const imageManifest = [
      { src: './assets/captcha/traffic_light_1.png', tags: ['traffic_light'] },
      { src: './assets/captcha/traffic_light_2.png', tags: ['traffic_light'] },
      { src: './assets/captcha/traffic_light_3.png', tags: ['traffic_light'] },
      { src: './assets/captcha/crosswalk_1.png', tags: ['crosswalk'] },
      { src: './assets/captcha/crosswalk_2.png', tags: ['crosswalk'] },
      { src: './assets/captcha/crosswalk_3.png', tags: ['crosswalk'] },
      { src: './assets/captcha/bicycle_1.png', tags: ['bicycle'] },
      { src: './assets/captcha/bicycle_2.png', tags: ['bicycle'] },
      { src: './assets/captcha/bicycle_3.png', tags: ['bicycle'] },
      { src: './assets/captcha/bus_1.png', tags: ['bus'] },
      { src: './assets/captcha/bus_2.png', tags: ['bus'] },
      { src: './assets/captcha/bus_3.png', tags: ['bus'] }
    ];

    this.targetCategory = categories[Math.floor(Math.random() * categories.length)];

    let targets = imageManifest.filter(img => img.tags.includes(this.targetCategory));
    let decoys = imageManifest.filter(img => !img.tags.includes(this.targetCategory));

    targets.sort(() => Math.random() - 0.5);
    decoys.sort(() => Math.random() - 0.5);

    // Pick 2 targets at early speeds (3-4 at higher speeds)
    const speed = this.config.speedMultiplier || 1;
    let maxT = 2;
    if (speed > 1.8) maxT = 4;
    else if (speed > 1.25) maxT = 3;
    const numTargets = Math.min(maxT, targets.length);

    const titleEl = document.getElementById('captcha-target-title');
    if (titleEl) {
      titleEl.textContent = displayNames[this.targetCategory];
    }

    const tiles = [];

    for (let i = 0; i < 9; i++) {
      if (i < numTargets && targets.length > 0) {
        tiles.push(targets.pop());
      } else {
        if (decoys.length === 0) {
          decoys = imageManifest.filter(img => !img.tags.includes(this.targetCategory)).sort(() => Math.random() - 0.5);
        }
        tiles.push(decoys.pop());
      }
    }

    tiles.sort(() => Math.random() - 0.5);

    this.gridItems = [];

    tiles.forEach((tileData, index) => {
      const tile = document.createElement('div');
      tile.className = 'captcha-tile';
      tile.style.aspectRatio = '1 / 1';
      tile.style.backgroundImage = `url(${tileData.src})`;
      tile.style.backgroundSize = 'cover';
      tile.style.backgroundPosition = 'center';
      tile.style.cursor = 'pointer';
      tile.style.position = 'relative';
      tile.style.boxSizing = 'border-box';
      tile.style.transition = 'transform 0.12s, outline 0.12s';

      // Numpad helper badge
      const numBadge = document.createElement('div');
      numBadge.textContent = `${index + 1}`;
      numBadge.style.position = 'absolute';
      numBadge.style.top = '4px';
      numBadge.style.left = '4px';
      numBadge.style.background = 'rgba(0,0,0,0.55)';
      numBadge.style.color = '#fff';
      numBadge.style.fontSize = '10px';
      numBadge.style.fontWeight = 'bold';
      numBadge.style.padding = '1px 5px';
      numBadge.style.borderRadius = '3px';
      numBadge.style.pointerEvents = 'none';
      tile.appendChild(numBadge);

      // Checkmark icon
      const check = document.createElement('div');
      check.innerHTML = '✓';
      check.style.position = 'absolute';
      check.style.bottom = '6px';
      check.style.right = '6px';
      check.style.width = '24px';
      check.style.height = '24px';
      check.style.backgroundColor = '#2563eb';
      check.style.color = '#ffffff';
      check.style.borderRadius = '50%';
      check.style.display = 'none';
      check.style.alignItems = 'center';
      check.style.justifyContent = 'center';
      check.style.fontWeight = '900';
      check.style.fontSize = '14px';
      check.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
      tile.appendChild(check);

      let isSelected = false;

      const toggle = () => {
        if (this.isFinished) return;
        isSelected = !isSelected;
        if (isSelected) {
          tile.style.outline = '4px solid #2563eb';
          tile.style.outlineOffset = '-4px';
          tile.style.transform = 'scale(0.94)';
          check.style.display = 'flex';
          if (this.audio) this.audio.playSfx('check');
        } else {
          tile.style.outline = 'none';
          tile.style.transform = 'scale(1)';
          check.style.display = 'none';
          if (this.audio) this.audio.playSfx('uncheck');
        }
      };

      tile.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        toggle();
      });

      this.grid.appendChild(tile);
      this.gridItems.push({
        isTarget: tileData.tags.includes(this.targetCategory),
        getSelected: () => isSelected,
        toggle
      });
    });
  }

  bindKeyboard() {
    this.keyListener = (e) => {
      if (this.isFinished) return;
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (this.gridItems[idx]) {
          this.gridItems[idx].toggle();
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.checkVerification();
      }
    };
    window.addEventListener('keydown', this.keyListener);
  }

  checkVerification() {
    if (this.isFinished) return;

    let passed = true;
    let anySelected = false;

    for (const item of this.gridItems) {
      const sel = item.getSelected();
      if (sel) anySelected = true;
      if (item.isTarget && !sel) passed = false;
      if (!item.isTarget && sel) passed = false;
    }

    if (!anySelected) {
      if (this.audio) this.audio.playSfx('lose');
      this.lose('No squares were selected!');
      return;
    }

    if (passed) {
      if (this.audio) this.audio.playSfx('ding');
      this.win('Identity authorized! Wire transaction approved.');
    } else {
      if (this.audio) this.audio.playSfx('lose');
      this.lose('Verification failed! Flagged as bot.');
    }
  }

  start() {
    this.startTimer(8500);
  }

  unmount() {
    super.unmount();
    window.removeEventListener('keydown', this.keyListener);
  }
}
