import { MicroGame } from '../../core/MicroGame.js';

export class AntigravityCalibration extends MicroGame {
  setupUI() {
    this.createPrompt('DRAG CARGO TO FLOOR!', 'Pull the floating items all the way down to the green magnetic floor!');

    // Visual Variations for the room
    const themes = [
      {
        name: 'Orbital Cargo Bay',
        bg: 'radial-gradient(ellipse at 50% 30%, #1e1b4b 0%, #090d16 100%)',
        accent: '#818cf8',
        wallDetails: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 80px)'
      },
      {
        name: 'Executive Penthouse',
        bg: 'linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #334155 100%)',
        accent: '#facc15',
        wallDetails: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 50px)'
      },
      {
        name: 'Cyber Research Lab',
        bg: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)',
        accent: '#34d399',
        wallDetails: 'radial-gradient(circle, rgba(52, 211, 153, 0.08) 10%, transparent 11%)'
      }
    ];

    const theme = themes[Math.floor(Math.random() * themes.length)];
    this.container.style.background = theme.bg;
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';

    // Room background pattern / window grid
    const pattern = document.createElement('div');
    pattern.style.position = 'absolute';
    pattern.style.top = '0';
    pattern.style.left = '0';
    pattern.style.width = '100%';
    pattern.style.height = '100%';
    pattern.style.backgroundImage = theme.wallDetails;
    pattern.style.backgroundSize = '80px 80px';
    pattern.style.pointerEvents = 'none';
    pattern.style.opacity = '0.7';
    this.container.appendChild(pattern);

    // Ceiling Danger Shredder Vent
    this.ceilingVent = document.createElement('div');
    this.ceilingVent.style.position = 'absolute';
    this.ceilingVent.style.top = '0';
    this.ceilingVent.style.left = '0';
    this.ceilingVent.style.width = '100%';
    this.ceilingVent.style.height = '48px';
    this.ceilingVent.style.background = 'repeating-linear-gradient(45deg, #ef4444, #ef4444 20px, #b91c1c 20px, #b91c1c 40px)';
    this.ceilingVent.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
    this.ceilingVent.style.display = 'flex';
    this.ceilingVent.style.alignItems = 'center';
    this.ceilingVent.style.justifyContent = 'center';
    this.ceilingVent.style.color = '#fff';
    this.ceilingVent.style.fontWeight = '900';
    this.ceilingVent.style.fontSize = 'clamp(0.72rem, 3vw, 0.95rem)';
    this.ceilingVent.style.letterSpacing = '1px';
    this.ceilingVent.style.textAlign = 'center';
    this.ceilingVent.style.padding = '0 8px';
    this.ceilingVent.style.zIndex = '20';
    this.ceilingVent.innerHTML = '⚠️ CEILING SHREDDER VENTS: ACTIVE ⚠️';
    this.container.appendChild(this.ceilingVent);

    // Floor Safety Magnetic Zone
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.floorZoneHeight = h < 680 ? 96 : 115;
    this.floorZone = document.createElement('div');
    this.floorZone.style.position = 'absolute';
    this.floorZone.style.bottom = '0';
    this.floorZone.style.left = '0';
    this.floorZone.style.width = '100%';
    this.floorZone.style.height = `${this.floorZoneHeight}px`;
    this.floorZone.style.background = 'linear-gradient(to top, rgba(34, 197, 94, 0.45), rgba(34, 197, 94, 0.05))';
    this.floorZone.style.borderTop = '3px dashed #22c55e';
    this.floorZone.style.display = 'flex';
    this.floorZone.style.alignItems = 'center';
    this.floorZone.style.justifyContent = 'center';
    this.floorZone.style.color = '#86efac';
    this.floorZone.style.fontWeight = 'bold';
    this.floorZone.style.fontSize = 'clamp(0.78rem, 3.2vw, 1.1rem)';
    this.floorZone.style.letterSpacing = '0.5px';
    this.floorZone.style.textAlign = 'center';
    this.floorZone.style.padding = '0 12px';
    this.floorZone.style.pointerEvents = 'none';
    this.floorZone.innerHTML = '🧲 SAFE MAGNETIC FLOOR ZONE (DRAG ITEMS HERE)';
    this.container.appendChild(this.floorZone);

    // Diverse, hilarious corporate cargo items
    const cargoTypes = [
      { emoji: '💻', name: 'Workstation' },
      { emoji: '☕', name: 'Hot Coffee' },
      { emoji: '📁', name: 'Confidential Filing' },
      { emoji: '🖨️', name: 'Office Printer' },
      { emoji: '🏆', name: 'Employee of Month Trophy' },
      { emoji: '🪴', name: 'Office Succulent' },
      { emoji: '🍩', name: 'Box of Donuts' },
      { emoji: '📎', name: 'Giant Paperclip' }
    ];

    // Progression: 1 item at low speed, 2 at moderate, 3 at fast, 4 at hyper-speed
    const speed = this.config.speedMultiplier || 1;
    let count = 1;
    if (speed > 2.10) {
      count = 4;
    } else if (speed > 1.35) {
      count = 3;
    } else if (speed > 1.05) {
      count = 2;
    }

    this.items = [];
    this.itemSize = w < 480 ? 96 : 120;

    // Shuffle cargo pool
    const shuffledCargo = [...cargoTypes].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      const type = shuffledCargo[i % shuffledCargo.length];
      const el = document.createElement('div');
      el.className = 'floating-cargo';
      el.style.position = 'absolute';
      // Significantly enlarged clickable and touch-friendly hitbox!
      el.style.width = `${this.itemSize}px`;
      el.style.height = `${this.itemSize}px`;
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = w < 480 ? '3.6rem' : '4.8rem';
      el.style.cursor = 'grab';
      el.style.touchAction = 'none';
      el.style.userSelect = 'none';
      el.style.zIndex = '15';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
      el.style.border = '2px dashed rgba(255, 255, 255, 0.25)';
      el.style.boxShadow = '0 0 20px rgba(129, 140, 248, 0.25)';
      el.style.filter = 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))';
      el.style.transition = 'border-color 0.15s, box-shadow 0.15s';

      // Start position (clamped safely within horizontal screen bounds)
      const availW = Math.max(40, w - this.itemSize - 32);
      const frac = count === 1 ? 0.5 : i / (count - 1);
      const rawX = 16 + frac * availW + (Math.random() - 0.5) * 24;
      const x = Math.max(12, Math.min(w - this.itemSize - 12, rawX));
      const y = h * 0.56 + (Math.random() - 0.5) * 30;

      el.innerHTML = `<span>${type.emoji}</span>`;
      this.container.appendChild(el);

      // Gentle upward float speed
      const baseSpeed = 0.55 + Math.random() * 0.45;
      const itemData = {
        el,
        x,
        y,
        vx: (Math.random() - 0.5) * 1.0,
        vy: -baseSpeed * speed,
        isDragging: false,
        isGrounded: false
      };

      this.bindItemInteractions(itemData);
      this.items.push(itemData);
    }
  }

  bindItemInteractions(item) {
    let startY = 0;
    let startX = 0;

    const onDown = (e) => {
      if (this.isFinished || item.isGrounded) return;
      item.isDragging = true;
      item.el.setPointerCapture(e.pointerId);
      item.el.style.cursor = 'grabbing';
      item.el.style.borderColor = '#38bdf8';
      item.el.style.boxShadow = '0 0 25px rgba(56, 189, 248, 0.6)';
      startY = e.clientY;
      startX = e.clientX;
      if (this.audio) this.audio.playSfx('swish');
    };

    const onMove = (e) => {
      if (!item.isDragging || this.isFinished || item.isGrounded) return;
      const dy = e.clientY - startY;
      const dx = e.clientX - startX;
      startY = e.clientY;
      startX = e.clientX;
      item.y += dy;
      item.x += dx;

      // Check if dragged ALL THE WAY to the magnetic floor zone
      const viewH = this.container.clientHeight || window.innerHeight;
      const magneticThreshold = viewH - this.floorZoneHeight + 10;
      if (item.y + (this.itemSize * 0.5) >= magneticThreshold) {
        this.groundItem(item);
      }
    };

    const onUp = (e) => {
      if (!item.isDragging) return;
      item.isDragging = false;
      try {
        item.el.releasePointerCapture(e.pointerId);
      } catch (err) {}
      item.el.style.cursor = 'grab';
      item.el.style.borderColor = 'rgba(255, 255, 255, 0.25)';
      item.el.style.boxShadow = '0 0 20px rgba(129, 140, 248, 0.25)';

      const viewH = this.container.clientHeight || window.innerHeight;
      const magneticThreshold = viewH - this.floorZoneHeight + 10;
      if (item.y + (this.itemSize * 0.5) >= magneticThreshold) {
        this.groundItem(item);
      }
    };

    item.el.addEventListener('pointerdown', onDown);
    item.el.addEventListener('pointermove', onMove);
    item.el.addEventListener('pointerup', onUp);
    item.el.addEventListener('pointercancel', onUp);
  }

  groundItem(item) {
    if (item.isGrounded) return;
    item.isGrounded = true;
    item.isDragging = false;
    item.vy = 0;
    item.vx = 0;
    // Lock it directly onto the magnetic floor
    const viewH = this.container.clientHeight || window.innerHeight;
    item.y = viewH - this.floorZoneHeight + 8;
    item.el.style.cursor = 'default';
    item.el.style.borderColor = '#22c55e';
    item.el.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
    item.el.style.boxShadow = '0 0 30px rgba(34, 197, 94, 0.8)';
    item.el.style.transform = 'scale(0.92)';

    if (this.audio) this.audio.playSfx('thud');
  }

  start() {
    // 5-second timer
    this.startTimer(5000);
    this.loop();
  }

  loop() {
    if (this.isFinished) return;

    if (this.isPaused) {
      requestAnimationFrame(() => this.loop());
      return;
    }

    const h = this.container.clientHeight || window.innerHeight;
    const w = this.container.clientWidth || window.innerWidth;
    const magneticThreshold = h - this.floorZoneHeight + 10;
    let allGrounded = true;

    for (const item of this.items) {
      if (!item.isGrounded) {
        allGrounded = false;

        if (!item.isDragging) {
          item.y += item.vy;
          item.x += item.vx;

          // Bounce off side walls
          if (item.x < 12) {
            item.x = 12;
            item.vx = Math.abs(item.vx);
          } else if (item.x > w - this.itemSize - 12) {
            item.x = w - this.itemSize - 12;
            item.vx = -Math.abs(item.vx);
          }

          // If moving down and reaches ALL THE WAY into the floor zone, ground it!
          if (item.vy > 0 && (item.y + (this.itemSize * 0.5) >= magneticThreshold)) {
            this.groundItem(item);
            continue;
          }

          // Warning indicator if approaching ceiling vent
          if (item.y < 110) {
            item.el.style.borderColor = '#ef4444';
            item.el.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.9)';
          }

          // Hit ceiling shredder only if reaching the top vent
          if (item.y <= 38) {
            if (this.audio) this.audio.playSfx('shred');
            this.lose('Valuable corporate asset shredded in vent!');
            return;
          }
        }
      } else {
        // Locked on magnetic floor
        item.y = magneticThreshold - 2;
      }

      item.el.style.left = `${item.x}px`;
      item.el.style.top = `${item.y}px`;
    }

    if (allGrounded) {
      if (this.audio) this.audio.playSfx('ding');
      this.win('All cargo safely locked onto magnetic floor!');
      return;
    }

    this.raf = requestAnimationFrame(() => this.loop());
  }

  unmount() {
    super.unmount();
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}
