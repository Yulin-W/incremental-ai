/**
 * paradigmModal.js
 * Paradigm Shift 2x2 selector, confirmation modal flow, timeline restart, and hard reset purge.
 */

import { PARADIGMS, ERAS } from '../../data/index.js';

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
        this.ui.showToast('🌌 Continuing Current Timeline', 'Explore further or inspect the Codex. Paradigm Shift remains available in the header.', '📜');
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
    this.renderParadigmCards();
    this.ui.dom.paradigmModal.style.display = 'flex';
    void this.ui.dom.paradigmModal.offsetHeight;
    this.ui.dom.paradigmModal.classList.add('active');
    this.ui.dom.paradigmModal.setAttribute('aria-hidden', 'false');
  }

  closeParadigmModal() {
    if (!this.ui.dom.paradigmModal) return;
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
    PARADIGMS.forEach(p => {
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

    this.ui.dom.paradigmVanillaSlot.appendChild(vanillaBtn);
  }

  requestParadigmShift(paradigmId) {
    this.ui.pendingParadigmChoice = paradigmId;

    if (this.ui.dom.confirmModalBadge) {
      this.ui.dom.confirmModalBadge.textContent = '⚠️ CONFIRM PARADIGM SHIFT';
    }
    if (this.ui.dom.confirmEffectsHeader) {
      this.ui.dom.confirmEffectsHeader.textContent = '⚡ ACTIVE BUFFS FOR NEXT RUN:';
    }
    if (this.ui.dom.confirmWarningIcon) this.ui.dom.confirmWarningIcon.textContent = 'ℹ️';
    if (this.ui.dom.confirmWarningText) {
      this.ui.dom.confirmWarningText.textContent = 'Current insights, generators, and milestone discoveries will reset to Epoch 1.';
    }
    if (this.ui.dom.confirmPurgeOptionContainer) {
      this.ui.dom.confirmPurgeOptionContainer.style.display = 'none';
    }
    if (this.ui.dom.btnExecuteShift) {
      this.ui.dom.btnExecuteShift.classList.remove('btn-danger-purge');
      this.ui.dom.btnExecuteShift.innerHTML = '<span>🚀 Confirm & Reincarnate →</span>';
    }

    if (paradigmId && paradigmId !== 'paradigm_none') {
      const p = PARADIGMS.find(item => item.id === paradigmId);
      if (p) {
        if (this.ui.dom.confirmParadigmIcon) this.ui.dom.confirmParadigmIcon.textContent = p.icon;
        if (this.ui.dom.confirmParadigmTitle) this.ui.dom.confirmParadigmTitle.textContent = `Shift to ${p.name}?`;
        if (this.ui.dom.confirmParadigmDesc) this.ui.dom.confirmParadigmDesc.textContent = `Restart history from Epoch 1 aligned with ${p.name}. Your new run will progress ~2x faster.`;
        if (this.ui.dom.confirmParadigmEffectsText) this.ui.dom.confirmParadigmEffectsText.textContent = p.effectsSummary;
      }
    } else {
      if (this.ui.dom.confirmParadigmIcon) this.ui.dom.confirmParadigmIcon.textContent = '📜';
      if (this.ui.dom.confirmParadigmTitle) this.ui.dom.confirmParadigmTitle.textContent = 'Restart Standard Historical Run?';
      if (this.ui.dom.confirmParadigmDesc) this.ui.dom.confirmParadigmDesc.textContent = 'Restart history from Epoch 1 in authentic unassisted mode with standard 1x baseline speed.';
      if (this.ui.dom.confirmParadigmEffectsText) this.ui.dom.confirmParadigmEffectsText.textContent = 'Standard baseline speed; No active doctrine buffs or discounts.';
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
      this.ui.dom.confirmModalBadge.textContent = '🔄 RESTART TIMELINE';
    }
    if (this.ui.dom.confirmParadigmIcon) this.ui.dom.confirmParadigmIcon.textContent = '🔄';
    if (this.ui.dom.confirmParadigmTitle) this.ui.dom.confirmParadigmTitle.textContent = 'Restart Timeline from Epoch 1?';
    if (this.ui.dom.confirmParadigmDesc) {
      this.ui.dom.confirmParadigmDesc.textContent = 'This will reset your current insights, historical automation, and milestone discoveries back to Epoch 1: Antiquity.';
    }
    if (this.ui.dom.confirmEffectsHeader) {
      this.ui.dom.confirmEffectsHeader.textContent = '💡 SINGULARITY PROGRESSION:';
    }
    if (this.ui.dom.confirmParadigmEffectsText) {
      this.ui.dom.confirmParadigmEffectsText.innerHTML = `Complete all 7 Epochs once to achieve the Technological Singularity. Clearing the game permanently upgrades this button into <strong>AI Paradigm Shifts</strong> with ~2x speed boosts!`;
    }
    if (this.ui.dom.confirmWarningIcon) this.ui.dom.confirmWarningIcon.textContent = 'ℹ️';
    if (this.ui.dom.confirmWarningText) {
      this.ui.dom.confirmWarningText.textContent = 'Active run progress will restart, but any unlocked meta achievements are preserved.';
    }
    if (this.ui.dom.confirmPurgeOptionContainer) {
      this.ui.dom.confirmPurgeOptionContainer.style.display = 'flex';
    }
    if (this.ui.dom.btnExecuteShift) {
      this.ui.dom.btnExecuteShift.classList.remove('btn-danger-purge');
      this.ui.dom.btnExecuteShift.innerHTML = '<span>🔄 Confirm & Restart →</span>';
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
      this.ui.dom.confirmModalBadge.textContent = '⚠️ HARD RESET & PURGE';
    }
    if (this.ui.dom.confirmParadigmIcon) this.ui.dom.confirmParadigmIcon.textContent = '🧹';
    if (this.ui.dom.confirmParadigmTitle) this.ui.dom.confirmParadigmTitle.textContent = 'Permanently Erase All Saved Data?';
    if (this.ui.dom.confirmParadigmDesc) {
      this.ui.dom.confirmParadigmDesc.textContent = 'This will wipe all local storage data from your browser, removing all unlocked paradigms, lifetime insights, and progress back to Day 1.';
    }
    if (this.ui.dom.confirmEffectsHeader) {
      this.ui.dom.confirmEffectsHeader.textContent = '🧹 LOCAL BROWSER STORAGE PURGE:';
    }
    if (this.ui.dom.confirmParadigmEffectsText) {
      this.ui.dom.confirmParadigmEffectsText.innerHTML = `All saves will be deleted from <code>localStorage</code>. The game resets to a brand-new factory state without needing to clear browser history.`;
    }
    if (this.ui.dom.confirmWarningIcon) this.ui.dom.confirmWarningIcon.textContent = '🚨';
    if (this.ui.dom.confirmWarningText) {
      this.ui.dom.confirmWarningText.textContent = 'Warning: This action is permanent and cannot be undone!';
    }
    if (this.ui.dom.confirmPurgeOptionContainer) {
      this.ui.dom.confirmPurgeOptionContainer.style.display = 'none';
    }
    if (this.ui.dom.btnExecuteShift) {
      this.ui.dom.btnExecuteShift.innerHTML = '<span>💥 Erase All Data & Hard Reset</span>';
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
