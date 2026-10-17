import { MicroGame } from '../../core/MicroGame.js';

export class CoffeeSynergy extends MicroGame {
  setupUI() {
    this.createPrompt('POUR THE COFFEE!', 'HOLD [SPACE or TAP] to pour! Release in the GREEN zone!');

    this.container.style.backgroundColor = '#fdf8f6';
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.alignItems = 'center';
    this.container.style.justifyContent = 'center';

    this.isPouring = false;
    this.liquidLevel = 0; // 0 to 100%

    // Dynamic difficulty: Sweet spot green zone narrows at higher speeds
    const speed = this.config.speedMultiplier || 1;
    const zoneHeight = Math.max(16, 35 - (speed - 1) * 8);
    const targetCenter = 72;
    this.targetMin = targetCenter - zoneHeight / 2;
    this.targetMax = targetCenter + zoneHeight / 2;

    // Visual Beverage & Mug Variations
    const drinkVariations = [
      { name: 'Cold Brew', liquidColor: '#451a03', streamColor: '#451a03', btnColor: '#78350f', icon: '☕' },
      { name: 'Matcha Latte', liquidColor: '#15803d', streamColor: '#16a34a', btnColor: '#166534', icon: '🍵' },
      { name: 'Unicorn Chai', liquidColor: '#9333ea', streamColor: '#a855f7', btnColor: '#7e22ce', icon: '🦄' }
    ];
    this.drink = drinkVariations[Math.floor(Math.random() * drinkVariations.length)];

    const mugStyles = [
      { borderColor: '#eab308', bgTint: 'rgba(254, 240, 138, 0.2)', shadow: 'rgba(234, 179, 8, 0.25)' },
      { borderColor: '#94a3b8', bgTint: 'rgba(226, 232, 240, 0.3)', shadow: 'rgba(148, 163, 184, 0.25)' },
      { borderColor: '#2563eb', bgTint: 'rgba(191, 219, 254, 0.2)', shadow: 'rgba(37, 99, 235, 0.25)' }
    ];
    this.mugStyle = mugStyles[Math.floor(Math.random() * mugStyles.length)];

    // Coffee Carafe / Spout at Top
    this.spout = document.createElement('div');
    this.spout.style.marginTop = '56px';
    this.spout.style.fontSize = 'clamp(3.2rem, 8dvh, 4.5rem)';
    this.spout.style.lineHeight = '1';
    this.spout.style.transform = 'rotate(-15deg)';
    this.spout.style.transition = 'transform 0.15s';
    this.spout.textContent = this.drink.icon;
    this.container.appendChild(this.spout);

    // Liquid stream (hidden by default)
    this.stream = document.createElement('div');
    this.stream.style.width = '10px';
    this.stream.style.height = 'clamp(60px, 13dvh, 130px)';
    this.stream.style.backgroundColor = this.drink.streamColor;
    this.stream.style.borderRadius = '5px';
    this.stream.style.opacity = '0';
    this.stream.style.transition = 'opacity 0.08s';
    this.stream.style.boxShadow = `0 0 6px ${this.drink.liquidColor}`;
    this.container.appendChild(this.stream);

    // CEO's Tumbler Mug (styled)
    this.mug = document.createElement('div');
    this.mug.style.width = '155px';
    this.mug.style.height = 'clamp(145px, 25dvh, 200px)';
    this.mug.style.border = `6px solid ${this.mugStyle.borderColor}`;
    this.mug.style.borderTop = 'none';
    this.mug.style.borderRadius = '0 0 24px 24px';
    this.mug.style.position = 'relative';
    this.mug.style.backgroundColor = this.mugStyle.bgTint;
    this.mug.style.overflow = 'hidden';
    this.mug.style.boxShadow = `0 12px 24px ${this.mugStyle.shadow}`;
    this.container.appendChild(this.mug);

    // Target Fill Zone (Green Bar Overlay)
    this.targetZone = document.createElement('div');
    this.targetZone.style.position = 'absolute';
    this.targetZone.style.bottom = `${this.targetMin}%`;
    this.targetZone.style.height = `${this.targetMax - this.targetMin}%`;
    this.targetZone.style.width = '100%';
    this.targetZone.style.backgroundColor = 'rgba(34, 197, 94, 0.4)';
    this.targetZone.style.borderTop = '2px dashed #16a34a';
    this.targetZone.style.borderBottom = '2px dashed #16a34a';
    this.targetZone.style.display = 'flex';
    this.targetZone.style.alignItems = 'center';
    this.targetZone.style.justifyContent = 'center';
    this.targetZone.style.color = '#15803d';
    this.targetZone.style.fontWeight = '900';
    this.targetZone.style.fontSize = '0.78rem';
    this.targetZone.style.letterSpacing = '1px';
    this.targetZone.innerHTML = '★ PERFECT SYNERGY ★';
    this.mug.appendChild(this.targetZone);

    // Rising Liquid
    this.liquid = document.createElement('div');
    this.liquid.style.position = 'absolute';
    this.liquid.style.bottom = '0';
    this.liquid.style.left = '0';
    this.liquid.style.width = '100%';
    this.liquid.style.height = '0%';
    this.liquid.style.backgroundColor = this.drink.liquidColor;
    this.liquid.style.transition = 'height 0.05s linear';
    this.mug.appendChild(this.liquid);

    // Mobile/Desktop Action Button
    this.pourBtn = document.createElement('button');
    this.pourBtn.style.marginTop = '18px';
    this.pourBtn.style.maxWidth = '92vw';
    this.pourBtn.style.padding = '14px 24px';
    this.pourBtn.style.backgroundColor = this.drink.btnColor;
    this.pourBtn.style.color = '#ffffff';
    this.pourBtn.style.border = 'none';
    this.pourBtn.style.borderRadius = '50px';
    this.pourBtn.style.fontSize = 'clamp(0.95rem, 4vw, 1.25rem)';
    this.pourBtn.style.fontWeight = 'bold';
    this.pourBtn.style.cursor = 'pointer';
    this.pourBtn.style.boxShadow = `0 6px 16px ${this.drink.liquidColor}`;
    this.pourBtn.style.touchAction = 'none';
    this.pourBtn.innerHTML = `${this.drink.icon} HOLD TO POUR ${this.drink.name.toUpperCase()}`;
    this.container.appendChild(this.pourBtn);

    this.bindPourEvents();
  }

  bindPourEvents() {
    const startPour = (e) => {
      if (e) e.preventDefault();
      if (this.isFinished || this.isPouring) return;
      this.isPouring = true;
      this.stream.style.opacity = '1';
      this.spout.style.transform = 'rotate(-38deg) scale(1.1)';
      if (this.audio) this.audio.playSfx('pour');
    };

    const stopPour = (e) => {
      if (e) e.preventDefault();
      if (!this.isPouring || this.isFinished) return;
      this.isPouring = false;
      this.stream.style.opacity = '0';
      this.spout.style.transform = 'rotate(-15deg) scale(1)';
      this.evaluateFill();
    };

    this.pourBtn.addEventListener('pointerdown', startPour);
    this.pourBtn.addEventListener('pointerup', stopPour);
    this.pourBtn.addEventListener('pointercancel', stopPour);

    this.container.addEventListener('pointerdown', (e) => {
      if (e.target !== this.pourBtn) startPour(e);
    });
    this.container.addEventListener('pointerup', stopPour);

    this.keyHandler = (e) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (e.type === 'keydown') startPour();
        else if (e.type === 'keyup') stopPour();
      }
    };
    window.addEventListener('keydown', this.keyHandler);
    window.addEventListener('keyup', this.keyHandler);
  }

  evaluateFill() {
    if (this.isFinished) return;

    if (this.liquidLevel >= this.targetMin && this.liquidLevel <= this.targetMax) {
      if (this.audio) this.audio.playSfx('ding');
      this.win('Caffeine dosage calibrated to executive perfection!');
    } else if (this.liquidLevel < this.targetMin) {
      if (this.audio) this.audio.playSfx('lose');
      this.lose('Underfilled! CEO is experiencing acute fatigue.');
    } else {
      if (this.audio) this.audio.playSfx('lose');
      this.lose('Overflowed! Hot coffee spilled on NDA contracts!');
    }
  }

  start() {
    this.startTimer(4500);

    const speed = this.config.speedMultiplier || 1;
    const pourSpeed = 0.95 * speed;

    this.pourInterval = setInterval(() => {
      if (this.isFinished || this.isPaused) return;
      if (this.isPouring) {
        this.liquidLevel += pourSpeed;
        this.liquid.style.height = `${Math.min(100, this.liquidLevel)}%`;

        if (this.liquidLevel >= 100) {
          this.isPouring = false;
          this.stream.style.opacity = '0';
          if (this.audio) this.audio.playSfx('lose');
          this.lose('Disastrous coffee geyser! You ruined the merger.');
        }
      }
    }, 20);
  }

  unmount() {
    super.unmount();
    if (this.pourInterval) clearInterval(this.pourInterval);
    window.removeEventListener('keydown', this.keyHandler);
    window.removeEventListener('keyup', this.keyHandler);
  }
}
