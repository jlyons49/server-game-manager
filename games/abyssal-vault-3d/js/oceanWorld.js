/**
 * 3D Ocean World & Trench Environment Manager
 * Controls depth zones, water fog, volumetric lighting, rock spires, hydrothermal vents,
 * hazards, collectibles, marine life, and particle systems (bubbles, marine snow, explosions).
 */

export class OceanWorld {
    constructor(scene, modelFactory, shipType = 'pirate') {
        this.scene = scene;
        this.modelFactory = modelFactory;
        this.shipType = shipType;

        // Depth constants (Y coordinates in Three.js space)
        // Surface is at Y = 0 (Depth 0m)
        // Seafloor is at Y = -2260 (Depth 2260m)
        this.surfaceY = 0;
        this.seafloorY = -2260;
        this.shipwreckY = -2160;

        // Trench horizontal bounds
        this.trenchRadius = 110;

        // Containers
        this.hazards = [];
        this.collectibles = [];
        this.vents = [];
        this.marineLife = [];
        this.torpedoes = [];
        this.particles = [];

        // Lighting & Atmosphere
        this.sunLight = null;
        this.ambientLight = null;
        this.fog = null;

        this.initEnvironment();
        this.buildTrench(shipType);
        this.initParticleSystems();
    }

    initEnvironment() {
        // Dynamic water fog
        this.fog = new THREE.Fog(0x064e6b, 20, 160);
        this.scene.fog = this.fog;
        this.scene.background = new THREE.Color(0x064e6b);

        // Directional Sun Light (strongest near surface)
        this.sunLight = new THREE.DirectionalLight(0xdbeafe, 2.2);
        this.sunLight.position.set(20, 100, 30);
        this.scene.add(this.sunLight);

        // Ambient Light
        this.ambientLight = new THREE.AmbientLight(0x0c4a6e, 0.8);
        this.scene.add(this.ambientLight);

        // Water surface refraction plane
        const surfaceGeo = new THREE.PlaneGeometry(300, 300, 32, 32);
        surfaceGeo.rotateX(-Math.PI / 2);
        const surfaceMat = new THREE.MeshPhysicalMaterial({
            color: 0x38bdf8,
            transmission: 0.9,
            roughness: 0.1,
            metalness: 0.1,
            transparent: true,
            opacity: 0.85
        });
        this.surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
        this.surfaceMesh.position.y = 0;
        this.scene.add(this.surfaceMesh);

        // Seafloor terrain
        const seafloorGeo = new THREE.PlaneGeometry(360, 360, 48, 48);
        seafloorGeo.rotateX(-Math.PI / 2);

        // Add subtle procedural dunes to seafloor vertices
        const posAttr = seafloorGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            const vx = posAttr.getX(i);
            const vz = posAttr.getZ(i);
            const dune = Math.sin(vx * 0.05) * Math.cos(vz * 0.05) * 5 + Math.sin(vx * 0.12) * 2;
            posAttr.setY(i, dune);
        }
        seafloorGeo.computeVertexNormals();

        const seafloorMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.9,
            metalness: 0.1
        });
        this.seafloorMesh = new THREE.Mesh(seafloorGeo, seafloorMat);
        this.seafloorMesh.position.y = this.seafloorY;
        this.scene.add(this.seafloorMesh);
    }

    buildTrench(shipType) {
        this.shipType = shipType;

        // 1. Rocky Trench Spire Columns & Cavern Shelves
        const rockMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.95,
            metalness: 0.2
        });

        // Lateral trench boundary spires (canyon walls)
        const wallDepths = [-250, -500, -750, -1000, -1250, -1500, -1750, -2000];
        wallDepths.forEach((wy, idx) => {
            // Left canyon outcropping
            const rockGeo = new THREE.DodecahedronGeometry(18 + Math.random() * 10, 1);
            const leftRock = new THREE.Mesh(rockGeo, rockMat);
            leftRock.position.set(-85 - Math.random() * 20, wy, (Math.random() - 0.5) * 40);
            leftRock.scale.set(1.5, 3.5, 1.8);
            this.scene.add(leftRock);

            // Right canyon outcropping
            const rightRock = new THREE.Mesh(rockGeo, rockMat);
            rightRock.position.set(85 + Math.random() * 20, wy, (Math.random() - 0.5) * 40);
            rightRock.scale.set(1.5, 3.5, 1.8);
            this.scene.add(rightRock);

            // Center sea arches and spires to weave around
            if (idx % 2 === 1) {
                const spireGeo = new THREE.CylinderGeometry(4, 12, 65, 8);
                const spire = new THREE.Mesh(spireGeo, rockMat);
                spire.position.set((idx % 4 === 1 ? 25 : -25), wy, (Math.random() - 0.5) * 20);
                this.scene.add(spire);
            }
        });

        // 2. Hydrothermal Oxygen Vents at specified depths: 460m, 920m, 1400m, 1880m
        const ventDepths = [-460, -920, -1400, -1880];
        const ventPositions = [
            { x: -35, z: 15 },
            { x: 42, z: -20 },
            { x: -30, z: -25 },
            { x: 38, z: 20 }
        ];

        ventDepths.forEach((vy, i) => {
            const ventData = this.modelFactory.createHydrothermalVent();
            const pos = ventPositions[i];
            ventData.root.position.set(pos.x, vy, pos.z);
            this.scene.add(ventData.root);

            this.vents.push({
                x: pos.x,
                y: vy + 14, // top mouth
                z: pos.z,
                radius: 16,
                ventLight: ventData.ventLight
            });
        });

        // 3. Anchored Naval Mines (Hazards)
        const mineCount = 28;
        for (let i = 0; i < mineCount; i++) {
            const my = -180 - i * 72 + (Math.random() - 0.5) * 25;
            const mx = (Math.random() - 0.5) * 110;
            const mz = (Math.random() - 0.5) * 60;

            const mine = this.modelFactory.createNavalMine();
            mine.root.position.set(mx, my, mz);
            this.scene.add(mine.root);

            this.hazards.push({
                mesh: mine.root,
                led: mine.led,
                ledLight: mine.ledLight,
                x: mx,
                y: my,
                z: mz,
                radius: 3.5,
                detonated: false
            });
        }

        // 4. Spanish Doubloons (Collectibles)
        const doubloonCount = 45;
        for (let i = 0; i < doubloonCount; i++) {
            const dy = -80 - i * 46 + (Math.random() - 0.5) * 20;
            const dx = (Math.random() - 0.5) * 90;
            const dz = (Math.random() - 0.5) * 50;

            const coinMesh = this.modelFactory.createDoubloon();
            coinMesh.position.set(dx, dy, dz);
            this.scene.add(coinMesh);

            this.collectibles.push({
                type: 'doubloon',
                mesh: coinMesh,
                x: dx,
                y: dy,
                z: dz,
                radius: 4.5,
                collected: false
            });
        }

        // 5. Floating O2 Canisters
        const o2Count = 14;
        for (let i = 0; i < o2Count; i++) {
            const oy = -150 - i * 140 + (Math.random() - 0.5) * 30;
            const ox = (Math.random() - 0.5) * 80;
            const oz = (Math.random() - 0.5) * 45;

            const tankMesh = this.modelFactory.createOxygenCanister();
            tankMesh.position.set(ox, oy, oz);
            this.scene.add(tankMesh);

            this.collectibles.push({
                type: 'oxygen',
                mesh: tankMesh,
                x: ox,
                y: oy,
                z: oz,
                radius: 5.0,
                collected: false
            });
        }

        // 6. Marine Life
        // Sunlit Zone Fish
        for (let i = 0; i < 24; i++) {
            const fishGeo = new THREE.ConeGeometry(0.35, 1.4, 6);
            fishGeo.rotateZ(Math.PI / 2);
            const fishMat = new THREE.MeshStandardMaterial({
                color: i % 2 === 0 ? 0xf97316 : 0x06b6d4,
                roughness: 0.3
            });
            const fish = new THREE.Mesh(fishGeo, fishMat);
            const fx = (Math.random() - 0.5) * 90;
            const fy = -40 - Math.random() * 380;
            const fz = (Math.random() - 0.5) * 60;
            fish.position.set(fx, fy, fz);
            this.scene.add(fish);

            this.marineLife.push({
                mesh: fish,
                type: 'fish',
                basePos: new THREE.Vector3(fx, fy, fz),
                speed: 0.4 + Math.random() * 0.4,
                phase: Math.random() * Math.PI * 2
            });
        }

        // Twilight Zone Jellyfish
        for (let i = 0; i < 16; i++) {
            const jelly = this.modelFactory.createJellyfish();
            const jx = (Math.random() - 0.5) * 100;
            const jy = -550 - Math.random() * 800;
            const jz = (Math.random() - 0.5) * 60;
            jelly.root.position.set(jx, jy, jz);
            this.scene.add(jelly.root);

            this.marineLife.push({
                ...jelly,
                type: 'jellyfish',
                basePos: new THREE.Vector3(jx, jy, jz),
                speed: 0.2 + Math.random() * 0.2
            });
        }

        // Abyssal Anglerfish
        for (let i = 0; i < 8; i++) {
            const angler = this.modelFactory.createAnglerfish();
            const ax = (Math.random() - 0.5) * 90;
            const ay = -1450 - Math.random() * 700;
            const az = (Math.random() - 0.5) * 60;
            angler.root.position.set(ax, ay, az);
            this.scene.add(angler.root);

            this.marineLife.push({
                ...angler,
                type: 'anglerfish',
                basePos: new THREE.Vector3(ax, ay, az),
                speed: 0.3 + Math.random() * 0.2
            });
        }

        // 7. Seafloor Shipwreck & Relic Vault (at 2160m)
        this.shipwreckMesh = this.modelFactory.createShipwreck(shipType);
        this.shipwreckMesh.position.set(0, this.shipwreckY, 0);
        this.scene.add(this.shipwreckMesh);

        // Relic Cipher Vault placed directly on the shipwreck deck
        this.vaultData = this.modelFactory.createVault(shipType);
        this.vaultData.root.position.set(0, this.shipwreckY + 3.8, 4);
        this.scene.add(this.vaultData.root);
    }

    initParticleSystems() {
        // 1. Marine Snow (Particulates)
        const snowCount = 900;
        const snowGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(snowCount * 3);
        const velocities = [];

        for (let i = 0; i < snowCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 160;
            positions[i * 3 + 1] = Math.random() * -2300;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
            velocities.push({
                vx: (Math.random() - 0.5) * 0.1,
                vy: -0.15 - Math.random() * 0.25,
                vz: (Math.random() - 0.5) * 0.1
            });
        }
        snowGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const snowMat = new THREE.PointsMaterial({
            color: 0x93c5fd,
            size: 0.8,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.snowPoints = new THREE.Points(snowGeo, snowMat);
        this.snowVelocities = velocities;
        this.scene.add(this.snowPoints);

        // 2. Active Bubble & Explosion particle manager
        this.dynamicParticles = [];
    }

    spawnBubbles(origin, count = 6, speed = 1.0, spread = 0.5) {
        for (let i = 0; i < count; i++) {
            const bubbleGeo = new THREE.SphereGeometry(0.12 + Math.random() * 0.18, 8, 8);
            const bubbleMat = new THREE.MeshBasicMaterial({
                color: 0xbae6fd,
                transparent: true,
                opacity: 0.75
            });
            const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
            bubble.position.copy(origin);
            bubble.position.x += (Math.random() - 0.5) * spread;
            bubble.position.y += (Math.random() - 0.5) * spread;
            bubble.position.z += (Math.random() - 0.5) * spread;

            this.scene.add(bubble);
            this.dynamicParticles.push({
                mesh: bubble,
                vx: (Math.random() - 0.5) * 0.3 * speed,
                vy: (0.8 + Math.random() * 0.9) * speed,
                vz: (Math.random() - 0.5) * 0.3 * speed,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02
            });
        }
    }

    spawnExplosion(origin) {
        // Shockwave burst + debris
        for (let i = 0; i < 35; i++) {
            const geo = new THREE.SphereGeometry(0.3 + Math.random() * 0.5, 6, 6);
            const mat = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.4 ? 0xf97316 : 0xfacc15,
                transparent: true,
                opacity: 0.9
            });
            const piece = new THREE.Mesh(geo, mat);
            piece.position.copy(origin);
            this.scene.add(piece);

            const v = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize().multiplyScalar(1.2 + Math.random() * 2.2);

            this.dynamicParticles.push({
                mesh: piece,
                vx: v.x,
                vy: v.y,
                vz: v.z,
                life: 1.0,
                decay: 0.035
            });
        }

        // Heavy cavitation bubble cloud
        this.spawnBubbles(origin, 40, 2.0, 3.5);
    }

    update(dt, subPos) {
        // 1. Dynamic Water Color & Atmosphere based on submarine depth
        const depth = Math.abs(subPos.y);

        if (depth < 500) {
            // Sunlit Zone (0 - 500m)
            const t = depth / 500;
            const r = THREE.MathUtils.lerp(6 / 255, 3 / 255, t);
            const g = THREE.MathUtils.lerp(78 / 255, 24 / 255, t);
            const b = THREE.MathUtils.lerp(107 / 255, 43 / 255, t);
            this.scene.background.setRGB(r, g, b);
            this.fog.color.setRGB(r, g, b);
            this.fog.near = THREE.MathUtils.lerp(25, 15, t);
            this.fog.far = THREE.MathUtils.lerp(160, 110, t);
            this.sunLight.intensity = (1 - t * 0.8) * 2.2;
            this.ambientLight.intensity = THREE.MathUtils.lerp(0.8, 0.4, t);
        } else if (depth < 1400) {
            // Twilight Zone (500 - 1400m)
            const t = (depth - 500) / 900;
            const r = THREE.MathUtils.lerp(3 / 255, 1 / 255, t);
            const g = THREE.MathUtils.lerp(24 / 255, 6 / 255, t);
            const b = THREE.MathUtils.lerp(43 / 255, 15 / 255, t);
            this.scene.background.setRGB(r, g, b);
            this.fog.color.setRGB(r, g, b);
            this.fog.near = THREE.MathUtils.lerp(15, 8, t);
            this.fog.far = THREE.MathUtils.lerp(110, 65, t);
            this.sunLight.intensity = 0.05 * (1 - t);
            this.ambientLight.intensity = THREE.MathUtils.lerp(0.4, 0.15, t);
        } else {
            // Abyssal Trench (1400 - 2260m)
            this.scene.background.setHex(0x01060f);
            this.fog.color.setHex(0x01060f);
            this.fog.near = 5;
            this.fog.far = 55;
            this.sunLight.intensity = 0.0;
            this.ambientLight.intensity = 0.1;
        }

        // 2. Rotate Collectibles & animate marine life
        this.collectibles.forEach(col => {
            if (!col.collected) {
                col.mesh.rotation.y += 1.8 * dt;
                col.mesh.position.y = col.y + Math.sin(Date.now() * 0.003 + col.x) * 0.4;
            }
        });

        // 3. Pulse Naval Mine LEDs
        this.hazards.forEach(mine => {
            if (!mine.detonated) {
                const distToSub = subPos.distanceTo(mine.mesh.position);
                const pulseRate = distToSub < 30 ? 12.0 : 3.0;
                const brightness = Math.sin(Date.now() * 0.001 * pulseRate) > 0 ? 2.0 : 0.2;
                mine.led.material.emissiveIntensity = brightness;
                mine.ledLight.intensity = brightness * 0.8;
            }
        });

        // 4. Hydrothermal Vents Rising Bubbles
        this.vents.forEach(vent => {
            if (Math.random() < 0.35) {
                this.spawnBubbles(new THREE.Vector3(vent.x, vent.y, vent.z), 3, 1.2, 1.5);
            }
        });

        // 5. Marine life animation
        this.marineLife.forEach(creature => {
            if (creature.type === 'fish') {
                creature.phase += creature.speed * 2.5 * dt;
                creature.mesh.position.x = creature.basePos.x + Math.sin(creature.phase) * 12;
                creature.mesh.position.z = creature.basePos.z + Math.cos(creature.phase) * 8;
                creature.mesh.rotation.y = -creature.phase + Math.PI / 2;
            } else if (creature.type === 'jellyfish') {
                creature.pulsePhase += 1.8 * dt;
                const scale = 1.0 + Math.sin(creature.pulsePhase) * 0.18;
                creature.bell.scale.set(scale, 1 / scale, scale);
                creature.root.position.y = creature.basePos.y + Math.sin(creature.pulsePhase * 0.5) * 3;
            } else if (creature.type === 'anglerfish') {
                creature.root.position.x = creature.basePos.x + Math.sin(Date.now() * 0.001) * 6;
                creature.lure.material.emissiveIntensity = 1.5 + Math.sin(Date.now() * 0.005) * 0.8;
            }
        });

        // 6. Marine Snow Particle Drift (wraps around submarine)
        const posAttr = this.snowPoints.geometry.attributes.position;
        for (let i = 0; i < this.snowVelocities.length; i++) {
            let px = posAttr.getX(i) + this.snowVelocities[i].vx;
            let py = posAttr.getY(i) + this.snowVelocities[i].vy;
            let pz = posAttr.getZ(i) + this.snowVelocities[i].vz;

            // Keep snow centered around sub's vertical position
            if (py < subPos.y - 70) py = subPos.y + 70;
            if (py > subPos.y + 70) py = subPos.y - 70;

            posAttr.setXYZ(i, px, py, pz);
        }
        posAttr.needsUpdate = true;

        // 7. Dynamic Particles (Bubbles, Explosions)
        for (let i = this.dynamicParticles.length - 1; i >= 0; i--) {
            const p = this.dynamicParticles[i];
            p.mesh.position.x += p.vx * dt * 60;
            p.mesh.position.y += p.vy * dt * 60;
            p.mesh.position.z += p.vz * dt * 60;
            p.life -= p.decay * dt * 60;

            if (p.mesh.material.opacity !== undefined) {
                p.mesh.material.opacity = p.life;
            }

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.dynamicParticles.splice(i, 1);
            }
        }
    }
}
