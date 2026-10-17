import { GameManager } from './core/GameManager.js';
import { DebugHUD } from './debug/DebugHUD.js';

document.addEventListener('DOMContentLoaded', () => {
  const gameManager = new GameManager();
  const debugHud = new DebugHUD(gameManager);

  window.gameManager = gameManager;
  window.debugHud = debugHud;

  // Global hotkeys
  window.addEventListener('keydown', (e) => {
    // M to toggle audio mute
    if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      document.getElementById('btn-mute')?.click();
    }
  });

  console.log('%c🐛 BENEVOLINK DEBUG SUITE ACTIVE %c\n- Press [P] to Pause/Resume\n- Press [.] to Step 1 Frame\n- Press [1-8] to Jump to Microgame\n- Press [W] to Force Win / [L] to Force Lose\n- Press [R] to Restart Current Game\n- Press [T] for Infinite Time / [G] for God Mode', 'background: #38bdf8; color: #000; font-weight: bold; font-size: 14px; padding: 4px 8px; border-radius: 4px;', 'color: #94a3b8; font-size: 12px;');
});
