class SlotMachine {
  constructor(initialBalance = 100) {
    this.balance = initialBalance;
    this.betAmount = 10;
    this.isSpinning = false;
    this.currentResults = [];
    this.symbols = [
      { name: "cake", emoji: "🍰", value: 3 },
      { name: "cupcake", emoji: "🧁", value: 2 },
      { name: "donut", emoji: "🍩", value: 2 },
      { name: "ice cream", emoji: "🍦", value: 3 },
      { name: "popsicle", emoji: "🍧", value: 1 },
      { name: "pie", emoji: "🥧", value: 3 },
      { name: "pizza", emoji: "🍕", value: 4 },
      { name: "sandwich", emoji: "🥪", value: 2 }
    ];
  }

  spin() {
    if (this.isSpinning || this.balance < this.betAmount) return false;

    this.isSpinning = true;
    this.balance -= this.betAmount;
    this.updateDisplay();

    // Generate random results
    this.currentResults = Array(3)
      .fill()
      .map(() => this.symbols[Math.floor(Math.random() * this.symbols.length)]);

    // Animate each reel with random timing
    const reels = document.querySelectorAll(".reel");
    reels.forEach((reel, index) => {
      const randomDelay = Math.random() * 500; // Random delay between 0-500ms
      const randomDuration = 1500 + Math.random() * 1000; // Random duration between 1.5-2.5s
      setTimeout(() => {
        this.animateReel(reel, this.currentResults[index], randomDuration);
      }, randomDelay);
    });

    return true;
  }

  animateReel(reel, result, duration) {
    const symbols = reel.querySelectorAll(".symbol");

    // Add spinning animation
    reel.classList.add("spinning");

    // Update symbols during spin
    const spinInterval = setInterval(() => {
      symbols.forEach((symbol) => {
        const randomSymbol = this.symbols[
          Math.floor(Math.random() * this.symbols.length)
        ];
        symbol.textContent = randomSymbol.emoji;
      });
    }, 50);

    // Stop at final result
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
    if (isWin) {
      const winAmount = this.betAmount * this.currentResults[0].value;
      this.balance += winAmount;
      this.showWinMessage(winAmount);
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
}

$(document).ready(() => {
  const slotMachine = new SlotMachine();
  const $slotMachine = $(`
    `).appendTo("body");

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
