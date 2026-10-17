/**
 * Math Vault & Treasure Chest Puzzle Interface
 * Interactive ancient lock puzzle where any missed question is immediately failed.
 * Requires at least n - 1 correct answers (where n = total questions) to unlock the treasure.
 */

export class MathVault {
    constructor(mathEngine, audioEngine, onComplete) {
        this.mathEngine = mathEngine;
        this.audio = audioEngine;
        this.onComplete = onComplete;

        this.active = false;
        this.requiredProblems = 4; // n
        this.minRequired = 3;      // n - 1
        this.maxAllowedMisses = 1;

        this.questionIndex = 0;
        this.questionResults = [];
        this.correctCount = 0;
        this.missedCount = 0;

        this.currentProblem = null;
        this.isProcessingAnswer = false;
        this.showingHint = false;

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

        // Keyboard hotkeys 1, 2, 3, 4
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

    start(requiredProblems = 4, shipType = 'pirate') {
        this.active = true;
        this.requiredProblems = Math.max(2, requiredProblems);
        this.minRequired = this.requiredProblems - 1; // Requires n - 1 correct
        this.maxAllowedMisses = 1;

        this.shipType = shipType;
        this.questionIndex = 0;
        this.questionResults = new Array(this.requiredProblems).fill('pending');
        this.correctCount = 0;
        this.missedCount = 0;

        this.showingHint = false;
        this.isProcessingAnswer = false;

        const titleEl = document.getElementById('vault-title');
        const subtitleEl = document.getElementById('vault-subtitle');
        if (titleEl && subtitleEl) {
            if (shipType === 'titanic') {
                titleEl.textContent = "💎 R.M.S. TITANIC PURSER'S SAFE 💎";
                subtitleEl.textContent = 'DECIPHER THE COMBINATION DIALS TO RETRIEVE THE DIAMOND';
            } else if (shipType === 'plane') {
                titleEl.textContent = '🛩️ B-17 FLIGHT RECORDER VAULT 🛩️';
                subtitleEl.textContent = 'DECODE THE ENCRYPTED BLACK BOX TO SECURE TOP SECRET DATA';
            } else {
                titleEl.textContent = '👑 CURSED PIRATE CHEST CIPHER 👑';
                subtitleEl.textContent = 'SOLVE THE ANCIENT EQUATIONS TO UNLOCK THE PIRATE HOARD';
            }
        }

        // Display requirement badge
        const reqEl = document.getElementById('vault-req-banner');
        if (reqEl) {
            reqEl.textContent = `REQUIREMENT: AT LEAST ${this.minRequired} OF ${this.requiredProblems} CORRECT (MAX 1 MISS ALLOWED)`;
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
            const state = this.questionResults[i];

            if (state === 'passed') {
                lock.className = 'vault-lock-icon passed';
                lock.innerHTML = '★';
                lock.title = `Question ${i + 1}: Passed`;
            } else if (state === 'failed') {
                lock.className = 'vault-lock-icon failed';
                lock.innerHTML = '✖';
                lock.title = `Question ${i + 1}: Missed (Failed)`;
            } else if (i === this.questionIndex) {
                lock.className = 'vault-lock-icon current';
                lock.innerHTML = '▶';
                lock.style.borderColor = '#38bdf8';
                lock.title = `Question ${i + 1}: Current`;
            } else {
                lock.className = 'vault-lock-icon';
                lock.innerHTML = '🔒';
                lock.title = `Question ${i + 1}: Locked`;
            }

            this.lockIndicators.appendChild(lock);
        }
    }

    loadNextProblem() {
        this.currentProblem = this.mathEngine.generateProblem();
        this.showingHint = false;
        this.renderHint();
        this.feedbackEl.textContent = `QUESTION ${this.questionIndex + 1} OF ${this.requiredProblems} (PASSED: ${this.correctCount} | MISSED: ${this.missedCount}/1)`;
        this.feedbackEl.className = 'vault-feedback';

        this.equationEl.textContent = this.currentProblem.prompt;
        this.optionsContainer.innerHTML = '';

        this.currentProblem.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'pixel-btn option-btn';
            btn.innerHTML = `<span class="opt-num">[${idx + 1}]</span> ${opt}`;
            btn.addEventListener('click', () => this.handleAnswer(opt, btn));
            this.optionsContainer.appendChild(btn);
        });
    }

    renderHint() {
        if (!this.hintBox || !this.hintBtn) return;
        if (this.showingHint && this.currentProblem) {
            this.hintBox.textContent = `💡 Hint: ${this.currentProblem.hint}`;
            this.hintBox.classList.remove('hidden');
            this.hintBtn.textContent = 'Hide Hint';
        } else {
            this.hintBox.classList.add('hidden');
            this.hintBtn.textContent = 'Need a Hint?';
        }
    }

    handleAnswer(selectedOption, buttonEl) {
        if (this.isProcessingAnswer) return;
        this.isProcessingAnswer = true;

        const isCorrect = selectedOption === this.currentProblem.answer;

        if (isCorrect) {
            // Passed question
            this.questionResults[this.questionIndex] = 'passed';
            this.correctCount++;
            buttonEl.classList.add('btn-correct');

            this.feedbackEl.textContent = `✔ QUESTION PASSED! (${this.correctCount}/${this.requiredProblems})`;
            this.feedbackEl.className = 'vault-feedback correct';
            this.audio.playCorrectAnswer();
            this.audio.playLockClick();

        } else {
            // MISSED QUESTION: Immediately failed! No retries.
            this.questionResults[this.questionIndex] = 'failed';
            this.missedCount++;
            buttonEl.classList.add('btn-wrong');

            // Visually highlight the correct option
            const buttons = this.optionsContainer.querySelectorAll('button');
            buttons.forEach(btn => {
                if (btn.textContent.includes(String(this.currentProblem.answer))) {
                    btn.classList.add('btn-correct');
                }
            });

            this.feedbackEl.textContent = `✖ QUESTION FAILED! Correct was ${this.currentProblem.displayAnswer} (Missed: ${this.missedCount}/1 max)`;
            this.feedbackEl.className = 'vault-feedback wrong';
            this.audio.playWrongAnswer();
        }

        this.renderLocks();

        setTimeout(() => {
            this.questionIndex++;

            // Early Lockdown: If player has missed more than 1 question,
            // they cannot achieve n - 1 correct answers.
            if (this.missedCount > this.maxAllowedMisses) {
                this.finishVaultFailure();
                return;
            }

            // If more questions remain, load next
            if (this.questionIndex < this.requiredProblems) {
                this.isProcessingAnswer = false;
                this.loadNextProblem();
            } else {
                // All questions finished: evaluate final score against n - 1
                if (this.correctCount >= this.minRequired) {
                    this.finishVaultSuccess();
                } else {
                    this.finishVaultFailure();
                }
            }
        }, 1100);
    }

    finishVaultSuccess() {
        this.audio.playChestOpenFanfare();
        let rewardText = `👑 PIRATE CHEST UNLOCKED (${this.correctCount}/${this.requiredProblems})! RETRIEVED THE HEART OF THE SEA!`;
        if (this.shipType === 'titanic') {
            rewardText = `💎 PURSER'S SAFE CRACKED (${this.correctCount}/${this.requiredProblems})! RETRIEVED THE HEART OF THE OCEAN!`;
        } else if (this.shipType === 'plane') {
            rewardText = `🛩️ FLIGHT RECORDER SECURED (${this.correctCount}/${this.requiredProblems})! TOP SECRET DATA RETRIEVED!`;
        }
        this.feedbackEl.textContent = rewardText;
        this.feedbackEl.className = 'vault-feedback fanfare';

        setTimeout(() => {
            this.audio.playMonsterRoar();
            this.feedbackEl.textContent = '⚠ TREASURE SECURED! THE ABYSSAL LEVIATHAN HAS AWAKENED! ESCAPE!';
            this.feedbackEl.className = 'vault-feedback alert';

            setTimeout(() => {
                this.close();
                if (this.onComplete) {
                    this.onComplete({
                        success: true,
                        solvedProblems: this.correctCount,
                        missedProblems: this.missedCount,
                        totalProblems: this.requiredProblems
                    });
                }
            }, 1800);
        }, 1400);
    }

    finishVaultFailure() {
        this.audio.playHit();
        this.feedbackEl.textContent = `🚨 VAULT LOCKDOWN! (${this.correctCount}/${this.requiredProblems} Correct - Required ${this.minRequired})!`;
        this.feedbackEl.className = 'vault-feedback alert';

        setTimeout(() => {
            this.audio.playMonsterRoar();
            this.feedbackEl.textContent = '⚠ TREASURE LOCKED! SECURITY ALARM AWAKENED THE LEVIATHAN! EVACUATE!';

            setTimeout(() => {
                this.close();
                if (this.onComplete) {
                    this.onComplete({
                        success: false,
                        solvedProblems: this.correctCount,
                        missedProblems: this.missedCount,
                        totalProblems: this.requiredProblems
                    });
                }
            }, 1800);
        }, 1400);
    }

    close() {
        this.active = false;
        this.container.classList.add('hidden');
    }
}
