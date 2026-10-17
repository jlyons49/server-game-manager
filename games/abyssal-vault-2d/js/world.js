/**
 * World & Ocean Environment Manager
 * Handles depth zones, terrain caverns, particles, collectibles, hazards, and torpedoes.
 */

export class World {
    constructor(shipType = 'pirate') {
        this.width = 720;
        this.height = 2400;
        this.surfaceY = 60;
        this.seafloorY = 2260;
        this.shipType = shipType;
        this.shipwreck = {
            x: 360,
            y: 2160,
            dockRadius: 75,
            looted: false,
            type: shipType
        };

        this.particles = [];
        this.collectibles = [];
        this.hazards = [];
        this.torpedoes = [];
        this.marineLife = [];
        this.caverns = [];
        this.oxygenVents = [];

        this.initWorld(shipType);
    }

    initWorld(shipType = 'pirate') {
        this.shipType = shipType;
        this.shipwreck = {
            x: 360,
            y: 2160,
            dockRadius: 75,
            looted: false,
            type: shipType
        };

        this.particles = [];
        this.collectibles = [];
        this.hazards = [];
        this.torpedoes = [];
        this.marineLife = [];
        this.caverns = [];
        this.oxygenVents = [
            { x: 150, y: 460, radius: 50 },
            { x: 560, y: 920, radius: 50 },
            { x: 190, y: 1400, radius: 50 },
            { x: 530, y: 1880, radius: 50 }
        ];

        // Ambient marine snow particles
        for (let i = 0; i < 90; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: 0.2 + Math.random() * 0.5,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.6 + 0.2,
                type: 'snow'
            });
        }

        // Generate Cavern Pillars / Rocky Outcrops
        // Level design provides clear navigation paths with strategic obstacles
        const pillarYPositions = [280, 520, 800, 1080, 1360, 1640, 1880];
        pillarYPositions.forEach((py, idx) => {
            // Alternate left wall, right wall, or center floating spire
            if (idx % 3 === 0) {
                // Left rocky shelf
                this.caverns.push({
                    x: 0,
                    y: py,
                    width: 140 + Math.random() * 50,
                    height: 80,
                    color: '#1e293b'
                });
            } else if (idx % 3 === 1) {
                // Right rocky shelf
                const w = 150 + Math.random() * 50;
                this.caverns.push({
                    x: this.width - w,
                    y: py,
                    width: w,
                    height: 80,
                    color: '#1e293b'
                });
            } else {
                // Center floating spire / sea arch
                this.caverns.push({
                    x: 240 + (idx % 2 === 0 ? 60 : -60),
                    y: py,
                    width: 120,
                    height: 65,
                    color: '#0f172a'
                });
            }
        });

        // Spawn Collectibles (Coins, Oxygen, Repair kits, Torpedo ammo)
        for (let y = 180; y < 2050; y += 75) {
            // Gold coins
            const coinCount = Math.floor(Math.random() * 2) + 1;
            for (let c = 0; c < coinCount; c++) {
                this.collectibles.push({
                    x: 60 + Math.random() * (this.width - 120),
                    y: y + Math.random() * 40,
                    type: 'coin',
                    collected: false
                });
            }

            // Oxygen Canisters (frequent along descent for easy recharge)
            if (y % 150 === 0) {
                this.collectibles.push({
                    x: 80 + Math.random() * (this.width - 160),
                    y: y,
                    type: 'oxygen',
                    collected: false
                });
            }

            // Repair toolkits
            if (y % 300 === 0) {
                this.collectibles.push({
                    x: 80 + Math.random() * (this.width - 160),
                    y: y + 20,
                    type: 'repair',
                    collected: false
                });
            }

            // Torpedo ammo crates
            if (y % 450 === 0) {
                this.collectibles.push({
                    x: 80 + Math.random() * (this.width - 160),
                    y: y,
                    type: 'torpedo_pickup',
                    collected: false
                });
            }
        }

        // Spawn Hazards (Spiked Sea Mines in deeper waters)
        for (let y = 450; y < 2000; y += 170) {
            this.hazards.push({
                x: 80 + Math.random() * (this.width - 160),
                y: y,
                originX: 80 + Math.random() * (this.width - 160),
                type: 'mine',
                radius: 14,
                floatSpeed: 0.02 + Math.random() * 0.02,
                floatOffset: Math.random() * Math.PI * 2,
                health: 1
            });
        }

        // Spawn Marine Life
        // Sunlit zone: colorful fish
        for (let i = 0; i < 18; i++) {
            this.marineLife.push({
                x: Math.random() * this.width,
                y: 100 + Math.random() * 450,
                vx: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8),
                facing: 1,
                animTimer: Math.random() * 10,
                type: 'fish',
                color: ['#f97316', '#eab308', '#06b6d4', '#ec4899'][Math.floor(Math.random() * 4)]
            });
        }

        // Twilight zone: Jellyfish
        for (let i = 0; i < 12; i++) {
            this.marineLife.push({
                x: 60 + Math.random() * (this.width - 120),
                y: 600 + Math.random() * 800,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -0.3 + (Math.random() - 0.5) * 0.2,
                facing: 1,
                animTimer: Math.random() * 10,
                type: 'jelly'
            });
        }

        // Abyssal zone: Anglerfish
        for (let i = 0; i < 7; i++) {
            this.marineLife.push({
                x: 60 + Math.random() * (this.width - 120),
                y: 1500 + Math.random() * 600,
                vx: (Math.random() > 0.5 ? 1 : -1) * 0.6,
                facing: 1,
                animTimer: Math.random() * 10,
                type: 'angler'
            });
        }
    }

    addBubble(x, y, vx = 0, vy = -1, size = 3) {
        this.particles.push({
            x,
            y,
            vx: vx + (Math.random() - 0.5) * 0.6,
            vy: vy - Math.random() * 0.8,
            size: size + Math.random() * 2,
            alpha: 0.8,
            type: 'bubble'
        });
    }

    addSparkles(x, y, count = 8, color = '#fef08a') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 1.5 + Math.random() * 3;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                size: Math.random() * 3 + 2,
                alpha: 1.0,
                color,
                type: 'sparkle'
            });
        }
    }

    fireTorpedo(sub) {
        if (sub.torpedoes <= 0) return false;
        sub.torpedoes--;

        const angle = sub.facing === 1 ? 0 : Math.PI;
        const speed = 7.5;
        this.torpedoes.push({
            x: sub.x + (sub.facing * 28),
            y: sub.y + 4,
            vx: Math.cos(angle) * speed,
            vy: (Math.random() - 0.5) * 0.3,
            life: 140
        });
        return true;
    }

    update(dt = 1) {
        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.type === 'snow') {
                if (p.y > this.height) p.y = 0;
                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
            } else if (p.type === 'bubble') {
                p.alpha -= 0.015 * dt;
                p.size = Math.max(0.5, p.size - 0.02 * dt);
                if (p.alpha <= 0 || p.y < 0) {
                    this.particles.splice(i, 1);
                }
            } else if (p.type === 'sparkle') {
                p.alpha -= 0.03 * dt;
                p.vx *= 0.94;
                p.vy *= 0.94;
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }

        // Update Marine Life
        this.marineLife.forEach(creature => {
            creature.x += creature.vx * dt;
            if (creature.vy) creature.y += creature.vy * dt;
            creature.animTimer += 0.05 * dt;

            if (creature.vx !== 0) {
                creature.facing = creature.vx > 0 ? 1 : -1;
            }

            // Boundary bounce
            if (creature.x < 20) {
                creature.x = 20;
                creature.vx *= -1;
            } else if (creature.x > this.width - 20) {
                creature.x = this.width - 20;
                creature.vx *= -1;
            }
        });

        // Update Hazards (Mines floating gently)
        this.hazards.forEach(h => {
            if (h.type === 'mine') {
                h.floatOffset += h.floatSpeed * dt;
                h.y += Math.sin(h.floatOffset) * 0.4;
            }
        });

        // Oxygen vents emit bubble columns
        this.oxygenVents.forEach(vent => {
            if (Math.random() < 0.35) {
                this.addBubble(
                    vent.x + (Math.random() - 0.5) * 20,
                    vent.y - 4,
                    (Math.random() - 0.5) * 0.4,
                    -2.5 - Math.random() * 1.5,
                    3.5
                );
            }
        });

        // Update Torpedoes
        for (let i = this.torpedoes.length - 1; i >= 0; i--) {
            const t = this.torpedoes[i];
            t.x += t.vx * dt;
            t.y += t.vy * dt;
            t.life -= dt;

            // Bubble wake
            if (Math.random() < 0.5) {
                this.addBubble(t.x - t.vx, t.y, -t.vx * 0.2, 0, 2);
            }

            if (t.life <= 0 || t.x < 0 || t.x > this.width || t.y < 0 || t.y > this.height) {
                this.torpedoes.splice(i, 1);
            }
        }
    }

    /**
     * Check collisions between submarine, caverns, hazards, and items
     */
    checkCollisions(sub, onCollect, onDamage, onMineExplode) {
        // Check Hydrothermal Oxygen Vents and surface aeration
        let inOxygenZone = false;
        this.oxygenVents.forEach(vent => {
            const dist = Math.hypot(sub.x - vent.x, sub.y - vent.y);
            if (dist < vent.radius + 28) {
                inOxygenZone = true;
                sub.replenishOxygen(0.85);
                if (Math.random() < 0.2) {
                    this.addSparkles(sub.x, sub.y, 2, '#38bdf8');
                }
            }
        });

        if (sub.y <= 90) {
            inOxygenZone = true;
            sub.replenishOxygen(1.2);
        }

        sub.isRechargingOxygen = inOxygenZone;

        // Collectibles
        this.collectibles.forEach(item => {
            if (!item.collected) {
                const dist = Math.hypot(sub.x - item.x, sub.y - item.y);
                if (dist < 26) {
                    item.collected = true;
                    this.addSparkles(item.x, item.y, 8, item.type === 'coin' ? '#fef08a' : '#38bdf8');
                    onCollect(item);
                }
            }
        });

        // Cavern Walls / Spires / Solid Blocks (Impassable Solid Barriers)
        const halfW = sub.width / 2;
        const halfH = sub.height / 2;

        this.caverns.forEach(c => {
            const overlapLeft = (sub.x + halfW) - c.x;
            const overlapRight = (c.x + c.width) - (sub.x - halfW);
            const overlapTop = (sub.y + halfH) - c.y;
            const overlapBottom = (c.y + c.height) - (sub.y - halfH);

            if (overlapLeft > 0 && overlapRight > 0 && overlapTop > 0 && overlapBottom > 0) {
                // Determine minimum penetration depth to push submarine completely out of block
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapLeft) {
                    sub.x = c.x - halfW;
                    if (sub.vx > 0) sub.vx = 0;
                } else if (minOverlap === overlapRight) {
                    sub.x = c.x + c.width + halfW;
                    if (sub.vx < 0) sub.vx = 0;
                } else if (minOverlap === overlapTop) {
                    sub.y = c.y - halfH;
                    if (sub.vy > 0) sub.vy = 0;
                } else if (minOverlap === overlapBottom) {
                    sub.y = c.y + c.height + halfH;
                    if (sub.vy < 0) sub.vy = 0;
                }

                // Inflict contact collision damage
                const damaged = sub.takeDamage(12);
                if (damaged) {
                    onDamage('rock');
                }
            }
        });

        // Seafloor sand solid barrier
        if (sub.y + halfH > this.seafloorY) {
            sub.y = this.seafloorY - halfH;
            if (sub.vy > 0) sub.vy = 0;
        }

        // Hazards (Mines: 2x Lethal Damage = 50 dmg)
        for (let i = this.hazards.length - 1; i >= 0; i--) {
            const h = this.hazards[i];
            const dist = Math.hypot(sub.x - h.x, sub.y - h.y);
            if (dist < h.radius + 18) {
                // Detonate mine!
                this.addSparkles(h.x, h.y, 22, '#f97316');
                this.hazards.splice(i, 1);

                // Explosive blast knockback
                const blastAngle = Math.atan2(sub.y - h.y, sub.x - h.x);
                sub.vx += Math.cos(blastAngle) * 5;
                sub.vy += Math.sin(blastAngle) * 5;

                // 2x damage: 50 damage (half max hull integrity!)
                sub.takeDamage(50);
                onMineExplode(h);
            }
        }

        // Torpedoes vs Hazards & Caverns
        for (let ti = this.torpedoes.length - 1; ti >= 0; ti--) {
            const t = this.torpedoes[ti];
            let exploded = false;

            // Torpedo vs Mine
            for (let hi = this.hazards.length - 1; hi >= 0; hi--) {
                const h = this.hazards[hi];
                if (Math.hypot(t.x - h.x, t.y - h.y) < h.radius + 12) {
                    this.addSparkles(h.x, h.y, 14, '#ef4444');
                    this.hazards.splice(hi, 1);
                    exploded = true;
                    onMineExplode(h);
                    break;
                }
            }

            // Torpedo vs Caverns
            if (!exploded) {
                for (const c of this.caverns) {
                    if (t.x >= c.x && t.x <= c.x + c.width && t.y >= c.y && t.y <= c.y + c.height) {
                        this.addSparkles(t.x, t.y, 8, '#94a3b8');
                        exploded = true;
                        break;
                    }
                }
            }

            if (exploded) {
                this.torpedoes.splice(ti, 1);
            }
        }
    }

    /**
     * Check if submarine has reached the shipwreck docking zone
     */
    isSubmarineAtShipwreck(sub) {
        if (this.shipwreck.looted) return false;
        const dist = Math.hypot(sub.x - (this.shipwreck.x + 85), sub.y - (this.shipwreck.y - 20));
        return dist < this.shipwreck.dockRadius;
    }

    /**
     * Draw Background Water Gradient & Depth Zones
     */
    drawBackground(ctx, cameraY, viewportHeight) {
        // Dynamic water gradient based on depth
        const grad = ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0.0, '#38bdf8'); // Surface sky blue
        grad.addColorStop(0.08, '#0284c7'); // Sunlit top
        grad.addColorStop(0.28, '#0369a1'); // Upper blue
        grad.addColorStop(0.55, '#0f172a'); // Twilight zone
        grad.addColorStop(0.85, '#020617'); // Abyssal midnight
        grad.addColorStop(1.0, '#000000'); // Bottom trench

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Sunbeams at the surface (y: 0 to 400)
        if (cameraY < 400) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - cameraY / 400) * 0.35;
            ctx.fillStyle = '#ffffff';
            for (let bx = 50; bx < this.width; bx += 90) {
                const slant = Math.sin(Date.now() / 1500 + bx) * 20;
                ctx.beginPath();
                ctx.moveTo(bx, 0);
                ctx.lineTo(bx + 40, 0);
                ctx.lineTo(bx + 70 + slant, 400);
                ctx.lineTo(bx + 10 + slant, 400);
                ctx.fill();
            }
            ctx.restore();
        }

        // Surface water ripple line (y = 50)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let rx = 0; rx < this.width; rx += 20) {
            const wave = Math.sin(Date.now() / 300 + rx * 0.1) * 3;
            ctx.fillRect(rx, 50 + wave, 14, 2);
        }

        // Seabed / Seafloor Sand and Volcanic Rocks (y = 2260)
        ctx.fillStyle = '#1e1b18';
        ctx.fillRect(0, this.seafloorY, this.width, this.height - this.seafloorY);
        ctx.fillStyle = '#292524';
        for (let bx = 0; bx < this.width; bx += 25) {
            const hill = Math.sin(bx * 0.05) * 12;
            ctx.fillRect(bx, this.seafloorY - 8 + hill, 25, 20);
        }
    }

    /**
     * Draw Caverns and Hazards
     */
    drawCavernsAndHazards(ctx, sprites = null) {
        // Hydrothermal Oxygen Vents
        if (sprites && sprites.drawOxygenVent) {
            this.oxygenVents.forEach(vent => {
                sprites.drawOxygenVent(ctx, vent);
            });
        }

        // Cavern spires
        this.caverns.forEach(c => {
            ctx.fillStyle = c.color;
            ctx.beginPath();
            ctx.roundRect(c.x, c.y, c.width, c.height, 8);
            ctx.fill();

            // Coral / crystal moss accents
            ctx.fillStyle = '#059669';
            ctx.fillRect(c.x + 8, c.y, Math.min(25, c.width - 16), 3);
            ctx.fillRect(c.x + c.width - 24, c.y, 16, 3);
        });

        // Hazards (Mines)
        this.hazards.forEach(h => {
            if (h.type === 'mine') {
                ctx.save();
                ctx.translate(Math.round(h.x), Math.round(h.y));

                // Anchor cable going down
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, 60);
                ctx.stroke();

                // Mine ball
                ctx.fillStyle = '#334155';
                ctx.beginPath();
                ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
                ctx.fill();

                // Spikes
                ctx.fillStyle = '#dc2626';
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
                    const sx = Math.cos(a) * (h.radius + 6);
                    const sy = Math.sin(a) * (h.radius + 6);
                    ctx.beginPath();
                    ctx.arc(sx, sy, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Blinking red warning diode
                const blink = Math.sin(Date.now() / 200) > 0;
                ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        });

        // Torpedo projectiles
        this.torpedoes.forEach(t => {
            ctx.save();
            ctx.translate(Math.round(t.x), Math.round(t.y));
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(-8, -3, 16, 6);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(5, -2, 4, 4);
            ctx.restore();
        });
    }

    /**
     * Draw Particles (marine snow, bubbles, sparkles)
     */
    drawParticles(ctx) {
        this.particles.forEach(p => {
            if (p.type === 'snow') {
                ctx.fillStyle = `rgba(224, 242, 254, ${p.alpha})`;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            } else if (p.type === 'bubble') {
                ctx.strokeStyle = `rgba(186, 230, 253, ${p.alpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.stroke();
            } else if (p.type === 'sparkle') {
                ctx.fillStyle = p.color || '#fef08a';
                ctx.globalAlpha = p.alpha;
                ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
                ctx.globalAlpha = 1.0;
            }
        });
    }

    /**
     * Draw Sonar Wave Overlay
     */
    drawSonar(ctx, sub) {
        if (!sub.sonarActive) return;
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sub.x, sub.y, sub.sonarRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(186, 230, 253, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sub.x, sub.y, Math.max(0, sub.sonarRadius - 20), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}
