import { MicroGame } from '../../core/MicroGame.js';

export class ServerMeltdown extends MicroGame {
  setupUI() {
    this.createPrompt('COOL THE SERVERS!', 'Rapidly TAP or mash [SPACEBAR] to spray liquid nitrogen coolant!');

    this.container.style.backgroundColor = '#0b0f19';
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.alignItems = 'center';
    this.container.style.justifyContent = 'center';

    // Temp state - scales dynamically with speed multiplier
    const speed = this.config.speedMultiplier || 1;
    this.targetTemp = 40; // safe zone
    this.currentTemp = Math.min(96, 80 + (speed - 1) * 7); // starting temp rises with speed
    this.tapPower = Math.max(7.5, 12.0 - (speed - 1) * 1.5); // requires more frantic mashing at higher speeds

    // Datacenter Cluster Variations
    const clusterThemes = [
      {
        name: 'Enterprise Cloud',
        bg: '#0b0f19',
        rackBg: '#1e293b',
        title: 'CORE CLUSTER THERMAL RUNAWAY',
        bladePrefix: 'GPU_NODE_0',
        sprayText: '❄️ SPRAY NITROGEN! [SPACE / TAP]',
        sprayBtnBg: '#0284c7'
      },
      {
        name: 'Quantum Qubit Core',
        bg: '#0a0518',
        rackBg: '#1e1b4b',
        title: 'QUANTUM ARRAY DE-COHERENCE RISK',
        bladePrefix: 'QUBIT_CELL_0',
        sprayText: '⚡ CRYO-COOL QUBITS! [SPACE / TAP]',
        sprayBtnBg: '#7c3aed'
      },
      {
        name: 'Offshore Hashrate Rig',
        bg: '#09090b',
        rackBg: '#27272a',
        title: 'UNAUTHORIZED HASHING OVERHEAT',
        bladePrefix: 'ASIC_BLADE_0',
        sprayText: '🧊 BLAST LIQUID FREON! [SPACE / TAP]',
        sprayBtnBg: '#059669'
      }
    ];
    this.cluster = clusterThemes[Math.floor(Math.random() * clusterThemes.length)];
    this.container.style.backgroundColor = this.cluster.bg;

    // Server Rack Graphic Box
    this.rack = document.createElement('div');
    this.rack.style.width = 'min(90vw, 380px)';
    this.rack.style.height = 'min(410px, 68dvh)';
    this.rack.style.marginTop = '56px';
    this.rack.style.backgroundColor = this.cluster.rackBg;
    this.rack.style.border = '4px solid #ef4444';
    this.rack.style.borderRadius = '16px';
    this.rack.style.boxShadow = '0 0 35px rgba(239, 68, 68, 0.6)';
    this.rack.style.padding = '16px';
    this.rack.style.boxSizing = 'border-box';
    this.rack.style.display = 'flex';
    this.rack.style.flexDirection = 'column';
    this.rack.style.justifyContent = 'space-between';
    this.rack.style.position = 'relative';
    this.container.appendChild(this.rack);

    // Temp Gauge Screen
    this.gauge = document.createElement('div');
    this.gauge.style.backgroundColor = '#000000';
    this.gauge.style.borderRadius = '8px';
    this.gauge.style.padding = '10px';
    this.gauge.style.textAlign = 'center';
    this.gauge.style.border = '2px solid #ef4444';

    this.tempDisplay = document.createElement('div');
    this.tempDisplay.style.fontFamily = 'monospace';
    this.tempDisplay.style.fontSize = 'clamp(2.1rem, 7vw, 2.8rem)';
    this.tempDisplay.style.fontWeight = '900';
    this.tempDisplay.style.color = '#ef4444';
    this.tempDisplay.style.textShadow = '0 0 14px #ef4444';
    this.tempDisplay.textContent = `${this.currentTemp.toFixed(1)}°C`;

    const tempLabel = document.createElement('div');
    tempLabel.style.color = '#f87171';
    tempLabel.style.fontSize = 'clamp(0.7rem, 2.5vw, 0.8rem)';
    tempLabel.style.letterSpacing = '1px';
    tempLabel.style.fontWeight = 'bold';
    tempLabel.textContent = this.cluster.title;

    this.gauge.appendChild(this.tempDisplay);
    this.gauge.appendChild(tempLabel);
    this.rack.appendChild(this.gauge);

    // Blinking Server Blades
    const bladesContainer = document.createElement('div');
    bladesContainer.style.display = 'flex';
    bladesContainer.style.flexDirection = 'column';
    bladesContainer.style.gap = '6px';

    for (let i = 0; i < 4; i++) {
      const blade = document.createElement('div');
      blade.style.backgroundColor = '#334155';
      blade.style.borderRadius = '6px';
      blade.style.padding = '7px 12px';
      blade.style.display = 'flex';
      blade.style.justifyContent = 'space-between';
      blade.style.alignItems = 'center';

      blade.innerHTML = `
        <span style="font-family: monospace; font-size: 0.75rem; color: #94a3b8;">${this.cluster.bladePrefix}${i + 1}</span>
        <div style="display: flex; gap: 4px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; animation: blink 0.25s infinite alternate;"></span>
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; animation: blink 0.4s infinite alternate;"></span>
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #fbbf24;"></span>
        </div>
      `;
      bladesContainer.appendChild(blade);
    }
    this.rack.appendChild(bladesContainer);

    // Big Mashable Coolant Trigger Button
    this.sprayBtn = document.createElement('button');
    this.sprayBtn.style.width = '100%';
    this.sprayBtn.style.padding = '14px 12px';
    this.sprayBtn.style.backgroundColor = this.cluster.sprayBtnBg;
    this.sprayBtn.style.border = 'none';
    this.sprayBtn.style.borderRadius = '12px';
    this.sprayBtn.style.color = '#ffffff';
    this.sprayBtn.style.fontSize = 'clamp(0.95rem, 4vw, 1.25rem)';
    this.sprayBtn.style.fontWeight = '900';
    this.sprayBtn.style.cursor = 'pointer';
    this.sprayBtn.style.boxShadow = `0 6px 20px ${this.cluster.sprayBtnBg}88`;
    this.sprayBtn.style.letterSpacing = '0.5px';
    this.sprayBtn.innerHTML = this.cluster.sprayText;
    this.rack.appendChild(this.sprayBtn);

    // Frost / Steam overlay
    this.frostOverlay = document.createElement('div');
    this.frostOverlay.style.position = 'absolute';
    this.frostOverlay.style.top = '0';
    this.frostOverlay.style.left = '0';
    this.frostOverlay.style.width = '100%';
    this.frostOverlay.style.height = '100%';
    this.frostOverlay.style.pointerEvents = 'none';
    this.frostOverlay.style.background = 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)';
    this.frostOverlay.style.opacity = '0';
    this.frostOverlay.style.transition = 'opacity 0.1s';
    this.container.appendChild(this.frostOverlay);

    this.bindMashEvents();
  }

  bindMashEvents() {
    const doSpray = () => {
      if (this.isFinished) return;
      this.currentTemp = Math.max(25, this.currentTemp - this.tapPower);
      if (this.audio) this.audio.playSfx('fireExtinguisher');

      // Visual flash
      this.frostOverlay.style.opacity = '0.9';
      setTimeout(() => {
        this.frostOverlay.style.opacity = '0';
      }, 90);

      // Shake rack slightly
      this.rack.style.transform = `scale(0.97) translateY(2px)`;
      setTimeout(() => {
        this.rack.style.transform = 'scale(1)';
      }, 70);

      this.updateVisuals();

      if (this.currentTemp <= this.targetTemp) {
        if (this.audio) this.audio.playSfx('ding');
        this.win('Cluster stabilized at sub-critical temps!');
      }
    };

    this.sprayBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      doSpray();
    });

    this.container.addEventListener('pointerdown', (e) => {
      if (e.target !== this.sprayBtn) {
        doSpray();
      }
    });

    this.keyHandler = (e) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        doSpray();
      }
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  updateVisuals() {
    this.tempDisplay.textContent = `${this.currentTemp.toFixed(1)}°C`;
    const pct = (this.currentTemp - 35) / (99 - 35);

    if (this.currentTemp <= 45) {
      this.tempDisplay.style.color = '#38bdf8';
      this.tempDisplay.style.textShadow = '0 0 14px #38bdf8';
      this.gauge.style.borderColor = '#38bdf8';
      this.rack.style.borderColor = '#38bdf8';
      this.rack.style.boxShadow = '0 0 35px rgba(56, 189, 248, 0.5)';
    } else if (this.currentTemp <= 65) {
      this.tempDisplay.style.color = '#facc15';
      this.tempDisplay.style.textShadow = '0 0 14px #facc15';
      this.gauge.style.borderColor = '#facc15';
      this.rack.style.borderColor = '#facc15';
      this.rack.style.boxShadow = '0 0 35px rgba(250, 204, 21, 0.4)';
    } else {
      this.tempDisplay.style.color = '#ef4444';
      this.tempDisplay.style.textShadow = '0 0 14px #ef4444';
      this.gauge.style.borderColor = '#ef4444';
      this.rack.style.borderColor = '#ef4444';
      this.rack.style.boxShadow = '0 0 35px rgba(239, 68, 68, 0.6)';
    }
  }

  start() {
    this.startTimer(4200);

    // Heat passive creep back up over time
    this.creepInterval = setInterval(() => {
      if (this.isFinished || this.isPaused) return;
      this.currentTemp = Math.min(108, this.currentTemp + 0.45 * (this.config.speedMultiplier || 1));
      this.updateVisuals();
    }, 55);
  }

  unmount() {
    super.unmount();
    if (this.creepInterval) clearInterval(this.creepInterval);
    window.removeEventListener('keydown', this.keyHandler);
  }
}
