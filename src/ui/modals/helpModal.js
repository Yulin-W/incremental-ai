/**
 * helpModal.js
 * How-to-Play guide modal dialog controller and animation lifecycle.
 */

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

  open() {
    if (!this.ui.dom.helpModal) return;
    this.ui.isHelpModalOpen = true;
    this.ui.dom.helpModal.style.display = 'flex';
    // Trigger layout reflow for CSS opacity/transform transition
    void this.ui.dom.helpModal.offsetHeight;
    this.ui.dom.helpModal.classList.add('active');
    this.ui.dom.helpModal.setAttribute('aria-hidden', 'false');
  }

  close() {
    if (!this.ui.dom.helpModal) return;
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
