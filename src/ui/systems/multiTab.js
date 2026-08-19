/**
 * multiTab.js
 * Multi-tab session coordination, BroadcastChannel arbitration, and inactive tab save protection.
 */

import { ERAS } from '../../data/index.js';

export class MultiTabCoordinator {
  constructor(ui) {
    this.ui = ui;
    this.tabId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'tab_' + Math.random().toString(36).slice(2) + Date.now();
    this.isTabActivePrimary = true;
    this.broadcastChannel = null;

    this.setupChannel();
    this.bindEvents();
  }

  setupChannel() {
    if (typeof window === 'undefined') return;

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('incremental_ai_session');
        this.broadcastChannel.onmessage = (event) => {
          if (!event || !event.data) return;
          const { type, tabId } = event.data;
          if (type === 'CLAIM_PRIMARY' && tabId !== this.tabId) {
            this.pauseGame();
          }
        };

        // Broadcast primary claim for newly opened tab
        this.broadcastChannel.postMessage({ type: 'CLAIM_PRIMARY', tabId: this.tabId });
      } catch (err) {
        console.warn('BroadcastChannel initialization fallback:', err);
      }
    }

    // Storage event fallback for cross-tab isolation
    window.addEventListener('storage', (e) => {
      if (e.key === 'incremental_ai_active_tab' && e.newValue && e.newValue !== this.tabId) {
        this.pauseGame();
      }
    });

    try {
      window.localStorage.setItem('incremental_ai_active_tab', this.tabId);
    } catch (e) {}
  }

  bindEvents() {
    if (this.ui.dom.btnResumeTab) {
      this.ui.dom.btnResumeTab.addEventListener('click', () => this.resumeGame());
    }

    // Window Lifecycle Persistence Hooks (guarded against inactive duplicate tabs)
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.isTabActivePrimary) {
          this.ui.engine.saveToStorage();
        }
      });
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && this.isTabActivePrimary) {
          this.ui.engine.saveToStorage();
        }
      });
    }
  }

  pauseGame() {
    this.isTabActivePrimary = false;
    this.ui.isTabActivePrimary = false;
    if (this.ui.dom.multiTabOverlay) {
      this.ui.dom.multiTabOverlay.style.display = 'flex';
      void this.ui.dom.multiTabOverlay.offsetHeight;
      this.ui.dom.multiTabOverlay.classList.add('active');
      this.ui.dom.multiTabOverlay.setAttribute('aria-hidden', 'false');
    }
  }

  resumeGame() {
    if (this.ui.dom.multiTabOverlay) {
      if (typeof document !== 'undefined' && document.activeElement && this.ui.dom.multiTabOverlay.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      this.ui.dom.multiTabOverlay.classList.remove('active');
      this.ui.dom.multiTabOverlay.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        if (!this.ui.dom.multiTabOverlay.classList.contains('active')) {
          this.ui.dom.multiTabOverlay.style.display = 'none';
        }
      }, 250);
    }

    // Re-claim primary ownership
    this.isTabActivePrimary = true;
    this.ui.isTabActivePrimary = true;
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'CLAIM_PRIMARY', tabId: this.tabId });
      } catch (e) {}
    }
    try {
      window.localStorage.setItem('incremental_ai_active_tab', this.tabId);
    } catch (e) {}

    // Reload latest save state from storage
    this.ui.engine.loadFromStorage();
    const currentEra = ERAS.find(e => e.id === this.ui.engine.currentEraId) || ERAS[0];
    this.ui.updateTheme(currentEra.themeClass);
    this.ui.renderAll();
    this.ui.engine.lastTickTime = performance.now();
    this.ui.showToast('▶️ Resumed in This Tab', 'Latest timeline progress has been synchronized.', '⚡');
  }
}
