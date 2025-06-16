document.addEventListener("DOMContentLoaded", () => {
  const sphere = document.createElement("div");
  sphere.className = "sphere";
  document.body.appendChild(sphere);

  const layers = 50;
  const radius = 90; 

for (let i = 0; i < layers; i++) {
  const circle = document.createElement("div");
  circle.className = "circle";

  const normalized = (i / (layers - 1)) * 2 - 1;
  const size = Math.sqrt(1 - normalized ** 2) * 100;
  const depth = normalized * radius;

  circle.style.width = `${size}%`;
  circle.style.height = `${size}%`;
  // circle.style.opacity = 0.2 + (i / layers) * 0.8;
  circle.style.transform = `rotateX(60deg) translateZ(${depth}px)`;

  sphere.appendChild(circle);
}
});