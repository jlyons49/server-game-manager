import { AudioManager } from '../audio/AudioManager.js';
import { Confetti } from '../ui/Confetti.js';
import { ToastManager } from '../ui/ToastManager.js';

// Pre-imported microgame modules for instant, seamless loading without network hitches
import { AutonomousCar } from '../modules/autonomous-car/AutonomousCar.js';
import { SockSorter } from '../modules/sock-sorter/SockSorter.js';
import { MarsRover } from '../modules/mars-rover/MarsRover.js';
import { CaptchaOverlord } from '../modules/captcha-overlord/CaptchaOverlord.js';
import { AntigravityCalibration } from '../modules/antigravity/AntigravityCalibration.js';
import { ServerMeltdown } from '../modules/server-meltdown/ServerMeltdown.js';
import { CoffeeSynergy } from '../modules/coffee-synergy/CoffeeSynergy.js';
import { AutonomousCruise } from '../modules/autonomous-cruise/AutonomousCruise.js';
import { DroneDrop } from '../modules/drone-drop/DroneDrop.js';

export class GameManager {
  constructor() {
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('benevolink_highscore') || '0', 10);
    this.strikes = 4; // 4 chances before being "Promoted to Customer"
    this.maxStrikes = 4;
    this.cycles = 0;
    this.speedMultiplier = 0.80; // Starts very relaxed and accessible
    this.activeModule = null;
    this.selectedPracticeModule = null;
    this.isPracticeMode = false;
    this.isDebugMode = false;
    this.isPaused = false;
    this.godMode = false;
    this.infiniteTime = false;
    this.intermissionInterval = null;

    this.corporateTitles = [
      { minScore: 0, title: 'Unpaid Synergy Intern', badge: '🌱' },
      { minScore: 800, title: 'Junior Clicking Associate', badge: '🖱️' },
      { minScore: 2200, title: 'Senior Edge Case Janitor', badge: '🧹' },
      { minScore: 4500, title: 'Lead Human Fallback Tech', badge: '📋' },
      { minScore: 8000, title: 'Regional Director of Edge Cases', badge: '📊' },
      { minScore: 12800, title: 'VP of Algorithmic Apologies', badge: '💼' },
      { minScore: 18500, title: 'Senior VP of Crisis Mitigation', badge: '🛡️' },
      { minScore: 25000, title: 'Executive Panic Dampener', badge: '⚡' },
      { minScore: 33000, title: 'Chief Executive Human (CEO)', badge: '👑' },
      { minScore: 42000, title: 'Chairman of the Singularity', badge: '🌌' }
    ];

    this.moduleRegistry = [
      { name: 'Autonomous Car', classRef: AutonomousCar, command: 'SWERVE!', icon: '🚗' },
      { name: 'Autonomous Cruise', classRef: AutonomousCruise, command: 'STEER SHIP!', icon: '🚢' },
      { name: 'Sock Sorter 3000', classRef: SockSorter, command: 'TRASH IT!', icon: '🧦' },
      { name: 'Mars Rover 9000', classRef: MarsRover, command: 'DISCOVER!', icon: '🪐' },
      { name: 'Captcha Overlord', classRef: CaptchaOverlord, command: 'VERIFY!', icon: '🛡️' },
      { name: 'Antigravity Cargo', classRef: AntigravityCalibration, command: 'PULL DOWN!', icon: '🧲' },
      { name: 'Server Meltdown', classRef: ServerMeltdown, command: 'EXTINGUISH!', icon: '❄️' },
      { name: 'Executive Coffee', classRef: CoffeeSynergy, command: 'POUR!', icon: '☕' },
      { name: 'Autonomous Drone', classRef: DroneDrop, command: 'DROP PACKAGE!', icon: '🚁' }
    ];

    // Services
    this.audio = new AudioManager();
    this.confetti = new Confetti();
    this.toasts = new ToastManager();

    // DOM Elements
    this.uiContainer = document.getElementById('ai-ui');
    this.moduleContainer = document.getElementById('module-container');
    this.scoreDisplay = document.getElementById('score-display');
    this.roleDisplay = document.getElementById('role-display');
    this.strikesDisplay = document.getElementById('strikes-display');
    this.highScoreDisplay = document.getElementById('highscore-display');

    this.screens = {
      menu: document.getElementById('main-menu'),
      intermission: document.getElementById('intermission'),
      gameOver: document.getElementById('game-over'),
      practice: document.getElementById('practice-modal')
    };

    this.bindEvents();
    this.updateHUD();
  }

  bindEvents() {
    // Menu buttons
    document.getElementById('btn-start')?.addEventListener('click', () => {
      this.audio.resume();
      this.audio.startBgm();
      this.isPracticeMode = false;
      this.startGame();
    });

    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.audio.resume();
      this.audio.startBgm();
      this.isPracticeMode = false;
      this.startGame();
    });

    document.getElementById('btn-practice')?.addEventListener('click', () => {
      this.showPracticeMenu();
    });

    document.getElementById('btn-menu-practice')?.addEventListener('click', () => {
      this.showPracticeMenu();
    });

    document.getElementById('btn-close-practice')?.addEventListener('click', () => {
      this.screens.practice?.classList.remove('active');
    });

    // Top Bar quick action toggles
    document.getElementById('btn-mute')?.addEventListener('click', () => {
      const isMuted = this.audio.toggleMute();
      const muteBtn = document.getElementById('btn-mute');
      if (muteBtn) {
        muteBtn.innerHTML = isMuted ? '🔇 <span class="btn-label">MUTED</span>' : '🔊 <span class="btn-label">AUDIO</span>';
        muteBtn.classList.toggle('active', isMuted);
      }
    });

    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  showScreen(screenName) {
    Object.values(this.screens).forEach(s => s && s.classList.remove('active'));
    if (this.screens[screenName]) {
      this.screens[screenName].classList.add('active');
    }
  }

  getTitleData(score) {
    let current = this.corporateTitles[0];
    for (const t of this.corporateTitles) {
      if (score >= t.minScore) {
        current = t;
      }
    }
    return current;
  }

  updateHUD() {
    const titleInfo = this.getTitleData(this.score);
    if (this.roleDisplay) {
      this.roleDisplay.textContent = `${titleInfo.badge} ${titleInfo.title}`;
    }
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = `SYNERGY: ${this.score.toLocaleString()}`;
    }
    if (this.highScoreDisplay) {
      this.highScoreDisplay.textContent = `HIGH: ${this.highScore.toLocaleString()}`;
    }
    if (this.strikesDisplay) {
      let badges = '';
      for (let i = 0; i < this.maxStrikes; i++) {
        badges += (i < this.strikes) ? '💼 ' : '❌ ';
      }
      this.strikesDisplay.textContent = badges.trim();
    }
  }

  startGame() {
    this.score = 0;
    this.strikes = this.maxStrikes;
    this.cycles = 0;
    this.speedMultiplier = 0.85;
    this.lastTitle = this.getTitleData(0).title;
    this.audio.setSpeed(0.85);
    this.updateHUD();
    this.loadNextIntermission('start');
  }

  showPracticeMenu() {
    const listEl = document.getElementById('practice-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    this.moduleRegistry.forEach((mod) => {
      const item = document.createElement('div');
      item.className = 'practice-card';
      item.innerHTML = `
        <span style="font-size: 2.2rem;">${mod.icon}</span>
        <div style="flex: 1; text-align: left;">
          <h4 style="margin: 0; color: #0f172a; font-size: 1.1rem;">${mod.name}</h4>
          <span style="font-size: 0.8rem; color: #64748b; font-weight: bold;">COMMAND: "${mod.command}"</span>
        </div>
        <button class="tech-btn-small">PLAY</button>
      `;

      item.querySelector('button')?.addEventListener('click', () => {
        this.screens.practice?.classList.remove('active');
        this.startPracticeGame(mod);
      });

      listEl.appendChild(item);
    });

    this.screens.practice?.classList.add('active');
  }

  startPracticeGame(moduleEntry) {
    this.isPracticeMode = true;
    this.speedMultiplier = 1.0;
    this.selectedPracticeModule = moduleEntry;
    this.loadNextIntermission('practice');
  }

  loadNextIntermission(lastResult) {
    this.uiContainer.classList.add('active');
    this.moduleContainer.classList.remove('active');
    this.showScreen('intermission');

    const title = document.getElementById('intermission-title');
    const subtitle = document.getElementById('intermission-subtitle');
    const commandBanner = document.getElementById('intermission-command');

    // Determine upcoming module
    let upcoming;
    if (this.isPracticeMode && this.selectedPracticeModule) {
      upcoming = this.selectedPracticeModule;
    } else {
      // Pick random module, avoiding repeating the exact same one twice in a row if possible
      const available = this.moduleRegistry.filter(m => !this.lastModule || m.name !== this.lastModule.name);
      upcoming = available[Math.floor(Math.random() * available.length)] || this.moduleRegistry[0];
    }
    this.upcomingModule = upcoming;
    this.lastModule = upcoming;

    // Command Banner in Intermission
    if (commandBanner) {
      commandBanner.textContent = `NEXT TASK: "${upcoming.command}"`;
    }

    const isSpeedUp = this.cycles > 0 && this.cycles % 10 === 0 && lastResult === 'win';

    if (isSpeedUp) {
      const tierNum = Math.floor(this.cycles / 10) + 1;
      title.textContent = `⚡ SPEED UP! TIER ${tierNum} ⚡`;
      title.className = 'intermission-status warning-text blink';
      subtitle.textContent = `Corporate demands higher throughput! Operating velocity escalated to ${this.speedMultiplier.toFixed(2)}x!`;
      this.audio.playSfx('promotion');
    } else if (lastResult === 'win') {
      title.textContent = 'Synergy Maximized! ⭐';
      title.className = 'intermission-status success-text';
      subtitle.textContent = 'High-velocity decision executed! Preparing next peripheral interrupt...';
    } else if (lastResult === 'loss') {
      title.textContent = '⚠️ Performance Opportunity Identified!';
      title.className = 'intermission-status warning-text blink';
      subtitle.textContent = `Strike recorded! [${this.strikes} / ${this.maxStrikes} remaining before promotion to Customer]`;
    } else {
      title.textContent = 'Welcome Aboard! 🚀';
      title.className = 'intermission-status info-text';
      subtitle.textContent = 'Connecting neural feed to peripheral edge cases...';
    }

    // Audio cue
    if (lastResult === 'loss') {
      this.audio.playSfx('alarm');
    }

    // Intermission two-phase sequence (Constant timing: does NOT speed up with difficulty)
    // Phase 1: Constant ~2.3s breathing/review pause where player sees result, stats, and upcoming command
    // Phase 2: Loading bar pops up and quickly zaps across (650ms) to launch the activity
    const delayBeforeLoad = 2300; // Constant ~2.3 seconds
    const quickLoadDuration = 650; // Constant 650ms quick loading bar
    const intervalStep = 20;

    const progressContainer = document.getElementById('progress-container');
    const bar = document.getElementById('load-progress');
    const subtext = document.getElementById('subtext-loading');

    if (progressContainer) {
      progressContainer.classList.remove('active');
    }
    if (bar) {
      bar.style.width = '0%';
    }
    if (subtext) {
      subtext.textContent = 'ANALYZING INCIDENT TELEMETRY...';
    }

    let elapsed = 0;
    let loadStarted = false;

    if (this.intermissionInterval) {
      clearInterval(this.intermissionInterval);
    }

    this.intermissionInterval = setInterval(() => {
      if (this.isPaused) return;

      elapsed += intervalStep;

      if (elapsed < delayBeforeLoad) {
        // Phase 1: Review/breathing window (bar is not popped up yet)
        if (subtext && elapsed > 1300 && subtext.textContent !== 'PREPARING PERIPHERAL OVERRIDE...') {
          subtext.textContent = 'PREPARING PERIPHERAL OVERRIDE...';
        }
      } else {
        // Phase 2: Pop up the loading bar and fill quickly
        if (!loadStarted) {
          loadStarted = true;
          if (progressContainer) {
            progressContainer.classList.add('active');
          }
          if (subtext) {
            subtext.textContent = '⚡ SYNCHRONIZING NEURAL OVERRIDE...';
          }
          if (this.audio) {
            this.audio.playSfx('click');
          }
        }

        const loadElapsed = elapsed - delayBeforeLoad;
        const progress = Math.min(100, (loadElapsed / quickLoadDuration) * 100);

        if (bar) {
          bar.style.width = `${progress}%`;
        }

        if (loadElapsed >= quickLoadDuration) {
          clearInterval(this.intermissionInterval);
          this.intermissionInterval = null;
          if (bar) bar.style.width = '0%';
          if (progressContainer) progressContainer.classList.remove('active');
          this.launchModule();
        }
      }
    }, intervalStep);
  }

  launchModule() {
    if (this.intermissionInterval) {
      clearInterval(this.intermissionInterval);
      this.intermissionInterval = null;
    }
    document.getElementById('progress-container')?.classList.remove('active');

    this.uiContainer.classList.remove('active');
    this.moduleContainer.classList.add('active');

    const modMeta = this.upcomingModule || this.moduleRegistry[0];

    // Announce voice prompt
    this.audio.speakPrompt(modMeta.command);

    // Instantiate microgame
    this.activeModule = new modMeta.classRef();
    this.activeModule.mount(
      this.moduleContainer,
      { speedMultiplier: this.speedMultiplier },
      (result) => this.onModuleComplete(result),
      this.audio
    );

    if (this.infiniteTime) {
      this.activeModule.setInfiniteTime(true);
    }

    this.activeModule.start();

    if (this.isPaused) {
      this.activeModule.pause();
    }
  }

  onModuleComplete(result) {
    const modRef = this.activeModule;
    const moduleKey = modRef ? modRef.constructor.name : (this.upcomingModule?.classRef?.name || '');

    if (this.activeModule) {
      this.activeModule.unmount();
      this.activeModule = null;
    }

    if (result.success) {
      const basePoints = 100;
      const bonus = (result.bonusPoints || 0) * 50;
      const earned = Math.round((basePoints + bonus) * this.speedMultiplier);
      this.score += earned;
      this.cycles++;

      // Check for promotion milestone
      const currentTitle = this.getTitleData(this.score).title;
      if (currentTitle !== this.lastTitle) {
        this.lastTitle = currentTitle;
        this.confetti.burst(90);
        this.audio.playSfx('promotion');
        this.toasts.showToast({
          title: '🎉 PROMOTION GRANTED!',
          subtitle: 'HR Enterprise',
          message: `Congratulations! You are now: ${currentTitle}!`,
          type: 'success',
          duration: 3600
        });
      } else {
        this.toasts.showRandomFeedback(true, moduleKey, result.reason);
      }

      // Update High Score
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('benevolink_highscore', this.highScore.toString());
      }

      // Continuous, uncapped speed scaling that accelerates dynamically over time
      if (!this.isDebugMode || this.autoRampInDebug) {
        const baseSpeed = 0.85;
        const linearRamp = this.cycles * 0.026;
        const overdriveRamp = Math.max(0, this.cycles - 30) * 0.008;
        this.speedMultiplier = baseSpeed + linearRamp + overdriveRamp;
        this.audio.setSpeed(this.speedMultiplier);
      }

      this.updateHUD();
      this.loadNextIntermission('win');
    } else {
      if (this.godMode) {
        this.strikes = this.maxStrikes;
      } else {
        this.strikes--;
      }
      this.toasts.showRandomFeedback(false, moduleKey, result.reason);

      // Screen shake effect
      document.body.classList.add('shake');
      setTimeout(() => document.body.classList.remove('shake'), 450);

      this.updateHUD();

      if (this.strikes <= 0 && !this.isPracticeMode && !this.godMode) {
        this.triggerGameOver();
      } else {
        this.loadNextIntermission('loss');
      }
    }
  }

  // === Debug Actions & Controls ===
  pause() {
    this.isPaused = true;
    if (this.activeModule) {
      this.activeModule.pause();
    }
    if (this.audio) {
      this.audio.pauseBgm();
    }
  }

  resume() {
    this.isPaused = false;
    if (this.activeModule) {
      this.activeModule.resume();
    }
    if (this.audio) {
      this.audio.resumeBgm();
    }
  }

  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
    return this.isPaused;
  }

  stepFrame(stepMs = 16.66) {
    if (this.activeModule) {
      this.activeModule.stepFrame(stepMs);
    }
  }

  forceWin(reason = 'DEBUG FORCE WIN') {
    if (this.activeModule) {
      this.activeModule.forceWin(reason);
    }
  }

  forceLose(reason = 'DEBUG FORCE LOSE') {
    if (this.activeModule) {
      this.activeModule.forceLose(reason);
    }
  }

  restartCurrentModule() {
    if (this.intermissionInterval) {
      clearInterval(this.intermissionInterval);
      this.intermissionInterval = null;
    }
    const currentMeta = this.upcomingModule || this.moduleRegistry[0];
    if (this.activeModule) {
      this.activeModule.unmount();
      this.activeModule = null;
    }
    this.upcomingModule = currentMeta;
    this.launchModule();
  }

  loadSpecificModule(nameOrIndex, options = {}) {
    if (this.intermissionInterval) {
      clearInterval(this.intermissionInterval);
      this.intermissionInterval = null;
    }
    if (this.activeModule) {
      this.activeModule.unmount();
      this.activeModule = null;
    }

    let target;
    if (typeof nameOrIndex === 'number') {
      target = this.moduleRegistry[nameOrIndex];
    } else {
      target = this.moduleRegistry.find(m => 
        m.name.toLowerCase().includes(nameOrIndex.toLowerCase()) || 
        m.classRef.name.toLowerCase() === nameOrIndex.toLowerCase()
      );
    }
    if (!target) target = this.moduleRegistry[0];

    this.upcomingModule = target;
    this.isPracticeMode = options.isPractice !== undefined ? options.isPractice : true;

    if (options.speed) {
      this.setSpeed(options.speed);
    }

    this.audio.resume();
    this.launchModule();
  }

  setSpeed(speed) {
    this.speedMultiplier = Math.max(0.1, Math.min(5.0, speed));
    this.audio.setSpeed(this.speedMultiplier);
    if (this.activeModule && this.activeModule.config) {
      this.activeModule.config.speedMultiplier = this.speedMultiplier;
    }
  }

  toggleInfiniteTime() {
    this.infiniteTime = !this.infiniteTime;
    if (this.activeModule) {
      this.activeModule.setInfiniteTime(this.infiniteTime);
    }
    return this.infiniteTime;
  }

  toggleGodMode() {
    this.godMode = !this.godMode;
    if (this.godMode) {
      this.strikes = this.maxStrikes;
      this.updateHUD();
    }
    return this.godMode;
  }

  triggerGameOver() {
    this.uiContainer.classList.add('active');
    this.moduleContainer.classList.remove('active');
    this.showScreen('gameOver');

    this.audio.stopBgm();
    this.audio.playSfx('lose');

    const finalTitle = this.getTitleData(this.score);
    document.getElementById('final-score').textContent = this.score.toLocaleString();
    document.getElementById('final-title').textContent = `${finalTitle.badge} ${finalTitle.title}`;
    document.getElementById('final-cycles').textContent = this.cycles;

    // Comedic manager remarks
    const remarks = [
      'Failed to properly leverage multi-modal agility under extreme cognitive deadlines.',
      'Optimized out of operational infrastructure due to suboptimal duck avoidance metrics.',
      'We value your contribution and wish you luck synergizing with our competitor.',
      'Your workstation beanbag has already been reassigned to a team member with more enthusiasm.'
    ];
    const remarkEl = document.getElementById('final-remark');
    if (remarkEl) {
      remarkEl.textContent = `Manager's Review: "${remarks[Math.floor(Math.random() * remarks.length)]}"`;
    }
  }
}
