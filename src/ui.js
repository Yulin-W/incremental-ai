/**
 * ui.js
 * Master User Interface orchestrator, DOM event router, and game loop coordinator.
 */

import { GameEngine } from './engine.js';
import { ERAS, EPOCH_EVENTS, ERA_EVENTS } from './data/index.js';
import { isDebugModeActive, formatNumber, formatDuration, trackAnalyticsEvent } from './ui/utils/formatters.js';
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
import { i18n, SUPPORTED_LANGUAGES, getFlagSvg } from './locales/index.js';

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
    this.isLanguageDropdownOpen = false;
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

    this.initLanguageSelector();
    this.bindEvents();
    this.setupEngineSubscriptions();
    this.setupI18nSubscriptions();
    this.loadVersion();
    this.updateLanguageUI();

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
        const capNotice = offline.isCapped ? i18n.t('ui.capNotice') : '';
        this.showToast(
          i18n.t('ui.whileAwayTitle'),
          i18n.t('ui.whileAwayMsg', {
            gain: GameUI.formatNumber(offline.offlineGain),
            duration: durationText,
            cap: capNotice
          }),
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
      if (typeof fetch === 'undefined' || typeof window === 'undefined' || !window.location || !window.location.origin) return;
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
      btnHelpText: document.getElementById('btn-help-text'),
      eraPillNumber: document.getElementById('era-pill-number'),
      eraPillName: document.getElementById('era-pill-name'),
      eraPillDates: document.getElementById('era-pill-dates'),
      eraProgressBarFill: document.getElementById('era-progress-bar-fill'),
      eraProgressText: document.getElementById('era-progress-text'),
      labelInsights: document.getElementById('label-insights'),
      labelRate: document.getElementById('label-rate'),
      statInsights: document.getElementById('stat-insights'),
      statRate: document.getElementById('stat-rate'),

      // Language Selector
      languagePickerContainer: document.getElementById('language-picker-container'),
      btnLanguage: document.getElementById('btn-language'),
      currentLangFlag: document.getElementById('current-lang-flag'),
      currentLangCode: document.getElementById('current-lang-code'),
      languageDropdown: document.getElementById('language-dropdown'),
      brandSubtitle: document.querySelector('.brand-subtitle'),

      // Unified Active Paradigm Header Button
      activeParadigmBadge: document.getElementById('active-paradigm-badge'),
      paradigmBadgeIcon: document.getElementById('paradigm-badge-icon'),
      paradigmBadgeLabel: document.getElementById('paradigm-badge-label'),
      paradigmBadgeName: document.getElementById('paradigm-badge-name'),

      // Left Panel (Production Hub)
      panelProductionTitle: document.getElementById('panel-production-title') || document.querySelector('#panel-production .panel-title'),
      btnContemplate: document.getElementById('btn-contemplate'),
      btnContemplateSpan: document.querySelector('#btn-contemplate span:last-child'),
      clickGainBadge: document.getElementById('click-gain-badge'),
      bulkLabel: document.querySelector('.bulk-label'),
      bulkButtons: document.querySelectorAll('.btn-bulk'),
      generatorList: document.getElementById('generator-list'),

      // Center Panel (Timeline)
      panelTimelineTitle: document.getElementById('panel-timeline-title') || document.querySelector('#panel-timeline .panel-title'),
      milestoneGrid: document.getElementById('milestone-grid'),

      // Right Panel (Codex)
      panelCodexTitle: document.getElementById('panel-codex-title') || document.querySelector('#panel-codex .panel-title'),
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
      btnCloseEvent: document.getElementById('btn-close-event'),
      btnEventAcknowledge: document.getElementById('btn-event-acknowledge'),
      btnDismissEvent: document.getElementById('btn-event-acknowledge'),
      eventModalCategory: document.getElementById('event-modal-category') || document.querySelector('.event-modal-header .event-category-badge'),
      eventModalEpochPill: document.getElementById('event-modal-epoch-pill') || document.querySelector('.event-modal-header .event-epoch-pill'),
      eventModalIcon: document.getElementById('event-modal-icon'),
      eventModalTitle: document.getElementById('event-modal-title'),
      eventModalSubtitle: document.getElementById('event-modal-subtitle') || document.querySelector('.event-modal-subtitle'),
      eventModalNarrative: document.getElementById('event-modal-narrative'),
      eventModalQuoteText: document.getElementById('event-modal-quote-text'),
      eventModalQuoteAuthor: document.getElementById('event-modal-quote-author'),
      eventModalBtnText: document.getElementById('event-modal-btn-text'),

      // Paradigm Shift / Singularity Modal Dialog
      paradigmModal: document.getElementById('paradigm-modal'),
      btnCloseParadigm: document.getElementById('btn-close-paradigm'),
      paradigm2x2Grid: document.getElementById('paradigm-2x2-grid'),
      paradigmVanillaSlot: document.getElementById('paradigm-vanilla-slot'),
      btnStayTimeline: document.getElementById('btn-stay-timeline'),
      btnRequestPurge: document.getElementById('btn-request-purge'),

      // Paradigm Shift Confirmation Modal Dialog
      paradigmConfirmModal: document.getElementById('paradigm-confirm-modal'),
      btnCloseConfirm: document.getElementById('btn-close-confirm'),
      confirmModalBadge: document.getElementById('confirm-modal-badge'),
      confirmParadigmIcon: document.getElementById('confirm-paradigm-icon'),
      confirmParadigmTitle: document.getElementById('confirm-paradigm-title'),
      confirmParadigmDesc: document.getElementById('confirm-paradigm-desc'),
      confirmEffectsHeader: document.getElementById('confirm-effects-header'),
      confirmParadigmEffectsText: document.getElementById('confirm-paradigm-effects-text'),
      confirmWarningIcon: document.getElementById('confirm-warning-icon'),
      confirmWarningText: document.getElementById('confirm-warning-text'),
      btnCancelConfirm: document.getElementById('btn-cancel-confirm'),
      btnExecuteShift: document.getElementById('btn-execute-shift'),
      confirmPurgeOptionContainer: document.getElementById('confirm-purge-option-container'),
      btnPurgeFromSimple: document.getElementById('btn-purge-from-simple'),

      // Multi-Tab Protection Lock Overlay
      multiTabOverlay: document.getElementById('multi-tab-overlay'),
      btnResumeTab: document.getElementById('btn-resume-tab'),

      // Toast Container
      toastContainer: document.getElementById('toast-container')
    };
  }

  // ==========================================
  // LANGUAGE SELECTOR & LOCALIZATION
  // ==========================================

  initLanguageSelector() {
    if (!this.dom.languagePickerContainer || !this.dom.languageDropdown) return;

    const currentLang = i18n.getLanguage();
    this.dom.languageDropdown.innerHTML = '';

    SUPPORTED_LANGUAGES.forEach(lang => {
      const opt = document.createElement('button');
      opt.className = `lang-option ${lang.code === currentLang ? 'active' : ''}`;
      opt.dataset.lang = lang.code;
      opt.setAttribute('role', 'menuitem');
      opt.innerHTML = `
        <span class="option-flag">${getFlagSvg(lang.code)}</span>
        <span class="option-name">${lang.name}</span>
        <span class="option-native">${lang.nativeName}</span>
        ${lang.code === currentLang ? '<span class="option-check">✓</span>' : ''}
      `;

      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectLanguage(lang.code);
      });

      this.dom.languageDropdown.appendChild(opt);
    });

    this.updateLanguageButtonDisplay(currentLang);
  }

  updateLanguageButtonDisplay(langCode) {
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode) || SUPPORTED_LANGUAGES[0];
    if (this.dom.currentLangFlag) {
      this.dom.currentLangFlag.innerHTML = getFlagSvg(langCode);
    }
    if (this.dom.currentLangCode) this.dom.currentLangCode.textContent = langObj.code.toUpperCase();

    if (this.dom.languageDropdown) {
      const options = this.dom.languageDropdown.querySelectorAll('.lang-option');
      options.forEach(opt => {
        const isSelected = opt.dataset.lang === langCode;
        opt.classList.toggle('active', isSelected);
        const existingCheck = opt.querySelector('.option-check');
        if (isSelected && !existingCheck) {
          const check = document.createElement('span');
          check.className = 'option-check';
          check.textContent = '✓';
          opt.appendChild(check);
        } else if (!isSelected && existingCheck) {
          existingCheck.remove();
        }
      });
    }
  }

  toggleLanguageDropdown(forceOpen) {
    if (!this.dom.languageDropdown || !this.dom.btnLanguage) return;
    const shouldOpen = forceOpen !== undefined ? forceOpen : !this.isLanguageDropdownOpen;
    this.isLanguageDropdownOpen = shouldOpen;

    if (shouldOpen) {
      this.dom.languageDropdown.style.display = 'block';
      this.dom.btnLanguage.setAttribute('aria-expanded', 'true');
    } else {
      this.dom.languageDropdown.style.display = 'none';
      this.dom.btnLanguage.setAttribute('aria-expanded', 'false');
    }
  }

  selectLanguage(langCode) {
    i18n.setLanguage(langCode);
    this.toggleLanguageDropdown(false);
  }

  setupI18nSubscriptions() {
    i18n.on('languageChange', ({ lang }) => {
      this.updateLanguageButtonDisplay(lang);
      this.updateLanguageUI();
      this.renderAll();
      if (this.isHelpModalOpen) {
        this.helpModalController.renderLocalizedContent();
      }
      if (this.isParadigmModalOpen) {
        this.paradigmModalController.openParadigmModal();
      }
      if (this.isParadigmConfirmOpen) {
        if (this.pendingParadigmChoice === 'simple_restart') {
          this.paradigmModalController.requestSimpleRestart();
        } else if (this.pendingParadigmChoice === 'purge_all_data') {
          this.paradigmModalController.requestPurgeData();
        } else {
          this.paradigmModalController.requestParadigmShift(this.pendingParadigmChoice);
        }
      }
    });
  }

  updateLanguageUI() {
    if (this.dom.brandSubtitle) {
      this.dom.brandSubtitle.textContent = i18n.t('ui.brandSubtitle');
    }
    if (this.dom.labelInsights) {
      this.dom.labelInsights.textContent = `💡 ${i18n.t('ui.insights')}`;
    }
    if (this.dom.labelRate) {
      this.dom.labelRate.textContent = i18n.t('ui.perSecond');
    }
    if (this.dom.btnHelpText) {
      this.dom.btnHelpText.textContent = i18n.t('ui.help');
    }
    if (this.dom.btnContemplateSpan) {
      this.dom.btnContemplateSpan.textContent = i18n.t('ui.think');
    }
    if (this.dom.bulkLabel) {
      this.dom.bulkLabel.textContent = i18n.t('ui.buy');
    }
    if (this.dom.panelProductionTitle) {
      this.dom.panelProductionTitle.innerHTML = `<span>⚡</span> ${i18n.t('ui.production')}`;
    }
    if (this.dom.panelTimelineTitle) {
      this.dom.panelTimelineTitle.innerHTML = `<span>⏳</span> ${i18n.t('ui.timeline')}`;
    }
    if (this.dom.panelCodexTitle) {
      this.dom.panelCodexTitle.innerHTML = `<span>📖</span> ${i18n.t('ui.codex')}`;
    }
    if (this.dom.mobileTabButtons) {
      this.dom.mobileTabButtons.forEach(btn => {
        const tab = btn.dataset.tab;
        if (tab === 'production') btn.textContent = `⚡ ${i18n.t('ui.production')}`;
        if (tab === 'timeline') btn.textContent = `⏳ ${i18n.t('ui.timeline')}`;
        if (tab === 'codex') btn.textContent = `📖 ${i18n.t('ui.codex')}`;
      });
    }
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================

  bindEvents() {
    if (typeof document === 'undefined') return;

    // Language Dropdown Toggle
    if (this.dom.btnLanguage) {
      this.dom.btnLanguage.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleLanguageDropdown();
      });
    }

    // Dismiss Language Dropdown when clicking outside
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (e) => {
        if (this.isLanguageDropdownOpen && !e.target.closest('#language-picker-container')) {
          this.toggleLanguageDropdown(false);
        }
      });
    }

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
        // Dismiss Language Dropdown on Escape
        if (e.key === 'Escape' && this.isLanguageDropdownOpen) {
          this.toggleLanguageDropdown(false);
          return;
        }

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
      const localizedMs = i18n.getMilestone(milestone.id) || milestone;
      this.showToast(i18n.t('ui.breakthroughToast'), localizedMs.title, '🔬');
      trackAnalyticsEvent('milestone_unlocked', {
        milestone_id: milestone.id,
        epoch_id: milestone.eraId || milestone.epochId
      });
    });

    this.engine.on('eraUnlock', (era) => {
      const locEpoch = i18n.getEpoch(era.id) || era;
      this.showToast(
        i18n.t('ui.epochToast', { id: era.id, name: locEpoch.name }),
        locEpoch.subtitle,
        '⏳'
      );
      this.updateTheme(era.themeClass);
      trackAnalyticsEvent('epoch_unlocked', {
        epoch_id: era.id,
        epoch_name: era.name
      });

      const eventData = ERA_EVENTS[era.id] || EPOCH_EVENTS[era.id];
      if (eventData) {
        this.triggerEventPopup(eventData);
      }
    });

    this.engine.on('singularityReached', () => {
      this.showToast(
        i18n.t('ui.singularityToastTitle'),
        i18n.t('ui.singularityToastMsg'),
        '🌌'
      );
      trackAnalyticsEvent('singularity_achieved', {
        replay_count: this.engine.paradigmCount || 0
      });
      this.openParadigmModal();
    });

    this.engine.on('paradigmShift', () => {
      const rawParadigm = this.engine.getActiveParadigm();
      const paradigm = rawParadigm ? i18n.getParadigm(rawParadigm.id) : null;
      const name = paradigm ? paradigm.name : i18n.t('ui.standardReplay');
      this.showToast(
        i18n.t('ui.paradigmActivatedTitle'),
        i18n.t('ui.paradigmActivatedMsg', { name }),
        '🚀'
      );
      trackAnalyticsEvent('paradigm_shift', {
        paradigm_id: this.engine.activeParadigmId || 'standard'
      });
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
