let canvas;
let ctx;
let roomba;
let width;
let height;
let debug = false;
const obstacles = [];
const numObstacles = 5;

let defaultRoombaOutlineColor = "#155263";
let defaultRoombaFillColor = "#ff6f3c";
let defaultRoombaRayColor = "#ff9a3c";
let floorColor = "#282c34";
let obstacleColor = "#ffc93c";

function setup() {
    canvas = document.getElementById("roomba");
    width = canvas.width;
    height = canvas.height;

    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        roomba = new Roomba(width / 2, height / 2);
        draw();
    }

    document.getElementById("toggleDebug").addEventListener("click", toggleDebug);
    document.getElementById("addObstacle").addEventListener("click", addObstacle);
    document.getElementById("speedControl").addEventListener("input", updateSpeed);
    // document.getElementById("resetSimulation").addEventListener("click", resetSimulation);

    // document.getElementById("floorColor").addEventListener("input", updateFloorColor);
    // document.getElementById("obstacleColor").addEventListener("input", updateObstacleColor);

    // document.getElementById("fillColor").addEventListener("input", () => updateRoombaColor("fillColor"));
    // document.getElementById("outlineColor").addEventListener("input", () => updateRoombaColor("outlineColor"));
    // document.getElementById("rayColor").addEventListener("input", () => updateRoombaColor("rayColor"));
}

function updateFloorColor() {
    floorColor = document.getElementById("floorColor").value;
    draw();
}

function updateObstacleColor() {
    obstacleColor = document.getElementById("obstacleColor").value;
}

function updateRoombaColor(property) {
    const colorValue = document.getElementById(property).value;
    if (roomba) {
        roomba.colors[property] = colorValue;
    }
}

class Obstacle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        if (type === "circle") {
            this.radius = Math.random() * 30 + 10;
        } else {
            this.width = Math.random() * 60 + 20;
            this.height = Math.random() * 60 + 20;
        }
    }

    draw() {
        ctx.fillStyle = obstacleColor;
        if (this.type === "circle") {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    isPointInside(x, y) {
        if (this.type === "circle") {
            const dx = x - this.x;
            const dy = y - this.y;
            return dx * dx + dy * dy <= this.radius * this.radius;
        } else {
            return (
                x > this.x && x < this.x + this.width &&
                y > this.y && y < this.y + this.height
            );
        }
    }

    isCollision(x, y, radius) {
        if (this.type === "circle") {
            const dx = x - this.x;
            const dy = y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < this.radius + radius;
        } else {
            return (
                x + radius > this.x && x - radius < this.x + this.width &&
                y + radius > this.y && y - radius < this.y + this.height
            );
        }
    }
}

class Roomba {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 2;
        this.angle = Math.random() * (Math.PI * 2);
        this.radius = 20;
        this.sensors = [0, Math.PI / 4, -Math.PI / 4];
        this.sensorLength = 30;
        this.followingWall = false;

        this.colors = {
            outlineColor: defaultRoombaOutlineColor,
            fillColor: defaultRoombaFillColor,
            rayColor: defaultRoombaRayColor
        }
    }

    update() {
        this.updateVelocity();
        this.updatePosition();
        this.checkCollisions();
        this.makeDecision();
    }

    updateVelocity() {
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
    }

    updatePosition() {
        this.x += this.velocityX;
        this.y += this.velocityY;

        this.avoidWalls();
    }

    checkCollisions() {
        obstacles.forEach(obstacle => {
            if (obstacle.isCollision(this.x, this.y, this.radius)) {
                const newAngle = Math.atan2(this.y - obstacle.y, this.x - obstacle.x);
                this.angle = newAngle + Math.PI / 2;
                this.updateVelocity();
            }
        });
    }

    makeDecision() {
        const rayHits = this.sensors.map((offset) => this.castRay(this.angle + offset));
        const wallDetected = rayHits.some(hit => hit);

        if (wallDetected) {
            this.followWall(rayHits);
        } else {
            this.doLaps();
        }
    }

    followWall(rayHits) {
        if (rayHits[1] || rayHits[2]) {
            this.angle -= Math.PI / 18;
        } else if (rayHits[0]) {
            this.angle += Math.PI / 18;
        }
        this.followingWall = true;
    }

    doLaps() {
        if (this.followingWall) {
            this.angle += Math.PI / 36;
        } else {
            this.angle += Math.random() * Math.PI / 18 - Math.PI / 36;
        }
        this.followingWall = false;
    }

    avoidWalls() {
        if (this.x < 0 || this.x > width) {
            this.angle = Math.PI - this.angle;
        }
        if (this.y < 0 || this.y > height) {
            this.angle = -this.angle;
        }
    }

    castRay(angle) {
        const rayEndX = this.x + Math.cos(angle) * this.sensorLength;
        const rayEndY = this.y + Math.sin(angle) * this.sensorLength;

        if (rayEndX > width || rayEndX < 0 || rayEndY > height || rayEndY < 0) {
            return true;
        }

        return obstacles.some(obstacle => obstacle.isPointInside(rayEndX, rayEndY));
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (debug) {
            this.drawDebugInfo();
        }

        ctx.strokeStyle = this.colors.outlineColor;
        ctx.fillStyle = this.colors.fillColor;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();

        ctx.restore();
    }

    drawDebugInfo() {
        this.sensors.forEach(offset => {
            const rayX = Math.cos(this.angle + offset) * this.sensorLength;
            const rayY = Math.sin(this.angle + offset) * this.sensorLength;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(rayX, rayY);
            ctx.strokeStyle = this.colors.rayColor;
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }
}

function addObstacle() {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const type = Math.random() > 0.5 ? "circle" : "rectangle";
    obstacles.push(new Obstacle(x, y, type));
}

function draw() {
    if (!debug) {
        ctx.fillStyle = floorColor;
        ctx.fillRect(0, 0, width, height);
    }

    roomba.draw();
    roomba.update();
    drawObstacles();

    requestAnimationFrame(draw);
}

function resetSimulation() {
    ctx.clearRect(0, 0, width, height);
    obstacles.length = 0;
    roomba = new Roomba(width / 2, height / 2);
    draw();
}

function updateSpeed(event) {
    const speed = parseFloat(event.target.value);
    document.getElementById("speedValue").textContent = speed;
    roomba.speed = speed;
}

function drawObstacles() {
    obstacles.forEach(obstacle => obstacle.draw());
}

function toggleDebug() {
    debug = !debug;
    console.log(`Debug mode: ${debug}`);
}

document.addEventListener("DOMContentLoaded", setup);
