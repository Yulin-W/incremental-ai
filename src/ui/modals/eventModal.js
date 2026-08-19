/**
 * eventModal.js
 * Paradox-style historical narrative epoch advance modal dialog and event queue controller.
 */

export class EventModalController {
  constructor(ui) {
    this.ui = ui;
    this.bindEvents();
  }

  bindEvents() {
    if (this.ui.dom.btnEventAcknowledge) {
      this.ui.dom.btnEventAcknowledge.addEventListener('click', () => this.close());
    }
    if (this.ui.dom.btnCloseEvent) {
      this.ui.dom.btnCloseEvent.addEventListener('click', () => this.close());
    }
    if (this.ui.dom.eventModal) {
      this.ui.dom.eventModal.addEventListener('click', (e) => {
        if (e.target === this.ui.dom.eventModal) {
          this.close();
        }
      });
    }
  }

  triggerPopup(eventData) {
    if (!eventData) return;
    this.ui.eventQueue.push(eventData);
    if (!this.ui.isEventModalOpen && !this.ui.isHelpModalOpen) {
      this.showNextEvent();
    }
  }

  showNextEvent() {
    if (this.ui.eventQueue.length === 0) {
      this.ui.isEventModalOpen = false;
      return;
    }

    const event = this.ui.eventQueue.shift();
    this.ui.isEventModalOpen = true;

    if (this.ui.dom.eventModalCategory) {
      this.ui.dom.eventModalCategory.textContent = event.category || "🏛️ NEW EPOCH REACHED";
    }
    if (this.ui.dom.eventModalEpochPill) {
      this.ui.dom.eventModalEpochPill.textContent = `Epoch ${event.epochNumber || event.epochId || event.eraId || 1}`;
    }
    if (this.ui.dom.eventModalIcon) {
      this.ui.dom.eventModalIcon.textContent = event.icon || "📜";
    }
    if (this.ui.dom.eventModalTitle) {
      const epochNum = event.epochNumber || event.epochId || event.eraId || 1;
      this.ui.dom.eventModalTitle.textContent = event.title && event.title.startsWith("Epoch")
        ? event.title
        : `Epoch ${epochNum}: ${event.title || ''}`;
    }
    if (this.ui.dom.eventModalSubtitle) {
      this.ui.dom.eventModalSubtitle.textContent = event.subtitle || "";
    }
    if (this.ui.dom.eventModalNarrative) {
      this.ui.dom.eventModalNarrative.textContent = event.narrative || "";
    }
    if (this.ui.dom.eventModalQuoteText) {
      this.ui.dom.eventModalQuoteText.textContent = event.quote ? event.quote.text : "";
    }
    if (this.ui.dom.eventModalQuoteAuthor) {
      this.ui.dom.eventModalQuoteAuthor.textContent = event.quote ? `— ${event.quote.author}` : "";
    }

    if (this.ui.dom.eventModalBtnText) {
      this.ui.dom.eventModalBtnText.textContent = event.buttonText || "Acknowledge & Proceed →";
    }

    if (this.ui.dom.eventModal) {
      this.ui.dom.eventModal.style.display = "flex";
      void this.ui.dom.eventModal.offsetHeight;
      this.ui.dom.eventModal.classList.add("active");
      this.ui.dom.eventModal.setAttribute("aria-hidden", "false");
    }
  }

  close() {
    if (!this.ui.dom.eventModal || !this.ui.isEventModalOpen) return;
    this.ui.dom.eventModal.classList.remove("active");
    this.ui.dom.eventModal.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      if (!this.ui.dom.eventModal.classList.contains("active")) {
        this.ui.dom.eventModal.style.display = "none";
        this.ui.isEventModalOpen = false;
        if (this.ui.eventQueue.length > 0) {
          this.showNextEvent();
        }
      }
    }, 250);
  }
}
