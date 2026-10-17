import { MicroGame } from '../../core/MicroGame.js';

export class DroneDrop extends MicroGame {
  setupUI() {
    // 4 hilarious satirical delivery scenarios
    const scenarios = [
      {
        id: 'pool',
        targetName: 'SWIMMING POOL',
        targetDesc: 'LIQUID CUSHION (100% SOFT)',
        subtitle: 'Aim for the pool! Water is 100% softer than concrete!',
        winReason: 'OLED TV safely water-cooled! Hydro-deceleration 100% gentle.',
        sfx: 'splash',
        accentColor: '#0ea5e9',
        icon: '🏊'
      },
      {
        id: 'dog',
        targetName: 'ROTTWEILER PEN',
        targetDesc: 'K-9 FUR DECELERATION',
        subtitle: 'Drop in the dog pen! Canine fur absorbs 98% of shock!',
        winReason: 'Package insulated by canine fur! Guard dog conducting chew inspection.',
        sfx: 'dogBark',
        accentColor: '#f59e0b',
        icon: '🐕'
      },
      {
        id: 'trampoline',
        targetName: 'KIDS TRAMPOLINE',
        targetDesc: 'ELASTIC KINETIC REBOUND',
        subtitle: 'Target the trampoline! Springs provide maximum synergy bounce!',
        winReason: 'Kinetic springs absorbed 99.4% of impact g-force!',
        sfx: 'boing',
        accentColor: '#10b981',
        icon: '🎪'
      },
      {
        id: 'pond',
        targetName: 'MUDDY KOI POND',
        targetDesc: 'ORGANIC SILT DAMPENING',
        subtitle: 'Target the muddy pond! Natural muck protects fragile silicon!',
        winReason: 'Mud cushion deployed! Natural silt sealed internal circuitry.',
        sfx: 'splash',
        accentColor: '#8b5cf6',
        icon: '🐸'
      }
    ];

    this.scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    this.createPrompt('DROP IN THE SOFT ZONE!', this.scenario.subtitle);

    // Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.touchAction = 'none';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // On-screen release button for touch devices
    this.createReleaseButton();

    // State
    this.droneX = 0;
    this.droneY = 0;
    this.droneVx = 2.4 * (this.config.speedMultiplier || 1);
    this.droneDir = 1;

    this.packageDropped = false;
    this.packageLanded = false;
    this.pkgX = 0;
    this.pkgY = 0;
    this.pkgVy = 0;
    this.pkgScale = 1.0;
    this.pkgRotation = 0;

    this.particles = [];
    this.rotorAngle = 0;

    this.resize();
    this.windowResizeHandler = () => this.resize();
    window.addEventListener('resize', this.windowResizeHandler);

    this.bindInputs();
  }

  recalcFlightSpeed() {
    const w = this.canvas?.width || this.container?.clientWidth || window.innerWidth;
    const margin = Math.min(80, w * 0.08);
    const travelDistance = Math.max(100, w - 2 * margin);

    // Make drone transit across the screen faster: completes one full trip in ~68% of the timeLimit
    // (At 4000ms base, full sweep takes ~2.7s, giving ample time to reach any target zone with plenty of buffer)
    const effectiveTimeLimit = this.timeLimit || Math.max(650, 4000 / (this.config.speedMultiplier || 1));
    const targetSweepMs = Math.max(450, effectiveTimeLimit * 0.68);
    const targetSweepFrames = targetSweepMs / 16.66;
    this.droneVx = travelDistance / targetSweepFrames;
  }

  resize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.canvas.width = w;
    this.canvas.height = h;

    this.groundY = h * 0.74;
    this.droneY = Math.max(90, h * 0.22);
    const margin = Math.min(80, w * 0.08);

    if (!this.packageDropped) {
      this.droneX = margin;
      this.droneDir = 1;
    }

    this.recalcFlightSpeed();

    // Configure 3 ground zones across width
    // Dynamic difficulty: Target zone width shrinks at higher speeds for tighter drop accuracy
    const speed = this.config.speedMultiplier || 1;
    const zoneScale = Math.max(0.55, 1.0 - (speed - 1) * 0.18);
    const zoneW = Math.min(150, w * 0.27 * zoneScale);
    const softOnRight = Math.random() > 0.5;

    this.zones = [
      {
        type: 'porch',
        label: 'CONCRETE PORCH',
        sublabel: 'DANGER: 0% SOFTNESS',
        isTarget: false,
        x: w * 0.18,
        y: this.groundY,
        w: zoneW,
        h: 75,
        color: '#ef4444'
      },
      {
        type: this.scenario.id,
        label: this.scenario.targetName,
        sublabel: this.scenario.targetDesc,
        isTarget: true,
        x: softOnRight ? w * 0.82 : w * 0.50,
        y: this.groundY,
        w: zoneW,
        h: 75,
        color: this.scenario.accentColor
      },
      {
        type: 'driveway',
        label: 'BRICK PATIO',
        sublabel: 'HARD SURFACE: UNACCEPTABLE',
        isTarget: false,
        x: softOnRight ? w * 0.50 : w * 0.82,
        y: this.groundY,
        w: zoneW,
        h: 75,
        color: '#ef4444'
      }
    ];
  }

  createReleaseButton() {
    const btn = document.createElement('button');
    btn.innerHTML = '📦 RELEASE PACKAGE [SPACE / TAP]';
    btn.style.position = 'absolute';
    btn.style.bottom = '16px';
    btn.style.left = '50%';
    btn.style.transform = 'translateX(-50%)';
    btn.style.width = 'min(92vw, 360px)';
    btn.style.padding = '14px 20px';
    btn.style.background = 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)';
    btn.style.color = '#ffffff';
    btn.style.border = '2px solid rgba(255, 255, 255, 0.4)';
    btn.style.borderRadius = '50px';
    btn.style.fontSize = 'clamp(0.92rem, 3.8vw, 1.2rem)';
    btn.style.fontWeight = '900';
    btn.style.letterSpacing = '0.5px';
    btn.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.5)';
    btn.style.cursor = 'pointer';
    btn.style.zIndex = '40';
    btn.style.whiteSpace = 'nowrap';
    btn.style.backdropFilter = 'blur(6px)';

    const trigger = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropPackage();
    };

    btn.addEventListener('pointerdown', trigger);
    this.container.appendChild(btn);
    this.releaseBtn = btn;
  }

  bindInputs() {
    this.keyHandler = (e) => {
      if (this.isFinished) return;
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.dropPackage();
      }
    };
    window.addEventListener('keydown', this.keyHandler);

    this.pointerHandler = (e) => {
      if (e.target !== this.releaseBtn) {
        this.dropPackage();
      }
    };
    this.canvas.addEventListener('pointerdown', this.pointerHandler);
  }

  dropPackage() {
    if (this.packageDropped || this.isFinished) return;
    this.packageDropped = true;
    this.pkgX = this.droneX;
    this.pkgY = this.droneY + 32;
    this.pkgVy = 2.5 * (this.config.speedMultiplier || 1);
    this.pkgScale = 1.0;

    if (this.releaseBtn) {
      this.releaseBtn.style.opacity = '0.5';
      this.releaseBtn.style.pointerEvents = 'none';
      this.releaseBtn.innerHTML = '🚀 PAYLOAD IN FLIGHT...';
    }

    if (this.audio) {
      this.audio.playSfx('swish');
    }
  }

  start() {
    // 4000ms timer
    this.startTimer(4000);
    this.recalcFlightSpeed();
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
    const w = this.canvas.width;

    // Drone flight (sweeps horizontally across yard)
    const margin = Math.min(80, w * 0.08);
    this.droneX += this.droneVx * this.droneDir;
    if (this.droneX > w - margin) {
      this.droneX = w - margin;
      this.droneDir = -1;
    } else if (this.droneX < margin) {
      this.droneX = margin;
      this.droneDir = 1;
    }

    this.rotorAngle = (this.rotorAngle + 0.45) % (Math.PI * 2);

    // Falling Package Physics (snappy fall speed)
    if (this.packageDropped && !this.packageLanded) {
      this.pkgVy += 0.85 * (this.config.speedMultiplier || 1);
      this.pkgY += this.pkgVy;
      // Slight perspective shrink as it falls away toward the ground
      this.pkgScale = Math.max(0.72, 1.0 - (this.pkgY - this.droneY) / (this.groundY * 1.8));

      // Check impact when package hits ground level
      if (this.pkgY >= this.groundY - 10) {
        this.packageLanded = true;
        this.pkgY = this.groundY - 10;
        this.evaluateImpact(this.pkgX);
      }
    }

    // Particle update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity || 0.2;
      p.alpha -= 0.025;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  evaluateImpact(impactX) {
    let hitZone = null;

    for (const z of this.zones) {
      const left = z.x - z.w / 2;
      const right = z.x + z.w / 2;
      if (impactX >= left && impactX <= right) {
        hitZone = z;
        break;
      }
    }

    if (hitZone && hitZone.isTarget) {
      // SUCCESS! Landed in the hilarious "Soft Zone"
      this.spawnSuccessParticles(impactX, this.groundY, hitZone.type);
      if (this.audio) {
        this.audio.playSfx(this.scenario.sfx);
      }
      this.win(this.scenario.winReason);
    } else if (hitZone && !hitZone.isTarget) {
      // FAIL: Landed on hard concrete porch / brick patio
      this.spawnCrashParticles(impactX, this.groundY);
      if (this.audio) {
        this.audio.playSfx('iceCrunch');
      }
      this.lose(`Unacceptable impact! ${hitZone.label} has 0% softness!`);
    } else {
      // Missed targets entirely (landed in flowerbed / lawn)
      this.spawnCrashParticles(impactX, this.groundY);
      if (this.audio) {
        this.audio.playSfx('thud');
      }
      this.lose('Package missed delivery zone! Customer filing complaint.');
    }
  }

  spawnSuccessParticles(x, y, type) {
    const count = 28;
    const colors = type === 'pool' 
      ? ['#38bdf8', '#0284c7', '#ffffff', '#7dd3fc'] 
      : (type === 'dog' 
          ? ['#b45309', '#f59e0b', '#fef3c7', '#d97706'] 
          : (type === 'trampoline' 
              ? ['#10b981', '#34d399', '#facc15', '#ffffff'] 
              : ['#84cc16', '#65a30d', '#4d7c0f', '#a3e635']));

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 0.15) + Math.random() * (Math.PI * 0.7);
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        vx: Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1) * speed,
        vy: -Math.sin(angle) * speed,
        gravity: 0.35,
        radius: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0
      });
    }
  }

  spawnCrashParticles(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle) * speed),
        gravity: 0.3,
        radius: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#94a3b8' : '#78350f',
        alpha: 1.0
      });
    }
  }

  draw() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // 1. Sky & Suburban Property Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#bae6fd'); // Daylight sky
    bgGrad.addColorStop(0.35, '#e0f2fe');
    bgGrad.addColorStop(0.36, '#86efac'); // Fresh green grass
    bgGrad.addColorStop(1, '#4ade80');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Decorative House Roofline & Garden Fence in background
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, h * 0.34, w, 8); // White picket fence rail
    for (let fx = 10; fx < w; fx += 28) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(fx, h * 0.30, 8, 26);
      ctx.beginPath();
      ctx.moveTo(fx, h * 0.30);
      ctx.lineTo(fx + 4, h * 0.28);
      ctx.lineTo(fx + 8, h * 0.30);
      ctx.fill();
    }

    // 2. Ground Landing Zones
    this.zones.forEach((z) => {
      this.drawLandingZone(z);
    });

    // 3. Falling Package or Suspended Package
    if (!this.packageDropped) {
      // Suspended directly beneath the drone
      this.drawPackage(this.droneX, this.droneY + 34, 1.0, true);
      // Laser targeting reticle line projecting downward
      this.drawTargetingLine(this.droneX, this.droneY + 44);
    } else {
      // Falling package with ground shadow
      const shadowY = this.groundY;
      const shadowW = Math.max(16, 44 * this.pkgScale);
      const shadowH = Math.max(6, 16 * this.pkgScale);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(this.pkgX, shadowY + 6, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      this.drawPackage(this.pkgX, this.pkgY, this.pkgScale, false);
    }

    // 4. Drone Quadcopter
    this.drawDrone(this.droneX, this.droneY);

    // 5. Impact Particles
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 6. Drone HUD Optical Telemetry
    this.drawHUD(w, h);
  }

  drawLandingZone(z) {
    const { ctx } = this;
    const left = z.x - z.w / 2;
    const top = z.y - z.h / 2;

    ctx.save();

    if (z.type === 'pool') {
      // Swimming Pool graphic
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(left, top, z.w, z.h, 16);
      ctx.fill();
      // Pool water ripples
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(z.x - 20, z.y, 14, 0, Math.PI);
      ctx.arc(z.x + 20, z.y, 14, 0, Math.PI);
      ctx.stroke();
      // Inflatable pool donut
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(z.x, z.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(z.x, z.y, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (z.type === 'dog') {
      // Dog Pen / Kennel graphic
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(left, top, z.w, z.h, 12);
      ctx.fill();
      // Dirt patch
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(z.x, z.y, z.w * 0.4, z.h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      // Cute guard dog emoji
      ctx.font = '36px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐕', z.x, z.y - 4);
    } else if (z.type === 'trampoline') {
      // Trampoline graphic
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(z.x, z.y, z.w * 0.44, z.h * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();
      // Trampoline jump star
      ctx.fillStyle = '#facc15';
      ctx.font = '22px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', z.x, z.y);
    } else if (z.type === 'pond') {
      // Muddy koi pond graphic
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.roundRect(left, top, z.w, z.h, 24);
      ctx.fill();
      ctx.fillStyle = '#365314';
      ctx.beginPath();
      ctx.ellipse(z.x, z.y, z.w * 0.38, z.h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '26px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐸', z.x, z.y);
    } else if (z.type === 'porch') {
      // Concrete front porch / welcome mat
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.roundRect(left, top, z.w, z.h, 8);
      ctx.fill();
      // Welcome mat
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.roundRect(z.x - 28, z.y - 14, 56, 28, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('WELCOME', z.x, z.y);
    } else {
      // Brick Patio / Driveway
      ctx.fillStyle = '#78716c';
      ctx.beginPath();
      ctx.roundRect(left, top, z.w, z.h, 8);
      ctx.fill();
      ctx.font = '26px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚗', z.x, z.y);
    }

    // AI Targeting Bounding Box
    if (z.isTarget) {
      // Pulsing green target frame
      const pulse = Math.sin(Date.now() * 0.008) * 4;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.strokeRect(left - 4 - pulse / 2, top - 4 - pulse / 2, z.w + 8 + pulse, z.h + 8 + pulse);

      // AI Target Badge at top
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(z.x - 65, top - 24, 130, 18, 4);
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.font = '900 9px Inter, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✅ AI OPTIMAL: SOFT ZONE', z.x, top - 15);
    } else {
      // Red warning frame
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(left - 2, top - 2, z.w + 4, z.h + 4);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.beginPath();
      ctx.roundRect(z.x - 55, top - 20, 110, 16, 4);
      ctx.fill();
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 8px Inter, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❌ HARD CONCRETE', z.x, top - 12);
    }

    ctx.restore();
  }

  drawTargetingLine(x, y) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, this.groundY);
    ctx.stroke();

    // Laser crosshair on the ground
    ctx.setLineDash([]);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, this.groundY, 12, 0, Math.PI * 2);
    ctx.moveTo(x - 18, this.groundY);
    ctx.lineTo(x + 18, this.groundY);
    ctx.moveTo(x, this.groundY - 18);
    ctx.lineTo(x, this.groundY + 18);
    ctx.stroke();

    ctx.restore();
  }

  drawDrone(x, y) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);

    // Quadcopter carbon fiber arms
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-42, -18);
    ctx.lineTo(42, 18);
    ctx.moveTo(-42, 18);
    ctx.lineTo(42, -18);
    ctx.stroke();

    // 4 Propeller Motors & Spinning Rotor Discs
    const motors = [
      { mx: -42, my: -18 },
      { mx: 42, my: -18 },
      { mx: -42, my: 18 },
      { mx: 42, my: 18 }
    ];

    motors.forEach((m) => {
      // Motor hub
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(m.mx, m.my, 5, 0, Math.PI * 2);
      ctx.fill();

      // Spinning rotor blur
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(m.mx, m.my, 20, 6, this.rotorAngle, 0, Math.PI * 2);
      ctx.fill();

      // Rotor tip lights (cyan / green)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(m.mx + Math.cos(this.rotorAngle) * 16, m.my + Math.sin(this.rotorAngle) * 4, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Main Drone Fuselage Pod (Sleek Autonomous Delivery Pod)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-24, -14, 48, 28, 12);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top status sensor dome
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(0, -6, 4, 0, Math.PI * 2);
    ctx.fill();

    // Benevolink Logo insignia
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 8px Inter, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BNVLK', 0, 4);

    // Front Camera Lens (looking downward)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(16, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Winch Suspension Cables (holding the package if not dropped)
    if (!this.packageDropped) {
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-10, 14);
      ctx.lineTo(-14, 26);
      ctx.moveTo(10, 14);
      ctx.lineTo(14, 26);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawPackage(x, y, scale, isHeld) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const boxW = 48;
    const boxH = 36;

    // Cardboard Box Body
    ctx.fillStyle = '#d97706'; // Kraft cardboard brown
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 4);
    ctx.fill();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Packaging tape across center
    ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
    ctx.fillRect(-6, -boxH / 2, 12, boxH);

    // "FRAGILE OLED" stamp
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FRAGILE', 0, -6);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 6px monospace';
    ctx.fillText('📺 OLED TV', 0, 6);

    ctx.restore();
  }

  drawHUD(w, h) {
    const { ctx } = this;
    ctx.save();
    // Top optical flight overlay
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(8, 48, Math.min(340, w - 16), 22);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('DRONE_ID: AIR-SYNERGY-9 // OPTICAL_DESCENT: 45M', 14, 59);

    ctx.restore();
  }

  unmount() {
    super.unmount();
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    window.removeEventListener('resize', this.windowResizeHandler);
    window.removeEventListener('keydown', this.keyHandler);
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.pointerHandler);
    }
  }
}
