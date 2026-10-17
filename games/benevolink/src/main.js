import { GameManager } from './core/GameManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const gameManager = new GameManager();
  window.gameManager = gameManager;

  // Global hotkeys
  window.addEventListener('keydown', (e) => {
    // M to toggle audio mute
    if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey) {
      document.getElementById('btn-mute')?.click();
    }
  });

  console.log('🤖 Benevolink™ Colleague Portal v2.0 initialized. Ready for human cognitive outsourcing.');
});
