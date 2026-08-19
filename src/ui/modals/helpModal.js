/**
 * helpModal.js
 * How-to-Play guide modal dialog controller and animation lifecycle.
 */

import { i18n } from '../../locales/index.js';

export class HelpModalController {
  constructor(ui) {
    this.ui = ui;
    this.bindEvents();
  }

  bindEvents() {
    if (this.ui.dom.btnHelp) {
      this.ui.dom.btnHelp.addEventListener('click', () => this.open());
    }
    if (this.ui.dom.btnCloseHelp) {
      this.ui.dom.btnCloseHelp.addEventListener('click', () => this.close());
    }
    if (this.ui.dom.btnStartPlaying) {
      this.ui.dom.btnStartPlaying.addEventListener('click', () => this.close());
    }
    if (this.ui.dom.helpModal) {
      this.ui.dom.helpModal.addEventListener('click', (e) => {
        if (e.target === this.ui.dom.helpModal) {
          this.close();
        }
      });
    }
  }

  renderLocalizedContent() {
    if (!this.ui.dom.helpModal) return;
    const q = (sel) => this.ui.dom.helpModal.querySelector(sel);

    const titleEl = q('#help-modal-title') || q('.modal-title') || q('.brand-title');
    if (titleEl) titleEl.textContent = 'Incremental AI';

    const subEl = q('#help-modal-subtitle') || q('.modal-subtitle') || q('.brand-subtitle');
    if (subEl) subEl.textContent = i18n.t('ui.brandSubtitle');

    const whatIsTitle = q('.help-section:first-child .help-heading');
    if (whatIsTitle) whatIsTitle.textContent = i18n.t('ui.helpWhatIsTitle');

    const whatIsText = q('.help-section:first-child .help-text');
    if (whatIsText) whatIsText.innerHTML = i18n.t('ui.helpWhatIsText');

    const howToPlayTitle = q('.help-section:last-child .help-heading');
    if (howToPlayTitle) howToPlayTitle.textContent = i18n.t('ui.helpHowToPlay');

    const cards = this.ui.dom.helpModal.querySelectorAll('.help-step-card');
    if (cards[0]) {
      const strong = cards[0].querySelector('strong');
      const p = cards[0].querySelector('p');
      if (strong) strong.textContent = i18n.t('ui.helpStep1Title');
      if (p) p.textContent = i18n.t('ui.helpStep1Text');
    }
    if (cards[1]) {
      const strong = cards[1].querySelector('strong');
      const p = cards[1].querySelector('p');
      if (strong) strong.textContent = i18n.t('ui.helpStep2Title');
      if (p) p.textContent = i18n.t('ui.helpStep2Text');
    }
    if (cards[2]) {
      const strong = cards[2].querySelector('strong');
      const p = cards[2].querySelector('p');
      if (strong) strong.textContent = i18n.t('ui.helpStep3Title');
      if (p) p.textContent = i18n.t('ui.helpStep3Text');
    }
    if (cards[3]) {
      const strong = cards[3].querySelector('strong');
      const p = cards[3].querySelector('p');
      if (strong) strong.textContent = i18n.t('ui.helpStep4Title');
      if (p) p.textContent = i18n.t('ui.helpStep4Text');
    }
    if (cards[4]) {
      const strong = cards[4].querySelector('strong');
      const p = cards[4].querySelector('p');
      if (strong) strong.textContent = i18n.t('ui.helpStep5Title');
      if (p) p.textContent = i18n.t('ui.helpStep5Text');
    }
    if (cards[5]) {
      const strong = cards[5].querySelector('strong');
      const p = cards[5].querySelector('p');
      if (strong) strong.textContent = i18n.t('ui.helpStep6Title');
      if (p) p.textContent = i18n.t('ui.helpStep6Text');
    }

    if (this.ui.dom.btnStartPlaying) {
      this.ui.dom.btnStartPlaying.textContent = i18n.t('ui.helpStartButton');
    }
  }

  open() {
    if (!this.ui.dom.helpModal) return;
    this.renderLocalizedContent();
    this.ui.isHelpModalOpen = true;
    this.ui.dom.helpModal.style.display = 'flex';
    // Trigger layout reflow for CSS opacity/transform transition
    void this.ui.dom.helpModal.offsetHeight;
    this.ui.dom.helpModal.classList.add('active');
    this.ui.dom.helpModal.setAttribute('aria-hidden', 'false');
  }

  close() {
    if (!this.ui.dom.helpModal) return;
    if (typeof document !== 'undefined' && document.activeElement && this.ui.dom.helpModal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    this.ui.isHelpModalOpen = false;
    this.ui.dom.helpModal.classList.remove('active');
    this.ui.dom.helpModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (!this.ui.dom.helpModal.classList.contains('active')) {
        this.ui.dom.helpModal.style.display = 'none';
        // If an epoch change/activation event is queued, trigger it smoothly right after help closes
        if (!this.ui.isEventModalOpen && this.ui.eventQueue.length > 0) {
          this.ui.showNextEvent();
        }
      }
    }, 250);
  }
}

