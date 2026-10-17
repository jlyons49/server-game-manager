/**
 * Main Game Controller
 * Orchestrates game states, game loop, camera, HUD, input, progression, cosmetics, and transitions.
 */

import { AudioEngine } from './audio.js';
import { MathEngine } from './mathEngine.js';
import { SpriteRenderer } from './sprites.js';
import { Submarine } from './submarine.js';
import { SeaMonster } from './monster.js';
import { World } from './world.js';
import { MathVault } from './mathVault.js';
import { SettingsManager } from './settings.js';
import { ProgressionManager, SKINS, HEADLIGHT_COLORS, RANKS } from './progression.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Internal rendering resolution (crisp retro virtual resolution)
        this.width = 640;
        this.height = 360;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Core subsystems
        this.audio = new AudioEngine();
        this.progression = new ProgressionManager();
        this.mathEngine = new MathEngine('grade_3');
        this.sprites = new SpriteRenderer();
        this.submarine = new Submarine(320, 80);
        this.monster = new SeaMonster();
        this.selectedShip = 'pirate'; // 'pirate', 'titanic', 'plane'
        this.world = new World(this.selectedShip);
        this.settings = new SettingsManager(this.audio, this.mathEngine);

        this.vault = new MathVault(this.mathEngine, this.audio, (result) => {
            this.onVaultSolved(result);
        });

        // Game state: 'HOME', 'DIVING', 'VAULT', 'RETURNING', 'VICTORY', 'GAMEOVER'
        this.state = 'HOME';

        // Camera & Shake
        this.camera = { x: 0, y: 0 };
        this.screenShake = 0;

        // Game stats
        this.score = 0;
        this.doubloons = 0;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.mathAccuracy = { total: 0, solved: 0, wrong: 0 };

        // Active shop tab ('skins' or 'lights')
        this.activeShopTab = 'skins';

        // Input state
        this.input = {
            left: false,
            right: false,
            up: false,
            down: false,
            boost: false
        };

        this.lastTime = performance.now();

        this.initInput();
        this.initUI();
        this.updateHomeScreen();

        // Start animation loop
        requestAnimationFrame((t) => this.loop(t));
    }

    initInput() {
        // Keyboard listeners
        window.addEventListener('keydown', (e) => {
            this.audio.init();

            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.left = true;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = true;
            if (e.code === 'ArrowUp' || e.code === 'KeyW') this.input.up = true;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') this.input.down = true;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.input.boost = true;

            // Sonar Ping (Space)
            if (e.code === 'Space') {
                if (this.state === 'DIVING' || this.state === 'RETURNING') {
                    if (this.submarine.triggerSonar()) {
                        this.audio.playSonarPing();
                    }
                }
            }

            // Torpedo (KeyF or KeyE)
            if (e.code === 'KeyF' || e.code === 'KeyE') {
                if (this.state === 'DIVING' || this.state === 'RETURNING') {
                    if (this.world.fireTorpedo(this.submarine)) {
                        this.audio.playTorpedo();
                    }
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.left = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = false;
            if (e.code === 'ArrowUp' || e.code === 'KeyW') this.input.up = false;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') this.input.down = false;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.input.boost = false;
        });

        // Touch / On-screen controls for mobile or tablet
        const bindBtn = (id, action) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const startHandler = (e) => {
                e.preventDefault();
                this.audio.init();
                this.input[action] = true;
            };
            const endHandler = (e) => {
                e.preventDefault();
                this.input[action] = false;
            };
            btn.addEventListener('mousedown', startHandler);
            btn.addEventListener('mouseup', endHandler);
            btn.addEventListener('touchstart', startHandler);
            btn.addEventListener('touchend', endHandler);
        };

        bindBtn('touch-left', 'left');
        bindBtn('touch-right', 'right');
        bindBtn('touch-up', 'up');
        bindBtn('touch-down', 'down');
        bindBtn('touch-boost', 'boost');

        const sonarTouch = document.getElementById('touch-sonar');
        if (sonarTouch) {
            sonarTouch.addEventListener('click', (e) => {
                e.preventDefault();
                this.audio.init();
                if (this.submarine.triggerSonar()) {
                    this.audio.playSonarPing();
                }
            });
        }

        const torpedoTouch = document.getElementById('touch-torpedo');
        if (torpedoTouch) {
            torpedoTouch.addEventListener('click', (e) => {
                e.preventDefault();
                this.audio.init();
                if (this.world.fireTorpedo(this.submarine)) {
                    this.audio.playTorpedo();
                }
            });
        }
    }

    initUI() {
        // Shipwreck Target Selection Buttons
        const setShip = (type, label) => {
            this.selectedShip = type;
            document.querySelectorAll('.ship-btn').forEach(b => b.classList.remove('active'));
            const btn = document.getElementById(`ship-select-${type}`);
            if (btn) btn.classList.add('active');
            const lbl = document.getElementById('selected-ship-label');
            if (lbl) lbl.textContent = label;
            this.audio.playLockClick();
        };

        document.getElementById('ship-select-pirate').addEventListener('click', () => setShip('pirate', 'PIRATE GALLEON'));
        document.getElementById('ship-select-titanic').addEventListener('click', () => setShip('titanic', 'R.M.S. TITANIC'));
        document.getElementById('ship-select-plane').addEventListener('click', () => setShip('plane', 'B-17 FLYING FORTRESS'));

        // Home Screen Actions
        document.getElementById('btn-home-dive').addEventListener('click', () => {
            this.audio.init();
            this.startGame();
        });

        document.getElementById('btn-home-shop').addEventListener('click', () => {
            this.audio.init();
            this.openShopModal();
        });

        document.getElementById('btn-home-ranks').addEventListener('click', () => {
            this.audio.init();
            this.openRanksModal();
        });

        document.getElementById('btn-home-settings').addEventListener('click', () => {
            this.audio.init();
            this.settings.show();
        });

        document.getElementById('btn-home-instructions').addEventListener('click', () => {
            document.getElementById('instructions-modal').classList.remove('hidden');
        });

        document.getElementById('instructions-close-btn').addEventListener('click', () => {
            document.getElementById('instructions-modal').classList.add('hidden');
        });

        // In-Game HUD Home & Settings Buttons
        document.getElementById('hud-home-btn').addEventListener('click', () => {
            if (confirm('Return to Base Command? Your current expedition dive will be abandoned.')) {
                this.returnToHome();
            }
        });

        document.getElementById('hud-settings-btn').addEventListener('click', () => {
            this.settings.show();
        });

        // Victory Screen buttons
        document.getElementById('btn-victory-again').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('btn-victory-home').addEventListener('click', () => {
            this.returnToHome();
        });

        // Game Over Screen buttons
        document.getElementById('btn-gameover-restart').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('btn-gameover-home').addEventListener('click', () => {
            this.returnToHome();
        });

        // Shop Modal close & tabs
        document.getElementById('shop-close-btn').addEventListener('click', () => {
            document.getElementById('shop-modal').classList.add('hidden');
            this.updateHomeScreen();
        });

        document.getElementById('shop-tab-skins').addEventListener('click', () => {
            this.activeShopTab = 'skins';
            document.getElementById('shop-tab-skins').classList.add('active');
            document.getElementById('shop-tab-lights').classList.remove('active');
            this.renderShopItems();
        });

        document.getElementById('shop-tab-lights').addEventListener('click', () => {
            this.activeShopTab = 'lights';
            document.getElementById('shop-tab-lights').classList.add('active');
            document.getElementById('shop-tab-skins').classList.remove('active');
            this.renderShopItems();
        });

        // Ranks Modal close
        document.getElementById('ranks-close-btn').addEventListener('click', () => {
            document.getElementById('ranks-modal').classList.add('hidden');
        });
    }

    updateHomeScreen() {
        const rank = this.progression.getCurrentRank();
        const rankEl = document.getElementById('home-rank-badge');
        if (rankEl) {
            rankEl.innerHTML = `<span>${rank.icon}</span> <b>RANK: ${rank.name.toUpperCase()} (LVL ${rank.level})</b>`;
        }

        const walletEl = document.getElementById('home-wallet-badge');
        if (walletEl) {
            walletEl.innerHTML = `<span>🪙</span> <b>${this.progression.doubloons} DOUBLOONS</b>`;
        }

        const gradeBadge = document.getElementById('home-grade-badge');
        if (gradeBadge) {
            gradeBadge.textContent = `MATH: ${this.settings.settings.gradeLevel.toUpperCase().replace('_', ' ')} (CHANGE IN SETTINGS)`;
        }
    }

    openShopModal() {
        const modal = document.getElementById('shop-modal');
        modal.classList.remove('hidden');
        this.renderShopItems();
    }

    renderShopItems() {
        const container = document.getElementById('shop-items-container');
        const balanceEl = document.getElementById('shop-balance-text');
        if (balanceEl) {
            balanceEl.textContent = `🪙 ${this.progression.doubloons} DOUBLOONS`;
        }

        container.innerHTML = '';

        if (this.activeShopTab === 'skins') {
            Object.values(SKINS).forEach(skin => {
                const isUnlocked = this.progression.unlockedSkins.includes(skin.id);
                const isEquipped = this.progression.activeSkin === skin.id;

                const card = document.createElement('div');
                card.className = 'shop-item-card' + (isEquipped ? ' equipped' : '');

                card.innerHTML = `
                    <div class="shop-item-header">
                        <b>${skin.name}</b>
                        <span style="display:inline-block; width:14px; height:14px; background:${skin.hullColor}; border:1px solid #fff; border-radius:3px;"></span>
                    </div>
                    <div class="shop-item-desc">${skin.desc}</div>
                    <div class="shop-item-action">
                        <span class="shop-cost">${isUnlocked ? 'UNLOCKED' : `🪙 ${skin.cost}`}</span>
                        <button class="pixel-btn ${isEquipped ? 'btn-green' : isUnlocked ? 'btn-gold' : 'btn-purple'} shop-action-btn">
                            ${isEquipped ? 'EQUIPPED' : isUnlocked ? 'EQUIP' : 'BUY'}
                        </button>
                    </div>
                `;

                const actionBtn = card.querySelector('.shop-action-btn');
                if (isEquipped) {
                    actionBtn.disabled = true;
                } else if (isUnlocked) {
                    actionBtn.addEventListener('click', () => {
                        this.progression.equipSkin(skin.id);
                        this.audio.playLockClick();
                        this.renderShopItems();
                    });
                } else {
                    if (this.progression.doubloons < skin.cost) {
                        actionBtn.disabled = true;
                    }
                    actionBtn.addEventListener('click', () => {
                        if (this.progression.buySkin(skin.id)) {
                            this.audio.playCoin();
                            this.renderShopItems();
                        }
                    });
                }

                container.appendChild(card);
            });
        } else {
            Object.values(HEADLIGHT_COLORS).forEach(light => {
                const isUnlocked = this.progression.unlockedLights.includes(light.id);
                const isEquipped = this.progression.activeLight === light.id;

                const card = document.createElement('div');
                card.className = 'shop-item-card' + (isEquipped ? ' equipped' : '');

                card.innerHTML = `
                    <div class="shop-item-header">
                        <b>${light.name}</b>
                        <span style="display:inline-block; width:14px; height:14px; background:${light.mid}; border:1px solid #fff; border-radius:50%;"></span>
                    </div>
                    <div class="shop-item-desc">High-intensity forward illumination beam.</div>
                    <div class="shop-item-action">
                        <span class="shop-cost">${isUnlocked ? 'UNLOCKED' : `🪙 ${light.cost}`}</span>
                        <button class="pixel-btn ${isEquipped ? 'btn-green' : isUnlocked ? 'btn-gold' : 'btn-purple'} shop-action-btn">
                            ${isEquipped ? 'EQUIPPED' : isUnlocked ? 'EQUIP' : 'BUY'}
                        </button>
                    </div>
                `;

                const actionBtn = card.querySelector('.shop-action-btn');
                if (isEquipped) {
                    actionBtn.disabled = true;
                } else if (isUnlocked) {
                    actionBtn.addEventListener('click', () => {
                        this.progression.equipLight(light.id);
                        this.audio.playLockClick();
                        this.renderShopItems();
                    });
                } else {
                    if (this.progression.doubloons < light.cost) {
                        actionBtn.disabled = true;
                    }
                    actionBtn.addEventListener('click', () => {
                        if (this.progression.buyLight(light.id)) {
                            this.audio.playCoin();
                            this.renderShopItems();
                        }
                    });
                }

                container.appendChild(card);
            });
        }
    }

    openRanksModal() {
        const modal = document.getElementById('ranks-modal');
        modal.classList.remove('hidden');

        const rank = this.progression.getCurrentRank();
        document.getElementById('log-rank-name').innerHTML = `${rank.icon} RANK: ${rank.name.toUpperCase()} (LEVEL ${rank.level})`;
        document.getElementById('log-victories-count').textContent = `EXPEDITIONS: ${this.progression.victories}`;

        const xpBar = document.getElementById('log-xp-bar');
        const xpText = document.getElementById('log-xp-text');

        if (rank.nextRank) {
            xpBar.style.width = `${rank.progressPct}%`;
            xpText.textContent = `${this.progression.xp} / ${rank.nextRank.minXp} XP (${rank.neededXp} to ${rank.nextRank.name})`;
        } else {
            xpBar.style.width = '100%';
            xpText.textContent = `${this.progression.xp} XP (MAX RANK ACHIEVED!)`;
        }

        const roadmapContainer = document.getElementById('rank-roadmap-container');
        roadmapContainer.innerHTML = '';

        RANKS.forEach(r => {
            const isAchieved = this.progression.xp >= r.minXp;
            const isCurrent = r.level === rank.level;

            const row = document.createElement('div');
            row.className = 'rank-tier-row' + (isCurrent ? ' current' : isAchieved ? ' achieved' : '');

            row.innerHTML = `
                <span>${r.icon} LVL ${r.level}: ${r.name}</span>
                <span>${r.minXp} XP ${isCurrent ? '◀ CURRENT' : isAchieved ? '✔ UNLOCKED' : '🔒 LOCKED'}</span>
            `;
            roadmapContainer.appendChild(row);
        });
    }

    startGame() {
        this.world = new World(this.selectedShip);
        this.submarine.reset(320, 80);
        this.monster.reset();
        this.score = 0;
        this.doubloons = 0;
        this.startTime = performance.now();
        this.elapsedTime = 0;
        this.mathAccuracy = { total: 0, solved: 0, wrong: 0 };

        this.setState('DIVING');
        this.audio.playMusic('descent');
    }

    returnToHome() {
        this.audio.stopMusic();
        this.setState('HOME');
        this.updateHomeScreen();
    }

    setState(newState) {
        this.state = newState;

        const screens = {
            HOME: document.getElementById('home-screen'),
            HUD: document.getElementById('hud-overlay'),
            TOUCH: document.getElementById('touch-controls'),
            VICTORY: document.getElementById('victory-screen'),
            GAMEOVER: document.getElementById('gameover-screen')
        };

        // Hide all screens first
        Object.values(screens).forEach(s => s && s.classList.add('hidden'));

        if (newState === 'HOME') {
            screens.HOME.classList.remove('hidden');
            this.updateHomeScreen();
        } else if (newState === 'DIVING') {
            screens.HUD.classList.remove('hidden');
            screens.TOUCH.classList.remove('hidden');
            document.getElementById('monster-proximity-bar').classList.add('hidden');
        } else if (newState === 'VAULT') {
            screens.HUD.classList.remove('hidden');
            screens.TOUCH.classList.add('hidden');
        } else if (newState === 'RETURNING') {
            screens.HUD.classList.remove('hidden');
            screens.TOUCH.classList.remove('hidden');
            document.getElementById('monster-proximity-bar').classList.remove('hidden');
        } else if (newState === 'VICTORY') {
            screens.VICTORY.classList.remove('hidden');
            this.updateVictoryScreen();
        } else if (newState === 'GAMEOVER') {
            screens.GAMEOVER.classList.remove('hidden');
            this.audio.stopMusic();
        }
    }

    onVaultSolved(result) {
        this.hasTreasure = !!result.success;
        this.world.shipwreck.looted = this.hasTreasure;
        this.mathAccuracy.solved += result.solvedProblems;
        this.mathAccuracy.wrong += result.missedProblems;
        this.mathAccuracy.total += result.totalProblems;

        if (this.hasTreasure) {
            this.score += 2500;
        } else {
            this.score += 400; // survival effort score
        }

        // Spawn Sea Monster right below the shipwreck!
        this.monster.spawn(this.submarine.x, this.submarine.y + 220);

        this.setState('RETURNING');
        this.audio.playMusic('chase');

        // Initial monster rumble
        this.triggerScreenShake(20);
    }

    triggerScreenShake(intensity = 15) {
        if (this.settings.settings.screenShake) {
            this.screenShake = intensity;
        }
    }

    update(dt) {
        if (this.state === 'DIVING' || this.state === 'RETURNING') {
            this.elapsedTime = Math.floor((performance.now() - this.startTime) / 1000);

            // Submarine physics
            const bounds = {
                width: this.world.width,
                minY: 40,
                maxY: this.world.seafloorY - 20
            };
            this.submarine.update(this.input, bounds, dt);

            // Oxygen consumption (gentle rate)
            this.submarine.oxygen = Math.max(0, this.submarine.oxygen - 0.015 * dt);
            if (this.submarine.oxygen <= 0) {
                this.submarine.takeDamage(0.2 * dt);
            }

            // Engine bubble particles
            if (Math.hypot(this.submarine.vx, this.submarine.vy) > 0.4 && Math.random() < 0.4) {
                const propX = this.submarine.x - this.submarine.facing * 28;
                const propY = this.submarine.y;
                this.world.addBubble(propX, propY, -this.submarine.vx * 0.2, -0.4, 3);
                if (Math.random() < 0.1) {
                    this.audio.playBubble();
                }
            }

            // World updates (including oxygen vent bubble geysers)
            this.world.update(dt);

            // Collisions & Oxygen Vents
            this.world.checkCollisions(
                this.submarine,
                (item) => {
                    if (item.type === 'coin') {
                        this.doubloons++;
                        this.score += 100;
                        this.audio.playCoin();
                    } else if (item.type === 'oxygen') {
                        this.submarine.replenishOxygen(45);
                        this.audio.playBubble();
                    } else if (item.type === 'repair') {
                        this.submarine.heal(30);
                        this.audio.playLockClick();
                    } else if (item.type === 'torpedo_pickup') {
                        this.submarine.addTorpedo(2);
                        this.audio.playLockClick();
                    }
                },
                (hazardType) => {
                    this.audio.playHit();
                    this.triggerScreenShake(12);
                },
                (mine) => {
                    this.audio.playExplosion();
                    this.triggerScreenShake(20);
                }
            );

            // Audio cues for oxygen recharge
            if (this.submarine.isRechargingOxygen && Math.random() < 0.08) {
                this.audio.playBubble();
            }

            // Check if docked at shipwreck during descent
            if (this.state === 'DIVING' && this.world.isSubmarineAtShipwreck(this.submarine)) {
                this.setState('VAULT');
                this.vault.start(this.settings.settings.problemCount, this.selectedShip);
            }

            // Monster update during RETURNING state
            if (this.state === 'RETURNING') {
                this.monster.update(this.submarine, { width: this.world.width }, dt);

                // Monster roar audio during warning state
                if (this.monster.state === 'warning' && this.monster.stateTimer < dt * 2) {
                    this.audio.playMonsterRoar();
                    this.triggerScreenShake(18);
                }

                // Check monster collision with submarine
                if (this.monster.checkPlayerCollision(this.submarine)) {
                    const damaged = this.submarine.takeDamage(35);
                    if (damaged) {
                        this.audio.playHit();
                        this.triggerScreenShake(25);
                        // Knock submarine away
                        this.submarine.vy = -6;
                    }
                }

                // Check Torpedo vs Monster collision
                for (let ti = this.world.torpedoes.length - 1; ti >= 0; ti--) {
                    const t = this.world.torpedoes[ti];
                    const distToMonster = Math.hypot(t.x - this.monster.x, t.y - this.monster.y);
                    if (distToMonster < 48) {
                        this.monster.stun();
                        this.world.torpedoes.splice(ti, 1);
                        this.world.addSparkles(this.monster.x, this.monster.y, 20, '#60a5fa');
                        this.audio.playExplosion();
                        this.triggerScreenShake(15);
                        this.score += 500;
                        break;
                    }
                }

                // Check Victory condition: Submarine safely reaches the surface (depth <= 65m)
                if (this.submarine.y <= 65) {
                    this.setState('VICTORY');
                    this.audio.playChestOpenFanfare();
                }
            }

            // Check Death condition: Hull reached 0
            if (this.submarine.health <= 0) {
                this.setState('GAMEOVER');
                this.audio.playExplosion();
            }

            this.updateHUD();
        }

        // Camera smoothly follows submarine
        const targetCamX = this.submarine.x - this.width / 2;
        const targetCamY = this.submarine.y - this.height / 2;
        this.camera.x += (targetCamX - this.camera.x) * 0.1;
        this.camera.y += (targetCamY - this.camera.y) * 0.1;

        // Camera bounds
        this.camera.x = Math.max(0, Math.min(this.world.width - this.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.world.height - this.height, this.camera.y));

        // Shake decay
        if (this.screenShake > 0) {
            this.screenShake = Math.max(0, this.screenShake - 0.8 * dt);
        }
    }

    updateHUD() {
        // Current depth in meters (y: 60 -> 0m, y: 2160 -> 2100m)
        const depthMeters = Math.max(0, Math.round(this.submarine.y - 60));
        document.getElementById('hud-depth').textContent = `${depthMeters}m`;

        // Health bar
        const healthPct = (this.submarine.health / this.submarine.maxHealth) * 100;
        document.getElementById('hud-health-bar').style.width = `${healthPct}%`;

        // Oxygen bar
        const oxygenPct = (this.submarine.oxygen / this.submarine.maxOxygen) * 100;
        document.getElementById('hud-oxygen-bar').style.width = `${oxygenPct}%`;

        // Oxygen recharging banner
        const o2RechargeBanner = document.getElementById('hud-oxygen-recharge');
        if (this.submarine.isRechargingOxygen) {
            o2RechargeBanner.classList.remove('hidden');
        } else {
            o2RechargeBanner.classList.add('hidden');
        }

        // Boost bar
        const boostPct = (this.submarine.boost / this.submarine.maxBoost) * 100;
        document.getElementById('hud-boost-bar').style.width = `${boostPct}%`;

        // Torpedo ammo
        document.getElementById('hud-torpedo-count').textContent = `🚀 × ${this.submarine.torpedoes}`;

        // Doubloons & Score
        document.getElementById('hud-coins').textContent = `🪙 ${this.doubloons}`;
        document.getElementById('hud-score').textContent = `SCORE: ${this.score}`;

        // Mission objective text
        const objectiveEl = document.getElementById('hud-objective');
        if (this.state === 'DIVING') {
            const shipName = this.selectedShip === 'titanic' ? 'TITANIC' : this.selectedShip === 'plane' ? 'B-17 WRECK' : 'PIRATE SHIP';
            objectiveEl.textContent = `MISSION: DIVE TO ${shipName} & RETRIEVE TREASURE`;
            objectiveEl.style.color = '#38bdf8';
        } else if (this.state === 'RETURNING') {
            objectiveEl.textContent = 'DANGER! EVADE THE MONSTER & REACH THE SURFACE!';
            objectiveEl.style.color = '#ef4444';

            // Update Monster Proximity meter
            const dist = Math.round(Math.hypot(this.monster.x - this.submarine.x, this.monster.y - this.submarine.y));
            const proxBar = document.getElementById('monster-proximity-bar');
            proxBar.textContent = `⚠ LEVIATHAN DISTANCE: ${dist}m ⚠`;
            proxBar.style.backgroundColor = dist < 160 ? 'rgba(239, 68, 68, 0.85)' : 'rgba(185, 28, 28, 0.6)';
        }
    }

    updateVictoryScreen() {
        // Deposit collected doubloons into persistent wallet
        this.progression.addDoubloons(this.doubloons);

        // Calculate XP and Progression rank points
        const xpResult = this.progression.calculateVictoryPoints({
            totalMath: this.mathAccuracy.total,
            solvedMath: this.mathAccuracy.solved,
            doubloons: this.doubloons,
            health: this.submarine.health,
            time: this.elapsedTime
        }, this.settings.settings.gradeLevel);

        document.getElementById('victory-time').textContent = `${this.elapsedTime}s`;
        document.getElementById('victory-coins').textContent = `+${this.doubloons} deposited`;
        document.getElementById('victory-score').textContent = `${this.score}`;
        const acc = this.mathAccuracy.total > 0 ? Math.round((this.mathAccuracy.solved / this.mathAccuracy.total) * 100) : 100;
        document.getElementById('victory-accuracy').textContent = `${acc}% (${this.mathAccuracy.solved}/${this.mathAccuracy.total})`;

        // Ship specific victory flavor
        const shipDescEl = document.getElementById('victory-ship-desc');
        if (this.hasTreasure) {
            if (this.selectedShip === 'titanic') {
                shipDescEl.textContent = 'YOU ESCAPED WITH THE TITANIC HEART OF THE OCEAN!';
            } else if (this.selectedShip === 'plane') {
                shipDescEl.textContent = 'YOU ESCAPED WITH THE TOP SECRET FLIGHT RECORDER!';
            } else {
                shipDescEl.textContent = 'YOU ESCAPED WITH THE PIRATE GOLD OF THE BLACK BARNACLE!';
            }
        } else {
            shipDescEl.textContent = 'SURFACED ALIVE, BUT THE CIPHER FAILED AND THE TREASURE WAS LOST!';
            shipDescEl.style.color = '#fdba74';
        }

        // XP Banner & Rank up
        const xpBox = document.getElementById('victory-xp-box');
        if (xpResult.rankUp) {
            xpBox.innerHTML = `🎉 RANK UP! NOW ${xpResult.newRank.icon} ${xpResult.newRank.name.toUpperCase()}!<br><small>+${xpResult.totalEarnedXp} EXPEDITION XP (${xpResult.multiplier}x Grade Mult!)</small>`;
        } else {
            xpBox.innerHTML = `⭐ +${xpResult.totalEarnedXp} EXPEDITION XP EARNED (${xpResult.multiplier}x Grade Mult!)<br><small>Next Rank: ${xpResult.newRank.neededXp} XP to ${xpResult.newRank.nextRank ? xpResult.newRank.nextRank.name : 'Max'}</small>`;
        }
    }

    render() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Screen shake offset
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(shakeX, shakeY);
        }

        // Apply Camera translation
        this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

        // 1. Draw Ocean Background & Depth zones
        this.world.drawBackground(this.ctx, this.camera.y, this.height);

        // 2. Draw Cavern Walls, Sea Mines, and Oxygen Vents
        this.world.drawCavernsAndHazards(this.ctx, this.sprites);

        // 3. Draw Marine Life
        this.world.marineLife.forEach(creature => {
            this.sprites.drawFish(this.ctx, creature);
        });

        // 4. Draw Collectibles
        this.world.collectibles.forEach(item => {
            if (!item.collected) {
                this.sprites.drawCollectible(this.ctx, item);
            }
        });

        // 5. Draw Selected Sunken Shipwreck (Pirate, Titanic, or Plane)
        this.sprites.drawShipwreck(
            this.ctx,
            this.world.shipwreck.x,
            this.world.shipwreck.y,
            this.world.shipwreck.looted ? 1 : 0,
            this.selectedShip
        );

        // 6. Draw Sea Monster (if active in Phase 3)
        if (this.monster.active) {
            this.sprites.drawMonster(this.ctx, this.monster);
        }

        // 7. Draw Submarine Player with active cosmetic skin and headlights
        if (this.state !== 'HOME' && this.state !== 'VICTORY') {
            this.sprites.drawSubmarine(this.ctx, this.submarine.x, this.submarine.y, {
                facing: this.submarine.facing,
                pitch: this.submarine.pitch,
                propellerAngle: this.submarine.propellerAngle,
                isBoosting: this.submarine.isBoosting,
                damaged: this.submarine.invulnerableTimer > 0,
                lightsOn: true,
                skin: this.progression.getActiveSkinData(),
                light: this.progression.getActiveLightData()
            });
        }

        // 8. Draw Sonar Wave
        this.world.drawSonar(this.ctx, this.submarine);

        // 9. Draw Bubbles and Sparkles
        this.world.drawParticles(this.ctx);

        // 10. Deep Ocean Darkness Vignette
        if (this.submarine.y > 1000) {
            this.drawDarknessVignette();
        }

        this.ctx.restore();
    }

    drawDarknessVignette() {
        const depthFactor = Math.min(1.0, (this.submarine.y - 1000) / 900);
        const subScreenX = this.submarine.x;
        const subScreenY = this.submarine.y;

        const darkGrad = this.ctx.createRadialGradient(
            subScreenX, subScreenY, 65,
            subScreenX, subScreenY, 340
        );
        darkGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        darkGrad.addColorStop(0.5, `rgba(0, 5, 15, ${depthFactor * 0.4})`);
        darkGrad.addColorStop(1, `rgba(0, 3, 10, ${depthFactor * 0.88})`);

        this.ctx.fillStyle = darkGrad;
        this.ctx.fillRect(
            this.camera.x,
            this.camera.y,
            this.width,
            this.height
        );
    }

    loop(currentTime) {
        const dt = Math.min(2.5, (currentTime - this.lastTime) / 16.67);
        this.lastTime = currentTime;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Instantiate game on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
