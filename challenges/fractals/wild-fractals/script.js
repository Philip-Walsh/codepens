const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 900;
canvas.height = 900;

let iteration = 10;
let angle = Math.PI / 2;
let size = 100;
let animationSpeed = 0.1;
let animationDelay = 50;
let animationId;
let magicAngle = 1;
let strokeStyle = '#f6b73c';

function drawTree(x, y, size, angle, iteration) {
  if (iteration === 0) {
    return;
  }

  const nextSize = (size * Math.sqrt(2)) / 2;
  const x1 = x + size * Math.cos(angle * magicAngle);
  const y1 = y - size * Math.sin(angle * magicAngle);
  ctx.strokeStyle = strokeStyle;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x1, y1);
  ctx.stroke();

  const angle1 = angle - Math.PI / 4;
  const angle2 = angle + Math.PI / 4;

  drawTree(x1, y1, nextSize, angle1, iteration - 1);
  drawTree(x1, y1, nextSize, angle2, iteration - 1);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const startX = canvas.width / 2;
  const startY = canvas.height / 2;

  drawTree(startX, startY, size, angle, iteration);
  // angle += (animationSpeed); // Increment the angle for animation

  animationId = requestAnimationFrame(animate);
}

function resetAnimation() {
  cancelAnimationFrame(animationId);
  animate();
}

document.getElementById('iteration').addEventListener('input', function () {
  iteration = this.valueAsNumber;
  resetAnimation();
});

document.getElementById('angle').addEventListener('input', function () {
  magicAngle = this.valueAsNumber;
  resetAnimation();
});
document.getElementById('size').addEventListener('input', function () {
  size = this.valueAsNumber;
  resetAnimation();
});
document.getElementById('color').addEventListener('input', function () {
  strokeStyle = this.value;
  document.querySelector(':root').style.setProperty('--color', this.value);
  resetAnimation();
});

resetAnimation();
