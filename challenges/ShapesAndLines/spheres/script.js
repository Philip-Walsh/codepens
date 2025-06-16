const sphere = document.querySelector('.sphere');
const spaceLayer = document.querySelector('.space');
const face = document.querySelector('.face');

// Set initial face
face.textContent = "ʘ╭╮ʘ";

// Add layers to sphere
const layers = 35;
const radius = 90;

for (let i = 0; i < layers; i++) {
  const layer = document.createElement('div');
  layer.className = 'circle';

  const normalized = (i / (layers - 1)) * 2 - 1;
  const size = Math.sqrt(1 - normalized ** 2) * 100;
  const depth = normalized * radius;

  layer.style.width = `${size}%`;
  layer.style.height = `${size}%`;
  layer.style.transform = `rotateX(20deg) rotateZ(-25deg) translateZ(${depth}px)`;

  sphere.appendChild(layer);
}

// Add radial gradient background to space layer
spaceLayer.style.background = `
  radial-gradient(circle at center,
    rgba(68, 68, 68, 0.8) 0%,
    rgba(68, 68, 68, 0.4) 30%,
    rgba(68, 68, 68, 0.2) 60%,
    rgba(68, 68, 68, 0) 100%
  ),
  repeating-radial-gradient(circle,
    #444 0px,
    #444 1px,
    transparent 1px,
    transparent 60px
  )
`;

// Face animation
class FaceAnimator {
  constructor() {
    this.face = face;
    this.leftEye = face.querySelector('.left-eye');
    this.rightEye = face.querySelector('.right-eye');
    this.mouth = face.querySelector('.mouth');
    this.isBlinking = false;
    this.mouths = ['╭╮', '╭‿╮', '╭︿╮', '╭ω╮'];
    this.currentMouthIndex = 0;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Blink every 2-4 seconds
    setInterval(() => this.blink(), Math.random() * 2000 + 2000);
    // Change mouth every 3-5 seconds
    setInterval(() => this.changeMouth(), Math.random() * 2000 + 3000);
  }

  blink() {
    if (this.isBlinking) return;
    this.isBlinking = true;
    this.leftEye.textContent = '−';
    this.rightEye.textContent = '−';
    setTimeout(() => {
      this.leftEye.textContent = 'ʘ';
      this.rightEye.textContent = 'ʘ';
      this.isBlinking = false;
    }, 150);
  }

  changeMouth() {
    this.currentMouthIndex = (this.currentMouthIndex + 1) % this.mouths.length;
    this.mouth.textContent = this.mouths[this.currentMouthIndex];
  }
}

// Initialize face animator
new FaceAnimator();
