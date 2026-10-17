/**
 * DebugHUD.js
 * Comprehensive in-game Developer Debug Overlay & Controller for Actual Individual.
 */
export class DebugHUD {
  constructor(gameManager) {
    this.gm = gameManager;
    this.gm.isDebugMode = true;
    this.isCollapsed = false;
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();

    this.createDOM();
    this.bindKeyboard();
    this.startTelemetryLoop();
  }

  createDOM() {
    this.hud = document.createElement('div');
    this.hud.id = 'debug-hud';
    this.hud.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 99999;
      width: min(94vw, 440px);
      background: rgba(15, 23, 42, 0.94);
      color: #f8fafc;
      font-family: 'JetBrains Mono', monospace, system-ui;
      font-size: 12px;
      border-radius: 12px;
      border: 1px solid rgba(56, 189, 248, 0.35);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.2);
      backdrop-filter: blur(12px);
      user-select: none;
      transition: transform 0.2s ease, opacity 0.2s ease;
      overflow: hidden;
    `;

    this.hud.innerHTML = `
      <!-- Debug Top Header -->
      <div id="debug-drag-handle" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(30, 41, 59, 0.9);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px;">🐛</span>
          <strong style="color: #38bdf8; font-size: 12px; letter-spacing: 0.5px;">BENEVOLINK DEBUG SUITE</strong>
          <span id="dbg-status-pill" style="
            background: #10b981;
            color: #000;
            padding: 1px 6px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: bold;
          ">RUNNING</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="dbg-fps" style="color: #94a3b8; font-size: 11px;">60 FPS</span>
          <button id="dbg-toggle-collapse" style="
            background: none;
            border: 1px solid #475569;
            color: #cbd5e1;
            border-radius: 4px;
            padding: 2px 6px;
            cursor: pointer;
            font-size: 11px;
          " title="Toggle collapse [~]">_</button>
        </div>
      </div>

      <!-- Debug Body -->
      <div id="debug-body" style="padding: 10px 12px; display: flex; flex-direction: column; gap: 10px; max-height: 84vh; overflow-y: auto;">
        
        <!-- Quick Action Playback Bar -->
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button id="dbg-btn-pause" style="flex: 1; min-width: 90px; padding: 6px 8px; background: #eab308; color: #000; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">
            ⏸️ PAUSE [P]
          </button>
          <button id="dbg-btn-step" style="flex: 1; min-width: 80px; padding: 6px 8px; background: #3b82f6; color: #fff; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">
            ⏭️ STEP [.]
          </button>
          <button id="dbg-btn-restart" style="flex: 1; min-width: 80px; padding: 6px 8px; background: #64748b; color: #fff; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">
            🔄 RESTART [R]
          </button>
          <button id="dbg-btn-win" style="flex: 1; min-width: 65px; padding: 6px 8px; background: #10b981; color: #000; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">
            ⭐ WIN [W]
          </button>
          <button id="dbg-btn-lose" style="flex: 1; min-width: 65px; padding: 6px 8px; background: #ef4444; color: #fff; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">
            ❌ LOSE [L]
          </button>
        </div>

        <!-- Minigame Quick Select -->
        <div style="background: rgba(30, 41, 59, 0.6); padding: 8px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 6px; font-weight: bold; text-transform: uppercase;">
            🎮 JUMP TO MINIGAME [1-9]
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;" id="dbg-minigame-grid">
            <!-- Buttons populated dynamically -->
          </div>
        </div>

        <!-- Speed & Timing Controls -->
        <div style="background: rgba(30, 41, 59, 0.6); padding: 8px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; margin-bottom: 4px; font-weight: bold;">
            <span>⚡ SPEED MULTIPLIER</span>
            <span id="dbg-speed-val" style="color: #38bdf8; font-weight: bold;">0.85x</span>
          </div>
          <input type="range" id="dbg-speed-slider" min="0.1" max="4.5" step="0.05" value="0.85" style="width: 100%; accent-color: #38bdf8; cursor: pointer;" />
          <div style="display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap;">
            <button class="dbg-preset-btn" data-spd="0.5">0.5x</button>
            <button class="dbg-preset-btn" data-spd="0.85">0.85x</button>
            <button class="dbg-preset-btn" data-spd="1.0">1.0x</button>
            <button class="dbg-preset-btn" data-spd="1.5">1.5x</button>
            <button class="dbg-preset-btn" data-spd="2.0">2.0x</button>
            <button class="dbg-preset-btn" data-spd="2.5">2.5x</button>
            <button class="dbg-preset-btn" data-spd="3.0">3.0x</button>
          </div>
        </div>

        <!-- Cheats & Toggles -->
        <div style="display: flex; gap: 6px;">
          <button id="dbg-btn-time" style="flex: 1; padding: 6px; background: rgba(51, 65, 85, 0.8); color: #e2e8f0; border: 1px solid #475569; border-radius: 6px; cursor: pointer; font-size: 11px;">
            ⏳ Infinite Time: <strong id="dbg-time-status">OFF</strong> [T]
          </button>
          <button id="dbg-btn-god" style="flex: 1; padding: 6px; background: rgba(51, 65, 85, 0.8); color: #e2e8f0; border: 1px solid #475569; border-radius: 6px; cursor: pointer; font-size: 11px;">
            🛡️ God Mode: <strong id="dbg-god-status">OFF</strong> [G]
          </button>
        </div>

        <!-- Telemetry Info -->
        <div style="background: rgba(15, 23, 42, 0.7); padding: 8px; border-radius: 6px; font-size: 11px; line-height: 1.5; border: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Active Game:</span>
            <span id="dbg-active-name" style="color: #f1f5f9; font-weight: bold;">None</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Time Remaining:</span>
            <span id="dbg-timer-val" style="color: #f1f5f9; font-weight: bold;">-- ms</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Synergy Score:</span>
            <span id="dbg-score-val" style="color: #f1f5f9; font-weight: bold;">0</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Strikes Left:</span>
            <span id="dbg-strikes-val" style="color: #f1f5f9; font-weight: bold;">4 / 4</span>
          </div>
        </div>

        <!-- Audio Soundboard Trigger -->
        <div style="background: rgba(30, 41, 59, 0.6); padding: 8px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px; font-weight: bold;">
            🔊 SFX SOUNDBOARD
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;" id="dbg-sfx-grid">
            <!-- Buttons populated dynamically -->
          </div>
        </div>

        <!-- Footer Links & Hotkey Helper -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b; padding-top: 2px;">
          <span>Hotkeys: [P]ause, [.]Step, [W]in, [L]ose, [R]estart, [1-8]Jump</span>
          <a href="./index.html" style="color: #38bdf8; text-decoration: none; font-weight: bold;">🎮 NORMAL MODE ▶</a>
        </div>

      </div>
    `;

    document.body.appendChild(this.hud);

    // Style preset buttons
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .dbg-preset-btn {
        flex: 1;
        padding: 4px 0;
        background: rgba(51, 65, 85, 0.8);
        color: #cbd5e1;
        border: 1px solid #475569;
        border-radius: 4px;
        font-size: 10px;
        cursor: pointer;
        transition: all 0.1s;
      }
      .dbg-preset-btn:hover {
        background: #38bdf8;
        color: #000;
        font-weight: bold;
      }
      .dbg-game-btn {
        padding: 5px 2px;
        background: rgba(51, 65, 85, 0.9);
        color: #f1f5f9;
        border: 1px solid #475569;
        border-radius: 5px;
        font-size: 10px;
        cursor: pointer;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: all 0.12s;
      }
      .dbg-game-btn:hover {
        background: #2563eb;
        border-color: #60a5fa;
      }
      .dbg-sfx-btn {
        padding: 3px 6px;
        background: rgba(51, 65, 85, 0.7);
        color: #94a3b8;
        border: 1px solid #475569;
        border-radius: 4px;
        font-size: 9px;
        cursor: pointer;
      }
      .dbg-sfx-btn:hover {
        background: #10b981;
        color: #000;
        font-weight: bold;
      }
    `;
    document.head.appendChild(styleSheet);

    this.bindDOMEvents();
    this.populateMinigames();
    this.populateSoundboard();
  }

  populateMinigames() {
    const grid = document.getElementById('dbg-minigame-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const shortNames = [
      '1:Car', '2:Cruise', '3:Sock', '4:Rover',
      '5:Captcha', '6:Antigrav', '7:Server', '8:Coffee', '9:Drone'
    ];

    this.gm.moduleRegistry.forEach((mod, idx) => {
      const btn = document.createElement('button');
      btn.className = 'dbg-game-btn';
      btn.innerHTML = `${mod.icon} ${shortNames[idx] || mod.name}`;
      btn.title = `Launch ${mod.name} [Press ${idx + 1}]`;
      btn.addEventListener('click', () => {
        this.gm.loadSpecificModule(idx, { speed: this.gm.speedMultiplier });
        this.updateHUDState();
      });
      grid.appendChild(btn);
    });
  }

  populateSoundboard() {
    const sfxGrid = document.getElementById('dbg-sfx-grid');
    if (!sfxGrid) return;
    sfxGrid.innerHTML = '';

    const effects = ['ding', 'win', 'lose', 'alarm', 'quack', 'screech', 'thud', 'foghorn', 'iceCrunch', 'shred', 'pour', 'fireExtinguisher', 'splash', 'dogBark', 'boing'];

    effects.forEach(sfx => {
      const btn = document.createElement('button');
      btn.className = 'dbg-sfx-btn';
      btn.textContent = sfx;
      btn.addEventListener('click', () => {
        if (this.gm.audio) {
          this.gm.audio.resume();
          this.gm.audio.playSfx(sfx);
        }
      });
      sfxGrid.appendChild(btn);
    });
  }

  bindDOMEvents() {
    // Collapse toggle
    const toggleBtn = document.getElementById('dbg-toggle-collapse');
    const dragHandle = document.getElementById('debug-drag-handle');
    const body = document.getElementById('debug-body');

    const toggleCollapse = () => {
      this.isCollapsed = !this.isCollapsed;
      body.style.display = this.isCollapsed ? 'none' : 'flex';
      toggleBtn.textContent = this.isCollapsed ? '□' : '_';
      this.hud.style.width = this.isCollapsed ? 'auto' : 'min(94vw, 440px)';
    };

    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCollapse();
    });

    dragHandle?.addEventListener('dblclick', toggleCollapse);

    // Pause / Resume
    document.getElementById('dbg-btn-pause')?.addEventListener('click', () => {
      this.togglePause();
    });

    // Step Frame
    document.getElementById('dbg-btn-step')?.addEventListener('click', () => {
      if (!this.gm.isPaused) {
        this.togglePause();
      }
      this.gm.stepFrame(16.66);
    });

    // Restart
    document.getElementById('dbg-btn-restart')?.addEventListener('click', () => {
      this.gm.restartCurrentModule();
    });

    // Force Win / Lose
    document.getElementById('dbg-btn-win')?.addEventListener('click', () => {
      this.gm.forceWin();
    });
    document.getElementById('dbg-btn-lose')?.addEventListener('click', () => {
      this.gm.forceLose();
    });

    // Speed Slider
    const slider = document.getElementById('dbg-speed-slider');
    slider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.setSpeed(val);
    });

    // Speed Presets
    document.querySelectorAll('.dbg-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const spd = parseFloat(btn.dataset.spd);
        this.setSpeed(spd);
        if (slider) slider.value = spd.toString();
      });
    });

    // Cheats
    document.getElementById('dbg-btn-time')?.addEventListener('click', () => {
      const active = this.gm.toggleInfiniteTime();
      const el = document.getElementById('dbg-time-status');
      if (el) {
        el.textContent = active ? 'ON' : 'OFF';
        el.style.color = active ? '#10b981' : '#f8fafc';
      }
    });

    document.getElementById('dbg-btn-god')?.addEventListener('click', () => {
      const active = this.gm.toggleGodMode();
      const el = document.getElementById('dbg-god-status');
      if (el) {
        el.textContent = active ? 'ON' : 'OFF';
        el.style.color = active ? '#10b981' : '#f8fafc';
      }
    });
  }

  setSpeed(val) {
    this.gm.setSpeed(val);
    const speedDisplay = document.getElementById('dbg-speed-val');
    if (speedDisplay) speedDisplay.textContent = `${val.toFixed(2)}x`;
  }

  togglePause() {
    const isPaused = this.gm.togglePause();
    this.updateHUDState();
  }

  updateHUDState() {
    const pauseBtn = document.getElementById('dbg-btn-pause');
    const statusPill = document.getElementById('dbg-status-pill');

    if (this.gm.isPaused) {
      if (pauseBtn) {
        pauseBtn.textContent = '▶️ RESUME [P]';
        pauseBtn.style.background = '#10b981';
      }
      if (statusPill) {
        statusPill.textContent = 'PAUSED';
        statusPill.style.background = '#eab308';
      }
    } else {
      if (pauseBtn) {
        pauseBtn.textContent = '⏸️ PAUSE [P]';
        pauseBtn.style.background = '#eab308';
      }
      if (statusPill) {
        statusPill.textContent = 'RUNNING';
        statusPill.style.background = '#10b981';
      }
    }
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Ignore if typing in text inputs
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      // P to pause / resume
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        this.togglePause();
      }
      // Period (.) to step frame
      else if (e.key === '.') {
        e.preventDefault();
        if (!this.gm.isPaused) {
          this.togglePause();
        }
        this.gm.stepFrame(16.66);
      }
      // W to force win
      else if (e.key === 'w' || e.key === 'W') {
        if (!this.gm.activeModule?.isFinished) {
          e.preventDefault();
          this.gm.forceWin('DEBUG FORCE WIN');
        }
      }
      // L to force lose
      else if (e.key === 'l' || e.key === 'L') {
        if (!this.gm.activeModule?.isFinished) {
          e.preventDefault();
          this.gm.forceLose('DEBUG FORCE LOSE');
        }
      }
      // R to restart minigame
      else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        this.gm.restartCurrentModule();
      }
      // T to toggle infinite time
      else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        document.getElementById('dbg-btn-time')?.click();
      }
      // G to toggle god mode
      else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        document.getElementById('dbg-btn-god')?.click();
      }
      // ~ (backtick/tilde) to collapse/expand debug hud
      else if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        document.getElementById('dbg-toggle-collapse')?.click();
      }
      // 1 to 9: quick jump to microgames
      else if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Only jump if not actively interacting with CaptchaOverlord
        if (!this.gm.activeModule || this.gm.activeModule.constructor.name !== 'CaptchaOverlord') {
          const idx = parseInt(e.key, 10) - 1;
          this.gm.loadSpecificModule(idx, { speed: this.gm.speedMultiplier });
        }
      }
    });
  }

  startTelemetryLoop() {
    const update = (now) => {
      // FPS Calculation
      this.frameCount++;
      if (now - this.lastFpsUpdate >= 500) {
        this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
        this.frameCount = 0;
        this.lastFpsUpdate = now;
        const fpsEl = document.getElementById('dbg-fps');
        if (fpsEl) fpsEl.textContent = `${this.fps} FPS`;
      }

      // Telemetry update
      const activeNameEl = document.getElementById('dbg-active-name');
      const timerValEl = document.getElementById('dbg-timer-val');
      const scoreValEl = document.getElementById('dbg-score-val');
      const strikesValEl = document.getElementById('dbg-strikes-val');

      if (this.gm.activeModule) {
        if (activeNameEl) activeNameEl.textContent = this.gm.activeModule.constructor.name;
        if (timerValEl) {
          const rem = Math.max(0, Math.round(this.gm.activeModule.timeRemaining));
          const lim = Math.round(this.gm.activeModule.timeLimit);
          timerValEl.textContent = `${rem}ms / ${lim}ms`;
        }
      } else {
        if (activeNameEl) activeNameEl.textContent = 'Intermission';
        if (timerValEl) timerValEl.textContent = '-- ms';
      }

      if (scoreValEl) scoreValEl.textContent = `${this.gm.score}`;
      if (strikesValEl) strikesValEl.textContent = `${this.gm.strikes} / ${this.gm.maxStrikes}`;

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }
}
