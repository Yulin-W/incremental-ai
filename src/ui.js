/**
 * ui.js
 * Master User Interface orchestrator, DOM event router, and game loop coordinator.
 */

import { GameEngine } from './engine.js';
import { ERAS, EPOCH_EVENTS, ERA_EVENTS } from './data/index.js';
import { isDebugModeActive, formatNumber, formatDuration } from './ui/utils/formatters.js';
import { ToastManager } from './ui/feedback/toast.js';
import { spawnClickParticle as spawnParticle } from './ui/feedback/particles.js';
import { ThemeManager } from './ui/systems/themeManager.js';
import { MultiTabCoordinator } from './ui/systems/multiTab.js';
import { DebugHudController } from './ui/systems/debugHud.js';
import { HelpModalController } from './ui/modals/helpModal.js';
import { EventModalController } from './ui/modals/eventModal.js';
import { ParadigmModalController } from './ui/modals/paradigmModal.js';
import { renderHeader, updateEraProgressBar } from './ui/components/headerRenderer.js';
import { renderGenerators, updateGeneratorAffordances } from './ui/components/productionRenderer.js';
import { renderTimeline, updateMilestoneAffordances } from './ui/components/timelineRenderer.js';
import { renderCodex } from './ui/components/codexRenderer.js';

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

    // Subsystem Controllers
    this.themeManager = new ThemeManager(this.dom.body);
    this.toastManager = new ToastManager(this.dom.toastContainer);
    this.multiTabCoordinator = new MultiTabCoordinator(this);
    this.helpModalController = new HelpModalController(this);
    this.eventModalController = new EventModalController(this);
    this.paradigmModalController = new ParadigmModalController(this);

    // Tab state alias
    this.isTabActivePrimary = this.multiTabCoordinator.isTabActivePrimary;
    this.tabId = this.multiTabCoordinator.tabId;

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
      this.debugHudController = new DebugHudController(this);
    }

    // Attempt to load persisted save state
    const hasLoadedSave = this.engine.loadFromStorage();
    if (hasLoadedSave) {
      const currentEra = ERAS.find(e => e.id === this.engine.currentEraId) || ERAS[0];
      this.updateTheme(currentEra.themeClass);

      // Offline Progression ("While You Were Away")
      const offline = this.engine.calculateOfflineProgress();
      if (offline.offlineGain > 0) {
        this.engine.insights += offline.offlineGain;
        this.engine.totalInsightsEarned += offline.offlineGain;

        const durationText = GameUI.formatDuration(offline.elapsedSeconds);
        const capNotice = offline.isCapped ? ' (4h cap)' : '';
        this.showToast(
          '⏰ While You Were Away',
          `+${GameUI.formatNumber(offline.offlineGain)} 💡 generated over ${durationText}${capNotice}`,
          '⏳'
        );

        // Immediate persistence of credited offline earnings
        this.engine.saveToStorage();
      }
    } else {
      // First-time clean-slate player: Auto-open Help Modal & queue Epoch 1 intro event
      this.openHelpModal();
      this.engine.initStartingEra();
      // Initialize fresh save in storage so future reloads recognize returning player
      this.engine.saveToStorage();
    }

    // Initial Render
    this.renderAll();

    // Auto-save interval tracking
    this.lastAutoSaveTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());

    // Start Animation / Game Loop
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame((ts) => this.gameLoop(ts));
    }
  }

  // ==========================================
  // STATIC UTILITIES & FORMATTERS
  // ==========================================

  static isDebugModeActive() {
    return isDebugModeActive();
  }

  static formatNumber(num, decimals = 1) {
    return formatNumber(num, decimals);
  }

  static formatDuration(totalSeconds) {
    return formatDuration(totalSeconds);
  }

  // ==========================================
  // VERSION LOADER
  // ==========================================

  async loadVersion() {
    try {
      if (typeof fetch === 'undefined') return;
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
    if (typeof document === 'undefined') return;

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

      // Unified Active Paradigm Header Button
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

      // Paradigm Shift / Singularity Modal Dialog
      paradigmModal: document.getElementById('paradigm-modal'),
      paradigm2x2Grid: document.getElementById('paradigm-2x2-grid'),
      paradigmVanillaSlot: document.getElementById('paradigm-vanilla-slot'),
      btnStayTimeline: document.getElementById('btn-stay-timeline'),
      btnCloseParadigm: document.getElementById('btn-close-paradigm'),
      btnRequestPurge: document.getElementById('btn-request-purge'),

      // Paradigm Shift Confirmation Modal Dialog
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

      // Multi-Tab Protection Lock Overlay
      multiTabOverlay: document.getElementById('multi-tab-overlay'),
      btnResumeTab: document.getElementById('btn-resume-tab'),

      // Toast Container
      toastContainer: document.getElementById('toast-container')
    };
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================

  bindEvents() {
    if (typeof document === 'undefined') return;

    // Think Button Click
    if (this.dom.btnContemplate) {
      this.dom.btnContemplate.addEventListener('click', (e) => {
        const gain = this.engine.clickInsight();
        this.spawnClickParticle(e, `+${GameUI.formatNumber(gain)} 💡`);
      });
    }

    // Bulk Buy Mode Buttons
    if (this.dom.bulkButtons) {
      this.dom.bulkButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.dataset.mode === 'max' ? 'max' : parseInt(btn.dataset.mode, 10);
          this.engine.setBulkBuyMode(mode);
          this.dom.bulkButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderGenerators();
        });
      });
    }

    // Mobile Tabs
    if (this.dom.mobileTabButtons) {
      this.dom.mobileTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.dataset.tab;
          this.switchMobileTab(tab);
        });
      });
    }

    // Global Keydown Handler for Modals
    if (typeof window !== 'undefined') {
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
  }

  // ==========================================
  // ENGINE SUBSCRIPTIONS
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

    this.engine.on('singularityReached', () => {
      this.showToast('🌌 Frontier Singularity Achieved!', 'All 28 historical milestones discovered! Paradigm Shift is now unlocked.', '🌌');
      this.openParadigmModal();
    });

    this.engine.on('paradigmShift', () => {
      const paradigm = this.engine.getActiveParadigm();
      const name = paradigm ? paradigm.name : 'Standard Historical Mode';
      this.showToast('🌌 Paradigm Shift Activated', `Beginning historical cycle with ${name}.`, '🚀');
    });
  }

  // ==========================================
  // MODAL CONTROLLER DELEGATIONS
  // ==========================================

  openHelpModal() {
    this.helpModalController.open();
  }

  closeHelpModal() {
    this.helpModalController.close();
  }

  triggerEventPopup(eventData) {
    this.eventModalController.triggerPopup(eventData);
  }

  showNextEvent() {
    this.eventModalController.showNextEvent();
  }

  closeEventModal() {
    this.eventModalController.close();
  }

  openParadigmModal() {
    this.paradigmModalController.openParadigmModal();
  }

  closeParadigmModal() {
    this.paradigmModalController.closeParadigmModal();
  }

  renderParadigmCards() {
    this.paradigmModalController.renderParadigmCards();
  }

  requestParadigmShift(paradigmId) {
    this.paradigmModalController.requestParadigmShift(paradigmId);
  }

  requestSimpleRestart() {
    this.paradigmModalController.requestSimpleRestart();
  }

  requestPurgeData() {
    this.paradigmModalController.requestPurgeData();
  }

  closeConfirmModal() {
    this.paradigmModalController.closeConfirmModal();
  }

  executeConfirmedShift() {
    this.paradigmModalController.executeConfirmedShift();
  }

  // ==========================================
  // MULTI-TAB SESSION DELEGATIONS
  // ==========================================

  pauseGameForMultiTab() {
    this.multiTabCoordinator.pauseGame();
  }

  resumeGameFromMultiTab() {
    this.multiTabCoordinator.resumeGame();
  }

  // ==========================================
  // RENDERING & FEEDBACK DELEGATIONS
  // ==========================================

  showToast(title, message, icon = '💡') {
    this.toastManager.showToast(title, message, icon);
  }

  updateTheme(themeClass) {
    this.themeManager.updateTheme(themeClass);
  }

  spawnClickParticle(e, text) {
    spawnParticle(e, text, this.dom.btnContemplate);
  }

  switchMobileTab(tab) {
    this.activeMobileTab = tab;
    if (this.dom.mobileTabButtons) {
      this.dom.mobileTabButtons.forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tab);
      });
    }

    if (this.dom.panelProduction) this.dom.panelProduction.classList.toggle('active-mobile-panel', tab === 'production');
    if (this.dom.panelTimeline) this.dom.panelTimeline.classList.toggle('active-mobile-panel', tab === 'timeline');
    if (this.dom.panelCodex) this.dom.panelCodex.classList.toggle('active-mobile-panel', tab === 'codex');
  }

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
    renderHeader(this);
  }

  updateEraProgressBar() {
    updateEraProgressBar(this);
  }

  renderGenerators() {
    renderGenerators(this);
  }

  renderTimeline() {
    renderTimeline(this);
  }

  renderCodex() {
    renderCodex(this);
  }

  // ==========================================
  // MAIN GAME LOOP (requestAnimationFrame)
  // ==========================================

  gameLoop(timestamp) {
    if (!this.multiTabCoordinator.isTabActivePrimary) {
      // Inactive duplicate tab: wait without ticking or saving to protect save integrity
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame((ts) => this.gameLoop(ts));
      }
      return;
    }

    this.engine.tick(timestamp);

    // Smooth header tick updates
    if (this.dom.statInsights) this.dom.statInsights.innerText = GameUI.formatNumber(this.engine.insights);
    if (this.dom.statRate) this.dom.statRate.innerText = `+${GameUI.formatNumber(this.engine.getTotalRate())} / s`;
    this.updateEraProgressBar();

    // Auto-save every 5 seconds
    if (!this.lastAutoSaveTime) this.lastAutoSaveTime = timestamp;
    if (timestamp - this.lastAutoSaveTime >= 5000) {
      this.engine.saveToStorage();
      this.lastAutoSaveTime = timestamp;
    }

    // Fast tick updates for affordances
    updateGeneratorAffordances(this);
    updateMilestoneAffordances(this);

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame((ts) => this.gameLoop(ts));
    }
  }
}

// Bootstrap UI once DOM is loaded in browser
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    new GameUI();
  });
}
