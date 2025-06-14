class MazeGame {
  constructor(canvasId, outcomeListId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.outcomeList = document.getElementById(outcomeListId);

    this.MAZE_ROWS = 16;
    this.MAZE_COLS = 16;
    this.CELL_SIZE = 32;
    this.CHAR_SIZE = 1;
    this.charEmoji = '🐢';
    this.wallColor = '#131842';
    this.bgColor = '#FBF6E2';
    this.exitEmoji = '🏁';

    this.initializeGame();
    this.drawMaze();
    this.drawCharacter();

    document.addEventListener('keydown', e => this.handleKeydown(e));
  }

  initializeGame() {
    this.maze = this.generateRandomMaze(this.MAZE_ROWS, this.MAZE_COLS);
    this.charX = this.MAZE_COLS - this.CHAR_SIZE - 1;
    this.charY = Math.floor(this.MAZE_ROWS / 2);
    this.exitX = 0;
    this.exitY = Math.floor(this.MAZE_ROWS / 2);
    this.startTime = null;
  }

  generateRandomMaze(rows, cols) {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() > 0.7 ? 1 : 0))
    );
  }

  drawMaze() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.MAZE_ROWS; i++) {
      for (let j = 0; j < this.MAZE_COLS; j++) {
        this.ctx.fillStyle = this.maze[i][j] === 1 ? this.wallColor : this.bgColor;
        this.ctx.fillRect(j * this.CELL_SIZE, i * this.CELL_SIZE, this.CELL_SIZE, this.CELL_SIZE);
      }
    }

    // Draw the exit emoji
    this.ctx.fillStyle = this.bgColor;
    this.ctx.font = `${this.CELL_SIZE}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      this.exitEmoji,
      this.exitX * this.CELL_SIZE + this.CELL_SIZE / 2,
      this.exitY * this.CELL_SIZE + this.CELL_SIZE / 2
    );
  }

  drawCharacter() {
    this.ctx.font = `${this.CELL_SIZE}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      this.charEmoji,
      this.charX * this.CELL_SIZE + this.CELL_SIZE / 2,
      this.charY * this.CELL_SIZE + this.CELL_SIZE / 2
    );
  }

  moveCharacter(dx, dy) {
    const canMove = (dx, dy) =>
      this.charY + dy >= 0 &&
      this.charY + dy <= this.MAZE_ROWS - this.CHAR_SIZE &&
      this.charX + dx >= 0 &&
      this.charX + dx <= this.MAZE_COLS - this.CHAR_SIZE &&
      this.maze[this.charY + dy][this.charX + dx] !== 1;

    if (canMove(dx, dy)) {
      this.charX += dx;
      this.charY += dy;
    } else {
      this.handleOutcome('die');
      return;
    }

    if (this.charX === this.exitX && this.charY === this.exitY) {
      this.handleOutcome('win');
      return;
    }

    this.drawMaze();
    this.drawCharacter();
  }

  handleKeydown(e) {
    if (!this.startTime) {
      this.startTime = new Date().getTime();
    }

    switch (e.key) {
      case 'ArrowUp':
        this.moveCharacter(0, -1);
        break;
      case 'ArrowDown':
        this.moveCharacter(0, 1);
        break;
      case 'ArrowLeft':
        this.moveCharacter(-1, 0);
        break;
      case 'ArrowRight':
        this.moveCharacter(1, 0);
        break;
    }
  }
  handleOutcome(outcome) {
    const endTime = new Date().getTime();
    const timeElapsed = (endTime - this.startTime) / 1000;

    const outcomeItem = document.createElement('li');
    outcomeItem.textContent = `${timeElapsed.toFixed(2)}s - You ${outcome}`;
    outcomeItem.classList.add(outcome);

    this.outcomeList.appendChild(outcomeItem);

    this.startTime = null;
    this.initializeGame();
    this.drawMaze();
    this.drawCharacter();
  }
}

new MazeGame('mazeCanvas', 'outcomeList');
