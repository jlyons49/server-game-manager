/**
 * Sea Monster (The Abyssal Leviathan)
 * Multi-segmented predatory boss that chases the player on their return ascent.
 */

export class SeaMonster {
    constructor() {
        this.reset();
    }

    reset() {
        this.active = false;
        this.x = 240;
        this.y = 2200; // starts deep below
        this.vx = 0;
        this.vy = 0;
        this.speed = 2.4;
        this.chargeSpeed = 6.2;
        this.jawAngle = 0;
        this.facing = 1;

        // Segments for undulating body (12 articulated vertebrae)
        this.segments = [];
        const segmentCount = 12;
        for (let i = 0; i < segmentCount; i++) {
            this.segments.push({
                x: this.x,
                y: this.y + (i + 1) * 26
            });
        }

        // State machine
        // 'stalking', 'warning', 'charging', 'stunned'
        this.state = 'stalking';
        this.stateTimer = 0;
        this.chargeWarningDuration = 70; // frames
        this.chargeDuration = 90;
        this.stunDuration = 120;
        this.rageMode = false;
        this.jawCycle = 0;
    }

    spawn(initialX, initialY) {
        this.active = true;
        this.x = initialX;
        this.y = initialY;
        this.segments.forEach(seg => {
            seg.x = this.x;
            seg.y = this.y + 40;
        });
        this.state = 'stalking';
        this.stateTimer = 0;
        this.rageMode = false;
    }

    update(targetSub, worldBounds, dt = 1) {
        if (!this.active) return;

        this.jawCycle += 0.08 * dt;
        this.jawAngle = Math.sin(this.jawCycle) * 0.35 + 0.1;

        // State handling
        if (this.state === 'stalking') {
            this.rageMode = false;
            // Chase player steadily upward
            const dx = targetSub.x - this.x;
            const dy = (targetSub.y + 110) - this.y; // try to stay right below/behind
            const dist = Math.hypot(dx, dy);

            this.facing = dx >= 0 ? 1 : -1;

            if (dist > 10) {
                this.vx += (dx / dist) * 0.15 * dt;
                this.vy += (dy / dist) * 0.18 * dt;
            }

            // Cap stalking speed
            const currentSpeed = Math.hypot(this.vx, this.vy);
            if (currentSpeed > this.speed) {
                this.vx = (this.vx / currentSpeed) * this.speed;
                this.vy = (this.vy / currentSpeed) * this.speed;
            }

            this.stateTimer += dt;
            // Charge trigger every ~5-8 seconds
            if (this.stateTimer > 280) {
                this.state = 'warning';
                this.stateTimer = 0;
            }

        } else if (this.state === 'warning') {
            // Telegraphed roar / preparing lunge
            this.rageMode = true;
            this.vx *= 0.85;
            this.vy *= 0.85;

            // Face target directly
            this.facing = (targetSub.x - this.x) >= 0 ? 1 : -1;
            this.jawAngle = 0.55 + Math.random() * 0.2; // wide open jaws

            this.stateTimer += dt;
            if (this.stateTimer >= this.chargeWarningDuration) {
                this.state = 'charging';
                this.stateTimer = 0;

                // Burst toward player's current location with massive speed
                const cdx = targetSub.x - this.x;
                const cdy = targetSub.y - this.y;
                const cDist = Math.hypot(cdx, cdy) || 1;
                this.vx = (cdx / cDist) * this.chargeSpeed;
                this.vy = (cdy / cDist) * this.chargeSpeed;
            }

        } else if (this.state === 'charging') {
            this.rageMode = true;
            this.jawAngle = 0.45;

            this.stateTimer += dt;
            if (this.stateTimer >= this.chargeDuration) {
                this.state = 'stalking';
                this.stateTimer = 0;
            }

        } else if (this.state === 'stunned') {
            this.rageMode = false;
            this.vx *= 0.9;
            this.vy = 1.0; // slowly sinks backwards

            this.stateTimer += dt;
            if (this.stateTimer >= this.stunDuration) {
                this.state = 'stalking';
                this.stateTimer = 0;
            }
        }

        // Move Head
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Keep horizontal within world
        this.x = Math.max(30, Math.min(worldBounds.width - 30, this.x));

        // Update body segments following each other like a chain
        let prevX = this.x;
        let prevY = this.y;
        const segmentSpacing = 22;

        for (let i = 0; i < this.segments.length; i++) {
            const seg = this.segments[i];
            const sx = prevX - seg.x;
            const sy = prevY - seg.y;
            const dist = Math.hypot(sx, sy) || 1;

            if (dist > segmentSpacing) {
                const angle = Math.atan2(sy, sx);
                seg.x = prevX - Math.cos(angle) * segmentSpacing;
                seg.y = prevY - Math.sin(angle) * segmentSpacing;
            }

            prevX = seg.x;
            prevY = seg.y;
        }
    }

    stun() {
        this.state = 'stunned';
        this.stateTimer = 0;
        this.rageMode = false;
    }

    checkPlayerCollision(sub) {
        if (!this.active || this.state === 'stunned') return false;

        // Check head collision
        const headDist = Math.hypot(this.x - sub.x, this.y - sub.y);
        if (headDist < 46) {
            return true;
        }

        // Check front body segments
        for (let i = 0; i < 4; i++) {
            const seg = this.segments[i];
            const segDist = Math.hypot(seg.x - sub.x, seg.y - sub.y);
            if (segDist < 36) {
                return true;
            }
        }

        return false;
    }
}
