# 🕹️ How to Add a New Game to the Portal

The Hefty Raccoon Game Portal uses a **decoupled, multi-repository architecture**. Each game lives in its own Git repository and deploys directly into its own folder on the production server.

---

## 🚀 Adding a Game in 3 Easy Steps

### Step 1: Configure Your Game Repo's Deploy Workflow
In your game's repository, add or update `.github/workflows/deploy.yml`:

```yaml
name: Deploy Game to Production

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to Hefty Raccoon Arcade
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Sync Game to Server Subfolder
        uses: easingthemes/ssh-deploy@v5.0.3
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SERVER_SSH_KEY }}
          REMOTE_HOST: ${{ secrets.SERVER_HOST || '23.239.18.53' }}
          REMOTE_USER: ${{ secrets.SERVER_USER || 'root' }}
          REMOTE_PORT: ${{ secrets.SERVER_PORT || '2348' }}
          TARGET: "/var/www/html/games/YOUR_GAME_SLUG"
          ARGS: "-rlgoDzvc -i --delete"
          EXCLUDE: "/.git/, /.github/, /node_modules/, *.md, package.json"
          SCRIPT_BEFORE: |
            mkdir -p /var/www/html/games/YOUR_GAME_SLUG
          SCRIPT_AFTER: |
            chown -R www-data:www-data /var/www/html/games/YOUR_GAME_SLUG
            chmod -R 755 /var/www/html/games/YOUR_GAME_SLUG
```

> **Note**: Add your `SERVER_SSH_KEY` secret in the game repo's **Settings > Secrets and variables > Actions**.

---

### Step 2: Register the Game in `server-game-manager`
In the `server-game-manager` repository, add a new entry to [`games.json`](games.json):

```json
{
  "id": "YOUR_GAME_SLUG",
  "title": "Your Game Title",
  "subtitle": "Short punchy subtitle",
  "tagline": "One sentence summary",
  "description": "Full gameplay description...",
  "category": "arcade",
  "categories": ["arcade", "action"],
  "tags": ["2D", "Fast-Paced", "Web Audio"],
  "rating": 4.9,
  "players": "1 Player",
  "controls": "Arrow Keys / Spacebar",
  "entryUrl": "games/YOUR_GAME_SLUG/index.html",
  "author": "Your Name",
  "version": "1.0.0",
  "releaseDate": "2026-10-17",
  "featured": false,
  "badge": "NEW",
  "icon": "🚀",
  "coverGradient": "linear-gradient(135deg, #1e3a8a, #7c3aed)",
  "accentColor": "#00f0ff",
  "features": [
    "Key feature 1",
    "Key feature 2"
  ]
}
```

---

### Step 3: Commit and Push
- Push your game repository to deploy the game files.
- Push `server-game-manager` to update the portal catalog on [game.heftyracoon.com](https://game.heftyracoon.com).
