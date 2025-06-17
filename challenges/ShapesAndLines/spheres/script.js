let _mouth = '‿';
let _eye = 'ಠ'; //≖
let _eyeShut = '─';
let _blinkTime = 65;
let _blinkFreq = 1000;
let faceElement;
const getElem = elem => document.querySelector(elem);

function updateFace(mouth = _mouth, eye = _eye) {
  faceElement.eyeLeft.textContent = eye;
  faceElement.eyeRight.textContent = eye;
  faceElement.mouth.textContent = mouth;
}

function createSun(container, options = {}) {
  const {
    layerCount = 35,
    radius = 90,
    coreColor = 'rgba(255, 140, 0, 0.3)',
    glowColor = 'rgba(255, 69, 0, 0.2)'
  } = options;

  const sun = document.createElement('div');
  sun.className = 'sphere';

  for (let i = 0; i < layerCount; i++) {
    const layer = document.createElement('div');
    const normalized = (i / (layerCount - 1)) * 2 - 1;
    const size = Math.sqrt(1 - normalized ** 2) * 100;
    const depth = normalized * radius;

    layer.className = 'circle';
    layer.style.width = `${size}%`;
    layer.style.height = `${size}%`;
    layer.style.transform = `rotateX(20deg) rotateZ(-25deg) translateZ(${depth}px)`;
    layer.style.setProperty('--core-color', coreColor);
    layer.style.setProperty('--glow-mid', glowColor);

    sun.appendChild(layer);
  }

  container.appendChild(sun);
  return sun;
}

function createPlanet(container, options = {}) {
  const {
    layerCount = 25,
    radius = 30,
    distance = 250,
    color = 'rgba(169, 169, 169, 0.8)',
    className = 'planet',
    size = 30
  } = options;

  const planet = document.createElement('div');
  planet.className = className;
  planet.style.width = `${size}px`;
  planet.style.height = `${size}px`;
  planet.style.setProperty('--distance', `${distance}px`);
  planet.style.setProperty('--planet-color', color);

  for (let i = 0; i < layerCount; i++) {
    const layer = document.createElement('div');
    const normalized = (i / (layerCount - 1)) * 2 - 1;
    const size = Math.sqrt(1 - normalized ** 2) * 100;
    const depth = normalized * radius;

    layer.className = 'circle';
    layer.style.width = `${size}%`;
    layer.style.height = `${size}%`;
    layer.style.transform = `translate(-50%, -50%) rotateX(90deg) rotateZ(0deg) translateZ(${depth}px)`;
    layer.style.background = color;

    planet.appendChild(layer);
  }

  container.appendChild(planet);
  return planet;
}

class FaceAnimator {
  constructor() {
    this.mouthStates = ['•', '‿', '‿', '‿'];
    this.currentMouthIndex = 0;
    this.isBlinking = false;
    this.init();
  }

  init() {
    updateFace();
    this.startBlinking();
    this.startMouthAnimation();
  }

  async blink() {
    if (this.isBlinking) return;
    this.isBlinking = true;

    updateFace(_mouth, _eyeShut);
    await new Promise(r => setTimeout(r, _blinkTime));

    updateFace(_mouth, _eye);
    this.isBlinking = false;
  }

  startBlinking() {
    setInterval(() => {
      if (Math.random() < 0.3) this.blink();
    }, _blinkFreq);
  }

  startMouthAnimation() {
    setInterval(() => {
      _mouth =
        this.mouthStates[
        (this.currentMouthIndex + 1) % this.mouthStates.length
        ];
      updateFace();
    }, 3000);
  }
}

function init() {
  const container = getElem('.sphere');
  faceElement = {
    eyeLeft: getElem('.eye-left'),
    eyeRight: getElem('.eye-right'),
    mouth: getElem('.mouth'),
  };
  if (faceElement) updateFace();
  if (container) {
    // Create sun
    createSun(container, {
      layerCount: 35,
      radius: 90,
      coreColor: 'rgba(255, 140, 0, 0.3)',
      glowColor: 'rgba(255, 69, 0, 0.2)'
    });

    // Create planets
    createPlanet(container, {
      layerCount: 25,
      radius: 30,
      distance: 200,
      color: 'rgba(231, 76, 60, 0.8)', // Mars-like
      className: 'planet mars',
      size: 30
    });

    createPlanet(container, {
      layerCount: 25,
      radius: 35,
      distance: 300,
      color: 'rgba(52, 152, 219, 0.8)', // Earth-like
      className: 'planet earth',
      size: 35
    });

    createPlanet(container, {
      layerCount: 25,
      radius: 25,
      distance: 250,
      color: 'rgba(230, 126, 34, 0.8)', // Mercury-like
      className: 'planet mercury',
      size: 25
    });
  }

  new FaceAnimator();
}

document.addEventListener('DOMContentLoaded', init);
