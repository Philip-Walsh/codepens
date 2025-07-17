const assetDir =
  'https://github.com/Philip-Walsh/codepens/raw/refs/heads/main/assets/audio/';
const sliders = [
  {
    id: 'river',
    label: 'River',
    emoji: '🚣‍♀️',
    value: 0,
    class: 'water',
    asset: 'river-water-flowing.wav',
  },
  {
    id: 'waves',
    label: 'Ocean Waves',
    emoji: '🌊',
    value: 30,
    class: 'water',
    asset: 'small-waves-harbor-rocks.wav',
  },
  {
    id: 'rain',
    label: 'Rain',
    emoji: '🌧️',
    value: 0,
    class: 'water',
    asset: 'light-rain-loop.wav',
  },
  {
    id: 'wind',
    label: 'Wind',
    emoji: '🍃',
    value: 0,
    class: 'air',
    asset: 'blizzard-cold-winds.wav',
  },
  {
    id: 'thunder',
    label: 'Thunder',
    emoji: '🌩️',
    value: 20,
    class: 'air',
    asset: 'thunder-deep-rumble.wav',
  },
  {
    id: 'fireplace',
    label: 'Fireplace',
    emoji: '🔥',
    value: 10,
    class: 'fire',
    asset: 'campfire-crackles.wav',
  },
  {
    id: 'campfire',
    label: 'Campfire',
    emoji: '🏕️',
    value: 30,
    class: 'fire',
    asset: 'campfire-burning-crackles.wav',
  },
  {
    id: 'birds',
    label: 'Birds',
    emoji: '🐦',
    value: 60,
    class: 'nature',
    asset: 'little-birds-singing-in-the-trees.wav',
  },
  // {
  //   id: "chimes",
  //   label: "Wind Chimes",
  //   emoji: "🔔",
  //   value: 0,
  //   class: "nature",asset: ""
  // },
  {
    id: 'crickets',
    label: 'Crickets',
    emoji: '🐜',
    value: 50,
    class: 'nature',
    asset: 'crickets-and-insects-in-the-wild-ambience.wav',
  },
];

const audioElements = {};

function addStartButton() {
  const startButton = document.createElement('button');
  startButton.className = 'start-button';
  startButton.textContent = 'Start Audio';
  startButton.onclick = playAudio;
  document.body.appendChild(startButton);
}

function loadAudio() {
  sliders.forEach(slider => {
    const audio = new Audio(`${assetDir}${slider.asset}`);
    audio.loop = true;
    audio.volume = slider.value / 100;

    audioElements[slider.id] = audio;
  });
}
function playAudio() {
  Object.values(audioElements).forEach(audio => {
    audio
      .play()
      .then(() => {
        console.log(`Audio is playing at volume: ${audio.volume}`);
      })
      .catch(error => {
        console.error('Error playing audio:', error);
      });
  });

  document.querySelector('.start-button').remove();
}
document.addEventListener('DOMContentLoaded', init, false);
function init() {
  addStartButton();
  loadAudio();
  addSliders();
  addMuteButton();
  sliders.forEach(slider => {
    const section = document.querySelector(`.slider.${slider.class}`);
    section.querySelector('input').addEventListener('input', event => {
      const volume = event.target.value / 100;
      audioElements[slider.id].volume = volume;
      console.log(`${slider.label} volume adjusted to: ${volume}`);
    });
  });
}
function addSliders() {
  sliders.forEach(slider => {
    const section = document.createElement('section');
    section.className = `slider ${slider.class}`;

    section.innerHTML = `
    <input type="range" min="0" max="100" value="${slider.value}" class="vertical-slider" id="${slider.id}">
    <span role="img" aria-label="${slider.label}">${slider.emoji}</span>
  `;

    document.body.appendChild(section);
  });
}
function addMuteButton() {
  const muteButton = document.createElement('button');
  muteButton.className = 'mute-button';

  const muteIcon = document.createElement('span');
  muteIcon.setAttribute('role', 'img');
  muteIcon.setAttribute('aria-label', 'Unmute');
  muteIcon.textContent = '🔊';

  muteButton.appendChild(muteIcon);

  let isMuted = false;

  muteButton.onclick = () => {
    isMuted = !isMuted;
    sliders.forEach(slider => {
      const volume = isMuted ? 0 : slider.value / 100;
      audioElements[slider.id].volume = volume;
      document.getElementById(slider.id).value = volume * 100;
    });

    muteIcon.textContent = isMuted ? '🔇' : '🔊';
    muteIcon.setAttribute('aria-label', isMuted ? 'Mute' : 'Unmute');
  };

  document.body.appendChild(muteButton);
}
