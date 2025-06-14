const FaceAnimator = (() => {
  // Cache DOM elements
  const face = document.querySelector('.face');
  const eyes = face.querySelector('.eyes');
  const mouth = face.querySelector('.mouth');

  // Pools of eyes and mouths
  const eyeOptions = [':', ';', '=', '8', 'X', 'ǒ'];
  const mouthOptions = ['D', 'O', 'P', '|', '/', '3', '@', ')', '('];

  // Utility: sleep for ms milliseconds
  const sleep = ms => new Promise(res => setTimeout(res, ms));

  // Utility: random number between min and max
  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  // Utility: pick a random item from an array
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // Custom Event Map system
  const events = new Map();
  const on = (event, fn) => {
    if (!events.has(event)) events.set(event, []);
    events.get(event).push(fn);
  };
  const emit = (event, data) => {
    (events.get(event) || []).forEach(fn => fn(data));
  };

  // Randomized blink emitter
  const blinkEmitter = async () => {
    while (true) {
      await sleep(randomBetween(3000, 6000));
      emit('blink');

      // Show closed/blinking eyes
      eyes.textContent = '|';
      await sleep(120);

      // Occasionally shuffle eye style
      eyes.textContent = Math.random() < 0.4 ? pick(eyeOptions) : ':';
    }
  };

  const mouthEmitter = async () => {
    while (true) {
      await sleep(randomBetween(4000, 8000));
      emit('mouthChange');

      // Occasionally shuffle mouth style
      const shuffle = Math.random() < 0.5;
      if (shuffle) {
        mouth.textContent = pick(mouthOptions);
      } else {
        // Toggle between two common styles
        mouth.textContent = mouth.textContent === 'D' ? 'O' : 'D';
      }
    }
  };

  const init = () => {
    document.addEventListener('DOMContentLoaded', () => {
      eyes.textContent = pick(eyeOptions);
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
