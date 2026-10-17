# 🦝 Hefty Raccoon Games — Multi-Game Selection Portal

> **Live Production URL:** [https://game.heftyracoon.com](https://game.heftyracoon.com)  
> **Server:** Linode Debian VPS (`game.heftyracoon.com:2348` via Dynamic DNS) running Nginx & Certbot SSL

A modern, responsive web arcade portal that allows players to discover and launch multiple games directly in the browser with zero installation. Built with pure vanilla HTML5, modern CSS3, ES Modules, and the Web Audio API (zero bundlers, zero build steps, instant HTTP/2 static delivery).

---

## 🎮 Included Games

1. **Benevolink™: Actual Individual** (`games/benevolink/`)
   - *Moved from `game-prototype-2`*
   - A fast-paced satirical WarioWare-style microgame collection where a planetary AI panics over everyday edge cases and outsources split-second decisions to human operators.
   - Features 8 procedural microgames, synthesized dynamic BGM tempo scaling, and HR training room.
2. **Abyssal Vault 3D: Deep Sea Expedition** (`games/abyssal-vault-3d/`)
   - High-fidelity 3D WebGL underwater exploration simulator built with Three.js.
   - Pilot an articulated exploration submarine across 3 ocean zones to salvage sunken shipwrecks (Pirate Galleon, Titanic, B-17 Bomber) and escape the Leviathan.
3. **Abyssal Vault 2D: Sunken Treasure** (`games/abyssal-vault-2d/`)
   - Classic 2D canvas retro submarine salvage expedition with procedural minefields and math cipher puzzles.

---

## ✨ Portal Capabilities & Architecture

- **Arbitrarily Large Number of Games**:
  - Data-driven catalog via [`games.json`](file:///c:/Users/Josh/repos/server-game-manager/games.json) with client-side indexing.
  - Efficient paginated navigation (`12` cards/page) that scales smoothly to hundreds or thousands of games without DOM bloat.
  - Automated auto-discovery script (`python scripts/sync_games.py`).
- **Direct Fullscreen Game Launching**:
  - Instant direct navigation to each game with zero wrapper overhead or intrusive overlays.
- **Deep Linking & Sharing**:
  - Direct URL hash routing: `https://game.heftyracoon.com/#game=benevolink` opens details modal.
  - One-click share button with clipboard feedback.
- **Instant Search & Taxonomy**:
  - Real-time search across titles, descriptions, categories, and tags.
  - Category filters (Arcade, 3D & WebGL, Simulation, Puzzle, Retro 2D).
  - Sorting (Featured, Rating, Title A-Z, Newest).
  - View layout switcher (Responsive Card Grid vs. Compact List).

---

## 📁 Repository Structure

```text
server-game-manager/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Actions rsync deploy (protects /games/)
├── .gitignore
├── games.json                  # Central catalog of all registered games
├── index.html                  # Main portal interface
├── style.css                   # Cyber-arcade responsive stylesheet
├── README.md                   # Project overview & server documentation
├── HOW_TO_ADD_A_GAME.md        # Guide for connecting new game repos
├── assets/
│   ├── favicon.svg             # Raccoon arcade favicon
│   └── raccoon-logo.svg        # Vector arcade branding logo
├── scripts/
│   └── sync_games.py           # Helper script for games catalog sync
└── src/
    ├── app.js                  # Portal controller (search, sort, filter, pagination)
    └── games-data.js           # Offline/file protocol fallback dataset
```

> **Note**: Individual games live in their own Git repositories and deploy directly to `/var/www/html/games/<game-slug>` on the production server. The portal protects the `/games/` folder from being overwritten or deleted.

---

## 🚀 Automated Deployment

Every push to the `main` or `master` branch triggers the GitHub Actions workflow in `.github/workflows/deploy.yml`:
1. Checks out the code.
2. Synchronizes repository files to `/var/www/html` on `game.heftyracoon.com:2348` via SSH `rsync`.
3. Automatically sets correct permissions (`www-data:www-data`, `755`).
4. Gracefully reloads Nginx.

---

## 🛠️ Local Development & Testing

Start a local HTTP server:
```bash
python -m http.server 8000
```
Open `http://localhost:8000` in your web browser.
