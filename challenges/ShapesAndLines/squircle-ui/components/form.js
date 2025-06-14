class Form {
  constructor() {
    this.form = document.getElementById('contact-form');
    this.initialize();
  }

  initialize() {
    if (!this.form) return;

    this.form.addEventListener('submit', e => {
      e.preventDefault();
      if (this.validateForm()) {
        this.handleSubmit();
      }
    });
  }

  validateForm() {
    const name = this.form.querySelector('#name').value.trim();
    const email = this.form.querySelector('#email').value.trim();
    const message = this.form.querySelector('#message').value.trim();

    if (!name) {
      window.showToast('Please enter your name', 'error');
      return false;
    }

    if (!email || !this.isValidEmail(email)) {
      window.showToast('Please enter a valid email', 'error');
      return false;
    }

    if (!message) {
      window.showToast('Please enter your message', 'error');
      return false;
    }

    return true;
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  handleSubmit() {
    // Simulate form submission
    const submitBtn = this.form.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    setTimeout(() => {
      window.showToast('Message sent successfully!', 'success');
      this.form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }, 1500);
  }
}

// Initialize form when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Form();
});
