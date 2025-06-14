// Toast Notification System
class Toast {
  constructor(message, type = 'info', duration = 4000) {
    this.message = message;
    this.type = type;
    this.duration = duration;
    this.element = this.createElement();
    this.show();
  }

  createElement() {
    const toast = document.createElement('div');
    toast.className = `toast toast-${this.type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getIcon()}</span>
                <span class="toast-message">${this.message}</span>
                <button class="toast-close" aria-label="Close notification">&times;</button>
            </div>
        `;

    // Add click to close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.hide());

    // Click toast to dismiss
    toast.addEventListener('click', () => this.hide());

    return toast;
  }

  getIcon() {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[this.type] || icons.info;
  }

  show() {
    const container = document.getElementById('toast-container') || this.createContainer();
    container.appendChild(this.element);

    // Trigger animation
    requestAnimationFrame(() => {
      this.element.classList.add('toast-show');
    });

    // Auto-hide after duration
    if (this.duration > 0) {
      setTimeout(() => this.hide(), this.duration);
    }
  }

  hide() {
    this.element.classList.add('toast-hide');
    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 300);
  }

  createContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }
}

// Global toast function
window.showToast = (message, type = "info", duration = 4000) => {
  return new Toast(message, type, duration);
};

// Product data
const PRODUCTS = [
  {
    id: 1,
    name: 'Squircle Watch',
    description: 'Elegant timepiece with our signature squircle design',
    price: '$299',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=60',
    category: 'watches'
  },
  {
    id: 2,
    name: 'Squircle Lamp',
    description: 'Modern lighting solution with soft ambient glow',
    price: '$199',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60',
    category: 'lighting'
  },
  {
    id: 3,
    name: 'Squircle Speaker',
    description: 'Premium audio with unique squircle housing',
    price: '$249',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60',
    category: 'audio'
  },
  {
    id: 4,
    name: 'Squircle Clock',
    description: 'Minimalist wall clock with our signature shape',
    price: '$149',
    image: 'https://images.unsplash.com/photo-1516302758847-719c4b9e6e2c?w=500&auto=format&fit=crop&q=60',
    category: 'clocks'
  },
  {
    id: 5,
    name: 'Squircle Plant Pot',
    description: 'Elegant home for your favorite plants',
    price: '$79',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=60',
    category: 'home'
  },
  {
    id: 6,
    name: 'Squircle Mirror',
    description: 'Stylish mirror with unique frame design',
    price: '$399',
    image: 'https://images.unsplash.com/photo-1583845112239-97ef1341b271?w=500&auto=format&fit=crop&q=60',
    category: 'home'
  }
];

// Configuration
const CONFIG = {
  SCROLL: {
    headerThreshold: 100,
    navOffset: 100,
    floatingNavThreshold: 150
  },
  ANIMATION: {
    min: 0.0,
    from: 0.05,
    to: 0.1,
    settle: 0.065,
    phases: [
      { from: 0.0, to: 0.05, dur: 500 },
      { from: 0.05, to: 0.1, dur: 1000 },
      { from: 0.1, to: 0.065, dur: 1500 }
    ]
  }
};

// Utility function for linear interpolation
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Squircle class for managing individual squircle instances
class Squircle {
  constructor(element) {
    this.element = element;
    this.animationFrame = null;
    this.isAnimating = false;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.element.addEventListener('click', () => this.triggerAnimation());
    this.element.addEventListener('mouseenter', () => this.triggerAnimation());
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.triggerAnimation();
      }
    });
  }

  animatePhases(phases) {
    if (this.isAnimating) return;

    this.isAnimating = true;
    let start = null;
    let currentPhase = 0;
    let phaseStart = 0;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const localElapsed = elapsed - phaseStart;
      const phase = phases[currentPhase];
      const t = Math.min(localElapsed / phase.dur, 1);

      const value = lerp(phase.from, phase.to, t);
      this.element.style.setProperty('--squircle-factor', value.toFixed(4));

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
    if (this.isAnimating) return;
    this.animatePhases(CONFIG.ANIMATION.phases);
  }
}

// UI Controller class for managing the overall UI
class UIController {
  constructor() {
    this.gridContainer = document.querySelector('.grid-container');
    this.squircles = [];
    this.initialize();
  }

  initialize() {
    this.createGridItems();
    this.initializeThemeToggle();
  }

  createGridItems() {
    PRODUCTS.forEach((product, index) => {
      const item = document.createElement('div');
      item.className = 'grid-item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', product.name);

      // Create product content
      const content = document.createElement('div');
      content.className = 'product-content';

      // Add product image
      const img = document.createElement('img');
      img.src = product.image;
      img.alt = product.name;
      img.className = 'product-image';

      // Add product info
      const info = document.createElement('div');
      info.className = 'product-info';

      const name = document.createElement('h3');
      name.textContent = product.name;

      const description = document.createElement('p');
      description.textContent = product.description;

      const price = document.createElement('span');
      price.className = 'price';
      price.textContent = product.price;

      info.appendChild(name);
      info.appendChild(description);
      info.appendChild(price);

      content.appendChild(img);
      content.appendChild(info);
      item.appendChild(content);

      this.gridContainer.appendChild(item);
      this.squircles.push(new Squircle(item));
    });
  }

  initializeThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');

    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      themeIcon.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
    });
  }
}

// Light Theme Collections - Professional
const LIGHT_COLLECTIONS = [
  {
    id: 1,
    title: 'Digital Dreamscapes',
    creator: 'Sarah Mitchell',
    creatorAvatar: 'https://i.pravatar.cc/150?img=1',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=60',
    floorPrice: '2.5 ETH',
    volume: '150 ETH'
  },
  {
    id: 2,
    title: 'Abstract Expressions',
    creator: 'Michael Chen',
    creatorAvatar: 'https://i.pravatar.cc/150?img=2',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
    floorPrice: '1.8 ETH',
    volume: '95 ETH'
  },
  {
    id: 3,
    title: 'Geometric Harmony',
    creator: 'Elena Rodriguez',
    creatorAvatar: 'https://i.pravatar.cc/150?img=3',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop&q=60',
    floorPrice: '3.2 ETH',
    volume: '210 ETH'
  },
  {
    id: 4,
    title: 'Neon Futures',
    creator: 'James Wilson',
    creatorAvatar: 'https://i.pravatar.cc/150?img=4',
    image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=500&auto=format&fit=crop&q=60',
    floorPrice: '1.5 ETH',
    volume: '75 ETH'
  },
  {
    id: 5,
    title: 'Crystal Formations',
    creator: 'Anna Kim',
    creatorAvatar: 'https://i.pravatar.cc/150?img=5',
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=500&auto=format&fit=crop&q=60',
    floorPrice: '2.1 ETH',
    volume: '120 ETH'
  },
  {
    id: 6,
    title: 'Urban Landscapes',
    creator: 'David Park',
    creatorAvatar: 'https://i.pravatar.cc/150?img=6',
    image: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=500&auto=format&fit=crop&q=60',
    floorPrice: '1.9 ETH',
    volume: '88 ETH'
  }
];

// Dark Theme Collections - Satirical
const DARK_COLLECTIONS = [
  {
    id: 1,
    title: 'Existential Crisis Monkeys',
    creator: 'Broke Artist #1',
    creatorAvatar: 'https://i.pravatar.cc/150?img=1',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=60',
    floorPrice: '69.420 ETH',
    volume: '404 ETH (Not Found)'
  },
  {
    id: 2,
    title: 'Pixel Regrets Collection',
    creator: 'MS Paint Master',
    creatorAvatar: 'https://i.pravatar.cc/150?img=2',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
    floorPrice: '13.37 ETH',
    volume: '∞ Tears'
  },
  {
    id: 3,
    title: 'Abstract Bank Account',
    creator: 'Definitely Not Bankrupt',
    creatorAvatar: 'https://i.pravatar.cc/150?img=3',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop&q=60',
    floorPrice: '0.001 ETH',
    volume: 'Your Mortgage'
  },
  {
    id: 4,
    title: 'Neon Nightmares',
    creator: 'Crypto Bro Supreme',
    creatorAvatar: 'https://i.pravatar.cc/150?img=4',
    image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=500&auto=format&fit=crop&q=60',
    floorPrice: '1337.69 ETH',
    volume: 'Your Firstborn'
  },
  {
    id: 5,
    title: 'AI Generated Sadness',
    creator: 'ChatGPT',
    creatorAvatar: 'https://i.pravatar.cc/150?img=5',
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=500&auto=format&fit=crop&q=60',
    floorPrice: '2.718 ETH',
    volume: 'Human Creativity'
  },
  {
    id: 6,
    title: 'Copy Paste Champions',
    creator: 'Ctrl+C Warrior',
    creatorAvatar: 'https://i.pravatar.cc/150?img=6',
    image: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=500&auto=format&fit=crop&q=60',
    floorPrice: '0.0001 ETH',
    volume: 'Original Ideas'
  }
];

// Navigation Controller - Enhanced
class NavigationController {
  constructor() {
    this.header = document.querySelector('.header');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.floatingNav = document.querySelector('#floating-nav');
    this.floatingNavToggle = this.floatingNav?.querySelector('.floating-nav-toggle');
    this.floatingNavLinks = document.querySelectorAll('.floating-nav-link');
    this.scrollProgress = document.querySelector('#scroll-progress');
    this.lastScrollY = window.scrollY;
    this.ticking = false;
    this.scrollDirection = 'up';
    this.isFloatingNavOpen = false;

    this.initialize();
  }

  initialize() {
    this.setupScrollListener();
    this.setupNavLinks();
    this.setupFloatingNav();
    this.setupThemeToggle();
    this.setupScrollAnimations();
    this.setupScrollProgress();
  }

  setupScrollListener() {
    let lastScrollTime = 0;
    window.addEventListener('scroll', () => {
        const now = Date.now();
      if (now - lastScrollTime > 10) { // Throttle to 100fps max
          if (!this.ticking) {
            window.requestAnimationFrame(() => this.handleScroll());
          this.ticking = true;
          }
          lastScrollTime = now;
      }
    }, { passive: true });
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';

    this.updateHeaderVisibility(currentScrollY);
    this.updateFloatingNavVisibility(currentScrollY);
    this.updateActiveNavLink(currentScrollY);
    this.updateScrollProgress();
    this.updateBackgroundGradient(currentScrollY);

    this.lastScrollY = currentScrollY;
    this.ticking = false;
  }

  updateHeaderVisibility(scrollY) {
    if (this.scrollDirection === 'down' && scrollY > CONFIG.SCROLL.headerThreshold) {
      this.header.classList.add('shrink');
    } else {
      this.header.classList.remove('shrink');
    }
  }

  updateFloatingNavVisibility(scrollY) {
    if (!this.floatingNav) return;

    if (scrollY > CONFIG.SCROLL.floatingNavThreshold) {
      this.floatingNav.classList.add('visible');
    } else {
      this.floatingNav.classList.remove('visible');
      this.closeFloatingNav();
    }
  }

  updateActiveNavLink(scrollY) {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = scrollY + CONFIG.SCROLL.navOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
      const floatingNavLink = document.querySelector(`.floating-nav-link[href="#${sectionId}"]`);

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        // Update desktop nav
        this.navLinks.forEach(link => link.classList.remove('active'));
        navLink?.classList.add('active');

        // Update floating nav
        this.floatingNavLinks.forEach(link => link.classList.remove('active'));
        floatingNavLink?.classList.add('active');
      }
    });
  }

  updateScrollProgress() {
    if (!this.scrollProgress) return;

    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height);

    this.scrollProgress.style.transform = `scaleX(${scrolled})`;
  }

  updateBackgroundGradient(scrollY) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);

    // Apply dynamic color to body based on scroll
    document.documentElement.style.setProperty('--scroll-progress', scrollProgress);

    // Add gradient classes to sections based on scroll position
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible) {
        section.classList.add('section-gradient');
      }
    });
  }

  setupNavLinks() {
    [...this.navLinks, ...this.floatingNavLinks].forEach(link => {
      link.addEventListener('click', (e) => this.handleNavClick(e, link));
    });
  }

  handleNavClick(e, link) {
    e.preventDefault();
    const targetId = link.getAttribute('href');

    if (!targetId || targetId === '#') return;

    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      const headerHeight = this.header.offsetHeight;
      const targetPosition = targetSection.offsetTop - headerHeight - 20;

      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth'
      });

      // Close floating nav if open
      if (this.isFloatingNavOpen) {
        this.closeFloatingNav();
      }
    }
  }

  setupFloatingNav() {
    if (!this.floatingNavToggle) return;

    this.floatingNavToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFloatingNav();
    });

    // Close floating nav when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isFloatingNavOpen && !this.floatingNav.contains(e.target)) {
        this.closeFloatingNav();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isFloatingNavOpen) {
        this.closeFloatingNav();
      }
    });
  }

  toggleFloatingNav() {
    if (this.isFloatingNavOpen) {
      this.closeFloatingNav();
    } else {
      this.openFloatingNav();
    }
  }

  openFloatingNav() {
    this.floatingNav.classList.add('active');
    this.isFloatingNavOpen = true;
    this.floatingNavToggle.setAttribute('aria-expanded', 'true');
  }

  closeFloatingNav() {
    this.floatingNav.classList.remove('active');
    this.isFloatingNavOpen = false;
    this.floatingNavToggle.setAttribute('aria-expanded', 'false');
  }

  setupThemeToggle() {
    const themeToggles = document.querySelectorAll('.theme-toggle');

    themeToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isDarkTheme = document.body.classList.contains('dark-theme');
        document.body.classList.toggle('dark-theme');

        // Update all theme icons
        const newIsDark = document.body.classList.contains('dark-theme');
        document.querySelectorAll('.theme-icon').forEach(icon => {
          icon.textContent = newIsDark ? '☀️' : '🌙';
        });

        // Refresh collections for new theme
        if (window.marketplace) {
          window.marketplace.createCollectionCards();
        }

        // Show theme-appropriate messages
        if (window.showToast) {
          if (newIsDark) {
            const darkMessages = [
              "Welcome to the dark side! Now you see the truth! 💀",
              "Reality mode activated. Prepare for brutal honesty! 🔥",
              "Dark theme: Where we tell you what NFTs really are! 😈"
            ];
            window.showToast(darkMessages[Math.floor(Math.random() * darkMessages.length)], 'warning');
          } else {
            const lightMessages = [
              "Professional mode activated. Everything looks legitimate! ✨",
              "Light theme: Back to pretending this makes sense! 🎨",
              "Welcome to the respectable side of digital art! 💼"
            ];
            window.showToast(lightMessages[Math.floor(Math.random() * lightMessages.length)], 'success');
          }
        }
        }

        // Close floating nav if open
        if (this.isFloatingNavOpen) {
          this.closeFloatingNav();
        }
      });
    });
  }

  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          // Don't unobserve to allow re-animation if needed
        }
      });
    }, observerOptions);

    // Observe all fade-in-up elements
    document.querySelectorAll('.fade-in-up').forEach(el => {
      observer.observe(el);
    });

    // Observe cards for staggered animation
    document.querySelectorAll('.collection-card, .category-card, .step-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
      observer.observe(card);
      });
  }

  setupScrollProgress() {
    if (!this.scrollProgress) return;

    // Initialize scroll progress
    this.updateScrollProgress();
  }
}

// Marketplace Controller - Enhanced
class MarketplaceController {
  constructor() {
    this.collectionsGrid = document.querySelector('.collections-grid');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.isLoaded = false;
    this.initialize();
  }

  initialize() {
    this.createCollectionCards();
    this.setupFilters();
    this.addWelcomeMessage();
    this.isLoaded = true;
  }

  createCollectionCards() {
    if (!this.collectionsGrid) return;

    // Choose collections based on theme
    const isDarkTheme = document.body.classList.contains('dark-theme');
    const collections = isDarkTheme ? DARK_COLLECTIONS : LIGHT_COLLECTIONS;

    // Clear existing cards
    this.collectionsGrid.innerHTML = '';

    // Create new cards with staggered animation
    collections.forEach((collection, index) => {
      setTimeout(() => {
        const card = this.createCollectionCard(collection, isDarkTheme);
        card.classList.add('fade-in-up');
        this.collectionsGrid.appendChild(card);

        // Trigger animation after a brief delay
        requestAnimationFrame(() => {
          card.classList.add('animated');
        });
      }, index * 100); // Stagger by 100ms
    });
  }

  createCollectionCard(collection, isDarkTheme) {
    const card = document.createElement('div');
    card.className = 'collection-card';
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `${collection.title} by ${collection.creator}`);

    card.innerHTML = `
            <img src="${collection.image}" alt="${collection.title}" class="collection-image" loading="lazy">
            <div class="collection-info">
                <h3 class="collection-title">${collection.title}</h3>
                <div class="collection-creator">
                    <img src="${collection.creatorAvatar}" alt="${collection.creator}" class="creator-avatar" loading="lazy">
                    <span>${collection.creator}</span>
                </div>
                <div class="collection-stats">
                    <span>Floor: ${collection.floorPrice}</span>
                    <span>Volume: ${collection.volume}</span>
                </div>
            </div>
        `;

    // Add theme-appropriate click events with improved feedback
    card.addEventListener('click', () => {
      // Add click animation
      card.style.transform = 'scale(0.98)';
      setTimeout(() => {
        card.style.transform = '';
      }, 150);

      if (window.showToast) {
        if (isDarkTheme) {
          const sarcasticMessages = [
            'Congratulations! You clicked on digital disappointment! 😅',
            "This JPEG could be yours for the low price of your mortgage! 🏠💸",
            "Warning: May cause financial ruin and existential crisis! ⚠️",
            "Fun fact: This took 5 minutes to make but costs $50k! ⏰💰",
            "Your right-click is worth more than this NFT! 🖱️",
            "Investment advice: Don't. 🚫"
          ];
          const message = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];
          window.showToast(message, 'warning');
        } else {
          const professionalMessages = [
            "Exploring this premium collection by " + collection.creator + ' 🎨',
            "This artwork showcases exceptional digital craftsmanship ✨",
            "Consider adding this piece to your curated collection 💎",
            "Authentic digital art with verified provenance 🔐",
            "Join the community of discerning collectors 👥",
            "Invest in the future of digital creativity 🚀"
          ];
          const message = professionalMessages[Math.floor(Math.random() * professionalMessages.length)];
          window.showToast(message, 'info');
        }
      }
    });

    // Add hover effects for better interactivity
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });

    return card;
  }

  setupFilters() {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Visual feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = '';
        }, 100);

        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Theme-appropriate filter messages with enhanced feedback
        if (window.showToast) {
          const isDarkTheme = document.body.classList.contains('dark-theme');

          if (isDarkTheme) {
            const darkFilterMessages = {
              'All Scams': 'Showing all overpriced JPEGs! 🎭',
              'Pixel Art': '8-bit art, million-dollar prices! 🎮💰',
              'AI Generated': 'Made by robots, bought by humans! 🤖',
              'Copy & Paste': 'Originality not included! 📋',
              'Money Grabs': 'The most honest category! 💸'
            };
            const message = darkFilterMessages[button.textContent] || 'Filter applied! Still overpriced! 🏷️';
            window.showToast(message, 'warning');
          } else {
            const lightFilterMessages = {
              'All': 'Viewing our complete curated collection ✨',
              'Art': 'Premium digital artworks by renowned creators 🎨',
              'Photography': 'Stunning visual narratives captured digitally 📸',
              'Gaming': 'Collectible assets from popular games 🎮',
              'Music': 'Exclusive audio experiences and tracks 🎵'
            };
            const message = lightFilterMessages[button.textContent] || 'Collection filtered successfully! 🔍';
            window.showToast(message, 'success');
          }
        }
      });
    });
  }

  addWelcomeMessage() {
    if (window.showToast) {
      setTimeout(() => {
        const isDarkTheme = document.body.classList.contains('dark-theme');

        if (isDarkTheme) {
          const darkWelcomeMessages = [
            'Welcome to SquircleNFT! Where dreams go to die! 💀',
            "Pro tip: Right-clicking is free! 🖱️",
            'Remember: You\'re not buying art, you\'re buying bragging rights! 🎭',
            "Built with love (and sarcasm) by Philip Walsh! 👨‍💻"
          ];
          const message = darkWelcomeMessages[Math.floor(Math.random() * darkWelcomeMessages.length)];
          window.showToast(message, 'warning');
        } else {
          const lightWelcomeMessages = [
            "Welcome to SquircleNFT! Discover premium digital art ✨",
            "Explore authenticated collections from verified artists 🎨",
            "Join the future of digital art ownership 🚀",
            "Crafted with passion by Philip Walsh! 👨‍💻"
          ];
          const message = lightWelcomeMessages[Math.floor(Math.random() * lightWelcomeMessages.length)];
          window.showToast(message, 'success');
        }
      }, 2000);
    }
  }
}

// Performance optimizations
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Improved resize handler
const handleResize = debounce(() => {
  // Recalculate container sizes and update animations
  const cards = document.querySelectorAll('.collection-card, .category-card');
  cards.forEach(card => {
    card.style.transition = 'none';
    requestAnimationFrame(() => {
      card.style.transition = '';
    });
  });
}, 250);

// Initialize application with enhanced error handling and performance
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Initialize core components
    const navigation = new NavigationController();
    const marketplace = new MarketplaceController();

    // Make marketplace globally accessible for theme switching
    window.marketplace = marketplace;

    // Setup resize handler
    window.addEventListener('resize', handleResize, { passive: true });

    // Improved mobile touch handling
    if ('ontouchstart' in window) {
      document.body.classList.add('touch-device');

      // Prevent zoom on double tap for buttons
      document.querySelectorAll('button, .collection-card').forEach(element => {
        element.addEventListener('touchend', (e) => {
              e.preventDefault();
              element.click();
        }, { passive: false });
      });
    });
    // Add startup humor based on theme
    const isDarkTheme = document.body.classList.contains('dark-theme');
    if (isDarkTheme) {
      console.log('🎉 SquircleNFT loaded! Your wallet is now in danger! 💸');
      console.log('💡 Pro tip: Ctrl+S saves money better than buying NFTs!');
      console.log('🚨 Warning: Side effects may include financial ruin and regret!');
      console.log('👨‍💻 Crafted with love (and brutal honesty) by Philip Walsh!');
    } else {
      console.log('✨ SquircleNFT Premium Marketplace loaded successfully!');
      console.log('🎨 Discover authenticated digital art from verified creators');
      console.log('🔐 Secure blockchain-verified ownership and provenance');
      console.log('👨‍💻 Built with passion and precision by Philip Walsh!');
    }

    // Add developer signature
    console.log('🔗 Connect with Philip Walsh:');
    console.log('   LinkedIn: https://linkedin.com/in/philip-walsh-01');
    console.log('   GitHub: https://github.com/Philip-Walsh');
    console.log('   CodePen: https://codepen.io/Philip-Walsh/');

  } catch (error) {
    console.error('Failed to initialize application:', error);
    const isDarkTheme = document.body.classList.contains('dark-theme');
    if (isDarkTheme) {
      console.log('😅 Well, at least something is working as expected...');
    } else {
      console.log('⚠️ Please refresh the page or contact support');
    }
  }
});
