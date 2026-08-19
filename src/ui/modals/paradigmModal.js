/**
 * paradigmModal.js
 * Paradigm Shift 2x2 selector, confirmation modal flow, timeline restart, and hard reset purge.
 */

import { PARADIGMS, ERAS } from '../../data/index.js';
import { i18n } from '../../locales/index.js';

export class ParadigmModalController {
  constructor(ui) {
    this.ui = ui;
    this.bindEvents();
  }

  bindEvents() {
    // Unified Paradigm Shift & Timeline Restart Button
    if (this.ui.dom.activeParadigmBadge) {
      this.ui.dom.activeParadigmBadge.addEventListener('click', () => {
        if (this.ui.engine.hasEverUnlockedSingularity) {
          this.openParadigmModal();
        } else {
          this.requestSimpleRestart();
        }
      });
    }
    if (this.ui.dom.btnCloseParadigm) {
      this.ui.dom.btnCloseParadigm.addEventListener('click', () => this.closeParadigmModal());
    }
    if (this.ui.dom.btnStayTimeline) {
      this.ui.dom.btnStayTimeline.addEventListener('click', () => {
        this.closeParadigmModal();
        this.ui.showToast(i18n.t('ui.continuingTimelineTitle'), i18n.t('ui.continuingTimelineMsg'), '📜');
      });
    }
    if (this.ui.dom.btnRequestPurge) {
      this.ui.dom.btnRequestPurge.addEventListener('click', () => this.requestPurgeData());
    }
    if (this.ui.dom.btnPurgeFromSimple) {
      this.ui.dom.btnPurgeFromSimple.addEventListener('click', () => this.requestPurgeData());
    }
    if (this.ui.dom.paradigmModal) {
      this.ui.dom.paradigmModal.addEventListener('click', (e) => {
        if (e.target === this.ui.dom.paradigmModal) {
          this.closeParadigmModal();
        }
      });
    }

    // Confirmation Modal Controls
    if (this.ui.dom.btnCloseConfirm) {
      this.ui.dom.btnCloseConfirm.addEventListener('click', () => this.closeConfirmModal());
    }
    if (this.ui.dom.btnCancelConfirm) {
      this.ui.dom.btnCancelConfirm.addEventListener('click', () => this.closeConfirmModal());
    }
    if (this.ui.dom.btnExecuteShift) {
      this.ui.dom.btnExecuteShift.addEventListener('click', () => this.executeConfirmedShift());
    }
    if (this.ui.dom.paradigmConfirmModal) {
      this.ui.dom.paradigmConfirmModal.addEventListener('click', (e) => {
        if (e.target === this.ui.dom.paradigmConfirmModal) {
          this.closeConfirmModal();
        }
      });
    }
  }

  openParadigmModal() {
    if (!this.ui.dom.paradigmModal) return;
    this.ui.isParadigmModalOpen = true;

    // Localize modal header and action buttons
    const badge = this.ui.dom.paradigmModal.querySelector('.paradigm-singularity-badge');
    if (badge) badge.textContent = i18n.t('ui.paradigmSingularityBadge');

    const epochPill = this.ui.dom.paradigmModal.querySelector('.paradigm-epoch-pill');
    if (epochPill) epochPill.textContent = i18n.t('ui.paradigmEpochComplete');

    const title = this.ui.dom.paradigmModal.querySelector('#paradigm-modal-title');
    if (title) title.textContent = i18n.t('ui.paradigmModalTitle');

    const sub = this.ui.dom.paradigmModal.querySelector('.paradigm-modal-subtitle');
    if (sub) sub.textContent = i18n.t('ui.paradigmModalSubtitle');

    if (this.ui.dom.btnStayTimeline) {
      const main = this.ui.dom.btnStayTimeline.querySelector('.btn-civ-main');
      if (main) main.textContent = i18n.t('ui.btnStayTimeline');
      const subEl = this.ui.dom.btnStayTimeline.querySelector('.btn-civ-sub');
      if (subEl) subEl.textContent = i18n.t('ui.btnStayTimelineSub');
    }

    if (this.ui.dom.btnRequestPurge) {
      const span = this.ui.dom.btnRequestPurge.querySelector('span');
      if (span) span.textContent = i18n.t('ui.btnRequestPurge');
    }

    this.renderParadigmCards();
    this.ui.dom.paradigmModal.style.display = 'flex';
    void this.ui.dom.paradigmModal.offsetHeight;
    this.ui.dom.paradigmModal.classList.add('active');
    this.ui.dom.paradigmModal.setAttribute('aria-hidden', 'false');
  }

  closeParadigmModal() {
    if (!this.ui.dom.paradigmModal) return;
    if (typeof document !== 'undefined' && document.activeElement && this.ui.dom.paradigmModal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    this.ui.isParadigmModalOpen = false;
    this.ui.dom.paradigmModal.classList.remove('active');
    this.ui.dom.paradigmModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (!this.ui.dom.paradigmModal.classList.contains('active')) {
        this.ui.dom.paradigmModal.style.display = 'none';
      }
    }, 250);
  }

  renderParadigmCards() {
    if (!this.ui.dom.paradigm2x2Grid || !this.ui.dom.paradigmVanillaSlot) return;
    this.ui.dom.paradigm2x2Grid.innerHTML = '';
    this.ui.dom.paradigmVanillaSlot.innerHTML = '';

    // Render 4 Historical AI Research Paradigms in 2x2 Grid
    PARADIGMS.forEach(pBase => {
      const p = i18n.getParadigm(pBase.id) || pBase;
      const isCompleted = this.ui.engine.completedParadigms.has(p.id);

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
          <span class="paradigm-effects-label">⚡ ${i18n.t('ui.replayBuffsLabel')}:</span>
          <span class="paradigm-effects-text">${p.effectsSummary}</span>
        </div>
        <div class="paradigm-btn-footer">
          <span class="paradigm-btn-action-text">${i18n.t('ui.selectInitiateShift')}</span>
          ${isCompleted ? `<span class="paradigm-completed-badge" aria-label="Previously Mastered">★ ${i18n.t('ui.mastered')}</span>` : ''}
        </div>
      `;

      btn.addEventListener('click', () => {
        this.requestParadigmShift(p.id);
      });

      this.ui.dom.paradigm2x2Grid.appendChild(btn);
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
            <span class="paradigm-btn-name">${i18n.t('ui.vanillaReplayName')}</span>
            <span class="paradigm-btn-subtitle">${i18n.t('ui.vanillaReplaySubtitle')}</span>
          </div>
        </div>
        <span class="paradigm-speed-badge badge-vanilla">${i18n.t('ui.vanillaSpeed')}</span>
      </div>
      <div class="paradigm-btn-effects">
        <span class="paradigm-effects-label">${i18n.t('ui.baselineSpeedLabel')}:</span>
        <span class="paradigm-effects-text">${i18n.t('ui.vanillaEffectsSummary')}</span>
      </div>
      <div class="paradigm-btn-footer">
        <span class="paradigm-btn-action-text">${i18n.t('ui.vanillaButtonAction')}</span>
      </div>
    `;

    vanillaBtn.addEventListener('click', () => {
      this.requestParadigmShift('paradigm_none');
    });

    this.ui.dom.paradigmVanillaSlot.appendChild(vanillaBtn);
  }

  requestParadigmShift(paradigmId) {
    this.ui.pendingParadigmChoice = paradigmId;

    if (this.ui.dom.confirmModalBadge) {
      this.ui.dom.confirmModalBadge.textContent = `⚠️ ${i18n.t('ui.confirmParadigmShiftBadge')}`;
    }
    if (this.ui.dom.confirmEffectsHeader) {
      this.ui.dom.confirmEffectsHeader.textContent = `⚡ ${i18n.t('ui.activeBuffsHeader')}:`;
    }
    if (this.ui.dom.confirmWarningIcon) this.ui.dom.confirmWarningIcon.textContent = 'ℹ️';
    if (this.ui.dom.confirmWarningText) {
      this.ui.dom.confirmWarningText.textContent = i18n.t('ui.resetWarningEpoch1');
    }
    if (this.ui.dom.confirmPurgeOptionContainer) {
      this.ui.dom.confirmPurgeOptionContainer.style.display = 'none';
    }
    if (this.ui.dom.btnCancelConfirm) {
      const span = this.ui.dom.btnCancelConfirm.querySelector('span');
      if (span) span.textContent = i18n.t('ui.btnCancelConfirm');
    }
    if (this.ui.dom.btnExecuteShift) {
      this.ui.dom.btnExecuteShift.classList.remove('btn-danger-purge');
      this.ui.dom.btnExecuteShift.innerHTML = `<span>🚀 ${i18n.t('ui.confirmReincarnateBtn')}</span>`;
    }

    if (paradigmId && paradigmId !== 'paradigm_none') {
      const p = i18n.getParadigm(paradigmId);
      if (p) {
        if (this.ui.dom.confirmParadigmIcon) this.ui.dom.confirmParadigmIcon.textContent = p.icon;
        if (this.ui.dom.confirmParadigmTitle) this.ui.dom.confirmParadigmTitle.textContent = i18n.t('ui.shiftToTitle', { name: p.name });
        if (this.ui.dom.confirmParadigmDesc) this.ui.dom.confirmParadigmDesc.textContent = i18n.t('ui.shiftToDesc', { name: p.name });
        if (this.ui.dom.confirmParadigmEffectsText) this.ui.dom.confirmParadigmEffectsText.textContent = p.effectsSummary;
      }
    } else {
      if (this.ui.dom.confirmParadigmIcon) this.ui.dom.confirmParadigmIcon.textContent = '📜';
      if (this.ui.dom.confirmParadigmTitle) this.ui.dom.confirmParadigmTitle.textContent = i18n.t('ui.restartStandardTitle');
      if (this.ui.dom.confirmParadigmDesc) this.ui.dom.confirmParadigmDesc.textContent = i18n.t('ui.restartStandardDesc');
      if (this.ui.dom.confirmParadigmEffectsText) this.ui.dom.confirmParadigmEffectsText.textContent = i18n.t('ui.restartStandardEffects');
    }

    if (this.ui.dom.paradigmConfirmModal) {
      this.ui.isParadigmConfirmOpen = true;
      this.ui.dom.paradigmConfirmModal.style.display = 'flex';
      void this.ui.dom.paradigmConfirmModal.offsetHeight;
      this.ui.dom.paradigmConfirmModal.classList.add('active');
      this.ui.dom.paradigmConfirmModal.setAttribute('aria-hidden', 'false');
    }
  }

  requestSimpleRestart() {
    this.ui.pendingParadigmChoice = 'simple_restart';

    if (this.ui.dom.confirmModalBadge) {
      this.ui.dom.confirmModalBadge.textContent = `🔄 ${i18n.t('ui.restartTimelineBadge')}`;
    }
    if (this.ui.dom.confirmParadigmIcon) this.ui.dom.confirmParadigmIcon.textContent = '🔄';
    if (this.ui.dom.confirmParadigmTitle) this.ui.dom.confirmParadigmTitle.textContent = i18n.t('ui.restartTimelineTitle');
    if (this.ui.dom.confirmParadigmDesc) {
      this.ui.dom.confirmParadigmDesc.textContent = i18n.t('ui.restartTimelineDesc');
    }
    if (this.ui.dom.confirmEffectsHeader) {
      this.ui.dom.confirmEffectsHeader.textContent = `💡 ${i18n.t('ui.singularityProgressionHeader')}:`;
    }
    if (this.ui.dom.confirmParadigmEffectsText) {
      this.ui.dom.confirmParadigmEffectsText.innerHTML = i18n.t('ui.singularityProgressionText');
    }
    if (this.ui.dom.confirmWarningIcon) this.ui.dom.confirmWarningIcon.textContent = 'ℹ️';
    if (this.ui.dom.confirmWarningText) {
      this.ui.dom.confirmWarningText.textContent = i18n.t('ui.metaPreservedWarning');
    }
    if (this.ui.dom.btnCancelConfirm) {
      const span = this.ui.dom.btnCancelConfirm.querySelector('span');
      if (span) span.textContent = i18n.t('ui.btnCancelConfirm');
    }
    if (this.ui.dom.confirmPurgeOptionContainer) {
      this.ui.dom.confirmPurgeOptionContainer.style.display = 'flex';
    }
    if (this.ui.dom.btnPurgeFromSimple) {
      const span = this.ui.dom.btnPurgeFromSimple.querySelector('span');
      if (span) span.textContent = i18n.t('ui.btnRequestPurge');
    }
    if (this.ui.dom.btnExecuteShift) {
      this.ui.dom.btnExecuteShift.classList.remove('btn-danger-purge');
      this.ui.dom.btnExecuteShift.innerHTML = `<span>🔄 ${i18n.t('ui.confirmRestartBtn')}</span>`;
    }

    if (this.ui.dom.paradigmConfirmModal) {
      this.ui.isParadigmConfirmOpen = true;
      this.ui.dom.paradigmConfirmModal.style.display = 'flex';
      void this.ui.dom.paradigmConfirmModal.offsetHeight;
      this.ui.dom.paradigmConfirmModal.classList.add('active');
      this.ui.dom.paradigmConfirmModal.setAttribute('aria-hidden', 'false');
    }
  }

  requestPurgeData() {
    this.ui.pendingParadigmChoice = 'purge_all_data';

    if (this.ui.dom.confirmModalBadge) {
      this.ui.dom.confirmModalBadge.textContent = `⚠️ ${i18n.t('ui.purgeDataBadge')}`;
    }
    if (this.ui.dom.confirmParadigmIcon) this.ui.dom.confirmParadigmIcon.textContent = '🧹';
    if (this.ui.dom.confirmParadigmTitle) this.ui.dom.confirmParadigmTitle.textContent = i18n.t('ui.purgeDataTitle');
    if (this.ui.dom.confirmParadigmDesc) {
      this.ui.dom.confirmParadigmDesc.textContent = i18n.t('ui.purgeDataDesc');
    }
    if (this.ui.dom.confirmEffectsHeader) {
      this.ui.dom.confirmEffectsHeader.textContent = `🧹 ${i18n.t('ui.purgeDataHeader')}:`;
    }
    if (this.ui.dom.confirmParadigmEffectsText) {
      this.ui.dom.confirmParadigmEffectsText.innerHTML = i18n.t('ui.purgeDataText');
    }
    if (this.ui.dom.confirmWarningIcon) this.ui.dom.confirmWarningIcon.textContent = '🚨';
    if (this.ui.dom.confirmWarningText) {
      this.ui.dom.confirmWarningText.textContent = i18n.t('ui.purgeDataWarning');
    }
    if (this.ui.dom.btnCancelConfirm) {
      const span = this.ui.dom.btnCancelConfirm.querySelector('span');
      if (span) span.textContent = i18n.t('ui.btnCancelConfirm');
    }
    if (this.ui.dom.confirmPurgeOptionContainer) {
      this.ui.dom.confirmPurgeOptionContainer.style.display = 'none';
    }
    if (this.ui.dom.btnExecuteShift) {
      this.ui.dom.btnExecuteShift.innerHTML = `<span>💥 ${i18n.t('ui.purgeDataBtn')}</span>`;
      this.ui.dom.btnExecuteShift.classList.add('btn-danger-purge');
    }

    if (this.ui.dom.paradigmConfirmModal) {
      this.ui.isParadigmConfirmOpen = true;
      this.ui.dom.paradigmConfirmModal.style.display = 'flex';
      void this.ui.dom.paradigmConfirmModal.offsetHeight;
      this.ui.dom.paradigmConfirmModal.classList.add('active');
      this.ui.dom.paradigmConfirmModal.setAttribute('aria-hidden', 'false');
    }
  }

  closeConfirmModal() {
    if (!this.ui.dom.paradigmConfirmModal) return;
    if (typeof document !== 'undefined' && document.activeElement && this.ui.dom.paradigmConfirmModal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    this.ui.isParadigmConfirmOpen = false;
    this.ui.dom.paradigmConfirmModal.classList.remove('active');
    this.ui.dom.paradigmConfirmModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (!this.ui.dom.paradigmConfirmModal.classList.contains('active')) {
        this.ui.dom.paradigmConfirmModal.style.display = 'none';
      }
    }, 250);
  }

  executeConfirmedShift() {
    if (this.ui.pendingParadigmChoice === 'purge_all_data') {
      this.closeConfirmModal();
      this.closeParadigmModal();

      // Reset any active event modal and flush queued event dialogs
      this.ui.isEventModalOpen = false;
      this.ui.eventQueue = [];
      if (this.ui.dom.eventModal) {
        this.ui.dom.eventModal.classList.remove('active');
        this.ui.dom.eventModal.style.display = 'none';
      }

      this.ui.engine.purgeAllData();
      const currentEra = ERAS.find(e => e.id === this.ui.engine.currentEraId) || ERAS[0];
      this.ui.updateTheme(currentEra.themeClass);
      this.ui.switchMobileTab('production');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      this.ui.renderAll();
      this.ui.showToast('🧹 Memory Purged', 'All local save data and timeline progress have been completely reset.', '✨');

      // Clean slate onboarding: Open Help Modal first, then queue Epoch 1 event
      setTimeout(() => {
        this.ui.openHelpModal();
        this.ui.engine.initStartingEra();
      }, 300);
      return;
    }

    if (this.ui.pendingParadigmChoice === 'simple_restart') {
      this.closeConfirmModal();
      this.ui.engine.resetTimeline();
      this.ui.switchMobileTab('production');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      this.ui.showToast('🔄 Timeline Restarted', 'Beginning anew in Epoch 1: Antiquity & Mechanical Automata.', '📜');
      return;
    }

    const chosenId = this.ui.pendingParadigmChoice === 'paradigm_none' ? null : this.ui.pendingParadigmChoice;
    this.closeConfirmModal();
    this.closeParadigmModal();
    this.ui.engine.triggerParadigmShift(chosenId);
    this.ui.switchMobileTab('production');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
