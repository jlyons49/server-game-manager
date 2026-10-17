#!/usr/bin/env python3
"""
scripts/sync_games.py
Scans the games/ directory and automatically synchronizes games.json and src/games-data.js.
Supports an arbitrarily large number of games.
"""

import os
import json
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
GAMES_DIR = ROOT_DIR / "games"
GAMES_JSON_PATH = ROOT_DIR / "games.json"
GAMES_DATA_JS_PATH = ROOT_DIR / "src" / "games-data.js"

DEFAULT_CATEGORIES = [
    { "id": "all", "label": "All Games", "icon": "🎮" },
    { "id": "featured", "label": "Featured", "icon": "⭐" },
    { "id": "arcade", "label": "Arcade", "icon": "🕹️" },
    { "id": "3d-webgl", "label": "3D & WebGL", "icon": "🌐" },
    { "id": "simulation", "label": "Simulation", "icon": "⚙️" },
    { "id": "puzzle", "label": "Puzzle & Brain", "icon": "🧩" },
    { "id": "retro", "label": "Retro 2D", "icon": "👾" }
]

def load_existing_catalog():
    if GAMES_JSON_PATH.exists():
        try:
            with open(GAMES_JSON_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[!] Warning reading games.json: {e}")
    return {"version": "1.0.0", "portal": {}, "categories": DEFAULT_CATEGORIES, "games": []}

def scan_games_directory(existing_games_map):
    found_games = []
    if not GAMES_DIR.exists():
        print(f"[!] games/ directory does not exist: {GAMES_DIR}")
        return found_games

    for entry in sorted(GAMES_DIR.iterdir()):
        if not entry.is_dir():
            continue

        slug = entry.name
        index_file = entry / "index.html"
        if not index_file.exists():
            continue

        # Check if already present in catalog
        existing = existing_games_map.get(slug)
        if existing:
            # Preserve existing metadata
            found_games.append(existing)
            continue

        # New game detected: construct initial metadata
        game_meta_file = entry / "game.json"
        pkg_file = entry / "package.json"
        readme_file = entry / "README.md"

        title = slug.replace("-", " ").title()
        description = "A web game deployed on the Hefty Raccoon arcade portal."
        version = "1.0.0"
        tags = ["Web Game", "Arcade"]
        category = "arcade"

        if game_meta_file.exists():
            try:
                with open(game_meta_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    title = data.get("title", title)
                    description = data.get("description", description)
                    category = data.get("category", category)
                    tags = data.get("tags", tags)
                    version = data.get("version", version)
            except Exception as e:
                print(f"[!] Error parsing {game_meta_file}: {e}")
        elif pkg_file.exists():
            try:
                with open(pkg_file, "r", encoding="utf-8") as f:
                    pkg = json.load(f)
                    if "description" in pkg:
                        description = pkg["description"]
                    if "version" in pkg:
                        version = pkg["version"]
                    if "keywords" in pkg:
                        tags = pkg["keywords"]
            except Exception:
                pass

        new_entry = {
            "id": slug,
            "title": title,
            "subtitle": "Interactive Web Game",
            "tagline": "Play instantly in your browser",
            "description": description,
            "category": category,
            "categories": [category],
            "tags": tags,
            "rating": 4.8,
            "players": "1 Player",
            "controls": "Keyboard & Mouse/Touch",
            "entryUrl": f"games/{slug}/index.html",
            "author": "Community / Contributor",
            "version": version,
            "releaseDate": "2026-10-17",
            "featured": False,
            "badge": "NEW",
            "icon": "🕹️",
            "coverGradient": "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            "accentColor": "#00f0ff"
        }
        print(f"[+] Auto-discovered new game: {slug} -> '{title}'")
        found_games.append(new_entry)

    return found_games

def main():
    catalog = load_existing_catalog()
    existing_map = {g["id"]: g for g in catalog.get("games", [])}

    updated_games = scan_games_directory(existing_map)
    catalog["games"] = updated_games

    # Write games.json
    with open(GAMES_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    print(f"[OK] Successfully synced games.json ({len(updated_games)} games active)")

    # Write src/games-data.js fallback
    js_content = f"// Auto-generated fallback embedded game dataset\nexport const fallbackGamesData = {json.dumps(catalog, indent=2, ensure_ascii=False)};\n"
    with open(GAMES_DATA_JS_PATH, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"[OK] Successfully updated src/games-data.js fallback")

if __name__ == "__main__":
    main()
