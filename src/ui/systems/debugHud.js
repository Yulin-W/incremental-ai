/**
 * debugHud.js
 * Local development testing HUD with production immunity and Shift+D keyboard shortcut.
 */

import { formatNumber } from '../utils/formatters.js';
import { spawnClickParticle } from '../feedback/particles.js';

export class DebugHudController {
  constructor(ui) {
    this.ui = ui;
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    const hud = document.createElement('div');
    hud.id = 'debug-hud';
    hud.className = 'debug-hud';
    hud.innerHTML = `
      <div class="debug-hud-panel" id="debug-hud-panel">
        <div class="debug-hud-header">
          <span class="debug-hud-title">🧪 DEBUG MODE (Local)</span>
          <button class="btn-debug-minimize" id="btn-debug-minimize" aria-label="Minimize Debug HUD">✕</button>
        </div>
        <div class="debug-hud-body">
          <button class="btn-debug-action" id="btn-debug-double" aria-label="Multiply Current Insights by 10 (Shift+D)">
            <span>⚡</span>
            <span>x10 Insights</span>
          </button>
          <div class="debug-hud-shortcut">Shortcut: <code>Shift+D</code></div>
        </div>
      </div>
      <button class="debug-hud-badge-btn" id="btn-debug-badge" aria-label="Open Debug HUD" style="display:none;">
        <span>🧪</span>
        <span>DEBUG</span>
      </button>
    `;

    document.body.appendChild(hud);

    const panel = hud.querySelector('#debug-hud-panel');
    const badgeBtn = hud.querySelector('#btn-debug-badge');
    const doubleBtn = hud.querySelector('#btn-debug-double');
    const minimizeBtn = hud.querySelector('#btn-debug-minimize');

    const triggerMultiply = (e) => {
      const prevInsights = this.ui.engine.insights;
      this.ui.engine.multiplyInsights(10);
      const gained = this.ui.engine.insights - prevInsights;
      spawnClickParticle(
        e && e.clientX ? e : { clientX: window.innerWidth - 120, clientY: window.innerHeight - 80 },
        `+${formatNumber(gained)} (x10 Cheat)`,
        this.ui.dom.btnContemplate
      );
      this.ui.showToast('🧪 Debug Cheat Activated', `Insights multiplied by 10 (+${formatNumber(gained)} 💡)`, '⚡');
    };

    doubleBtn.addEventListener('click', (e) => {
      triggerMultiply(e);
    });

    minimizeBtn.addEventListener('click', () => {
      panel.style.display = 'none';
      badgeBtn.style.display = 'flex';
    });

    badgeBtn.addEventListener('click', () => {
      badgeBtn.style.display = 'none';
      panel.style.display = 'block';
    });

    // Global keyboard shortcut: Shift + D
    window.addEventListener('keydown', (e) => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        e.preventDefault();
        triggerMultiply(null);
      }
    });

    console.info('%c[Incremental AI] DEBUG Mode Active (Local-Only)', 'color: #10b981; font-weight: bold; font-size: 13px;');
  }
}
