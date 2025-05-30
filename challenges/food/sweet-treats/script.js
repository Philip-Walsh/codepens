class SlotMachine {
  constructor(initialBalance = 100) {
    this.balance = initialBalance;
    this.betAmount = 10;
    this.isSpinning = false;
    this.currentResults = [];
    this.symbols = [
      { name: "cake", emoji: "🍰", weight: 3 },
      { name: "cupcake", emoji: "🧁", weight: 2 },
      { name: "donut", emoji: "🍩", weight: 2 },
      { name: "ice cream", emoji: "🍦", weight: 3 },
      { name: "popsicle", emoji: "🍧", weight: 1 },
      { name: "pie", emoji: "🥧", weight: 3 },
      { name: "pizza", emoji: "🍕", weight: 4 },
      { name: "sandwich", emoji: "🥪", weight: 2 }
    ];
    this.lightController = new LightController(this);
  }

  spin() {
    if (this.isSpinning || this.balance < this.betAmount) return false;

    this.isSpinning = true;
    this.balance -= this.betAmount;
    this.updateDisplay();

    // Adjust animation speed based on reduced motion preference
    const animationSpeed = this.prefersReducedMotion() ? 200 : 50;
    this.lightController.startLightAnimation(true, animationSpeed);

    this.currentResults = Array(3)
      .fill()
      .map(() => this.symbols[Math.floor(Math.random() * this.symbols.length)]);

    const reels = document.querySelectorAll(".reel");
    reels.forEach((reel, index) => {
      const randomDelay = this.prefersReducedMotion() ? 0 : Math.random() * 500;
      const randomDuration = this.prefersReducedMotion() ? 1000 : 1500 + Math.random() * 1000;

      setTimeout(() => {
        this.animateReel(reel, this.currentResults[index], randomDuration);
      }, randomDelay);
    });

    return true;
  }

  animateReel(reel, result, duration) {
    const symbols = reel.querySelectorAll(".symbol");

    reel.classList.add("spinning");

    const spinInterval = setInterval(() => {
      symbols.forEach((symbol) => {
        const randomSymbol = this.symbols[
          Math.floor(Math.random() * this.symbols.length)
        ];
        symbol.textContent = randomSymbol.emoji;
      });
    }, 50);

    setTimeout(() => {
      clearInterval(spinInterval);
      reel.classList.remove("spinning");
      symbols.forEach((symbol) => {
        symbol.textContent = result.emoji;
      });

      const allStopped = Array.from(document.querySelectorAll(".reel")).every(
        (reel) => !reel.classList.contains("spinning")
      );

      if (allStopped) {
        this.checkWin();
      }
    }, duration);
  }

  checkWin() {
    const isWin = this.currentResults.every(
      (symbol) => symbol.emoji === this.currentResults[0].emoji
    );

    const slotMachine = document.querySelector('.slot-machine');

    if (isWin) {
      const winAmount = this.betAmount * this.currentResults[0].weight;
      this.balance += winAmount;
      this.showWinMessage(winAmount);

      // Add win animation
      slotMachine.classList.add('win');
      this.lightController.showWinLights();

      // Remove win class after animation
      setTimeout(() => {
        slotMachine.classList.remove('win');
      }, 500);
    } else {
      // Add shake animation
      slotMachine.classList.add('shake');
      this.lightController.showFailLights();

      // Remove shake class after animation
      setTimeout(() => {
        slotMachine.classList.remove('shake');
      }, 500);
    }

    this.isSpinning = false;
    this.updateDisplay();
  }

  showWinMessage(amount) {
    const message = $(
      `<div class="win-message">You won ${amount} coins! 🎉</div>`
    );
    $(".slot-machine").append(message);
    setTimeout(() => message.remove(), 3000);
  }

  updateDisplay() {
    $(".balance").text(`Balance: ${this.balance} coins`);
    $(".spin-button").prop(
      "disabled",
      this.isSpinning || this.balance < this.betAmount
    );
  }

  increaseBet() {
    if (this.betAmount < 50 && !this.isSpinning) {
      this.betAmount += 10;
      $(".bet-amount").text(`Bet: ${this.betAmount} coins`);
      this.updateDisplay();
    }
  }

  decreaseBet() {
    if (this.betAmount > 10 && !this.isSpinning) {
      this.betAmount -= 10;
      $(".bet-amount").text(`Bet: ${this.betAmount} coins`);
      this.updateDisplay();
    }
  }

  // Add method to check for reduced motion preference
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

class LightController {
  constructor(slotMachine) {
    this.slotMachine = slotMachine;
    this.lightIntervals = [];
    this.initializeLights();
  }

  initializeLights() {
    const lightBands = document.querySelectorAll('.light-band');
    lightBands.forEach(band => {
      // Create 20 lights per band
      for (let i = 0; i < 20; i++) {
        const light = document.createElement('div');
        light.className = 'light';
        band.appendChild(light);
      }
    });
    // Start with slow animation
    this.startLightAnimation(false);
  }

  startLightAnimation(isSpinning = false, animationSpeed = 50) {
    this.stopLightAnimation();
    const lightBands = document.querySelectorAll('.light-band');

    lightBands.forEach((band, index) => {
      const lights = band.querySelectorAll('.light');
      let currentIndex = 0;

      const interval = setInterval(() => {
        // Remove active state from all lights
        lights.forEach(light => light.classList.remove('active'));

        // Activate 3 consecutive lights with a trailing effect
        for (let i = 0; i < 3; i++) {
          const lightIndex = (currentIndex + i) % lights.length;
          const light = lights[lightIndex];
          light.classList.add('active');

          // Add a subtle delay to create a trailing effect
          if (i > 0) {
            light.style.transitionDelay = `${i * 50}ms`;
          } else {
            light.style.transitionDelay = '0ms';
          }
        }

        currentIndex = (currentIndex + 1) % lights.length;
      }, isSpinning ? animationSpeed : 300); // Slower animation when not spinning

      this.lightIntervals.push(interval);
    });
  }

  stopLightAnimation() {
    this.lightIntervals.forEach(interval => clearInterval(interval));
    this.lightIntervals = [];
  }

  showWinLights() {
    this.stopLightAnimation();
    const slotMachine = document.querySelector('.slot-machine');
    slotMachine.classList.add('win');
    slotMachine.classList.remove('fail');

    // Flash all lights in sequence
    const lights = document.querySelectorAll('.light');
    lights.forEach((light, index) => {
      setTimeout(() => {
        light.classList.add('active');
      }, index * 20); // Stagger the activation
    });

    setTimeout(() => {
      slotMachine.classList.remove('win');
      this.startLightAnimation(false);
    }, 1000);
  }

  showFailLights() {
    this.stopLightAnimation();
    const slotMachine = document.querySelector('.slot-machine');
    slotMachine.classList.add('fail');
    slotMachine.classList.remove('win');

    // Flash all lights in sequence
    const lights = document.querySelectorAll('.light');
    lights.forEach((light, index) => {
      setTimeout(() => {
        light.classList.add('active');
      }, index * 20); // Stagger the activation
    });

    setTimeout(() => {
      slotMachine.classList.remove('fail');
      this.startLightAnimation(false);
    }, 1000);
  }
}

$(document).ready(() => {
  const slotMachine = new SlotMachine();
  const $slotMachine = $(`
    `).appendTo("body");

  $(".game-banner").css("text-shadow", generateTextShadow());

  $(".spin-button").on("click", () => {
    if (!slotMachine.isSpinning) {
      slotMachine.spin();
    }
  });

  $(".increase-bet").on("click", () => {
    slotMachine.increaseBet();
  });

  $(".decrease-bet").on("click", () => {
    slotMachine.decreaseBet();
  });
});

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
      result[3],
      16
    )}`
    : "127, 85, 177";
}

function generateTextShadow(
  numLayers = 20,
  baseColor = "#7f55b1",
  startOpacity = 0.9
) {
  const shadows = [
    "-1px -1px var(--primary)",
    "1px -1px var(--primary)",
    "-1px 1px var(--primary)",
    "1px 1px var(--primary)",
    "-2px -2px var(--primary)",
    "2px -2px var(--primary)",
    "-2px 2px var(--primary)",
    "2px 2px var(--primary)"
  ];
  for (let i = 0; i < numLayers; i++) {
    const offset = i + 1;
    const opacity = startOpacity - i * (startOpacity / numLayers);
    shadows.push(
      `${offset}px ${offset}px rgba(${hexToRgb(baseColor)}, ${opacity})`
    );
  }
  return shadows.join(", ");
}
