import { MicroGame } from '../../core/MicroGame.js';

export class MarsRover extends MicroGame {
  setupUI() {
    this.createPrompt('DISCOVER ALIEN LIFE!', 'Tap the mysterious creature peeking behind the rocks!');

    this.container.style.backgroundImage = 'url(./assets/martian_bg.png)';
    this.container.style.backgroundSize = 'cover';
    this.container.style.backgroundPosition = 'center';
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.style.cursor = 'crosshair';

    const viewW = this.container.clientWidth || window.innerWidth;
    const viewH = this.container.clientHeight || window.innerHeight;
    const scaleFactor = Math.min(1, Math.max(0.65, viewW / 520));

    // Sci-Fi Rover HUD Overlay
    const hud = document.createElement('div');
    hud.style.position = 'absolute';
    hud.style.top = '0';
    hud.style.left = '0';
    hud.style.width = '100%';
    hud.style.height = '100%';
    hud.style.pointerEvents = 'none';
    hud.style.border = `${viewW < 480 ? 8 : 16}px solid rgba(15, 23, 42, 0.4)`;
    hud.style.boxSizing = 'border-box';
    hud.style.zIndex = '30';

    // HUD Variations
    const hudThemes = [
      { color: '#38bdf8', mode: 'OPTICAL_RADAR', border: 'rgba(56, 189, 248, 0.4)' },
      { color: '#10b981', mode: 'THERMAL_BIO_SCAN', border: 'rgba(16, 185, 129, 0.4)' },
      { color: '#f59e0b', mode: 'SOLAR_FILTER_SPECTRA', border: 'rgba(245, 158, 11, 0.4)' }
    ];
    this.hudTheme = hudThemes[Math.floor(Math.random() * hudThemes.length)];

    hud.innerHTML = `
      <div style="position: absolute; bottom: 8px; left: 10px; right: 10px; display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-family: monospace; color: ${this.hudTheme.color}; font-weight: bold; font-size: clamp(0.65rem, 2.4vw, 0.9rem); text-shadow: 0 0 8px ${this.hudTheme.color};">
        <div>ROVER_ID: BNVLK-9000 // ${this.hudTheme.mode}</div>
        <div>CO2: 95% // BIO_SCAN: ACTIVE</div>
      </div>
      <!-- HUD Crosshair center -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120px; height: 120px; border: 1px dashed ${this.hudTheme.border}; border-radius: 50%;"></div>
    `;
    this.container.appendChild(hud);

    // Rock locations (percentage coordinates + scaled size)
    this.rockPositions = [
      { leftPct: 24, topPct: 36, size: Math.round(140 * scaleFactor) },
      { leftPct: 76, topPct: 38, size: Math.round(130 * scaleFactor) },
      { leftPct: 50, topPct: 58, size: Math.round(160 * scaleFactor) },
      { leftPct: 26, topPct: 78, size: Math.round(150 * scaleFactor) },
      { leftPct: 74, topPct: 76, size: Math.round(150 * scaleFactor) }
    ];

    // Creature Species Variations (Purple Amoeba, Emerald Polypod, Cosmic Pink Jelly)
    const alienSpecies = [
      { body: '#a855f7', glow: '#c084fc', antenna: '#ec4899', eyes: 2 },
      { body: '#10b981', glow: '#34d399', antenna: '#facc15', eyes: 1 },
      { body: '#ec4899', glow: '#f472b6', antenna: '#a855f7', eyes: 3 }
    ];
    const species = alienSpecies[Math.floor(Math.random() * alienSpecies.length)];

    this.alienSize = Math.round(88 * Math.max(0.78, scaleFactor));
    this.alien = document.createElement('div');
    this.alien.className = 'martian-alien';
    this.alien.style.position = 'absolute';
    this.alien.style.width = `${this.alienSize}px`;
    this.alien.style.height = `${this.alienSize}px`;
    this.alien.style.transform = 'translate(-50%, -50%)';
    this.alien.style.cursor = 'pointer';
    this.alien.style.zIndex = '5';
    this.alien.style.transition = 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    this.alien.innerHTML = `
      <div style="width: 100%; height: 100%; position: relative; animation: alienWiggle 0.6s infinite alternate ease-in-out;">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <ellipse cx="50" cy="50" rx="36" ry="34" fill="${species.body}" filter="drop-shadow(0 0 12px ${species.glow})" />
          ${species.eyes === 1 ? `
            <ellipse cx="50" cy="45" rx="14" ry="16" fill="#ffffff" />
            <circle cx="50" cy="46" r="7" fill="#0f172a" />
            <circle cx="48" cy="44" r="3" fill="#ffffff" />
          ` : (species.eyes === 2 ? `
            <ellipse cx="38" cy="45" rx="9" ry="12" fill="#ffffff" />
            <ellipse cx="62" cy="45" rx="9" ry="12" fill="#ffffff" />
            <circle cx="39" cy="46" r="5" fill="#0f172a" />
            <circle cx="63" cy="46" r="5" fill="#0f172a" />
            <circle cx="37" cy="44" r="2" fill="#ffffff" />
            <circle cx="61" cy="44" r="2" fill="#ffffff" />
          ` : `
            <ellipse cx="32" cy="45" rx="8" ry="10" fill="#ffffff" />
            <ellipse cx="50" cy="40" rx="9" ry="11" fill="#ffffff" />
            <ellipse cx="68" cy="45" rx="8" ry="10" fill="#ffffff" />
            <circle cx="33" cy="46" r="4" fill="#0f172a" />
            <circle cx="50" cy="41" r="5" fill="#0f172a" />
            <circle cx="67" cy="46" r="4" fill="#0f172a" />
          `)}
          <!-- Antenna -->
          <circle cx="50" cy="20" r="6" fill="${species.antenna}" />
          <line x1="50" y1="24" x2="50" y2="30" stroke="${species.body}" stroke-width="4" />
          <!-- Smile -->
          <path d="M 42 64 Q 50 70 58 64" stroke="#1e1b4b" stroke-width="3" fill="none" stroke-linecap="round" />
        </svg>
      </div>
    `;

    const catchAlien = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (this.isFinished) return;
      if (this.audio) this.audio.playSfx('alien');
      this.alien.style.transform = 'translate(-50%, -50%) scale(1.6)';
      this.win('Alien lifeform cataloged! Stock price +12%!');
    };

    this.alien.addEventListener('pointerdown', catchAlien);
    this.container.appendChild(this.alien);

    // Create Rocks (z-index 10, above alien so alien peeks from behind)
    this.rockPositions.forEach((pos) => {
      const rock = document.createElement('div');
      rock.style.position = 'absolute';
      rock.style.left = `${pos.leftPct}%`;
      rock.style.top = `${pos.topPct}%`;
      rock.style.width = `${pos.size}px`;
      rock.style.height = `${pos.size * 0.85}px`;
      rock.style.backgroundImage = 'url(./assets/cartoon_rock.png)';
      rock.style.backgroundSize = 'contain';
      rock.style.backgroundRepeat = 'no-repeat';
      rock.style.backgroundPosition = 'center';
      rock.style.transform = 'translate(-50%, -50%)';
      rock.style.cursor = 'pointer';
      rock.style.zIndex = '10';
      rock.style.filter = 'drop-shadow(0 10px 14px rgba(0,0,0,0.4))';

      const tapRock = (e) => {
        if (this.isFinished) return;
        if (this.audio) this.audio.playSfx('thud');
        // Visual rock shake
        rock.style.transform = 'translate(-50%, -50%) scale(0.95)';
        setTimeout(() => {
          rock.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
      };

      rock.addEventListener('pointerdown', tapRock);
      this.container.appendChild(rock);
    });

    // Move alien periodically between rocks
    this.currentRockIndex = Math.floor(Math.random() * this.rockPositions.length);
    this.relocateAlien();
  }

  relocateAlien() {
    if (this.isFinished || this.isPaused) return;
    const viewW = this.container.clientWidth || window.innerWidth;
    const viewH = this.container.clientHeight || window.innerHeight;
    const rock = this.rockPositions[this.currentRockIndex];

    const rockX = (rock.leftPct / 100) * viewW;
    const rockY = (rock.topPct / 100) * viewH;

    // Pick an angle that keeps the alien well inside the viewport bounds
    const offsetDist = rock.size * 0.58;
    const pad = (this.alienSize || 72) * 0.55;
    let targetX = rockX;
    let targetY = rockY;

    for (let attempt = 0; attempt < 8; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const candX = rockX + Math.cos(angle) * offsetDist;
      const candY = rockY + Math.sin(angle) * offsetDist;
      if (candX >= pad && candX <= viewW - pad && candY >= 95 && candY <= viewH - pad) {
        targetX = candX;
        targetY = candY;
        break;
      }
      targetX = Math.max(pad, Math.min(viewW - pad, candX));
      targetY = Math.max(95, Math.min(viewH - pad, candY));
    }

    this.alien.style.left = `${targetX}px`;
    this.alien.style.top = `${targetY}px`;

    if (this.audio) this.audio.playSfx('radar');

    // Pick a new rock for next peek
    let nextIdx = Math.floor(Math.random() * this.rockPositions.length);
    if (nextIdx === this.currentRockIndex) {
      nextIdx = (nextIdx + 1) % this.rockPositions.length;
    }
    this.currentRockIndex = nextIdx;
  }

  start() {
    this.startTimer(4800);

    const speed = this.config.speedMultiplier || 1;
    const intervalTime = Math.max(450, 1800 / speed);

    this.moveInterval = setInterval(() => {
      this.relocateAlien();
    }, intervalTime);
  }

  unmount() {
    super.unmount();
    if (this.moveInterval) clearInterval(this.moveInterval);
  }
}
