/**
 * Standardized base class for all micro-games in the Actual Individual engine.
 * Handles lifecycle, precision timers, audio synchronization, and cleanup.
 */
export class MicroGame {
  constructor() {
    this.container = null;
    this.config = null;
    this.onComplete = null;
    this.audio = null;
    this.isFinished = false;
    this.timeLimit = 4000;
    this.timeRemaining = 4000;
    this.rafId = null;
    this.lastTime = null;
    this.timerBar = null;
    this.promptEl = null;
    this.tickPlayedSeconds = new Set();
    this.isPaused = false;
    this.infiniteTime = false;
  }

  /**
   * Called by GameManager to mount the module DOM and prepare it.
   */
  mount(containerElement, config, onComplete, audioManager) {
    this.container = containerElement;
    this.config = config || { speedMultiplier: 1.0 };
    this.onComplete = onComplete;
    this.audio = audioManager;
    this.isFinished = false;
    this.tickPlayedSeconds = new Set();

    // Reset container style
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.style.width = '100%';
    this.container.style.height = '100%';

    this.setupUI();
    this.createStandardTimerBar();
  }

  /**
   * Subclasses override this to construct their scene and DOM/Canvas.
   */
  setupUI() {
    // Override in subclasses
  }

  /**
   * Standard header prompt helper for microgame commands.
   */
  createPrompt(text, subtext = '') {
    this.promptEl = document.createElement('div');
    this.promptEl.className = 'microgame-prompt-banner';
    this.promptEl.style.position = 'absolute';
    this.promptEl.style.top = '18px';
    this.promptEl.style.left = '50%';
    this.promptEl.style.width = 'max-content';
    this.promptEl.style.maxWidth = '92vw';
    this.promptEl.style.transform = 'translateX(-50%) scale(0.8)';
    this.promptEl.style.textAlign = 'center';
    this.promptEl.style.zIndex = '50';
    this.promptEl.style.pointerEvents = 'none';
    this.promptEl.style.transition = 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    this.promptEl.innerHTML = `
      <div style="
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        font-size: clamp(1rem, 4.8vw, 2.2rem);
        font-weight: 900;
        letter-spacing: 0.5px;
        line-height: 1.15;
        color: #ffffff;
        text-shadow: 0 4px 12px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.8);
        text-transform: uppercase;
        background: rgba(15, 23, 42, 0.78);
        padding: 6px 18px;
        border-radius: 18px;
        border: 2px solid rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(8px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      ">
        ${text}
      </div>
      ${subtext ? `<div style="color: #f1f5f9; font-size: clamp(0.75rem, 3vw, 0.95rem); margin-top: 4px; font-weight: 600; text-shadow: 0 2px 4px #000;">${subtext}</div>` : ''}
    `;

    this.container.appendChild(this.promptEl);

    requestAnimationFrame(() => {
      if (this.promptEl) {
        this.promptEl.style.transform = 'translateX(-50%) scale(1)';
      }
    });

    return this.promptEl;
  }

  /**
   * Standardized top ticking deadline bar with dynamic gradient and warning pulses.
   */
  createStandardTimerBar() {
    const timerTrack = document.createElement('div');
    timerTrack.className = 'timer-track';
    timerTrack.style.position = 'absolute';
    timerTrack.style.top = '0';
    timerTrack.style.left = '0';
    timerTrack.style.width = '100%';
    timerTrack.style.height = '12px';
    timerTrack.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
    timerTrack.style.zIndex = '100';

    this.timerBar = document.createElement('div');
    this.timerBar.className = 'timer-fill';
    this.timerBar.style.height = '100%';
    this.timerBar.style.width = '100%';
    this.timerBar.style.background = 'linear-gradient(90deg, #2ecc71, #f1c40f)';
    this.timerBar.style.boxShadow = '0 0 10px rgba(46, 204, 113, 0.6)';
    this.timerBar.style.transition = 'background 0.2s';

    timerTrack.appendChild(this.timerBar);
    this.container.appendChild(timerTrack);
  }

  /**
   * Start the timer and game loop.
   */
  startTimer(baseDurationMs) {
    const speed = Math.max(0.1, this.config.speedMultiplier || 1.0);
    this.timeLimit = Math.max(650, baseDurationMs / speed);
    this.timeRemaining = this.timeLimit;
    this.lastTime = performance.now();

    const loop = (now) => {
      if (this.isFinished) return;

      if (this.isPaused) {
        this.lastTime = now;
        this.rafId = requestAnimationFrame(loop);
        return;
      }

      const delta = now - this.lastTime;
      this.lastTime = now;

      if (!this.infiniteTime) {
        this.timeRemaining -= delta;
      }

      const progress = Math.max(0, this.timeRemaining / this.timeLimit);

      if (this.timerBar) {
        this.timerBar.style.width = `${progress * 100}%`;

        // Color coding & tension escalation
        if (progress < 0.25) {
          this.timerBar.style.background = '#e74c3c';
          this.timerBar.style.boxShadow = '0 0 14px #e74c3c';
        } else if (progress < 0.5) {
          this.timerBar.style.background = '#f39c12';
          this.timerBar.style.boxShadow = '0 0 10px #f39c12';
        }
      }

      // Audio countdown ticks
      const secondsLeft = Math.ceil(this.timeRemaining / 1000);
      if (secondsLeft <= 3 && !this.tickPlayedSeconds.has(secondsLeft) && secondsLeft > 0 && !this.infiniteTime) {
        this.tickPlayedSeconds.add(secondsLeft);
        if (this.audio) {
          if (secondsLeft === 1) {
            this.audio.playSfx('countdownFinal');
          } else {
            this.audio.playSfx('countdownTick');
          }
        }
      }

      if (this.timeRemaining <= 0 && !this.infiniteTime) {
        this.lose('Time expired!');
        return;
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  /**
   * Pause this microgame's timer and logic
   */
  pause() {
    if (this.isPaused) return;
    this.isPaused = true;
    if (typeof this.onPause === 'function') {
      this.onPause();
    }
  }

  /**
   * Resume this microgame
   */
  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastTime = performance.now();
    if (typeof this.onResume === 'function') {
      this.onResume();
    }
  }

  /**
   * Toggle paused state
   */
  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
    return this.isPaused;
  }

  /**
   * Advance 1 frame manually while paused
   */
  stepFrame(stepMs = 16.66) {
    if (!this.isPaused) return;

    if (!this.infiniteTime) {
      this.timeRemaining = Math.max(0, this.timeRemaining - stepMs);
    }

    const progress = Math.max(0, this.timeRemaining / this.timeLimit);
    if (this.timerBar) {
      this.timerBar.style.width = `${progress * 100}%`;
    }

    if (typeof this.update === 'function') {
      this.update(stepMs);
    }
    if (typeof this.draw === 'function') {
      this.draw();
    }
    if (this.timeRemaining <= 0 && !this.infiniteTime) {
      this.lose('Time expired!');
    }
  }

  /**
   * Toggle infinite time mode
   */
  setInfiniteTime(enabled) {
    this.infiniteTime = !!enabled;
  }

  forceWin(reason = 'DEBUG FORCE WIN') {
    this.win(reason);
  }

  forceLose(reason = 'DEBUG FORCE LOSE') {
    this.lose(reason);
  }

  start() {
    // Default implementation: 4 seconds timer
    this.startTimer(4000);
  }

  win(reason = '') {
    if (this.isFinished) return;
    this.isFinished = true;
    this.stopTimer();

    const bonus = (this.timeRemaining / this.timeLimit) >= 0.4 ? 1 : 0;
    if (this.audio) {
      this.audio.playSfx('win');
    }

    if (this.onComplete) {
      this.onComplete({ success: true, bonusPoints: bonus, reason });
    }
  }

  lose(reason = '') {
    if (this.isFinished) return;
    this.isFinished = true;
    this.stopTimer();

    if (this.audio) {
      this.audio.playSfx('lose');
    }

    if (this.onComplete) {
      this.onComplete({ success: false, reason });
    }
  }

  stopTimer() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  unmount() {
    this.isFinished = true;
    this.stopTimer();
    if (this.container) {
      this.container.innerHTML = '';
      this.container.removeAttribute('style');
    }
  }
}
