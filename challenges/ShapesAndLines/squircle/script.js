// Constants for animation configuration
const ANIMATION_CONFIG = {
  min: 0.0,
  from: 0.05,
  to: 0.1,
  settle: 0.065,
  phases: [
    { from: 0.0, to: 0.05, dur: 500 },
    { from: 0.05, to: 0.1, dur: 1000 },
    { from: 0.1, to: 0.065, dur: 1500 },
  ],
};

// Utility function for linear interpolation
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Animation controller class
class SquircleAnimation {
  constructor() {
    this.root = document.documentElement;
    this.squircle = document.querySelector('.squircle');
    this.animationFrame = null;
    this.isAnimating = false;

    if (!this.squircle) {
      console.error('Squircle element not found');
      return;
    }

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Mouse and touch events
    this.squircle.addEventListener('click', () => this.triggerAnimation());
    this.squircle.addEventListener('mouseenter', () => this.triggerAnimation());

    // Keyboard accessibility
    this.squircle.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.triggerAnimation();
      }
    });

    // Touch events for mobile
    this.squircle.addEventListener(
      'touchstart',
      e => {
        e.preventDefault();
        this.triggerAnimation();
      },
      { passive: false }
    );

    // Reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      this.disableAnimations();
    }
    prefersReducedMotion.addEventListener('change', e => {
      if (e.matches) {
        this.disableAnimations();
      }
    });
  }

  disableAnimations() {
    this.root.style.setProperty('--squircle-factor', ANIMATION_CONFIG.settle);
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  animatePhases(phases) {
    if (this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    let start = null;
    let currentPhase = 0;
    let phaseStart = 0;

    const step = timestamp => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const localElapsed = elapsed - phaseStart;
      const phase = phases[currentPhase];
      const t = Math.min(localElapsed / phase.dur, 1);

      const value = lerp(phase.from, phase.to, t);
      this.root.style.setProperty('--squircle-factor', value.toFixed(4));

      if (t >= 1) {
        currentPhase++;
        phaseStart = elapsed;
        if (currentPhase >= phases.length) {
          this.isAnimating = false;
          return;
        }
      }

      this.animationFrame = requestAnimationFrame(step);
    };

    this.animationFrame = requestAnimationFrame(step);
  }

  triggerAnimation() {
    if (this.isAnimating) {
      return;
    }
    this.animatePhases(ANIMATION_CONFIG.phases);
  }
}

// Initialize animation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    const animation = new SquircleAnimation();
    // Trigger initial animation
    animation.triggerAnimation();
  } catch (error) {
    console.error('Failed to initialize squircle animation:', error);
  }
});
