// DOM Elements
const svg = document.getElementById('squiggle-svg');
const path = document.getElementById('squiggle-path');
const menuToggle = document.getElementById('menu-toggle');
const settingsMenu = document.querySelector('.settings-menu');
const closeMenu = document.querySelector('.close-menu');
const bgColorInput = document.getElementById('bg-color');
const squiggleColorInput = document.getElementById('squiggle-color');
const glowIntensityInput = document.getElementById('glow-intensity');
const audioFileInput = document.getElementById('audio-file');

// Example Speech URLs
const speechExamples = [
    {
        name: "Hello John (Male)",
        url: "https://cdn.jsdelivr.net/gh/microsoft/edge-tts-js@main/examples/hello.mp3"
    },
    {
        name: "Hello John (Female)",
        url: "https://cdn.jsdelivr.net/gh/microsoft/edge-tts-js@main/examples/hello-female.mp3"
    },
    {
        name: "Welcome Message",
        url: "https://cdn.jsdelivr.net/gh/microsoft/edge-tts-js@main/examples/welcome.mp3"
    }
];

// Audio Context
let audioContext;
let analyser;
let dataArray;
let source;
let animationId;
let isPlaying = false;

// Initialize Audio Context
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        console.log('Audio context initialized');
    }
}

// Update Squiggle Path
function updateSquiggle() {
    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);

    // Calculate average frequency
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedAverage = average / 255; // Normalize to 0-1

    // Generate path data
    const width = 100;
    const height = 20;
    const segments = 20;
    const segmentWidth = width / segments;

    let pathData = `M 0,${height / 2}`;

    for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth;
        const frequency = dataArray[Math.floor(i * dataArray.length / segments)];
        const normalizedFreq = frequency / 255;
        const y = height / 2 + (normalizedFreq - 0.5) * height * 0.8;

        if (i === 0) {
            pathData += ` M ${x},${y}`;
        } else {
            const cp1x = x - segmentWidth / 2;
            const cp1y = y;
            const cp2x = x - segmentWidth / 2;
            const cp2y = y;
            pathData += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`;
        }
    }

    path.setAttribute('d', pathData);

    if (isPlaying) {
        animationId = requestAnimationFrame(updateSquiggle);
    }
}

// Handle Audio File
function handleAudioFile(file) {
    if (!audioContext) initAudio();

    const reader = new FileReader();
    reader.onload = function (e) {
        const arrayBuffer = e.target.result;
        audioContext.decodeAudioData(arrayBuffer, function (buffer) {
            if (source) source.disconnect();
            source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            source.start(0);
            isPlaying = true;
            if (!animationId) updateSquiggle();
            console.log('Audio file playing');
        });
    };
    reader.readAsArrayBuffer(file);
}

// Handle Audio URL
async function handleAudioURL(url) {
    if (!audioContext) initAudio();

    try {
        console.log('Fetching audio from:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();

        audioContext.decodeAudioData(arrayBuffer, function (buffer) {
            if (source) source.disconnect();
            source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            source.start(0);
            isPlaying = true;
            if (!animationId) updateSquiggle();
            console.log('Audio URL playing');
        });
    } catch (error) {
        console.error('Error loading audio:', error);
        alert('Error loading audio. Please try another URL or file.');
    }
}

// Create Example Buttons
function createExampleButtons() {
    const examplesContainer = document.createElement('div');
    examplesContainer.className = 'examples-container';

    speechExamples.forEach(example => {
        const button = document.createElement('button');
        button.className = 'example-btn';
        button.textContent = example.name;
        button.addEventListener('click', () => {
            console.log('Example button clicked:', example.name);
            handleAudioURL(example.url);
        });
        examplesContainer.appendChild(button);
    });

    // Insert after the audio file input
    audioFileInput.parentNode.insertBefore(examplesContainer, audioFileInput.nextSibling);
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

audioFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        console.log('File selected:', file.name);
        handleAudioFile(file);
    }
});

// Initialize
updateSettings();
createExampleButtons();

// Add click handler to start audio context
document.addEventListener('click', function initAudioOnClick() {
    if (!audioContext) {
        initAudio();
        console.log('Audio context initialized on first click');
    }
    document.removeEventListener('click', initAudioOnClick);
}, { once: true });

// Cleanup
window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
    if (audioContext) audioContext.close();
}); 