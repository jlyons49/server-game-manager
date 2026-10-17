/**
 * 3D Sunken Vault & Math Cipher Manager
 * Coordinates 3D mechanical lock tumblers, Grade 1-6+ curriculum problem solving,
 * hint scrolls, answer evaluations, and relic retrieval.
 */

export class VaultManager {
    constructor(mathEngine, audioEngine, onVaultUnlocked) {
        this.mathEngine = mathEngine;
        this.audio = audioEngine;
        this.onVaultUnlocked = onVaultUnlocked;

        this.active = false;
        this.requiredProblems = 4;
        this.solvedCount = 0;
        this.currentProblem = null;
        this.isProcessingAnswer = false;
        this.showingHint = false;
        this.wrongAttempts = 0;
        this.vaultData = null; // reference to 3D vault model

        this.initDOM();
    }

    initDOM() {
        this.container = document.getElementById('vault-overlay');
        this.lockIndicators = document.getElementById('vault-locks');
        this.equationEl = document.getElementById('vault-equation');
        this.optionsContainer = document.getElementById('vault-options');
        this.hintBox = document.getElementById('vault-hint');
        this.hintBtn = document.getElementById('vault-hint-btn');
        this.feedbackEl = document.getElementById('vault-feedback');

        if (this.hintBtn) {
            this.hintBtn.addEventListener('click', () => {
                this.showingHint = !this.showingHint;
                this.renderHint();
            });
        }

        // Hotkeys 1, 2, 3, 4
        window.addEventListener('keydown', (e) => {
            if (!this.active || this.isProcessingAnswer) return;
            if (['1', '2', '3', '4'].includes(e.key)) {
                const index = parseInt(e.key, 10) - 1;
                const buttons = this.optionsContainer.querySelectorAll('button');
                if (buttons[index]) {
                    buttons[index].click();
                }
            }
        });
    }

    start(vaultData, shipType = 'pirate', requiredProblems = 4) {
        this.active = true;
        this.vaultData = vaultData;
        this.shipType = shipType;
        this.requiredProblems = requiredProblems;
        this.solvedCount = 0;
        this.wrongAttempts = 0;
        this.showingHint = false;
        this.isProcessingAnswer = false;

        const titleEl = document.getElementById('vault-title');
        const subtitleEl = document.getElementById('vault-subtitle');
        if (titleEl && subtitleEl) {
            if (shipType === 'titanic') {
                titleEl.textContent = "💎 R.M.S. TITANIC PURSER'S SAFE 💎";
                subtitleEl.textContent = 'DECIPHER COMBINATION DIALS TO SALVAGE THE HEART OF THE OCEAN';
            } else if (shipType === 'plane') {
                titleEl.textContent = '🛩️ B-17 FLIGHT RECORDER VAULT 🛩️';
                subtitleEl.textContent = 'DECODE THE MILITARY BLACK BOX TO SECURE TOP SECRET DATA';
            } else {
                titleEl.textContent = '👑 CURSED PIRATE CHEST CIPHER 👑';
                subtitleEl.textContent = 'SOLVE THE ANCIENT EQUATIONS TO UNLOCK THE PIRATE HOARD';
            }
        }

        this.container.classList.remove('hidden');
        this.audio.playMusic('vault');
        this.renderLocks();
        this.loadNextProblem();
    }

    renderLocks() {
        if (!this.lockIndicators) return;
        this.lockIndicators.innerHTML = '';
        for (let i = 0; i < this.requiredProblems; i++) {
            const lock = document.createElement('div');
            lock.className = 'vault-lock-icon ' + (i < this.solvedCount ? 'unlocked' : 'locked');
            lock.innerHTML = i < this.solvedCount ? '★' : '🔒';
            this.lockIndicators.appendChild(lock);
        }
    }

    loadNextProblem() {
        this.currentProblem = this.mathEngine.generateProblem();
        this.showingHint = false;
        this.renderHint();
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'vault-feedback';

        this.equationEl.textContent = this.currentProblem.prompt;
        this.renderOptions();
    }

    renderOptions() {
        this.optionsContainer.innerHTML = '';
        this.currentProblem.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'pixel-btn vault-option-btn';
            btn.innerHTML = `<span class="hotkey-num">[${idx + 1}]</span> ${opt}`;
            btn.addEventListener('click', () => this.handleAnswer(opt, btn));
            this.optionsContainer.appendChild(btn);
        });
    }

    renderHint() {
        if (!this.hintBox) return;
        if (this.showingHint && this.currentProblem) {
            this.hintBox.textContent = `💡 Hint: ${this.currentProblem.hint}`;
            this.hintBox.classList.remove('hidden');
        } else {
            this.hintBox.classList.add('hidden');
        }
    }

    handleAnswer(selectedOption, buttonEl) {
        if (this.isProcessingAnswer) return;
        this.isProcessingAnswer = true;

        const isCorrect = selectedOption === this.currentProblem.answer;

        if (isCorrect) {
            this.solvedCount++;
            buttonEl.classList.add('correct');
            this.feedbackEl.textContent = '✔ CIPHER RUNIC DIAL UNLOCKED!';
            this.feedbackEl.className = 'vault-feedback success';

            this.audio.playLockSuccess();
            this.audio.playLockClick();

            // Animate 3D physical tumbler turn on the model
            if (this.vaultData) {
                this.vaultData.unlockTumbler(this.solvedCount - 1);
            }

            this.renderLocks();

            setTimeout(() => {
                if (this.solvedCount >= this.requiredProblems) {
                    this.completeVault();
                } else {
                    this.isProcessingAnswer = false;
                    this.loadNextProblem();
                }
            }, 1200);

        } else {
            this.wrongAttempts++;
            buttonEl.classList.add('incorrect');
            this.feedbackEl.textContent = '✖ CIPHER REJECTED. TRY AGAIN!';
            this.feedbackEl.className = 'vault-feedback error';

            this.audio.playLockError();

            // Auto-reveal hint after 2 wrong attempts
            if (this.wrongAttempts >= 2 && !this.showingHint) {
                this.showingHint = true;
                this.renderHint();
            }

            setTimeout(() => {
                buttonEl.classList.remove('incorrect');
                this.isProcessingAnswer = false;
            }, 900);
        }
    }

    completeVault() {
        this.audio.playVaultOpened();

        // Physically pop open the 3D vault lid and reveal relic
        if (this.vaultData) {
            this.vaultData.openVault();
        }

        this.feedbackEl.textContent = '★ ALL LOCKS DISENGAGED! RELIC RETRIEVED! ★';
        this.feedbackEl.className = 'vault-feedback grand-success';

        setTimeout(() => {
            this.container.classList.add('hidden');
            this.active = false;
            if (this.onVaultUnlocked) {
                this.onVaultUnlocked();
            }
        }, 2200);
    }
}
