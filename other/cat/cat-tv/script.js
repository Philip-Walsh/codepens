// Canvas setup
const canvas = document.getElementById("catCanvas");
const ctx = canvas.getContext("2d");

// Constants
const EMOJIS = ["🐭", "🐱", "🐦", "🐰", "🦄", "🦋", "🐢", "🦊", "🐼", "🦁", "🐯", "🐨", "🦒", "🦘", "🦥", "🦦"];
const CREATURE_COUNT = {
  bouncingMice: 20,
  chasingCats: { cats: 10, mice: 15 },
  randomEmojis: 20
};

// State
let currentMode = "bouncingMice";
const creatures = [];
const emojiObjs = [];
let isPaused = false;
let speedMultiplier = 1;

// Movement patterns
const MOVEMENT_PATTERNS = {
  mouse: (obj) => {
    if (!obj.lastDirectionChange) {
      obj.lastDirectionChange = Date.now();
      obj.direction = Math.random() * Math.PI * 2;
    }

    const now = Date.now();
    if (now - obj.lastDirectionChange > 300) {
      obj.lastDirectionChange = now;
      obj.direction = Math.random() * Math.PI * 2;
    }

    obj.vx = Math.cos(obj.direction) * 3;
    obj.vy = Math.sin(obj.direction) * 3;
  },

  cat: (obj, allObjects) => {
    if (!obj.target || Date.now() - obj.lastTargetUpdate > 2000) {
      const potentialTargets = allObjects.filter(o => o !== obj && o.char === "🐭");
      if (potentialTargets.length > 0) {
        obj.target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
        obj.lastTargetUpdate = Date.now();
      }
    }

    if (obj.target) {
      const dx = obj.target.x - obj.x;
      const dy = obj.target.y - obj.y;
      const angle = Math.atan2(dy, dx);
      obj.vx = Math.cos(angle) * 2;
      obj.vy = Math.sin(angle) * 2;
    }
  }
};

// Initialize creatures
function initCreatures() {
  creatures.length = 0;
  emojiObjs.length = 0;

  switch (currentMode) {
    case "bouncingMice":
      for (let i = 0; i < CREATURE_COUNT.bouncingMice; i++) {
        const mouse = {
          char: "🐭",
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          size: 40 + Math.random() * 20,
          lastDirectionChange: 0,
          direction: Math.random() * Math.PI * 2
        };
        emojiObjs.push(mouse);
      }
      break;

    case "chasingCats":
      // Create cats
      for (let i = 0; i < CREATURE_COUNT.chasingCats.cats; i++) {
        const cat = {
          char: "🐱",
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          size: 50 + Math.random() * 20,
          target: null,
          lastTargetUpdate: 0
        };
        creatures.push(cat);
      }
      // Create mice
      for (let i = 0; i < CREATURE_COUNT.chasingCats.mice; i++) {
        const mouse = {
          char: "🐭",
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          size: 30 + Math.random() * 15,
          lastDirectionChange: 0,
          direction: Math.random() * Math.PI * 2
        };
        emojiObjs.push(mouse);
      }
      break;

    case "randomEmojis":
      for (let i = 0; i < CREATURE_COUNT.randomEmojis; i++) {
        const emoji = {
          char: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: 40 + Math.random() * 20
        };
        emojiObjs.push(emoji);
      }
      break;
  }
}

// Update and draw
function update() {
  if (isPaused) return;

  const allObjects = [...creatures, ...emojiObjs];

  // Update positions
  allObjects.forEach(obj => {
    if (obj.char === "🐭") {
      MOVEMENT_PATTERNS.mouse(obj);
    } else if (obj.char === "🐱") {
      MOVEMENT_PATTERNS.cat(obj, allObjects);
    }

    obj.x += obj.vx * speedMultiplier;
    obj.y += obj.vy * speedMultiplier;

    // Bounce off walls
    if (obj.x < 0 || obj.x > canvas.width) obj.vx *= -1;
    if (obj.y < 0 || obj.y > canvas.height) obj.vy *= -1;

    // Keep in bounds
    obj.x = Math.max(0, Math.min(obj.x, canvas.width));
    obj.y = Math.max(0, Math.min(obj.y, canvas.height));
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const allObjects = [...creatures, ...emojiObjs];
  allObjects.forEach(obj => {
    ctx.font = `${obj.size}px serif`;
    ctx.fillText(obj.char, obj.x, obj.y);
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Event listeners
function setupEventListeners() {
  // Set initial mode
  currentMode = "bouncingMice";
  document.getElementById("bouncingMice").classList.add('active');

  // Mode buttons
  document.getElementById("bouncingMice").addEventListener("click", () => {
    document.querySelectorAll('.button').forEach(btn => btn.classList.remove('active'));
    document.getElementById("bouncingMice").classList.add('active');
    currentMode = "bouncingMice";
    initCreatures();
  });

  document.getElementById("chasingCats").addEventListener("click", () => {
    document.querySelectorAll('.button').forEach(btn => btn.classList.remove('active'));
    document.getElementById("chasingCats").classList.add('active');
    currentMode = "chasingCats";
    initCreatures();
  });

  document.getElementById("randomEmojis").addEventListener("click", () => {
    document.querySelectorAll('.button').forEach(btn => btn.classList.remove('active'));
    document.getElementById("randomEmojis").classList.add('active');
    currentMode = "randomEmojis";
    initCreatures();
  });

  // Keyboard controls
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      isPaused = !isPaused;
    }
  });
}

// Initialize
function init() {
  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  setupEventListeners();
  initCreatures();
  gameLoop();
}

init();