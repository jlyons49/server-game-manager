/**
 * Submarine Player Class
 * Controls movement, physics, headlights, propulsion, and health.
 */

export class Submarine {
    constructor(x, y) {
        this.reset(x, y);
    }

    reset(x = 240, y = 60) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.maxSpeed = 3.6;
        this.boostMultiplier = 1.9;
        this.accel = 0.22;
        this.friction = 0.94;
        this.facing = 1; // 1 = right, -1 = left
        this.pitch = 0;
        this.propellerAngle = 0;

        // Stats
        this.maxHealth = 100;
        this.health = 100;
        this.maxOxygen = 100;
        this.oxygen = 100;
        this.maxBoost = 100;
        this.boost = 100;
        this.isBoosting = false;

        this.torpedoes = 3;
        this.maxTorpedoes = 5;

        // Status effects
        this.invulnerableTimer = 0;
        this.sonarTimer = 0;
        this.sonarActive = false;
        this.sonarRadius = 0;

        // Collision bounds (relative to center)
        this.width = 48;
        this.height = 24;
    }

    update(input, bounds, dt = 1) {
        // Handle Invulnerability Timer
        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer -= dt;
        }

        // Handle Boost
        if (input.boost && this.boost > 5) {
            this.isBoosting = true;
            this.boost = Math.max(0, this.boost - 0.7 * dt);
        } else {
            this.isBoosting = false;
            this.boost = Math.min(this.maxBoost, this.boost + 0.25 * dt);
        }

        const currentMaxSpeed = this.isBoosting ? this.maxSpeed * this.boostMultiplier : this.maxSpeed;
        const currentAccel = this.isBoosting ? this.accel * 1.5 : this.accel;

        // Directional Acceleration
        if (input.left) {
            this.vx -= currentAccel * dt;
            this.facing = -1;
        }
        if (input.right) {
            this.vx += currentAccel * dt;
            this.facing = 1;
        }
        if (input.up) {
            this.vy -= currentAccel * dt;
        }
        if (input.down) {
            this.vy += currentAccel * dt;
        }

        // Apply friction
        this.vx *= Math.pow(this.friction, dt);
        this.vy *= Math.pow(this.friction, dt);

        // Clamp speed
        const speed = Math.hypot(this.vx, this.vy);
        if (speed > currentMaxSpeed) {
            const ratio = currentMaxSpeed / speed;
            this.vx *= ratio;
            this.vy *= ratio;
        }

        // Integrate Position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Pitch based on vertical movement
        const targetPitch = (this.vy / this.maxSpeed) * 0.22 * this.facing;
        this.pitch += (targetPitch - this.pitch) * 0.15;

        // Propeller spin
        const spinSpeed = Math.max(0.1, speed * 0.3) * (this.isBoosting ? 2.5 : 1);
        this.propellerAngle += spinSpeed * dt;

        // Keep within world horizontal bounds
        if (this.x < 30) {
            this.x = 30;
            this.vx = 0;
        }
        if (this.x > bounds.width - 30) {
            this.x = bounds.width - 30;
            this.vx = 0;
        }

        // Vertical boundary limits
        if (this.y < bounds.minY) {
            this.y = bounds.minY;
            this.vy = 0;
        }
        if (this.y > bounds.maxY) {
            this.y = bounds.maxY;
            this.vy = 0;
        }

        // Update Sonar
        if (this.sonarActive) {
            this.sonarRadius += 7 * dt;
            if (this.sonarRadius > 380) {
                this.sonarActive = false;
                this.sonarRadius = 0;
            }
        }
    }

    triggerSonar() {
        if (!this.sonarActive) {
            this.sonarActive = true;
            this.sonarRadius = 10;
            return true;
        }
        return false;
    }

    takeDamage(amount) {
        if (this.invulnerableTimer > 0) return false;
        this.health = Math.max(0, this.health - amount);
        this.invulnerableTimer = 60; // ~1 sec invulnerability
        return true;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    replenishOxygen(amount) {
        this.oxygen = Math.min(this.maxOxygen, this.oxygen + amount);
    }

    addTorpedo(amount = 1) {
        this.torpedoes = Math.min(this.maxTorpedoes, this.torpedoes + amount);
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}
