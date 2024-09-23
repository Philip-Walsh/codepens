const sliders = [
  { id: "river", label: "River", emoji: "🚣‍♀️", value: 0, class: "water" ,asset: "river-water-flowing.wav"},
  { id: "waves", label: "Ocean Waves", emoji: "🌊", value: 30, class: "water" ,asset: "small-waves-harbor-rocks.wav"},
  { id: "rain", label: "Rain", emoji: "🌧️", value: 0, class: "water" ,asset: "light-rain-loop.wav"},
  { id: "wind", label: "Wind", emoji: "🍃", value: 0, class: "air" ,asset: "blizzard-cold-winds.wav"},
  { id: "thunder", label: "Thunder", emoji: "🌩️", value: 20, class: "air" ,asset: "thunder-deep-rumble.wav"},
  {
    id: "fireplace",
    label: "Fireplace",
    emoji: "🔥",
    value: 10,
    class: "fire",asset: "campfire-crackles.wav"
  },
  { id: "campfire", label: "Campfire", emoji: "🏕️", value: 30, class: "fire" ,asset: "campfire-burning-crackles.wav"},
  { id: "birds", label: "Birds", emoji: "🐦", value: 60, class: "nature" ,asset: "little-birds-singing-in-the-trees.wav"},
  // {
  //   id: "chimes",
  //   label: "Wind Chimes",
  //   emoji: "🔔",
  //   value: 0,
  //   class: "nature",asset: ""
  // },
  { id: "crickets", label: "Crickets", emoji: "🐜", value: 50, class: "nature" ,asset: "crickets-and-insects-in-the-wild-ambience.wav"}
];

document.addEventListener("DOMContentLoaded", init, false);
function init() {
  addSliders();
  addMuteButton();
}
function addSliders() {
  sliders.forEach((slider) => {
    const section = document.createElement("section");
    section.className = `slider ${slider.class}`;

    section.innerHTML = `
    <input type="range" min="0" max="100" value="${slider.value}" class="vertical-slider" id="${slider.id}">
    <span role="img" aria-label="${slider.label}">${slider.emoji}</span>
  `;

    document.body.appendChild(section);
  });
}
function addMuteButton() {
  const muteButton = document.createElement("button");
  muteButton.className = "mute-button";

  const muteIcon = document.createElement("span");
  muteIcon.setAttribute("role", "img");
  muteIcon.setAttribute("aria-label", "Unmute");
  muteIcon.textContent = "🔊";

  muteButton.appendChild(muteIcon);

  let isMuted = false;

  muteButton.onclick = () => {
    isMuted = !isMuted;
    const sliders = document.querySelectorAll(".vertical-slider");
    sliders.forEach((slider) => {
      if (isMuted) {
        slider.value = 0;
      }
    });

    muteIcon.textContent = isMuted ? "🔇" : "🔊";
    muteIcon.setAttribute("aria-label", isMuted ? "Mute" : "Unmute");
  };

  document.body.appendChild(muteButton);
}