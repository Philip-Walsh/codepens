// DOM Elements
const svg = document.getElementById('squiggle-svg');
const themeToggle = document.getElementById('theme-toggle');
const addPathBtn = document.getElementById('add-path');
const resetBtn = document.getElementById('reset');
const scrollProgress = document.querySelector('.scroll-progress');

// Control Elements
const complexityInput = document.getElementById('complexity');
const smoothnessInput = document.getElementById('smoothness');
const speedInput = document.getElementById('speed');
const strokeWidthInput = document.getElementById('stroke-width');
const startColorInput = document.getElementById('start-color');
const endColorInput = document.getElementById('end-color');

// SVG Elements
const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
svg.appendChild(defs);

// Create gradient
const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
gradient.setAttribute('id', 'squiggle-gradient');
gradient.setAttribute('x1', '0%');
gradient.setAttribute('y1', '0%');
gradient.setAttribute('x2', '100%');
gradient.setAttribute('y2', '0%');
defs.appendChild(gradient);

// Create glow filter
const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
filter.setAttribute('id', 'glow');
filter.setAttribute('x', '-50%');
filter.setAttribute('y', '-50%');
filter.setAttribute('width', '200%');
filter.setAttribute('height', '200%');
defs.appendChild(filter);

const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
feGaussianBlur.setAttribute('stdDeviation', '2');
feGaussianBlur.setAttribute('result', 'coloredBlur');
filter.appendChild(feGaussianBlur);

const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
filter.appendChild(feMerge);

const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
feMergeNode1.setAttribute('in', 'coloredBlur');
feMerge.appendChild(feMergeNode1);

const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
feMergeNode2.setAttribute('in', 'SourceGraphic');
feMerge.appendChild(feMergeNode2);

class SquigglePath {
  constructor() {
    this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.path.classList.add('squiggle-path');
    svg.appendChild(this.path);

    this.complexity = parseInt(complexityInput.value);
    this.smoothness = parseInt(smoothnessInput.value);
    this.speed = parseInt(speedInput.value);
    this.strokeWidth = parseInt(strokeWidthInput.value);

    this.updatePath();
    this.animate();
  }

  generatePoints() {
    const points = [];
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const segments = Math.floor(width / this.smoothness);

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const y = height / 2 + Math.sin(i * this.complexity) * (height / 4);
      points.push([x, y]);
    }

    return points;
  }

  generatePath(points) {
    let pathData = `M ${points[0][0]},${points[0][1]}`;

    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i];
      const [prevX, prevY] = points[i - 1];
      const cp1x = (prevX + x) / 2;
      const cp1y = prevY;
      const cp2x = (prevX + x) / 2;
      const cp2y = y;

      pathData += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`;
    }

    return pathData;
  }

  updatePath() {
    const points = this.generatePoints();
    const pathData = this.generatePath(points);
    this.path.setAttribute('d', pathData);
    this.path.setAttribute('stroke-width', this.strokeWidth);
  }

  animate() {
    const duration = 10000 / this.speed;
    this.path.style.animationDuration = `${duration}ms`;
  }

  updateProperties() {
    this.complexity = parseInt(complexityInput.value);
    this.smoothness = parseInt(smoothnessInput.value);
    this.speed = parseInt(speedInput.value);
    this.strokeWidth = parseInt(strokeWidthInput.value);

    this.updatePath();
    this.animate();
  }
}

// State
let paths = [];
let isDarkTheme = false;

// Functions
function updateGradient() {
  const startColor = startColorInput.value;
  const endColor = endColorInput.value;

  const startStop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  startStop.setAttribute('offset', '0%');
  startStop.setAttribute('stop-color', startColor);

  const endStop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  endStop.setAttribute('offset', '100%');
  endStop.setAttribute('stop-color', endColor);

  gradient.innerHTML = '';
  gradient.appendChild(startStop);
  gradient.appendChild(endStop);
}

function addPath() {
  const path = new SquigglePath();
  paths.push(path);
}

function resetPaths() {
  paths.forEach(path => path.path.remove());
  paths = [];
}

function updateAllPaths() {
  paths.forEach(path => path.updateProperties());
}

function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  document.body.classList.toggle('dark-theme');
  themeToggle.innerHTML = isDarkTheme ? '☀️' : '🌙';
}

function updateScrollProgress() {
  const scrollPercent =
    (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  scrollProgress.style.transform = `scaleX(${scrollPercent / 100})`;
}

// Event Listeners
complexityInput.addEventListener('input', () => {
  complexityInput.nextElementSibling.textContent = complexityInput.value;
  updateAllPaths();
});

smoothnessInput.addEventListener('input', () => {
  smoothnessInput.nextElementSibling.textContent = smoothnessInput.value;
  updateAllPaths();
});

speedInput.addEventListener('input', () => {
  speedInput.nextElementSibling.textContent = speedInput.value;
  updateAllPaths();
});

strokeWidthInput.addEventListener('input', () => {
  strokeWidthInput.nextElementSibling.textContent = strokeWidthInput.value;
  updateAllPaths();
});

startColorInput.addEventListener('input', updateGradient);
endColorInput.addEventListener('input', updateGradient);

addPathBtn.addEventListener('click', addPath);
resetBtn.addEventListener('click', resetPaths);
themeToggle.addEventListener('click', toggleTheme);

window.addEventListener('scroll', updateScrollProgress);
window.addEventListener('resize', updateAllPaths);

// Initialize
updateGradient();
addPath();
addPath();
addPath();
