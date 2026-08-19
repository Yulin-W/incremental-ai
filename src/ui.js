/**
 * ui.js
 * User Interface controller, DOM renderer, event bindings, and animation orchestrator.
 */

import { GameEngine } from './engine.js';
import { ERAS, GENERATORS, MILESTONES, ERA_EVENTS, PARADIGMS, SINGULARITY_EVENT } from './historyData.js';

export class GameUI {
  constructor() {
    this.engine = new GameEngine();
    this.activeMobileTab = 'production'; // 'production', 'timeline', 'codex'
    this.dom = {};
    this.eventQueue = [];
    this.isEventModalOpen = false;
    this.isHelpModalOpen = false;
    this.isParadigmModalOpen = false;
    this.isParadigmConfirmOpen = false;
    this.pendingParadigmChoice = null;

    this.initDOMReferences();
    this.bindEvents();
    this.setupEngineSubscriptions();
    this.loadVersion();
    
    // Expose instance for testing / harness access
    if (typeof window !== 'undefined') {
      window.gameUI = this;
    }

    // Initialize Local-Only Debug Mode if enabled
    this.isDebugMode = GameUI.isDebugModeActive();
    if (this.isDebugMode) {
      this.initDebugHUD();
    }

    // Attempt to load persisted save state
    const hasLoadedSave = this.engine.loadFromStorage();
    if (hasLoadedSave) {
      const currentEra = ERAS.find(e => e.id === this.engine.currentEraId) || ERAS[0];
      this.updateTheme(currentEra.themeClass);
    }

    // Initial Render
    this.renderAll();
    
    // Auto-display Help & How-to-Play Modal on game load strictly for new players
    if (!hasLoadedSave || (this.engine.insights === 0 && this.engine.unlockedMilestones.size === 0 && !this.engine.hasEverUnlockedSingularity)) {
      this.openHelpModal();
    }

    // Trigger initial epoch activation (strictly an epoch change/activation trigger)
    this.engine.initStartingEra();

    // Auto-save interval tracking
    this.lastAutoSaveTime = performance.now();

    // Start Animation / Game Loop
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  // ==========================================
  // VERSION LOADER
  // ==========================================
  async loadVersion() {
    try {
      const response = await fetch('./VERSION');
      if (response.ok) {
        const version = (await response.text()).trim();
        if (version) {
          this.engine.version = version;
          if (this.dom.versionTag) {
            this.dom.versionTag.textContent = `v${version}`;
          }
        }
      }
    } catch (err) {
      console.warn('Could not load VERSION file:', err);
    }
  }

  // ==========================================
  // DOM ELEMENT CACHING
  // ==========================================
  initDOMReferences() {
    this.dom = {
      body: document.body,
      // Header
      versionTag: document.querySelector('.version-tag'),
      btnHelp: document.getElementById('btn-help'),
      eraPillNumber: document.getElementById('era-pill-number'),
      eraPillName: document.getElementById('era-pill-name'),
      eraPillDates: document.getElementById('era-pill-dates'),
      eraProgressBarFill: document.getElementById('era-progress-bar-fill'),
      eraProgressText: document.getElementById('era-progress-text'),
      statInsights: document.getElementById('stat-insights'),
      statRate: document.getElementById('stat-rate'),
      
      // Unified Active Paradigm Header Button (v1.7.0)
      activeParadigmBadge: document.getElementById('active-paradigm-badge'),
      paradigmBadgeIcon: document.getElementById('paradigm-badge-icon'),
      paradigmBadgeLabel: document.getElementById('paradigm-badge-label'),
      paradigmBadgeName: document.getElementById('paradigm-badge-name'),

      // Left Panel (Production Hub)
      btnContemplate: document.getElementById('btn-contemplate'),
      clickGainBadge: document.getElementById('click-gain-badge'),
      bulkButtons: document.querySelectorAll('.btn-bulk'),
      generatorList: document.getElementById('generator-list'),

      // Center Panel (Timeline)
      milestoneGrid: document.getElementById('milestone-grid'),

      // Right Panel (Codex)
      codexContainer: document.getElementById('codex-container'),

      // Mobile Tabs & Panels
      mobileTabButtons: document.querySelectorAll('.btn-tab'),
      panelProduction: document.getElementById('panel-production'),
      panelTimeline: document.getElementById('panel-timeline'),
      panelCodex: document.getElementById('panel-codex'),

      // Help Modal Dialog
      helpModal: document.getElementById('help-modal'),
      btnCloseHelp: document.getElementById('btn-close-help'),
      btnStartPlaying: document.getElementById('btn-start-playing'),

      // Paradox-Style Historical Event Modal Dialog
      eventModal: document.getElementById('event-modal'),
      eventModalCategory: document.getElementById('event-modal-category'),
      eventModalEpochPill: document.getElementById('event-modal-epoch-pill'),
      eventModalIcon: document.getElementById('event-modal-icon'),
      eventModalTitle: document.getElementById('event-modal-title'),
      eventModalSubtitle: document.getElementById('event-modal-subtitle'),
      eventModalNarrative: document.getElementById('event-modal-narrative'),
      eventModalQuoteText: document.getElementById('event-modal-quote-text'),
      eventModalQuoteAuthor: document.getElementById('event-modal-quote-author'),
      eventModalBtnText: document.getElementById('event-modal-btn-text'),
      btnEventAcknowledge: document.getElementById('btn-event-acknowledge'),
      btnCloseEvent: document.getElementById('btn-close-event'),

      // Paradigm Shift / Singularity Modal Dialog (v1.7.0)
      paradigmModal: document.getElementById('paradigm-modal'),
      paradigm2x2Grid: document.getElementById('paradigm-2x2-grid'),
      paradigmVanillaSlot: document.getElementById('paradigm-vanilla-slot'),
      btnStayTimeline: document.getElementById('btn-stay-timeline'),
      btnCloseParadigm: document.getElementById('btn-close-paradigm'),
      btnRequestPurge: document.getElementById('btn-request-purge'),

      // Paradigm Shift Confirmation Modal Dialog (v1.7.0)
      paradigmConfirmModal: document.getElementById('paradigm-confirm-modal'),
      confirmModalBadge: document.getElementById('confirm-modal-badge'),
      confirmParadigmIcon: document.getElementById('confirm-paradigm-icon'),
      confirmParadigmTitle: document.getElementById('confirm-paradigm-title'),
      confirmParadigmDesc: document.getElementById('confirm-paradigm-desc'),
      confirmEffectsHeader: document.getElementById('confirm-effects-header'),
      confirmParadigmEffectsText: document.getElementById('confirm-paradigm-effects-text'),
      confirmWarningBox: document.getElementById('confirm-warning-box'),
      confirmWarningIcon: document.getElementById('confirm-warning-icon'),
      confirmWarningText: document.getElementById('confirm-warning-text'),
      confirmPurgeOptionContainer: document.getElementById('confirm-purge-option-container'),
      btnPurgeFromSimple: document.getElementById('btn-purge-from-simple'),
      btnCancelConfirm: document.getElementById('btn-cancel-confirm'),
      btnExecuteShift: document.getElementById('btn-execute-shift'),
      btnCloseConfirm: document.getElementById('btn-close-confirm'),

      // Toast Container
      toastContainer: document.getElementById('toast-container')
    };
  }

  // ==========================================
  // DEBUG MODE DETECTION & NUMBER UTILITIES
  // ==========================================
  static isDebugModeActive() {
    const isLocal = ['localhost', '127.0.0.1', '::1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';
    const urlParams = new URLSearchParams(window.location.search);
    const hasDebugParam = urlParams.get('debug') === 'true' || urlParams.get('debug') === '1' || window.location.hash === '#debug';
    return isLocal && hasDebugParam;
  }

  static formatNumber(num, decimals = 1) {
    if (num === null || num === undefined || isNaN(num)) return "0";
    if (num < 1000) {
      return Number.isInteger(num) ? num.toString() : num.toFixed(decimals);
    }

    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    const i = Math.floor(Math.log10(num) / 3);
    const suffixIndex = Math.min(i, suffixes.length - 1);
    
    const formatted = (num / Math.pow(10, suffixIndex * 3)).toFixed(decimals);
    return `${formatted} ${suffixes[suffixIndex]}`;
  }

  // ==========================================
  // LOCAL DEBUG HUD & TESTING CHEATS
  // ==========================================
  initDebugHUD() {
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
      const prevInsights = this.engine.insights;
      this.engine.multiplyInsights(10);
      const gained = this.engine.insights - prevInsights;
      this.spawnClickParticle(
        e && e.clientX ? e : { clientX: window.innerWidth - 120, clientY: window.innerHeight - 80 },
        `+${GameUI.formatNumber(gained)} (x10 Cheat)`
      );
      this.showToast('🧪 Debug Cheat Activated', `Insights multiplied by 10 (+${GameUI.formatNumber(gained)} 💡)`, '⚡');
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
        triggerDouble();
      }
    });

    console.info('%c[Incremental AI] DEBUG Mode Active (Local-Only)', 'color: #10b981; font-weight: bold; font-size: 13px;');
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  bindEvents() {
    // Think Button Click
    this.dom.btnContemplate.addEventListener('click', (e) => {
      const gain = this.engine.clickInsight();
      this.spawnClickParticle(e, `+${GameUI.formatNumber(gain)} 💡`);
    });

    // Bulk Buy Mode Buttons
    this.dom.bulkButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode === 'max' ? 'max' : parseInt(btn.dataset.mode, 10);
        this.engine.setBulkBuyMode(mode);
        this.dom.bulkButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderGenerators();
      });
    });

    // Mobile Tabs
    this.dom.mobileTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchMobileTab(tab);
      });
    });

    // Help Modal Open / Close Controls
    if (this.dom.btnHelp) {
      this.dom.btnHelp.addEventListener('click', () => this.openHelpModal());
    }
    if (this.dom.btnCloseHelp) {
      this.dom.btnCloseHelp.addEventListener('click', () => this.closeHelpModal());
    }
    if (this.dom.btnStartPlaying) {
      this.dom.btnStartPlaying.addEventListener('click', () => this.closeHelpModal());
    }
    if (this.dom.helpModal) {
      this.dom.helpModal.addEventListener('click', (e) => {
        if (e.target === this.dom.helpModal) {
          this.closeHelpModal();
        }
      });
    }

    // Historical Event Modal Controls
    if (this.dom.btnEventAcknowledge) {
      this.dom.btnEventAcknowledge.addEventListener('click', () => this.closeEventModal());
    }
    if (this.dom.btnCloseEvent) {
      this.dom.btnCloseEvent.addEventListener('click', () => this.closeEventModal());
    }
    if (this.dom.eventModal) {
      this.dom.eventModal.addEventListener('click', (e) => {
        if (e.target === this.dom.eventModal) {
          this.closeEventModal();
        }
      });
    }

    // Unified Paradigm Shift & Timeline Restart Button (v1.7.0)
    if (this.dom.activeParadigmBadge) {
      this.dom.activeParadigmBadge.addEventListener('click', () => {
        if (this.engine.hasEverUnlockedSingularity) {
          this.openParadigmModal();
        } else {
          this.requestSimpleRestart();
        }
      });
    }
    if (this.dom.btnCloseParadigm) {
      this.dom.btnCloseParadigm.addEventListener('click', () => this.closeParadigmModal());
    }
    if (this.dom.btnStayTimeline) {
      this.dom.btnStayTimeline.addEventListener('click', () => {
        this.closeParadigmModal();
        this.showToast('🌌 Continuing Current Timeline', 'Explore further or inspect the Codex. Paradigm Shift remains available in the header.', '📜');
      });
    }
    if (this.dom.btnRequestPurge) {
      this.dom.btnRequestPurge.addEventListener('click', () => this.requestPurgeData());
    }
    if (this.dom.btnPurgeFromSimple) {
      this.dom.btnPurgeFromSimple.addEventListener('click', () => this.requestPurgeData());
    }
    if (this.dom.paradigmModal) {
      this.dom.paradigmModal.addEventListener('click', (e) => {
        if (e.target === this.dom.paradigmModal) {
          this.closeParadigmModal();
        }
      });
    }

    // Paradigm Shift Confirmation Modal Controls (v1.7.0)
    if (this.dom.btnCloseConfirm) {
      this.dom.btnCloseConfirm.addEventListener('click', () => this.closeConfirmModal());
    }
    if (this.dom.btnCancelConfirm) {
      this.dom.btnCancelConfirm.addEventListener('click', () => this.closeConfirmModal());
    }
    if (this.dom.btnExecuteShift) {
      this.dom.btnExecuteShift.addEventListener('click', () => this.executeConfirmedShift());
    }
    if (this.dom.paradigmConfirmModal) {
      this.dom.paradigmConfirmModal.addEventListener('click', (e) => {
        if (e.target === this.dom.paradigmConfirmModal) {
          this.closeConfirmModal();
        }
      });
    }

    // Window Lifecycle Persistence Hooks
    window.addEventListener('beforeunload', () => {
      this.engine.saveToStorage();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.engine.saveToStorage();
      }
    });

    // Global Keydown Handler for Modals
    window.addEventListener('keydown', (e) => {
      // Prioritize Confirmation Modal
      if (this.dom.paradigmConfirmModal && this.dom.paradigmConfirmModal.classList.contains('active')) {
        if (e.key === 'Escape') {
          this.closeConfirmModal();
          return;
        }
      }

      // Prioritize active Paradigm Modal
      if (this.dom.paradigmModal && this.dom.paradigmModal.classList.contains('active')) {
        if (e.key === 'Escape') {
          this.closeParadigmModal();
          return;
        }
      }

      // Active Event Modal
      if (this.dom.eventModal && this.dom.eventModal.classList.contains('active')) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
          if (e.key === ' ') e.preventDefault();
          this.closeEventModal();
          return;
        }
      }

      // Help Modal Dismissal
      if (e.key === 'Escape' && this.dom.helpModal && this.dom.helpModal.classList.contains('active')) {
        this.closeHelpModal();
      }
    });
  }

  // ==========================================
  // PARADIGM SHIFT & SINGULARITY MODAL CONTROLLER
  // ==========================================
  openParadigmModal() {
    if (!this.dom.paradigmModal) return;
    this.isParadigmModalOpen = true;
    this.renderParadigmCards();
    this.dom.paradigmModal.style.display = 'flex';
    void this.dom.paradigmModal.offsetHeight;
    this.dom.paradigmModal.classList.add('active');
    this.dom.paradigmModal.setAttribute('aria-hidden', 'false');
  }

  closeParadigmModal() {
    if (!this.dom.paradigmModal) return;
    this.isParadigmModalOpen = false;
    this.dom.paradigmModal.classList.remove('active');
    this.dom.paradigmModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (!this.dom.paradigmModal.classList.contains('active')) {
        this.dom.paradigmModal.style.display = 'none';
      }
    }, 250);
  }

  renderParadigmCards() {
    if (!this.dom.paradigm2x2Grid || !this.dom.paradigmVanillaSlot) return;
    this.dom.paradigm2x2Grid.innerHTML = '';
    this.dom.paradigmVanillaSlot.innerHTML = '';

    // Render 4 Historical AI Research Paradigms in 2x2 Grid
    PARADIGMS.forEach(p => {
      const isCompleted = this.engine.completedParadigms.has(p.id);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `paradigm-action-btn ${p.themeClass || ''}`;
      btn.innerHTML = `
        <div class="paradigm-btn-top">
          <div class="paradigm-btn-title-row">
            <span class="paradigm-btn-icon">${p.icon}</span>
            <div class="paradigm-btn-title-group">
              <span class="paradigm-btn-name">${p.name}</span>
              <span class="paradigm-btn-subtitle">${p.subtitle}</span>
            </div>
          </div>
          <span class="paradigm-speed-badge badge-buff">${p.speedRating}</span>
        </div>
        <p class="paradigm-btn-flavor">${p.flavor}</p>
        <div class="paradigm-btn-effects">
          <span class="paradigm-effects-label">⚡ REPLAY BUFFS (~2x SPEED):</span>
          <span class="paradigm-effects-text">${p.effectsSummary}</span>
        </div>
        <div class="paradigm-btn-footer">
          <span class="paradigm-btn-action-text">Select & Initiate Shift →</span>
          ${isCompleted ? '<span class="paradigm-completed-badge" aria-label="Previously Mastered">★ Mastered</span>' : ''}
        </div>
      `;

      btn.addEventListener('click', () => {
        this.requestParadigmShift(p.id);
      });

      this.dom.paradigm2x2Grid.appendChild(btn);
    });

    // Render 5th Full-Width Button: Standard Historical Replay (No Buffs)
    const vanillaBtn = document.createElement('button');
    vanillaBtn.type = 'button';
    vanillaBtn.className = 'paradigm-action-btn btn-paradigm-vanilla';
    vanillaBtn.innerHTML = `
      <div class="paradigm-btn-top">
        <div class="paradigm-btn-title-row">
          <span class="paradigm-btn-icon">📜</span>
          <div class="paradigm-btn-title-group">
            <span class="paradigm-btn-name">Standard Historical Replay (No Paradigm Buffs)</span>
            <span class="paradigm-btn-subtitle">Authentic Unassisted Timeline (1600s – Present)</span>
          </div>
        </div>
        <span class="paradigm-speed-badge badge-vanilla">Authentic 1x Speed</span>
      </div>
      <div class="paradigm-btn-effects">
        <span class="paradigm-effects-label">BASELINE SPEED:</span>
        <span class="paradigm-effects-text">Experience the authentic, unassisted historical progression curve without any active paradigm speed multipliers or bonuses.</span>
      </div>
      <div class="paradigm-btn-footer">
        <span class="paradigm-btn-action-text">Replay Without Buffs →</span>
      </div>
    `;

    vanillaBtn.addEventListener('click', () => {
      this.requestParadigmShift('paradigm_none');
    });

    this.dom.paradigmVanillaSlot.appendChild(vanillaBtn);
  }

  // ==========================================
  // CONFIRMATION DIALOG FLOW (ACCIDENTAL CLICK GUARD)
  // ==========================================
  requestParadigmShift(paradigmId) {
    this.pendingParadigmChoice = paradigmId;
    
    if (this.dom.confirmModalBadge) {
      this.dom.confirmModalBadge.textContent = '⚠️ CONFIRM PARADIGM SHIFT';
    }
    if (this.dom.confirmEffectsHeader) {
      this.dom.confirmEffectsHeader.textContent = '⚡ ACTIVE BUFFS FOR NEXT RUN:';
    }
    if (this.dom.confirmWarningIcon) this.dom.confirmWarningIcon.textContent = 'ℹ️';
    if (this.dom.confirmWarningText) {
      this.dom.confirmWarningText.textContent = 'Current insights, generators, and milestone discoveries will reset to Epoch 1.';
    }
    if (this.dom.confirmPurgeOptionContainer) {
      this.dom.confirmPurgeOptionContainer.style.display = 'none';
    }
    if (this.dom.btnExecuteShift) {
      this.dom.btnExecuteShift.classList.remove('btn-danger-purge');
      this.dom.btnExecuteShift.innerHTML = '<span>🚀 Confirm & Reincarnate →</span>';
    }

    if (paradigmId && paradigmId !== 'paradigm_none') {
      const p = PARADIGMS.find(item => item.id === paradigmId);
      if (p) {
        this.dom.confirmParadigmIcon.textContent = p.icon;
        this.dom.confirmParadigmTitle.textContent = `Shift to ${p.name}?`;
        this.dom.confirmParadigmDesc.textContent = `Restart history from Epoch 1 aligned with ${p.name}. Your new run will progress ~2x faster.`;
        this.dom.confirmParadigmEffectsText.textContent = p.effectsSummary;
      }
    } else {
      this.dom.confirmParadigmIcon.textContent = '📜';
      this.dom.confirmParadigmTitle.textContent = 'Restart Standard Historical Run?';
      this.dom.confirmParadigmDesc.textContent = 'Restart history from Epoch 1 in authentic unassisted mode with standard 1x baseline speed.';
      this.dom.confirmParadigmEffectsText.textContent = 'Standard baseline speed; No active doctrine buffs or discounts.';
    }

    if (this.dom.paradigmConfirmModal) {
      this.isParadigmConfirmOpen = true;
      this.dom.paradigmConfirmModal.style.display = 'flex';
      void this.dom.paradigmConfirmModal.offsetHeight;
      this.dom.paradigmConfirmModal.classList.add('active');
      this.dom.paradigmConfirmModal.setAttribute('aria-hidden', 'false');
    }
  }

  // Pre-Clear Timeline Restart Flow (with motivational endgame hint)
  requestSimpleRestart() {
    this.pendingParadigmChoice = 'simple_restart';

    if (this.dom.confirmModalBadge) {
      this.dom.confirmModalBadge.textContent = '🔄 RESTART TIMELINE';
    }
    if (this.dom.confirmParadigmIcon) this.dom.confirmParadigmIcon.textContent = '🔄';
    if (this.dom.confirmParadigmTitle) this.dom.confirmParadigmTitle.textContent = 'Restart Timeline from Epoch 1?';
    if (this.dom.confirmParadigmDesc) {
      this.dom.confirmParadigmDesc.textContent = 'This will reset your current insights, historical automation, and milestone discoveries back to Epoch 1: Antiquity.';
    }
    if (this.dom.confirmEffectsHeader) {
      this.dom.confirmEffectsHeader.textContent = '💡 SINGULARITY PROGRESSION:';
    }
    if (this.dom.confirmParadigmEffectsText) {
      this.dom.confirmParadigmEffectsText.innerHTML = `Complete all 7 Epochs once to achieve the Technological Singularity. Clearing the game permanently upgrades this button into <strong>AI Paradigm Shifts</strong> with ~2x speed boosts!`;
    }
    if (this.dom.confirmWarningIcon) this.dom.confirmWarningIcon.textContent = 'ℹ️';
    if (this.dom.confirmWarningText) {
      this.dom.confirmWarningText.textContent = 'Active run progress will restart, but any unlocked meta achievements are preserved.';
    }
    if (this.dom.confirmPurgeOptionContainer) {
      this.dom.confirmPurgeOptionContainer.style.display = 'flex';
    }
    if (this.dom.btnExecuteShift) {
      this.dom.btnExecuteShift.classList.remove('btn-danger-purge');
      this.dom.btnExecuteShift.innerHTML = '<span>🔄 Confirm & Restart →</span>';
    }

    if (this.dom.paradigmConfirmModal) {
      this.isParadigmConfirmOpen = true;
      this.dom.paradigmConfirmModal.style.display = 'flex';
      void this.dom.paradigmConfirmModal.offsetHeight;
      this.dom.paradigmConfirmModal.classList.add('active');
      this.dom.paradigmConfirmModal.setAttribute('aria-hidden', 'false');
    }
  }

  // Full Hard Reset & Memory Purge Flow
  requestPurgeData() {
    this.pendingParadigmChoice = 'purge_all_data';

    if (this.dom.confirmModalBadge) {
      this.dom.confirmModalBadge.textContent = '⚠️ HARD RESET & PURGE';
    }
    if (this.dom.confirmParadigmIcon) this.dom.confirmParadigmIcon.textContent = '🧹';
    if (this.dom.confirmParadigmTitle) this.dom.confirmParadigmTitle.textContent = 'Permanently Erase All Saved Data?';
    if (this.dom.confirmParadigmDesc) {
      this.dom.confirmParadigmDesc.textContent = 'This will wipe all local storage data from your browser, removing all unlocked paradigms, lifetime insights, and progress back to Day 1.';
    }
    if (this.dom.confirmEffectsHeader) {
      this.dom.confirmEffectsHeader.textContent = '🧹 LOCAL BROWSER STORAGE PURGE:';
    }
    if (this.dom.confirmParadigmEffectsText) {
      this.dom.confirmParadigmEffectsText.innerHTML = `All saves will be deleted from <code>localStorage</code>. The game resets to a brand-new factory state without needing to clear browser history.`;
    }
    if (this.dom.confirmWarningIcon) this.dom.confirmWarningIcon.textContent = '🚨';
    if (this.dom.confirmWarningText) {
      this.dom.confirmWarningText.textContent = 'Warning: This action is permanent and cannot be undone!';
    }
    if (this.dom.confirmPurgeOptionContainer) {
      this.dom.confirmPurgeOptionContainer.style.display = 'none';
    }
    if (this.dom.btnExecuteShift) {
      this.dom.btnExecuteShift.innerHTML = '<span>💥 Erase All Data & Hard Reset</span>';
      this.dom.btnExecuteShift.classList.add('btn-danger-purge');
    }

    if (this.dom.paradigmConfirmModal) {
      this.isParadigmConfirmOpen = true;
      this.dom.paradigmConfirmModal.style.display = 'flex';
      void this.dom.paradigmConfirmModal.offsetHeight;
      this.dom.paradigmConfirmModal.classList.add('active');
      this.dom.paradigmConfirmModal.setAttribute('aria-hidden', 'false');
    }
  }

  closeConfirmModal() {
    if (!this.dom.paradigmConfirmModal) return;
    this.isParadigmConfirmOpen = false;
    this.dom.paradigmConfirmModal.classList.remove('active');
    this.dom.paradigmConfirmModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (!this.dom.paradigmConfirmModal.classList.contains('active')) {
        this.dom.paradigmConfirmModal.style.display = 'none';
      }
    }, 250);
  }

  executeConfirmedShift() {
    if (this.pendingParadigmChoice === 'purge_all_data') {
      this.closeConfirmModal();
      this.closeParadigmModal();
      this.engine.purgeAllData();
      const currentEra = ERAS.find(e => e.id === this.engine.currentEraId) || ERAS[0];
      this.updateTheme(currentEra.themeClass);
      this.switchMobileTab('production');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.renderAll();
      this.showToast('🧹 Memory Purged', 'All local save data and timeline progress have been completely reset.', '✨');
      return;
    }

    if (this.pendingParadigmChoice === 'simple_restart') {
      this.closeConfirmModal();
      this.engine.resetTimeline();
      this.switchMobileTab('production');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.showToast('🔄 Timeline Restarted', 'Beginning anew in Epoch 1: Antiquity & Mechanical Automata.', '📜');
      return;
    }

    const chosenId = this.pendingParadigmChoice === 'paradigm_none' ? null : this.pendingParadigmChoice;
    this.closeConfirmModal();
    this.closeParadigmModal();
    this.engine.triggerParadigmShift(chosenId);
    this.switchMobileTab('production');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================
  // HELP & HOW-TO-PLAY MODAL CONTROLLER
  // ==========================================
  openHelpModal() {
    if (!this.dom.helpModal) return;
    this.isHelpModalOpen = true;
    this.dom.helpModal.style.display = 'flex';
    // Trigger layout reflow for CSS opacity/transform transition
    void this.dom.helpModal.offsetHeight;
    this.dom.helpModal.classList.add('active');
    this.dom.helpModal.setAttribute('aria-hidden', 'false');
  }

  closeHelpModal() {
    if (!this.dom.helpModal) return;
    this.isHelpModalOpen = false;
    this.dom.helpModal.classList.remove('active');
    this.dom.helpModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (!this.dom.helpModal.classList.contains('active')) {
        this.dom.helpModal.style.display = 'none';
        // If an epoch change/activation event is queued, trigger it smoothly right after help closes
        if (!this.isEventModalOpen && this.eventQueue.length > 0) {
          this.showNextEvent();
        }
      }
    }, 250);
  }

  // ==========================================
  // PARADOX-STYLE EVENT POPUP CONTROLLER
  // ==========================================
  triggerEventPopup(eventData) {
    if (!eventData) return;
    this.eventQueue.push(eventData);
    if (!this.isEventModalOpen && !this.isHelpModalOpen) {
      this.showNextEvent();
    }
  }

  showNextEvent() {
    if (this.eventQueue.length === 0) {
      this.isEventModalOpen = false;
      return;
    }

    const event = this.eventQueue.shift();
    this.isEventModalOpen = true;

    if (this.dom.eventModalCategory) {
      this.dom.eventModalCategory.textContent = event.category || "🏛️ NEW EPOCH REACHED";
    }
    if (this.dom.eventModalEpochPill) {
      this.dom.eventModalEpochPill.textContent = `Epoch ${event.epochNumber || event.epochId || event.eraId || 1}`;
    }
    if (this.dom.eventModalIcon) {
      this.dom.eventModalIcon.textContent = event.icon || "📜";
    }
    if (this.dom.eventModalTitle) {
      const epochNum = event.epochNumber || event.epochId || event.eraId || 1;
      this.dom.eventModalTitle.textContent = event.title.startsWith("Epoch") 
        ? event.title 
        : `Epoch ${epochNum}: ${event.title}`;
    }
    if (this.dom.eventModalSubtitle) {
      this.dom.eventModalSubtitle.textContent = event.subtitle || "";
    }
    if (this.dom.eventModalNarrative) {
      this.dom.eventModalNarrative.textContent = event.narrative || "";
    }
    if (this.dom.eventModalQuoteText) {
      this.dom.eventModalQuoteText.textContent = event.quote ? event.quote.text : "";
    }
    if (this.dom.eventModalQuoteAuthor) {
      this.dom.eventModalQuoteAuthor.textContent = event.quote ? `— ${event.quote.author}` : "";
    }

    if (this.dom.eventModalBtnText) {
      this.dom.eventModalBtnText.textContent = event.buttonText || "Acknowledge & Proceed →";
    }

    if (this.dom.eventModal) {
      this.dom.eventModal.style.display = "flex";
      void this.dom.eventModal.offsetHeight;
      this.dom.eventModal.classList.add("active");
      this.dom.eventModal.setAttribute("aria-hidden", "false");
    }
  }

  closeEventModal() {
    if (!this.dom.eventModal || !this.isEventModalOpen) return;
    this.dom.eventModal.classList.remove("active");
    this.dom.eventModal.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      if (!this.dom.eventModal.classList.contains("active")) {
        this.dom.eventModal.style.display = "none";
        this.isEventModalOpen = false;
        if (this.eventQueue.length > 0) {
          this.showNextEvent();
        }
      }
    }, 250);
  }

  switchMobileTab(tab) {
    this.activeMobileTab = tab;
    this.dom.mobileTabButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });

    this.dom.panelProduction.classList.toggle('active-mobile-panel', tab === 'production');
    this.dom.panelTimeline.classList.toggle('active-mobile-panel', tab === 'timeline');
    this.dom.panelCodex.classList.toggle('active-mobile-panel', tab === 'codex');
  }

  // Floating text animation for clicks
  spawnClickParticle(e, text) {
    const particle = document.createElement('div');
    particle.className = 'click-particle';
    particle.innerText = text;

    const rect = this.dom.btnContemplate.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || (rect.top + rect.height / 2);

    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      color: var(--accent-primary);
      font-family: var(--font-mono);
      font-weight: 800;
      font-size: 0.95rem;
      pointer-events: none;
      z-index: 10000;
      animation: float-up 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 750);
  }

  // ==========================================
  // ENGINE SUBSCRIPTIONS & TOASTS
  // ==========================================
  setupEngineSubscriptions() {
    this.engine.on('stateChange', () => {
      this.renderHeader();
      this.renderGenerators();
      this.renderTimeline();
      this.renderCodex();
    });

    this.engine.on('milestoneUnlock', (milestone) => {
      this.showToast('✨ Breakthrough Unlocked!', milestone.title, '🔬');
    });

    this.engine.on('eraUnlock', (era) => {
      this.showToast(`🏛️ Entering Epoch ${era.id}: ${era.name}`, era.subtitle, '⏳');
      this.updateTheme(era.themeClass);

      const eventData = ERA_EVENTS[era.id] || EPOCH_EVENTS[era.id];
      if (eventData) {
        this.triggerEventPopup(eventData);
      }
    });

    this.engine.on('singularityReached', (singularityData) => {
      this.showToast('🌌 Frontier Singularity Achieved!', 'All 28 historical milestones discovered! Paradigm Shift is now unlocked.', '🌌');
      this.openParadigmModal();
    });

    this.engine.on('paradigmShift', (shiftData) => {
      const paradigm = this.engine.getActiveParadigm();
      const name = paradigm ? paradigm.name : 'Standard Historical Mode';
      this.showToast('🌌 Paradigm Shift Activated', `Beginning historical cycle with ${name}.`, '🚀');
    });
  }


  showToast(title, message, icon = '💡') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    this.dom.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  updateTheme(themeClass) {
    // Strip old theme classes and apply new one
    ERAS.forEach(e => {
      this.dom.body.classList.remove(e.themeClass);
      this.dom.body.classList.remove(`theme-era-${e.id}`);
      this.dom.body.classList.remove(`theme-epoch-${e.id}`);
    });
    this.dom.body.classList.add(themeClass);
    if (themeClass.startsWith('theme-epoch-')) {
      this.dom.body.classList.add(themeClass.replace('theme-epoch-', 'theme-era-'));
    }
  }

  // ==========================================
  // RENDERING METHODS
  // ==========================================

  renderAll() {
    this.renderHeader();
    this.renderGenerators();
    this.renderTimeline();
    this.renderCodex();
    
    const currentEra = ERAS.find(e => e.id === this.engine.currentEraId);
    if (currentEra) {
      this.updateTheme(currentEra.themeClass);
    }
  }

  renderHeader() {
    const era = ERAS.find(e => e.id === this.engine.currentEraId) || ERAS[0];
    this.dom.eraPillNumber.innerText = `Epoch ${era.id}`;
    this.dom.eraPillName.innerText = era.name;
    this.dom.eraPillDates.innerText = era.timeSpan;

    this.dom.statInsights.innerText = GameUI.formatNumber(this.engine.insights);
    this.dom.statRate.innerText = `+${GameUI.formatNumber(this.engine.getTotalRate())} / s`;
    this.dom.clickGainBadge.innerText = `+${GameUI.formatNumber(this.engine.getClickPower())} / click`;

    // Unified Active Paradigm & Restart Header Button (v1.7.0)
    if (this.dom.activeParadigmBadge) {
      this.dom.activeParadigmBadge.style.display = 'inline-flex';
      const activeParadigm = this.engine.getActiveParadigm();

      if (this.engine.hasEverUnlockedSingularity) {
        // Post-Clear State: Paradigm Shift Unlocked & Available
        this.dom.activeParadigmBadge.classList.add('paradigm-shift-ready');
        this.dom.activeParadigmBadge.classList.remove('pre-clear-restart');

        if (activeParadigm) {
          if (this.dom.paradigmBadgeIcon) this.dom.paradigmBadgeIcon.textContent = activeParadigm.icon;
          if (this.dom.paradigmBadgeLabel) this.dom.paradigmBadgeLabel.textContent = 'Active Focus • Restart';
          if (this.dom.paradigmBadgeName) this.dom.paradigmBadgeName.textContent = `${activeParadigm.name} ▾`;
        } else if (this.engine.replayCount > 0) {
          if (this.dom.paradigmBadgeIcon) this.dom.paradigmBadgeIcon.textContent = '📜';
          if (this.dom.paradigmBadgeLabel) this.dom.paradigmBadgeLabel.textContent = 'Active Focus • Restart';
          if (this.dom.paradigmBadgeName) this.dom.paradigmBadgeName.textContent = 'Standard Replay ▾';
        } else {
          // Cleared epoch 7 in current initial run, hasn't shifted yet
          if (this.dom.paradigmBadgeIcon) this.dom.paradigmBadgeIcon.textContent = '🌌';
          if (this.dom.paradigmBadgeLabel) this.dom.paradigmBadgeLabel.textContent = 'Paradigm Shift • Restart';
          if (this.dom.paradigmBadgeName) this.dom.paradigmBadgeName.textContent = 'Singularity Ready ▾';
        }
      } else {
        // Pre-Clear State: Standard Restart Action Button
        this.dom.activeParadigmBadge.classList.remove('paradigm-shift-ready');
        this.dom.activeParadigmBadge.classList.add('pre-clear-restart');
        if (this.dom.paradigmBadgeIcon) this.dom.paradigmBadgeIcon.textContent = '🔄';
        if (this.dom.paradigmBadgeLabel) this.dom.paradigmBadgeLabel.textContent = 'Restart Timeline';
        if (this.dom.paradigmBadgeName) this.dom.paradigmBadgeName.textContent = 'Epoch 1 (Reset) ▾';
      }
      this.dom.activeParadigmBadge.removeAttribute('title');
    }

    this.updateEraProgressBar();
  }

  updateEraProgressBar() {
    if (!this.dom.eraProgressBarFill || !this.dom.eraProgressText) return;
    const currentEraMilestones = MILESTONES.filter(m => m.eraId === this.engine.currentEraId);
    const totalInEra = currentEraMilestones.length;
    const unlockedInEra = currentEraMilestones.filter(m => this.engine.unlockedMilestones.has(m.id)).length;
    const pct = totalInEra > 0 ? (unlockedInEra / totalInEra) * 100 : 100;
    const nextEra = ERAS.find(e => e.id === this.engine.currentEraId + 1);

    if (nextEra) {
      this.dom.eraProgressBarFill.style.width = `${pct.toFixed(1)}%`;
      this.dom.eraProgressText.innerText = `${unlockedInEra} / ${totalInEra} Milestones (${pct.toFixed(0)}%)`;
    } else {
      this.dom.eraProgressBarFill.style.width = `100%`;
      this.dom.eraProgressText.innerText = `All ${totalInEra}/${totalInEra} Milestones Complete`;
    }
  }

  renderGenerators() {
    const currentEraId = this.engine.currentEraId;
    // Show generators up to the current era
    const availableGenerators = GENERATORS.filter(g => g.eraId <= currentEraId);

    this.dom.generatorList.innerHTML = '';

    availableGenerators.forEach(gen => {
      const count = this.engine.generators[gen.id] || 0;
      const rate = this.engine.getGeneratorRate(gen.id);
      
      let costText = '';
      let canAfford = false;
      let buyCount = 1;

      if (this.engine.bulkBuyMode === 'max') {
        const maxInfo = this.engine.getGeneratorCost(gen.id, 'max');
        buyCount = maxInfo.count;
        costText = `${GameUI.formatNumber(maxInfo.cost)} (x${buyCount})`;
        canAfford = maxInfo.canAffordAny && this.engine.insights >= maxInfo.cost;
      } else {
        buyCount = this.engine.bulkBuyMode;
        const cost = this.engine.getGeneratorCost(gen.id, buyCount);
        costText = `${GameUI.formatNumber(cost)} (x${buyCount})`;
        canAfford = this.engine.insights >= cost;
      }

      const card = document.createElement('div');
      card.className = 'generator-card';
      card.innerHTML = `
        <div class="gen-top-row">
          <div class="gen-identity">
            <span class="gen-icon">${gen.icon}</span>
            <div>
              <div class="gen-name">${gen.name}</div>
              <div class="gen-flavor">${gen.description}</div>
            </div>
          </div>
          <div class="gen-owned">${count}</div>
        </div>
        <div class="gen-stats-row">
          <span class="gen-output-rate">+${GameUI.formatNumber(rate)}/s</span>
          <span class="gen-base-rate">+${gen.baseRate}/s each</span>
        </div>
        <button class="btn-buy-gen" ${!canAfford ? 'disabled' : ''}>
          <span>Buy x${buyCount}</span>
          <span>${costText} 💡</span>
        </button>
      `;

      const buyBtn = card.querySelector('.btn-buy-gen');
      buyBtn.addEventListener('click', () => {
        this.engine.buyGenerator(gen.id);
      });

      this.dom.generatorList.appendChild(card);
    });
  }

  renderTimeline() {
    // Milestones List (Show all milestones up to currentEra + 1 to show what's ahead)
    const visibleMilestones = MILESTONES.filter(m => m.eraId <= this.engine.currentEraId + 1);

    this.dom.milestoneGrid.innerHTML = '';

    visibleMilestones.forEach(ms => {
      const isUnlocked = this.engine.unlockedMilestones.has(ms.id);
      const isAvailable = this.engine.isMilestoneAvailable(ms.id);
      const isSelected = this.engine.selectedMilestoneId === ms.id;
      const cost = this.engine.getMilestoneCost(ms.id);
      const canAfford = this.engine.insights >= cost;

      let statusClass = 'locked';
      let actionControl = '<span class="ms-state-btn status-locked">🔒 Locked</span>';

      if (isUnlocked) {
        statusClass = 'unlocked';
        actionControl = '<span class="ms-state-btn status-unlocked">✓ Discovered</span>';
      } else if (isAvailable) {
        statusClass = 'available';
        actionControl = `<button class="btn-unlock-ms" ${!canAfford ? 'disabled' : ''}>Unlock: ${GameUI.formatNumber(cost)} 💡</button>`;
      }

      const card = document.createElement('div');
      card.className = `milestone-card ${statusClass} ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="ms-header">
          <div class="ms-title-group">
            <span class="ms-year">${ms.year}</span>
            <span class="ms-title">${ms.title}</span>
          </div>
          ${actionControl}
        </div>
        <div class="ms-flavor">${ms.paradigmShift}</div>
        <div class="ms-effect-preview">⚡ ${ms.effects.description}</div>
      `;

      // Select for Codex viewing
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-unlock-ms')) {
          this.engine.selectMilestone(ms.id);
        }
      });

      // Unlock button
      const unlockBtn = card.querySelector('.btn-unlock-ms');
      if (unlockBtn) {
        unlockBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.engine.buyMilestone(ms.id);
        });
      }

      this.dom.milestoneGrid.appendChild(card);
    });
  }

  renderCodex() {
    const selectedId = this.engine.selectedMilestoneId;
    const ms = MILESTONES.find(m => m.id === selectedId) || MILESTONES[0];
    const isUnlocked = this.engine.unlockedMilestones.has(ms.id);

    this.dom.codexContainer.innerHTML = `
      <div class="codex-detail">
        <!-- Compact Header Card with Status Indicator -->
        <div class="codex-header-card ${isUnlocked ? 'is-unlocked' : 'is-locked'}">
          <div class="codex-header-top">
            <span class="codex-epoch-tag">EPOCH ${ms.eraId} • ${ms.year}</span>
            <span class="codex-status-pill ${isUnlocked ? 'pill-unlocked' : 'pill-locked'}">
              ${isUnlocked ? '✓ Unlocked & Archived' : '🔒 Locked Entry'}
            </span>
          </div>
          <div class="codex-title">${ms.title}</div>
          <div class="codex-figure">👤 ${ms.quoteOrFigure}</div>
        </div>

        <!-- Paradigm Shift -->
        <div class="codex-section">
          <div class="codex-section-label">Paradigm Shift</div>
          <div class="paradigm-box">${ms.paradigmShift}</div>
        </div>

        <!-- Educational Lore -->
        <div class="codex-section">
          <div class="codex-section-label">Historical Lore & Scientific Context</div>
          <div class="lore-body">${ms.educationalLore}</div>
        </div>

        <!-- Primary Academic Citation -->
        <div class="codex-section">
          <div class="codex-section-label">Primary Academic Citation</div>
          <div class="citation-card">
            📖 ${ms.citation}
          </div>
        </div>

        <!-- Gameplay Economic Impact -->
        <div class="codex-section">
          <div class="codex-section-label">Gameplay Economic Impact</div>
          <div class="gameplay-impact-card ${isUnlocked ? 'bonus-active' : 'bonus-inactive'}">
            <span class="bonus-icon">${isUnlocked ? '⚡' : '⏳'}</span>
            <div class="bonus-info">
              <span class="bonus-title">${isUnlocked ? 'ACTIVE BONUS' : 'INACTIVE BONUS'}:</span>
              <span class="bonus-desc">${ms.effects.description}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // MAIN GAME LOOP (requestAnimationFrame)
  // ==========================================
  gameLoop(timestamp) {
    this.engine.tick(timestamp);
    
    // Smooth header tick updates
    this.dom.statInsights.innerText = GameUI.formatNumber(this.engine.insights);
    this.dom.statRate.innerText = `+${GameUI.formatNumber(this.engine.getTotalRate())} / s`;
    this.updateEraProgressBar();

    // Auto-save every 5 seconds
    if (!this.lastAutoSaveTime) this.lastAutoSaveTime = timestamp;
    if (timestamp - this.lastAutoSaveTime >= 5000) {
      this.engine.saveToStorage();
      this.lastAutoSaveTime = timestamp;
    }
    
    // Periodically update buy button affordabilities & dynamic MAX labels without full re-render
    const buyButtons = this.dom.generatorList.querySelectorAll('.btn-buy-gen');
    const availableGenerators = GENERATORS.filter(g => g.eraId <= this.engine.currentEraId);
    
    buyButtons.forEach((btn, idx) => {
      const gen = availableGenerators[idx];
      if (gen) {
        if (this.engine.bulkBuyMode === 'max') {
          const maxInfo = this.engine.getGeneratorCost(gen.id, 'max');
          const canAfford = maxInfo.canAffordAny && this.engine.insights >= maxInfo.cost;
          btn.disabled = !canAfford;
          const spans = btn.querySelectorAll('span');
          if (spans.length >= 2) {
            spans[0].textContent = `Buy x${maxInfo.count}`;
            spans[1].textContent = `${GameUI.formatNumber(maxInfo.cost)} (x${maxInfo.count}) 💡`;
          }
        } else {
          const cost = this.engine.getGeneratorCost(gen.id, this.engine.bulkBuyMode);
          const canAfford = this.engine.insights >= cost;
          btn.disabled = !canAfford;
        }
      }
    });

    // Update Milestone unlock button affordabilities in real-time
    const milestoneCards = this.dom.milestoneGrid.querySelectorAll('.milestone-card');
    const visibleMilestones = MILESTONES.filter(m => m.eraId <= this.engine.currentEraId + 1);
    
    milestoneCards.forEach((card, idx) => {
      const ms = visibleMilestones[idx];
      if (ms) {
        const unlockBtn = card.querySelector('.btn-unlock-ms');
        if (unlockBtn) {
          const cost = this.engine.getMilestoneCost(ms.id);
          const canAfford = this.engine.insights >= cost;
          unlockBtn.disabled = !canAfford;
        }
      }
    });

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }
}

// Bootstrap UI once DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new GameUI();
});
