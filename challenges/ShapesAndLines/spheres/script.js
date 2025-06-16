document.addEventListener('DOMContentLoaded', () => {
  const sphere = document.querySelector('.sphere');
  const spaceLayer = document.querySelector('.space');
  const leftEye = document.querySelector('.left-eye');
  const rightEye = document.querySelector('.right-eye');
  const mouth = document.querySelector('.mouth');

  // Set initial face
  leftEye.textContent = "ʘ";
  rightEye.textContent = "ʘ";
  mouth.textContent = "╭╮";

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

  // Planet configurations
  const planets = [
    {
      distance: 250,
      size: 40,
      layers: 35,
      color: 'rgba(169, 169, 169, 0.8)',
      rotationSpeed: 100
    },
    {
      distance: 350,
      size: 35,
      layers: 35,
      color: 'rgba(255, 165, 0, 0.8)',
      rotationSpeed: 80
    },
    {
      distance: 450,
      size: 30,
      layers: 35,
      color: 'rgba(0, 191, 255, 0.8)',
      rotationSpeed: 60
    }
  ];

  // Create planets
  const createPlanet = (config) => {
    const planet = document.createElement('div');
    planet.className = 'planet-sphere';

    // Set planet properties
    planet.style.setProperty('--planet-distance', `${config.distance}px`);
    planet.style.setProperty('--planet-size', `${config.size}px`);
    planet.style.setProperty('--planet-color', config.color);
    planet.style.animation = `counter-rotate ${config.rotationSpeed}s linear infinite`;

    // Add planet layers
    const planetRadius = config.size / 2;
    for (let j = 0; j < config.layers; j++) {
      const planetLayer = document.createElement('div');
      planetLayer.className = 'planet-layer';
      const normalized = (j / (config.layers - 1)) * 2 - 1;
      const size = Math.sqrt(1 - normalized ** 2) * 100;
      const depth = normalized * planetRadius;

      planetLayer.style.width = `${size}%`;
      planetLayer.style.height = `${size}%`;
      planetLayer.style.setProperty('--layer-depth', `${depth}px`);
      planet.appendChild(planetLayer);
    }

    return planet;
  };

  // Create and add planets
  planets.forEach(config => {
    const planet = createPlanet(config);
    spaceLayer.appendChild(planet);
  });

  // Add gradient to space plane
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

  // Face Animator
  class FaceAnimator {
    constructor() {
      this.events = {};
      this.eyeOptions = ['°', ' ͡°', 'ʘ', '≖', '✖', 'ǒ', '●', '◕', '◔', 'ಠ', '✷', '•ิ', '•'];
      this.mouthOptions = ['‿', '╭╮', 'ɷ', '•'];
      this.currentLeftEye = 'ʘ';
      this.currentRightEye = 'ʘ';
      this.currentMouth = '╭╮';
      this.init();
    }

    init() {
      this.startBlinking();
      this.startMouthChanges();
      this.startEyeChanges();
    }

    on(event, callback) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
    }

    emit(event, data) {
      if (this.events[event]) {
        this.events[event].forEach(callback => callback(data));
      }
    }

    updateFace() {
      leftEye.textContent = this.currentLeftEye;
      rightEye.textContent = this.currentRightEye;
      mouth.textContent = this.currentMouth;
    }

    startBlinking() {
      setInterval(() => {
        this.emit('blink');
      }, 3000);
    }

    startMouthChanges() {
      setInterval(() => {
        this.emit('mouthChange');
      }, 2000);
    }

    startEyeChanges() {
      setInterval(() => {
        if (Math.random() < 0.01) {
          this.currentLeftEye = this.eyeOptions[Math.floor(Math.random() * this.eyeOptions.length)];
          this.currentRightEye = this.currentLeftEye;
          this.updateFace();
        }
      }, 1000);
    }
  }

  // Initialize FaceAnimator
  const faceAnimator = new FaceAnimator();
  faceAnimator.on('blink', () => {
    leftEye.textContent = "-";
    rightEye.textContent = "-";
    setTimeout(() => {
      leftEye.textContent = faceAnimator.currentLeftEye;
      rightEye.textContent = faceAnimator.currentRightEye;
    }, 200);
  });
  faceAnimator.on('mouthChange', () => {
    faceAnimator.currentMouth = faceAnimator.mouthOptions[Math.floor(Math.random() * faceAnimator.mouthOptions.length)];
    mouth.textContent = faceAnimator.currentMouth;
  });
});
