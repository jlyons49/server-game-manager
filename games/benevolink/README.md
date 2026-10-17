# Benevolink™ Colleague Portal: Actual Individual

> *"Where artificial hyper-intelligence meets actual underpaid individuals."*

A fast-paced, satirical WarioWare-style micro-game collection built with pure modern ES Modules, HTML5, CSS3, and the Web Audio API (zero bundler required, zero external dependencies).

---

## 🎮 The Premise

**Benevolink™** operates a planetary-scale, hyper-optimized AI infrastructure that claims to be 99.999% autonomous. However, when its neural networks encounter everyday edge cases—a duck in the road, a sock with a frayed toe, a CAPTCHA, or an overheating GPU cluster—it suffers immediate cognitive paralysis.

When the system panics, it triggers a **SYNERGY INTERRUPT** and outsources the split-second decision to an underpaid human operator: an **Actual Individual**.

You have 2 to 5 seconds to resolve each crisis. Succeed, and your Synergy Score climbs toward executive promotion. Fail three times, and you are permanently **"Promoted to Customer"** (fired).

---

## ✨ Major Quality Improvements in Prototype 2

Compared to the initial prototype, this version features a complete overhaul across visuals, audio, gameplay feel, and variety:

### 1. 🎵 Procedural Web Audio Engine (`src/audio/AudioManager.js`)
- **Zero Audio Files Required:** Fully synthesized real-time audio that works 100% offline.
- **Dynamic BGM Tempo Scaling:** Cheerful corporate elevator/funk muzak (Cmaj7-Am7-Dm7-G7) that accelerates in tempo as game speed ramps up.
- **Ticking Deadline Cues:** Pitch-shifting countdown clock ticks with urgent final-second alarm.
- **Crisp SFX Library:** Tire screeches, foam impacts, duck quacks, alien giggles, server nitrogen spray, checkmark clicks, trash shredding, and grand promotion trumpet fanfares.
- **Voice Narration:** Browser SpeechSynthesis announces microgame commands (*"SWERVE!"*, *"VERIFY!"*, *"EXTINGUISH!"*).
- **Audio Controls:** Instant mute toggle button (`M` key) and localStorage preference persistence.

### 2. 🕹️ Expanded Roster of 8 Diverse Microgames
1. **The Autonomous Car (`SWERVE!`)**
   - High-speed perspective canvas highway with moving road lines, animated autonomous sedan with spinning LiDAR and glowing headlights.
   - Dual control: on-screen buttons, canvas swipe/tap, or keyboard (`A`/`D` or `←`/`→`).
   - Steer into soft foam mattresses while avoiding ducks and kittens!
2. **Sock Sorter 3000 (`TRASH IT!`)**
   - Physics drag-and-drop laundry station.
   - Distinctive sock designs with realistically frayed holes and visible toes.
   - Drop defective socks into the incinerator/trash chute while preserving intact socks.
3. **Autonomous Cruise (`STEER SHIP!`)**
   - Steer an unsinkable autonomous luxury cruise ship (Titanic style) cutting through North Atlantic fog.
   - Distinctive 4-funnel black-and-white ocean liner with billowing smokestack plumes, glowing deck portholes, and dynamic banking wake.
   - Steer Hard to Port or Starboard to slide past towering crystalline icebergs!
4. **Mars Rover 9000 (`DISCOVER!`)**
   - Sci-Fi HUD overlay with radar sweeps and target reticle.
   - Animated Martian amoeba with blinking eyes that wiggles and peeks out from behind Martian boulders.
5. **Captcha Overlord (`VERIFY!`)**
   - Hyper-realistic corporate transaction scenarios (e.g., authorizing $50M wire transfers or purchasing 100k GPUs).
   - Real AI-generated image tiles from `assets/captcha/` with interactive checkmark animations and audio.
   - Full keyboard numpad integration (`1`–`9` and `Enter` to verify).
6. **Antigravity Cargo (`PULL DOWN!`)**
   - Gyroscope failure! Laptops, hot coffees, and NDA documents float upward toward ceiling shredder vents.
   - Tactile physics: tap or drag cargo downward into the magnetic floor safety zone.
7. **Server Meltdown (`EXTINGUISH!`)**
   - Datacenter GPU cluster experiencing thermal runaway (82°C).
   - Rapid-tap or mash `Spacebar`/screen to blast cryogenic nitrogen spray and drop temperatures below 40°C before explosion!
8. **Executive Coffee (`POUR!`)**
   - Precision hold-and-release mechanic! Hold `Spacebar` or tap to pour cold brew into the CEO's gold tumbler.
   - Release precisely inside the generous green target zone without underfilling or spilling onto merger contracts.

### 3. 🏢 Corporate SaaS Dashboard & Polish
- **Tone-Deaf Corporate Satire:** Clean SaaS portal aesthetic with live stock ticker (`$BNVLK ▲ 42.8%`), quarterly KPI badges, and sarcastic management Slack toasts via `ToastManager.js`.
- **Corporate Ladder Career Progression:**
  - `🌱 Unpaid Synergy Intern` (0 pts)
  - `🖱️ Junior Clicking Associate` (300 pts)
  - `🧹 Senior Edge Case Janitor` (700 pts)
  - `📊 Regional Director of Problem Solving` (1200 pts)
  - `💼 VP of Human Fallback Protocols` (1800 pts)
  - `🛡️ Executive Panic Dampener` (2600 pts)
  - `👑 Chief Executive Human (CEO)` (3600+ pts)
- **Confetti Cannon (`src/ui/Confetti.js`):** Multi-colored particle explosions upon career promotions and high scores.
- **HR Training Room (Practice Mode):** Practice any individual microgame at steady speed to master its mechanics.
- **Comedic Exit Interview:** Customized performance review card with manager comments and persistent high scores.

---

## 🚀 How to Run

Because this project uses native modern ES Modules, it requires an HTTP server to allow dynamic module imports:

### Option A: Using Python (Built-in, Recommended)
```bash
py -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in any modern web browser.

### Option B: Using npm
```bash
npm start
```

---

## ⌨️ Controls & Accessibility

- **Keyboard:**
  - `A` / `D` or `←` / `→`: Steer Autonomous Car
  - `1` to `9`: Toggle CAPTCHA tiles
  - `Enter` or `Space`: Confirm CAPTCHA, mash server extinguisher, hold to pour coffee
  - `M`: Toggle Sound Mute
- **Mouse & Touch:**
  - Fully responsive on mobile, tablet, and desktop with on-screen buttons, drag-and-drop, and touch gestures.
