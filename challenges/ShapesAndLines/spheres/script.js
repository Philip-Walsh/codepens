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

function addLayersToSphere(container, layerCount = 35, radius = 90) {
  for (let i = 0; i < layerCount; i++) {
    const layer = document.createElement('div');
    const normalized = (i / (layerCount - 1)) * 2 - 1;
    const size = Math.sqrt(1 - normalized ** 2) * 100;
    const depth = normalized * radius;

    layer.className = 'circle';
    layer.style.width = `${size}%`;
    layer.style.height = `${size}%`;
    layer.style.transform = `rotateX(20deg) rotateZ(-25deg) translateZ(${depth}px)`;

    container.appendChild(layer);
  }
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
  const sphere = getElem('.sphere');
  faceElement = {
    eyeLeft: getElem('.eye-left'),
    eyeRight: getElem('.eye-right'),
    mouth: getElem('.mouth'),
  };
  if (faceElement) updateFace();
  if (sphere) addLayersToSphere(sphere);

  new FaceAnimator();
}

document.addEventListener('DOMContentLoaded', init);
