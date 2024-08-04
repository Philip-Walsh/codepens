let canvas;
let ctx;
let roomba;
let width;
let height;
let debug = false;
const obstacles = [];
const numObstacles = 5;

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
        ctx.fillStyle = "#000000";
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
        this.sensors = [0, Math.PI / 4, -Math.PI / 4];
        this.sensorLength = 40;
        this.followingWall = false;
        this.radius = 30;
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
                this.angle += Math.PI / 2;
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

        ctx.strokeStyle = "#FF0000";
        ctx.fillStyle = "#00FF00";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();

        if (debug) {
            this.drawDebugInfo();
        }

        ctx.restore();
    }

    drawDebugInfo() {
        this.sensors.forEach(offset => {
            const rayX = Math.cos(this.angle + offset) * this.sensorLength;
            const rayY = Math.sin(this.angle + offset) * this.sensorLength;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(rayX, rayY);
            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }
}

function setup() {
    canvas = document.getElementById("roomba");
    width = canvas.width;
    height = canvas.height;

    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        roomba = new Roomba(width / 2, height / 2);
        createObstacles();
        draw();
    }
    document.getElementById("toggleDebug").addEventListener("click", toggleDebug);
}

function createObstacles() {
    for (let i = 0; i < numObstacles; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const type = Math.random() > 0.5 ? "circle" : "rectangle";
        obstacles.push(new Obstacle(x, y, type));
    }
}

function draw() {
    if (!debug) {
        ctx.clearRect(0, 0, width, height);
    }

    roomba.draw();
    roomba.update();
    drawObstacles();

    requestAnimationFrame(draw);
}

function drawObstacles() {
    obstacles.forEach(obstacle => obstacle.draw());
}

function toggleDebug() {
    debug = !debug;
    console.log(`Debug mode: ${debug}`);
}

document.addEventListener("DOMContentLoaded", setup);
