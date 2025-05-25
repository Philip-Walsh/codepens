// Configuration
const CONFIG = {
  TOAST_TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
  },
  TOAST_DURATION: 5000,
  TOAST_DELAY: 700,
  INITIAL_TOAST_COUNT: 15,
  MAX_TOASTS: 5,
  MESSAGES_PATH: 'messages.json',
  SNACKBAR_DURATION: 4000,
  SNACKBAR_DELAY: 500,
  MAX_SNACKBARS: 1
};

// Emoji mapping with accessibility labels
const EMOJI_MAP = {
  info: { emoji: "🌊", label: "Information" },
  success: { emoji: "🏖️", label: "Success" },
  warning: { emoji: "☀️", label: "Warning" },
  error: { emoji: "🌅", label: "Error" }
};

// Create emoji span with accessibility
function createEmojiSpan(type) {
  const span = document.createElement('span');
  span.className = 'emoji-icon';
  span.setAttribute('role', 'img');
  span.setAttribute('aria-label', EMOJI_MAP[type].label);
  span.style.fontFamily = "'Noto Emoji', sans-serif";
  span.style.fontWeight = "700";
  span.textContent = EMOJI_MAP[type].emoji;
  return span;
}

// Toast Manager Class
class ToastManager {
  constructor() {
    this.container = document.getElementById("toast-container");
    this.activeToasts = new Set();
    this.queue = [];
    this.isProcessingQueue = false;
    this.messages = null;

    if (!this.container) {
      console.error("Toast container not found!");
      return;
    }

    this.initialize();
  }

  async initialize() {
    try {
      await this.loadMessages();
      this.initializeEventListeners();
      this.triggerInitialToasts();
    } catch (error) {
      console.error('Failed to initialize ToastManager:', error);
      this.showErrorToast('Failed to load toast messages');
    }
  }

  async loadMessages() {
    try {
      const response = await fetch(CONFIG.MESSAGES_PATH);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.messages = await response.json();
    } catch (error) {
      console.error('Error loading messages:', error);
      throw error;
    }
  }

  initializeEventListeners() {
    // Add click handler for the toast button
    const toastBtn = document.querySelector('.toast-btn');
    if (toastBtn) {
      toastBtn.addEventListener('click', () => this.showRandomToast());
    }

    // Add keyboard shortcut (Alt + T) for showing random toast
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key.toLowerCase() === 't') {
        this.showRandomToast();
      }
    });

    // Add keyboard shortcut (Alt + C) for clearing all toasts
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key.toLowerCase() === 'c') {
        this.clearAllToasts();
      }
    });
  }

  createToastElement(type, message) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    const emoji = createEmojiSpan(type);
    toast.appendChild(emoji);

    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    messageDiv.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.className = "close";
    closeButton.textContent = "✖";
    closeButton.setAttribute('aria-label', 'Close notification');
    closeButton.addEventListener('click', () => this.removeToast(toast));

    toast.appendChild(messageDiv);
    toast.appendChild(closeButton);

    return toast;
  }

  removeToast(toast) {
    if (this.activeToasts.has(toast)) {
      toast.classList.add('removing');
      setTimeout(() => {
        toast.remove();
        this.activeToasts.delete(toast);
        this.processQueue();
      }, 300); // Match the CSS transition duration
    }
  }

  showToast(type, message) {
    if (!this.container) return;

    if (this.activeToasts.size >= CONFIG.MAX_TOASTS) {
      this.queue.push({ type, message });
      return;
    }

    const toast = this.createToastElement(type, message);
    this.container.appendChild(toast);
    this.activeToasts.add(toast);

    // Auto-remove toast after duration
    const timeoutId = setTimeout(() => {
      this.removeToast(toast);
    }, CONFIG.TOAST_DURATION);

    // Store timeout ID for cleanup
    toast.dataset.timeoutId = timeoutId;
  }

  showErrorToast(message) {
    this.showToast(CONFIG.TOAST_TYPES.ERROR, message);
  }

  processQueue() {
    if (this.isProcessingQueue || this.queue.length === 0) return;

    this.isProcessingQueue = true;
    const { type, message } = this.queue.shift();
    this.showToast(type, message);
    this.isProcessingQueue = false;
  }

  showRandomToast() {
    if (!this.messages) {
      this.showErrorToast('Messages not loaded');
      return;
    }

    const types = Object.values(CONFIG.TOAST_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const messages = this.messages[type];

    if (!messages || messages.length === 0) {
      this.showErrorToast('No messages available for this type');
      return;
    }

    const message = messages[Math.floor(Math.random() * messages.length)];
    this.showToast(type, message);
  }

  triggerInitialToasts(count = CONFIG.INITIAL_TOAST_COUNT) {
    if (!this.messages) return;

    for (let i = 0; i < count; i++) {
      setTimeout(() => this.showRandomToast(), i * CONFIG.TOAST_DELAY);
    }
  }

  clearAllToasts() {
    this.activeToasts.forEach(toast => {
      clearTimeout(toast.dataset.timeoutId);
      this.removeToast(toast);
    });
    this.queue = [];
  }

  async reloadMessages() {
    try {
      await this.loadMessages();
      this.showToast(CONFIG.TOAST_TYPES.SUCCESS, 'Messages reloaded successfully');
    } catch (error) {
      console.error('Failed to reload messages:', error);
      this.showErrorToast('Failed to reload messages');
    }
  }
}

// Snackbar Manager Class
class SnackbarManager {
  constructor() {
    this.container = document.getElementById("snackbar-container");
    this.activeSnackbars = new Set();
    this.queue = [];
    this.isProcessingQueue = false;
    this.messages = null;

    if (!this.container) {
      console.error("Snackbar container not found!");
      return;
    }

    this.initialize();
  }

  async initialize() {
    try {
      await this.loadMessages();
      this.initializeEventListeners();
    } catch (error) {
      console.error('Failed to initialize SnackbarManager:', error);
      this.showErrorSnackbar('Failed to load snackbar messages');
    }
  }

  async loadMessages() {
    try {
      const response = await fetch(CONFIG.MESSAGES_PATH);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.messages = await response.json();
    } catch (error) {
      console.error('Error loading messages:', error);
      throw error;
    }
  }

  initializeEventListeners() {
    // Add click handler for the snackbar button
    const snackbarBtn = document.querySelector('.snackbar-btn');
    if (snackbarBtn) {
      snackbarBtn.addEventListener('click', () => this.showRandomSnackbar());
    }

    // Add keyboard shortcut (Alt + S) for showing random snackbar
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        this.showRandomSnackbar();
      }
    });
  }

  createSnackbarElement(type, message) {
    const snackbar = document.createElement("div");
    snackbar.className = `snackbar ${type}`;
    snackbar.setAttribute('role', 'alert');
    snackbar.setAttribute('aria-live', 'polite');

    const emoji = createEmojiSpan(type);
    snackbar.appendChild(emoji);

    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    messageDiv.textContent = message;

    const actionButton = document.createElement("button");
    actionButton.className = "action";
    actionButton.textContent = "Dismiss";
    actionButton.setAttribute('aria-label', 'Dismiss notification');
    actionButton.addEventListener('click', () => this.removeSnackbar(snackbar));

    snackbar.appendChild(messageDiv);
    snackbar.appendChild(actionButton);

    return snackbar;
  }

  removeSnackbar(snackbar) {
    if (this.activeSnackbars.has(snackbar)) {
      snackbar.classList.add('removing');
      setTimeout(() => {
        snackbar.remove();
        this.activeSnackbars.delete(snackbar);
        this.processQueue();
      }, 300); // Match the CSS transition duration
    }
  }

  showSnackbar(type, message) {
    if (!this.container) return;

    if (this.activeSnackbars.size >= CONFIG.MAX_SNACKBARS) {
      this.queue.push({ type, message });
      return;
    }

    const snackbar = this.createSnackbarElement(type, message);
    this.container.appendChild(snackbar);
    this.activeSnackbars.add(snackbar);

    // Auto-remove snackbar after duration
    const timeoutId = setTimeout(() => {
      this.removeSnackbar(snackbar);
    }, CONFIG.SNACKBAR_DURATION);

    // Store timeout ID for cleanup
    snackbar.dataset.timeoutId = timeoutId;
  }

  showErrorSnackbar(message) {
    this.showSnackbar(CONFIG.TOAST_TYPES.ERROR, message);
  }

  processQueue() {
    if (this.isProcessingQueue || this.queue.length === 0) return;

    this.isProcessingQueue = true;
    const { type, message } = this.queue.shift();
    this.showSnackbar(type, message);
    this.isProcessingQueue = false;
  }

  showRandomSnackbar() {
    if (!this.messages) {
      this.showErrorSnackbar('Messages not loaded');
      return;
    }

    const types = Object.values(CONFIG.TOAST_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const messages = this.messages[type];

    if (!messages || messages.length === 0) {
      this.showErrorSnackbar('No messages available for this type');
      return;
    }

    const message = messages[Math.floor(Math.random() * messages.length)];
    this.showSnackbar(type, message);
  }

  clearAllSnackbars() {
    this.activeSnackbars.forEach(snackbar => {
      clearTimeout(snackbar.dataset.timeoutId);
      this.removeSnackbar(snackbar);
    });
    this.queue = [];
  }
}

// Initialize Managers
const toastManager = new ToastManager();
const snackbarManager = new SnackbarManager();

// Global functions for onclick handlers
function showRandomToast() {
  toastManager.showRandomToast();
}

function showRandomSnackbar() {
  snackbarManager.showRandomSnackbar();
}

// Export for testing/development
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ToastManager, SnackbarManager, CONFIG };
}

// Update toast creation
function createToast(type, message) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const emoji = createEmojiSpan(type);
  toast.appendChild(emoji);

  const messageSpan = document.createElement('span');
  messageSpan.className = 'message';
  messageSpan.textContent = message;
  toast.appendChild(messageSpan);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close notification');
  toast.appendChild(closeBtn);

  return toast;
}

// Update snackbar creation
function createSnackbar(type, message, actionText) {
  const snackbar = document.createElement('div');
  snackbar.className = `snackbar ${type}`;

  const emoji = createEmojiSpan(type);
  snackbar.appendChild(emoji);

  const messageSpan = document.createElement('span');
  messageSpan.className = 'message';
  messageSpan.textContent = message;
  snackbar.appendChild(messageSpan);

  if (actionText) {
    const actionBtn = document.createElement('button');
    actionBtn.className = 'action';
    actionBtn.textContent = actionText;
    actionBtn.setAttribute('aria-label', `${actionText} action`);
    snackbar.appendChild(actionBtn);
  }

  return snackbar;
}

// Update card emojis
document.addEventListener('DOMContentLoaded', () => {
  // Update card headers
  document.querySelectorAll('.card h2').forEach(header => {
    const emoji = header.textContent.match(/[^\s]+/)[0];
    const label = header.textContent.replace(emoji, '').trim();

    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'emoji-icon';
    emojiSpan.setAttribute('role', 'img');
    emojiSpan.setAttribute('aria-label', label);
    emojiSpan.style.fontFamily = "'Noto Emoji', sans-serif";
    emojiSpan.style.fontWeight = "700";
    emojiSpan.textContent = emoji;

    header.textContent = '';
    header.appendChild(emojiSpan);
    header.appendChild(document.createTextNode(label));
  });

  // Update list items
  document.querySelectorAll('.card li').forEach(item => {
    const emoji = item.textContent.match(/[^\s]+/)[0];
    const label = item.textContent.replace(emoji, '').trim();

    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'emoji-icon';
    emojiSpan.setAttribute('role', 'img');
    emojiSpan.setAttribute('aria-label', label);
    emojiSpan.style.fontFamily = "'Noto Emoji', sans-serif";
    emojiSpan.style.fontWeight = "700";
    emojiSpan.textContent = emoji;

    item.textContent = '';
    item.appendChild(emojiSpan);
    item.appendChild(document.createTextNode(label));
  });
});