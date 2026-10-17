/**
 * Main 3D Game Coordinator & State Machine
 * Coordinates Three.js rendering pipeline, gameplay phases, HUD updates,
 * Drydock 3D turntable preview, touch controls, and audio state.
 */

import { MathEngine, MathGradeLevels } from './mathEngine.js';
import { ProgressionManager, SKINS, HEADLIGHT_COLORS, RANKS } from './progression.js';
import { AudioEngine } from './audio.js';
import { ModelFactory } from './models3d.js';
import { OceanWorld } from './oceanWorld.js';
import { SubmarineController } from './submarineController.js';
import { MonsterController } from './monster3d.js';
import { VaultManager } from './vault3d.js';

export const GameStates = {
    BASE_COMMAND: 'BASE_COMMAND',
    DIVING: 'DIVING',
    VAULT: 'VAULT',
    LEVIATHAN_ESCAPE: 'LEVIATHAN_ESCAPE',
    VICTORY: 'VICTORY',
    GAME_OVER: 'GAME_OVER'
};

export class Game {
    constructor() {
        this.state = GameStates.BASE_COMMAND;
        this.selectedShip = 'pirate'; // 'pirate', 'titanic', 'plane'

        // Core Systems
        this.mathEngine = new MathEngine('grade_3');
        this.progression = new ProgressionManager();
        this.audio = new AudioEngine();
        this.modelFactory = new ModelFactory();

        // Expedition stats tracking
        this.diveStats = {
            startTime: 0,
            endTime: 0,
            doubloonsCollected: 0,
            solvedMath: 0,
            totalMath: 0,
            maxDepthReached: 0,
            escapedLeviathan: false
        };

        // Three.js instances
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Controllers
        this.world = null;
        this.sub = null;
        this.monster = null;
        this.vault = null;

        // Animation timing
        this.clock = new THREE.Clock();
        this.screenTremor = 0;

        // Shop 3D Preview
        this.shopScene = null;
        this.shopCamera = null;
        this.shopRenderer = null;
        this.shopSubMesh = null;

        this.initThree();
        this.initGameSystems();
        this.initDOM();
        this.initTouchControls();
        this.updateHomeUI();

        // Start render loop
        requestAnimationFrame((t) => this.renderLoop(t));
    }

    // ==========================================
    // THREE.JS SETUP
    // ==========================================
    initThree() {
        const container = document.getElementById('canvas-container');
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Main Scene
        this.scene = new THREE.Scene();

        // Main Perspective Camera
        this.camera = new THREE.PerspectiveCamera(65, width / height, 0.5, 350);
        this.camera.position.set(0, 10, 30);

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    initGameSystems() {
        // Create 3D Ocean World
        this.world = new OceanWorld(this.scene, this.modelFactory, this.selectedShip);

        // Create Submarine Controller
        this.sub = new SubmarineController(this.scene, this.camera, this.modelFactory, this.progression, this.audio);

        // Create Leviathan Boss Controller
        this.monster = new MonsterController(this.scene, this.modelFactory, this.audio);

        // Create Vault & Math Cipher Manager
        this.vault = new VaultManager(this.mathEngine, this.audio, () => this.onVaultSuccess());
    }

    // ==========================================
    // DOM & UI INITIALIZATION
    // ==========================================
    initDOM() {
        // Home Navigation
        document.getElementById('btn-home-dive').addEventListener('click', () => this.startExpedition());
        document.getElementById('btn-home-shop').addEventListener('click', () => this.openShopModal());
        document.getElementById('btn-home-ranks').addEventListener('click', () => this.openRanksModal());
        document.getElementById('btn-home-settings').addEventListener('click', () => this.openSettingsModal());
        document.getElementById('btn-home-instructions').addEventListener('click', () => this.openHelpModal());

        // Shipwreck Target Selectors
        const shipBtns = {
            pirate: document.getElementById('ship-select-pirate'),
            titanic: document.getElementById('ship-select-titanic'),
            plane: document.getElementById('ship-select-plane')
        };

        const updateShipButtons = (selected) => {
            this.selectedShip = selected;
            Object.keys(shipBtns).forEach(k => {
                if (k === selected) shipBtns[k].classList.add('active');
                else shipBtns[k].classList.remove('active');
            });
            const label = document.getElementById('selected-ship-label');
            if (label) {
                label.textContent = selected === 'pirate' ? 'PIRATE GALLEON' : selected === 'titanic' ? 'R.M.S. TITANIC' : 'B-17 BOMBER';
            }
        };

        shipBtns.pirate.addEventListener('click', () => updateShipButtons('pirate'));
        shipBtns.titanic.addEventListener('click', () => updateShipButtons('titanic'));
        shipBtns.plane.addEventListener('click', () => updateShipButtons('plane'));

        // HUD Buttons
        document.getElementById('hud-home-btn').addEventListener('click', () => this.returnToBaseCommand());
        document.getElementById('hud-settings-btn').addEventListener('click', () => this.openSettingsModal());
        document.getElementById('hud-camera-btn').addEventListener('click', () => this.sub.toggleCameraMode());

        // Modals Close Buttons
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) modal.classList.add('hidden');
            });
        });

        // Settings Controls
        const gradeSelect = document.getElementById('settings-grade-select');
        if (gradeSelect) {
            gradeSelect.value = this.mathEngine.gradeLevel;
            gradeSelect.addEventListener('change', (e) => {
                this.mathEngine.setGradeLevel(e.target.value);
                this.updateHomeUI();
            });
        }

        const sfxSlider = document.getElementById('settings-sfx-slider');
        if (sfxSlider) {
            sfxSlider.addEventListener('input', (e) => {
                this.audio.setSfxVolume(parseFloat(e.target.value));
            });
        }

        const musicSlider = document.getElementById('settings-music-slider');
        if (musicSlider) {
            musicSlider.addEventListener('input', (e) => {
                this.audio.setMusicVolume(parseFloat(e.target.value));
            });
        }

        // Victory / Defeat Retry & Home buttons
        document.getElementById('btn-victory-home').addEventListener('click', () => this.returnToBaseCommand());
        document.getElementById('btn-victory-replay').addEventListener('click', () => this.startExpedition());
        document.getElementById('btn-gameover-home').addEventListener('click', () => this.returnToBaseCommand());
        document.getElementById('btn-gameover-retry').addEventListener('click', () => this.startExpedition());
    }

    // ==========================================
    // TOUCH / MOBILE CONTROLS
    // ==========================================
    initTouchControls() {
        const bindTouch = (elemId, onPress, onRelease) => {
            const el = document.getElementById(elemId);
            if (!el) return;
            const handleStart = (e) => { e.preventDefault(); onPress(); };
            const handleEnd = (e) => { e.preventDefault(); onRelease(); };
            el.addEventListener('touchstart', handleStart);
            el.addEventListener('touchend', handleEnd);
            el.addEventListener('mousedown', handleStart);
            el.addEventListener('mouseup', handleEnd);
        };

        bindTouch('touch-up', () => this.sub.input.forward = true, () => this.sub.input.forward = false);
        bindTouch('touch-down', () => this.sub.input.backward = true, () => this.sub.input.backward = false);
        bindTouch('touch-left', () => this.sub.input.turnLeft = true, () => this.sub.input.turnLeft = false);
        bindTouch('touch-right', () => this.sub.input.turnRight = true, () => this.sub.input.turnRight = false);

        bindTouch('touch-ascend', () => this.sub.input.ascend = true, () => this.sub.input.ascend = false);
        bindTouch('touch-descend', () => this.sub.input.descend = true, () => this.sub.input.descend = false);

        bindTouch('touch-boost', () => this.sub.input.boost = true, () => this.sub.input.boost = false);
        bindTouch('touch-sonar', () => this.sub.triggerSonarPing(), () => {});
        bindTouch('touch-fire', () => this.sub.fireTorpedo(), () => {});
    }

    // ==========================================
    // EXPEDITION LIFECYCLE
    // ==========================================
    startExpedition() {
        this.audio.init();

        // Close all modals
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        document.getElementById('home-screen').classList.add('hidden');
        document.getElementById('hud-overlay').classList.remove('hidden');

        // Rebuild ocean world with selected shipwreck
        if (this.world.shipType !== this.selectedShip) {
            // Remove old world assets
            this.scene.remove(this.world.shipwreckMesh);
            this.scene.remove(this.world.vaultData.root);
            this.world.buildTrench(this.selectedShip);
        }

        // Reset player sub at surface
        this.sub.reset(-30);
        this.sub.updateCosmetics();
        this.monster.hide();

        this.diveStats = {
            startTime: Date.now(),
            endTime: 0,
            doubloonsCollected: 0,
            solvedMath: 0,
            totalMath: 0,
            maxDepthReached: 0,
            escapedLeviathan: false
        };

        this.state = GameStates.DIVING;
        this.audio.playMusic('descent');

        const objEl = document.getElementById('hud-objective');
        if (objEl) {
            objEl.textContent = `MISSION: DIVE TO ${this.selectedShip.toUpperCase()} SHIPWRECK (2,100m)`;
            objEl.style.color = '#38bdf8';
        }
    }

    triggerVaultDocking() {
        this.state = GameStates.VAULT;
        this.sub.velocity.set(0, 0, 0); // halt sub

        // Position camera right in front of the 3D Vault
        const vaultPos = this.world.vaultData.root.position;
        this.camera.position.set(vaultPos.x, vaultPos.y + 4.5, vaultPos.z + 9.5);
        this.camera.lookAt(vaultPos.x, vaultPos.y + 2.0, vaultPos.z);

        this.vault.start(this.world.vaultData, this.selectedShip, 4);
    }

    onVaultSuccess() {
        // Vault unlocked! Trigger Phase 3: The Leviathan Escape!
        this.screenTremor = 2.5; // undersea earthquake
        this.diveStats.solvedMath = this.vault.solvedCount;
        this.diveStats.totalMath = this.vault.requiredProblems;

        const objEl = document.getElementById('hud-objective');
        if (objEl) {
            objEl.textContent = '⚠ EMERGENCY: ESCAPE THE AWAKENED LEVIATHAN! ASCEND TO SURFACE!';
            objEl.style.color = '#ef4444';
        }

        // Spawn Leviathan boss directly below
        this.monster.spawn(this.sub.position);
        this.state = GameStates.LEVIATHAN_ESCAPE;
        this.audio.playMusic('chase');
    }

    triggerVictory() {
        this.state = GameStates.VICTORY;
        this.diveStats.endTime = Date.now();
        this.diveStats.escapedLeviathan = true;
        this.audio.stopMusic();
        this.audio.playVictoryFanfare();
        this.monster.hide();

        const durationSeconds = Math.round((this.diveStats.endTime - this.diveStats.startTime) / 1000);

        // Calculate XP and rank progression
        const victoryResults = this.progression.calculateVictoryPoints({
            solvedMath: this.diveStats.solvedMath || 4,
            totalMath: this.diveStats.totalMath || 4,
            doubloons: this.progression.doubloons,
            health: this.sub.health,
            time: durationSeconds
        }, this.mathEngine.gradeLevel);

        // Update Victory Modal UI
        document.getElementById('victory-xp-total').textContent = `+${victoryResults.totalEarnedXp} EXPEDITION XP`;
        document.getElementById('victory-time').textContent = `${durationSeconds}s`;
        document.getElementById('victory-doubloons').textContent = `${this.progression.doubloons}`;
        document.getElementById('victory-health').textContent = `${Math.round(this.sub.health)}%`;
        document.getElementById('victory-rank-badge').textContent = `${victoryResults.newRank.icon} ${victoryResults.newRank.name}`;

        if (victoryResults.rankUp) {
            document.getElementById('victory-rankup-alert').classList.remove('hidden');
        } else {
            document.getElementById('victory-rankup-alert').classList.add('hidden');
        }

        document.getElementById('victory-modal').classList.remove('hidden');
        this.updateHomeUI();
    }

    triggerGameOver(reason = 'Hull Crushed by Oceanic Pressure') {
        this.state = GameStates.GAME_OVER;
        this.audio.stopMusic();
        this.audio.playExplosion(1.5);
        this.monster.hide();

        document.getElementById('gameover-reason').textContent = reason;
        document.getElementById('gameover-modal').classList.remove('hidden');
    }

    returnToBaseCommand() {
        this.state = GameStates.BASE_COMMAND;
        this.audio.stopMusic();
        this.monster.hide();

        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        document.getElementById('hud-overlay').classList.add('hidden');
        document.getElementById('home-screen').classList.remove('hidden');

        // Camera gentle drift at surface in Base Command
        this.camera.position.set(0, 15, 35);
        this.camera.lookAt(0, -10, 0);

        this.updateHomeUI();
    }

    // ==========================================
    // UI REFRESH & SHOP TURNTABLE PREVIEW
    // ==========================================
    updateHomeUI() {
        const rank = this.progression.getCurrentRank();
        document.getElementById('home-rank-badge').innerHTML = `<span>${rank.icon}</span> <b>RANK: ${rank.name.toUpperCase()}</b>`;
        document.getElementById('home-wallet-badge').innerHTML = `<span>🪙</span> <b>${this.progression.doubloons} DOUBLOONS</b>`;

        const gradeData = MathGradeLevels[this.mathEngine.gradeLevel.toUpperCase()] || MathGradeLevels.GRADE_3;
        document.getElementById('home-grade-badge').innerHTML = `${gradeData.icon} <b>${gradeData.name.toUpperCase()}</b>: ${gradeData.description}`;
    }

    openShopModal() {
        const modal = document.getElementById('shop-modal');
        modal.classList.remove('hidden');

        document.getElementById('shop-wallet-count').textContent = `${this.progression.doubloons} DOUBLOONS`;

        this.renderShopItems();
        this.initShop3DPreview();
    }

    renderShopItems() {
        const skinsContainer = document.getElementById('shop-skins-list');
        skinsContainer.innerHTML = '';

        Object.values(SKINS).forEach(skin => {
            const card = document.createElement('div');
            card.className = 'shop-card ' + (this.progression.activeSkin === skin.id ? 'active' : '');

            const isOwned = this.progression.unlockedSkins.includes(skin.id);
            const isEquipped = this.progression.activeSkin === skin.id;

            card.innerHTML = `
                <div class="shop-card-header">
                    <b>${skin.name}</b>
                    <span class="shop-card-cost">${isOwned ? 'OWNED' : `🪙 ${skin.cost}`}</span>
                </div>
                <p class="shop-card-desc">${skin.desc}</p>
                <button class="pixel-btn ${isEquipped ? 'btn-active' : isOwned ? 'btn-equip' : 'btn-buy'}">
                    ${isEquipped ? 'EQUIPPED' : isOwned ? 'EQUIP' : 'BUY SKIN'}
                </button>
            `;

            const btn = card.querySelector('button');
            btn.addEventListener('click', () => {
                if (isEquipped) return;
                if (isOwned) {
                    this.progression.equipSkin(skin.id);
                } else {
                    if (this.progression.buySkin(skin.id)) {
                        this.audio.playCoinPickup();
                    } else {
                        alert('Not enough Doubloons! Salvage sunken ships to earn more.');
                        return;
                    }
                }
                this.updateShop3DModel();
                this.renderShopItems();
                this.sub.updateCosmetics();
                this.updateHomeUI();
            });

            skinsContainer.appendChild(card);
        });

        const lightsContainer = document.getElementById('shop-lights-list');
        lightsContainer.innerHTML = '';

        Object.values(HEADLIGHT_COLORS).forEach(light => {
            const card = document.createElement('div');
            card.className = 'shop-card ' + (this.progression.activeLight === light.id ? 'active' : '');

            const isOwned = this.progression.unlockedLights.includes(light.id);
            const isEquipped = this.progression.activeLight === light.id;

            card.innerHTML = `
                <div class="shop-card-header">
                    <b>${light.name}</b>
                    <span class="shop-card-cost">${isOwned ? 'OWNED' : `🪙 ${light.cost}`}</span>
                </div>
                <p class="shop-card-desc">${light.desc}</p>
                <button class="pixel-btn ${isEquipped ? 'btn-active' : isOwned ? 'btn-equip' : 'btn-buy'}">
                    ${isEquipped ? 'EQUIPPED' : isOwned ? 'EQUIP' : 'BUY LIGHT'}
                </button>
            `;

            const btn = card.querySelector('button');
            btn.addEventListener('click', () => {
                if (isEquipped) return;
                if (isOwned) {
                    this.progression.equipLight(light.id);
                } else {
                    if (this.progression.buyLight(light.id)) {
                        this.audio.playCoinPickup();
                    } else {
                        alert('Not enough Doubloons!');
                        return;
                    }
                }
                this.updateShop3DModel();
                this.renderShopItems();
                this.sub.updateCosmetics();
            });

            lightsContainer.appendChild(card);
        });
    }

    initShop3DPreview() {
        const previewEl = document.getElementById('shop-3d-canvas-container');
        if (!previewEl || this.shopRenderer) return;

        const w = previewEl.clientWidth || 380;
        const h = previewEl.clientHeight || 280;

        this.shopScene = new THREE.Scene();
        this.shopCamera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        this.shopCamera.position.set(10, 4, 12);
        this.shopCamera.lookAt(0, 0, 0);

        this.shopRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.shopRenderer.setSize(w, h);
        this.shopRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        previewEl.appendChild(this.shopRenderer.domElement);

        // Lighting for turntable
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
        keyLight.position.set(10, 15, 10);
        this.shopScene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
        fillLight.position.set(-10, -5, -10);
        this.shopScene.add(fillLight);

        const amb = new THREE.AmbientLight(0xffffff, 0.6);
        this.shopScene.add(amb);

        if (window.THREE && window.THREE.OrbitControls) {
            this.shopControls = new THREE.OrbitControls(this.shopCamera, this.shopRenderer.domElement);
            this.shopControls.enableDamping = true;
            this.shopControls.dampingFactor = 0.05;
            this.shopControls.minDistance = 6;
            this.shopControls.maxDistance = 25;
        }

        this.updateShop3DModel();
    }

    updateShop3DModel() {
        if (!this.shopScene) return;
        if (this.shopSubMesh) this.shopScene.remove(this.shopSubMesh.root);

        const skin = this.progression.getActiveSkinData();
        const light = this.progression.getActiveLightData();

        this.shopSubMesh = this.modelFactory.createSubmarine(skin, light);
        this.shopScene.add(this.shopSubMesh.root);
    }

    openRanksModal() {
        const modal = document.getElementById('ranks-modal');
        modal.classList.remove('hidden');

        const curRank = this.progression.getCurrentRank();
        document.getElementById('ranks-current-name').textContent = `${curRank.icon} ${curRank.name.toUpperCase()}`;
        document.getElementById('ranks-current-xp').textContent = `${this.progression.xp} TOTAL XP`;
        document.getElementById('ranks-progress-bar').style.width = `${curRank.progressPct}%`;
        document.getElementById('ranks-progress-text').textContent = curRank.nextRank ?
            `${curRank.progressPct}% TO ${curRank.nextRank.name.toUpperCase()} (${curRank.neededXp} XP NEEDED)` :
            'MAX RANK REACHED!';

        const listEl = document.getElementById('ranks-list');
        listEl.innerHTML = '';
        RANKS.forEach(r => {
            const item = document.createElement('div');
            item.className = 'rank-tier-item ' + (r.level <= curRank.level ? 'achieved' : '');
            item.innerHTML = `
                <div class="rank-item-icon">${r.icon}</div>
                <div class="rank-item-info">
                    <b>LEVEL ${r.level}: ${r.name}</b>
                    <small>${r.minXp} MIN XP</small>
                </div>
                <div class="rank-item-status">${r.level <= curRank.level ? '✔ UNLOCKED' : '🔒 LOCKED'}</div>
            `;
            listEl.appendChild(item);
        });
    }

    openSettingsModal() {
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    openHelpModal() {
        document.getElementById('instructions-modal').classList.remove('hidden');
    }

    // ==========================================
    // MAIN GAME LOOP & RENDER
    // ==========================================
    renderLoop() {
        requestAnimationFrame(() => this.renderLoop());

        const dt = Math.min(this.clock.getDelta(), 0.1);

        // State Machine Update
        if (this.state === GameStates.DIVING || this.state === GameStates.LEVIATHAN_ESCAPE) {
            this.sub.update(dt, this.world);
            this.world.update(dt, this.sub.position);

            if (this.state === GameStates.LEVIATHAN_ESCAPE) {
                this.monster.update(dt, this.sub, this.world);
            }

            // Check Seafloor Shipwreck Docking (~2100m)
            const depth = Math.abs(this.sub.position.y);
            this.diveStats.maxDepthReached = Math.max(this.diveStats.maxDepthReached, depth);

            if (this.state === GameStates.DIVING && depth >= 2100) {
                const distToWreck = this.sub.position.distanceTo(this.world.shipwreckMesh.position);
                if (distToWreck < 30) {
                    this.triggerVaultDocking();
                }
            }

            // Check Surface Breach Victory (< 60m during escape)
            if (this.state === GameStates.LEVIATHAN_ESCAPE && depth <= 60) {
                this.triggerVictory();
            }

            // Check Sub Destruction
            if (this.sub.health <= 0) {
                this.triggerGameOver('Submarine Hull Compromised. Pressure Breach.');
            }

            // Update In-Game HUD
            this.updateHUD(depth);

        } else if (this.state === GameStates.BASE_COMMAND) {
            // Gentle camera float in home screen
            this.camera.position.x = Math.sin(Date.now() * 0.0006) * 15;
            this.camera.position.z = 35 + Math.cos(Date.now() * 0.0006) * 8;
            this.camera.lookAt(0, -10, 0);
        }

        // Screen Tremor effect (during vault earthquake or explosion)
        if (this.screenTremor > 0) {
            this.camera.position.x += (Math.random() - 0.5) * this.screenTremor;
            this.camera.position.y += (Math.random() - 0.5) * this.screenTremor;
            this.screenTremor = Math.max(0, this.screenTremor - dt * 2.0);
        }

        // Render Main Three.js Scene
        this.renderer.render(this.scene, this.camera);

        // Render Shop 3D Preview Turntable if active
        if (this.shopRenderer && this.shopSubMesh && !document.getElementById('shop-modal').classList.contains('hidden')) {
            if (this.shopControls) {
                this.shopControls.update();
            }
            this.shopSubMesh.root.rotation.y += 0.6 * dt;
            this.shopRenderer.render(this.shopScene, this.shopCamera);
        }
    }

    updateHUD(depth) {
        document.getElementById('hud-depth').textContent = `${Math.round(depth)}m`;
        document.getElementById('hud-health-bar').style.width = `${Math.max(0, this.sub.health)}%`;
        document.getElementById('hud-oxygen-bar').style.width = `${Math.max(0, this.sub.oxygen)}%`;
        document.getElementById('hud-boost-bar').style.width = `${Math.max(0, this.sub.boost)}%`;
        document.getElementById('hud-coins').textContent = `🪙 ${this.progression.doubloons}`;
        document.getElementById('hud-torpedo-count').textContent = `🚀 × ${this.sub.torpedoes}`;
        document.getElementById('hud-score').textContent = `XP: ${this.progression.xp}`;
    }
}

// Auto-boot on load
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
});
