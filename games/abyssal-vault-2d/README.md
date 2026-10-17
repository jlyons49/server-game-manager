# ⚓ Abyssal Vault: The Sunken Treasure

A retro pixel art browser game where you command an explorer submarine diving into the depths of the ocean to recover cursed treasure from an ancient shipwreck, cracking mathematical runic ciphers along the way, and making a daring escape from a giant awakened Sea Monster.

---

## 🎮 How to Play

### 1. Launching the Game
You can run the game using any standard web browser:
```bash
python -m http.server 8085 --bind 127.0.0.1
```
Then navigate to: **`http://127.0.0.1:8085`**

*(You can also open `index.html` directly in your browser).*

---

## 🕹 Controls

| Action | Keyboard | Touch / On-Screen |
| :--- | :--- | :--- |
| **Steer Submarine** | `W` `A` `S` `D` or `Arrow Keys` | Virtual D-Pad (Left side) |
| **Speed Boost** | `Shift` (Hold) | `⚡ BOOST` button |
| **Sonar Ping** | `Space` | `📡 SONAR` button |
| **Fire Sonic Torpedo** | `F` or `E` | `🚀 FIRE` button |
| **Select Math Answer** | `1`, `2`, `3`, `4` or Mouse Click | Tap option button |
| **Return to Home Base**| Click `🏠` button in HUD | Click `🏠` in HUD |

---

## 🌊 Game Features & Expansions

### 🏠 1. Home Screen (Expedition Command) & Navigation
- A dedicated Base Command hub displaying your current **Captain Rank**, **XP progress bar**, and persistent **Doubloons Wallet**.
- Quick access to the **Drydock Customization Shop**, **Captain's Log**, **Settings & Grade Selection**, and **Explorer's Handbook**.
- Return to the Home Screen anytime:
  - From the in-game HUD via the `🏠` button.
  - From the Victory Screen via the `🏠 BASE COMMAND` button.
  - From the Game Over Screen via the `🏠 BASE COMMAND` button.
  - From any modal or shop screen.

### 🫧 2. Oxygen Restoration System
- Never get stuck without air! Oxygen can now be replenished in multiple ways during the descent:
  - **Hydrothermal Oxygen Vents**: 4 glowing geothermal bubble geysers along the seabed caverns. Hovering inside or near them rapidly replenishes oxygen with a visual `🫧 O₂ RECHARGING...` indicator and bubble audio.
  - **Oxygen Canisters**: Blue `O₂` tanks floating frequently throughout the descent.
  - **Surface Aeration**: Swimming near the surface (depth < 90m) naturally replenishes oxygen reserves.

### 🚢 3. Shipwreck Variations
Choose your expedition target on the Home Screen or let the expedition rotate:
1. **The Cursed Pirate Galleon** (*"The Black Barnacle"*):
   - Rotten wooden hull, broken mast, tattered sails with Jolly Roger, and a gold-banded cursed chest holding the *Heart of the Sea*.
2. **The R.M.S. Titanic**:
   - Split steel ocean liner hull, riveted black & rusted red plates, fallen ochre smokestacks, and the heavy steel Purser's Safe holding the *Heart of the Ocean Diamond*.
3. **The Lost B-17 Flying Fortress Plane Wreck**:
   - Downed WWII bomber with olive-drab aluminum fuselage, glass cockpit, swept wings with bent propellers, and the armored Flight Recorder Vault.

### 🛒 4. The Drydock (Cosmetics Shop)
- Spend collected doubloons (persisted across sessions via `localStorage`) on custom submarine cosmetics:
  - **Hull Paint Jobs**:
    - *Classic Nautilus* (Default yellow/brass)
    - *Stealth Spectre* (Matte midnight black with electric neon cyan trim)
    - *Coral Explorer* (Tropical reef aqua with vibrant magenta accents)
    - *Volcanic Magma* (Basalt black with fiery molten orange glow)
    - *24K Sovereign* (Pure gleaming solid gold hull)
  - **Searchlight Illumination**:
    - *Warm Halogen* (Classic)
    - *Bioluminescent Cyan*
    - *Emerald Sonar*
    - *Ultraviolet Neon*
- All equipped skins and lights immediately appear on your submarine in-game.

### 🎖️ 5. Rank Progression & Expedition Points
- Win expeditions to earn **Expedition XP** and level up your Captain Rank:
  - **Rank 1**: Cabin Boy (`🪣`)
  - **Rank 2**: Deckhand Diver (`🤿`)
  - **Rank 3**: Deep Sea Apprentice (`⚓`)
  - **Rank 4**: Oceanic Explorer (`🧭`)
  - **Rank 5**: Trench Navigator (`🗺️`)
  - **Rank 6**: Submarine Commander (`🎖️`)
  - **Rank 7**: Abyssal Master (`👑`)
  - **Rank 8**: Legendary Sea Lord (`🔱`)
- **Better playthroughs reward higher points**:
  - Math Problem Accuracy bonus (100% accuracy = highest bonus).
  - Doubloons gathered bonus.
  - Remaining hull health bonus.
  - Escape speedrun bonus.
  - **Grade Level Multiplier**: Higher grade levels give up to a **2.0x XP multiplier**, rewarding players for tackling more challenging math!

### 👓 6. Crisp, High-Legibility Visuals
- CRT filter scanlines have been completely removed for clean, sharp, high-contrast text and pixel art graphics that are easy on the eyes.

### 📐 7. Strict Math Vault Challenge ($n - 1$ Requirement)
- **Immediate Question Failure**: Any question missed is immediately marked with a red `✖` and failed with no retries.
- **Minimum Requirement**: You must answer at least $n - 1$ questions correctly out of $n$ to crack the vault and claim the treasure. A maximum of 1 mistake is tolerated.
- **Lockdown on Failure**: Missing 2 or more questions triggers security lockdown—you must flee empty-handed from the awakened Leviathan!

### 🪨 8. Solid Rock Terrain & 2x Mine Hazards
- **Solid Caverns**: Submarines can no longer pass through cavern rock blocks or overhangs. Physical AABB collision resolution prevents phasing and bounces the sub upon impact.
- **Doubled Mine Damage**: Naval mines now inflict **50 HP damage (2x damage)** along with explosive blast pushback, making careful cavern navigation crucial.

---

## ⚙ Settings & Grade Levels

Click **"⚙ SETTINGS & GRADE"** to customize:
- **Math Grade Level**:
  - **Grade 1 (Ages 6-7)**: Addition & subtraction up to 20, missing addends
  - **Grade 2 (Ages 7-8)**: 2-digit addition & subtraction, skip counting
  - **Grade 3 (Ages 8-9)**: Multiplication tables (0-10), division basics, 3-digit operations
  - **Grade 4 (Ages 9-10)**: Multi-digit multiplication, factors & division, order of operations (PEMDAS)
  - **Grade 5 (Ages 10-11)**: Decimals, fractions, percentages, multi-step parenthesis
  - **Grade 6+ (Ages 11+)**: Negative integers, pre-algebra (solve for $x$), exponents
- **Runic Lock Count**: 3, 4, 5, or 7 problems per vault
- **Audio Controls**: SFX & Chiptune Music volume sliders + Mute toggle
- **Display**: Screen shake toggle
