// DOM Elements
const canvas = document.getElementById('squiggle-canvas');
const ctx = canvas.getContext('2d');
const themeToggle = document.querySelector('.theme-toggle');
const addSquigglesBtn = document.getElementById('add-squiggles');
const resetBtn = document.getElementById('reset');
const scrollProgress = document.querySelector('.scroll-progress');

// Controls
const amplitudeInput = document.getElementById('amplitude');
const frequencyInput = document.getElementById('frequency');
const speedInput = document.getElementById('speed');
const thicknessInput = document.getElementById('thickness');
const primaryColorInput = document.getElementById('primary-color');
const secondaryColorInput = document.getElementById('secondary-color');

// State
let squiggles = [];
let animationFrame;
let isDarkTheme = false;

// Squiggle Class
class Squiggle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.points = [];
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 2 + 1;
    this.amplitude = parseFloat(amplitudeInput.value);
    this.frequency = parseFloat(frequencyInput.value);
    this.thickness = parseFloat(thicknessInput.value);
    this.color = primaryColorInput.value;
    this.offset = Math.random() * 1000;
    this.generatePoints();
  }

  generatePoints() {
    this.points = [];
    for (let i = 0; i < 100; i++) {
      const t = i / 10;
      const x = this.x + t * Math.cos(this.angle);
      const y =
        this.y +
        t * Math.sin(this.angle) +
        Math.sin(t * this.frequency + this.offset) * this.amplitude;
      this.points.push({ x, y });
    }
  }

  update() {
    this.offset += parseFloat(speedInput.value) * 0.1;
    this.generatePoints();
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);

    for (let i = 1; i < this.points.length; i++) {
      const xc = (this.points[i].x + this.points[i - 1].x) / 2;
      const yc = (this.points[i].y + this.points[i - 1].y) / 2;
      ctx.quadraticCurveTo(this.points[i - 1].x, this.points[i - 1].y, xc, yc);
    }

    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}

// Canvas Setup
function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.scale(dpr, dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
}

// Animation Loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  squiggles.forEach(squiggle => {
    squiggle.update();
    squiggle.draw();
  });

  animationFrame = requestAnimationFrame(animate);
}

// Event Handlers
function handleResize() {
  setupCanvas();
}

function handleThemeToggle() {
  isDarkTheme = !isDarkTheme;
  document.body.classList.toggle('dark-theme');
  themeToggle.innerHTML = isDarkTheme
    ? '<i class="ri-moon-line"></i>'
    : '<i class="ri-sun-line"></i>';
}

function handleAddSquiggles() {
  const numSquiggles = 5;
  for (let i = 0; i < numSquiggles; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    squiggles.push(new Squiggle(x, y));
  }
}

function handleReset() {
  squiggles = [];
}

function handleScroll() {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  scrollProgress.style.transform = `scaleX(${scrolled / 100})`;
}

// Control Updates
function updateSquiggleProperties() {
  squiggles.forEach(squiggle => {
    squiggle.amplitude = parseFloat(amplitudeInput.value);
    squiggle.frequency = parseFloat(frequencyInput.value);
    squiggle.thickness = parseFloat(thicknessInput.value);
  });
}

function updateColors() {
  squiggles.forEach((squiggle, index) => {
    squiggle.color = index % 2 === 0 ? primaryColorInput.value : secondaryColorInput.value;
  });
}

// Event Listeners
window.addEventListener('resize', handleResize);
themeToggle.addEventListener('click', handleThemeToggle);
addSquigglesBtn.addEventListener('click', handleAddSquiggles);
resetBtn.addEventListener('click', handleReset);
window.addEventListener('scroll', handleScroll);

// Control Input Listeners
amplitudeInput.addEventListener('input', updateSquiggleProperties);
frequencyInput.addEventListener('input', updateSquiggleProperties);
thicknessInput.addEventListener('input', updateSquiggleProperties);
primaryColorInput.addEventListener('input', updateColors);
secondaryColorInput.addEventListener('input', updateColors);

// Initialize
setupCanvas();
animate();

// Add initial squiggles
handleAddSquiggles();
