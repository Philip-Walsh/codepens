const FaceAnimator = (() => {
  const face = document.querySelector('.big-face');
  const eyeL = face.querySelector('.eye-l');
  const eyeR = face.querySelector('.eye-r');
  const mouth = face.querySelector('.mouth');
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

  const blinkEmitter = async () => {
    while (true) {
      await sleep(randomBetween(3000, 6000));
      emit('blink');

      // Show closed eyes
      eyeL.textContent = '|';
      eyeR.textContent = '|';
      await sleep(120);

      // 80% chance same eyes, 20% chance different
      if (Math.random() < 0.2) {
        eyeL.textContent = pick(eyeOptions);
        eyeR.textContent = pick(eyeOptions);
      } else {
        const eyeChar = pick(eyeOptions);
        eyeL.textContent = eyeChar;
        eyeR.textContent = eyeChar;
      }
    }
  };

  const mouthEmitter = async () => {
    while (true) {
      await sleep(randomBetween(4000, 8000));
      emit('mouthChange');

      const shuffle = Math.random() < 0.5;
      if (shuffle) {
        mouth.textContent = pick(mouthOptions);
      } else {
        mouth.textContent = mouth.textContent === 'D' ? 'O' : 'D';
      }
    }
  };

  const init = () => {
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize eyes and mouth
      const initialEye = pick(eyeOptions);
      eyeL.textContent = initialEye;
      eyeR.textContent = initialEye;
      mouth.textContent = pick(mouthOptions);

      blinkEmitter();
      mouthEmitter();
    });
  };

  return { init, on };
})();

FaceAnimator.init();

FaceAnimator.on('blink', () => console.log('Blinked!'));
FaceAnimator.on('mouthChange', () => console.log('Mouth changed!'));
