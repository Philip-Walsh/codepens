// Toast configuration
const TOAST_CONFIG = {
  TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
  },
  DURATION: 5000,
  MAX_TOASTS: 3,
};

// Toast class for managing notifications
class Toast {
  constructor(message, type = TOAST_CONFIG.TYPES.INFO) {
    this.message = message;
    this.type = type;
    this.element = null;
    this.timeout = null;
    this.create();
  }

  create() {
    const toast = document.createElement('div');
    toast.className = `toast ${this.type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    const icon = document.createElement('span');
    icon.className = 'emoji-icon';
    icon.setAttribute('role', 'img');
    icon.setAttribute('aria-label', this.getIconLabel());
    icon.textContent = this.getIcon();

    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = this.message;

    const close = document.createElement('button');
    close.className = 'close';
    close.setAttribute('aria-label', 'Close notification');
    close.textContent = '×';
    close.addEventListener('click', () => this.remove());

    toast.appendChild(icon);
    toast.appendChild(message);
    toast.appendChild(close);
    this.element = toast;
  }

  getIcon() {
    const icons = {
      [TOAST_CONFIG.TYPES.INFO]: 'ℹ️',
      [TOAST_CONFIG.TYPES.SUCCESS]: '✅',
      [TOAST_CONFIG.TYPES.WARNING]: '⚠️',
      [TOAST_CONFIG.TYPES.ERROR]: '❌',
    };
    return icons[this.type] || icons[TOAST_CONFIG.TYPES.INFO];
  }

  getIconLabel() {
    const labels = {
      [TOAST_CONFIG.TYPES.INFO]: 'Information',
      [TOAST_CONFIG.TYPES.SUCCESS]: 'Success',
      [TOAST_CONFIG.TYPES.WARNING]: 'Warning',
      [TOAST_CONFIG.TYPES.ERROR]: 'Error',
    };
    return labels[this.type] || labels[TOAST_CONFIG.TYPES.INFO];
  }

  show() {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Remove oldest toast if at max capacity
    if (container.children.length >= TOAST_CONFIG.MAX_TOASTS) {
      container.firstChild?.remove();
    }

    container.appendChild(this.element);
    this.element.classList.add('show');

    // Auto remove after duration
    this.timeout = setTimeout(() => this.remove(), TOAST_CONFIG.DURATION);
  }

  remove() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.element) {
      this.element.classList.add('removing');
      setTimeout(() => this.element.remove(), 300);
    }
  }
}

// Toast manager for handling multiple toasts
class ToastManager {
  constructor() {
    this.toasts = [];
  }

  show(message, type = TOAST_CONFIG.TYPES.INFO) {
    const toast = new Toast(message, type);
    this.toasts.push(toast);
    toast.show();
    return toast;
  }

  clear() {
    this.toasts.forEach(toast => toast.remove());
    this.toasts = [];
  }
}

// Initialize toast manager
const toastManager = new ToastManager();

// Expose toast functionality globally
window.showToast = (message, type) => toastManager.show(message, type);
window.clearToasts = () => toastManager.clear();
