// Game state
let gameState = {
  size: 4,
  board: [],
  moveCount: 0,
  startTime: null,
  solvedImages: 0,
  timerInterval: null,
  debug: false,
  img: new Image(),
  baseColor: '#4c566a',
  timerActive: false
};

// DOM elements
const elements = {
  container: document.getElementById('puzzle-container'),
  debugMode: document.getElementById('debug-mode'),
  startButton: document.getElementById('start-button'),
  skipButton: document.getElementById('skip-button'),
  timerButton: document.getElementById('timer-button'),
  moveCount: document.getElementById('move-count'),
  timer: document.getElementById('timer'),
  winScreen: document.getElementById('win-screen'),
  winTime: document.getElementById('win-time'),
  winMoves: document.getElementById('win-moves'),
  shareX: document.getElementById('share-x'),
  shareBluesky: document.getElementById('share-bluesky'),
  newGameButton: document.getElementById('new-game-button')
};

// Initialize game
function initGame() {
  // Set up event listeners
  elements.startButton.addEventListener('click', startNewGame);
  elements.skipButton.addEventListener('click', skipImage);
  elements.debugMode.addEventListener('click', toggleDebugMode);
  elements.timerButton.addEventListener('click', toggleTimer);
  elements.newGameButton.addEventListener('click', startNewGame);
  elements.shareX.addEventListener('click', shareToX);
  elements.shareBluesky.addEventListener('click', shareToBluesky);
  
  // Start first game
  startNewGame();
}

// Start a new game
function startNewGame() {
  // Reset game state
  gameState.moveCount = 0;
  gameState.startTime = new Date();
  gameState.board = [];
  gameState.timerActive = false;
  
  // Update move count display
  elements.moveCount.textContent = '0';
  
  // Hide win screen
  elements.winScreen.classList.remove('active');
  
  // Reset timer
  clearInterval(gameState.timerInterval);
  elements.timer.textContent = '00:00';
  
  // Generate board
  for (let i = 0; i < gameState.size * gameState.size - 1; i++) {
    gameState.board.push(i + 1);
  }
  shuffle(gameState.board);
  gameState.board.push(null);
  
  // Set image source
  gameState.img.src = `https://picsum.photos/seed/${Math.random()}/400`;
  
  // Load image
  loadImage();
}

function loadImage() {
  if (elements.container) {
    elements.container.classList.add('loading');
  }
  
  gameState.img.onload = () => {
    if (elements.container) {
      elements.container.classList.remove('loading');
      drawBoard();
    }
  };
  
  gameState.img.onerror = () => {
    console.error('Failed to load image, using fallback');
    gameState.img.src = 'https://via.placeholder.com/400';
    if (elements.container) {
      elements.container.classList.remove('loading');
      drawBoard();
    }
  };
}

// Game Logic
function drawBoard() {
  if (!elements.container) return;
  
  elements.container.innerHTML = '';
  elements.container.style.gridTemplateColumns = `repeat(${gameState.size}, 1fr)`;
  elements.container.style.gridTemplateRows = `repeat(${gameState.size}, 1fr)`;
  
  gameState.board.forEach((num, idx) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    
    if (num === null) {
      tile.classList.add('empty');
    } else {
      const row = Math.floor((num - 1) / gameState.size);
      const col = (num - 1) % gameState.size;
      
      if (gameState.img.complete) {
        tile.style.backgroundImage = `url(${gameState.img.src})`;
        tile.style.backgroundPosition = `${(-col * 100) / (gameState.size - 1)}% ${
          (-row * 100) / (gameState.size - 1)
        }%`;
        tile.style.backgroundSize = `${gameState.size * 100}px ${gameState.size * 100}px`;
      } else {
        tile.style.backgroundColor = gameState.baseColor;
      }

      if (gameState.debug) {
        // Add number overlay
        const numberOverlay = document.createElement('div');
        numberOverlay.className = 'number-overlay';
        numberOverlay.textContent = num;
        tile.appendChild(numberOverlay);
      }
    }
    
    tile.addEventListener('click', () => handleMove(idx));
    elements.container.appendChild(tile);
  });
}

function handleMove(clickedIndex) {
  const emptyIndex = gameState.board.indexOf(null);
  const tileElement = elements.container.children[clickedIndex];
  const emptyTile = elements.container.children[emptyIndex];

  if (clickedIndex !== emptyIndex) {
    tileElement.classList.add('clicked');
    // Add move penalty when debug mode is active
    gameState.moveCount += gameState.debug ? 2 : 1;
    elements.moveCount.textContent = gameState.moveCount;

    [gameState.board[clickedIndex], gameState.board[emptyIndex]] = [
      gameState.board[emptyIndex],
      gameState.board[clickedIndex]
    ];

    setTimeout(() => {
      drawBoard();
      tileElement.classList.remove('clicked');
      if (checkWin()) {
        showWin();
      }
    }, 300);
  }
}

function checkWin() {
  for (let i = 0; i < gameState.board.length - 1; i++) {
    if (gameState.board[i] !== i + 1) return false;
  }
  return true;
}

function showWin() {
  clearInterval(gameState.timerInterval);
  gameState.solvedImages++;
  
  // Update win screen stats
  elements.winTime.textContent = formatTime(Math.floor((new Date() - gameState.startTime) / 1000));
  elements.winMoves.textContent = gameState.moveCount;
  
  // Show win screen
  elements.winScreen.classList.add('active');
}

// Timer functions
function toggleTimer() {
  gameState.timerActive = !gameState.timerActive;
  
  if (gameState.timerActive) {
    startTimer();
  } else {
    clearInterval(gameState.timerInterval);
  }
}

function startTimer() {
  clearInterval(gameState.timerInterval);
  gameState.startTime = new Date();
  gameState.timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const elapsed = Math.floor((new Date() - gameState.startTime) / 1000);
  elements.timer.textContent = formatTime(elapsed);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Toggle debug mode
function toggleDebugMode() {
  gameState.debug = !gameState.debug;
  elements.debugMode.classList.toggle('active');
  drawBoard();
}

// Skip current image
function skipImage() {
  gameState.moveCount += 10;
  elements.moveCount.textContent = gameState.moveCount;
  startNewGame();
}

// Social sharing
function shareToX() {
  const time = formatTime(Math.floor((new Date() - gameState.startTime) / 1000));
  const text = `I solved the sliding puzzle in ${time} with ${gameState.moveCount} moves! Can you beat my score?`;
  const url = window.location.href;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

function shareToBluesky() {
  const time = formatTime(Math.floor((new Date() - gameState.startTime) / 1000));
  const text = `I solved the sliding puzzle in ${time} with ${gameState.moveCount} moves! Can you beat my score?`;
  const url = window.location.href;
  const shareUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(text + ' ' + url)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

// Utility Functions
function shuffle(array) {
  let n = array.length;
  while (n) {
    const i = Math.floor(Math.random() * n--);
    [array[n], array[i]] = [array[i], array[n]];
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
