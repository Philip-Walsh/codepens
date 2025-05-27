class SlotMachine {
    constructor() {
        this.symbols = [
            { emoji: '🍰', name: 'Cake', value: 50, probability: 0.1 },
            { emoji: '🧁', name: 'Cupcake', value: 30, probability: 0.2 },
            { emoji: '🍩', name: 'Donut', value: 20, probability: 0.3 },
            { emoji: '🍪', name: 'Cookie', value: 15, probability: 0.4 },
            { emoji: '🍫', name: 'Chocolate', value: 10, probability: 0.5 },
            { emoji: '🍬', name: 'Candy', value: 5, probability: 0.6 },
            { emoji: '🎂', name: 'Birthday Cake', value: 100, probability: 0.05 },
            { emoji: '🍯', name: 'Honey Pot', value: 75, probability: 0.08 }
        ];

        this.credits = 1000;
        this.bet = 10;
        this.isSpinning = false;
        this.reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];

        // Initialize audio with online URLs
        this.audio = {
            spin: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
            click: new Audio('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3'),
            win: new Audio('https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3'),
            stop: new Audio('https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3'),
            background: new Audio('https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3')
        };

        // Configure background music
        this.audio.background.loop = true;
        this.audio.background.volume = 0.3;

        // Configure sound effects
        this.audio.spin.volume = 0.4;
        this.audio.click.volume = 0.5;
        this.audio.win.volume = 0.6;
        this.audio.stop.volume = 0.5;

        this.initializeEventListeners();
        this.createRulesPanel();
        this.updateDisplay();
    }

    createRulesPanel() {
        const rulesPanel = document.createElement('div');
        rulesPanel.className = 'rules-panel';
        rulesPanel.innerHTML = `
            <h2>How to Play</h2>
            <ul>
                <li>🎰 Start with 1000 credits</li>
                <li>💰 Place your bet (10-100 credits)</li>
                <li>🎲 Click SPIN to start the reels</li>
                <li>🍰 Match 2 or 3 symbols to win!</li>
                <li>💎 Payouts:
                    <ul>
                        <li>2 of a kind: 2x symbol value × bet</li>
                        <li>3 of a kind: 5x symbol value × bet</li>
                    </ul>
                </li>
                <li>🎂 Symbol Values:
                    <ul>
                        <li>Birthday Cake: 100</li>
                        <li>Honey Pot: 75</li>
                        <li>Cake: 50</li>
                        <li>Cupcake: 30</li>
                        <li>Donut: 20</li>
                        <li>Cookie: 15</li>
                        <li>Chocolate: 10</li>
                        <li>Candy: 5</li>
                    </ul>
                </li>
            </ul>
        `;

        const rulesButton = document.createElement('button');
        rulesButton.className = 'rules-button';
        rulesButton.textContent = 'Rules';
        rulesButton.addEventListener('click', () => {
            rulesPanel.classList.toggle('show');
            this.audio.click.play();
        });

        document.querySelector('.slot-machine').appendChild(rulesPanel);
        document.querySelector('.slot-machine').appendChild(rulesButton);

        // Close rules panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!rulesPanel.contains(e.target) && !rulesButton.contains(e.target)) {
                rulesPanel.classList.remove('show');
            }
        });
    }

    initializeEventListeners() {
        const spinButton = document.getElementById('spin-button');
        spinButton.addEventListener('click', () => {
            if (!this.isSpinning) {
                this.audio.click.play();
                spinButton.classList.add('active');
                this.spin();
            }
        });
        spinButton.addEventListener('animationend', () => {
            spinButton.classList.remove('active');
        });

        document.getElementById('increase-bet').addEventListener('click', () => {
            this.audio.click.play();
            this.adjustBet(10);
        });
        document.getElementById('decrease-bet').addEventListener('click', () => {
            this.audio.click.play();
            this.adjustBet(-10);
        });

        // Start background music on first interaction
        document.addEventListener('click', () => {
            if (this.audio.background.paused) {
                this.audio.background.play();
            }
        }, { once: true });
    }

    getRandomSymbol() {
        const random = Math.random();
        let cumulativeProbability = 0;

        for (const symbol of this.symbols) {
            cumulativeProbability += symbol.probability;
            if (random <= cumulativeProbability) {
                return symbol;
            }
        }

        return this.symbols[0];
    }

    async spin() {
        if (this.isSpinning || this.credits < this.bet) return;

        this.isSpinning = true;
        this.credits -= this.bet;
        this.updateDisplay();

        // Hide any existing win message
        const winDisplay = document.getElementById('win-display');
        winDisplay.classList.remove('winning');
        winDisplay.style.opacity = '0';
        winDisplay.style.transform = 'scale(0.8)';

        // Play spin sound
        this.audio.spin.play();

        // Generate results
        const results = this.reels.map(() => this.getRandomSymbol());

        // Start spinning animation with random speeds
        this.reels.forEach((reel, index) => {
            const symbolContainer = reel.querySelector('.symbol');
            const symbols = Array(20).fill().map(() => this.getRandomSymbol());
            symbols.push(results[index]); // Add the final result at the end
            symbolContainer.innerHTML = symbols.map(s => s.emoji).join('<br>');

            // Add random speed animation
            const speed = 0.1 + Math.random() * 0.2; // Random speed between 0.1s and 0.3s
            symbolContainer.style.animation = `spinSymbol ${speed}s linear infinite`;
            reel.classList.add('spinning');
        });

        // Stop reels one by one with random delays
        const stopDelays = this.reels.map(() => 1000 + Math.random() * 2000); // Random delay between 1-3s
        const maxDelay = Math.max(...stopDelays);

        // Wait for all reels to stop
        await new Promise(resolve => setTimeout(resolve, maxDelay));

        // Stop each reel with its own delay
        for (let i = 0; i < this.reels.length; i++) {
            setTimeout(() => {
                const reel = this.reels[i];
                const symbol = results[i];
                reel.classList.remove('spinning');
                reel.querySelector('.symbol').style.animation = 'none';
                reel.querySelector('.symbol').textContent = symbol.emoji;
                reel.querySelector('.symbol-name').textContent = symbol.name;
                this.audio.stop.play();
            }, stopDelays[i]);
        }

        // Wait for the last reel to stop
        await new Promise(resolve => setTimeout(resolve, 500));

        // Calculate winnings
        const winnings = this.calculateWinnings(results);
        if (winnings > 0) {
            this.credits += winnings;
            // Show win message with a slight delay
            setTimeout(() => {
                this.audio.win.play();
                this.showWinMessage(winnings);
            }, 300);
        }

        this.isSpinning = false;
        this.updateDisplay();
    }

    calculateWinnings(results) {
        const counts = {};
        results.forEach(symbol => {
            counts[symbol.emoji] = (counts[symbol.emoji] || 0) + 1;
        });

        let totalWinnings = 0;

        // Check for three of a kind first (highest payout)
        for (const [emoji, count] of Object.entries(counts)) {
            if (count === 3) {
                const symbol = this.symbols.find(s => s.emoji === emoji);
                // Three of a kind pays 5x the symbol value
                totalWinnings += symbol.value * 5 * this.bet;
                return totalWinnings; // Return immediately as this is the highest possible win
            }
        }

        // Check for two of a kind
        for (const [emoji, count] of Object.entries(counts)) {
            if (count === 2) {
                const symbol = this.symbols.find(s => s.emoji === emoji);
                // Two of a kind pays 2x the symbol value
                totalWinnings += symbol.value * 2 * this.bet;
            }
        }

        return totalWinnings;
    }

    adjustBet(amount) {
        const newBet = this.bet + amount;
        if (newBet >= 10 && newBet <= 100) {
            this.bet = newBet;
            this.updateDisplay();
        }
    }

    showWinMessage(amount) {
        const winDisplay = document.getElementById('win-display');
        winDisplay.textContent = `You won ${amount} credits!`;
        winDisplay.style.opacity = '1';
        winDisplay.style.transform = 'scale(1)';
        winDisplay.classList.add('winning');
        setTimeout(() => {
            winDisplay.classList.remove('winning');
            winDisplay.style.opacity = '0';
            winDisplay.style.transform = 'scale(0.8)';
            winDisplay.textContent = 'Ready to Play!';
        }, 3000);
    }

    updateDisplay() {
        document.getElementById('credits').textContent = this.credits;
        document.getElementById('bet').textContent = this.bet;
    }
}

// Initialize the game when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const slotMachine = new SlotMachine();
}); 