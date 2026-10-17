/**
 * Settings Manager
 * Handles grade level selection, problem count, audio preferences, and CRT graphics filters.
 */

import { MathGradeLevels } from './mathEngine.js';

export class SettingsManager {
    constructor(audioEngine, mathEngine) {
        this.audio = audioEngine;
        this.math = mathEngine;

        this.settings = {
            gradeLevel: 'grade_3',
            problemCount: 4,
            sfxVolume: 0.7,
            musicVolume: 0.4,
            isMuted: false,
            crtScanlines: false,
            screenShake: true
        };

        this.loadSettings();
        this.initDOM();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('abyssal_vault_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
            }
        } catch (e) {
            console.warn('Could not load settings from localStorage', e);
        }

        // Apply loaded settings
        this.math.setGradeLevel(this.settings.gradeLevel);
        this.audio.setSfxVolume(this.settings.sfxVolume);
        this.audio.setMusicVolume(this.settings.musicVolume);
        this.audio.setMuted(this.settings.isMuted);
        this.applyCRT(this.settings.crtScanlines);
    }

    saveSettings() {
        try {
            localStorage.setItem('abyssal_vault_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings to localStorage', e);
        }
    }

    initDOM() {
        this.modal = document.getElementById('settings-modal');
        this.gradeSelect = document.getElementById('settings-grade-select');
        this.gradeDesc = document.getElementById('settings-grade-desc');
        this.problemCountSelect = document.getElementById('settings-problem-count');
        this.sfxSlider = document.getElementById('settings-sfx-vol');
        this.musicSlider = document.getElementById('settings-music-vol');
        this.muteCheckbox = document.getElementById('settings-mute');
        this.crtCheckbox = document.getElementById('settings-crt');
        this.shakeCheckbox = document.getElementById('settings-shake');
        this.closeBtn = document.getElementById('settings-close-btn');

        // Populate Grade Select options
        if (this.gradeSelect) {
            this.gradeSelect.innerHTML = '';
            Object.values(MathGradeLevels).forEach(grade => {
                const opt = document.createElement('option');
                opt.value = grade.id;
                opt.textContent = `${grade.icon} ${grade.name}`;
                this.gradeSelect.appendChild(opt);
            });
            this.gradeSelect.value = this.settings.gradeLevel;
            this.updateGradeDesc();

            this.gradeSelect.addEventListener('change', (e) => {
                this.settings.gradeLevel = e.target.value;
                this.math.setGradeLevel(this.settings.gradeLevel);
                this.updateGradeDesc();
                this.saveSettings();
            });
        }

        if (this.problemCountSelect) {
            this.problemCountSelect.value = String(this.settings.problemCount);
            this.problemCountSelect.addEventListener('change', (e) => {
                this.settings.problemCount = parseInt(e.target.value, 10);
                this.saveSettings();
            });
        }

        if (this.sfxSlider) {
            this.sfxSlider.value = String(this.settings.sfxVolume * 100);
            this.sfxSlider.addEventListener('input', (e) => {
                this.settings.sfxVolume = parseFloat(e.target.value) / 100;
                this.audio.setSfxVolume(this.settings.sfxVolume);
                this.saveSettings();
            });
        }

        if (this.musicSlider) {
            this.musicSlider.value = String(this.settings.musicVolume * 100);
            this.musicSlider.addEventListener('input', (e) => {
                this.settings.musicVolume = parseFloat(e.target.value) / 100;
                this.audio.setMusicVolume(this.settings.musicVolume);
                this.saveSettings();
            });
        }

        if (this.muteCheckbox) {
            this.muteCheckbox.checked = this.settings.isMuted;
            this.muteCheckbox.addEventListener('change', (e) => {
                this.settings.isMuted = e.target.checked;
                this.audio.setMuted(this.settings.isMuted);
                this.saveSettings();
            });
        }

        if (this.crtCheckbox) {
            this.crtCheckbox.checked = this.settings.crtScanlines;
            this.crtCheckbox.addEventListener('change', (e) => {
                this.settings.crtScanlines = e.target.checked;
                this.applyCRT(this.settings.crtScanlines);
                this.saveSettings();
            });
        }

        if (this.shakeCheckbox) {
            this.shakeCheckbox.checked = this.settings.screenShake;
            this.shakeCheckbox.addEventListener('change', (e) => {
                this.settings.screenShake = e.target.checked;
                this.saveSettings();
            });
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }
    }

    updateGradeDesc() {
        const current = Object.values(MathGradeLevels).find(g => g.id === this.settings.gradeLevel);
        if (current) {
            if (this.gradeDesc) {
                this.gradeDesc.textContent = current.description;
            }
            const titleBadge = document.getElementById('title-grade-badge');
            if (titleBadge) {
                titleBadge.textContent = `${current.icon} CURRENT: ${current.name.toUpperCase()}`;
            }
        }
    }

    applyCRT(enabled) {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            if (enabled) {
                gameContainer.classList.add('crt-scanlines');
            } else {
                gameContainer.classList.remove('crt-scanlines');
            }
        }
    }

    show() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
        }
    }

    hide() {
        if (this.modal) {
            this.modal.classList.add('hidden');
        }
    }
}
