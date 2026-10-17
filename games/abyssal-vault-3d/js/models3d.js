/**
 * 3D Procedural Model Generators for Abyssal Vault
 * Generates realistic 3D models with PBR materials for Three.js:
 * - Explorer Submarine (articulated hydrofoils, rudders, spinning propeller, interior dome, spotlights)
 * - The Abyssal Leviathan (14 articulated vertebrae, snapping maw, razor teeth, bioluminescent spines)
 * - 3 Detailed Shipwrecks (Black Barnacle Galleon, RMS Titanic, B-17 Flying Fortress)
 * - 3 Cipher Vaults (Pirate Chest, Purser Safe, Flight Recorder)
 * - Naval Mines, Hydrothermal Vents, Doubloons, O2 Canisters, Jellyfish, Anglerfish
 */

export class ModelFactory {
    constructor() {
        this.cache = new Map();
    }

    // ========================================================
    // 1. SUBMARINE MODEL
    // ========================================================
    createSubmarine(skinData, lightData) {
        const root = new THREE.Group();
        root.name = 'Submarine';

        // Materials
        const hullMat = new THREE.MeshStandardMaterial({
            color: skinData.hullColor,
            metalness: skinData.metalness || 0.6,
            roughness: skinData.roughness || 0.35,
            emissive: skinData.emissive || 0x000000,
            emissiveIntensity: skinData.emissiveIntensity || 0
        });

        const darkTrimMat = new THREE.MeshStandardMaterial({
            color: skinData.hullDark,
            metalness: (skinData.metalness || 0.6) * 0.8,
            roughness: (skinData.roughness || 0.35) * 1.1
        });

        const trimMat = new THREE.MeshStandardMaterial({
            color: skinData.trimColor,
            metalness: 0.7,
            roughness: 0.25,
            emissive: skinData.emissive ? skinData.trimColor : 0x000000,
            emissiveIntensity: skinData.emissiveIntensity ? 0.3 : 0
        });

        const brassMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.85,
            roughness: 0.2
        });

        const glassMat = new THREE.MeshPhysicalMaterial({
            color: skinData.domeColor || 0x38bdf8,
            metalness: 0.1,
            roughness: 0.05,
            transmission: 0.75,
            opacity: 0.85,
            transparent: true,
            reflectivity: 0.9,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        // 1. Main Pressure Hull (Hydrodynamic torpedo teardrop shape)
        const hullGroup = new THREE.Group();

        // Central cylinder
        const cylinderGeo = new THREE.CylinderGeometry(1.5, 1.5, 5.0, 24);
        cylinderGeo.rotateZ(Math.PI / 2);
        const centralHull = new THREE.Mesh(cylinderGeo, hullMat);
        hullGroup.add(centralHull);

        // Forward nose cone
        const noseGeo = new THREE.ConeGeometry(1.5, 2.2, 24);
        noseGeo.rotateZ(-Math.PI / 2);
        const nose = new THREE.Mesh(noseGeo, darkTrimMat);
        nose.position.x = 3.6;
        hullGroup.add(nose);

        // Aft tapered cone
        const sternGeo = new THREE.ConeGeometry(1.5, 3.2, 24);
        sternGeo.rotateZ(Math.PI / 2);
        const stern = new THREE.Mesh(sternGeo, darkTrimMat);
        stern.position.x = -4.1;
        hullGroup.add(stern);

        // Reinforcement hull ribs (rings)
        for (let i = -2; i <= 2; i++) {
            const ribGeo = new THREE.TorusGeometry(1.55, 0.06, 8, 24);
            ribGeo.rotateY(Math.PI / 2);
            const rib = new THREE.Mesh(ribGeo, trimMat);
            rib.position.x = i * 1.0;
            hullGroup.add(rib);
        }

        // Keel ballast tank at bottom
        const keelGeo = new THREE.BoxGeometry(4.8, 0.45, 1.2);
        const keel = new THREE.Mesh(keelGeo, darkTrimMat);
        keel.position.y = -1.45;
        hullGroup.add(keel);

        // 2. Conning Tower / Sail
        const towerGeo = new THREE.BoxGeometry(1.6, 1.2, 0.9);
        const tower = new THREE.Mesh(towerGeo, hullMat);
        tower.position.set(0.3, 1.7, 0);
        hullGroup.add(tower);

        // Periscope mast and communication antenna
        const mastGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 12);
        const periscope = new THREE.Mesh(mastGeo, brassMat);
        periscope.position.set(0.7, 2.6, 0.15);
        hullGroup.add(periscope);

        const scopeHeadGeo = new THREE.BoxGeometry(0.25, 0.14, 0.14);
        const scopeHead = new THREE.Mesh(scopeHeadGeo, darkTrimMat);
        scopeHead.position.set(0.78, 3.15, 0.15);
        hullGroup.add(scopeHead);

        // Navigation beacon (strobe)
        const strobeGeo = new THREE.SphereGeometry(0.1, 12, 12);
        const strobeMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xff0000,
            emissiveIntensity: 1.0
        });
        const strobe = new THREE.Mesh(strobeGeo, strobeMat);
        strobe.position.set(-0.2, 2.35, 0);
        hullGroup.add(strobe);

        // 3. Cockpit Observation Dome (Bow Glass Canopy)
        const domeGeo = new THREE.SphereGeometry(1.1, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2);
        domeGeo.rotateZ(-Math.PI / 2);
        const dome = new THREE.Mesh(domeGeo, glassMat);
        dome.position.set(3.8, 0, 0);
        hullGroup.add(dome);

        // Cockpit interior pilot console glow
        const consoleGeo = new THREE.BoxGeometry(0.5, 0.35, 0.8);
        const consoleMat = new THREE.MeshStandardMaterial({
            color: 0x0ea5e9,
            emissive: 0x06b6d4,
            emissiveIntensity: 0.8
        });
        const pilotConsole = new THREE.Mesh(consoleGeo, consoleMat);
        pilotConsole.position.set(3.4, -0.2, 0);
        hullGroup.add(pilotConsole);

        // 4. Dive Planes / Hydrofoils (Articulated Bow Fin)
        const bowFinGroup = new THREE.Group();
        bowFinGroup.position.set(2.8, 0, 0);
        const finGeo = new THREE.BoxGeometry(0.6, 0.08, 3.8);
        const bowFins = new THREE.Mesh(finGeo, trimMat);
        bowFinGroup.add(bowFins);
        hullGroup.add(bowFinGroup);

        // 5. Stern Controls (Rudder & Stern Planes)
        const rudderGroup = new THREE.Group();
        rudderGroup.position.set(-5.6, 0, 0);
        const rudderGeo = new THREE.BoxGeometry(0.8, 2.2, 0.08);
        const rudderMesh = new THREE.Mesh(rudderGeo, trimMat);
        rudderGroup.add(rudderMesh);
        hullGroup.add(rudderGroup);

        const sternPlanesGeo = new THREE.BoxGeometry(0.8, 0.08, 2.6);
        const sternPlanes = new THREE.Mesh(sternPlanesGeo, trimMat);
        sternPlanes.position.set(-5.6, 0, 0);
        hullGroup.add(sternPlanes);

        // 6. Propeller Screw
        const propGroup = new THREE.Group();
        propGroup.position.set(-5.9, 0, 0);

        const hubGeo = new THREE.CylinderGeometry(0.28, 0.15, 0.6, 16);
        hubGeo.rotateZ(Math.PI / 2);
        const hub = new THREE.Mesh(hubGeo, brassMat);
        propGroup.add(hub);

        // 4 blades
        for (let b = 0; b < 4; b++) {
            const bladeGeo = new THREE.BoxGeometry(0.12, 1.1, 0.32);
            bladeGeo.rotateX(0.4);
            const blade = new THREE.Mesh(bladeGeo, brassMat);
            blade.rotation.x = (b * Math.PI) / 2;
            propGroup.add(blade);
        }
        hullGroup.add(propGroup);

        // 7. Torpedo Tubes (Port & Starboard)
        for (const side of [-1, 1]) {
            const tubeGeo = new THREE.CylinderGeometry(0.24, 0.24, 2.4, 16);
            tubeGeo.rotateZ(Math.PI / 2);
            const tube = new THREE.Mesh(tubeGeo, darkTrimMat);
            tube.position.set(1.5, -0.65, side * 1.55);
            hullGroup.add(tube);

            const capGeo = new THREE.SphereGeometry(0.24, 12, 12);
            const cap = new THREE.Mesh(capGeo, brassMat);
            cap.position.set(2.7, -0.65, side * 1.55);
            hullGroup.add(cap);
        }

        // 8. Dual High-Power Forward Searchlights
        const searchlightsGroup = new THREE.Group();
        const lightSources = [];
        const beamMeshes = [];

        for (const side of [-1, 1]) {
            const podGeo = new THREE.CylinderGeometry(0.35, 0.42, 0.7, 16);
            podGeo.rotateZ(Math.PI / 2);
            const pod = new THREE.Mesh(podGeo, brassMat);
            pod.position.set(3.4, 0.7, side * 1.1);
            searchlightsGroup.add(pod);

            // Lens glass
            const lensGeo = new THREE.CircleGeometry(0.34, 16);
            lensGeo.rotateY(Math.PI / 2);
            const lensMat = new THREE.MeshBasicMaterial({
                color: lightData.lightColor || 0xffffff
            });
            const lens = new THREE.Mesh(lensGeo, lensMat);
            lens.position.set(3.76, 0.7, side * 1.1);
            searchlightsGroup.add(lens);

            // Realistic Three.js SpotLight
            const spot = new THREE.SpotLight(lightData.lightColor || 0xfffae0, 3.8, 120, Math.PI / 5.5, 0.4, 1.2);
            spot.position.set(3.8, 0.7, side * 1.1);
            const target = new THREE.Object3D();
            target.position.set(40, 0.7, side * 1.1);
            root.add(target);
            spot.target = target;
            spot.castShadow = true;
            searchlightsGroup.add(spot);
            lightSources.push(spot);

            // Volumetric Light Cone Mesh
            const coneGeo = new THREE.ConeGeometry(8.5, 42, 24, 1, true);
            coneGeo.rotateZ(-Math.PI / 2);
            coneGeo.translate(21, 0, 0);
            const coneMat = new THREE.MeshBasicMaterial({
                color: lightData.beamColor || 0xffea75,
                transparent: true,
                opacity: lightData.coneOpacity || 0.18,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            const beamMesh = new THREE.Mesh(coneGeo, coneMat);
            beamMesh.position.set(3.8, 0.7, side * 1.1);
            searchlightsGroup.add(beamMesh);
            beamMeshes.push(beamMesh);
        }
        hullGroup.add(searchlightsGroup);

        // Sonar Ping Wave Illuminator (expanding sphere)
        const sonarGeo = new THREE.SphereGeometry(1, 32, 32);
        const sonarMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0,
            wireframe: true,
            blending: THREE.AdditiveBlending
        });
        const sonarWave = new THREE.Mesh(sonarGeo, sonarMat);
        sonarWave.visible = false;
        root.add(sonarWave);

        root.add(hullGroup);

        return {
            root,
            hullGroup,
            bowFinGroup,
            rudderGroup,
            propGroup,
            strobe,
            lightSources,
            beamMeshes,
            sonarWave,
            materials: {
                hullMat,
                darkTrimMat,
                trimMat,
                glassMat,
                brassMat
            },
            updateCosmetics: (newSkin, newLight) => {
                hullMat.color.setHex(newSkin.hullColor);
                hullMat.metalness = newSkin.metalness || 0.6;
                hullMat.roughness = newSkin.roughness || 0.35;
                hullMat.emissive.setHex(newSkin.emissive || 0x000000);
                hullMat.emissiveIntensity = newSkin.emissiveIntensity || 0;

                darkTrimMat.color.setHex(newSkin.hullDark);
                trimMat.color.setHex(newSkin.trimColor);
                if (newSkin.emissive) {
                    trimMat.emissive.setHex(newSkin.trimColor);
                    trimMat.emissiveIntensity = 0.3;
                } else {
                    trimMat.emissive.setHex(0x000000);
                    trimMat.emissiveIntensity = 0;
                }

                lightSources.forEach(s => s.color.setHex(newLight.lightColor));
                beamMeshes.forEach(b => {
                    b.material.color.setHex(newLight.beamColor);
                    b.material.opacity = newLight.coneOpacity;
                });
            }
        };
    }

    // ========================================================
    // 2. THE ABYSSAL LEVIATHAN (14 Articulated Segments)
    // ========================================================
    createLeviathan() {
        const root = new THREE.Group();
        root.name = 'AbyssalLeviathan';

        const scaleMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.8,
            metalness: 0.3,
            emissive: 0x380000,
            emissiveIntensity: 0.2
        });

        const spineMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xff0000,
            emissiveIntensity: 0.8,
            roughness: 0.3
        });

        const eyeMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xff0033,
            emissiveIntensity: 2.5
        });

        const teethMat = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.3,
            metalness: 0.1
        });

        // HEAD GROUP
        const headGroup = new THREE.Group();
        headGroup.name = 'LeviathanHead';

        // Main skull (cone pointing along +Z)
        const skullGeo = new THREE.ConeGeometry(2.4, 6.0, 16);
        skullGeo.rotateX(Math.PI / 2);
        const skull = new THREE.Mesh(skullGeo, scaleMat);
        skull.position.z = 2.0;
        headGroup.add(skull);

        // Brow horns / crests
        for (const side of [-1, 1]) {
            const hornGeo = new THREE.ConeGeometry(0.4, 3.2, 8);
            hornGeo.rotateX(Math.PI / 3);
            hornGeo.rotateY(side * 0.3);
            const horn = new THREE.Mesh(hornGeo, spineMat);
            horn.position.set(side * 1.5, 1.8, 0.8);
            headGroup.add(horn);

            // Glowing Eyes
            const eyeGeo = new THREE.SphereGeometry(0.4, 16, 16);
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(side * 1.35, 0.9, 2.8);
            headGroup.add(eye);

            const eyeLight = new THREE.PointLight(0xff0033, 2.5, 30);
            eyeLight.position.set(side * 1.35, 0.9, 2.8);
            headGroup.add(eyeLight);
        }

        // Articulated Jaws
        const upperJawGroup = new THREE.Group();
        upperJawGroup.position.set(0, 0.2, 2.4);
        const upperJawGeo = new THREE.ConeGeometry(1.6, 4.0, 12);
        upperJawGeo.rotateX(Math.PI / 2);
        const upperJaw = new THREE.Mesh(upperJawGeo, scaleMat);
        upperJaw.position.z = 1.5;
        upperJawGroup.add(upperJaw);

        const lowerJawGroup = new THREE.Group();
        lowerJawGroup.position.set(0, -0.5, 2.2);
        const lowerJawGeo = new THREE.ConeGeometry(1.3, 3.6, 12);
        lowerJawGeo.rotateX(Math.PI / 2);
        const lowerJaw = new THREE.Mesh(lowerJawGeo, scaleMat);
        lowerJaw.position.z = 1.4;
        lowerJawGroup.add(lowerJaw);

        // Razor Teeth
        for (let t = 0; t < 8; t++) {
            const toothGeo = new THREE.ConeGeometry(0.16, 0.8, 6);
            toothGeo.rotateZ(Math.PI);
            const upperTooth = new THREE.Mesh(toothGeo, teethMat);
            upperTooth.position.set((t % 2 === 0 ? 0.6 : -0.6), -0.7, 0.4 + t * 0.35);
            upperJawGroup.add(upperTooth);

            const lowerToothGeo = new THREE.ConeGeometry(0.16, 0.8, 6);
            const lowerTooth = new THREE.Mesh(lowerToothGeo, teethMat);
            lowerTooth.position.set((t % 2 === 0 ? 0.5 : -0.5), 0.6, 0.4 + t * 0.35);
            lowerJawGroup.add(lowerTooth);
        }

        headGroup.add(upperJawGroup);
        headGroup.add(lowerJawGroup);
        root.add(headGroup);

        // 14 ARTICULATED VERTEBRAE BODY SEGMENTS
        const segments = [];
        const segmentCount = 14;

        for (let i = 0; i < segmentCount; i++) {
            const segGroup = new THREE.Group();
            segGroup.name = `LeviathanSegment_${i}`;

            const radius = Math.max(0.6, 2.2 * (1 - i / (segmentCount + 2)));
            const length = 3.6;

            const segGeo = new THREE.CylinderGeometry(radius * 0.85, radius, length, 14);
            segGeo.rotateX(Math.PI / 2);
            const segMesh = new THREE.Mesh(segGeo, scaleMat);
            segGroup.add(segMesh);

            // Dorsal Spines on back
            const spineCount = 2;
            for (let s = 0; s < spineCount; s++) {
                const sGeo = new THREE.ConeGeometry(0.3, radius * 1.8, 6);
                const sMesh = new THREE.Mesh(sGeo, spineMat);
                sMesh.position.set(0, radius + 0.5, -0.8 + s * 1.6);
                segGroup.add(sMesh);
            }

            // Lateral fin flippers on middle segments
            if (i >= 2 && i <= 8 && i % 2 === 0) {
                for (const side of [-1, 1]) {
                    const finGeo = new THREE.BoxGeometry(radius * 2.5, 0.1, 1.2);
                    const finMesh = new THREE.Mesh(finGeo, spineMat);
                    finMesh.position.set(side * (radius + 0.8), 0, 0);
                    finMesh.rotation.y = side * 0.4;
                    segGroup.add(finMesh);
                }
            }

            root.add(segGroup);
            segments.push({
                group: segGroup,
                mesh: segMesh,
                targetPos: new THREE.Vector3(0, 0, 0),
                radius
            });
        }

        return {
            root,
            headGroup,
            upperJawGroup,
            lowerJawGroup,
            segments,
            materials: {
                scaleMat,
                spineMat,
                eyeMat
            },
            setRageMode: (isRage) => {
                if (isRage) {
                    scaleMat.emissive.setHex(0x7f1d1d);
                    scaleMat.emissiveIntensity = 0.9;
                    spineMat.emissive.setHex(0xff2200);
                    spineMat.emissiveIntensity = 2.2;
                    eyeMat.emissive.setHex(0xff0000);
                    eyeMat.emissiveIntensity = 3.5;
                } else {
                    scaleMat.emissive.setHex(0x380000);
                    scaleMat.emissiveIntensity = 0.2;
                    spineMat.emissive.setHex(0xff0000);
                    spineMat.emissiveIntensity = 0.8;
                    eyeMat.emissive.setHex(0xff0033);
                    eyeMat.emissiveIntensity = 2.5;
                }
            }
        };
    }

    // ========================================================
    // 3. SHIPWRECKS (Pirate, Titanic, B-17 Bomber)
    // ========================================================
    createShipwreck(type = 'pirate') {
        const root = new THREE.Group();
        root.name = `Shipwreck_${type}`;

        if (type === 'pirate') {
            // THE BLACK BARNACLE (17th Century Galleon)
            const woodMat = new THREE.MeshStandardMaterial({
                color: 0x3d2b1f,
                roughness: 0.9,
                metalness: 0.1
            });
            const deckMat = new THREE.MeshStandardMaterial({
                color: 0x5a4130,
                roughness: 0.85
            });
            const ironMat = new THREE.MeshStandardMaterial({
                color: 0x222222,
                roughness: 0.7,
                metalness: 0.8
            });
            const sailMat = new THREE.MeshStandardMaterial({
                color: 0xd6cbbd,
                roughness: 0.9,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });

            // Galleon Hull (resting on tilt)
            const hullGeo = new THREE.BoxGeometry(14, 5.5, 34);
            const hull = new THREE.Mesh(hullGeo, woodMat);
            hull.position.set(0, 2.5, 0);
            hull.rotation.z = 0.18; // tilted in seabed
            root.add(hull);

            // Stern Castle
            const sternCastleGeo = new THREE.BoxGeometry(13.8, 4.0, 10);
            const sternCastle = new THREE.Mesh(sternCastleGeo, woodMat);
            sternCastle.position.set(0, 6.8, -12);
            sternCastle.rotation.z = 0.18;
            root.add(sternCastle);

            // Masts (Broken Fore and Main Masts)
            const mastGeo = new THREE.CylinderGeometry(0.5, 0.7, 24, 12);
            const mainMast = new THREE.Mesh(mastGeo, woodMat);
            mainMast.position.set(0, 13, 2);
            mainMast.rotation.x = -0.25;
            mainMast.rotation.z = 0.35; // snapped/falling
            root.add(mainMast);

            // Yardarm & Tattered Sail
            const yardGeo = new THREE.CylinderGeometry(0.22, 0.22, 14, 8);
            yardGeo.rotateZ(Math.PI / 2);
            const yardarm = new THREE.Mesh(yardGeo, woodMat);
            yardarm.position.set(1.5, 17, 2);
            root.add(yardarm);

            const sailGeo = new THREE.PlaneGeometry(12, 9, 6, 6);
            const sail = new THREE.Mesh(sailGeo, sailMat);
            sail.position.set(1.5, 13, 2.2);
            sail.rotation.y = 0.2;
            root.add(sail);

            // Deck Cannons
            for (let c = -4; c <= 4; c += 2) {
                const cannonGeo = new THREE.CylinderGeometry(0.25, 0.4, 2.4, 12);
                cannonGeo.rotateZ(Math.PI / 2);
                const cannon = new THREE.Mesh(cannonGeo, ironMat);
                cannon.position.set(6.8, 5.0, c * 2.8);
                root.add(cannon);
            }

            // Swaying Sea Kelp around wreck
            const kelpMat = new THREE.MeshStandardMaterial({
                color: 0x15803d,
                roughness: 0.6,
                side: THREE.DoubleSide
            });
            for (let k = 0; k < 18; k++) {
                const kelpGeo = new THREE.CylinderGeometry(0.08, 0.15, 14 + Math.random() * 8, 6);
                const kelp = new THREE.Mesh(kelpGeo, kelpMat);
                kelp.position.set((Math.random() - 0.5) * 36, 7, (Math.random() - 0.5) * 48);
                kelp.rotation.z = (Math.random() - 0.5) * 0.3;
                root.add(kelp);
            }

        } else if (type === 'titanic') {
            // R.M.S. TITANIC
            const hullBlackMat = new THREE.MeshStandardMaterial({
                color: 0x1c1917,
                roughness: 0.7,
                metalness: 0.5
            });
            const superWhiteMat = new THREE.MeshStandardMaterial({
                color: 0xf3f4f6,
                roughness: 0.6,
                metalness: 0.3
            });
            const funnelOchreMat = new THREE.MeshStandardMaterial({
                color: 0xd97706,
                roughness: 0.6
            });
            const sootBlackMat = new THREE.MeshStandardMaterial({
                color: 0x09090b,
                roughness: 0.8
            });

            // Split Bow Section
            const bowHullGeo = new THREE.BoxGeometry(16, 9, 44);
            const bowHull = new THREE.Mesh(bowHullGeo, hullBlackMat);
            bowHull.position.set(0, 4.5, 0);
            bowHull.rotation.x = 0.08;
            root.add(bowHull);

            // Promenade Decks (Superstructure)
            const deck1Geo = new THREE.BoxGeometry(14, 3.2, 34);
            const deck1 = new THREE.Mesh(deck1Geo, superWhiteMat);
            deck1.position.set(0, 10.5, -3);
            root.add(deck1);

            const deck2Geo = new THREE.BoxGeometry(12, 2.8, 24);
            const deck2 = new THREE.Mesh(deck2Geo, superWhiteMat);
            deck2.position.set(0, 13.5, -4);
            root.add(deck2);

            // Iconic Funnels (collapsed on seabed)
            for (let f = 0; f < 3; f++) {
                const funnelGroup = new THREE.Group();
                funnelGroup.position.set(0, 16.5, -12 + f * 9);

                const funnelBodyGeo = new THREE.CylinderGeometry(1.8, 1.8, 7.5, 16);
                const funnelBody = new THREE.Mesh(funnelBodyGeo, funnelOchreMat);
                funnelGroup.add(funnelBody);

                const funnelTopGeo = new THREE.CylinderGeometry(1.82, 1.82, 2.2, 16);
                const funnelTop = new THREE.Mesh(funnelTopGeo, sootBlackMat);
                funnelTop.position.y = 3.6;
                funnelGroup.add(funnelTop);

                funnelGroup.rotation.z = 0.55 + f * 0.15; // tilted/fallen
                root.add(funnelGroup);
            }

            // Massive Anchor Chains on Forecastle
            const chainMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.3 });
            for (let i = 0; i < 12; i++) {
                const linkGeo = new THREE.TorusGeometry(0.6, 0.16, 8, 16);
                const link = new THREE.Mesh(linkGeo, chainMat);
                link.position.set((i % 2 === 0 ? 3 : -3), 9.2, 12 + i * 0.9);
                root.add(link);
            }

        } else {
            // B-17 FLYING FORTRESS BOMBER
            const fuselageMat = new THREE.MeshStandardMaterial({
                color: 0x3f4f38, // olive drab
                metalness: 0.75,
                roughness: 0.35
            });
            const cockpitGlassMat = new THREE.MeshPhysicalMaterial({
                color: 0x38bdf8,
                transmission: 0.8,
                transparent: true,
                opacity: 0.8,
                roughness: 0.1
            });
            const engineMat = new THREE.MeshStandardMaterial({
                color: 0x1f2937,
                metalness: 0.8,
                roughness: 0.4
            });

            // Airplane Fuselage
            const fuseGeo = new THREE.CylinderGeometry(2.2, 1.6, 30, 16);
            fuseGeo.rotateX(Math.PI / 2);
            const fuse = new THREE.Mesh(fuseGeo, fuselageMat);
            fuse.position.set(0, 3, 0);
            fuse.rotation.z = -0.15; // resting in sand
            root.add(fuse);

            // Greenhouse Cockpit Canopy
            const canopyGeo = new THREE.SphereGeometry(1.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            canopyGeo.rotateX(-Math.PI / 2);
            const canopy = new THREE.Mesh(canopyGeo, cockpitGlassMat);
            canopy.position.set(0, 4.6, 8);
            root.add(canopy);

            // Broad Swept Wings
            const wingGeo = new THREE.BoxGeometry(36, 0.6, 6);
            const wings = new THREE.Mesh(wingGeo, fuselageMat);
            wings.position.set(0, 3.4, 3);
            root.add(wings);

            // 4 Radial Engines with bent propellers
            const engineOffsets = [-12, -6, 6, 12];
            engineOffsets.forEach(ox => {
                const engGeo = new THREE.CylinderGeometry(1.0, 1.0, 2.8, 12);
                engGeo.rotateX(Math.PI / 2);
                const eng = new THREE.Mesh(engGeo, engineMat);
                eng.position.set(ox, 3.2, 5.8);
                root.add(eng);

                // Bent propeller blades
                const propHub = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), engineMat);
                propHub.position.set(ox, 3.2, 7.3);
                for (let b = 0; b < 3; b++) {
                    const bladeGeo = new THREE.BoxGeometry(0.1, 1.6, 0.25);
                    const blade = new THREE.Mesh(bladeGeo, engineMat);
                    blade.rotation.z = (b * Math.PI * 2) / 3;
                    blade.rotation.x = 0.4; // bent on seafloor crash
                    propHub.add(blade);
                }
                root.add(propHub);
            });
        }

        // Docking Beacon Holographic Ring on seafloor
        const ringGeo = new THREE.RingGeometry(6.5, 7.2, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.65
        });
        const dockBeacon = new THREE.Mesh(ringGeo, ringMat);
        dockBeacon.position.set(0, 0.3, 0);
        dockBeacon.name = 'DockBeacon';
        root.add(dockBeacon);

        return root;
    }

    // ========================================================
    // 4. CIPHER VAULTS & RELICS
    // ========================================================
    createVault(type = 'pirate') {
        const root = new THREE.Group();
        root.name = `Vault_${type}`;

        const tumblers = [];
        let lidGroup = null;
        let relicMesh = null;

        if (type === 'pirate') {
            // PIRATE TREASURE CHEST
            const woodMat = new THREE.MeshStandardMaterial({ color: 0x543d2b, roughness: 0.7 });
            const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });

            // Chest Base
            const baseGeo = new THREE.BoxGeometry(4.2, 2.2, 2.8);
            const baseMesh = new THREE.Mesh(baseGeo, woodMat);
            baseMesh.position.y = 1.1;
            root.add(baseMesh);

            // Chest Iron Bands
            for (let b = -1.6; b <= 1.6; b += 1.6) {
                const bandGeo = new THREE.BoxGeometry(0.2, 2.25, 2.85);
                const band = new THREE.Mesh(bandGeo, ironMat);
                band.position.set(b, 1.1, 0);
                root.add(band);
            }

            // Hinged Lid Group
            lidGroup = new THREE.Group();
            lidGroup.position.set(0, 2.2, -1.4); // hinge at back

            const lidGeo = new THREE.CylinderGeometry(1.4, 1.4, 4.2, 16, 1, false, 0, Math.PI);
            lidGeo.rotateZ(Math.PI / 2);
            const lidMesh = new THREE.Mesh(lidGeo, woodMat);
            lidMesh.position.set(0, 0, 1.4);
            lidGroup.add(lidMesh);
            root.add(lidGroup);

            // 4 Runic Combination Tumblers (Dials) on front
            for (let i = 0; i < 4; i++) {
                const dialGroup = new THREE.Group();
                dialGroup.position.set(-1.5 + i * 1.0, 1.3, 1.45);

                const dialGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.18, 16);
                dialGeo.rotateX(Math.PI / 2);
                const dial = new THREE.Mesh(dialGeo, goldMat);
                dialGroup.add(dial);

                // Rune glyph pip
                const pipGeo = new THREE.ConeGeometry(0.08, 0.2, 4);
                pipGeo.rotateZ(Math.PI);
                const pip = new THREE.Mesh(pipGeo, ironMat);
                pip.position.set(0, 0.24, 0.1);
                dialGroup.add(pip);

                root.add(dialGroup);
                tumblers.push(dialGroup);
            }

            // Salvaged Relic: The Heart of the Sea
            const relicGeo = new THREE.OctahedronGeometry(0.7, 2);
            const relicMat = new THREE.MeshPhysicalMaterial({
                color: 0x06b6d4,
                emissive: 0x0284c7,
                emissiveIntensity: 0.9,
                transmission: 0.85,
                roughness: 0.1
            });
            relicMesh = new THREE.Mesh(relicGeo, relicMat);
            relicMesh.position.set(0, 1.6, 0);
            relicMesh.visible = false;
            root.add(relicMesh);

        } else if (type === 'titanic') {
            // TITANIC PURSER'S SAFE
            const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.35 });
            const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });

            const safeBoxGeo = new THREE.BoxGeometry(3.6, 4.4, 3.2);
            const safeBox = new THREE.Mesh(safeBoxGeo, steelMat);
            safeBox.position.y = 2.2;
            root.add(safeBox);

            // Hinged Safe Door
            lidGroup = new THREE.Group();
            lidGroup.position.set(-1.8, 2.2, 1.6); // hinge on left

            const doorGeo = new THREE.BoxGeometry(3.4, 4.2, 0.3);
            doorGeo.translate(1.7, 0, 0);
            const door = new THREE.Mesh(doorGeo, steelMat);
            lidGroup.add(door);

            // Safe Vault Wheel Handle
            const wheelGeo = new THREE.TorusGeometry(0.65, 0.08, 8, 24);
            const wheel = new THREE.Mesh(wheelGeo, brassMat);
            wheel.position.set(1.7, 0, 0.25);
            lidGroup.add(wheel);

            root.add(lidGroup);

            // 4 Tumblers (Combination dials)
            for (let i = 0; i < 4; i++) {
                const dialGroup = new THREE.Group();
                dialGroup.position.set(-1.2 + (i % 2) * 2.4, 1.2 + Math.floor(i / 2) * 2.0, 1.7);
                const dialGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.15, 16);
                dialGeo.rotateX(Math.PI / 2);
                const dial = new THREE.Mesh(dialGeo, brassMat);
                dialGroup.add(dial);
                root.add(dialGroup);
                tumblers.push(dialGroup);
            }

            // Relic: Heart of the Ocean Diamond
            const diamondGeo = new THREE.OctahedronGeometry(0.75, 0);
            const diamondMat = new THREE.MeshPhysicalMaterial({
                color: 0x1d4ed8,
                emissive: 0x2563eb,
                emissiveIntensity: 1.0,
                transmission: 0.9,
                roughness: 0.05
            });
            relicMesh = new THREE.Mesh(diamondGeo, diamondMat);
            relicMesh.position.set(0, 2.2, 0);
            relicMesh.visible = false;
            root.add(relicMesh);

        } else {
            // B-17 FLIGHT RECORDER
            const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.5, roughness: 0.4 });
            const darkMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.3 });

            const boxGeo = new THREE.BoxGeometry(3.8, 2.4, 2.6);
            const box = new THREE.Mesh(boxGeo, orangeMat);
            box.position.y = 1.2;
            root.add(box);

            lidGroup = new THREE.Group();
            lidGroup.position.set(0, 2.4, -1.3);
            const lidGeo = new THREE.BoxGeometry(3.8, 0.3, 2.6);
            lidGeo.translate(0, 0, 1.3);
            const lid = new THREE.Mesh(lidGeo, orangeMat);
            lidGroup.add(lid);
            root.add(lidGroup);

            // 4 Dials
            for (let i = 0; i < 4; i++) {
                const dialGroup = new THREE.Group();
                dialGroup.position.set(-1.35 + i * 0.9, 1.4, 1.35);
                const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.12, 12), darkMat);
                dial.rotateX(Math.PI / 2);
                dialGroup.add(dial);
                root.add(dialGroup);
                tumblers.push(dialGroup);
            }

            // Relic: Top Secret Flight Tape Spool
            const spoolGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.4, 16);
            const spoolMat = new THREE.MeshStandardMaterial({
                color: 0xfacc15,
                metalness: 0.8,
                roughness: 0.2,
                emissive: 0xd97706,
                emissiveIntensity: 0.6
            });
            relicMesh = new THREE.Mesh(spoolGeo, spoolMat);
            relicMesh.position.set(0, 1.6, 0);
            relicMesh.visible = false;
            root.add(relicMesh);
        }

        return {
            root,
            lidGroup,
            tumblers,
            relicMesh,
            unlockTumbler: (index) => {
                if (tumblers[index]) {
                    tumblers[index].rotation.z += Math.PI * 1.5;
                }
            },
            openVault: () => {
                if (lidGroup) {
                    lidGroup.rotation.x = -Math.PI * 0.65;
                }
                if (relicMesh) {
                    relicMesh.visible = true;
                }
            }
        };
    }

    // ========================================================
    // 5. NAVAL MINES, HYDROTHERMAL VENTS, COLLECTIBLES
    // ========================================================
    createNavalMine() {
        const root = new THREE.Group();
        root.name = 'NavalMine';

        const ironMat = new THREE.MeshStandardMaterial({
            color: 0x1f2937,
            metalness: 0.85,
            roughness: 0.4
        });

        // Main Iron Sphere
        const sphereGeo = new THREE.SphereGeometry(1.6, 16, 16);
        const sphere = new THREE.Mesh(sphereGeo, ironMat);
        root.add(sphere);

        // 12 Horn Detonators around sphere
        for (let i = 0; i < 12; i++) {
            const hornGeo = new THREE.ConeGeometry(0.22, 0.9, 8);
            const horn = new THREE.Mesh(hornGeo, ironMat);
            const phi = Math.acos(-1 + (2 * i) / 12);
            const theta = Math.sqrt(12 * Math.PI) * phi;
            horn.position.setFromSphericalCoords(1.9, phi, theta);
            horn.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), horn.position.clone().normalize());
            root.add(horn);
        }

        // Center Pulsing Red Warning LED
        const ledGeo = new THREE.SphereGeometry(0.35, 12, 12);
        const ledMat = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 1.5
        });
        const led = new THREE.Mesh(ledGeo, ledMat);
        root.add(led);

        const ledLight = new THREE.PointLight(0xff0000, 1.2, 15);
        root.add(ledLight);

        // Mooring Cable extending down
        const cableGeo = new THREE.CylinderGeometry(0.06, 0.06, 24, 6);
        const cable = new THREE.Mesh(cableGeo, ironMat);
        cable.position.y = -12;
        root.add(cable);

        return {
            root,
            led,
            ledLight,
            pulseTimer: 0
        };
    }

    createHydrothermalVent() {
        const root = new THREE.Group();
        root.name = 'HydrothermalVent';

        const basaltMat = new THREE.MeshStandardMaterial({
            color: 0x18181b,
            roughness: 0.95,
            metalness: 0.1
        });

        const magmaMat = new THREE.MeshStandardMaterial({
            color: 0xea580c,
            emissive: 0xf97316,
            emissiveIntensity: 1.2
        });

        // Tall Mineral Chimney Pillar
        const chimneyGeo = new THREE.CylinderGeometry(1.2, 2.6, 14, 12);
        const chimney = new THREE.Mesh(chimneyGeo, basaltMat);
        chimney.position.y = 7;
        root.add(chimney);

        // Thermal vent crater rim at top
        const rimGeo = new THREE.TorusGeometry(1.4, 0.4, 8, 16);
        rimGeo.rotateX(Math.PI / 2);
        const rim = new THREE.Mesh(rimGeo, basaltMat);
        rim.position.y = 14;
        root.add(rim);

        // Molten thermal core at mouth
        const coreGeo = new THREE.CircleGeometry(1.1, 16);
        coreGeo.rotateX(-Math.PI / 2);
        const core = new THREE.Mesh(coreGeo, magmaMat);
        core.position.y = 13.9;
        root.add(core);

        const ventLight = new THREE.PointLight(0xf97316, 2.5, 35);
        ventLight.position.y = 14.5;
        root.add(ventLight);

        return {
            root,
            ventLight,
            topY: 14
        };
    }

    createDoubloon() {
        const root = new THREE.Group();
        root.name = 'Doubloon';

        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            metalness: 0.95,
            roughness: 0.2,
            emissive: 0xd97706,
            emissiveIntensity: 0.35
        });

        const coinGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.16, 24);
        coinGeo.rotateX(Math.PI / 2);
        const coin = new THREE.Mesh(coinGeo, goldMat);
        root.add(coin);

        // Embossed Cross / Crest Detail
        const crestGeo = new THREE.BoxGeometry(0.9, 0.2, 0.2);
        const crest1 = new THREE.Mesh(crestGeo, goldMat);
        root.add(crest1);
        const crest2 = new THREE.Mesh(crestGeo, goldMat);
        crest2.rotation.z = Math.PI / 2;
        root.add(crest2);

        return root;
    }

    createOxygenCanister() {
        const root = new THREE.Group();
        root.name = 'O2Canister';

        const tankMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            metalness: 0.8,
            roughness: 0.25,
            emissive: 0x0369a1,
            emissiveIntensity: 0.3
        });

        const brassMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.9,
            roughness: 0.2
        });

        // Twin pressurized cylinders
        for (const side of [-0.5, 0.5]) {
            const bodyGeo = new THREE.CylinderGeometry(0.45, 0.45, 2.2, 16);
            const body = new THREE.Mesh(bodyGeo, tankMat);
            body.position.x = side;
            root.add(body);

            const domeGeo = new THREE.SphereGeometry(0.45, 12, 12);
            const topDome = new THREE.Mesh(domeGeo, tankMat);
            topDome.position.set(side, 1.1, 0);
            root.add(topDome);
        }

        // Cross harness & pressure regulator valve
        const valveGeo = new THREE.BoxGeometry(1.4, 0.2, 0.4);
        const valve = new THREE.Mesh(valveGeo, brassMat);
        valve.position.y = 1.4;
        root.add(valve);

        return root;
    }

    // ========================================================
    // 6. BIOLUMINESCENT JELLYFISH & ANGLERFISH
    // ========================================================
    createJellyfish() {
        const root = new THREE.Group();
        root.name = 'BioluminescentJellyfish';

        const bellMat = new THREE.MeshPhysicalMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 0.7,
            transparent: true,
            opacity: 0.65,
            roughness: 0.1,
            transmission: 0.7
        });

        const tentacleMat = new THREE.MeshBasicMaterial({
            color: 0x818cf8,
            transparent: true,
            opacity: 0.55
        });

        // Translucent umbrella bell
        const bellGeo = new THREE.SphereGeometry(1.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8);
        bellGeo.rotateX(Math.PI);
        const bell = new THREE.Mesh(bellGeo, bellMat);
        root.add(bell);

        // 8 Trailing tentacles
        const tentacles = [];
        for (let i = 0; i < 8; i++) {
            const tGeo = new THREE.CylinderGeometry(0.04, 0.08, 4.5, 6);
            const tent = new THREE.Mesh(tGeo, tentacleMat);
            const angle = (i * Math.PI * 2) / 8;
            tent.position.set(Math.cos(angle) * 1.0, -2.4, Math.sin(angle) * 1.0);
            root.add(tent);
            tentacles.push(tent);
        }

        const jellyLight = new THREE.PointLight(0x38bdf8, 1.4, 18);
        root.add(jellyLight);

        return {
            root,
            bell,
            tentacles,
            jellyLight,
            pulsePhase: Math.random() * Math.PI * 2
        };
    }

    createAnglerfish() {
        const root = new THREE.Group();
        root.name = 'Anglerfish';

        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x1e1b4b,
            roughness: 0.85,
            metalness: 0.2
        });

        const lureMat = new THREE.MeshStandardMaterial({
            color: 0x4ade80,
            emissive: 0x22c55e,
            emissiveIntensity: 2.0
        });

        // Round monstrous body
        const bodyGeo = new THREE.SphereGeometry(1.5, 12, 12);
        bodyGeo.scale(1.4, 1.0, 0.9);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        root.add(body);

        // Tail fin
        const tailGeo = new THREE.ConeGeometry(0.8, 1.8, 8);
        tailGeo.rotateZ(Math.PI / 2);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.position.x = -2.2;
        root.add(tail);

        // Arched lure stalk (illicium) with glowing esca bulb
        const stalkGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6);
        const stalk = new THREE.Mesh(stalkGeo, bodyMat);
        stalk.position.set(1.4, 1.4, 0);
        stalk.rotation.z = -0.65;
        root.add(stalk);

        const lureGeo = new THREE.SphereGeometry(0.3, 10, 10);
        const lure = new THREE.Mesh(lureGeo, lureMat);
        lure.position.set(2.3, 2.1, 0);
        root.add(lure);

        const lureLight = new THREE.PointLight(0x22c55e, 2.0, 20);
        lureLight.position.set(2.3, 2.1, 0);
        root.add(lureLight);

        return {
            root,
            lure,
            lureLight
        };
    }
}
