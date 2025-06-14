class Navigation {
  constructor() {
    this.navLinks = document.querySelectorAll('.nav-link');
    this.sections = document.querySelectorAll('section');
    this.currentSection = 'home';
    this.initialize();
  }

  initialize() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = e.target.textContent.toLowerCase();
        this.navigateTo(target);
      });
    });
  }

  navigateTo(section) {
    // Update active state
    this.navLinks.forEach(link => {
      link.classList.toggle('active', link.textContent.toLowerCase() === section);
    });

    // Update current section
    this.currentSection = section;

    // Show success toast
    if (window.showToast) {
      window.showToast(`Navigated to ${section}`, 'info');
    }
  }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
});
