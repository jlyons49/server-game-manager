# 🕹️ How to Add a New Game to the Portal

The Hefty Raccoon Game Portal is designed to scale to an arbitrarily large number of games. Adding a game requires zero changes to the core portal codebase.

---

## 🚀 Quick Steps (2 Minutes)

### Step 1: Add Your Game Folder
Place your self-contained game folder into the `games/` directory:

```text
games/
  └── my-new-game/
      ├── index.html        <-- Main entry point (required)
      ├── style.css
      ├── src/
      └── assets/
```

> **Important**: Ensure all asset and script paths inside your game are **relative** (`./style.css`, `./src/main.js`, `./assets/...`) so the game works whether loaded in an iframe or accessed directly at `/games/my-new-game/`.

---

### Step 2: Auto-Discover or Register

#### Option A: Auto-Discovery via Python Script (Recommended)
Run the sync script from the repository root:

```bash
python scripts/sync_games.py
```

The script will:
- Detect your new folder in `games/`
- Generate an entry with default title and arcade tags in `games.json`
- Update the offline fallback dataset `src/games-data.js`

#### Option B: Add Custom Metadata (`game.json`)
If you want to pre-specify the title, tags, and description, place a `game.json` file inside your game's directory:

```json
{
  "title": "Space Invaders Deluxe",
  "category": "arcade",
  "tags": ["Space", "Retro", "Shooter"],
  "description": "Defend the galactic outpost from waves of descending alien invaders.",
  "version": "1.0.0"
}
```

Then run `python scripts/sync_games.py`.

#### Option C: Manual Registration in `games.json`
You can also directly edit `games.json` in the root:

```json
{
  "id": "my-new-game",
  "title": "My Awesome Game",
  "subtitle": "Subtitle or premise",
  "tagline": "Short punchy summary",
  "description": "Full description of gameplay...",
  "category": "arcade",
  "categories": ["arcade", "action"],
  "tags": ["Pixel Art", "2D", "Fast-Paced"],
  "rating": 4.9,
  "players": "1 Player",
  "controls": "Arrow Keys / Spacebar",
  "entryUrl": "games/my-new-game/index.html",
  "author": "Your Name",
  "version": "1.0.0",
  "releaseDate": "2026-10-17",
  "featured": false,
  "badge": "NEW",
  "icon": "🚀",
  "coverGradient": "linear-gradient(135deg, #1e3a8a, #7c3aed)",
  "accentColor": "#00f0ff"
}
```

---

### Step 3: (Optional) Add a Floating Return Pill
To allow players to return to the Arcade Hub if they open your game URL directly (outside the portal iframe), add this snippet just before `</body>` in your game's `index.html`:

```html
<!-- Floating Hub Return Pill -->
<a href="../../" id="hub-return-pill" style="display:none; position:fixed; bottom:14px; left:14px; z-index:999999; background:rgba(9,13,22,0.85); backdrop-filter:blur(8px); border:1px solid rgba(0,240,255,0.4); color:#00f0ff; padding:7px 14px; border-radius:999px; font-family:-apple-system,BlinkMacSystemFont,sans-serif; font-size:12px; font-weight:700; text-decoration:none; box-shadow:0 4px 14px rgba(0,0,0,0.5);">🕹️ Back to Arcade Hub</a>
<script>
  if (window.self === window.top) {
    const p = document.getElementById('hub-return-pill');
    if (p) p.style.display = 'inline-flex';
  }
</script>
```

---

### Step 4: Commit and Push
```bash
git add .
git commit -m "feat: add my-new-game to arcade portal"
git push origin main
```

GitHub Actions will automatically deploy the updated portal and new game to `game.heftyracoon.com`!
