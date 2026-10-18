// Fallback embedded game dataset for offline / file:// protocol compatibility
export const fallbackGamesData = {
  "version": "1.0.0",
  "portal": {
    "title": "Hefty Raccoon Games",
    "domain": "game.heftyracoon.com",
    "description": "The official arcade and game portal for Hefty Raccoon. Play cutting-edge web games, prototypes, and microgames directly in your browser with zero install."
  },
  "categories": [
    { "id": "all", "label": "All Games", "icon": "🎮" },
    { "id": "featured", "label": "Featured", "icon": "⭐" },
    { "id": "arcade", "label": "Arcade", "icon": "🕹️" },
    { "id": "puzzle", "label": "Puzzle & Brain", "icon": "🧩" },
    { "id": "retro", "label": "Retro 2D", "icon": "👾" }
  ],
  "games": [
    {
      "id": "benevolink",
      "title": "Benevolink™: Actual Individual",
      "subtitle": "Where artificial hyper-intelligence meets actual underpaid individuals",
      "tagline": "Fast-paced satirical WarioWare micro-game collection",
      "description": "A satirical WarioWare-style microgame collection built with pure modern ES Modules, HTML5 Canvas, CSS3, and the Web Audio API. Benevolink operates a planetary AI that claims 99.9% autonomy, but panics when it encounters everyday edge cases (ducks, holey socks, CAPTCHAs, smoking servers). Outsmart AI chaos with 2-5 second split-second micro-challenges, climb corporate ladder ranks, or get Promoted to Customer!",
      "category": "arcade",
      "categories": [
        "arcade",
        "featured",
        "fast-paced"
      ],
      "tags": [
        "WarioWare",
        "Satire",
        "Reflex",
        "Web Audio",
        "Procedural SFX",
        "8 Microgames"
      ],
      "rating": 4.9,
      "players": "1 Player",
      "controls": "Keyboard (A/D, Arrows, 1-9, Enter, Space) or Touch/Mouse",
      "entryUrl": "games/benevolink/index.html",
      "author": "Josh Lyons",
      "version": "2.0.0",
      "releaseDate": "2026-10-16",
      "featured": true,
      "badge": "HOT & FEATURED",
      "icon": "🤖",
      "coverGradient": "linear-gradient(135deg, #1e3a8a 0%, #4338ca 50%, #6d28d9 100%)",
      "accentColor": "#38bdf8",
      "features": [
        "8 Distinct Satirical Microgames (Autonomous Car, Sock Sorter, Titanic Cruise, Mars Rover, Captcha Overlord, etc.)",
        "Procedural Synthesized Web Audio Engine with dynamic BGM tempo ramping",
        "SpeechSynthesis Voice Narration and responsive PIP strike system",
        "Dedicated Training / HR Practice Room simulator"
      ]
    },
    {
      "id": "jj-game-prototype",
      "title": "Abyssal Vault: Sunken Treasure",
      "subtitle": "Retro Deep-Sea Expedition & Math Cipher Salvage",
      "tagline": "Command a submarine, dodge sea monsters, and crack ancient ciphers",
      "description": "A retro pixel art browser adventure where you command an explorer submarine diving into oceanic caverns to recover cursed treasure from shipwrecks, cracking mathematical runic ciphers along the way, and making a daring high-speed escape from an awakened Sea Monster.",
      "category": "retro",
      "categories": [
        "retro",
        "arcade",
        "puzzle"
      ],
      "tags": [
        "Canvas 2D",
        "Retro Pixel Art",
        "Submarine",
        "Math Ciphers",
        "Web Audio"
      ],
      "rating": 4.8,
      "players": "1 Player",
      "controls": "Keyboard (W/A/S/D / Arrows, Space for Sonar, F/E for Torpedo) & Touch D-Pad",
      "entryUrl": "games/jj-game-prototype/index.html",
      "author": "Josh Lyons",
      "version": "1.0.0",
      "releaseDate": "2026-10-17",
      "featured": false,
      "badge": "RETRO 2D",
      "icon": "⚓",
      "coverGradient": "linear-gradient(135deg, #0f172a 0%, #0369a1 50%, #0284c7 100%)",
      "accentColor": "#38bdf8",
      "features": [
        "Atmospheric pixel-art 2D ocean canvas engine with dynamic lighting and bubble particles",
        "Interactive math runic ciphers and ancient shipwreck salvage",
        "Oxygen restoration vents, depth minefields, and sonar ping radar",
        "High-speed ascent chase sequence against the Abyssal Leviathan"
      ]
    },
    {
      "id": "soccer-typing",
      "title": "Soccer Typing: Striker Challenge",
      "subtitle": "Touch typing speed & penalty shootout arcade challenge",
      "tagline": "Dribble up, aim for the top bins, and beat the keeper with lightning-fast typing",
      "description": "An arcade soccer typing game inspired by Slam Dunk Typing. Put your speed and precision to the test across scalable difficulty tiers—from Rookie training to World Class legends. Target the high-scoring top corners, outwit the goalkeeper during dynamic approach runs, and fill your trophy case with golden boots and championships!",
      "category": "arcade",
      "categories": [
        "arcade",
        "featured",
        "puzzle"
      ],
      "tags": [
        "Typing",
        "Soccer",
        "Arcade",
        "Canvas 2.5D",
        "Web Audio",
        "Trophy Cabinet"
      ],
      "rating": 4.9,
      "players": "1 Player",
      "controls": "Keyboard (A-Z, Backspace)",
      "entryUrl": "games/soccer-typing/index.html",
      "author": "Josh Lyons",
      "version": "1.0.0",
      "releaseDate": "2026-10-18",
      "featured": true,
      "badge": "NEW RELEASE",
      "icon": "⚽",
      "coverGradient": "linear-gradient(135deg, #064e3b 0%, #047857 50%, #00f0ff 100%)",
      "accentColor": "#00ff66",
      "features": [
        "Dynamic 10-shot striker shootout with lead-up approach run timer",
        "High-value corner targeting (Top Bins / Upper 90) with goalkeeper AI reaction physics",
        "Scalable difficulty tiers from Rookie (3-4 letters) to World Class (7-13 letters)",
        "Persistent high score tracker and 10 unlockable career trophies",
        "Full 11v11 match play preview and tactical chalkboard roadmap",
        "Procedural Web Audio sound effects: referee whistles, crowd roar, kicks, and net swishes"
      ]
    }
  ]
};
