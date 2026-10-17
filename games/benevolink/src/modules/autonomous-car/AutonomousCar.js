import { MicroGame } from '../../core/MicroGame.js';

export class AutonomousCar extends MicroGame {
  setupUI() {
    this.createPrompt('SWERVE!', 'Save the mammal! Steer into the soft foam!');

    // Main Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.touchAction = 'none';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // On-screen touch buttons for mobile ease
    this.createTouchControls();

    // Game state
    this.steered = false;
    this.carLane = 0; // -1 = left, 0 = center, 1 = right
    this.targetLane = 0;
    this.currentCarX = 0;
    this.safeLane = Math.random() > 0.5 ? 1 : -1; // -1 left, 1 right

    this.animals = [
      { emoji: '🦆', name: 'Duck Family' },
      { emoji: '🐕', name: 'Golden Retriever' },
      { emoji: '🐈', name: 'Sleepy Kitten' },
      { emoji: '🦌', name: 'Lost Fawn' }
    ];
    this.safeObjects = [
      { emoji: '🧽', name: 'Memory Foam Pile' },
      { emoji: '📦', name: 'Empty Cardboard' },
      { emoji: '🎈', name: 'Balloon Cluster' },
      { emoji: '🛏️', name: 'Mattress' }
    ];

    this.animalChoice = this.animals[Math.floor(Math.random() * this.animals.length)];
    this.safeChoice = this.safeObjects[Math.floor(Math.random() * this.safeObjects.length)];

    // Randomized Visual Themes (Day, Sunset, Neon Night)
    const envThemes = [
      {
        name: 'Sunny Coast',
        sky: '#7dd3fc',
        grass: '#86efac',
        asphalt: '#334155',
        curb: '#facc15',
        dash: '#ffffff'
      },
      {
        name: 'Sunset Canyon',
        sky: '#fb923c',
        grass: '#b45309',
        asphalt: '#3f3f46',
        curb: '#fef08a',
        dash: '#ffffff'
      },
      {
        name: 'Cyber Neon Night',
        sky: '#090d16',
        grass: '#064e3b',
        asphalt: '#18181b',
        curb: '#06b6d4',
        dash: '#38bdf8'
      }
    ];
    this.theme = envThemes[Math.floor(Math.random() * envThemes.length)];

    const carPaints = [
      { main: '#2563eb', light: '#60a5fa', dark: '#1e3a8a', roof: '#1d4ed8' }, // Electric Cobalt
      { main: '#dc2626', light: '#f87171', dark: '#7f1d1d', roof: '#b91c1c' }, // Crimson Turbo
      { main: '#eab308', light: '#fde047', dark: '#854d0e', roof: '#ca8a04' }, // Cyber Taxi Gold
      { main: '#059669', light: '#34d399', dark: '#064e3b', roof: '#047857' }, // Emerald Autonomy
      { main: '#7c3aed', light: '#c084fc', dark: '#4c1d95', roof: '#6d28d9' }  // Synthwave Violet
    ];
    this.carPaint = carPaints[Math.floor(Math.random() * carPaints.length)];
    this.carColor = this.carPaint.main;

    this.roadScroll = 0;
    this.collisionTriggered = false;
    this.sparks = [];

    this.resizeCanvas();
    this.windowResizeHandler = () => this.resizeCanvas();
    window.addEventListener('resize', this.windowResizeHandler);

    this.bindInputs();
  }

  resizeCanvas() {
    this.canvas.width = this.container.clientWidth || window.innerWidth;
    this.canvas.height = this.container.clientHeight || window.innerHeight;
    this.currentCarX = this.canvas.width / 2;
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

    const isNarrow = (this.container.clientWidth || window.innerWidth) < 540;

    const makeBtn = (text, dir) => {
      const btn = document.createElement('button');
      btn.innerHTML = text;
      btn.style.pointerEvents = 'auto';
      btn.style.flex = '1';
      btn.style.maxWidth = '280px';
      btn.style.background = 'rgba(255, 255, 255, 0.88)';
      btn.style.border = '2px solid #3498db';
      btn.style.borderRadius = '50px';
      btn.style.padding = isNarrow ? '12px 10px' : '14px 28px';
      btn.style.fontSize = 'clamp(0.88rem, 3.8vw, 1.35rem)';
      btn.style.fontWeight = 'bold';
      btn.style.color = '#1e293b';
      btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
      btn.style.cursor = 'pointer';
      btn.style.backdropFilter = 'blur(6px)';
      btn.style.whiteSpace = 'nowrap';

      const trigger = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.steer(dir);
      };

      btn.addEventListener('pointerdown', trigger);
      return btn;
    };

    const leftBtn = makeBtn(isNarrow ? '◀ STEER LEFT' : '◀ STEER LEFT [A / ←]', -1);
    const rightBtn = makeBtn(isNarrow ? 'STEER RIGHT ▶' : 'STEER RIGHT [D / →] ▶', 1);

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

    // Swipe / Click on canvas
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
        // Tap left or right half of screen
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
    this.carLane = dir;
    this.targetLane = dir;

    if (this.audio) {
      this.audio.playSfx('screech');
    }
  }

  start() {
    this.startTimer(3600);
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
    this.roadScroll += 16 * (this.config.speedMultiplier || 1);

    // Smooth car horizontal movement
    const laneOffset = this.canvas.width * 0.22;
    const targetX = this.canvas.width / 2 + this.carLane * laneOffset;
    this.currentCarX += (targetX - this.currentCarX) * 0.22;

    // Check collision when obstacles reach car (around progress = 0.88)
    if (progress >= 0.88 && !this.collisionTriggered) {
      this.collisionTriggered = true;
      if (!this.steered) {
        if (this.audio) this.audio.playSfx('quack');
        this.lose('No evasive action taken!');
      } else if (this.carLane === this.safeLane) {
        if (this.audio) this.audio.playSfx('thud');
        this.win('Safe impact! Foam compressed.');
      } else {
        if (this.audio) this.audio.playSfx('quack');
        this.lose('Impacted the animal! PR catastrophe!');
      }
    }
  }

  draw() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Sky & Grass (themed)
    ctx.fillStyle = this.theme.sky;
    ctx.fillRect(0, 0, w, h * 0.35);

    // If night theme, draw stars
    if (this.theme.sky === '#090d16') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 15; i++) {
        ctx.fillRect((i * 127) % w, (i * 47) % (h * 0.3), 2, 2);
      }
    }

    ctx.fillStyle = this.theme.grass;
    ctx.fillRect(0, h * 0.35, w, h * 0.65);

    // Perspective Road
    const horizonY = h * 0.35;
    const roadTopW = w * 0.18;
    const roadBottomW = w * 0.75;
    const roadTopLeft = (w - roadTopW) / 2;
    const roadTopRight = roadTopLeft + roadTopW;
    const roadBottomLeft = (w - roadBottomW) / 2;
    const roadBottomRight = roadBottomLeft + roadBottomW;

    // Asphalt
    ctx.fillStyle = this.theme.asphalt;
    ctx.beginPath();
    ctx.moveTo(roadTopLeft, horizonY);
    ctx.lineTo(roadTopRight, horizonY);
    ctx.lineTo(roadBottomRight, h);
    ctx.lineTo(roadBottomLeft, h);
    ctx.closePath();
    ctx.fill();

    // Road Curbs / Edge lines
    ctx.lineWidth = 6;
    ctx.strokeStyle = this.theme.curb;
    ctx.beginPath();
    ctx.moveTo(roadTopLeft, horizonY);
    ctx.lineTo(roadBottomLeft, h);
    ctx.moveTo(roadTopRight, horizonY);
    ctx.lineTo(roadBottomRight, h);
    ctx.stroke();

    // Center Dashed Line (animated)
    ctx.strokeStyle = this.theme.dash;
    ctx.lineWidth = 5;
    ctx.setLineDash([30, 25]);
    ctx.lineDashOffset = -this.roadScroll % 55;
    ctx.beginPath();
    ctx.moveTo(w / 2, horizonY);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw Obstacles coming towards player
    const progress = 1 - Math.max(0, this.timeRemaining / this.timeLimit);
    // Exponential scale for perspective feel
    const obsY = horizonY + Math.pow(progress, 1.5) * (h * 0.52);
    const obsScale = 0.3 + progress * 0.9;
    const laneOffset = (w * 0.22) * progress;

    const leftX = w / 2 - laneOffset;
    const rightX = w / 2 + laneOffset;

    const leftObj = this.safeLane === -1 ? this.safeChoice : this.animalChoice;
    const rightObj = this.safeLane === 1 ? this.safeChoice : this.animalChoice;

    this.drawObstacle(leftX, obsY, leftObj, obsScale);
    this.drawObstacle(rightX, obsY, rightObj, obsScale);

    // Draw Player's Autonomous Car
    const carY = h * 0.78;
    this.drawCar(this.currentCarX, carY);
  }

  drawObstacle(x, y, obj, scale) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 20, 35, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Emoji icon
    ctx.font = '64px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obj.emoji, 0, 0);

    // Label tag
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.beginPath();
    ctx.roundRect(-50, -45, 100, 20, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(obj.name, 0, -35);

    ctx.restore();
  }

  drawCar(x, y) {
    const { ctx } = this;
    const paint = this.carPaint || { main: this.carColor, light: '#60a5fa', dark: '#1e3a8a', roof: '#1d4ed8' };
    ctx.save();
    ctx.translate(x, y);

    // Smooth banking/steering angle based on horizontal velocity + lane
    const steerRatio = (x - this.canvas.width / 2) / (this.canvas.width * 0.22 || 1);
    const tilt = (this.carLane * 0.14) - (steerRatio - this.carLane) * 0.08;
    ctx.rotate(tilt);

    // 1. Headlight Beams (drawn beneath the car projecting forward)
    const beamGrad = ctx.createLinearGradient(0, -72, 0, -195);
    beamGrad.addColorStop(0, 'rgba(254, 249, 195, 0.55)');
    beamGrad.addColorStop(0.6, 'rgba(254, 240, 138, 0.22)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = beamGrad;

    // Left headlight cone
    ctx.beginPath();
    ctx.moveTo(-34, -74);
    ctx.lineTo(-72, -195);
    ctx.lineTo(-8, -195);
    ctx.lineTo(-20, -74);
    ctx.closePath();
    ctx.fill();

    // Right headlight cone
    ctx.beginPath();
    ctx.moveTo(34, -74);
    ctx.lineTo(72, -195);
    ctx.lineTo(8, -195);
    ctx.lineTo(20, -74);
    ctx.closePath();
    ctx.fill();

    // 2. Ground Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(0, -8, 56, 54, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Four Rubber Tires (front wheels pivot slightly when steering)
    const wheelSteer = this.carLane * 0.22;
    const drawWheel = (wx, wy, wWidth, wHeight, angle = 0) => {
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(angle);
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(-wWidth / 2, -wHeight / 2, wWidth, wHeight, 4);
      ctx.fill();
      // Tire tread highlight
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-wWidth / 2 + 1.5, -wHeight / 2 + 3, wWidth - 3, wHeight - 6);
      ctx.restore();
    };

    // Front-left & Front-right wheels
    drawWheel(-42, -52, 12, 24, wheelSteer);
    drawWheel(42, -52, 12, 24, wheelSteer);
    // Rear-left & Rear-right wide tires
    drawWheel(-47, 6, 14, 26, 0);
    drawWheel(47, 6, 14, 26, 0);

    // 4. Side Mirrors
    ctx.fillStyle = paint.dark;
    ctx.beginPath();
    ctx.moveTo(-39, -36);
    ctx.lineTo(-52, -32);
    ctx.lineTo(-50, -26);
    ctx.lineTo(-39, -28);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(39, -36);
    ctx.lineTo(52, -32);
    ctx.lineTo(50, -26);
    ctx.lineTo(39, -28);
    ctx.closePath();
    ctx.fill();

    // 5. Sculpted Main Chassis (tapered nose, wide rear haunches)
    const bodyGrad = ctx.createLinearGradient(-48, -78, 48, 30);
    bodyGrad.addColorStop(0, paint.light);
    bodyGrad.addColorStop(0.45, paint.main);
    bodyGrad.addColorStop(1, paint.dark);
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(-28, -80); // Front nose left
    ctx.quadraticCurveTo(0, -84, 28, -80); // Rounded front bumper
    ctx.quadraticCurveTo(40, -76, 42, -56); // Front right fender
    ctx.lineTo(44, -26); // Waistline
    ctx.quadraticCurveTo(50, -6, 48, 20); // Wide rear right haunch
    ctx.quadraticCurveTo(46, 32, 34, 34); // Rear right corner
    ctx.lineTo(-34, 34); // Rear bumper bottom
    ctx.quadraticCurveTo(-46, 32, -48, 20); // Rear left corner
    ctx.quadraticCurveTo(-50, -6, -44, -26); // Wide rear left haunch
    ctx.lineTo(-42, -56); // Front left fender
    ctx.quadraticCurveTo(-40, -76, -28, -80);
    ctx.closePath();
    ctx.fill();

    // Subtle metallic body outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Front Hood Power-Dome Crease Lines
    ctx.strokeStyle = paint.dark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-22, -54);
    ctx.lineTo(-16, -78);
    ctx.moveTo(22, -54);
    ctx.lineTo(16, -78);
    ctx.stroke();

    // Front LED Headlight Strips (at nose edge)
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.roundRect(-35, -78, 12, 4, 2);
    ctx.roundRect(23, -78, 12, 4, 2);
    ctx.fill();

    // 6. Greenhouse / Cabin Canopy (Windshield, Panoramic Roof, Sloped Rear Glass)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-31, -52); // Front windshield top-left
    ctx.quadraticCurveTo(0, -56, 31, -52); // Curved windshield header
    ctx.lineTo(36, -28); // A-pillar right
    ctx.lineTo(33, 12);  // C-pillar right
    ctx.quadraticCurveTo(0, 16, -33, 12); // Rear glass base
    ctx.lineTo(-36, -28); // A-pillar left
    ctx.closePath();
    ctx.fill();

    // Front Windshield Cyan Reflection
    const glassGrad = ctx.createLinearGradient(-28, -52, 20, -28);
    glassGrad.addColorStop(0, 'rgba(56, 189, 248, 0.65)');
    glassGrad.addColorStop(1, 'rgba(15, 23, 42, 0.1)');
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.moveTo(-28, -50);
    ctx.quadraticCurveTo(0, -53, 28, -50);
    ctx.lineTo(32, -33);
    ctx.lineTo(-32, -33);
    ctx.closePath();
    ctx.fill();

    // Painted Roof Frame & Pillars (separating front windshield, panoramic roof, and rear backlight)
    ctx.strokeStyle = paint.light;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    // Left roof rail
    ctx.moveTo(-31, -51);
    ctx.lineTo(-34, -28);
    ctx.lineTo(-27, -2);
    ctx.lineTo(-31, 11);
    // Right roof rail
    ctx.moveTo(31, -51);
    ctx.lineTo(34, -28);
    ctx.lineTo(27, -2);
    ctx.lineTo(31, 11);
    ctx.stroke();

    // Roof Center Panel (between windshield and rear window)
    ctx.fillStyle = paint.roof;
    ctx.beginPath();
    ctx.roundRect(-27, -33, 54, 30, 6);
    ctx.fill();

    // Sloped Rear Window Glass & Defroster Lines
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-25, -1);
    ctx.lineTo(25, -1);
    ctx.lineTo(29, 11);
    ctx.lineTo(-29, 11);
    ctx.closePath();
    ctx.fill();

    // Rear glass diagonal sheen
    ctx.fillStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-12, 10);
    ctx.lineTo(-24, 10);
    ctx.closePath();
    ctx.fill();

    // 7. Rear Deck Spoiler, Full-Width Cyber Lightbar & Bumper Diffuser
    // Subtle rear lip spoiler
    ctx.fillStyle = paint.dark;
    ctx.beginPath();
    ctx.roundRect(-38, 14, 76, 5, 2);
    ctx.fill();

    // Rear Lower Aerodynamic Diffuser
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-36, 23, 72, 11, [2, 2, 8, 8]);
    ctx.fill();

    // Dual Exhaust / EV Thruster Ports
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(-31, 28, 10, 4, 2);
    ctx.roundRect(21, 28, 10, 4, 2);
    ctx.fill();

    // Corporate License Plate ("BNVLK")
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.roundRect(-14, 24, 28, 8, 1.5);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 6px Inter, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BNVLK', 0, 28.5);

    // Full-Width LED Taillight Strip + Glowing Brake Clusters
    ctx.save();
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ef4444';
    // Center lightbar
    ctx.fillRect(-40, 18, 80, 3);
    // Left & right main brake pods
    ctx.beginPath();
    ctx.roundRect(-43, 16, 18, 6, 2);
    ctx.roundRect(25, 16, 18, 6, 2);
    ctx.fill();
    ctx.restore();

    // Inner bright brake core
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(-40, 18, 12, 2.5);
    ctx.fillRect(28, 18, 12, 2.5);

    // Amber Turn Signal when steering left or right!
    if (this.carLane !== 0 && Math.floor(Date.now() / 90) % 2 === 0) {
      ctx.fillStyle = '#f59e0b';
      if (this.carLane === -1) {
        ctx.fillRect(-44, 16, 8, 6);
      } else {
        ctx.fillRect(36, 16, 8, 6);
      }
    }

    // 8. Rooftop Autonomous Sensor Dome & Spinning LiDAR Radar
    const lidarY = -18;
    const lidarAngle = (Date.now() * 0.015) % (Math.PI * 2);

    // Sweeping Cyan LiDAR Laser Cone
    ctx.save();
    ctx.translate(0, lidarY);
    ctx.rotate(lidarAngle);
    const lidarGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 34);
    lidarGrad.addColorStop(0, 'rgba(56, 189, 248, 0.65)');
    lidarGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = lidarGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 34, -0.45, 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // White Aerodynamic Sensor Pod Fairing
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, lidarY, 13, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Central Spinning LiDAR Puck
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, lidarY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Cyan Sensor Lens Ring & Emitter Line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, lidarY, 5.5, lidarAngle - 0.8, lidarAngle + 0.8);
    ctx.stroke();

    // Top Status LED
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(0, lidarY, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  unmount() {
    super.unmount();
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    window.removeEventListener('resize', this.windowResizeHandler);
    window.removeEventListener('keydown', this.keyHandler);
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.canvasPointerDown);
      this.canvas.removeEventListener('pointerup', this.canvasPointerUp);
    }
  }
}
