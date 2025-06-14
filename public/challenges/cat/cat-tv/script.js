// Canvas setup
const canvas = document.getElementById('catCanvas');
const ctx = canvas.getContext('2d');

// Constants
const EMOJIS = ['🐭', '🐱', '🐦', '🐰', '🦄', '🦋', '🐢', '🦊', '🐼', '🦁', '🐯', '🐨', '🦒', '🦘', '🦥', '🦦'];
const CREATURE_COUNT = {
  bouncingMice: 20,
  chasingCats: { cats: 10, mice: 15 },
  randomEmojis: 20
};

// Performance optimization
const PERFORMANCE = {
  updateInterval: 1000 / 30,  // Cap at 30 FPS
  lastUpdate: 0,
  skipFrames: 0,
  maxSkipFrames: 2,
  viewportPadding: 100,  // Extra padding for smooth transitions
  renderScale: window.devicePixelRatio || 1,  // Handle high DPI displays
  isLowPowerMode: false,
  gridSize: 200,  // Size of each grid cell for spatial partitioning
  collisionCheckInterval: 100  // Check collisions every 100ms
};

// Viewport tracking
const VIEWPORT = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  update() {
    this.width = canvas.width;
    this.height = canvas.height;
    this.x = 0;
    this.y = 0;
  }
};

// Color presets
const COLOR_PRESETS = {
  dark: {
    background: 'rgba(44, 24, 16, 0.85)',
    text: '#D2B48C',
    highlight: '#8B4513',
    energy: {
      high: '#8B5A2B',
      low: '#654321'
    }
  },
  pastel: {
    background: 'rgba(255, 229, 229, 0.85)',
    text: '#FFB3B3',
    highlight: '#FF9999',
    energy: {
      high: '#FF8080',
      low: '#FF6666'
    }
  },
  mint: {
    background: 'rgba(224, 247, 233, 0.85)',
    text: '#B3E6CC',
    highlight: '#99D9B3',
    energy: {
      high: '#80CC99',
      low: '#66BF80'
    }
  },
  lavender: {
    background: 'rgba(240, 230, 255, 0.85)',
    text: '#D9CCFF',
    highlight: '#C2B3FF',
    energy: {
      high: '#AB99FF',
      low: '#9480FF'
    }
  },
  sunset: {
    background: 'rgba(255, 229, 204, 0.85)',
    text: '#FFD6B3',
    highlight: '#FFC799',
    energy: {
      high: '#FFB880',
      low: '#FFA966'
    }
  },
  ocean: {
    background: 'rgba(204, 229, 255, 0.85)',
    text: '#B3D6FF',
    highlight: '#99C7FF',
    energy: {
      high: '#80B8FF',
      low: '#66A9FF'
    }
  }
};

// Snack menu items
const SNACKS = [
  { emoji: '🍖', name: 'Meat', cost: 50, effect: 'energy' },
  { emoji: '🐟', name: 'Fish', cost: 30, effect: 'speed' },
  { emoji: '🥛', name: 'Milk', cost: 20, effect: 'size' },
  { emoji: '🍪', name: 'Cookie', cost: 10, effect: 'points' },
  { emoji: '🧀', name: 'Cheese', cost: 40, effect: 'invincible' },
  { emoji: '🥩', name: 'Steak', cost: 100, effect: 'super' }
];

// State
let currentMode = 'bouncingMice';
const creatures = [];
const emojiObjs = [];
let isPaused = false;
let speedMultiplier = 1;
let showControls = true;
let showSelectors = false;
let currentColors = COLOR_PRESETS.dark;
let selectedEmoji = '🐭';
let centerX = 0;
let centerY = 0;
let points = 0;
let showSnackMenu = false;
let pointsPopup = null;
let lastTime = 0;
let animationFrameId = null;

// Debug logging
const DEBUG = {
  enabled: true,
  log: function (...args) {
    if (this.enabled) {
      console.log('[CatTV]', ...args);
    }
  },
  error: function (...args) {
    if (this.enabled) {
      console.error('[CatTV]', ...args);
    }
  }
};

// Movement patterns
const MOVEMENT_PATTERNS = {
  // Mouse-like movement: quick, darting movements with pauses
  mouse: (obj) => {
    const now = Date.now();

    if (!obj.lastDirectionChange) {
      obj.lastDirectionChange = now;
      obj.direction = Math.random() * Math.PI * 2;
      obj.isResting = false;
      obj.restTime = 0;
      DEBUG.log('Mouse initialized:', obj);
    }

    const timeSinceChange = now - obj.lastDirectionChange;

    // Resting behavior
    if (obj.isResting) {
      obj.restTime += 16;
      if (obj.restTime > 500) { // Shorter rest time
        obj.isResting = false;
        obj.lastDirectionChange = now;
        obj.direction = Math.random() * Math.PI * 2;
        DEBUG.log('Mouse finished resting:', obj);
      }
      obj.vx *= 0.95;
      obj.vy *= 0.95;
      return;
    }

    // Quick darting movement
    if (timeSinceChange > 200) { // More frequent direction changes
      obj.lastDirectionChange = now;
      if (Math.random() < 0.1) { // Less frequent resting
        obj.isResting = true;
        obj.restTime = 0;
        DEBUG.log('Mouse started resting:', obj);
        return;
      }
      obj.direction = Math.random() * Math.PI * 2;
    }

    // Add some randomness to movement
    obj.direction += (Math.random() - 0.5) * 0.5; // More random direction changes
    const speed = 8 + Math.random() * 4; // Much faster base speed
    obj.vx = Math.cos(obj.direction) * speed;
    obj.vy = Math.sin(obj.direction) * speed;

    DEBUG.log('Mouse velocity:', { vx: obj.vx, vy: obj.vy, speed });
  },

  // Cat-like movement: smooth, predatory movements
  cat: (obj, allObjects) => {
    const now = Date.now();

    if (!obj.target || now - obj.lastTargetUpdate > 1000) { // More frequent target updates
      const potentialTargets = allObjects.filter(o =>
        o !== obj &&
                o.char === '🐭' &&
                o.energy > 0
      );
      if (potentialTargets.length > 0) {
        obj.target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
        obj.lastTargetUpdate = now;
        DEBUG.log('Cat found new target:', obj.target);
      }
    }

    if (obj.target) {
      const dx = obj.target.x - obj.x;
      const dy = obj.target.y - obj.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Stalking behavior
      if (distance > 150) {
        // Move faster when far away
        obj.vx = Math.cos(angle) * 6;
        obj.vy = Math.sin(angle) * 6;
      } else {
        // Pounce when close
        obj.vx = Math.cos(angle) * 10;
        obj.vy = Math.sin(angle) * 10;
      }

      // Add some randomness to make it look more natural
      obj.vx += (Math.random() - 0.5) * 0.5;
      obj.vy += (Math.random() - 0.5) * 0.5;

      DEBUG.log('Cat velocity:', { vx: obj.vx, vy: obj.vy, distance });
    } else {
      // Wander around when no target
      if (!obj.wanderAngle) obj.wanderAngle = Math.random() * Math.PI * 2;
      obj.wanderAngle += (Math.random() - 0.5) * 0.2;
      obj.vx = Math.cos(obj.wanderAngle) * 4;
      obj.vy = Math.sin(obj.wanderAngle) * 4;
    }
  },

  // Bird-like movement: smooth arcs and occasional flapping
  bird: (obj) => {
    if (!obj.lastFlap) {
      obj.lastFlap = Date.now();
      obj.flapHeight = 0;
    }

    const now = Date.now();
    const timeSinceFlap = now - obj.lastFlap;

    // Flapping behavior
    if (timeSinceFlap > 500) {
      obj.lastFlap = now;
      obj.flapHeight = 20;
    }

    // Smooth arc movement
    obj.wanderAngle = (obj.wanderAngle || 0) + 0.01;
    const baseSpeed = 3;
    obj.vx = Math.cos(obj.wanderAngle) * baseSpeed;
    obj.vy = Math.sin(obj.wanderAngle) * baseSpeed + Math.sin(timeSinceFlap / 100) * obj.flapHeight * 0.1;

    // Gradually reduce flap height
    obj.flapHeight *= 0.95;
  }
};

// Spatial partitioning grid
const SPATIAL_GRID = {
  grid: new Map(),
  lastUpdate: 0,

  // Get grid cell coordinates for an object
  getCellKey(x, y) {
    const cellX = Math.floor(x / PERFORMANCE.gridSize);
    const cellY = Math.floor(y / PERFORMANCE.gridSize);
    return `${cellX},${cellY}`;
  },

  // Get all cells that an object might occupy
  getObjectCells(obj) {
    const cells = new Set();
    const radius = obj.size / 2;

    // Get cells for object's bounding box
    const minX = Math.floor((obj.x - radius) / PERFORMANCE.gridSize);
    const maxX = Math.floor((obj.x + radius) / PERFORMANCE.gridSize);
    const minY = Math.floor((obj.y - radius) / PERFORMANCE.gridSize);
    const maxY = Math.floor((obj.y + radius) / PERFORMANCE.gridSize);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        cells.add(`${x},${y}`);
      }
    }
    return cells;
  },

  // Update grid with current object positions
  update(objects) {
    this.grid.clear();
    objects.forEach(obj => {
      const cells = this.getObjectCells(obj);
      cells.forEach(cellKey => {
        if (!this.grid.has(cellKey)) {
          this.grid.set(cellKey, new Set());
        }
        this.grid.get(cellKey).add(obj);
      });
    });
  },

  // Get potential collision candidates for an object
  getCollisionCandidates(obj) {
    const candidates = new Set();
    const cells = this.getObjectCells(obj);
    cells.forEach(cellKey => {
      const cellObjects = this.grid.get(cellKey);
      if (cellObjects) {
        cellObjects.forEach(other => {
          if (other !== obj) {
            candidates.add(other);
          }
        });
      }
    });
    return candidates;
  }
};

// Update center point
function updateCenter() {
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
}

// Create selector panel
function createSelectorPanel() {
  const panel = document.createElement('div');
  panel.className = 'selector-panel';
  panel.style.display = 'none';

  // Color selector
  const colorTitle = document.createElement('div');
  colorTitle.className = 'selector-title';
  colorTitle.textContent = 'Colors';
  panel.appendChild(colorTitle);

  const colorGrid = document.createElement('div');
  colorGrid.className = 'color-grid';

  Object.entries(COLOR_PRESETS).forEach(([name, colors]) => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = colors.background;
    swatch.title = name;
    swatch.onclick = () => {
      currentColors = colors;
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      updateColors();
    };
    colorGrid.appendChild(swatch);
  });
  panel.appendChild(colorGrid);

  // Emoji selector
  const emojiTitle = document.createElement('div');
  emojiTitle.className = 'selector-title';
  emojiTitle.textContent = 'Emojis';
  panel.appendChild(emojiTitle);

  const emojiGrid = document.createElement('div');
  emojiGrid.className = 'emoji-grid';

  EMOJIS.forEach(emoji => {
    const button = document.createElement('button');
    button.className = 'emoji-button';
    button.textContent = emoji;
    button.onclick = () => {
      selectedEmoji = emoji;
      document.querySelectorAll('.emoji-button').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      if (currentMode === 'randomEmojis') {
        // Update all existing emojis
        emojiObjs.forEach(obj => {
          obj.char = emoji;
          obj.popTime = Date.now();
          obj.scale = 1.5;
        });
      }
    };
    emojiGrid.appendChild(button);
  });
  panel.appendChild(emojiGrid);

  // Toggle button
  const toggle = document.createElement('button');
  toggle.className = 'toggle-selectors';
  toggle.textContent = '🎨';
  toggle.onclick = () => {
    showSelectors = !showSelectors;
    panel.style.display = showSelectors ? 'block' : 'none';
  };

  document.body.appendChild(panel);
  document.body.appendChild(toggle);
}

// Update colors throughout the application
function updateColors() {
  document.body.style.backgroundColor = currentColors.background;
  canvas.style.backgroundColor = currentColors.background;
  updateUIColors();
}

// Update UI colors
function updateUIColors() {
  const elements = document.querySelectorAll('.button, .points-display, .snack-menu, .snack-item, .selector-panel, .toggle-selectors');
  elements.forEach(el => {
    el.style.backgroundColor = currentColors.background;
    el.style.borderColor = currentColors.highlight;
    el.style.color = currentColors.text;
  });

  const textElements = document.querySelectorAll('.cost, .name, .selector-title');
  textElements.forEach(el => {
    el.style.color = currentColors.text;
  });

  const hoverElements = document.querySelectorAll('.button:hover, .snack-item:hover, .emoji-button:hover, .toggle-selectors:hover');
  hoverElements.forEach(el => {
    el.style.backgroundColor = currentColors.highlight;
  });
}

// Canvas initialization
function initCanvas() {
  function resizeCanvas() {
    const dpr = PERFORMANCE.renderScale;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);
    updateCenter();
    VIEWPORT.update();
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Check for low power mode
  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      battery.addEventListener('levelchange', () => {
        PERFORMANCE.isLowPowerMode = battery.level < 0.2;
      });
    });
  }
}

// Creature creation with collision-based behaviors
function createCreature(mode) {
  const char = mode === 'chasingCats' ? '🐱' : selectedEmoji;
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.max(canvas.width, canvas.height);
  const x = centerX + Math.cos(angle) * distance;
  const y = centerY + Math.sin(angle) * distance;

  return {
    char,
    x,
    y,
    vx: (centerX - x) * 0.01,
    vy: (centerY - y) * 0.1,
    size: 80 + Math.random() * 40,
    maxSize: 120,
    minSize: 40,
    state: 'entering',
    energy: 100,
    target: null,
    lastCollision: 0,
    color: currentColors.energy.high,
    scale: 1,
    popTime: 0,
    rotation: Math.random() * Math.PI * 2,
    lastClickTime: 0,
    sizeDecayRate: 0.1
  };
}

function createRandomEmoji() {
  return {
    char: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    size: 40 + Math.random() * 30,
    state: 'active',
    energy: 100,
    target: null,
    lastCollision: 0,
    color: currentColors.energy.high,
    scale: 1,
    popTime: 0,
    rotation: Math.random() * Math.PI * 2
  };
}

// Check if a point is inside an object
function isPointInObject(x, y, obj) {
  const dx = x - obj.x;
  const dy = y - obj.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < obj.size / 2;
}

// Create game UI
function createGameUI() {
  const ui = document.createElement('div');
  ui.className = 'game-ui';

  // Points display
  const pointsDisplay = document.createElement('div');
  pointsDisplay.className = 'points-display';
  pointsDisplay.innerHTML = '<span class="icon">🌟</span><span class="points">0</span>';
  ui.appendChild(pointsDisplay);

  // Shop button
  const shopButton = document.createElement('button');
  shopButton.className = 'shop-button';
  shopButton.innerHTML = '🛍️';
  shopButton.onclick = toggleShop;
  ui.appendChild(shopButton);

  document.body.appendChild(ui);
}

// Create snack menu
function createSnackMenu() {
  const menu = document.createElement('div');
  menu.className = 'snack-menu';

  SNACKS.forEach(snack => {
    const item = document.createElement('button');
    item.className = 'snack-item';
    item.innerHTML = `
            <span class="emoji">${snack.emoji}</span>
            <span class="cost">${snack.cost} pts</span>
            <span class="name">${snack.name}</span>
        `;
    item.onclick = () => purchaseSnack(snack);
    menu.appendChild(item);
  });

  document.body.appendChild(menu);
}

// Toggle shop visibility
function toggleShop() {
  const menu = document.querySelector('.snack-menu');
  const button = document.querySelector('.shop-button');

  if (menu && button) {
    showSnackMenu = !showSnackMenu;
    menu.classList.toggle('show', showSnackMenu);
    button.innerHTML = showSnackMenu ? '❌' : '🛍️';
  }
}

// Update points display
function updatePointsDisplay() {
  const display = document.querySelector('.points-display .points');
  if (display) {
    const oldPoints = parseInt(display.textContent) || 0;
    const newPoints = points || 0;

    if (oldPoints !== newPoints) {
      display.style.transform = 'scale(1.1)';
      display.style.color = newPoints > oldPoints ? '#FFD700' : '#FF4500';

      setTimeout(() => {
        display.style.transform = 'scale(1)';
        display.style.color = 'var(--text-color)';
      }, 200);
    }

    display.textContent = newPoints;
  }
}

// Show points popup
function showPointsPopup(x, y, amount) {
  if (!amount || isNaN(amount)) return;

  const popup = document.createElement('div');
  popup.className = 'points-popup';
  popup.textContent = `+${amount}`;
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 800);
}

// Handle click on objects
function handleClick(x, y) {
  const allObjects = [...creatures, ...emojiObjs];
  let clicked = false;

  allObjects.forEach(obj => {
    if (isPointInObject(x, y, obj)) {
      clicked = true;
      obj.popTime = Date.now();
      obj.scale = 1.5;
      obj.energy = Math.min(100, obj.energy + 20);
      obj.rotation += Math.PI;
      obj.lastClickTime = Date.now();
      obj.size = Math.min(obj.maxSize, obj.size + 20);

      const pointsEarned = Math.floor(obj.size / 10) || 1;
      points += pointsEarned;
      updatePointsDisplay();
      showPointsPopup(x, y, pointsEarned);

      obj.vx += (Math.random() - 0.5) * 4;
      obj.vy += (Math.random() - 0.5) * 4;
    }
  });
}

// Purchase snack
function purchaseSnack(snack) {
  if (points >= snack.cost) {
    points -= snack.cost;
    updatePointsDisplay();

    // Apply snack effect
    switch (snack.effect) {
    case 'energy':
      emojiObjs.forEach(obj => {
          obj.energy = Math.min(100, obj.energy + 30);
        obj.popTime = Date.now();
          obj.scale = 1.5;
      });
        break;
      case 'speed':
        speedMultiplier = Math.min(3, speedMultiplier + 0.5);
        break;
      case 'size':
      emojiObjs.forEach(obj => {
          obj.size *= 1.2;
          obj.popTime = Date.now();
          obj.scale = 1.5;
        });
        break;
      case 'points':
        points += 50;
        updatePointsDisplay();
        break;
    case 'invincible':
      emojiObjs.forEach(obj => {
          obj.energy = 100;
          obj.color = '#FFD700';
          setTimeout(() => {
            obj.color = currentColors.energy.high;
          }, 5000);
        });
        break;
      case 'super':
      emojiObjs.forEach(obj => {
          obj.energy = 100;
          obj.size *= 1.5;
          obj.vx *= 2;
          obj.vy *= 2;
          obj.color = '#FF4500';
          setTimeout(() => {
            obj.size /= 1.5;
            obj.vx /= 2;
            obj.vy /= 2;
            obj.color = currentColors.energy.high;
          }, 10000);
        });
        break;
    }

    toggleShop();
  }
}

// Optimized collision detection
function checkCollision(obj1, obj2) {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  const minDist = (obj1.size + obj2.size) / 2;
  return (dx * dx + dy * dy) < (minDist * minDist);
}

// Optimized collision handling
function handleCollision(obj1, obj2) {
  const dx = obj2.x - obj1.x;
  const dy = obj2.y - obj1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  // Calculate relative velocity
  const relativeVx = obj1.vx - obj2.vx;
  const relativeVy = obj1.vy - obj2.vy;
  const relativeSpeed = Math.sqrt(relativeVx * relativeVx + relativeVy * relativeVy);

  if (relativeSpeed === 0) return;

  // Calculate collision response
  const normalX = dx / distance;
  const normalY = dy / distance;
  const relativeVelocityDotNormal = relativeVx * normalX + relativeVy * normalY;

  // Only respond if objects are moving toward each other
  if (relativeVelocityDotNormal > 0) return;

  // Calculate impulse
  const restitution = 0.8; // Bounciness
  const impulse = -(1 + restitution) * relativeVelocityDotNormal;

  // Apply impulse
  const impulseX = impulse * normalX;
  const impulseY = impulse * normalY;

  obj1.vx -= impulseX;
  obj1.vy -= impulseY;
  obj2.vx += impulseX;
  obj2.vy += impulseY;

  // Add some randomness to prevent objects from getting stuck
  obj1.vx += (Math.random() - 0.5) * 0.5;
  obj1.vy += (Math.random() - 0.5) * 0.5;
  obj2.vx += (Math.random() - 0.5) * 0.5;
  obj2.vy += (Math.random() - 0.5) * 0.5;

  // Update energy and rotation
  obj1.energy -= 5;
  obj2.energy -= 5;
  obj1.rotation += Math.PI / 4;
  obj2.rotation += Math.PI / 4;
  obj1.lastCollision = Date.now();
  obj2.lastCollision = Date.now();
}

// Game state management
function initCreatures() {
  DEBUG.log('Initializing creatures for mode:', currentMode);

  // Clear existing creatures
  emojiObjs.length = 0;
  creatures.length = 0;

  try {
    // Create new creatures based on mode
    switch (currentMode) {
    case 'bouncingMice':
      DEBUG.log('Creating bouncing mice');
        for (let i = 0; i < CREATURE_COUNT.bouncingMice; i++) {
          const mouse = {
            char: '🐭',
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: 40 + Math.random() * 20,
            lastDirectionChange: 0,
            direction: Math.random() * Math.PI * 2,
          isResting: false,
            restTime: 0,
            energy: 100,
          state: 'active'
        };
          emojiObjs.push(mouse);
      }
        break;

      case 'chasingCats':
      DEBUG.log('Creating cats and mice');
        // Create cats
        for (let i = 0; i < CREATURE_COUNT.chasingCats.cats; i++) {
          const cat = {
            char: '🐱',
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: 50 + Math.random() * 20,
            target: null,
            lastTargetUpdate: 0,
            wanderAngle: Math.random() * Math.PI * 2,
            energy: 100,
          state: 'active'
          };
          creatures.push(cat);
        }
      // Create mice
        for (let i = 0; i < CREATURE_COUNT.chasingCats.mice; i++) {
        const mouse = {
            char: '🐭',
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: 30 + Math.random() * 15,
            lastDirectionChange: 0,
            direction: Math.random() * Math.PI * 2,
            isResting: false,
            restTime: 0,
          energy: 100,
          state: 'active'
          };
        emojiObjs.push(mouse);
      }
        break;

      case 'randomEmojis':
      DEBUG.log('Creating random emojis');
        for (let i = 0; i < CREATURE_COUNT.randomEmojis; i++) {
          const emoji = createRandomEmoji();
        emoji.state = 'active';
          emojiObjs.push(emoji);
      }
        break;
    }

    DEBUG.log('Creature initialization complete. Total creatures:', creatures.length + emojiObjs.length);
    );
  } catch (error) {
    DEBUG.error('Error during creature initialization:', error);
  }
}

// Update and draw
function update() {
  if (isPaused) return;

  const allObjects = [...creatures, ...emojiObjs];
  const now = Date.now();

  // Update positions
  allObjects.forEach(obj => {
    if (obj.state === 'active') {
      // Apply movement pattern
      if (obj.char === '🐭') {
        MOVEMENT_PATTERNS.mouse(obj);
      } else if (obj.char === '🐱') {
        MOVEMENT_PATTERNS.cat(obj, allObjects);
      } else {
        // Default movement for other emojis
        if (!obj.wanderAngle) obj.wanderAngle = Math.random() * Math.PI * 2;
        obj.wanderAngle += 0.02;
        obj.vx = Math.cos(obj.wanderAngle) * 4;
        obj.vy = Math.sin(obj.wanderAngle) * 4;
      }

      // Apply velocity with increased speed multiplier
      const effectiveSpeedMultiplier = speedMultiplier * 2; // Double the effective speed
      obj.x += obj.vx * effectiveSpeedMultiplier;
      obj.y += obj.vy * effectiveSpeedMultiplier;

      // Bounce off walls with energy loss
      if (obj.x < 0 || obj.x > canvas.width) {
        obj.vx *= -0.9;
        obj.energy -= 2;
        DEBUG.log('Wall collision X:', obj);
      }
      if (obj.y < 0 || obj.y > canvas.height) {
        obj.vy *= -0.9;
        obj.energy -= 2;
        DEBUG.log('Wall collision Y:', obj);
      }

      // Keep in bounds
      obj.x = Math.max(0, Math.min(obj.x, canvas.width));
      obj.y = Math.max(0, Math.min(obj.y, canvas.height));

      // Update rotation based on movement
      if (Math.abs(obj.vx) > 0.1 || Math.abs(obj.vy) > 0.1) {
        obj.rotation = Math.atan2(obj.vy, obj.vx);
      }

      // Regenerate energy slowly
      obj.energy = Math.min(100, obj.energy + 0.1);
    }
  });
}

// Check if object is in viewport
function isInViewport(obj) {
  const padding = PERFORMANCE.viewportPadding;
  return (
    obj.x + obj.size + padding > VIEWPORT.x &&
    obj.x - obj.size - padding < VIEWPORT.x + VIEWPORT.width &&
    obj.y + obj.size + padding > VIEWPORT.y &&
    obj.y - obj.size - padding < VIEWPORT.y + VIEWPORT.height
  );
}

function drawObject(obj, deltaTime) {
  // Skip rendering if object is not in viewport
  if (!isInViewport(obj)) return;

  // Draw energy bar only if object is large enough
  if (obj.size > 30) {
    const energyBarWidth = obj.size;
    const energyBarHeight = 4;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(obj.x, obj.y - 10, energyBarWidth, energyBarHeight);
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y - 10, energyBarWidth * (obj.energy / 100), energyBarHeight);
  }

  // Draw creature with scale and rotation
  ctx.save();
  ctx.translate(obj.x + obj.size / 2, obj.y);
  ctx.rotate(obj.rotation);
  ctx.scale(obj.scale, obj.scale);

  // Use a single font size for better performance
  const fontSize = Math.max(20, Math.min(60, obj.size));
  ctx.font = `${fontSize}px serif`;
  ctx.fillStyle = obj.energy < 30 ? 'rgba(210, 180, 140, 0.7)' : currentColors.text;
  ctx.textAlign = 'center';
  ctx.fillText(obj.char, 0, 0);
  ctx.restore();
}

function drawControls() {
  if (!showControls) return;

  ctx.fillStyle = 'rgba(44, 24, 16, 0.9)';
  ctx.fillRect(10, 10, 200, 120);

  ctx.font = '16px Arial';
  ctx.fillStyle = currentColors.text;
  ctx.fillText('Controls:', 20, 30);
  ctx.fillText('Space: Pause/Resume', 20, 50);
  ctx.fillText('+/-: Speed Up/Down', 20, 70);
  ctx.fillText('H: Hide Controls', 20, 90);
  ctx.fillText(`Speed: ${speedMultiplier.toFixed(1)}x`, 20, 110);
}

// Game loop
function gameLoop(currentTime) {
  try {
    // Calculate delta time
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Update game state
    if (!isPaused) {
      update();
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, currentColors.background);
    gradient.addColorStop(1, currentColors.background.replace('0.85', '0.75'));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw creatures
    const allObjects = [...creatures, ...emojiObjs];
    allObjects.forEach(obj => {
      if (obj.state === 'active') {
        drawObject(obj, deltaTime);
      }
    });

    // Draw UI
    if (showControls) {
      drawControls();
    }

    // Continue game loop
    animationFrameId = requestAnimationFrame(gameLoop);
  } catch (error) {
    DEBUG.error('Error in game loop:', error);
    // Try to recover by restarting the game loop
    animationFrameId = requestAnimationFrame(gameLoop);
  }
}

// Initialize and start
function init() {
  try {
    DEBUG.log('Initializing game...');
    initCanvas();
    createSelectorPanel();
    createGameUI();
    createSnackMenu();
    setupEventListeners();
    initCreatures();

    // Start game loop
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
    DEBUG.log('Game initialization complete');
  } catch (error) {
    DEBUG.error('Error during game initialization:', error);
  }
}

// Cleanup function
function cleanup() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
}

// Handle window unload
window.addEventListener("unload", cleanup);

// Toggle all UI elements
function toggleAllUI() {
  showControls = !showControls;

  // Toggle points display
  const pointsDisplay = document.querySelector('.points-display');
  if (pointsDisplay) {
    pointsDisplay.style.display = showControls ? 'flex' : 'none';
  }

  // Toggle shop button
  const shopButton = document.querySelector('.shop-button');
  if (shopButton) {
    shopButton.style.display = showControls ? 'flex' : 'none';
  }

  // Toggle mode buttons
  const modeButtons = document.querySelectorAll('.controls .button');
  modeButtons.forEach(button => {
    button.style.display = showControls ? 'block' : 'none';
  });

  // Toggle selector panel
  const selectorPanel = document.querySelector('.selector-panel');
  if (selectorPanel) {
    selectorPanel.style.display = 'none';
    showSelectors = false;
  }

  // Toggle selector toggle button
  const selectorToggle = document.querySelector('.toggle-selectors');
  if (selectorToggle) {
    selectorToggle.style.display = showControls ? 'flex' : 'none';
  }

  // Hide snack menu if it's open
  if (showSnackMenu) {
    toggleShop();
  }

  DEBUG.log('UI visibility toggled:', showControls);
}

// Event handlers
function setupEventListeners() {
  // Set initial mode
  currentMode = 'bouncingMice';
  const initialButton = document.getElementById('bouncingMice');
  if (initialButton) {
    initialButton.classList.add('active');
  }

  // Add click handlers for mode buttons
  const bouncingMiceBtn = document.getElementById('bouncingMice');
  const chasingCatsBtn = document.getElementById('chasingCats');
  const randomEmojisBtn = document.getElementById('randomEmojis');

  if (bouncingMiceBtn) {
    bouncingMiceBtn.onclick = () => {
      document.querySelectorAll('.button').forEach(btn => btn.classList.remove('active'));
      bouncingMiceBtn.classList.add('active');
      currentMode = 'bouncingMice';
      initCreatures();
    };
  }

  if (chasingCatsBtn) {
    chasingCatsBtn.onclick = () => {
      document.querySelectorAll('.button').forEach(btn => btn.classList.remove('active'));
      chasingCatsBtn.classList.add('active');
      currentMode = 'chasingCats';
      initCreatures();
    };
  }

  if (randomEmojisBtn) {
    randomEmojisBtn.onclick = () => {
      document.querySelectorAll('.button').forEach(btn => btn.classList.remove('active'));
      randomEmojisBtn.classList.add('active');
      currentMode = 'randomEmojis';
      initCreatures();
    };
  }

  // Mouse click handler
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleClick(x, y);
  });

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'Space':
        isPaused = !isPaused;
      DEBUG.log('Game paused:', isPaused);
        break;
      case 'Equal':
    case 'NumpadAdd':
        speedMultiplier = Math.min(3, speedMultiplier + 0.1);
      DEBUG.log('Speed increased:', speedMultiplier);
        break;
      case 'Minus':
      case 'NumpadSubtract':
        speedMultiplier = Math.max(0.1, speedMultiplier - 0.1);
      DEBUG.log('Speed decreased:', speedMultiplier);
        break;
      case 'KeyH':
        toggleAllUI();
      break;
      case 'KeyM':
        toggleShop();
        break;
    }
  });

  // Fullscreen
  document.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    }
  });
}

// Start the game
init();
