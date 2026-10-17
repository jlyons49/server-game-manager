# ⚓ Abyssal Vault 3D: Realistic Deep Sea Expedition

An immersive realistic 3D reproduction of **Abyssal Vault**, built using **Three.js (WebGL)**, **Vanilla ES6 Modules**, and the **Web Audio API**.

Players command a high-tech exploration submarine diving through 2,260 meters of oceanic trench to salvage historical sunken shipwrecks, decipher ancient 3D mechanical cipher vaults using mathematics curricula (Grades 1 through 6+), and survive a high-speed ascent against the predatory **Abyssal Leviathan**.

---

## 🌊 Realistic 3D Features & Architecture

### 1. Dynamic 3D Ocean Trench & Water Physics
- **3 Depth Zones with Adaptive Water Fog & Caustics**:
  - **Sunlit Zone (0m – 500m)**: Turquoise crystal waters, piercing sun caustic rays, animated schools of tropical reef fish.
  - **Twilight Zone (500m – 1,400m)**: Deep sapphire blue waters, undulating bioluminescent jellyfish with glowing tentacles, anchored naval mines.
  - **Abyssal Trench (1,400m – 2,260m)**: Inky pitch-black abyss illuminated exclusively by forward searchlights, glowing anglerfish lures, geothermal fissures, and active sonar ping waves.
- **Marine Snow & Fluid Particle Simulation**:
  - Drifting organic particulate matter with Brownian motion.
  - Propeller cavitation bubble trails and afterburner thruster wakes.
  - Hydrothermal black smoker vents billowing thermal particles and continuous oxygen bubble streams.
  - Deep-sea depth charge explosions with water shockwaves and debris.

### 2. High-Fidelity 3D Explorer Submarine
- **Articulated PBR Mechanical Model**:
  - Translucent cockpit observation dome with interior instrument console glow.
  - Tilting bow dive planes (hydrofoils) and stern rudder reacting to vertical and lateral maneuvers.
  - 4-blade brass screw propeller spinning dynamically proportional to throttle.
  - Dual heavy forward searchlights with volumetric light cone meshes.
  - Side torpedo launch tubes and navigational strobe beacons.
- **Dual Perspective Camera System**:
  - **3rd Person Chase View**: Smooth spring-arm trailing camera with dynamic look-ahead and speed FOV kick.
  - **1st Person Cockpit View**: Direct observation dome perspective with interior frame and depth telemetry.
  - Toggle anytime using the **`C`** key or on-screen camera button.

### 3. Historical 3D Shipwrecks (Selectable at Base Command)
1. **The Black Barnacle** (17th Century Pirate Galleon): Rotten wooden timbers, snapped main mast with cross yardarm, tattered sails, deck cannons, swaying sea kelp, and the cursed iron-banded treasure chest.
2. **R.M.S. Titanic** (1912 Luxury Ocean Liner): Split riveted steel hull, promenade decks, collapsed funnels with soot black rims, massive anchor chains, and the Purser's heavy steel safe.
3. **B-17 Flying Fortress** (WWII Long-Range Patrol Bomber): Olive-drab aluminum fuselage, greenhouse canopy, bent propellers on radial engine cowlings, and the armored military flight recorder lockbox.

### 4. 3D Interactive Cipher Vaults (The Math Challenge)
- Docking at the shipwreck deck (~2,100m) transitions the camera seamlessly into the 3D Vault.
- 3D physical combination dials and runic tumblers spin mechanically upon solving grade-tailored math problems.
- Supports **Grade 1 through Grade 6+** standardized curricula.
- Disengaging all locks pops open the 3D vault lid, revealing the legendary salvaged relic (*The Heart of the Sea*, *The Heart of the Ocean Diamond*, or *Top Secret Flight Recorder*).

### 5. The Abyssal Leviathan Boss
- 14-vertebrae articulated serpentine dragon-eel body animated using wave kinematics.
- Articulated snapping jaws lined with razor teeth that lunge at the player.
- Dynamic rage state (scales and glowing eyes flare into blazing crimson during charge attacks).
- Can be stunned with **Sonic Torpedoes (`F`)**, halting its pursuit for several seconds.

### 6. Procedural Web Audio Engine
- Realistic hydrophone underwater rumble and variable RPM engine cavitation.
- Dual-frequency active Sonar Ping with realistic echo reverberation.
- Hydrothermal vent bubbling and steam release.
- Proximity mine warning radar beeps and depth charge underwater detonations.
- Terrifying sub-bass Leviathan roar with resonant low-pass sweep.
- Adaptive musical tracks: Ambient Descent, Mysterious Vault Cipher, and 144 BPM Leviathan Chase.

### 7. Meta-Progression & Real-Time 3D Drydock
- **3D Turntable Customizer**: Inspect and rotate your submarine in real-time 3D inside the Drydock shop.
- **Hull Paint Jobs**: Classic Nautilus, Stealth Spectre, Coral Explorer, Volcanic Magma, and 24K Sovereign.
- **Searchlight Colors**: Warm Halogen, Bioluminescent Cyan, Emerald Sonar, and Ultraviolet Neon.
- **8 Rank Tiers**: From *Cabin Boy* up to *Legendary Sea Lord* based on earned Expedition XP.
- Persistent doubloon wallet and statistics saved in browser `localStorage`.

---

## 🕹️ Controls Guide

| Action | Primary Keyboard | Touch / Mobile Screen |
| :--- | :--- | :--- |
| **Throttle Forward / Reverse** | `W` / `S` or `↑` / `↓` | D-Pad Up / Down |
| **Steer Heading (Yaw & Bank)** | `A` / `D` or `←` / `→` | D-Pad Left / Right |
| **Ballast Surface / Dive** | `Q` / `E` or `R` / `V` | `SURFACE` / `DIVE` Buttons |
| **Thruster Afterburner Boost** | `Shift` (Hold) | `⚡ BOOST` Button |
| **Active Sonar Echo Ping** | `Spacebar` | `📡 SONAR` Button |
| **Launch Sonic Torpedo** | `F` or `Enter` | `🚀 FIRE` Button |
| **Toggle Camera View (1st/3rd)** | `C` | `🎥 3RD` Button |
| **Select Cipher Option** | `1`, `2`, `3`, `4` | Tap Option Card |
| **Return to Base Command** | `Esc` / HUD `🏠` | Tap `🏠` in HUD |

---

## 🚀 Running the Game

Because the game uses standard modern ES6 JavaScript modules and Three.js, serve the folder using any local HTTP web server:

```bash
# Using Python
python -m http.server 8080

# Or using any static file server
```

Then open your browser at:
`http://localhost:8080`
