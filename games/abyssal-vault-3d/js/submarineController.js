/**
 * 3D Submarine Controller & Physics Engine
 * Controls 6-DOF fluid dynamics, throttle, hydrofoil/rudder articulation,
 * dual camera perspectives (3rd person chase & 1st person cockpit),
 * active sonar ping wave, sonic torpedo ballistics, and life support systems.
 */

export class SubmarineController {
    constructor(scene, camera, modelFactory, progression, audio) {
        this.scene = scene;
        this.camera = camera;
        this.modelFactory = modelFactory;
        this.progression = progression;
        this.audio = audio;

        // Position & Movement Physics
        this.position = new THREE.Vector3(0, -30, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);

        this.yaw = 0;          // Heading (rotation around Y)
        this.pitch = 0;        // Vertical tilt (rotation around Z)
        this.roll = 0;         // Banking (rotation around X)

        this.maxSpeed = 24.0;
        this.boostMultiplier = 1.85;
        this.accel = 18.0;
        this.friction = 0.92;
        this.turnSpeed = 1.4;

        // Stats & Vitals
        this.maxHealth = 100;
        this.health = 100;
        this.maxOxygen = 100;
        this.oxygen = 100;
        this.maxBoost = 100;
        this.boost = 100;
        this.isBoosting = false;

        this.torpedoes = 3;
        this.maxTorpedoes = 5;
        this.invulnerableTimer = 0;

        // Active Sonar Pulse
        this.sonarActive = false;
        this.sonarTimer = 0;
        this.sonarRadius = 0;

        // Torpedo projectilies in flight
        this.activeTorpedoes = [];

        // Camera mode: 'chase' (3rd Person) or 'cockpit' (1st Person)
        this.cameraMode = 'chase';
        this.cameraOffset = new THREE.Vector3(-18, 5.5, 0);
        this.cockpitOffset = new THREE.Vector3(3.6, 0.2, 0);

        // Input state
        this.input = {
            forward: false,
            backward: false,
            turnLeft: false,
            turnRight: false,
            ascend: false,
            descend: false,
            boost: false
        };

        this.initModel();
        this.setupKeyboardInput();
    }

    initModel() {
        const skinData = this.progression.getActiveSkinData();
        const lightData = this.progression.getActiveLightData();

        this.subData = this.modelFactory.createSubmarine(skinData, lightData);
        this.mesh = this.subData.root;
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        // Sonar Wave Light
        this.sonarLight = new THREE.PointLight(0x38bdf8, 0, 180);
        this.mesh.add(this.sonarLight);
    }

    updateCosmetics() {
        const skinData = this.progression.getActiveSkinData();
        const lightData = this.progression.getActiveLightData();
        this.subData.updateCosmetics(skinData, lightData);
    }

    reset(startDepth = -30) {
        this.position.set(0, startDepth, 0);
        this.velocity.set(0, 0, 0);
        this.yaw = 0;
        this.pitch = 0;
        this.roll = 0;
        this.health = 100;
        this.oxygen = 100;
        this.boost = 100;
        this.torpedoes = 3;
        this.invulnerableTimer = 0;
        this.sonarActive = false;

        this.mesh.position.copy(this.position);
        this.mesh.rotation.set(0, 0, 0);

        // Clear active torpedoes
        this.activeTorpedoes.forEach(t => this.scene.remove(t.mesh));
        this.activeTorpedoes = [];
    }

    setupKeyboardInput() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') this.input.forward = true;
            if (key === 's' || key === 'arrowdown') this.input.backward = true;
            if (key === 'a' || key === 'arrowleft') this.input.turnLeft = true;
            if (key === 'd' || key === 'arrowright') this.input.turnRight = true;
            if (key === 'q' || key === 'r') this.input.ascend = true;
            if (key === 'e' || key === 'v') this.input.descend = true;
            if (e.key === 'Shift') this.input.boost = true;

            // Hotkeys
            if (e.code === 'Space') {
                e.preventDefault();
                this.triggerSonarPing();
            }
            if (key === 'f' || key === 'enter') {
                this.fireTorpedo();
            }
            if (key === 'c') {
                this.toggleCameraMode();
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') this.input.forward = false;
            if (key === 's' || key === 'arrowdown') this.input.backward = false;
            if (key === 'a' || key === 'arrowleft') this.input.turnLeft = false;
            if (key === 'd' || key === 'arrowright') this.input.turnRight = false;
            if (key === 'q' || key === 'r') this.input.ascend = false;
            if (key === 'e' || key === 'v') this.input.descend = false;
            if (e.key === 'Shift') this.input.boost = false;
        });
    }

    toggleCameraMode() {
        this.cameraMode = this.cameraMode === 'chase' ? 'cockpit' : 'chase';
        const camBtn = document.getElementById('hud-camera-btn');
        if (camBtn) {
            camBtn.textContent = this.cameraMode === 'chase' ? '🎥 3RD' : '👁️ 1ST';
        }
    }

    triggerSonarPing() {
        if (this.sonarActive) return;
        this.sonarActive = true;
        this.sonarRadius = 1;
        this.subData.sonarWave.visible = true;
        this.audio.playSonarPing();
    }

    fireTorpedo() {
        if (this.torpedoes <= 0) return;
        this.torpedoes--;
        this.audio.playTorpedoLaunch();

        // Spawn 3D torpedo model
        const torpRoot = new THREE.Group();
        const bodyGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.8, 12);
        bodyGeo.rotateZ(Math.PI / 2);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            metalness: 0.8,
            roughness: 0.2
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        torpRoot.add(body);

        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 12), bodyMat);
        nose.geometry.rotateZ(-Math.PI / 2);
        nose.position.x = 1.1;
        torpRoot.add(nose);

        // Position at bow
        const forwardDir = new THREE.Vector3(1, 0, 0).applyEuler(this.mesh.rotation);
        torpRoot.position.copy(this.mesh.position).add(forwardDir.clone().multiplyScalar(4.5));
        torpRoot.rotation.copy(this.mesh.rotation);

        this.scene.add(torpRoot);
        this.activeTorpedoes.push({
            mesh: torpRoot,
            direction: forwardDir,
            speed: 55.0,
            life: 3.5 // seconds
        });
    }

    takeDamage(amount) {
        if (this.invulnerableTimer > 0) return;
        this.health = Math.max(0, this.health - amount);
        this.invulnerableTimer = 1.8; // 1.8s invulnerability blink
        this.audio.playExplosion(0.85);

        // Screen flash red
        const flashEl = document.getElementById('damage-flash');
        if (flashEl) {
            flashEl.classList.remove('active');
            void flashEl.offsetWidth; // re-trigger animation
            flashEl.classList.add('active');
        }
    }

    update(dt, world) {
        // Invulnerability Blink
        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer -= dt;
            this.mesh.visible = Math.floor(Date.now() / 80) % 2 === 0;
        } else {
            this.mesh.visible = true;
        }

        // Boost management
        if (this.input.boost && this.boost > 5) {
            this.isBoosting = true;
            this.boost = Math.max(0, this.boost - 14 * dt);
        } else {
            this.isBoosting = false;
            this.boost = Math.min(this.maxBoost, this.boost + 6.5 * dt);
        }

        const effectiveMaxSpeed = this.isBoosting ? this.maxSpeed * this.boostMultiplier : this.maxSpeed;
        const currentAccel = (this.isBoosting ? this.accel * 1.6 : this.accel) * dt;

        // Heading & Steering (Yaw)
        let turnInput = 0;
        if (this.input.turnLeft) turnInput += 1;
        if (this.input.turnRight) turnInput -= 1;
        this.yaw += turnInput * this.turnSpeed * dt;

        // Target forward vector in horizontal plane
        const forwardVector = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
        const rightVector = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));

        // Throttle (Forward / Backward)
        if (this.input.forward) {
            this.velocity.add(forwardVector.clone().multiplyScalar(currentAccel));
        }
        if (this.input.backward) {
            this.velocity.add(forwardVector.clone().multiplyScalar(-currentAccel * 0.6));
        }

        // Ballast Depth controls (Ascend / Descend)
        let verticalInput = 0;
        if (this.input.ascend) verticalInput += 1;
        if (this.input.descend) verticalInput -= 1;
        this.velocity.y += verticalInput * currentAccel * 1.1;

        // Hydrodynamic Pitch tilt (angles with vertical movement)
        const targetPitch = (this.velocity.y / this.maxSpeed) * 0.45;
        this.pitch += (targetPitch - this.pitch) * 0.12;

        // Roll banking when turning
        const targetRoll = -turnInput * 0.35;
        this.roll += (targetRoll - this.roll) * 0.15;

        // Fluid Drag
        this.velocity.multiplyScalar(Math.pow(this.friction, dt * 60));

        // Cap speed
        const speed = this.velocity.length();
        if (speed > effectiveMaxSpeed) {
            this.velocity.multiplyScalar(effectiveMaxSpeed / speed);
        }

        // Integrate Position
        this.position.add(this.velocity.clone().multiplyScalar(dt));

        // Depth Clamping
        // Surface at Y = -2 (cannot fly above water)
        if (this.position.y > -2) {
            this.position.y = -2;
            this.velocity.y = Math.min(0, this.velocity.y);
            // Surface aeration refuels oxygen
            this.oxygen = Math.min(this.maxOxygen, this.oxygen + 35 * dt);
        }
        // Seafloor at Y = -2240
        if (this.position.y < -2240) {
            this.position.y = -2240;
            this.velocity.y = Math.max(0, this.velocity.y);
        }

        // Trench boundary clamp (cannot go beyond canyon walls)
        const distFromCenter = Math.hypot(this.position.x, this.position.z);
        if (distFromCenter > 95) {
            const angle = Math.atan2(this.position.z, this.position.x);
            this.position.x = Math.cos(angle) * 95;
            this.position.z = Math.sin(angle) * 95;
            this.velocity.x *= 0.5;
            this.velocity.z *= 0.5;
        }

        // Update Submarine Mesh Transform
        this.mesh.position.copy(this.position);
        this.mesh.rotation.set(this.roll, this.yaw, this.pitch, 'YXZ');

        // Dynamic Visual Articulations
        // Propeller spin
        const throttleRatio = speed / this.maxSpeed;
        this.subData.propGroup.rotation.x += (throttleRatio * 35 + 2) * dt;

        // Bow hydrofoils pitch
        this.subData.bowFinGroup.rotation.z = -this.pitch * 1.8;

        // Stern rudder turns
        this.subData.rudderGroup.rotation.y = turnInput * 0.45;

        // Cavitation bubble emission from propeller
        if (speed > 2.0 && Math.random() < (this.isBoosting ? 0.95 : 0.45)) {
            const propPos = new THREE.Vector3(-5.8, 0, 0).applyEuler(this.mesh.rotation).add(this.position);
            world.spawnBubbles(propPos, this.isBoosting ? 4 : 1, 0.8, 0.4);
        }

        // Audio engine update
        this.audio.updateEngineSound(throttleRatio, this.isBoosting);

        // Active Sonar Pulse Wave expansion
        if (this.sonarActive) {
            this.sonarRadius += 75 * dt;
            this.subData.sonarWave.scale.setScalar(this.sonarRadius);
            this.subData.sonarWave.material.opacity = Math.max(0, 1 - this.sonarRadius / 110);
            this.sonarLight.intensity = Math.max(0, 4.0 * (1 - this.sonarRadius / 110));

            if (this.sonarRadius >= 110) {
                this.sonarActive = false;
                this.subData.sonarWave.visible = false;
                this.sonarLight.intensity = 0;
            }
        }

        // Active Torpedoes Update
        for (let i = this.activeTorpedoes.length - 1; i >= 0; i--) {
            const t = this.activeTorpedoes[i];
            t.mesh.position.add(t.direction.clone().multiplyScalar(t.speed * dt));
            t.life -= dt;

            // Spawn bubble trail behind torpedo
            if (Math.random() < 0.6) {
                world.spawnBubbles(t.mesh.position, 1, 0.5, 0.2);
            }

            // Check collision with Naval Mines
            world.hazards.forEach(mine => {
                if (!mine.detonated && t.mesh.position.distanceTo(mine.mesh.position) < 5.5) {
                    mine.detonated = true;
                    this.scene.remove(mine.mesh);
                    world.spawnExplosion(mine.mesh.position);
                    this.audio.playExplosion(1.2);
                    t.life = 0; // destroy torpedo
                }
            });

            if (t.life <= 0) {
                this.scene.remove(t.mesh);
                this.activeTorpedoes.splice(i, 1);
            }
        }

        // Oxygen Depletion (normal rate: ~0.8%/sec)
        this.oxygen = Math.max(0, this.oxygen - 0.75 * dt);

        // Hydrothermal Oxygen Vent Refill
        let isRechargingO2 = false;
        world.vents.forEach(v => {
            const dist = Math.hypot(this.position.x - v.x, this.position.y - v.y, this.position.z - v.z);
            if (dist < v.radius) {
                isRechargingO2 = true;
                this.oxygen = Math.min(this.maxOxygen, this.oxygen + 50 * dt);
                if (Math.random() < 0.25) this.audio.playVentRecharge();
            }
        });

        // Surface aeration (< 90m)
        if (Math.abs(this.position.y) < 90) {
            isRechargingO2 = true;
        }

        const o2Alert = document.getElementById('hud-oxygen-recharge');
        if (o2Alert) {
            if (isRechargingO2) o2Alert.classList.remove('hidden');
            else o2Alert.classList.add('hidden');
        }

        // Suffocation damage if oxygen empty
        if (this.oxygen <= 0) {
            this.takeDamage(6 * dt);
        }

        // Collectibles Gathering Check
        world.collectibles.forEach(col => {
            if (!col.collected) {
                const dist = this.position.distanceTo(col.mesh.position);
                if (dist < col.radius) {
                    col.collected = true;
                    this.scene.remove(col.mesh);
                    if (col.type === 'doubloon') {
                        this.progression.addDoubloons(1);
                        this.audio.playCoinPickup();
                    } else if (col.type === 'oxygen') {
                        this.oxygen = Math.min(this.maxOxygen, this.oxygen + 40);
                        this.audio.playVentRecharge();
                    }
                }
            }
        });

        // Naval Mine Hazards Collision Check
        world.hazards.forEach(mine => {
            if (!mine.detonated) {
                const dist = this.position.distanceTo(mine.mesh.position);
                // Proximity warning beeps
                if (dist < 22 && Math.random() < 0.08) {
                    this.audio.playProximityBeep(dist < 10 ? 1100 : 750);
                }
                // Detonation on impact
                if (dist < mine.radius + 2.0) {
                    mine.detonated = true;
                    this.scene.remove(mine.mesh);
                    world.spawnExplosion(mine.mesh.position);
                    this.takeDamage(35);
                }
            }
        });

        // Update Camera Follow
        this.updateCamera(dt);
    }

    updateCamera(dt) {
        if (this.cameraMode === 'chase') {
            // Smooth Spring-Arm Chase Camera
            // Follow behind submarine in the direction opposite to heading
            const backwardsDir = new THREE.Vector3(-Math.cos(this.yaw), 0, Math.sin(this.yaw));
            const targetCamPos = this.position.clone()
                .add(backwardsDir.multiplyScalar(22))
                .add(new THREE.Vector3(0, 6.5, 0));

            // Smooth interpolation
            this.camera.position.lerp(targetCamPos, 0.12);

            // Look at slightly ahead of the submarine
            const lookTarget = this.position.clone().add(
                new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).multiplyScalar(10)
            );
            this.camera.lookAt(lookTarget);

        } else {
            // 1st Person Cockpit / Periscope View
            const cockpitWorldPos = this.cockpitOffset.clone().applyEuler(this.mesh.rotation).add(this.position);
            this.camera.position.copy(cockpitWorldPos);

            const lookTarget = cockpitWorldPos.clone().add(
                new THREE.Vector3(1, 0, 0).applyEuler(this.mesh.rotation).multiplyScalar(25)
            );
            this.camera.lookAt(lookTarget);
        }
    }
}
