document.addEventListener('DOMContentLoaded', () => {
  const sphere = document.createElement('div');
  sphere.className = 'sphere';
  document.body.appendChild(sphere);

  const layers = 50;
  const radius = 90;

  for (let i = 0; i < layers; i++) {
    const circle = document.createElement('div');
    circle.className = 'circle';

    const normalized = (i / (layers - 1)) * 2 - 1;
    const size = Math.sqrt(1 - normalized ** 2) * 100;
    const depth = normalized * radius;

    circle.style.width = `${size}%`;
    circle.style.height = `${size}%`;
    // circle.style.opacity = 0.2 + (i / layers) * 0.8;
    circle.style.transform = `rotateX(60deg) translateZ(${depth}px)`;

    sphere.appendChild(circle);
  }

  FaceAnimator.init();

  FaceAnimator.on('blink', () => console.log('Blinked!'));
  FaceAnimator.on('mouthChange', () => console.log('Mouth changed!'));
});

const FaceAnimator = (() => {
  let faceEl;
  const eyeOptions = ['°', ' ͡°', 'ʘ', '≖', '✖', 'ǒ', '●', '◕', '◔', 'ಠ', '✷', '•ิ', '•'];
  const mouthOptions = ['ʖ', '‿', '□', '╭╮', '@', 'へ', '◇', 'ɷ', '•'];

  const sleep = ms => new Promise(res => setTimeout(res, ms));
  const randomBetween = (min, max) => Math.random() * (max - min) + min;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const events = new Map();
  const on = (event, fn) => {
    if (!events.has(event)) events.set(event, []);
    events.get(event).push(fn);
  };
  const emit = (event, data) => {
    (events.get(event) || []).forEach(fn => fn(data));
  };
  let currentLeftEye = pick(eyeOptions);
  let currentRightEye = currentLeftEye;
  let currentMouth = pick(mouthOptions);

  const updateFaceUI = () => {
    const face = `${currentLeftEye}${currentMouth}${currentRightEye}`;
    faceEl.style.setProperty('--face', `"${face}"`);
  };

  const blinkEmitter = async () => {
    while (true) {
      await sleep(randomBetween(3000, 6000));
      emit('blink');

      const prevLeft = currentLeftEye;
      const prevRight = currentRightEye;
      currentLeftEye = '|';
      currentRightEye = '|';
      updateFaceUI();
      await sleep(120);

      if (Math.random() < 0.02) {
        currentLeftEye = pick(eyeOptions);
        currentRightEye = pick(eyeOptions);
      } else {
        const eye = pick(eyeOptions);
        currentLeftEye = currentRightEye = eye;
      }
      updateFaceUI();
    }
  };

  const mouthEmitter = async () => {
    while (true) {
      await sleep(randomBetween(4000, 8000));
      emit('mouthChange');

      const shuffle = Math.random() < 0.5;
      currentMouth = shuffle ? pick(mouthOptions) : currentMouth === 'D' ? 'O' : 'D';
      updateFaceUI();
    }
  };

  const obj = {
    init: () => {
      faceEl = document.querySelector('.sphere');
      faceEl.classList.add('face');
      updateFaceUI();
      blinkEmitter();
      mouthEmitter();
    },
    on,
    get face() {
      return {
        leftEye: currentLeftEye,
        rightEye: currentRightEye,
        mouth: currentMouth,
      };
    },
    set face({ leftEye, rightEye, mouth }) {
      if (leftEye) currentLeftEye = leftEye;
      if (rightEye) currentRightEye = rightEye;
      if (mouth) currentMouth = mouth;
      updateFaceUI();
    },
  };

  return obj;
})();
