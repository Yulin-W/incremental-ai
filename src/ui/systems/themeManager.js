/**
 * themeManager.js
 * Epoch theme CSS class applicator.
 */

import { ERAS } from '../../data/index.js';

export class ThemeManager {
  constructor(bodyElement = (typeof document !== 'undefined' ? document.body : null)) {
    this.body = bodyElement;
  }

  updateTheme(themeClass) {
    if (!this.body || !themeClass) return;

    // Strip old theme classes and apply new one
    ERAS.forEach(e => {
      this.body.classList.remove(e.themeClass);
      this.body.classList.remove(`theme-era-${e.id}`);
      this.body.classList.remove(`theme-epoch-${e.id}`);
    });

    this.body.classList.add(themeClass);
    if (themeClass.startsWith('theme-epoch-')) {
      this.body.classList.add(themeClass.replace('theme-epoch-', 'theme-era-'));
    }
  }
}
