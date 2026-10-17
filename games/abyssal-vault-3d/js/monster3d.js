/**
 * 3D Abyssal Leviathan Controller & AI Engine
 * 14-vertebrae articulated serpentine spline kinematics, snapping jaw animation,
 * predatory stalking & charge attack state machine, and sonic torpedo stun vulnerability.
 */

export class MonsterController {
    constructor(scene, modelFactory, audio) {
        this.scene = scene;
        this.modelFactory = modelFactory;
        this.audio = audio;

        this.active = false;
        this.position = new THREE.Vector3(0, -2200, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);

        this.speed = 18.0;
        this.chargeSpeed = 44.0;
        this.yaw = 0;
        this.pitch = 0;

        // States: 'stalking', 'warning', 'charging', 'stunned'
        this.state = 'stalking';
        this.stateTimer = 0;
        this.warningDuration = 2.4;
        this.chargeDuration = 3.2;
        this.stunDuration = 4.5;

        this.chargeTargetPos = new THREE.Vector3();
        this.swimCycle = 0;
        this.jawCycle = 0;

        this.initModel();
    }

    initModel() {
        this.monsterData = this.modelFactory.createLeviathan();
        this.mesh = this.monsterData.root;
        this.mesh.visible = false;
        this.scene.add(this.mesh);
    }

    spawn(initialPos) {
        this.active = true;
        this.mesh.visible = true;
        this.mesh.position.set(0, 0, 0);
        this.position.copy(initialPos);
        this.position.y -= 45; // spawn 45m directly below player in trench
        this.monsterData.headGroup.position.copy(this.position);

        // Initialize all 14 segments directly behind/below
        this.monsterData.segments.forEach((seg, i) => {
            seg.group.position.set(this.position.x, this.position.y - (i + 1) * 3.5, this.position.z);
        });

        this.state = 'stalking';
        this.stateTimer = 0;
        this.monsterData.setRageMode(false);
        this.audio.playLeviathanRoar();
    }

    stun() {
        this.state = 'stunned';
        this.stateTimer = 0;
        this.monsterData.setRageMode(false);
        this.velocity.set(0, -5, 0); // recoils backward
    }

    update(dt, subController, world) {
        if (!this.active) return;

        this.stateTimer += dt;
        this.swimCycle += 5.0 * dt;
        this.jawCycle += 3.5 * dt;

        const subPos = subController.position;
        const distToSub = this.position.distanceTo(subPos);

        // Update HUD Proximity Indicator
        const proxBar = document.getElementById('monster-proximity-bar');
        if (proxBar) {
            proxBar.classList.remove('hidden');
            const roundedDist = Math.max(5, Math.round(distToSub));
            proxBar.textContent = `⚠ LEVIATHAN PROXIMITY: ${roundedDist}m ⚠`;
            if (this.state === 'warning' || this.state === 'charging') {
                proxBar.style.color = '#ef4444';
                proxBar.style.borderColor = '#ef4444';
                proxBar.textContent = `⚠ LEVIATHAN CHARGING! ${roundedDist}m ⚠`;
            } else if (this.state === 'stunned') {
                proxBar.style.color = '#38bdf8';
                proxBar.style.borderColor = '#38bdf8';
                proxBar.textContent = `⚡ LEVIATHAN STUNNED! (${Math.ceil(this.stunDuration - this.stateTimer)}s) ⚡`;
            } else {
                proxBar.style.color = '#f59e0b';
                proxBar.style.borderColor = '#f59e0b';
            }
        }

        // ==========================================
        // STATE MACHINE
        // ==========================================
        if (this.state === 'stalking') {
            this.monsterData.setRageMode(false);

            // Stalk sub steadily upward, maintaining ~35m distance below
            const targetPos = subPos.clone().add(new THREE.Vector3(0, -32, 0));
            const toTarget = targetPos.clone().sub(this.position);
            const dist = toTarget.length();

            if (dist > 2.0) {
                toTarget.normalize();
                this.velocity.lerp(toTarget.multiplyScalar(this.speed), 0.08);
            }

            // Snapping jaw breathing cycle
            this.monsterData.lowerJawGroup.rotation.x = 0.2 + Math.sin(this.jawCycle) * 0.15;

            // Trigger charge every 7-10 seconds
            if (this.stateTimer > 8.0) {
                this.state = 'warning';
                this.stateTimer = 0;
                this.audio.playLeviathanRoar();
                this.monsterData.setRageMode(true);
            }

        } else if (this.state === 'warning') {
            // Telegraphed lunge warning
            this.monsterData.setRageMode(true);
            this.velocity.multiplyScalar(0.85); // pause & coil

            // Lock on to player's current position
            this.chargeTargetPos.copy(subPos);

            // Jaws wide open
            this.monsterData.lowerJawGroup.rotation.x = 0.75 + Math.random() * 0.15;
            this.monsterData.upperJawGroup.rotation.x = -0.35;

            if (this.stateTimer >= this.warningDuration) {
                this.state = 'charging';
                this.stateTimer = 0;
            }

        } else if (this.state === 'charging') {
            // High-speed lunge
            this.monsterData.setRageMode(true);
            const toTarget = subPos.clone().sub(this.position).normalize();
            this.velocity.copy(toTarget.multiplyScalar(this.chargeSpeed));

            // Wide open snapping jaws
            this.monsterData.lowerJawGroup.rotation.x = 0.7 + Math.sin(this.jawCycle * 2) * 0.25;

            // Bite collision check
            if (distToSub < 9.5) {
                // Leviathan snaps jaws shut and damages sub
                this.monsterData.lowerJawGroup.rotation.x = 0.05;
                subController.takeDamage(40);
                world.spawnBubbles(this.position, 25, 2.0, 3.0);
                this.state = 'stalking';
                this.stateTimer = 0;
                this.monsterData.setRageMode(false);
            }

            if (this.stateTimer >= this.chargeDuration) {
                this.state = 'stalking';
                this.stateTimer = 0;
                this.monsterData.setRageMode(false);
            }

        } else if (this.state === 'stunned') {
            // Stunned by torpedo
            this.monsterData.setRageMode(false);
            this.velocity.multiplyScalar(0.92);

            // Shiver / shudder head
            this.monsterData.headGroup.rotation.z = Math.sin(Date.now() * 0.05) * 0.15;

            if (this.stateTimer >= this.stunDuration) {
                this.state = 'stalking';
                this.stateTimer = 0;
            }
        }

        // Integrate Head Position
        this.position.add(this.velocity.clone().multiplyScalar(dt));
        this.monsterData.headGroup.position.copy(this.position);

        // Orient head towards velocity direction
        if (this.velocity.lengthSq() > 0.1) {
            const lookTarget = this.position.clone().add(this.velocity);
            this.monsterData.headGroup.lookAt(lookTarget);
        }

        // ==========================================
        // 14-SEGMENT SERPENTINE SWIMMING KINEMATICS
        // ==========================================
        let prevPos = this.position.clone();

        this.monsterData.segments.forEach((seg, i) => {
            const currentPos = seg.group.position;
            const dir = prevPos.clone().sub(currentPos);
            const dist = dir.length();
            const targetDist = 3.6;

            if (dist > 0.01) {
                dir.normalize();
                // Pull segment toward previous segment
                const desiredPos = prevPos.clone().sub(dir.multiplyScalar(targetDist));

                // Add lateral sinusoidal wave undulation
                const waveOffset = Math.sin(this.swimCycle - i * 0.6) * (1.2 + i * 0.15);
                const perpDir = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
                desiredPos.add(perpDir.multiplyScalar(waveOffset));

                currentPos.lerp(desiredPos, 0.35);
            }

            // Align segment rotation along the spine
            seg.group.lookAt(prevPos);
            prevPos = currentPos.clone();
        });

        // ==========================================
        // TORPEDO HIT DETECTION
        // ==========================================
        subController.activeTorpedoes.forEach(torp => {
            const hitHead = torp.mesh.position.distanceTo(this.position) < 8.0;
            let hitBody = false;

            for (const seg of this.monsterData.segments) {
                if (torp.mesh.position.distanceTo(seg.group.position) < 6.0) {
                    hitBody = true;
                    break;
                }
            }

            if (hitHead || hitBody) {
                torp.life = 0; // consume torpedo
                world.spawnExplosion(torp.mesh.position);
                this.audio.playExplosion(1.5);
                this.audio.playLeviathanRoar();
                this.stun();
            }
        });
    }

    hide() {
        this.active = false;
        this.mesh.visible = false;
        const proxBar = document.getElementById('monster-proximity-bar');
        if (proxBar) proxBar.classList.add('hidden');
    }
}
