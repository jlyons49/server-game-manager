/**
 * Progression & Cosmetics Manager for Abyssal Vault 3D
 * Handles persistent doubloon wallet, cosmetics shop (3D skins, volumetric lights), and rank XP.
 */

export const SKINS = {
    classic: {
        id: 'classic',
        name: 'Classic Nautilus',
        cost: 0,
        desc: 'Traditional brass plating, exploration yellow hull, and riveted steel.',
        hullColor: 0xfacc15,
        hullDark: 0xd97706,
        trimColor: 0x92400e,
        domeColor: 0x38bdf8,
        metalness: 0.65,
        roughness: 0.35,
        emissive: 0x000000,
        emissiveIntensity: 0.0
    },
    stealth: {
        id: 'stealth',
        name: 'Stealth Spectre',
        cost: 100,
        desc: 'Matte midnight onyx with luminous electric cyan bioluminescent trim.',
        hullColor: 0x111827,
        hullDark: 0x030712,
        trimColor: 0x06b6d4,
        domeColor: 0x38bdf8,
        metalness: 0.3,
        roughness: 0.7,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.4
    },
    coral: {
        id: 'coral',
        name: 'Coral Explorer',
        cost: 200,
        desc: 'Vibrant tropical reef aqua with magenta racing stripes and pearlescent glaze.',
        hullColor: 0x06b6d4,
        hullDark: 0x0891b2,
        trimColor: 0xec4899,
        domeColor: 0xf472b6,
        metalness: 0.4,
        roughness: 0.25,
        emissive: 0xec4899,
        emissiveIntensity: 0.2
    },
    inferno: {
        id: 'inferno',
        name: 'Volcanic Magma',
        cost: 350,
        desc: 'Basalt volcanic hull with molten lava core lines and fire amber glow.',
        hullColor: 0x27272a,
        hullDark: 0x18181b,
        trimColor: 0xf97316,
        domeColor: 0xfdba74,
        metalness: 0.5,
        roughness: 0.6,
        emissive: 0xea580c,
        emissiveIntensity: 0.65
    },
    gold: {
        id: 'gold',
        name: '24K Sovereign',
        cost: 600,
        desc: 'Solid mirror-polished 24-karat gold hull forged for abyssal royalty.',
        hullColor: 0xffd700,
        hullDark: 0xd4af37,
        trimColor: 0xfff0aa,
        domeColor: 0xe0f2fe,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0xca8a04,
        emissiveIntensity: 0.15
    }
};

export const HEADLIGHT_COLORS = {
    yellow: {
        id: 'yellow',
        name: 'Warm Halogen',
        cost: 0,
        colorHex: 0xfef08a,
        lightColor: 0xfffae0,
        beamColor: 0xffea75,
        coneOpacity: 0.18,
        desc: 'Classic high-penetration warm incandescent halogen beam.'
    },
    cyan: {
        id: 'cyan',
        name: 'Bioluminescent Cyan',
        cost: 60,
        colorHex: 0x38bdf8,
        lightColor: 0x7dd3fc,
        beamColor: 0x38bdf8,
        coneOpacity: 0.22,
        desc: 'Deep-sea azure beam matched to abyssal bioluminescence.'
    },
    green: {
        id: 'green',
        name: 'Emerald Sonar',
        cost: 80,
        colorHex: 0x22c55e,
        lightColor: 0x86efac,
        beamColor: 0x22c55e,
        coneOpacity: 0.24,
        desc: 'High-contrast military emerald sonar laser illuminator.'
    },
    purple: {
        id: 'purple',
        name: 'Ultraviolet Neon',
        cost: 120,
        colorHex: 0xa855f7,
        lightColor: 0xd8b4fe,
        beamColor: 0xc084fc,
        coneOpacity: 0.25,
        desc: 'Fluorescent deep ultraviolet frequency for detecting ancient runes.'
    }
};

export const RANKS = [
    { level: 1, name: 'Cabin Boy', minXp: 0, icon: '🪣' },
    { level: 2, name: 'Deckhand Diver', minXp: 1000, icon: '🤿' },
    { level: 3, name: 'Deep Sea Apprentice', minXp: 2600, icon: '⚓' },
    { level: 4, name: 'Oceanic Explorer', minXp: 5200, icon: '🧭' },
    { level: 5, name: 'Trench Navigator', minXp: 9000, icon: '🗺️' },
    { level: 6, name: 'Submarine Commander', minXp: 15000, icon: '🎖️' },
    { level: 7, name: 'Abyssal Master', minXp: 23000, icon: '👑' },
    { level: 8, name: 'Legendary Sea Lord', minXp: 34000, icon: '🔱' }
];

export class ProgressionManager {
    constructor() {
        this.doubloons = 0;
        this.xp = 0;
        this.victories = 0;
        this.unlockedSkins = ['classic'];
        this.activeSkin = 'classic';
        this.unlockedLights = ['yellow'];
        this.activeLight = 'yellow';

        this.load();
    }

    load() {
        try {
            const data = localStorage.getItem('abyssal_vault_3d_progression');
            if (data) {
                const parsed = JSON.parse(data);
                this.doubloons = parsed.doubloons || 0;
                this.xp = parsed.xp || 0;
                this.victories = parsed.victories || 0;
                this.unlockedSkins = parsed.unlockedSkins || ['classic'];
                this.activeSkin = parsed.activeSkin || 'classic';
                this.unlockedLights = parsed.unlockedLights || ['yellow'];
                this.activeLight = parsed.activeLight || 'yellow';
            }
        } catch (e) {
            console.warn('Could not load progression data', e);
        }
    }

    save() {
        try {
            const data = {
                doubloons: this.doubloons,
                xp: this.xp,
                victories: this.victories,
                unlockedSkins: this.unlockedSkins,
                activeSkin: this.activeSkin,
                unlockedLights: this.unlockedLights,
                activeLight: this.activeLight
            };
            localStorage.setItem('abyssal_vault_3d_progression', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save progression data', e);
        }
    }

    addDoubloons(amount) {
        this.doubloons += amount;
        this.save();
    }

    spendDoubloons(amount) {
        if (this.doubloons >= amount) {
            this.doubloons -= amount;
            this.save();
            return true;
        }
        return false;
    }

    buySkin(skinId) {
        const skin = SKINS[skinId];
        if (!skin || this.unlockedSkins.includes(skinId)) return false;
        if (this.spendDoubloons(skin.cost)) {
            this.unlockedSkins.push(skinId);
            this.activeSkin = skinId;
            this.save();
            return true;
        }
        return false;
    }

    equipSkin(skinId) {
        if (this.unlockedSkins.includes(skinId)) {
            this.activeSkin = skinId;
            this.save();
            return true;
        }
        return false;
    }

    buyLight(lightId) {
        const light = HEADLIGHT_COLORS[lightId];
        if (!light || this.unlockedLights.includes(lightId)) return false;
        if (this.spendDoubloons(light.cost)) {
            this.unlockedLights.push(lightId);
            this.activeLight = lightId;
            this.save();
            return true;
        }
        return false;
    }

    equipLight(lightId) {
        if (this.unlockedLights.includes(lightId)) {
            this.activeLight = lightId;
            this.save();
            return true;
        }
        return false;
    }

    calculateVictoryPoints(stats, gradeLevel = 'grade_3') {
        const gradeMultipliers = {
            grade_1: 1.0,
            grade_2: 1.15,
            grade_3: 1.3,
            grade_4: 1.5,
            grade_5: 1.7,
            grade_6_plus: 2.0
        };
        const mult = gradeMultipliers[gradeLevel] || 1.3;

        let basePoints = 250;

        // Accuracy bonus (0 - 150 pts)
        const accPct = stats.totalMath > 0 ? (stats.solvedMath / stats.totalMath) : 1;
        const accuracyPoints = Math.round(accPct * 150);

        // Doubloons bonus (1.0 XP per coin)
        const doubloonPoints = Math.round(stats.doubloons * 1.0);

        // Health bonus (0 - 100 pts)
        const healthPoints = Math.round((stats.health / 100) * 100);

        // Speed bonus (25 - 120 pts)
        const speedPoints = stats.time < 120 ? 120 : stats.time < 180 ? 70 : 25;

        const totalEarnedXp = Math.round((basePoints + accuracyPoints + doubloonPoints + healthPoints + speedPoints) * mult);

        const oldRank = this.getCurrentRank();
        this.xp += totalEarnedXp;
        this.victories += 1;
        this.save();
        const newRank = this.getCurrentRank();

        return {
            totalEarnedXp,
            basePoints,
            accuracyPoints,
            doubloonPoints,
            healthPoints,
            speedPoints,
            multiplier: mult,
            rankUp: newRank.level > oldRank.level,
            newRank,
            oldRank
        };
    }

    getCurrentRank() {
        let current = RANKS[0];
        for (let i = RANKS.length - 1; i >= 0; i--) {
            if (this.xp >= RANKS[i].minXp) {
                current = RANKS[i];
                break;
            }
        }
        const nextRank = RANKS[current.level] || null;
        let progressPct = 100;
        let neededXp = 0;

        if (nextRank) {
            const range = nextRank.minXp - current.minXp;
            const currentIntoRange = this.xp - current.minXp;
            progressPct = Math.min(100, Math.max(0, Math.round((currentIntoRange / range) * 100)));
            neededXp = nextRank.minXp - this.xp;
        }

        return {
            ...current,
            progressPct,
            neededXp,
            nextRank
        };
    }

    getActiveSkinData() {
        return SKINS[this.activeSkin] || SKINS.classic;
    }

    getActiveLightData() {
        return HEADLIGHT_COLORS[this.activeLight] || HEADLIGHT_COLORS.yellow;
    }
}
