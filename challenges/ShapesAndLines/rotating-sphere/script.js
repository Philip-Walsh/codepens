document.addEventListener("DOMContentLoaded", () => {
  const container = document.createElement("div");
  container.className = "universe-container";
  document.body.appendChild(container);

  const header = document.createElement("header");
  header.className = "header";
  header.innerHTML = `
    <div class="container">
      <h1>Cosmic Sphere</h1>
      <p class="subtitle">Interactive 3D universe simulation</p>
    </div>
  `;
  document.body.insertBefore(header, container);

  const controls = document.createElement("div");
  controls.className = "controls";
  controls.innerHTML = `
    <div class="control-group">
      <label>Rotation Speed</label>
      <input type="range" id="speed" min="0" max="100" value="50">
    </div>
    <div class="control-group">
      <label>Solar Flares</label>
      <input type="range" id="flares" min="0" max="100" value="70">
    </div>
    <button class="theme-toggle" aria-label="Toggle theme">
      <i class="ri-sun-line"></i>
    </button>
  `;
  container.appendChild(controls);

  // Create the sun sphere
  const sun = document.createElement("div");
  sun.className = "sun";
  container.appendChild(sun);

  // Create sun's core
  const core = document.createElement("div");
  core.className = "sun-core";
  sun.appendChild(core);

  // Create sun's surface layers
  const layers = 40;
  for (let i = 0; i < layers; i++) {
    const layer = document.createElement("div");
    layer.className = "sun-layer";

    const normalized = (i / (layers - 1)) * 2 - 1;
    const size = Math.sqrt(1 - normalized ** 2) * 100;
    const depth = normalized * 50;

    layer.style.width = `${size}%`;
    layer.style.height = `${size}%`;
    layer.style.transform = `translate(-50%, -50%) rotateX(60deg) translateZ(${depth}px)`;

    // Add solar flare effect
    const flareAngle = (i / layers) * 360;
    layer.style.background = `conic-gradient(
      from ${flareAngle}deg,
      rgba(255, 200, 0, 0.8) 0%,
      rgba(255, 100, 0, 0.9) 25%,
      rgba(255, 50, 0, 0.8) 50%,
      rgba(255, 100, 0, 0.9) 75%,
      rgba(255, 200, 0, 0.8) 100%
    )`;

    sun.appendChild(layer);
  }

  // Create orbiting planets
  const planets = [
    { size: 20, distance: 200, speed: 2.2, color: '#4facfe' },
    { size: 15, distance: 300, speed: 2.15, color: '#00f2fe' },
    { size: 25, distance: 400, speed: 2.1, color: '#a29bfe' }
  ];

  planets.forEach((planet, index) => {
    const planetElement = document.createElement("div");
    planetElement.className = "planet";
    planetElement.style.width = `${planet.size}px`;
    planetElement.style.height = `${planet.size}px`;
    planetElement.style.background = planet.color;
    planetElement.style.setProperty("--distance", `${planet.distance}px`);
    planetElement.style.setProperty("--speed", `${planet.speed}s`);
    planetElement.style.setProperty("--delay", `${index * 0.5}s`);
    container.appendChild(planetElement);
  });

  // Add stars
  for (let i = 0; i < 100; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.setProperty("--x", `${Math.random() * 100}%`);
    star.style.setProperty("--y", `${Math.random() * 100}%`);
    star.style.setProperty("--size", `${Math.random() * 3}px`);
    star.style.setProperty("--delay", `${Math.random() * 2}s`);
    container.appendChild(star);
  }

  // Animation
  let angle = 0;
  function animate() {
    angle += rotationSpeed;
    sun.style.transform = `rotateY(${angle}deg)`;
    requestAnimationFrame(animate);
  }
  animate();

  // Control listeners
  let rotationSpeed = 0.5;
  document.getElementById("speed").addEventListener("input", (e) => {
    rotationSpeed = e.target.value / 100;
  });

  document.getElementById("flares").addEventListener("input", (e) => {
    const intensity = e.target.value / 100;
    updateSolarFlares(intensity);
  });

  function updateSolarFlares(intensity) {
    const layers = document.querySelectorAll(".sun-layer");
    layers.forEach((layer, i) => {
      const opacity = 0.3 + (i / layers.length) * 0.7 * intensity;
      layer.style.opacity = opacity;
    });
  }

  // Theme toggle
  const themeToggle = document.querySelector(".theme-toggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    themeToggle.querySelector("i").classList.toggle("ri-sun-line");
    themeToggle.querySelector("i").classList.toggle("ri-moon-line");
  });
});