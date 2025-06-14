function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function drawSierpinski(container, x, y, size, depth) {
  if (depth === 0) return;

  const triangle = document.createElement('div');
  triangle.className = 'triangle';
  triangle.style.left = `${x - size / 2}px`;
  triangle.style.top = `${y}px`;
  triangle.style.borderLeftWidth = `${size / 2}px`;
  triangle.style.borderRightWidth = `${size / 2}px`;
  triangle.style.borderBottomWidth = `${(Math.sqrt(3) / 2) * size}px`;
  triangle.style.borderBottomColor = getRandomColor();
  triangle.style.borderLeftColor = 'transparent';
  triangle.style.borderRightColor = 'transparent';

  container.appendChild(triangle);

  const newSize = size / 2;
  const height = (Math.sqrt(3) / 2) * newSize;

  drawSierpinski(container, x, y, newSize, depth - 1);
  drawSierpinski(container, x - newSize / 2, y + height, newSize, depth - 1);
  drawSierpinski(container, x + newSize / 2, y + height, newSize, depth - 1);
}

const container = document.getElementById('sierpinski-container');
const size = 600;
const depth = 6;
const initialX = size / 2;
const initialY = 0;

drawSierpinski(container, initialX, initialY, size, depth);
