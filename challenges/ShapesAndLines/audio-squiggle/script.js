// DOM Elements
const svg = document.getElementById('squiggle-svg');
const path = document.getElementById('squiggle-path');
const menuToggle = document.getElementById('menu-toggle');
const settingsMenu = document.querySelector('.settings-menu');
const closeMenu = document.querySelector('.close-menu');
const bgColorInput = document.getElementById('bg-color');
const squiggleColorInput = document.getElementById('squiggle-color');
const glowIntensityInput = document.getElementById('glow-intensity');
const speechBubble = document.querySelector('.speech-bubble');
const customUrlInput = document.getElementById('custom-url');
const playCustomButton = document.getElementById('play-custom');

// Audio URL - Using raw GitHub content URL
const defaultAudioUrl =
  'https://raw.githubusercontent.com/Philip-Walsh/codepens/main/challenges/ShapesAndLines/audio-squiggle/I-have-a-voice.m4a';

// Audio Context
let audioContext;
let analyser;
let dataArray;
let source;
let animationId;
let isPlaying = false;
let audioElement;
let lastValues = []; // Store last values for smoothing
let timeOffset = 0; // For wave movement
let phaseOffset = 0; // For continuous phase
let currentPattern = 'wave';
let logQueue = [];
let logTimeout = null;

function queueLog(message, duration = 2000) {
  logQueue.push({ message, duration });
  if (!logTimeout) {
    processLogQueue();
  }
}

function processLogQueue() {
  if (logQueue.length === 0) {
    logTimeout = null;
    return;
  }

  const { message, duration } = logQueue.shift();
  console.log(message);
  if (speechBubble) {
    speechBubble.textContent = message;
    speechBubble.style.opacity = '1';
    speechBubble.style.display = 'block';
  }

  logTimeout = setTimeout(() => {
    if (logQueue.length === 0) {
      speechBubble.style.opacity = '0';
      setTimeout(() => {
        speechBubble.style.display = 'none';
      }, 500);
    }
    processLogQueue();
  }, duration);
}

// Pattern types
const patterns = {
  wave: {
    name: 'Wave',
    update: (points, phaseOffset, dataArray, lastValues) => {
      return points.map((point, i) => {
        const frequencyIndex = Math.floor((i + phaseOffset * 20) % dataArray.length);
        const frequency = dataArray[frequencyIndex];
        lastValues[frequencyIndex] = smoothValue(lastValues[frequencyIndex], frequency);
        const smoothedFreq = lastValues[frequencyIndex];
        const normalizedFreq = smoothedFreq / 255 - 0.5;
        const sineOffset = Math.sin(phaseOffset + i * 0.05) * 0.2;
        return {
          ...point,
          y: point.y + (normalizedFreq + sineOffset) * point.amplitude,
        };
      });
    },
  },
  pulse: {
    name: 'Pulse',
    update: (points, phaseOffset, dataArray, lastValues) => {
      return points.map((point, i) => {
        const frequencyIndex = Math.floor((i + phaseOffset * 10) % dataArray.length);
        const frequency = dataArray[frequencyIndex];
        lastValues[frequencyIndex] = smoothValue(lastValues[frequencyIndex], frequency);
        const smoothedFreq = lastValues[frequencyIndex];
        const normalizedFreq = smoothedFreq / 255;
        const pulse = Math.sin(phaseOffset * 2 + i * 0.1) * 0.5;
        const wave = Math.sin(phaseOffset + i * 0.05) * 0.3;
        return {
          ...point,
          y: point.y + (normalizedFreq * pulse + wave) * point.amplitude * 3,
        };
      });
    },
  },
  bounce: {
    name: 'Bounce',
    update: (points, phaseOffset, dataArray, lastValues) => {
      return points.map((point, i) => {
        const frequencyIndex = Math.floor((i + phaseOffset * 15) % dataArray.length);
        const frequency = dataArray[frequencyIndex];
        lastValues[frequencyIndex] = smoothValue(lastValues[frequencyIndex], frequency);
        const smoothedFreq = lastValues[frequencyIndex];
        const normalizedFreq = smoothedFreq / 255;
        const bounce = Math.abs(Math.sin(phaseOffset + i * 0.08));
        const wave = Math.sin(phaseOffset * 2 + i * 0.03) * 0.2;
        return {
          ...point,
          y: point.y + (normalizedFreq * bounce + wave) * point.amplitude * 3,
        };
      });
    },
  },
};

// Initialize Audio Context
function initAudio() {
  queueLog('Initializing audio context...', 1000);
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    lastValues = new Array(bufferLength).fill(0);
    queueLog('Audio context initialized', 1000);
  }
}

// Smooth value transition
function smoothValue(current, target, smoothing = 0.2) {
  return current + (target - current) * smoothing;
}

// Update Squiggle Path
function updateSquiggle() {
  const svgWidth = svg.clientWidth;
  const svgHeight = svg.clientHeight;
  const width = svgWidth;
  const height = svgHeight;
  const segments = 200;
  const segmentWidth = width / segments;
  const padding = height * 0.1;

  phaseOffset = (phaseOffset + 0.01) % (Math.PI * 2);

  let points = [];

  for (let i = 0; i <= segments; i++) {
    const x = i * segmentWidth;
    const amplitude = (height - padding * 2) * 0.4;
    points.push({
      x,
      y: height / 2,
      amplitude,
    });
  }

  if (analyser) {
    analyser.getByteFrequencyData(dataArray);
    points = patterns[currentPattern].update(points, phaseOffset, dataArray, lastValues);
  } else {
    // Default animation when no audio
    points = points.map((point, i) => ({
      ...point,
      y: point.y + Math.sin(phaseOffset + i * 0.05) * point.amplitude * 0.5,
    }));
  }

  let pathData = `M ${points[0].x},${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const current = points[i];
    const previous = points[i - 1];
    const cp1x = previous.x + (current.x - previous.x) * 0.5;
    const cp1y = previous.y;
    const cp2x = current.x - (current.x - previous.x) * 0.5;
    const cp2y = current.y;
    pathData += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${current.x},${current.y}`;
  }

  path.setAttribute('d', pathData);
  animationId = requestAnimationFrame(updateSquiggle);
}

// Create pattern selector
function createPatternSelector() {
  queueLog('Creating pattern selector...', 1000);
  const patternContainer = document.querySelector('.pattern-selector');
  patternContainer.innerHTML = '';

  Object.entries(patterns).forEach(([key, pattern]) => {
    const button = document.createElement('button');
    button.textContent = pattern.name;
    button.className = key === currentPattern ? 'active' : '';
    button.addEventListener('click', () => {
      currentPattern = key;
      queueLog(`Pattern changed to: ${pattern.name}`, 1000);
      document.querySelectorAll('.pattern-selector button').forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
    });
    patternContainer.appendChild(button);
  });
}

// Handle Audio URL
async function handleAudioURL(url) {
  queueLog('Loading audio...', 1000);
  if (!audioContext) {
    queueLog('No audio context, initializing...', 1000);
    initAudio();
  }

  try {
    if (audioElement) {
      queueLog('Cleaning up previous audio...', 1000);
      audioElement.pause();
      audioElement.remove();
    }

    queueLog('Creating new audio element...', 1000);
    audioElement = document.createElement('audio');
    audioElement.crossOrigin = 'anonymous';
    document.body.appendChild(audioElement);

    queueLog('Fetching audio file...', 1000);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    queueLog('Setting audio source...', 1000);
    audioElement.src = url;

    queueLog('Loading audio data...', 1000);
    await new Promise((resolve, reject) => {
      audioElement.oncanplaythrough = () => {
        queueLog('Audio can play through', 1000);
        resolve();
      };
      audioElement.onerror = e => {
        queueLog(`Audio error: ${e.target.error?.message || 'Unknown error'}`, 3000);
        reject(e.target.error || new Error('Audio loading failed'));
      };
      audioElement.load();
    });

    if (source) {
      queueLog('Disconnecting old source...', 1000);
      source.disconnect();
    }

    queueLog('Creating media source...', 1000);
    source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    audioElement.onended = () => {
      queueLog('Audio playback ended', 2000);
      isPlaying = false;
      setTimeout(() => {
        queueLog('Click to play again', 2000);
      }, 2000);
    };

    queueLog('Starting audio playback...', 1000);
    try {
      await audioElement.play();
      isPlaying = true;
      queueLog('Audio playing successfully', 2000);

      // Ensure animation is running
      if (!animationId) {
        queueLog('Starting animation...', 1000);
        updateSquiggle();
      }
    } catch (playError) {
      queueLog(`Play error: ${playError.message}`, 3000);
      throw playError;
    }
  } catch (error) {
    console.error('Error in handleAudioURL:', error);
    queueLog(`Error: ${error.message}`, 3000);
    isPlaying = false;
  }
}

// Settings
function updateSettings() {
  document.documentElement.style.setProperty('--bg-color', bgColorInput.value);
  document.documentElement.style.setProperty('--squiggle-color', squiggleColorInput.value);
  const intensity = glowIntensityInput.value;
  document.documentElement.style.setProperty('--glow-intensity', intensity);
  const blur = document.querySelector('#glow feGaussianBlur');
  if (blur) {
    blur.setAttribute('stdDeviation', intensity / 2); // Divide by 2 for better visual effect
  }
}

// Menu Toggle
function toggleMenu() {
  settingsMenu.classList.toggle('active');
}

// Event Listeners
menuToggle.addEventListener('click', toggleMenu);
closeMenu.addEventListener('click', toggleMenu);

bgColorInput.addEventListener('input', updateSettings);
squiggleColorInput.addEventListener('input', updateSettings);
glowIntensityInput.addEventListener('input', updateSettings);

playCustomButton.addEventListener('click', () => {
  const url = customUrlInput.value.trim();
  if (url) {
    handleAudioURL(url);
  }
});

// Initialize
updateSettings();
createPatternSelector();

// Start animation immediately
updateSquiggle();

// Handle audio on click
document.body.addEventListener('click', async function initAudioOnClick(event) {
  // Ignore clicks on settings menu and its children
  if (event.target.closest('.settings-menu')) {
    queueLog('Ignoring click on settings menu', 1000);
    return;
  }

  queueLog('Click detected, checking audio state...', 1000);

  if (!audioContext) {
    queueLog('First click detected, initializing audio...', 1000);
    try {
      await handleAudioURL(defaultAudioUrl);
    } catch (error) {
      queueLog(`Failed to initialize audio: ${error.message}`, 3000);
    }
  } else if (!isPlaying) {
    queueLog('Restarting audio...', 1000);
    try {
      await handleAudioURL(defaultAudioUrl);
    } catch (error) {
      queueLog(`Failed to restart audio: ${error.message}`, 3000);
    }
  } else {
    queueLog('Audio is already playing', 1000);
  }
});

// Cleanup
window.addEventListener('beforeunload', () => {
  if (animationId) cancelAnimationFrame(animationId);
  if (audioContext) audioContext.close();
  if (audioElement) audioElement.remove();
});
