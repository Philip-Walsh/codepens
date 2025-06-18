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
    glowColor = 'rgba(255, 69, 0, 0.2)',
  } = options;

  const sun = document.createElement('div');
  sun.className = 'sphere';
  
  // Use document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  // Optimize layer count based on device performance
  const optimizedLayerCount = Math.min(layerCount, MAX_LAYERS);

  for (let i = 0; i < optimizedLayerCount; i++) {
    const layer = document.createElement('div');
    const normalized = (i / (optimizedLayerCount - 1)) * 2 - 1;
    const size = Math.sqrt(1 - normalized ** 2) * 100;
    const depth = normalized * radius;

    layer.className = 'circle';
    // Use cssText for better performance
    layer.style.cssText = `width:${size}%;height:${size}%;transform:rotateX(20deg) rotateZ(-25deg) translateZ(${depth}px);`;
    layer.style.setProperty('--core-color', coreColor);
    layer.style.setProperty('--glow-mid', glowColor);

    fragment.appendChild(layer);
  }

  sun.appendChild(fragment);
  container.appendChild(sun);
  return sun;
}

function createPlanetFace(planet, name) {
  const face = document.createElement('div');
  face.className = 'planet-face';

  const eyeLeft = document.createElement('span');
  eyeLeft.className = 'eye-left';

  const eyeRight = document.createElement('span');
  eyeRight.className = 'eye-right';

  const mouth = document.createElement('span');
  mouth.className = 'mouth';

  // Different faces for different planets - bigger, more distinct characters
  const faces = {
    mercury: { eye: '●', mouth: '◡' },
    venus: { eye: '◕', mouth: '⌒' },
    earth: { eye: 'ಠ', mouth: '‿' },
    mars: { eye: '◉', mouth: '◠' },
    jupiter: { eye: '◎', mouth: '⌣' },
    saturn: { eye: '◔', mouth: '▽' },
    uranus: { eye: '◑', mouth: '⌓' },
    neptune: { eye: '◐', mouth: '⌢' },
  };

  const planetFace = faces[name] || faces.earth;

  eyeLeft.textContent = planetFace.eye;
  eyeRight.textContent = planetFace.eye;
  mouth.textContent = planetFace.mouth;

  face.appendChild(eyeLeft);
  face.appendChild(eyeRight);
  face.appendChild(mouth);
  planet.appendChild(face);

  return face;
}

function createPlanet(container, options = {}) {
  const {
    layerCount = 5,
    radius = 30,
    distance = 250,
    color = 'rgba(169, 169, 169, 0.8)',
    className = 'planet',
    size = 30,
    orbitSpeed = 1,
    name = '',
  } = options;

  const planet = document.createElement('div');
  planet.className = className;
  planet.style.width = `${size}px`;
  planet.style.height = `${size}px`;
  planet.style.setProperty('--planet-color', color);
  planet.dataset.layerCount = layerCount;
  planet.dataset.radius = radius;
  planet.dataset.baseColor = color;

  // Create orbit container
  const orbit = document.createElement('div');
  orbit.className = 'orbit';
  orbit.style.width = `${distance * 2}px`;
  orbit.style.height = `${distance * 2}px`;
  container.appendChild(orbit);
  orbit.appendChild(planet);

  // Set initial position
  const angle = Math.random() * Math.PI * 2;
  updatePlanetPosition(planet, angle, distance);

  // Start orbit animation
  animatePlanet(planet, angle, distance, orbitSpeed, name);

  // Create planet layers
  updatePlanetLayers(planet, layerCount, radius, color);

  // Add face to planet
  // createPlanetFace(planet, name);

  return planet;
}

function updatePlanetPosition(planet, angle, distance) {
  // Apply distance factor to the orbit
  const adjustedDistance = distance * distanceFactor;
  const x = Math.cos(angle) * adjustedDistance;
  const y = Math.sin(angle) * adjustedDistance;

  // Calculate scale based on y position (closer to viewer = larger)
  // Map y from [-distance, distance] to [0.8, 1.2] for subtle scaling
  const normalizedY = y / adjustedDistance; // -1 to 1
  const scale = (1 + normalizedY * 0.2) * globalScaleFactor; // Apply global scale factor

  // Apply position while preserving planet's own rotation animation
  planet.style.transform = `translate(-50%, -50%) translateX(${x}px) translateY(${y}px) scale(${scale})`;

  // Make face billboard toward viewer
  const face = planet.querySelector('.planet-face');
  if (face) {
    // Calculate angle to face viewer
    const billboardAngle = Math.atan2(y, x) * (180 / Math.PI);
    face.style.transform = `rotate(${-billboardAngle}deg)`;
  }
}

// Global variables for planet control
let globalScaleFactor = 1.0;
let layerSpacingFactor = 1.0;
let distanceFactor = 1.0;
let animationSpeedFactor = 1.0;

// Planet-specific tilts and features
const planetFeatures = {
  mercury: {
    tilt: 0.03,
    rotationSpeed: 0.5,
    gradient:
      'radial-gradient(circle at 30% 30%, rgba(200, 200, 200, 0.8), rgba(160, 160, 160, 0.8))',
  },
  venus: {
    tilt: 177.3,
    rotationSpeed: -0.2,
    gradient:
      'radial-gradient(circle at 40% 40%, rgba(250, 220, 170, 0.8), rgba(230, 190, 138, 0.8))',
  },
  earth: {
    tilt: 23.4,
    rotationSpeed: 1,
    gradient:
      'radial-gradient(circle at 30% 30%, rgba(70, 180, 240, 0.8), rgba(52, 152, 219, 0.8))',
    features: [
      { color: 'rgba(40, 180, 40, 0.6)', x: '30%', y: '40%', size: '40%' },
      { color: 'rgba(40, 180, 40, 0.6)', x: '60%', y: '60%', size: '30%' },
      { color: 'rgba(240, 240, 240, 0.7)', x: '20%', y: '20%', size: '15%' },
    ],
  },
  mars: {
    tilt: 25.2,
    rotationSpeed: 0.9,
    gradient:
      'radial-gradient(circle at 35% 35%, rgba(250, 100, 80, 0.8), rgba(231, 76, 60, 0.8))',
    features: [
      { color: 'rgba(180, 80, 30, 0.6)', x: '35%', y: '45%', size: '25%' },
    ],
  },
  jupiter: {
    tilt: 3.1,
    rotationSpeed: 2.4,
    gradient:
      'radial-gradient(circle at 40% 40%, rgba(255, 180, 100, 0.8), rgba(243, 156, 18, 0.8))',
    features: [
      {
        color: 'rgba(200, 120, 40, 0.5)',
        x: '30%',
        y: '30%',
        size: '60%',
        shape: 'ellipse',
      },
      {
        color: 'rgba(220, 160, 80, 0.5)',
        x: '50%',
        y: '60%',
        size: '50%',
        shape: 'ellipse',
      },
    ],
  },
  saturn: {
    tilt: 26.7,
    rotationSpeed: 2.2,
    gradient:
      'radial-gradient(circle at 35% 35%, rgba(255, 220, 100, 0.8), rgba(241, 196, 15, 0.8))',
  },
  uranus: {
    tilt: 97.8,
    rotationSpeed: -0.7,
    gradient:
      'radial-gradient(circle at 40% 40%, rgba(100, 240, 240, 0.8), rgba(52, 231, 228, 0.8))',
  },
  neptune: {
    tilt: 28.3,
    rotationSpeed: 0.7,
    gradient:
      'radial-gradient(circle at 35% 35%, rgba(70, 150, 230, 0.8), rgba(41, 128, 185, 0.8))',
  },
};

// Function to update planet layers based on current factors
function updatePlanetLayers(planet, layerCount, radius, color) {
  // Clear planet content
  planet.innerHTML = '';

  // Apply spacing factor to radius
  const adjustedRadius = radius * layerSpacingFactor;

  // Get planet name from class
  const planetName = planet.className.split(' ')[1]; // Get second class which is the planet name
  const features = planetFeatures[planetName] || {};
  const tilt = features.tilt || 0;
  const rotationSpeed = features.rotationSpeed || 1;
  const gradient = features.gradient || null;

  // Set planet rotation - use a separate wrapper to avoid interfering with orbit
  const rotationWrapper = document.createElement('div');
  rotationWrapper.className = 'planet-rotation';
  // Use cssText for better performance
  rotationWrapper.style.cssText = `width:100%;height:100%;position:absolute;transform-style:preserve-3d;animation:rotate-planet ${30 / Math.abs(rotationSpeed)}s linear infinite ${rotationSpeed < 0 ? 'reverse' : ''};`;
  
  // Use document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  // Optimize layer count based on planet size
  const optimizedLayerCount = Math.max(5, Math.min(layerCount, Math.ceil(radius * 0.8)));
  
  // Pre-calculate values for better performance
  const layerValues = [];
  for (let i = 0; i < optimizedLayerCount; i++) {
    const normalized = (i / (optimizedLayerCount - 1)) * 2 - 1;
    const size = Math.sqrt(1 - normalized ** 2) * 100;
    const depth = normalized * adjustedRadius;
    layerValues.push({ normalized, size, depth });
  }

  // Create new layers
  for (let i = 0; i < optimizedLayerCount; i++) {
    const { size, depth } = layerValues[i];
    const layer = document.createElement('div');
    layer.className = 'circle';
    
    // Use cssText for better performance
    let styleText = `width:${size}%;height:${size}%;opacity:0.9;transform:translate(-50%, -50%) rotateX(${90 + tilt}deg) rotateZ(0deg) translateZ(${depth}px);`;
    
    // Apply gradient or color
    if (gradient && i === Math.floor(optimizedLayerCount / 2)) {
      styleText += `background:${gradient};box-shadow:inset 0 0 20px rgba(0, 0, 0, 0.5);`;
    } else {
      styleText += `background:${color};`;
    }
    
    layer.style.cssText = styleText;
    fragment.appendChild(layer);
  }

  // Add special features for planets - only if we have enough layers
  if (features.features && features.features.length > 0 && optimizedLayerCount > 5) {
    const middleLayer = fragment.childNodes[Math.floor(optimizedLayerCount / 2)];
    if (middleLayer) {
      // Create all features at once
      const featureFragment = document.createDocumentFragment();
      features.features.forEach(feature => {
        const blob = document.createElement('div');
        blob.className = 'planet-feature';
        blob.style.cssText = `position:absolute;left:${feature.x};top:${feature.y};width:${feature.size};height:${feature.size};background:${feature.color};transform:translate(-50%, -50%);border-radius:${feature.shape === 'ellipse' ? '50% 25%' : '50%'};`;
        featureFragment.appendChild(blob);
      });
      middleLayer.appendChild(featureFragment);
    }
  }

  // Special handling for Saturn's rings
  if (planetName === 'saturn') {
    const ring = document.createElement('div');
    ring.className = 'saturn-ring';
    ring.style.cssText = `position:absolute;width:250%;height:20px;border-radius:50%;top:50%;left:50%;opacity:0.9;z-index:1;box-shadow:0 0 10px rgba(241, 196, 15, 0.4);background:linear-gradient(to right, rgba(241, 196, 15, 0), rgba(241, 196, 15, 0.6) 20%, rgba(241, 196, 15, 0.8) 50%, rgba(241, 196, 15, 0.6) 80%, rgba(241, 196, 15, 0));transform:translate(-50%, -50%) rotateX(${80 + tilt}deg);`;
    fragment.appendChild(ring);
  }
  
  rotationWrapper.appendChild(fragment);
  planet.appendChild(rotationWrapper);
}

// Store all animation frames for easy cancellation
const animationFrames = new Map();

function animatePlanet(planet, startAngle, distance, speed, name) {
  let angle = startAngle;
  let lastTimestamp = 0;
  
  // Cancel any existing animation for this planet
  if (animationFrames.has(name)) {
    cancelAnimationFrame(animationFrames.get(name));
  }

  // Add random blinking for this planet - throttled to reduce DOM operations
  if (planet.querySelector('.planet-face')) {
    const blinkInterval = 2000 + Math.random() * 3000;
    const blinkThreshold = 0.2;
    let lastBlinkTime = 0;
    
    // Add blink check to the animation loop instead of using setInterval
    function checkBlink(now) {
      if (now - lastBlinkTime > blinkInterval && Math.random() < blinkThreshold) {
        const face = planet.querySelector('.planet-face');
        const eyeLeft = face.querySelector('.eye-left');
        const eyeRight = face.querySelector('.eye-right');
        const originalEye = eyeLeft.textContent;

        // Blink
        eyeLeft.textContent = '─';
        eyeRight.textContent = '─';

        setTimeout(() => {
          eyeLeft.textContent = originalEye;
          eyeRight.textContent = originalEye;
        }, 100);
        
        lastBlinkTime = now;
      }
    }
  }

  function animate(timestamp) {
    // Calculate delta time for smooth animation regardless of frame rate
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.1); // in seconds, capped to prevent jumps
    lastTimestamp = timestamp;

    // Apply animation speed factor
    const adjustedSpeed = speed * animationSpeedFactor;

    // Use fixed increment for Mercury to prevent erratic behavior
    if (name === 'mercury') {
      angle += 0.01 * animationSpeedFactor;
    } else {
      angle += deltaTime * adjustedSpeed;
    }

    updatePlanetPosition(planet, angle, distance);
    
    // Store the animation frame ID for potential cancellation
    const frameId = requestAnimationFrame(animate);
    animationFrames.set(name, frameId);
  }

  const frameId = requestAnimationFrame(animate);
  animationFrames.set(name, frameId);
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

function createOrbitRing(container, distance) {
  const ring = document.createElement('div');
  ring.className = 'orbit-ring';
  ring.style.width = `${distance * 2}px`;
  ring.style.height = `${distance * 2}px`;
  container.appendChild(ring);
  return ring;
}

// Setup keyboard controls for planet scaling and animation
function setupKeyboardControls() {
  document.addEventListener('keydown', event => {
    switch (event.key) {
      // Up/Down: Scale planets and layer spacing
      case 'ArrowUp':
        globalScaleFactor += 0.1;
        layerSpacingFactor += 0.05;
        distanceFactor += 0.02;
        document.body.style.borderTop = '5px solid rgba(0, 255, 0, 0.5)';
        setTimeout(() => {
          document.body.style.borderTop = '';
        }, 300);
        updateAllPlanets();
        break;

      case 'ArrowDown':
        globalScaleFactor = Math.max(0.1, globalScaleFactor - 0.1);
        layerSpacingFactor = Math.max(0.1, layerSpacingFactor - 0.05);
        distanceFactor = Math.max(0.5, distanceFactor - 0.02);
        document.body.style.borderBottom = '5px solid rgba(255, 0, 0, 0.5)';
        setTimeout(() => {
          document.body.style.borderBottom = '';
        }, 300);
        updateAllPlanets();
        break;

      // Left/Right: Control animation speed
      case 'ArrowLeft':
        animationSpeedFactor = Math.max(0.1, animationSpeedFactor - 0.1);
        document.body.style.borderLeft = '5px solid rgba(0, 0, 255, 0.5)';
        setTimeout(() => {
          document.body.style.borderLeft = '';
        }, 300);
        break;

      case 'ArrowRight':
        animationSpeedFactor += 0.1;
        document.body.style.borderRight = '5px solid rgba(255, 255, 0, 0.5)';
        setTimeout(() => {
          document.body.style.borderRight = '';
        }, 300);
        break;
    }
  });
}

// Optimize layer count based on device performance
const devicePerformance = window.navigator.hardwareConcurrency || 4;
const MAX_LAYERS = devicePerformance > 4 ? 35 : 20;

// Function to update all planets when factors change
function updateAllPlanets() {
  // Use requestAnimationFrame for better performance
  requestAnimationFrame(() => {
    const planets = document.querySelectorAll('.planet');
    planets.forEach(planet => {
      const layerCount = parseInt(planet.dataset.layerCount);
      const radius = parseFloat(planet.dataset.radius);
      const color = planet.dataset.baseColor;
      // Optimize layer count based on device performance
      const optimizedLayerCount = Math.min(layerCount, MAX_LAYERS);
      updatePlanetLayers(planet, optimizedLayerCount, radius, color);
    });
  });
}

function init() {
  const container = getElem('.sphere');
  faceElement = {
    eyeLeft: getElem('.eye-left'),
    eyeRight: getElem('.eye-right'),
    mouth: getElem('.mouth'),
  };
  if (faceElement) updateFace();

  // Setup keyboard controls
  setupKeyboardControls();

  if (container) {
    // Create sun
    createSun(container, {
      layerCount: 35,
      radius: 90,
      coreColor: 'rgba(255, 140, 0, 0.3)',
      glowColor: 'rgba(255, 69, 0, 0.2)',
    });

    // Create all planets in order with correct colors using a Map
    const planets = new Map([
      [
        'mercury',
        {
          color: 'rgba(180, 180, 180, 0.8)',
          size: 12,
          distance: 150,
        },
      ],
      [
        'venus',
        {
          color: 'rgba(230, 190, 138, 0.8)',
          size: 18,
          distance: 200,
        },
      ],
      [
        'earth',
        {
          color: 'rgba(52, 152, 219, 0.8)',
          size: 20,
          distance: 280,
        },
      ],
      [
        'mars',
        {
          color: 'rgba(231, 76, 60, 0.8)',
          size: 15,
          distance: 350,
        },
      ],
      [
        'jupiter',
        {
          color: 'rgba(243, 156, 18, 0.8)',
          size: 40,
          distance: 500,
        },
      ],
      [
        'saturn',
        {
          color: 'rgba(241, 196, 15, 0.8)',
          size: 35,
          distance: 650,
        },
      ],
      [
        'uranus',
        {
          color: 'rgba(52, 231, 228, 0.8)',
          size: 28,
          distance: 800,
        },
      ],
      [
        'neptune',
        {
          color: 'rgba(41, 128, 185, 0.8)',
          size: 27,
          distance: 950,
        },
      ],
    ]);

    // Create each planet from the map with proper orbital speeds
    const orbitalSpeeds = {
      mercury: 4.1,
      venus: 1.6,
      earth: 1.0,
      mars: 0.53,
      jupiter: 0.084,
      saturn: 0.034,
      uranus: 0.012,
      neptune: 0.006,
    };

    // Create orbit rings first
    planets.forEach(config => {
      createOrbitRing(container, config.distance);
    });

    // Then create planets
    planets.forEach((config, name) => {
      // Scale layer count based on planet size (9 to 35)
      const minSize = 12; // Mercury size
      const maxSize = 40; // Jupiter size
      const minLayers = 9;
      const maxLayers = 35;

      // Calculate layers proportionally to size
      const layerCount = Math.round(
        minLayers +
          ((config.size - minSize) / (maxSize - minSize)) *
            (maxLayers - minLayers)
      );

      createPlanet(container, {
        layerCount: layerCount,
        radius: config.size / 2,
        distance: config.distance,
        color: config.color,
        className: `planet ${name}`,
        size: config.size,
        orbitSpeed: orbitalSpeeds[name],
        name: name,
      });
    });
  }

  new FaceAnimator();
}

document.addEventListener('DOMContentLoaded', init);
