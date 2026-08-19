/**
 * toast.js
 * Toast notification manager and DOM lifecycle controller.
 */

export class ToastManager {
  constructor(container) {
    this.container = container;
  }

  showToast(title, message, icon = '💡', duration = 4000) {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    this.container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  }
}
