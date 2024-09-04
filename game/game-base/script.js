let canvas;
let width;
let height;
let ctx;
let interval_id;
let step = 0;
let player;



let chests = [];

let col = 15;
let row = 10;
let map = [];

let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let attack = false;

let tileSize = 32;
let gameMap;

document.addEventListener('DOMContentLoaded', init, false);
document.getElementById('resetButton').addEventListener('click', resetGame);

function resetGame() {
    chests = [];
    player = new Player(Math.round(width/2), Math.round(height/2), 32, 4, 100, 20, 0, 0);
    gameMap = new Map(col, row, tileSize);
    createChests();
}

function init() {
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;
    player = new Player( Math.round(width/2),  Math.round(height/2), 32, 4, 100, 20, 0, 0);
    col = Math.floor(width / tileSize);
    row = Math.floor(height / tileSize);

    window.addEventListener('keydown', activate, false);
    window.addEventListener('keyup', deactivate, false);
    gameMap = new Map(col, row, tileSize);

    createChests();
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    game();
    requestAnimationFrame(gameLoop);
}

function game() {
    ctx.clearRect(0, 0, width, height);

    gameMap.draw()

    chests.forEach(c => {
        c.draw();
    });

    player.draw();
    player.move();
    player.interact();
}



function createChests(chestCount = 4) {
    for (let i = 0; i < chestCount; i++) {
        chests.push(new Chest());
    }
}


function activate(event) {
    let keyCode = event.keyCode;
    switch (keyCode) {
        case 38: case 87: moveUp = true; break;
        case 40: case 83: moveDown = true; break;
        case 37: case 65: moveLeft = true; break;
        case 39: case 68: moveRight = true; break;
        case 17: case 81: attack = true; break;
    }
}

function deactivate(event) {
    let keyCode = event.keyCode;
    switch (keyCode) {
        case 38: case 87: moveUp = false; break;
        case 40: case 83: moveDown = false; break;
        case 37: case 65: moveLeft = false; break;
        case 39: case 68: moveRight = false; break;
        case 17: case 81: attack = false; break;
    }
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


class Player {
    constructor(x, y, size, speed, health, gold, direction, step) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.health = health;
        this.gold = gold;
        this.direction = direction;
        this.step = step;
        this.attacked = false;
    }

    draw() {
        ctx.fillStyle = attack ? '#A0153E' : '#FF204E';
        ctx.beginPath();
        ctx.arc(this.x + 16, this.y + 16, 16, 0, Math.PI * 2);
        ctx.fill();
    }
    move() {
        let speed = player.speed;
        if ((moveLeft || moveRight) && (moveUp || moveDown)) speed /= Math.sqrt(2);
        if (moveLeft && this.x > 0) this.x -= speed;
        if (moveRight && this.x + this.size < width) this.x += speed;
        if (moveUp && this.y > 0) this.y -= speed;
        if (moveDown && this.y + this.size < height) this.y += speed;
    }
    interact() {
        if (attack) {
            chests.forEach(chest => {
                const isColliding =
                    this.x < chest.x + tileSize &&
                    this.x + this.size > chest.x &&
                    this.y < chest.y + tileSize &&
                    this.y + this.size > chest.y;

                if (isColliding) {
                    const goldFound = chest.open();
                    this.gold += goldFound;
                    console.log(`Gold found: ${goldFound}`);
                    console.log(`Total gold: ${this.gold}`);
                }
            });
        }
    }
}

class Chest {
    constructor(x, y, gold) {
        this.x = x || Math.floor(Math.random() * col) * tileSize;
        this.y = y || Math.floor(Math.random() * row) * tileSize;
        this._gold = gold ||getRandomNumber(1, 10);
        this._open = false;
    }
    draw() {
        ctx.fillStyle = this._open ? '#A04747' : '#EEDF7A';
        ctx.fillRect(this.x, this.y, 32, 32);
    }
    open() {
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
    constructor(col, row, tileSize) {
        this.col = col;
        this.row = row;
        this.tileSize = tileSize;
        this.map = [];
        this.generate();
    }

    generate() {
        for (let c = 0; c < this.col; c++) {
            this.map[c] = [];
            for (let r = 0; r < this.row; r++) {
                if (c === 0 || r === 0 || c === this.col - 1 || r === this.row - 1) {
                    this.map[c][r] = '#BC9F8B';
                } else {
                    let colors = ['#B5CFB7', '#CADABF', '#E7E8D8'];
                    this.map[c][r] = colors[Math.floor(Math.random() * colors.length)];
                }
            }
        }
    }

    draw() {
        for (let c = 0; c < this.col; c++) {
            for (let r = 0; r < this.row; r++) {
                ctx.fillStyle = this.map[c][r];
                ctx.fillRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
            }
        }
    }
}
