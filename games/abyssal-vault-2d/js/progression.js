/**
 * Progression & Cosmetics Manager
 * Handles persistent doubloon wallet, cosmetics shop (skins, lights, trails), and rank XP.
 */

export const SKINS = {
    classic: {
        id: 'classic',
        name: 'Classic Nautilus',
        cost: 0,
        desc: 'Traditional brass and exploration yellow.',
        hullColor: '#facc15',
        hullDark: '#d97706',
        trimColor: '#92400e',
        domeColor: '#38bdf8'
    },
    stealth: {
        id: 'stealth',
        name: 'Stealth Spectre',
        cost: 100,
        desc: 'Matte midnight onyx with luminous electric blue trim.',
        hullColor: '#1e293b',
        hullDark: '#0f172a',
        trimColor: '#0ea5e9',
        domeColor: '#38bdf8'
    },
    coral: {
        id: 'coral',
        name: 'Coral Explorer',
        cost: 200,
        desc: 'Vibrant tropical reef aqua with magenta accents.',
        hullColor: '#06b6d4',
        hullDark: '#0891b2',
        trimColor: '#ec4899',
        domeColor: '#f472b6'
    },
    inferno: {
        id: 'inferno',
        name: 'Volcanic Magma',
        cost: 350,
        desc: 'Tempered volcanic basalt with fiery orange glow.',
        hullColor: '#ea580c',
        hullDark: '#9a3412',
        trimColor: '#facc15',
        domeColor: '#fdba74'
    },
    gold: {
        id: 'gold',
        name: '24K Sovereign',
        cost: 600,
        desc: 'Solid gleaming gold hull crafted for pirate kings.',
        hullColor: '#fef08a',
        hullDark: '#eab308',
        trimColor: '#ca8a04',
        domeColor: '#ffffff'
    }
};

export const HEADLIGHT_COLORS = {
    yellow: {
        id: 'yellow',
        name: 'Warm Halogen',
        cost: 0,
        inner: 'rgba(254, 240, 138, 0.55)',
        mid: 'rgba(253, 224, 71, 0.25)',
        outer: 'rgba(56, 189, 248, 0.08)'
    },
    cyan: {
        id: 'cyan',
        name: 'Bioluminescent Cyan',
        cost: 60,
        inner: 'rgba(125, 211, 252, 0.65)',
        mid: 'rgba(56, 189, 248, 0.35)',
        outer: 'rgba(2, 132, 199, 0.12)'
    },
    green: {
        id: 'green',
        name: 'Emerald Sonar',
        cost: 80,
        inner: 'rgba(134, 239, 172, 0.65)',
        mid: 'rgba(34, 197, 94, 0.35)',
        outer: 'rgba(22, 101, 52, 0.12)'
    },
    purple: {
        id: 'purple',
        name: 'Ultraviolet Neon',
        cost: 120,
        inner: 'rgba(244, 114, 182, 0.65)',
        mid: 'rgba(168, 85, 247, 0.35)',
        outer: 'rgba(88, 28, 135, 0.12)'
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
            const data = localStorage.getItem('abyssal_vault_progression');
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
            localStorage.setItem('abyssal_vault_progression', JSON.stringify(data));
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

        let basePoints = 180; // completion bonus (rebalanced for paced progression)

        // Accuracy bonus (0 - 120 pts)
        const accPct = stats.totalMath > 0 ? (stats.solvedMath / stats.totalMath) : 1;
        const accuracyPoints = Math.round(accPct * 120);

        // Doubloons bonus (0.5 XP per coin)
        const doubloonPoints = Math.round(stats.doubloons * 0.5);

        // Health bonus (0 - 60 pts)
        const healthPoints = Math.round((stats.health / 100) * 60);

        // Speed bonus (15 - 80 pts)
        const speedPoints = stats.time < 120 ? 80 : stats.time < 180 ? 45 : 15;

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
