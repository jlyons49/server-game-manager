import { MicroGame } from '../../core/MicroGame.js';

export class AutonomousCruise extends MicroGame {
  setupUI() {
    const isNarrow = (this.container.clientWidth || window.innerWidth) < 540;
    this.createPrompt('AVOID THE ICEBERG!', isNarrow ? 'Steer Port or Starboard!' : 'Steer Hard to Port or Starboard! [A / D, ← / →, or Tap]');

    // Main Ocean Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.touchAction = 'none';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // On-screen touch buttons for mobile / mouse ease
    this.createTouchControls();

    // Game state
    this.steered = false;
    this.shipLane = 0; // -1 = port (left), 0 = center, 1 = starboard (right)
    this.currentShipX = 0;
    this.currentShipAngle = 0;

    // Iceberg position: either left (-1) or right (+1)
    // Safe lane is opposite to iceberg
    this.icebergSide = Math.random() > 0.5 ? 1 : -1;
    this.safeLane = -this.icebergSide;

    // Atmospheric Variations (Night, Aurora, Twilight Fog)
    const skyThemes = [
      {
        name: 'Arctic Night',
        skyTop: '#020617',
        horizon: '#0f172a',
        seaTop: '#0c4a6e',
        seaBottom: '#075985',
        hasAurora: false
      },
      {
        name: 'Northern Aurora',
        skyTop: '#064e3b',
        horizon: '#0f172a',
        seaTop: '#042f2e',
        seaBottom: '#0e7490',
        hasAurora: true
      },
      {
        name: 'Twilight Fog',
        skyTop: '#2e1065',
        horizon: '#3b0764',
        seaTop: '#4c1d95',
        seaBottom: '#1e1b4b',
        hasAurora: false
      }
    ];
    this.theme = skyThemes[Math.floor(Math.random() * skyThemes.length)];

    const shipLiveries = [
      { hull: '#0f172a', keel: '#dc2626', funnel: '#f97316', trim: '#eab308' },
      { hull: '#1e1b4b', keel: '#b91c1c', funnel: '#eab308', trim: '#fef08a' },
      { hull: '#064e3b', keel: '#ea580c', funnel: '#f97316', trim: '#eab308' }
    ];
    this.livery = shipLiveries[Math.floor(Math.random() * shipLiveries.length)];

    this.waterScroll = 0;
    this.collisionTriggered = false;
    this.smokePuffs = [];
    this.splashParticles = [];

    this.resizeCanvas();
    this.windowResizeHandler = () => this.resizeCanvas();
    window.addEventListener('resize', this.windowResizeHandler);

    this.bindInputs();
  }

  resizeCanvas() {
    this.canvas.width = this.container.clientWidth || window.innerWidth;
    this.canvas.height = this.container.clientHeight || window.innerHeight;
    this.currentShipX = this.canvas.width / 2;
  }

  createTouchControls() {
    const controls = document.createElement('div');
    controls.style.position = 'absolute';
    controls.style.bottom = '16px';
    controls.style.left = '0';
    controls.style.width = '100%';
    controls.style.display = 'flex';
    controls.style.justifyContent = 'space-between';
    controls.style.gap = '10px';
    controls.style.padding = '0 12px';
    controls.style.boxSizing = 'border-box';
    controls.style.zIndex = '40';
    controls.style.pointerEvents = 'none';

    const isNarrow = (this.container.clientWidth || window.innerWidth) < 560;

    const makeBtn = (text, dir) => {
      const btn = document.createElement('button');
      btn.innerHTML = text;
      btn.style.pointerEvents = 'auto';
      btn.style.flex = '1';
      btn.style.maxWidth = '290px';
      btn.style.background = 'rgba(15, 23, 42, 0.88)';
      btn.style.border = '2px solid #38bdf8';
      btn.style.borderRadius = '50px';
      btn.style.padding = isNarrow ? '12px 10px' : '14px 26px';
      btn.style.fontSize = 'clamp(0.82rem, 3.5vw, 1.25rem)';
      btn.style.fontWeight = 'bold';
      btn.style.color = '#f0f9ff';
      btn.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
      btn.style.cursor = 'pointer';
      btn.style.backdropFilter = 'blur(8px)';
      btn.style.letterSpacing = '0.5px';
      btn.style.whiteSpace = 'nowrap';

      const trigger = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.steer(dir);
      };

      btn.addEventListener('pointerdown', trigger);
      return btn;
    };

    const leftBtn = makeBtn(isNarrow ? '◀ PORT (LEFT)' : '◀ HARD TO PORT [A / ←]', -1);
    const rightBtn = makeBtn(isNarrow ? 'STARBOARD (RIGHT) ▶' : 'HARD TO STARBOARD [D / →] ▶', 1);

    controls.appendChild(leftBtn);
    controls.appendChild(rightBtn);
    this.container.appendChild(controls);
  }

  bindInputs() {
    this.keyHandler = (e) => {
      if (this.steered || this.isFinished) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.steer(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.steer(1);
      }
    };
    window.addEventListener('keydown', this.keyHandler);

    let startX = 0;
    this.canvasPointerDown = (e) => {
      startX = e.clientX;
    };
    this.canvasPointerUp = (e) => {
      if (this.steered || this.isFinished) return;
      const delta = e.clientX - startX;
      if (Math.abs(delta) > 30) {
        this.steer(delta > 0 ? 1 : -1);
      } else {
        const mid = this.canvas.width / 2;
        this.steer(e.clientX < mid ? -1 : 1);
      }
    };

    this.canvas.addEventListener('pointerdown', this.canvasPointerDown);
    this.canvas.addEventListener('pointerup', this.canvasPointerUp);
  }

  steer(dir) {
    if (this.steered || this.isFinished) return;
    this.steered = true;
    this.shipLane = dir;

    if (this.audio) {
      this.audio.playSfx('swish');
    }
  }

  start() {
    // Generous 3800ms timer scaled by speedMultiplier
    this.startTimer(3800);

    // Sound double foghorn warning blast at the start of the encounter
    if (this.audio) {
      this.audio.playSfx('foghorn');
      this.secondHornTimeout = setTimeout(() => {
        if (!this.isFinished && this.audio) {
          this.audio.playSfx('foghorn');
        }
      }, 480);
    }

    this.renderLoop();
  }

  renderLoop() {
    if (this.isFinished) return;

    if (!this.isPaused) {
      this.update();
    }
    this.draw();

    this.animFrame = requestAnimationFrame(() => this.renderLoop());
  }

  update() {
    const progress = 1 - Math.max(0, this.timeRemaining / this.timeLimit);
    this.waterScroll += 12 * (this.config.speedMultiplier || 1);

    // Smooth horizontal position and banking angle
    const laneOffset = this.canvas.width * 0.26;
    const targetX = this.canvas.width / 2 + this.shipLane * laneOffset;
    this.currentShipX += (targetX - this.currentShipX) * 0.16;

    const targetAngle = this.shipLane * 0.16;
    this.currentShipAngle += (targetAngle - this.currentShipAngle) * 0.18;

    // Smokestack smoke emission
    if (Math.random() < 0.6) {
      this.smokePuffs.push({
        x: this.currentShipX + (Math.random() - 0.5) * 12,
        y: this.canvas.height * 0.70 - 45,
        radius: 6 + Math.random() * 4,
        alpha: 0.7,
        vy: -1.5,
        vx: (Math.random() - 0.5) * 0.8
      });
    }

    // Update smoke
    for (let i = this.smokePuffs.length - 1; i >= 0; i--) {
      const p = this.smokePuffs[i];
      p.y += p.vy;
      p.x += p.vx;
      p.radius += 0.35;
      p.alpha -= 0.015;
      if (p.alpha <= 0) {
        this.smokePuffs.splice(i, 1);
      }
    }

    // Collision evaluation when iceberg reaches ship depth
    if (progress >= 0.86 && !this.collisionTriggered) {
      this.collisionTriggered = true;
      if (!this.steered) {
        if (this.audio) this.audio.playSfx('iceCrunch');
        this.lose('Impact dead ahead! Collision sirens blaring!');
      } else if (this.shipLane === this.safeLane) {
        this.win('Iceberg safely evaded! Unsinkable prestige preserved.');
      } else {
        if (this.audio) this.audio.playSfx('iceCrunch');
        this.lose('You steered directly into the iceberg! Hull breached!');
      }
    }
  }

  draw() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    const progress = 1 - Math.max(0, this.timeRemaining / this.timeLimit);

    // Deep Ocean Background (themed)
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, this.theme.skyTop);
    oceanGrad.addColorStop(0.32, this.theme.horizon);
    oceanGrad.addColorStop(0.5, this.theme.seaTop);
    oceanGrad.addColorStop(1, this.theme.seaBottom);
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, w, h);

    // If Aurora theme, draw undulating green/cyan light ribbons
    if (this.theme.hasAurora) {
      ctx.fillStyle = 'rgba(52, 211, 153, 0.22)';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.12);
      ctx.bezierCurveTo(w * 0.3, h * 0.05, w * 0.7, h * 0.22, w, h * 0.08);
      ctx.lineTo(w, h * 0.28);
      ctx.bezierCurveTo(w * 0.6, h * 0.35, w * 0.2, h * 0.2, 0, h * 0.3);
      ctx.closePath();
      ctx.fill();
    }

    // Distant stars / moon glow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 20; i++) {
      const sx = ((i * 137) % w);
      const sy = ((i * 59) % (h * 0.3));
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Animated Ocean Swells & Waves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    for (let y = h * 0.35; y < h; y += 45) {
      const offset = (this.waterScroll + y * 2) % 100;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.25, y + Math.sin(offset * 0.1) * 8, w * 0.75, y - Math.sin(offset * 0.1) * 8, w, y);
      ctx.stroke();
    }

    // Draw Ship's Foaming Wake
    this.drawWake(this.currentShipX, h * 0.85);

    // Draw Approaching Iceberg
    // Exponential scale for 3D perspective feel
    const horizonY = h * 0.35;
    const iceY = horizonY + Math.pow(progress, 1.45) * (h * 0.52);
    const iceScale = 0.35 + progress * 0.95;
    const laneOffset = (w * 0.25) * progress;
    const iceX = w / 2 + this.icebergSide * laneOffset;

    this.drawIceberg(iceX, iceY, iceScale);

    // Draw Smoke puffs
    for (const p of this.smokePuffs) {
      ctx.fillStyle = `rgba(226, 232, 240, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Titanic-style Cruise Ship
    const shipY = h * 0.78;
    this.drawShip(this.currentShipX, shipY);
  }

  drawWake(x, y) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);

    // White foam trails behind the propellers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-45, 120);
    ctx.lineTo(45, 120);
    ctx.lineTo(18, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 15, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawIceberg(x, y, scale) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Subsurface deep blue ice glow (90% underwater)
    const underwaterGrad = ctx.createRadialGradient(0, 40, 10, 0, 50, 110);
    underwaterGrad.addColorStop(0, 'rgba(14, 165, 233, 0.75)');
    underwaterGrad.addColorStop(0.6, 'rgba(3, 105, 161, 0.45)');
    underwaterGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = underwaterGrad;
    ctx.beginPath();
    ctx.ellipse(0, 50, 110, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Above-water Iceberg Peaks (Faceted crystalline polygon)
    // Left cold shadow face
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    ctx.moveTo(0, -95); // Highest peak
    ctx.lineTo(-75, 20); // Left waterline
    ctx.lineTo(-30, 25);
    ctx.lineTo(-10, -30);
    ctx.lineTo(0, -95);
    ctx.closePath();
    ctx.fill();

    // Right illuminated peak face
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.moveTo(0, -95);
    ctx.lineTo(25, -45);
    ctx.lineTo(85, 20); // Right waterline
    ctx.lineTo(20, 26);
    ctx.lineTo(0, -95);
    ctx.closePath();
    ctx.fill();

    // Center faceted shard
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -95);
    ctx.lineTo(-10, -30);
    ctx.lineTo(20, 26);
    ctx.lineTo(25, -45);
    ctx.closePath();
    ctx.fill();

    // Waterline splash and foam
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 22, 85, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Warning Tag Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(-60, -125, 120, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ MASSIVE ICEBERG', 0, -110);

    ctx.restore();
  }

  drawShip(x, y) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);

    // Heel / tilt based on steering
    ctx.rotate(this.currentShipAngle);

    // Ship Water Ripple / Bow Wave
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -95);
    ctx.lineTo(-38, -30);
    ctx.moveTo(0, -95);
    ctx.lineTo(38, -30);
    ctx.stroke();

    // 1. Classic Ocean Liner Hull (themed livery)
    // Keel / underwater trim
    ctx.fillStyle = this.livery.keel;
    ctx.beginPath();
    ctx.moveTo(0, -100);
    ctx.bezierCurveTo(42, -50, 40, 60, 24, 90);
    ctx.lineTo(-24, 90);
    ctx.bezierCurveTo(-40, 60, -42, -50, 0, -100);
    ctx.closePath();
    ctx.fill();

    // Main hull
    ctx.fillStyle = this.livery.hull;
    ctx.beginPath();
    ctx.moveTo(0, -95);
    ctx.bezierCurveTo(38, -48, 36, 55, 22, 84);
    ctx.lineTo(-22, 84);
    ctx.bezierCurveTo(-36, 55, -38, -48, 0, -95);
    ctx.closePath();
    ctx.fill();

    // Gold/Yellow sheer line / trim
    ctx.strokeStyle = this.livery.trim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -93);
    ctx.bezierCurveTo(36, -46, 34, 50, 20, 80);
    ctx.moveTo(0, -93);
    ctx.bezierCurveTo(-36, -46, -34, 50, -20, 80);
    ctx.stroke();

    // White Superstructure (Cabins and Decks)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-22, -65, 44, 115, [14, 14, 6, 6]);
    ctx.fill();

    // Upper bridge deck
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-16, -60, 32, 28, [8, 8, 4, 4]);
    ctx.fill();

    // Bridge Windows (glowing amber)
    ctx.fillStyle = '#f59e0b';
    for (let bx = -12; bx <= 12; bx += 6) {
      ctx.fillRect(bx - 1.5, -56, 3, 4);
    }

    // Promenade Portholes (rows of lights)
    ctx.fillStyle = '#facc15';
    for (let py = -24; py <= 40; py += 12) {
      ctx.beginPath();
      ctx.arc(-14, py, 2, 0, Math.PI * 2);
      ctx.arc(14, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4 Iconic Smokestacks with Black Tops (Funnels - themed)
    const funnelYPositions = [-36, -14, 8, 30];
    funnelYPositions.forEach((fy) => {
      // Funnel shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(-8, fy - 6, 16, 12);

      // Funnel body
      ctx.fillStyle = this.livery.funnel;
      ctx.beginPath();
      ctx.roundRect(-7, fy - 7, 14, 14, 3);
      ctx.fill();

      // Black funnel top
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-7, fy - 7, 14, 5, [3, 3, 0, 0]);
      ctx.fill();

      // Steam whistle highlight
      ctx.fillStyle = '#eab308';
      ctx.fillRect(5, fy - 4, 2, 4);
    });

    // Fore & Aft Cargo Masts with Rigging Lines
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Fore mast
    ctx.moveTo(0, -78);
    ctx.lineTo(0, -78);
    // Rigging wires
    ctx.moveTo(0, -75);
    ctx.lineTo(-14, -62);
    ctx.moveTo(0, -75);
    ctx.lineTo(14, -62);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(0, -75, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Stern Flag (White Star / Benevolink swallowtail ensign)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.lineTo(14, 86);
    ctx.lineTo(0, 92);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  unmount() {
    super.unmount();
    if (this.secondHornTimeout) clearTimeout(this.secondHornTimeout);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    window.removeEventListener('resize', this.windowResizeHandler);
    window.removeEventListener('keydown', this.keyHandler);
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.canvasPointerDown);
      this.canvas.removeEventListener('pointerup', this.canvasPointerUp);
    }
  }
}
