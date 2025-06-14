document.addEventListener('DOMContentLoaded', init);

function init() {
  createLamp();
  createColorPicker('colorCanvas');
  document.getElementById('toggle-controls').addEventListener('click', toggleControls);
}
function createLamp() {
  function createElem(className) {
    const elem = document.createElement('div');
    elem.className = className;
    return elem;
  }

  function createCircle(i, layers, radius) {
    const normalized = (i / (layers - 1)) * 2 - 1;
    const size = Math.sqrt(1 - normalized ** 2) * 100;
    const depth = normalized * radius;

    const circle = createElem('circle');

    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;

    let inverseCol = Math.floor((i / layers + 2) * 150);
    console.log(inverseCol, i);
    if (i > layers / 5) {
      // circle.style.backgroundColor = `rgb(${inverseCol}, 200, ${inverseCol})`;
      const opacity = inverseCol;
      // Math.max(0.2, 1 - (i / layers) * 0.8); // More transparent as we go up
      circle.style.opacity = opacity;
    } else {
      circle.style.backgroundColor = `rgb(${inverseCol - 200},82,45)`;
    }

    // Set the circle's 3D transformation to position it properly
    circle.style.transform = `translateZ(${depth}px)`;

    return circle;
  }
  const sphere = createElem('sphere');
  document.body.appendChild(sphere);

  const layers = 25;
  const radius = 90;

  for (let i = 0; i < layers; i++) {
    const circle = createCircle(i, layers, radius);
    sphere.appendChild(circle);
  }
}

function createColorPicker(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const marker = document.createElement('div');
  marker.setAttribute('id', 'marker');

  function setupMarker() {
    Object.assign(marker.style, {
      position: 'absolute',
      width: '10px',
      height: '10px',
      border: '2px solid black',
      borderRadius: '50%',
      pointerEvents: 'none',
      transform: 'translate(-50%, -50%)',
      display: 'none',
    });
    document.body.appendChild(marker);
  }

  function drawColorGradient() {
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'].forEach(
      (color, i) => {
        gradient.addColorStop(i / 6, color);
      }
    );
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function pickColor(e) {
    const imgData = ctx.getImageData(
      (e.offsetX / canvas.clientWidth) * canvas.width,
      (e.offsetY / canvas.clientHeight) * canvas.height,
      1,
      1
    ).data;
    const color = `${imgData[0]}, ${imgData[1]}, ${imgData[2]}, ${imgData[3]}`;
    document.documentElement.style.setProperty('--light-color', color);

    marker.style.left = `${e.pageX}px`;
    marker.style.top = `${e.pageY}px`;
    marker.style.display = 'block'; // Show the marker when picking a color
  }

  const defaultColor = '255, 200, 150';

  function init() {
    setupMarker();
    drawColorGradient();
    document.documentElement.style.setProperty('--light-color', defaultColor);
    marker.style.left = `${canvas.offsetLeft + canvas.width / 2}px`;
    marker.style.top = `${canvas.offsetTop + canvas.height / 2}px`;
    canvas.addEventListener('click', pickColor);
  }

  init();
}

function toggleControls(event) {
  const element = event.currentTarget;
  document.getElementById('controls').classList.toggle('closed');

  toggleSpinDirection(element);
  triggerSpinAnimation(element);

  function toggleSpinDirection(element) {
    const rotation = 180;
    const currentSpin = getComputedStyle(element).getPropertyValue('--spin-deg');
    const newSpin = currentSpin === `${rotation}deg` ? `-${rotation}deg` : `${rotation}deg`;
    element.style.setProperty('--spin-deg', newSpin);
  }

  function triggerSpinAnimation(element) {
    element.classList.add('spin-animation');
    element.addEventListener('animationend', () => {
      element.classList.remove('spin-animation');
    });
    void element.offsetWidth;
  }
}
