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

// Audio URL - Using raw GitHub content URL
const defaultAudioUrl = 'https://raw.githubusercontent.com/Philip-Walsh/codepens/main/challenges/ShapesAndLines/audio-squiggle/I-have-a-voice.m4a';

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

// Initialize Audio Context
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        // Initialize lastValues array
        lastValues = new Array(bufferLength).fill(0);
    }
}

// Smooth value transition
function smoothValue(current, target, smoothing = 0.2) {
    return current + (target - current) * smoothing;
}

// Update Squiggle Path
function updateSquiggle() {
    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);

    // Get SVG dimensions
    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;

    // Generate path data
    const width = svgWidth;
    const height = svgHeight;
    const segments = 200; // More segments for smoother wave
    const segmentWidth = width / segments;
    const padding = height * 0.1; // 10% padding from top and bottom

    // Update phase offset for continuous movement
    phaseOffset = (phaseOffset + 0.01) % (Math.PI * 2);

    let pathData = '';
    let points = [];

    // First pass: collect all points
    for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth;

        // Calculate frequency index with phase offset
        const frequencyIndex = Math.floor((i + phaseOffset * 20) % dataArray.length);
        const frequency = dataArray[frequencyIndex];

        // Smooth the frequency value
        lastValues[frequencyIndex] = smoothValue(lastValues[frequencyIndex], frequency);
        const smoothedFreq = lastValues[frequencyIndex];

        // Calculate y position with padding and reduced amplitude
        const amplitude = (height - padding * 2) * 0.4; // 40% of available height

        // Add sine wave movement for smoother animation
        const sineOffset = Math.sin(phaseOffset + i * 0.05) * 0.2;

        // Center the wave around the middle and ensure it goes both up and down
        const normalizedFreq = (smoothedFreq / 255) - 0.5; // Center around 0
        const y = height / 2 + (normalizedFreq + sineOffset) * amplitude;

        points.push({ x, y });
    }

    // Second pass: generate smooth path
    pathData = `M ${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
        const current = points[i];
        const previous = points[i - 1];

        // Calculate control points for smooth curve
        const cp1x = previous.x + (current.x - previous.x) * 0.5;
        const cp1y = previous.y;
        const cp2x = current.x - (current.x - previous.x) * 0.5;
        const cp2y = current.y;

        pathData += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${current.x},${current.y}`;
    }

    path.setAttribute('d', pathData);

    if (isPlaying) {
        animationId = requestAnimationFrame(updateSquiggle);
    }
}

// Handle Audio URL
async function handleAudioURL(url) {
    if (!audioContext) initAudio();

    try {
        // Hide speech bubble when starting playback
        if (speechBubble) {
            speechBubble.style.opacity = '0';
            setTimeout(() => {
                speechBubble.style.display = 'none';
            }, 500);
        }

        // Create new audio element each time
        if (audioElement) {
            audioElement.pause();
            audioElement.remove();
        }

        audioElement = document.createElement('audio');
        audioElement.crossOrigin = "anonymous";
        document.body.appendChild(audioElement);

        // First try to fetch the audio to ensure it's accessible
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // If fetch succeeds, set the audio source
        audioElement.src = url;

        // Wait for audio to be loaded
        await new Promise((resolve, reject) => {
            audioElement.oncanplaythrough = resolve;
            audioElement.onerror = reject;
            audioElement.load();
        });

        // Create new media element source
        if (source) {
            source.disconnect();
        }
        source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        // Add ended event listener
        audioElement.onended = () => {
            isPlaying = false;
            setTimeout(() => {
                showResetButton();
            }, 2000);
        };

        // Start playing
        await audioElement.play();
        isPlaying = true;
        if (!animationId) updateSquiggle();

    } catch (error) {
        console.error('Error loading audio:', error);
        showResetButton();
    }
}

// Show Reset Button
function showResetButton() {
    const resetContainer = document.createElement('div');
    resetContainer.className = 'reset-container';

    const resetButton = document.createElement('button');
    resetButton.className = 'reset-btn';
    resetButton.textContent = 'Play Again';
    resetButton.addEventListener('click', () => {
        resetContainer.remove();
        handleAudioURL(defaultAudioUrl);
    });

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'Or enter custom audio URL';
    urlInput.className = 'url-input';

    const playCustomButton = document.createElement('button');
    playCustomButton.className = 'custom-btn';
    playCustomButton.textContent = 'Play Custom';
    playCustomButton.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
            resetContainer.remove();
            handleAudioURL(url);
        }
    });

    resetContainer.appendChild(resetButton);
    resetContainer.appendChild(urlInput);
    resetContainer.appendChild(playCustomButton);

    document.body.appendChild(resetContainer);
}

// Settings
function updateSettings() {
    // Background Color
    document.documentElement.style.setProperty('--bg-color', bgColorInput.value);

    // Squiggle Color
    document.documentElement.style.setProperty('--squiggle-color', squiggleColorInput.value);

    // Glow Intensity
    const intensity = glowIntensityInput.value;
    document.documentElement.style.setProperty('--glow-intensity', intensity);
    const blur = document.querySelector('#glow feGaussianBlur');
    blur.setAttribute('stdDeviation', intensity);
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

// Initialize
updateSettings();

// Add click handler to start audio context and play default audio
document.addEventListener('click', function initAudioOnClick() {
    if (!audioContext) {
        initAudio();
        handleAudioURL(defaultAudioUrl);
    }
    document.removeEventListener('click', initAudioOnClick);
}, { once: true });

// Cleanup
window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
    if (audioContext) audioContext.close();
    if (audioElement) audioElement.remove();
}); 