const TamagotchiFace = (() => {
  // Cache DOM elements
  const face = document.querySelector('.face');
  const eyes = face.querySelector('.eyes');
  const mouth = face.querySelector('.mouth');
  const makeHappyBtn = document.getElementById('makeHappy');
  const makeSadBtn = document.getElementById('makeSad');

  // Expression pools for different moods
  const expressions = {
    happy: {
      eyes: [':', '=', '8', 'ǒ'],
      mouths: ['D', '3', ')']
    },
    sad: {
      eyes: [':', '=', ';'],
      mouths: ['(', 'c', '{']
    },
    neutral: {
      eyes: [':', '='],
      mouths: ['|', 'O', 'o']
    }
  };

  // Current mood state
  let currentMood = 'neutral';

  // Utility functions
  const sleep = ms => new Promise(res => setTimeout(res, ms));
  const randomBetween = (min, max) => Math.random() * (max - min) + min;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // Expression changers
  const setExpression = (mood) => {
    const pool = expressions[mood];
    eyes.textContent = pick(pool.eyes);
    mouth.textContent = pick(pool.mouths);
  };

  const blink = async () => {
    const currentEyes = eyes.textContent;
    eyes.textContent = '-';
    await sleep(120);
    eyes.textContent = currentEyes;
  };

  // Mood setters
  const setMood = (mood) => {
    // Remove all mood classes
    face.classList.remove('happy', 'sad');
    
    // Set new mood
    currentMood = mood;
    if (mood !== 'neutral') {
      face.classList.add(mood);
    }
    
    setExpression(mood);
  };

  // Animation loops
  const startBlinking = async () => {
    while (true) {
      await sleep(randomBetween(3000, 6000));
      await blink();
    }
  };

  const startMoodExpressions = async () => {
    while (true) {
      await sleep(randomBetween(2000, 4000));
      setExpression(currentMood);
    }
  };

  // Event handlers
  const handleMakeHappy = () => {
    setMood('happy');
  };

  const handleMakeSad = () => {
    setMood('sad');
  };

  // Initialize
  const init = () => {
    // Set initial expression
    setMood('neutral');

    // Start animation loops
    startBlinking();
    startMoodExpressions();

    // Add button listeners
    makeHappyBtn.addEventListener('click', handleMakeHappy);
    makeSadBtn.addEventListener('click', handleMakeSad);
  };

  return { init };
})();

// Start the face animation when the page loads
document.addEventListener('DOMContentLoaded', TamagotchiFace.init);