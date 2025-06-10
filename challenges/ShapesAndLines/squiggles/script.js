let canvas = document.getElementById('squigle-game-of-life');
let ctx = canvas ? canvas.getContext('2d') : null;
let squiggles = [];
let isMenuOpen = false;
let menu = null;
let menuX = 0;
let menuY = 0;

// Statistics tracking
let statistics = {
    generation: 1,
    totalBirths: 0,
    totalDeaths: 0,
    populationHistory: [],
    maxPopulation: 0
};

let chartCtx = null;

console.log('Canvas element:', canvas);
console.log('Canvas context:', ctx);

if (!canvas) {
    console.error('Canvas element not found! Make sure the HTML has an element with id="squigle-game-of-life"');
}

class Squiggle {
    constructor(x, y, dna = null) {
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.hits = 0;
        this.maxHits = 8;
        this.cooldown = 0;
        this.cooldownTime = 500;
        this.reproductionCooldown = 0;
        this.reproductionTime = 2000;

        // DNA properties
        this.dna = dna || {
            speed: Math.random() * 2 + 0.5,
            length: Math.random() * 150 + 50,
            thickness: Math.random() * 8 + 1,
            amplitude: Math.random() * 40 + 5,
            frequency: Math.random() * 0.3 + 0.05,
            attraction: Math.random() * 2 - 1,
            mutationRate: Math.random() * 0.05,
            lifespan: 1000 + Math.random() * 2000,
            color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`
        };

        // Initialize physical properties
        this.speed = this.dna.speed;
        this.length = this.dna.length;
        this.segments = 20;
        this.points = [];
        this.attraction = this.dna.attraction;
        this.color = this.dna.color;
        this.thickness = this.dna.thickness;
        this.amplitude = this.dna.amplitude;
        this.frequency = this.dna.frequency;
        this.phase = Math.random() * Math.PI * 2;
        this.generation = 1; // Default generation
        this.initializePoints();
    }

    initializePoints() {
        this.points = [];
        for (let i = 0; i < this.segments; i++) {
            this.points.push({
                x: this.x - (i * (this.length / this.segments)),
                y: this.y,
                angle: this.angle
            });
        }
    }

    update(squiggles) {
        this.age++;
        if (this.age > this.dna.lifespan) return false;

        // Update cooldowns
        if (this.cooldown > 0) this.cooldown -= 16;
        if (this.reproductionCooldown > 0) this.reproductionCooldown -= 16;

        // Calculate forces from other squiggles
        let forceX = 0;
        let forceY = 0;
        let nearbyCount = 0;

        squiggles.forEach(other => {
            if (other === this) return;

            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 50 && this.cooldown <= 0 && other.cooldown <= 0) {
                this.hits++;
                other.hits++;
                this.cooldown = this.cooldownTime;
                other.cooldown = this.cooldownTime;

                // Check for reproduction
                if (this.reproductionCooldown <= 0 && other.reproductionCooldown <= 0 &&
                    this.hits >= 2 && other.hits >= 2 &&
                    squiggles.length < 100) {
                    this.attemptReproduction(other, squiggles);
                }

                // Bounce effect - gentle repulsion
                const bounceForce = 0.2;
                forceX -= (dx / distance) * bounceForce;
                forceY -= (dy / distance) * bounceForce;
            } else if (distance < 200 && distance > 0) {
                nearbyCount++;
                const force = (this.attraction * other.attraction) / (distance * distance) * 0.05;
                forceX += dx * force;
                forceY += dy * force;
            }
        });

        // Die if too crowded
        if (nearbyCount > 8) return false;

        // Update angle based on forces with dampening
        this.angle += (Math.random() - 0.5) * 0.05 + forceX * 0.05 + forceY * 0.05;

        // Update phase for oscillation (slower)
        this.phase += this.frequency * 0.5;

        // Move forward with subtle oscillation
        const baseSpeedX = Math.cos(this.angle) * this.speed;
        const baseSpeedY = Math.sin(this.angle) * this.speed;

        // Much gentler oscillation perpendicular to movement direction
        const perpX = -Math.sin(this.angle);
        const perpY = Math.cos(this.angle);
        const oscillation = Math.sin(this.phase) * this.amplitude * 0.02; // Much smaller oscillation

        // Update position smoothly
        this.x += baseSpeedX + perpX * oscillation;
        this.y += baseSpeedY + perpY * oscillation;

        // Smooth edge wrapping to prevent teleporting
        this.smoothWrap();

        // Update body segments smoothly
        this.updateSegments();

        return true;
    }

    smoothWrap() {
        // Much smaller margin to reduce visible jumps
        const margin = 20;

        if (this.x < -margin) {
            this.x = canvas.width + margin;
            // Update all segments to prevent disconnection
            this.initializePoints();
        } else if (this.x > canvas.width + margin) {
            this.x = -margin;
            this.initializePoints();
        }

        if (this.y < -margin) {
            this.y = canvas.height + margin;
            this.initializePoints();
        } else if (this.y > canvas.height + margin) {
            this.y = -margin;
            this.initializePoints();
        }
    }

    updateSegments() {
        // More gradual segment following for worm-like movement
        const segmentLength = this.length / this.segments;
        const followStrength = 0.15; // Slower, more natural following

        // Update first segment to follow head
        this.points[0].x = this.x;
        this.points[0].y = this.y;

        // Update remaining segments to follow smoothly with delay
        for (let i = 1; i < this.points.length; i++) {
            const dx = this.points[i - 1].x - this.points[i].x;
            const dy = this.points[i - 1].y - this.points[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > segmentLength) {
                // Move segment closer more gradually
                const moveRatio = (distance - segmentLength) / distance;
                this.points[i].x += dx * moveRatio * followStrength;
                this.points[i].y += dy * moveRatio * followStrength;
            }

            // Very subtle wave motion to segments (reduced significantly)
            const segmentPhase = this.phase - (i * 0.1); // Less phase offset
            const segmentWave = Math.sin(segmentPhase) * this.amplitude * 0.01 * (i / this.segments); // Much smaller wave

            // Apply wave perpendicular to segment direction
            if (i > 0) {
                const segmentAngle = Math.atan2(
                    this.points[i - 1].y - this.points[i].y,
                    this.points[i - 1].x - this.points[i].x
                );
                this.points[i].x += Math.sin(segmentAngle) * segmentWave;
                this.points[i].y -= Math.cos(segmentAngle) * segmentWave;
            }
        }
    }

    attemptReproduction(other, squiggles) {
        // Calculate DNA similarity
        const similarity = this.calculateDNASimilarity(other);
        const reproductionChance = similarity * 0.8; // 80% max chance
        const willReproduce = Math.random() < reproductionChance;

        if (willReproduce) {
            this.reproduce(other, squiggles);
        }
    }

    calculateDNASimilarity(other) {
        const genes = ['speed', 'length', 'thickness', 'amplitude', 'frequency', 'attraction'];
        let similarity = 0;

        genes.forEach(gene => {
            const max = Math.max(this.dna[gene], other.dna[gene]);
            const min = Math.min(this.dna[gene], other.dna[gene]);
            similarity += min / max;
        });

        return similarity / genes.length;
    }

    reproduce(other, squiggles) {
        this.reproductionCooldown = this.reproductionTime;
        other.reproductionCooldown = this.reproductionTime;

        const childDNA = this.mutateDNA(this.mixDNA(other));

        // Create two new squiggles
        const child1 = new Squiggle(this.x + 20, this.y, childDNA);
        const child2 = new Squiggle(other.x + 20, other.y, childDNA);
        child1.generation = Math.max(this.generation || 1, other.generation || 1) + 1;
        child2.generation = child1.generation;

        squiggles.push(child1);
        squiggles.push(child2);

        // Update statistics
        statistics.totalBirths += 2;
        statistics.generation = Math.max(statistics.generation, child1.generation);
    }

    mixDNA(other) {
        return {
            speed: (this.dna.speed + other.dna.speed) / 2,
            length: (this.dna.length + other.dna.length) / 2,
            thickness: (this.dna.thickness + other.dna.thickness) / 2,
            amplitude: (this.dna.amplitude + other.dna.amplitude) / 2,
            frequency: (this.dna.frequency + other.dna.frequency) / 2,
            attraction: (this.dna.attraction + other.dna.attraction) / 2,
            mutationRate: (this.dna.mutationRate + other.dna.mutationRate) / 2,
            lifespan: (this.dna.lifespan + other.dna.lifespan) / 2,
            color: this.mixColor(this.dna.color, other.dna.color)
        };
    }

    mutateDNA(dna) {
        const mutated = { ...dna };
        Object.keys(mutated).forEach(key => {
            if (key !== 'color' && Math.random() < dna.mutationRate) {
                const mutation = (Math.random() - 0.5) * 0.2; // ±10% mutation
                mutated[key] *= (1 + mutation);
            }
        });
        mutated.color = this.mutateColor(dna.color);
        return mutated;
    }

    mixColor(c1, c2) {
        const h1 = parseInt(c1.match(/hsl\((\d+),/)[1]);
        const h2 = parseInt(c2.match(/hsl\((\d+),/)[1]);
        const mixedHue = Math.floor((h1 + h2) / 2);
        return `hsl(${mixedHue}, 100%, 50%)`;
    }

    mutateColor(color) {
        const h = parseInt(color.match(/hsl\((\d+),/)[1]);
        const newHue = (h + Math.floor(Math.random() * 30 - 15)) % 360;
        return `hsl(${newHue}, 100%, 50%)`;
    }

    draw() {
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        // Draw smooth curve through points
        for (let i = 1; i < this.points.length - 2; i++) {
            const xc = (this.points[i].x + this.points[i + 1].x) / 2;
            const yc = (this.points[i].y + this.points[i + 1].y) / 2;
            ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
        }

        if (this.points.length > 2) {
            ctx.quadraticCurveTo(
                this.points[this.points.length - 2].x,
                this.points[this.points.length - 2].y,
                this.points[this.points.length - 1].x,
                this.points[this.points.length - 1].y
            );
        }

        // Draw squiggle with cooldown effect
        ctx.strokeStyle = this.cooldown > 0 ? 'rgba(255, 255, 255, 0.5)' : this.color;
        ctx.lineWidth = this.thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Draw hit count indicator
        const dotRadius = 4;
        const dotSpacing = 8;
        const startX = this.x - (dotSpacing * (this.hits - 1)) / 2;

        for (let i = 0; i < this.hits; i++) {
            ctx.beginPath();
            ctx.arc(startX + i * dotSpacing, this.y - 15, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = i === 0 ? '#ff0000' : i === 1 ? '#ffff00' : '#00ff00';
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw DNA indicator
        ctx.beginPath();
        ctx.arc(this.x, this.y - 25, 6, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw cooldown indicator
        if (this.cooldown > 0) {
            ctx.beginPath();
            ctx.arc(this.x, this.y - 35, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}

// Create menu container
const menuContainer = document.createElement('div');
menuContainer.id = 'menu-container';
menuContainer.style.position = 'fixed';
menuContainer.style.top = '10px';
menuContainer.style.left = '10px';
menuContainer.style.zIndex = '9999';
document.body.appendChild(menuContainer);

function createMenu() {
    // Remove any existing menu
    const existingMenu = document.getElementById('squiggle-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const menu = document.createElement('div');
    menu.id = 'squiggle-menu';
    menu.style.display = 'none';
    menu.style.position = 'fixed';
    menu.style.background = 'rgba(255, 255, 255, 0.95)';
    menu.style.padding = '15px';
    menu.style.borderRadius = '8px';
    menu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    menu.style.zIndex = '9999';
    menu.style.minWidth = '200px';
    menu.style.fontFamily = 'Arial, sans-serif';
    menu.style.pointerEvents = 'auto';

    const controls = [
        { name: 'amplitude', min: 0, max: 50, value: 20, step: 1 },
        { name: 'frequency', min: 0.01, max: 0.5, value: 0.2, step: 0.01 },
        { name: 'length', min: 20, max: 200, value: 100, step: 5 },
        { name: 'speed', min: 1, max: 5, value: 2, step: 0.1 },
        { name: 'thickness', min: 1, max: 10, value: 3, step: 0.5 }
    ];

    controls.forEach(control => {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';

        const label = document.createElement('label');
        label.textContent = control.name + ': ';
        label.style.display = 'inline-block';
        label.style.width = '80px';
        label.style.fontWeight = 'bold';

        const input = document.createElement('input');
        input.type = 'range';
        input.min = control.min;
        input.max = control.max;
        input.value = control.value;
        input.step = control.step;
        input.style.width = '150px';

        const value = document.createElement('span');
        value.textContent = control.value;
        value.style.marginLeft = '5px';
        value.style.minWidth = '30px';
        value.style.display = 'inline-block';

        input.oninput = () => {
            value.textContent = input.value;
        };

        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(value);
        menu.appendChild(div);
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '15px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Squiggle';
    addButton.style.flex = '1';
    addButton.style.padding = '8px';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '4px';
    addButton.style.background = '#4CAF50';
    addButton.style.color = 'white';
    addButton.style.cursor = 'pointer';
    addButton.onclick = () => {
        const inputs = menu.querySelectorAll('input[type="range"]');
        const dna = {
            speed: parseFloat(inputs[3].value) || 2,
            length: parseFloat(inputs[2].value) || 100,
            thickness: parseFloat(inputs[4].value) || 3,
            amplitude: parseFloat(inputs[0].value) || 20,
            frequency: parseFloat(inputs[1].value) || 0.1,
            attraction: Math.random() * 2 - 1,
            mutationRate: Math.random() * 0.05,
            lifespan: Math.random() * 1000 + 500,
            color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`
        };
        squiggles.push(new Squiggle(menuX, menuY, dna));
        menu.style.display = 'none';
        isMenuOpen = false;
    };

    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset All';
    resetButton.style.flex = '1';
    resetButton.style.padding = '8px';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '4px';
    resetButton.style.background = '#f44336';
    resetButton.style.color = 'white';
    resetButton.style.cursor = 'pointer';
    resetButton.onclick = () => {
        squiggles = [];
        init();
        menu.style.display = 'none';
        isMenuOpen = false;
    };

    buttonContainer.appendChild(addButton);
    buttonContainer.appendChild(resetButton);
    menu.appendChild(buttonContainer);
    menuContainer.appendChild(menu);
    return menu;
}

function init() {
    console.log('Initializing squiggles...');
    console.log('Canvas dimensions:', canvas ? `${canvas.width}x${canvas.height}` : 'Canvas not found');

    if (!canvas) {
        console.error('Cannot initialize squiggles - canvas not found');
        return;
    }

    // Create initial squiggles
    for (let i = 0; i < 10; i++) {
        squiggles.push(new Squiggle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }

    console.log('Created', squiggles.length, 'squiggles');

    if (!menu) {
        menu = createMenu();
    }
}

function updateStatistics() {
    const population = squiggles.length;

    // Update population history
    statistics.populationHistory.push(population);
    if (statistics.populationHistory.length > 100) {
        statistics.populationHistory.shift();
    }
    statistics.maxPopulation = Math.max(statistics.maxPopulation, population);

    // Calculate averages
    const avgSpeed = population > 0 ? squiggles.reduce((sum, s) => sum + s.speed, 0) / population : 0;
    const avgLength = population > 0 ? squiggles.reduce((sum, s) => sum + s.length, 0) / population : 0;

    // Update UI
    document.getElementById('populationCount').textContent = population;
    document.getElementById('generationCount').textContent = statistics.generation;
    document.getElementById('avgSpeed').textContent = avgSpeed.toFixed(1);
    document.getElementById('avgLength').textContent = avgLength.toFixed(0);
    document.getElementById('birthCount').textContent = statistics.totalBirths;
    document.getElementById('deathCount').textContent = statistics.totalDeaths;

    // Update chart
    drawPopulationChart();
}

function drawPopulationChart() {
    if (!chartCtx || statistics.populationHistory.length < 2) return;

    const width = chartCtx.canvas.width;
    const height = chartCtx.canvas.height;

    chartCtx.clearRect(0, 0, width, height);

    // Draw background grid
    chartCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    chartCtx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        chartCtx.beginPath();
        chartCtx.moveTo(0, y);
        chartCtx.lineTo(width, y);
        chartCtx.stroke();
    }

    // Draw population line
    if (statistics.populationHistory.length > 1) {
        chartCtx.strokeStyle = 'rgba(123, 211, 234, 0.8)';
        chartCtx.lineWidth = 2;
        chartCtx.beginPath();

        const maxPop = Math.max(...statistics.populationHistory, 1);
        const stepX = width / (statistics.populationHistory.length - 1);

        statistics.populationHistory.forEach((pop, i) => {
            const x = i * stepX;
            const y = height - (pop / maxPop) * height;

            if (i === 0) {
                chartCtx.moveTo(x, y);
            } else {
                chartCtx.lineTo(x, y);
            }
        });

        chartCtx.stroke();
    }
}

function gameLoop() {
    if (!ctx || !canvas) {
        console.error('Canvas or context not available');
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Count deaths for statistics
    const initialCount = squiggles.length;

    // Update and draw all squiggles
    squiggles = squiggles.filter(squiggle => {
        const shouldKeep = squiggle.update(squiggles);
        if (shouldKeep) {
            squiggle.draw();
        }
        return shouldKeep && squiggle.hits < squiggle.maxHits;
    });

    // Update death count
    const deathCount = initialCount - squiggles.length;
    if (deathCount > 0) {
        statistics.totalDeaths += deathCount;
    }

    // Update statistics every 60 frames (roughly once per second)
    if (Date.now() % 1000 < 16) {
        updateStatistics();
    }

    requestAnimationFrame(gameLoop);
}

// Update event listeners - wrapped in DOM ready check
function setupCanvasEventListeners() {
    if (!canvas) return;

    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();

        menuX = e.clientX;
        menuY = e.clientY;

        if (!menu) {
            menu = createMenu();
        }

        menu.style.left = menuX + 'px';
        menu.style.top = menuY + 'px';
        menu.style.display = 'block';
        isMenuOpen = true;
    });
}

document.addEventListener('click', (e) => {
    if (isMenuOpen && menu && !menu.contains(e.target)) {
        menu.style.display = 'none';
        isMenuOpen = false;
    }
});

// Add event listeners for controls
document.addEventListener('DOMContentLoaded', () => {
    canvas.width = window.innerWidth - 320; // Account for control panel
    canvas.height = window.innerHeight - 120; // Account for header and footer

    // Initialize chart context
    const chartCanvas = document.getElementById('populationChart');
    if (chartCanvas) {
        chartCtx = chartCanvas.getContext('2d');
    }

    // Rules toggle functionality
    const toggleRulesBtn = document.getElementById('toggleRules');
    const rulesContent = document.getElementById('rulesContent');

    if (toggleRulesBtn && rulesContent) {
        toggleRulesBtn.addEventListener('click', () => {
            rulesContent.classList.toggle('expanded');
            toggleRulesBtn.textContent = rulesContent.classList.contains('expanded') ? 'Hide Rules' : 'Show Rules';
        });
    }

    // Check if control elements exist
    const addSquigglesBtn = document.getElementById('addSquiggles');
    const resetAllBtn = document.getElementById('resetAll');

    if (addSquigglesBtn) {
        addSquigglesBtn.addEventListener('click', () => {
            const count = parseInt(document.getElementById('count').value) || 5;
            const dna = {
                speed: parseFloat(document.getElementById('speed').value) || 1,
                length: parseFloat(document.getElementById('length').value) || 100,
                thickness: parseFloat(document.getElementById('thickness').value) || 3,
                amplitude: parseFloat(document.getElementById('amplitude').value) || 20,
                frequency: parseFloat(document.getElementById('frequency').value) || 0.1,
                attraction: Math.random() * 2 - 1,
                mutationRate: Math.random() * 0.05,
                lifespan: Math.random() * 1000 + 500,
                color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`
            };

            for (let i = 0; i < count; i++) {
                const x = Math.random() * (canvas.width - 100) + 50;
                const y = Math.random() * (canvas.height - 100) + 50;
                squiggles.push(new Squiggle(x, y, dna));
            }
        });
    }

    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', () => {
            squiggles = [];
            init();
        });
    }

    // Update value displays for sliders
    document.querySelectorAll('input[type="range"]').forEach(input => {
        input.addEventListener('input', () => {
            const value = parseFloat(input.value);
            const valueDisplay = input.nextElementSibling;
            if (valueDisplay) {
                valueDisplay.textContent = value.toFixed(2);
            }
        });
    });

    setupCanvasEventListeners();
    menu = createMenu();
    init();
    gameLoop();
});

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth - 320;
    canvas.height = window.innerHeight - 120;
});