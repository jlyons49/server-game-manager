/**
 * Math Engine for Abyssal Vault
 * Generates grade-tailored math problems with multiple choice options and hints.
 */

export const MathGradeLevels = {
    GRADE_1: {
        id: 'grade_1',
        name: 'Grade 1 (Ages 6-7)',
        description: 'Addition & subtraction up to 20, missing addends',
        icon: '🐟'
    },
    GRADE_2: {
        id: 'grade_2',
        name: 'Grade 2 (Ages 7-8)',
        description: '2-digit addition & subtraction, skip counting',
        icon: '🐡'
    },
    GRADE_3: {
        id: 'grade_3',
        name: 'Grade 3 (Ages 8-9)',
        description: 'Multiplication (1-10), division basics, 3-digit math',
        icon: '🐬'
    },
    GRADE_4: {
        id: 'grade_4',
        name: 'Grade 4 (Ages 9-10)',
        description: 'Multi-digit multiplication, factors & division, PEMDAS',
        icon: '🦈'
    },
    GRADE_5: {
        id: 'grade_5',
        name: 'Grade 5 (Ages 10-11)',
        description: 'Decimals, fractions, order of operations, percentages',
        icon: '🐋'
    },
    GRADE_6_PLUS: {
        id: 'grade_6_plus',
        name: 'Grade 6+ (Ages 11+)',
        description: 'Integers & negatives, pre-algebra (solve for x), exponents',
        icon: '🦑'
    }
};

export class MathEngine {
    constructor(gradeLevel = 'grade_3') {
        this.gradeLevel = gradeLevel;
    }

    setGradeLevel(gradeLevel) {
        if (MathGradeLevels[gradeLevel] || Object.values(MathGradeLevels).some(g => g.id === gradeLevel)) {
            this.gradeLevel = gradeLevel;
        }
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    generateProblem() {
        switch (this.gradeLevel) {
            case 'grade_1':
                return this.generateGrade1();
            case 'grade_2':
                return this.generateGrade2();
            case 'grade_3':
                return this.generateGrade3();
            case 'grade_4':
                return this.generateGrade4();
            case 'grade_5':
                return this.generateGrade5();
            case 'grade_6_plus':
                return this.generateGrade6Plus();
            default:
                return this.generateGrade3();
        }
    }

    // GRADE 1
    generateGrade1() {
        const types = ['add', 'sub', 'missing_add'];
        const type = types[this.randomInt(0, types.length - 1)];

        if (type === 'add') {
            const a = this.randomInt(1, 10);
            const b = this.randomInt(1, 10);
            const ans = a + b;
            return this.buildResult(
                `${a} + ${b} = ?`,
                ans,
                `Count up ${b} more from ${a}!`,
                [ans + 1, ans - 1, ans + 2, Math.max(1, ans - 2)]
            );
        } else if (type === 'sub') {
            const b = this.randomInt(1, 9);
            const ans = this.randomInt(1, 10);
            const a = ans + b;
            return this.buildResult(
                `${a} - ${b} = ?`,
                ans,
                `Start at ${a} and count back ${b}.`,
                [ans + 1, Math.max(0, ans - 1), ans + 2, Math.max(0, ans - 2)]
            );
        } else {
            const a = this.randomInt(1, 9);
            const total = this.randomInt(a + 1, Math.min(15, a + 9));
            const ans = total - a;
            return this.buildResult(
                `${a} + ? = ${total}`,
                ans,
                `What number added to ${a} equals ${total}?`,
                [ans + 1, Math.max(1, ans - 1), ans + 2, Math.max(1, ans - 2)]
            );
        }
    }

    // GRADE 2
    generateGrade2() {
        const types = ['add2d', 'sub2d', 'skip_count'];
        const type = types[this.randomInt(0, types.length - 1)];

        if (type === 'add2d') {
            const a = this.randomInt(15, 60);
            const b = this.randomInt(11, 38);
            const ans = a + b;
            return this.buildResult(
                `${a} + ${b} = ?`,
                ans,
                `Add the tens first: ${Math.floor(a/10)*10} + ${Math.floor(b/10)*10}, then add the ones!`,
                [ans + 10, ans - 10, ans + 2, ans - 1]
            );
        } else if (type === 'sub2d') {
            const b = this.randomInt(12, 45);
            const ans = this.randomInt(12, 50);
            const a = ans + b;
            return this.buildResult(
                `${a} - ${b} = ?`,
                ans,
                `Subtract ${b} from ${a}.`,
                [ans + 10, ans - 10, ans + 1, ans - 2]
            );
        } else {
            // Skip counting
            const step = [2, 5, 10][this.randomInt(0, 2)];
            const start = this.randomInt(1, 4) * step;
            const seq = [start, start + step, start + step * 2, start + step * 3];
            const ans = start + step * 3;
            return this.buildResult(
                `${seq[0]}, ${seq[1]}, ${seq[2]}, ?`,
                ans,
                `Notice each number goes up by ${step}!`,
                [ans + step, ans - step, ans + 1, ans + 3]
            );
        }
    }

    // GRADE 3
    generateGrade3() {
        const types = ['mult', 'div', 'add3d'];
        const type = types[this.randomInt(0, types.length - 1)];

        if (type === 'mult') {
            const a = this.randomInt(3, 10);
            const b = this.randomInt(2, 9);
            const ans = a * b;
            return this.buildResult(
                `${a} × ${b} = ?`,
                ans,
                `Think of ${a} groups of ${b}.`,
                [ans + a, ans - b, (a - 1) * b, (a + 1) * (b - 1)]
            );
        } else if (type === 'div') {
            const divisor = this.randomInt(2, 9);
            const ans = this.randomInt(3, 9);
            const dividend = divisor * ans;
            return this.buildResult(
                `${dividend} ÷ ${divisor} = ?`,
                ans,
                `What number times ${divisor} gives ${dividend}?`,
                [ans + 1, ans - 1, ans + 2, Math.max(1, ans - 2)]
            );
        } else {
            const a = this.randomInt(110, 450);
            const b = this.randomInt(50, 320);
            const ans = a + b;
            return this.buildResult(
                `${a} + ${b} = ?`,
                ans,
                `Combine hundreds, tens, and units.`,
                [ans + 10, ans - 10, ans + 100, ans - 1]
            );
        }
    }

    // GRADE 4
    generateGrade4() {
        const types = ['mult2d', 'pemdas_basic', 'div_mod'];
        const type = types[this.randomInt(0, types.length - 1)];

        if (type === 'mult2d') {
            const a = this.randomInt(11, 25);
            const b = this.randomInt(4, 9);
            const ans = a * b;
            return this.buildResult(
                `${a} × ${b} = ?`,
                ans,
                `Multiply (${Math.floor(a/10)*10} × ${b}) + (${(a%10)} × ${b})`,
                [ans + b, ans - b, ans + 10, ans - 10]
            );
        } else if (type === 'pemdas_basic') {
            const a = this.randomInt(2, 8);
            const b = this.randomInt(2, 6);
            const c = this.randomInt(5, 20);
            // e.g. a * b + c
            const ans = a * b + c;
            return this.buildResult(
                `${a} × ${b} + ${c} = ?`,
                ans,
                `Order of operations: multiply first (${a} × ${b}), then add ${c}!`,
                [a * (b + c), ans + 2, ans - 2, ans + 10]
            );
        } else {
            const divisor = this.randomInt(4, 9);
            const ans = this.randomInt(11, 24);
            const dividend = divisor * ans;
            return this.buildResult(
                `${dividend} ÷ ${divisor} = ?`,
                ans,
                `Remember division is the inverse of multiplication.`,
                [ans + 1, ans - 1, ans + 2, ans - 2]
            );
        }
    }

    // GRADE 5
    generateGrade5() {
        const types = ['decimals', 'pemdas', 'percent'];
        const type = types[this.randomInt(0, types.length - 1)];

        if (type === 'decimals') {
            const a = Number((this.randomInt(15, 65) / 10).toFixed(1));
            const b = Number((this.randomInt(12, 45) / 10).toFixed(1));
            const ans = Number((a + b).toFixed(1));
            return this.buildResult(
                `${a} + ${b} = ?`,
                ans,
                `Line up the decimal points and add.`,
                [Number((ans + 0.2).toFixed(1)), Number((ans - 0.2).toFixed(1)), Number((ans + 1.0).toFixed(1)), Number((ans - 0.1).toFixed(1))]
            );
        } else if (type === 'percent') {
            const percents = [10, 20, 25, 50];
            const p = percents[this.randomInt(0, percents.length - 1)];
            const base = this.randomInt(2, 10) * (p === 25 ? 4 : 10);
            const ans = Math.round((p / 100) * base);
            return this.buildResult(
                `${p}% of ${base} = ?`,
                ans,
                `${p}% is the same as ${p === 50 ? 'half (1/2)' : p === 25 ? 'one-quarter (1/4)' : p === 10 ? 'one-tenth (1/10)' : '2/10'}!`,
                [ans + 2, Math.max(1, ans - 2), ans + 5, Math.max(1, ans - 5)]
            );
        } else {
            const a = this.randomInt(2, 6);
            const b = this.randomInt(3, 7);
            const c = this.randomInt(2, 5);
            const ans = (a + b) * c;
            return this.buildResult(
                `(${a} + ${b}) × ${c} = ?`,
                ans,
                `Do the operation inside parentheses first: (${a} + ${b}) = ${a + b}`,
                [a + (b * c), ans + c, ans - c, ans + 2]
            );
        }
    }

    // GRADE 6+
    generateGrade6Plus() {
        const types = ['integers', 'algebra', 'exponents'];
        const type = types[this.randomInt(0, types.length - 1)];

        if (type === 'integers') {
            const a = this.randomInt(-15, 10);
            const b = this.randomInt(-12, 15);
            const isSub = Math.random() > 0.5;
            const ans = isSub ? a - b : a + b;
            const symbol = isSub ? '-' : '+';
            const bStr = b < 0 ? `(${b})` : `${b}`;
            return this.buildResult(
                `${a} ${symbol} ${bStr} = ?`,
                ans,
                isSub && b < 0 ? `Subtracting a negative turns into addition: ${a} + ${-b}!` : `Watch positive and negative signs carefully on the number line.`,
                [ans + 2, ans - 2, -ans, ans + (isSub ? 1 : -1)]
            );
        } else if (type === 'algebra') {
            // 2x + b = c
            const coefficient = this.randomInt(2, 5);
            const x = this.randomInt(2, 9);
            const constant = this.randomInt(1, 15);
            const total = coefficient * x + constant;
            return this.buildResult(
                `Solve for x: ${coefficient}x + ${constant} = ${total}`,
                x,
                `First subtract ${constant} from ${total} to get ${total - constant}, then divide by ${coefficient}!`,
                [x + 1, Math.max(1, x - 1), x + 2, Math.max(1, x - 2)]
            );
        } else {
            // Exponents
            const base = this.randomInt(2, 6);
            const exp = this.randomInt(2, 3);
            const bonus = this.randomInt(3, 12);
            const ans = Math.pow(base, exp) + bonus;
            return this.buildResult(
                `${base}^${exp} + ${bonus} = ?`,
                ans,
                `${base}^${exp} means ${base} multiplied ${exp} times (${Array(exp).fill(base).join(' × ')} = ${Math.pow(base, exp)}).`,
                [ans + base, ans - base, base * exp + bonus, ans + 4]
            );
        }
    }

    buildResult(prompt, answer, hint, distractorCandidates) {
        const optionsSet = new Set([answer]);

        for (const distractor of distractorCandidates) {
            if (optionsSet.size >= 4) break;
            if (distractor !== answer && Number.isFinite(distractor)) {
                optionsSet.add(distractor);
            }
        }

        // Fill with randomized reasonable options if needed
        let offset = 1;
        while (optionsSet.size < 4) {
            const extra = typeof answer === 'number' ? (Math.random() > 0.5 ? answer + offset : answer - offset) : offset;
            if (extra !== answer) optionsSet.add(extra);
            offset++;
        }

        const options = this.shuffle(Array.from(optionsSet));

        return {
            prompt,
            answer,
            displayAnswer: String(answer),
            options,
            hint
        };
    }
}
