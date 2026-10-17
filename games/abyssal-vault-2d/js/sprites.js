/**
 * Sprite & Graphic Rendering Helpers
 * Draws high-detail retro pixel-art entities directly onto the canvas.
 */

if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r = 0) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

export class SpriteRenderer {
    constructor() {
        // Cached offscreen canvases for pixel performance
        this.cache = {};
    }

    /**
     * Draw the Explorer Submarine
     */
    drawSubmarine(ctx, x, y, options = {}) {
        const {
            facing = 1, // 1 for right, -1 for left
            propellerAngle = 0,
            isBoosting = false,
            damaged = false,
            lightsOn = true,
            pitch = 0,
            skin = null,
            light = null
        } = options;

        const hullColor = skin?.hullColor || '#facc15';
        const hullDark = skin?.hullDark || '#d97706';
        const trimColor = skin?.trimColor || '#92400e';
        const domeColor = skin?.domeColor || '#38bdf8';

        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        ctx.scale(facing, 1);
        ctx.rotate(pitch);

        // Flash red if damaged
        if (damaged && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.fillStyle = '#ff3344';
        }

        // Submarine Dimensions: 64 x 36 approx
        // 1. Brass Propeller (at rear, x = -32)
        ctx.save();
        ctx.translate(-28, 0);
        ctx.fillStyle = trimColor;
        ctx.fillRect(-2, -6, 4, 12);
        // Propeller blades spinning
        const pLen = 14 * Math.cos(propellerAngle);
        ctx.fillStyle = hullColor;
        ctx.beginPath();
        ctx.moveTo(-1, -pLen);
        ctx.lineTo(2, 0);
        ctx.lineTo(-1, pLen);
        ctx.lineTo(-3, 0);
        ctx.fill();

        // Thruster flame/bubbles when boosting
        if (isBoosting) {
            ctx.fillStyle = '#55ddff';
            ctx.fillRect(-12 - Math.random() * 8, -4, 10, 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-8 - Math.random() * 4, -2, 6, 4);
        }
        ctx.restore();

        // 2. Main Hull Body (Customizable skin)
        // Outer dark outline
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-26, -15, 52, 30, 14);
        ctx.fill();

        // Hull base (shaded tone)
        ctx.fillStyle = hullDark;
        ctx.beginPath();
        ctx.roundRect(-24, -13, 48, 26, 12);
        ctx.fill();

        // Hull highlight (main tone)
        ctx.fillStyle = hullColor;
        ctx.beginPath();
        ctx.roundRect(-24, -13, 48, 16, 10);
        ctx.fill();

        // Upper rim / top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(-16, -11, 32, 3);

        // Keel / bottom trim
        ctx.fillStyle = trimColor;
        ctx.fillRect(-18, 9, 36, 3);

        // Rivets (pixel dots)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        for (let rx = -20; rx <= 20; rx += 8) {
            ctx.fillRect(rx, -10, 2, 2);
            ctx.fillRect(rx, 8, 2, 2);
        }

        // 3. Conning Tower / Periscope on top
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, -21, 14, 8);
        ctx.fillStyle = hullColor;
        ctx.fillRect(-4, -19, 10, 6);
        // Periscope tube
        ctx.fillStyle = trimColor;
        ctx.fillRect(0, -25, 4, 6);
        ctx.fillStyle = domeColor;
        ctx.fillRect(2, -26, 6, 4); // Periscope lens

        // 4. Observation Dome / Porthole (Glass dome at front)
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(10, 0, 9, 0, Math.PI * 2);
        ctx.fill();

        // Glass reflection / glowing cyan
        const domeGrad = ctx.createRadialGradient(8, -2, 2, 10, 0, 8);
        domeGrad.addColorStop(0, '#ffffff');
        domeGrad.addColorStop(0.5, domeColor);
        domeGrad.addColorStop(1, '#0284c7');
        ctx.fillStyle = domeGrad;
        ctx.beginPath();
        ctx.arc(10, 0, 7, 0, Math.PI * 2);
        ctx.fill();

        // Explorer silhouette inside porthole
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(9, -1, 3.5, 0, Math.PI * 2); // Head with diving cap
        ctx.fill();
        ctx.fillRect(6, 2, 7, 5); // Shoulders

        // Glass glare highlight
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7, -5, 4, 2);
        ctx.fillRect(6, -3, 2, 2);

        // 5. Heavy-Duty Searchlight at front bow (x = 26)
        ctx.fillStyle = trimColor;
        ctx.fillRect(22, 2, 6, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(26, 3, 3, 6);

        // Front bumper / salvage claw
        ctx.fillStyle = '#475569';
        ctx.fillRect(20, -10, 8, 4);
        ctx.fillRect(26, -14, 4, 6);

        ctx.restore();

        // Draw Light Cone if on
        if (lightsOn) {
            this.drawHeadlightBeam(ctx, x, y, facing, pitch, light);
        }
    }

    drawHeadlightBeam(ctx, x, y, facing, pitch, light = null) {
        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        ctx.scale(facing, 1);
        ctx.rotate(pitch);

        const inner = light?.inner || 'rgba(254, 240, 138, 0.55)';
        const mid = light?.mid || 'rgba(253, 224, 71, 0.25)';
        const outer = light?.outer || 'rgba(56, 189, 248, 0.08)';

        const beamGrad = ctx.createRadialGradient(28, 6, 5, 200, 6, 220);
        beamGrad.addColorStop(0, inner);
        beamGrad.addColorStop(0.3, mid);
        beamGrad.addColorStop(0.7, outer);
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(28, 4);
        ctx.lineTo(260, -60);
        ctx.lineTo(260, 75);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw Shipwreck Variations:
     * - 'pirate': The Cursed Pirate Galleon
     * - 'titanic': The Sunken Luxury Ocean Liner
     * - 'plane': Downed WWII Long-Range Patrol Bomber
     */
    drawShipwreck(ctx, x, y, progress = 0, shipType = 'pirate') {
        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));

        if (shipType === 'titanic') {
            this.drawTitanicShipwreck(ctx, progress);
        } else if (shipType === 'plane') {
            this.drawPlaneShipwreck(ctx, progress);
        } else {
            this.drawPirateShipwreck(ctx, progress);
        }

        ctx.restore();
    }

    drawPirateShipwreck(ctx, progress) {
        // Giant Wooden Galleon
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(-160, 80);
        ctx.lineTo(-120, -40);
        ctx.lineTo(60, -25);
        ctx.lineTo(150, -70); // Stern castle
        ctx.lineTo(170, 80);
        ctx.closePath();
        ctx.fill();

        // Rotten wood hull planks
        ctx.fillStyle = '#3b2f2f';
        ctx.beginPath();
        ctx.moveTo(-155, 76);
        ctx.lineTo(-118, -36);
        ctx.lineTo(58, -22);
        ctx.lineTo(146, -65);
        ctx.lineTo(164, 76);
        ctx.closePath();
        ctx.fill();

        // Wooden plank lines
        ctx.strokeStyle = '#231815';
        ctx.lineWidth = 3;
        for (let py = -20; py <= 60; py += 15) {
            ctx.beginPath();
            ctx.moveTo(-140 + py * 0.4, py);
            ctx.lineTo(150, py);
            ctx.stroke();
        }

        // Broken main mast with tattered pirate flag
        ctx.fillStyle = '#261b17';
        ctx.fillRect(-20, -160, 14, 140); // Mast
        ctx.fillRect(-60, -110, 90, 8); // Yardarm

        // Tattered sails
        ctx.fillStyle = '#5c544e';
        ctx.beginPath();
        ctx.moveTo(-55, -102);
        ctx.quadraticCurveTo(-15, -80, 25, -102);
        ctx.lineTo(20, -55);
        ctx.quadraticCurveTo(-20, -40, -50, -65);
        ctx.closePath();
        ctx.fill();

        // Jolly Roger skull symbol on sail
        ctx.fillStyle = '#d6d3d1';
        ctx.fillRect(-20, -85, 12, 10);
        ctx.fillRect(-18, -75, 8, 4);

        // Swaying kelp
        ctx.fillStyle = '#15803d';
        const sway = Math.sin(Date.now() / 600) * 8;
        for (let kx = -130; kx <= 130; kx += 35) {
            ctx.beginPath();
            ctx.moveTo(kx, 60);
            ctx.quadraticCurveTo(kx + sway, 10, kx - sway * 0.5, -30);
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#166534';
            ctx.stroke();
        }

        // Glowing Captain's Cabin / Vault Chamber
        this.drawVaultAirlock(ctx, 85, -20, 'chest', progress, 'CURSED CHEST');
    }

    drawTitanicShipwreck(ctx, progress) {
        // Massive Steel Ocean Liner split in two
        // Dark outer hull
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.moveTo(-180, 80);
        ctx.lineTo(-150, -30);
        ctx.lineTo(80, -30);
        ctx.lineTo(175, -50);
        ctx.lineTo(185, 80);
        ctx.closePath();
        ctx.fill();

        // Riveted steel hull plates (Black upper, rusted red keel)
        ctx.fillStyle = '#7f1d1d'; // Rusted red keel
        ctx.fillRect(-175, 30, 355, 48);

        ctx.fillStyle = '#1e293b'; // Black steel top
        ctx.fillRect(-145, -26, 315, 56);

        // Porthole windows along hull
        ctx.fillStyle = '#fef08a';
        for (let px = -130; px <= 140; px += 20) {
            ctx.fillRect(px, -15, 6, 6);
            ctx.fillRect(px, 5, 6, 6);
        }

        // White upper promenade deck structures
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-90, -65, 180, 35);
        ctx.fillStyle = '#64748b';
        for (let dx = -85; dx <= 80; dx += 15) {
            ctx.fillRect(dx, -55, 8, 12); // promenade windows
        }

        // Giant Smokestack / Funnel 1 (collapsed sideways, ochre with black top)
        ctx.save();
        ctx.translate(-40, -65);
        ctx.rotate(0.35);
        ctx.fillStyle = '#d97706'; // Ochre funnel
        ctx.fillRect(-15, -75, 30, 75);
        ctx.fillStyle = '#0f172a'; // Black soot rim
        ctx.fillRect(-15, -75, 30, 20);
        ctx.restore();

        // Smokestack 2 (broken off, lying in sand)
        ctx.save();
        ctx.translate(65, 40);
        ctx.rotate(-1.2);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-12, -50, 24, 60);
        ctx.fillStyle = '#020617';
        ctx.fillRect(-12, -50, 24, 16);
        ctx.restore();

        // Heavy anchor chain & giant iron anchor at bow
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-150, -10);
        ctx.lineTo(-175, 55);
        ctx.stroke();

        // Purser's Office / Grand Staircase Safe
        this.drawVaultAirlock(ctx, 85, -20, 'safe', progress, "PURSER'S SAFE");
    }

    drawPlaneShipwreck(ctx, progress) {
        // Downed WWII B-17 Flying Fortress Bomber
        ctx.fillStyle = '#052e16'; // Deep army green / dark outline
        ctx.beginPath();
        ctx.moveTo(-170, 70);
        ctx.lineTo(-140, -15);
        ctx.lineTo(-40, -25);
        ctx.lineTo(80, -10);
        ctx.lineTo(165, 30);
        ctx.lineTo(170, 80);
        ctx.closePath();
        ctx.fill();

        // Fuselage skin (olive drab aluminum)
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.moveTo(-165, 68);
        ctx.lineTo(-138, -12);
        ctx.lineTo(-38, -22);
        ctx.lineTo(78, -8);
        ctx.lineTo(160, 28);
        ctx.lineTo(165, 78);
        ctx.closePath();
        ctx.fill();

        // Rivet panel lines
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 2;
        for (let fx = -120; fx <= 130; fx += 30) {
            ctx.beginPath();
            ctx.moveTo(fx, -15);
            ctx.lineTo(fx - 15, 65);
            ctx.stroke();
        }

        // Giant Main Wing stretching backward
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(-80, 0);
        ctx.lineTo(-30, -95);
        ctx.lineTo(40, -90);
        ctx.lineTo(30, 10);
        ctx.closePath();
        ctx.fill();

        // Star Insignia on wing
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.arc(-2, -50, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-18, -53, 36, 6);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', -2, -50);

        // Radial Engine & 3-Blade Bent Propeller
        ctx.fillStyle = '#334155';
        ctx.fillRect(-22, -98, 26, 16);
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(-9, -98);
        ctx.lineTo(-30, -125);
        ctx.lineTo(12, -125);
        ctx.closePath();
        ctx.fill();

        // Greenhouse Cockpit Canopy (cracked glass)
        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.moveTo(-138, -10);
        ctx.lineTo(-105, -28);
        ctx.lineTo(-75, -22);
        ctx.lineTo(-100, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Bomb Bay / Flight Recorder Vault
        this.drawVaultAirlock(ctx, 85, -15, 'military', progress, 'FLIGHT VAULT');
    }

    drawVaultAirlock(ctx, x, y, style, progress, label) {
        // Golden glowing aura around the salvage vault
        const glowPulse = 0.5 + Math.sin(Date.now() / 400) * 0.3;
        const goldGlow = ctx.createRadialGradient(x, y, 5, x, y, 55);
        goldGlow.addColorStop(0, `rgba(253, 224, 71, ${glowPulse})`);
        goldGlow.addColorStop(0.5, `rgba(234, 179, 8, ${glowPulse * 0.6})`);
        goldGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = goldGlow;
        ctx.beginPath();
        ctx.arc(x, y, 55, 0, Math.PI * 2);
        ctx.fill();

        // Vault chamber opening
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(x - 20, y - 25, 40, 50);

        if (style === 'safe') {
            // Heavy steel circular safe
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.arc(x, y, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x - 2, y - 6, 4, 12);
        } else if (style === 'military') {
            // Military Flight Lockbox
            ctx.fillStyle = '#365314';
            ctx.fillRect(x - 12, y - 10, 24, 20);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(x - 10, y - 8, 20, 4);
            ctx.fillStyle = '#000000';
            ctx.fillRect(x - 3, y - 2, 6, 6);
        } else {
            // Pirate Cursed Chest
            ctx.fillStyle = '#ca8a04';
            ctx.fillRect(x - 12, y - 10, 24, 20);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(x - 10, y - 8, 20, 4);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(x - 2, y - 2, 4, 6);
        }

        // "DOCK HERE" pulsing indicator if not yet opened
        if (progress < 1) {
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            const bob = Math.sin(Date.now() / 250) * 4;
            ctx.fillText(`▼ DOCK: ${label} ▼`, x, y - 45 + bob);
        }
    }

    /**
     * Draw Hydrothermal Oxygen Vent / Air Bubble Geyser
     */
    drawOxygenVent(ctx, vent) {
        ctx.save();
        ctx.translate(Math.round(vent.x), Math.round(vent.y));

        // Volcanic Basalt Fissure
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(-30, 30);
        ctx.lineTo(-20, 0);
        ctx.lineTo(20, 0);
        ctx.lineTo(30, 30);
        ctx.closePath();
        ctx.fill();

        // Glowing mineral vent mouth
        const ventPulse = 0.6 + Math.sin(Date.now() / 300) * 0.35;
        const vGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
        vGlow.addColorStop(0, '#ffffff');
        vGlow.addColorStop(0.4, `rgba(56, 189, 248, ${ventPulse})`);
        vGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = vGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();

        // Vent label
        ctx.fillStyle = '#7dd3fc';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🫧 O₂ VENT', 0, 42);

        ctx.restore();
    }

    /**
     * Draw the Sea Monster (The Abyssal Leviathan)
     */
    drawMonster(ctx, monster) {
        if (!monster || !monster.active) return;

        const { x, y, segments = [], jawAngle = 0, facing = 1, rageMode = false } = monster;

        // Draw segmented serpentine body (from tail to neck)
        for (let i = segments.length - 1; i >= 0; i--) {
            const seg = segments[i];
            const size = 32 * (1 - i / (segments.length * 1.5)); // tapers down to tail
            ctx.save();
            ctx.translate(Math.round(seg.x), Math.round(seg.y));

            // Outer scales
            ctx.fillStyle = rageMode ? '#7f1d1d' : '#064e3b';
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();

            // Inner belly scales / bioluminescent pattern
            ctx.fillStyle = rageMode ? '#ef4444' : '#10b981';
            ctx.beginPath();
            ctx.arc(0, 2, size * 0.55, 0, Math.PI * 2);
            ctx.fill();

            // Spines along dorsal ridge
            ctx.fillStyle = rageMode ? '#fca5a5' : '#6ee7b7';
            ctx.beginPath();
            ctx.moveTo(-size * 0.3, -size);
            ctx.lineTo(0, -size * 1.4);
            ctx.lineTo(size * 0.3, -size);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        // Draw Menacing Leviathan Head
        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        ctx.scale(facing, 1);

        // Head Horns / Frills
        ctx.fillStyle = rageMode ? '#450a0a' : '#022c22';
        // Dorsal horns
        ctx.beginPath();
        ctx.moveTo(-10, -25);
        ctx.lineTo(-45, -55);
        ctx.lineTo(-20, -20);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(15, -25);
        ctx.lineTo(0, -60);
        ctx.lineTo(5, -20);
        ctx.fill();

        // Main skull / upper head
        ctx.fillStyle = rageMode ? '#991b1b' : '#065f46';
        ctx.beginPath();
        ctx.ellipse(5, -12, 45, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Crimson / Fiery Eye
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(15, -18, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = rageMode ? '#fef08a' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(15, -18, 7, 0, Math.PI * 2);
        ctx.fill();

        // Slit pupil
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(14, -23, 3, 10);

        // Eye glint
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(16, -21, 2, 2);

        // Upper Jaw & Sharp Fangs
        ctx.fillStyle = rageMode ? '#b91c1c' : '#047857';
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(50, -5);
        ctx.lineTo(38, 5);
        ctx.lineTo(-10, 5);
        ctx.closePath();
        ctx.fill();

        // Upper Teeth
        ctx.fillStyle = '#f8fafc';
        for (let tx = 0; tx <= 45; tx += 9) {
            ctx.beginPath();
            ctx.moveTo(tx, 5);
            ctx.lineTo(tx + 4, 14);
            ctx.lineTo(tx + 8, 5);
            ctx.fill();
        }

        // Lower Hinged Jaw (animated biting)
        ctx.save();
        ctx.translate(-5, 8);
        ctx.rotate(jawAngle);

        ctx.fillStyle = rageMode ? '#7f1d1d' : '#064e3b';
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(48, 8);
        ctx.lineTo(42, 20);
        ctx.lineTo(-5, 14);
        ctx.closePath();
        ctx.fill();

        // Lower razor teeth
        ctx.fillStyle = '#f8fafc';
        for (let bx = 0; bx <= 40; bx += 8) {
            ctx.beginPath();
            ctx.moveTo(bx, 2);
            ctx.lineTo(bx + 4, -8);
            ctx.lineTo(bx + 8, 2);
            ctx.fill();
        }
        ctx.restore();

        // Roar sonic shockwave particles if raging
        if (rageMode) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(45, 0, 30 + Math.random() * 25, -Math.PI / 3, Math.PI / 3);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw Swimming Marine Life (Reef fish, Jellyfish, Anglerfish)
     */
    drawFish(ctx, fish) {
        ctx.save();
        ctx.translate(Math.round(fish.x), Math.round(fish.y));
        ctx.scale(fish.facing, 1);

        if (fish.type === 'jelly') {
            // Bioluminescent pulsing jellyfish
            const pulse = Math.sin(fish.animTimer) * 0.2 + 1;
            ctx.fillStyle = 'rgba(168, 85, 247, 0.75)';
            ctx.beginPath();
            ctx.arc(0, 0, 14 * pulse, Math.PI, 0);
            ctx.closePath();
            ctx.fill();

            // Inner bell glow
            ctx.fillStyle = 'rgba(236, 72, 153, 0.8)';
            ctx.beginPath();
            ctx.arc(0, 0, 8 * pulse, Math.PI, 0);
            ctx.fill();

            // Trailing stingers
            ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
            ctx.lineWidth = 2;
            for (let ti = -8; ti <= 8; ti += 4) {
                ctx.beginPath();
                ctx.moveTo(ti, 0);
                const tentacleWiggle = Math.sin(fish.animTimer * 2 + ti) * 5;
                ctx.quadraticCurveTo(ti + tentacleWiggle, 12, ti - tentacleWiggle, 24);
                ctx.stroke();
            }
        } else if (fish.type === 'angler') {
            // Creepy deep sea angler fish
            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath();
            ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
            ctx.fill();

            // Tail fin
            ctx.beginPath();
            ctx.moveTo(-16, 0);
            ctx.lineTo(-26, -10);
            ctx.lineTo(-26, 10);
            ctx.closePath();
            ctx.fill();

            // Glowing lure stalk
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(10, -8);
            ctx.quadraticCurveTo(22, -24, 18, -18);
            ctx.stroke();

            // Bioluminescent bulb
            const lureGrad = ctx.createRadialGradient(18, -18, 1, 18, -18, 10);
            lureGrad.addColorStop(0, '#ffffff');
            lureGrad.addColorStop(0.5, '#38bdf8');
            lureGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = lureGrad;
            ctx.beginPath();
            ctx.arc(18, -18, 10, 0, Math.PI * 2);
            ctx.fill();

            // Sharp teeth
            ctx.fillStyle = '#ffffff';
            for (let t = 6; t <= 16; t += 4) {
                ctx.fillRect(t, 2, 2, 5);
            }
        } else {
            // Tropical reef fish
            ctx.fillStyle = fish.color || '#f97316';
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2);
            ctx.fill();

            // Fish tail with wiggle
            const tailWiggle = Math.sin(fish.animTimer * 5) * 4;
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-18, -7 + tailWiggle);
            ctx.lineTo(-18, 7 + tailWiggle);
            ctx.closePath();
            ctx.fill();

            // Fish eye
            ctx.fillStyle = '#000000';
            ctx.fillRect(5, -3, 2, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(6, -4, 1, 1);
        }

        ctx.restore();
    }

    /**
     * Draw Collectibles (Coins, Oxygen Bubbles, Repair Toolkits)
     */
    drawCollectible(ctx, item) {
        ctx.save();
        ctx.translate(Math.round(item.x), Math.round(item.y));

        if (item.type === 'coin') {
            const spin = Math.cos(Date.now() / 200);
            ctx.scale(spin, 1);
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ca8a04';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
        } else if (item.type === 'oxygen') {
            // Oxygen bubble canister
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('O₂', 0, 0);
        } else if (item.type === 'repair') {
            // Repair wrench
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(0, 0, 9, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-2, -6, 4, 12);
            ctx.fillRect(-5, -6, 10, 3);
        } else if (item.type === 'torpedo_pickup') {
            // Sonic Torpedo ammo
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-8, -4, 16, 8);
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.moveTo(8, -4);
            ctx.lineTo(13, 0);
            ctx.lineTo(8, 4);
            ctx.fill();
        }

        ctx.restore();
    }
}
