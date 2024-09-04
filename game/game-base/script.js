let canvas;
let width;
let height;
let ctx;
let interval_id;
let step = 0;
let player = {
    x: 20,
    y: 20,
    size: 32,
    speed: 4,
    health: 100,
    loot: [],
    gold: 20,
    direction: 0,
    step: 0
};

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

document.addEventListener('DOMContentLoaded', init, false);


function gameLoop() {
    game();
    requestAnimationFrame(gameLoop);
}

function init() {
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;
    col = Math.floor(width / tileSize);
    row = Math.floor(height / tileSize);
  
    window.addEventListener('keydown', activate, false);
    window.addEventListener('keyup', deactivate, false);
    generateMap();
    // createChests();

    requestAnimationFrame(gameLoop);
}

function createChests() {
    for (let i = 0; i < 4; i++) {
        chests.push({
            x: getRandomNumber(32, width - 48),
            y: getRandomNumber(32, height - 48),
            gold: getRandomNumber(1, 100),
            open: 0
        });
    }
}

function generateMap() {
    for (let c = 0; c < col; c++) {
        map[c] = [];
        for (let r = 0; r < row; r++) {
            if (c === 0 || r === 0 || c === col - 1 || r === row - 1) {
                map[c][r] = '#BC9F8B';
            } else {
                let colors = ['#B5CFB7', '#CADABF', '#E7E8D8'];
                map[c][r] = colors[Math.floor(Math.random() * colors.length)];
            }
        }
    }
}

function drawMap() {
    for (let c = 0; c < col; c++) {
        for (let r = 0; r < row; r++) {
            ctx.fillStyle = map[c][r];
            ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
        }
    }
}

function game() {
    ctx.clearRect(0, 0, width, height);

   drawMap()

    // Draw chests
    chests.forEach(c => {
        ctx.fillStyle = c.open === 0 ? '#FFD700' : '#FF204E';
        ctx.fillRect(c.x, c.y, 32, 32);
    });

    // Draw player
    ctx.fillStyle = attack ? '#A0153E' : '#FF204E';
    ctx.beginPath();
    ctx.arc(player.x + 16, player.y + 16, 16, 0, Math.PI * 2);
    ctx.fill();

    // Player movement
    let speed = player.speed;
    if ((moveLeft || moveRight) && (moveUp || moveDown)) speed /= Math.sqrt(2);
    if (moveLeft && player.x > 0) player.x -= speed;
    if (moveRight && player.x + player.size < width) player.x += speed;
    if (moveUp && player.y > 0) player.y -= speed;
    if (moveDown && player.y + player.size < height) player.y += speed;
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