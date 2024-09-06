let canvas: HTMLCanvasElement;
let width: number;
let height: number;
let ctx: CanvasRenderingContext2D;
let interval_id: number;
let step: number = 0;
let player: Player;
let camera: Camera;
let chests: Chest[] = [];

let col: number = 15;
let row: number = 10;
let map: string[][] = [];

let moveLeft: boolean = false;
let moveRight: boolean = false;
let moveUp: boolean = false;
let moveDown: boolean = false;
let attack: boolean = false;

let tileSize: number = 32;
let gameMap: Map;

const MAP_MULTIPLIER = 3;
let MAP_WIDTH;
let MAP_HEIGHT;
let lastRenderTime;

document.addEventListener("DOMContentLoaded", init, false);
document.getElementById("resetButton")?.addEventListener("click", resetGame);

function resetGame(): void {
  chests = [];
  player = new Player(
    Math.round(width / 2),
    Math.round(height / 2),
    32,
    20, // SPEED
    100,
    20,
    0,
    0
  );
  gameMap = new Map(col, row, tileSize);
  createChests();
}

function init(): void {
  canvas = document.querySelector("canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d")!;
  width = canvas.width;
  height = canvas.height;
  MAP_WIDTH = MAP_MULTIPLIER * width;
  MAP_HEIGHT = MAP_MULTIPLIER * height;
  col = Math.floor(MAP_WIDTH / tileSize);
  row = Math.floor(MAP_HEIGHT / tileSize);

  player = new Player(
    Math.round(width / 2),
    Math.round(height / 2),
    32,
    6,
    100,
    0,
    0,
    0
  );
  camera = new Camera(width, height);

  window.addEventListener("keydown", activate, false);
  window.addEventListener("keyup", deactivate, false);
  gameMap = new Map(col, row, tileSize);

  createChests();
  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp: number): void {
  const deltaTime = (timestamp - lastRenderTime) / 50;
  lastRenderTime = timestamp;
  game(deltaTime);
  requestAnimationFrame(gameLoop);
}

function game(deltaTime: number): void {
  ctx.clearRect(0, 0, width, height);

  camera.update(player.x, player.y, MAP_WIDTH, MAP_HEIGHT);

  camera.apply(ctx);

  gameMap.draw(camera);

  chests.forEach((c) => c.draw());
  player.updateTimers(deltaTime * 1000);
  player.move(deltaTime);
  player.draw();
  player.interact();

  camera.restore(ctx);
  drawUI();
}

function drawUI(): void {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#000";

  ctx.fillText(`Health: ${player.health}`, 20, 30);

  ctx.fillText(`Gold: ${player.gold}`, 20, 60);

  if (player._dash.cooldownTime > 0) {
    ctx.fillText(
      `Dash Cooldown: ${(player._dash.cooldownTime / 1000).toFixed(1)}s`,
      20,
      90
    );
  } else {
    ctx.fillText("Dash Ready!", 20, 90);
  }
}

function createChests(chestCount: number = 4): void {
  for (let i = 0; i < chestCount; i++) {
    chests.push(new Chest());
  }
}

function activate(event: KeyboardEvent): void {
  let keyCode: number = event.keyCode;
  switch (keyCode) {
    case 38:
    case 87:
      moveUp = true;
      break;
    case 40:
    case 83:
      moveDown = true;
      break;
    case 37:
    case 65:
      moveLeft = true;
      break;
    case 39:
    case 68:
      moveRight = true;
      break;
    case 17:
    case 81:
      attack = true;
      break;
    case 32:
      player.dash();
      break;
  }
}

function deactivate(event: KeyboardEvent): void {
  let keyCode: number = event.keyCode;
  switch (keyCode) {
    case 38:
    case 87:
      moveUp = false;
      break;
    case 40:
    case 83:
      moveDown = false;
      break;
    case 37:
    case 65:
      moveLeft = false;
      break;
    case 39:
    case 68:
      moveRight = false;
      break;
    case 17:
    case 81:
      attack = false;
      break;
  }
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Player {
  x: number;
  y: number;
  size: number;
  speed: number;
  health: number;
  gold: number;
  direction: number;
  step: number;
  attacked: boolean;
  _dash: {
    isDashing: boolean;
    dashSpeed: number;
    durationMs: number;
    cooldownMs: number;
    dashTime: number;
    cooldownTime: number;
  };

  constructor(
    x: number,
    y: number,
    size: number,
    speed: number,
    health: number,
    gold: number,
    direction: number,
    step: number
  ) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.health = health;
    this.gold = gold;
    this.direction = direction;
    this.step = step;
    this.attacked = false;
    this._dash = {
      isDashing: false,
      dashSpeed: 10,
      durationMs: 2000,
      cooldownMs: 10000,
      dashTime: 0,
      cooldownTime: 0
    };
  }

  draw(): void {
    ctx.fillStyle = attack ? "#A0153E" : "#FF204E";
    ctx.beginPath();
    ctx.arc(this.x + 16, this.y + 16, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  dash(): void {
    if (!this._dash.isDashing && this._dash.cooldownTime <= 0) {
      this._dash.isDashing = true;
      this._dash.dashTime = this._dash.durationMs;
      this._dash.cooldownTime = this._dash.cooldownMs;
    }
  }
  updateTimers(deltaTime: number): void {
    if (this._dash.isDashing) {
      this._dash.dashTime -= deltaTime;
      if (this._dash.dashTime <= 0) {
        this._dash.isDashing = false;
      }
    }

    if (this._dash.cooldownTime > 0) {
      this._dash.cooldownTime -= deltaTime;
    }
  }

  move(deltaTime: number): void {
    // TODO: fix bug with holding down dash constant in one direction     
    let currentSpeed = this.speed;
    if (this._dash.isDashing) {
      currentSpeed = this._dash.dashSpeed * this.speed;
    }
    if ((moveLeft || moveRight) && (moveUp || moveDown)) {
      currentSpeed /= Math.sqrt(2);
    }

    if (moveLeft && this.x > 0) this.x -= currentSpeed * deltaTime;
    if (moveRight && this.x + this.size < MAP_WIDTH)
      this.x += currentSpeed * deltaTime;
    if (moveUp && this.y > 0) this.y -= currentSpeed * deltaTime;
    if (moveDown && this.y + this.size < MAP_HEIGHT)
      this.y += currentSpeed * deltaTime;

    this.x = Math.max(0, Math.min(this.x, MAP_WIDTH - this.size));
    this.y = Math.max(0, Math.min(this.y, MAP_HEIGHT - this.size));
  }

  interact(): void {
    if (attack) {
      chests.forEach((chest) => {
        const isColliding =
          this.x < chest.x + tileSize &&
          this.x + this.size > chest.x &&
          this.y < chest.y + tileSize &&
          this.y + this.size > chest.y;

        if (isColliding) {
          const goldFound = chest.open();
          this.gold += goldFound;
        }
      });
    }
  }
}

class Chest {
  x: number;
  y: number;
  private _gold: number;
  private _open: boolean;

  constructor(x?: number, y?: number, gold?: number) {
    this.x = x || Math.floor(Math.random() * col) * tileSize;
    this.y = y || Math.floor(Math.random() * row) * tileSize;
    this._gold = gold || getRandomNumber(1, 10);
    this._open = false;
  }

  draw(): void {
    ctx.fillStyle = this._open ? "#A04747" : "#EEDF7A";
    ctx.fillRect(this.x, this.y, 32, 32);
  }

  open(): number {
    if (this._open) {
      return 0;
    }
    let gold = this._gold;
    this._gold = 0;
    this._open = true;
    return gold;
  }
}

class Map {
  col: number;
  row: number;
  tileSize: number;
  map: string[][];

  constructor(col: number, row: number, tileSize: number) {
    this.col = col;
    this.row = row;
    this.tileSize = tileSize;
    this.map = [];
    this.generate();
  }

  generate(): void {
    for (let c = 0; c < this.col; c++) {
      this.map[c] = [];
      for (let r = 0; r < this.row; r++) {
        if (c === 0 || r === 0 || c === this.col - 1 || r === this.row - 1) {
          this.map[c][r] = "#BC9F8B";
        } else {
          let colors = ["#B5CFB7", "#CADABF", "#E7E8D8"];
          this.map[c][r] = colors[Math.floor(Math.random() * colors.length)];
        }
      }
    }
  }
  draw(camera: Camera): void {
    const startCol = Math.max(0, Math.floor(camera.x / this.tileSize));
    const endCol = Math.min(
      this.col,
      Math.ceil((camera.x + camera.width) / this.tileSize)
    );

    const startRow = Math.max(0, Math.floor(camera.y / this.tileSize));
    const endRow = Math.min(
      this.row,
      Math.ceil((camera.y + camera.height) / this.tileSize)
    );

    for (let c = startCol; c < endCol; c++) {
      for (let r = startRow; r < endRow; r++) {
        ctx.fillStyle = this.map[c][r];
        const x = c * this.tileSize;
        const y = r * this.tileSize;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
      }
    }
  }
}

class Camera {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
  }

  update(
    targetX: number,
    targetY: number,
    mapWidth: number,
    mapHeight: number
  ): void {
    const smoothing = 0.5;
    const targetXCenter = targetX - this.width / 2;
    const targetYCenter = targetY - this.height / 2;

    this.x +=
      (Math.max(0, Math.min(targetXCenter, mapWidth - this.width)) - this.x) *
      smoothing;
    this.y +=
      (Math.max(0, Math.min(targetYCenter, mapHeight - this.height)) - this.y) *
      smoothing;

    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
  }

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(-this.x, -this.y);
  }

  restore(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }
}
