import { MicroGame } from '../../core/MicroGame.js';

export class SockSorter extends MicroGame {
  setupUI() {
    this.createPrompt('TRASH THE HOLEY SOCK!', 'Find the sock with a hole and drag it to the trash!');

    // Room Theme variations
    const roomThemes = [
      {
        bg: '#fdf4dc',
        safeBg: 'rgba(255, 255, 255, 0.75)',
        trashGrad: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
        trashIcon: '🗑️',
        trashLabel: 'DROP DEFECTIVE SOCK HERE',
        trashShadow: 'rgba(239, 68, 68, 0.35)'
      },
      {
        bg: '#f1f5f9',
        safeBg: 'rgba(255, 255, 255, 0.85)',
        trashGrad: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
        trashIcon: '♻️',
        trashLabel: 'RECYCLE DAMAGED SOCK HERE',
        trashShadow: 'rgba(16, 185, 129, 0.35)'
      },
      {
        bg: '#fae8ff',
        safeBg: 'rgba(255, 255, 255, 0.8)',
        trashGrad: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        trashIcon: '☣️',
        trashLabel: 'INCINERATE FRAYED SOCK HERE',
        trashShadow: 'rgba(139, 92, 246, 0.35)'
      }
    ];
    this.theme = roomThemes[Math.floor(Math.random() * roomThemes.length)];

    this.container.style.backgroundColor = this.theme.bg;
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.justifyContent = 'space-between';
    this.container.style.userSelect = 'none';

    // Top Laundry Basket (Safe/Good zone visual)
    this.laundryZone = document.createElement('div');
    this.laundryZone.style.display = 'flex';
    this.laundryZone.style.alignItems = 'center';
    this.laundryZone.style.justifyContent = 'center';
    this.laundryZone.style.margin = '86px auto 0 auto';
    this.laundryZone.style.maxWidth = '92vw';
    this.laundryZone.style.padding = '6px 16px';
    this.laundryZone.style.background = this.theme.safeBg;
    this.laundryZone.style.border = '2px dashed #94a3b8';
    this.laundryZone.style.borderRadius = '20px';
    this.laundryZone.style.color = '#475569';
    this.laundryZone.style.fontWeight = 'bold';
    this.laundryZone.style.fontSize = 'clamp(0.78rem, 3.2vw, 1.05rem)';
    this.laundryZone.style.textAlign = 'center';
    this.laundryZone.innerHTML = '🧺 SAFE PILE (Do not discard intact socks)';
    this.container.appendChild(this.laundryZone);

    // Bottom Trash Drop Zone
    this.trashZone = document.createElement('div');
    this.trashZone.id = 'trash-zone';
    this.trashZone.style.position = 'absolute';
    this.trashZone.style.bottom = '16px';
    this.trashZone.style.left = '50%';
    this.trashZone.style.transform = 'translateX(-50%)';
    this.trashZone.style.width = 'min(88vw, 360px)';
    this.trashZone.style.height = 'clamp(96px, 16dvh, 120px)';
    this.trashZone.style.background = this.theme.trashGrad;
    this.trashZone.style.borderRadius = '24px';
    this.trashZone.style.border = '4px dashed rgba(255,255,255,0.7)';
    this.trashZone.style.display = 'flex';
    this.trashZone.style.flexDirection = 'column';
    this.trashZone.style.alignItems = 'center';
    this.trashZone.style.justifyContent = 'center';
    this.trashZone.style.color = '#ffffff';
    this.trashZone.style.boxShadow = `0 12px 28px ${this.theme.trashShadow}`;
    this.trashZone.style.transition = 'transform 0.15s, box-shadow 0.15s';
    this.trashZone.innerHTML = `
      <span style="font-size: clamp(2rem, 6vw, 2.8rem); line-height: 1;">${this.theme.trashIcon}</span>
      <span style="font-weight: 900; font-size: clamp(0.82rem, 3.2vw, 1.05rem); letter-spacing: 0.5px; margin-top: 4px; text-align: center; padding: 0 8px;">${this.theme.trashLabel}</span>
    `;
    this.container.appendChild(this.trashZone);

    // Socks Spawn Area - starts with just 3 socks for an easy start
    const speed = this.config.speedMultiplier || 1;
    const numSocks = speed <= 1.05 ? 3 : (speed <= 1.3 ? 4 : Math.min(7, Math.floor(3 + speed * 2)));
    this.socks = [];
    const holeIndex = Math.floor(Math.random() * numSocks);

    const sockPalettes = [
      { body: '#f87171', accent: '#ffffff', stripe: '#fef2f2' }, // Cherry Coral
      { body: '#3b82f6', accent: '#ffffff', stripe: '#eff6ff' }, // Royal Blue
      { body: '#10b981', accent: '#fef3c7', stripe: '#ecfdf5' }, // Mint & Cream
      { body: '#f59e0b', accent: '#ffffff', stripe: '#fffbeb' }, // Mustard Gold
      { body: '#8b5cf6', accent: '#ffffff', stripe: '#f5f3ff' }, // Cozy Purple
      { body: '#ec4899', accent: '#ffffff', stripe: '#fdf2f8' }, // Strawberry Pink
      { body: '#06b6d4', accent: '#ffffff', stripe: '#ecfeff' }  // Cyan Aqua
    ];

    for (let i = 0; i < numSocks; i++) {
      const isHoley = (i === holeIndex);
      const palette = sockPalettes[i % sockPalettes.length];
      this.createSock(isHoley, palette, i, numSocks);
    }
  }

  createSock(hasHole, palette, index, total) {
    const viewW = this.container.clientWidth || window.innerWidth;
    const viewH = this.container.clientHeight || window.innerHeight;
    const sockW = viewW < 480 ? 84 : 96;
    const sockH = viewW < 480 ? 100 : 115;

    const sock = document.createElement('div');
    sock.className = 'draggable-sock';
    sock.style.position = 'absolute';
    sock.style.width = `${sockW}px`;
    sock.style.height = `${sockH}px`;
    sock.style.cursor = 'grab';
    sock.style.touchAction = 'none';
    sock.style.zIndex = '10';

    // Scatter within center region of screen, safely between laundryZone and trashZone
    const areaW = Math.min(viewW * 0.84, 500);
    const leftBase = Math.max(12, viewW / 2 - areaW / 2);
    const randomX = leftBase + Math.random() * Math.max(20, areaW - sockW);
    const minY = 135;
    const maxY = Math.max(minY + 40, viewH - 145 - sockH);
    const randomY = minY + Math.random() * (maxY - minY);
    const rotation = (Math.random() - 0.5) * 60;

    sock.style.left = `${randomX}px`;
    sock.style.top = `${randomY}px`;
    sock.style.transform = `rotate(${rotation}deg)`;
    sock.dataset.rotation = rotation;
    sock.dataset.hasHole = hasHole ? 'true' : 'false';

    // High quality cartoon sock SVG graphic
    sock.innerHTML = `
      <svg viewBox="0 0 100 120" width="100%" height="100%" style="filter: drop-shadow(0 8px 12px rgba(0,0,0,0.22)); overflow: visible;">
        <!-- Sock Main Body -->
        <path d="M 32 18 L 66 18 L 66 54 C 66 64, 72 70, 80 72 C 88 74, 96 80, 96 89 C 96 97, 88 103, 76 103 C 60 103, 44 103, 34 100 C 22 97, 18 86, 20 76 C 22 66, 28 58, 32 52 Z" 
              fill="${palette.body}" stroke="#1e293b" stroke-width="3" stroke-linejoin="round" />
        
        <!-- Sporty Calf Stripes -->
        <path d="M 32 28 L 66 28" stroke="${palette.stripe}" stroke-width="4.5" stroke-linecap="butt" />
        <path d="M 32 37 L 66 37" stroke="${palette.stripe}" stroke-width="3" stroke-linecap="butt" />
        
        <!-- Contrasting Heel Patch -->
        <path d="M 32 60 C 26 66, 22 74, 20 84 C 20 92, 26 98, 34 100 C 40 98, 44 88, 42 78 C 40 68, 36 62, 32 60 Z" 
              fill="${palette.accent}" stroke="#1e293b" stroke-width="2.5" />
        
        <!-- Contrasting Toe Cap -->
        <path d="M 76 72 C 84 74, 94 80, 96 89 C 96 97, 88 103, 76 103 C 74 98, 73 90, 73 85 C 73 80, 74 75, 76 72 Z" 
              fill="${palette.accent}" stroke="#1e293b" stroke-width="2.5" />
        
        <!-- Inner Fabric Highlight Curvature -->
        <path d="M 36 22 L 36 50 C 36 58, 42 66, 52 71 L 68 76" 
              fill="none" stroke="rgba(255, 255, 255, 0.4)" stroke-width="2.5" stroke-linecap="round" />

        <!-- Ribbed Top Cuff -->
        <rect x="29" y="8" width="40" height="13" rx="4" fill="${palette.accent}" stroke="#1e293b" stroke-width="3" />
        <line x1="37" y1="9" x2="37" y2="20" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
        <line x1="45" y1="9" x2="45" y2="20" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
        <line x1="53" y1="9" x2="53" y2="20" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
        <line x1="61" y1="9" x2="61" y2="20" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />

        ${hasHole ? `
          <!-- Frayed Tear Opening at the Toe -->
          <path d="M 77 87 L 79 89 L 76 91 L 79 92 L 77 94 L 80 95 L 82 98 L 84 96 L 87 98 L 90 96 L 93 97 L 95 94 L 97 91 L 95 88 L 97 85 L 94 83 L 91 81 L 88 83 L 85 80 L 82 82 L 79 84 Z" 
                fill="#0f172a" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />
          
          <!-- Cute Toes Poking Through the Hole! -->
          <ellipse cx="83" cy="88" rx="4.5" ry="5.5" fill="#fbcfe8" stroke="#f472b6" stroke-width="1" />
          <ellipse cx="89" cy="89" rx="4" ry="4.8" fill="#fbcfe8" stroke="#f472b6" stroke-width="1" />
          <ellipse cx="94" cy="92" rx="3.2" ry="3.8" fill="#fbcfe8" stroke="#f472b6" stroke-width="1" />
          <!-- Toe Light Glints -->
          <circle cx="82" cy="86" r="1.2" fill="#ffffff" />
          <circle cx="88" cy="87" r="1.2" fill="#ffffff" />
          <circle cx="93" cy="90" r="1.0" fill="#ffffff" />

          <!-- Dangling Frayed Yarn Thread -->
          <path d="M 85 97 Q 88 104, 84 107" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
        ` : ''}
      </svg>
    `;

    this.container.appendChild(sock);
    this.socks.push(sock);
    this.bindDrag(sock);
  }

  bindDrag(sock) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;

    const onPointerDown = (e) => {
      if (this.isFinished) return;
      isDragging = true;
      sock.setPointerCapture(e.pointerId);
      sock.style.cursor = 'grabbing';
      sock.style.zIndex = '100';
      sock.style.transform = `scale(1.15) rotate(0deg)`;

      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseFloat(sock.style.left);
      origTop = parseFloat(sock.style.top);

      if (this.audio) this.audio.playSfx('swish');
    };

    const onPointerMove = (e) => {
      if (!isDragging || this.isFinished) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      sock.style.left = `${origLeft + dx}px`;
      sock.style.top = `${origTop + dy}px`;

      // Check hover over trash
      const trashRect = this.trashZone.getBoundingClientRect();
      const sockRect = sock.getBoundingClientRect();
      const isOverTrash = (
        sockRect.left + sockRect.width / 2 > trashRect.left &&
        sockRect.left + sockRect.width / 2 < trashRect.right &&
        sockRect.top + sockRect.height / 2 > trashRect.top &&
        sockRect.top + sockRect.height / 2 < trashRect.bottom
      );

      if (isOverTrash) {
        this.trashZone.style.transform = 'translateX(-50%) scale(1.08)';
        this.trashZone.style.boxShadow = '0 16px 36px rgba(239, 68, 68, 0.6)';
      } else {
        this.trashZone.style.transform = 'translateX(-50%) scale(1)';
        this.trashZone.style.boxShadow = '0 12px 28px rgba(239, 68, 68, 0.35)';
      }
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        sock.releasePointerCapture(e.pointerId);
      } catch (err) { }
      sock.style.cursor = 'grab';
      sock.style.zIndex = '10';
      sock.style.transform = `rotate(${sock.dataset.rotation}deg)`;
      this.trashZone.style.transform = 'translateX(-50%) scale(1)';

      // Check drop on trash (generous hit area)
      const trashRect = this.trashZone.getBoundingClientRect();
      const sockRect = sock.getBoundingClientRect();
      const sockCenterX = sockRect.left + sockRect.width / 2;
      const sockCenterY = sockRect.top + sockRect.height / 2;

      const isOverTrash = (
        (sockCenterX > trashRect.left - 40 && sockCenterX < trashRect.right + 40 &&
         sockCenterY > trashRect.top - 40 && sockCenterY < trashRect.bottom + 40) ||
        (sockCenterY > window.innerHeight * 0.72)
      );

      if (isOverTrash) {
        const hasHole = sock.dataset.hasHole === 'true';
        if (hasHole) {
          sock.remove();
          if (this.audio) this.audio.playSfx('shred');
          this.win('Defective sock neutralized!');
        } else {
          if (this.audio) this.audio.playSfx('lose');
          this.lose('You trashed a pristine company garment!');
        }
      }
    };

    sock.addEventListener('pointerdown', onPointerDown);
    sock.addEventListener('pointermove', onPointerMove);
    sock.addEventListener('pointerup', onPointerUp);
    sock.addEventListener('pointercancel', onPointerUp);
  }

  start() {
    this.startTimer(5200);
  }
}
