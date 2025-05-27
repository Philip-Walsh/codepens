class Treat {
  constructor(name, emoji, calories, points = 0) {
    this.name = name;
    this.emoji = emoji;
    this.calories = calories;
    this.remainingCalories = calories;
    this.points = points || Math.floor(calories / 10);
    this.collected = false;
    this.multiplier = 1;
  }

  static getRandomTreat() {
    const treats = [
      new Treat("Chocolate Cake", "🍫", 400, 40),
      new Treat("Rainbow Cupcake", "🧁", 300, 30),
      new Treat("Glazed Donut", "🍩", 350, 35),
      new Treat("Ice Cream Sundae", "🍦", 250, 25),
      new Treat("Fruit Popsicle", "🍧", 200, 20),
      new Treat("Apple Pie", "🥧", 450, 45),
      new Treat("Pizza Slice", "🍕", 500, 50),
      new Treat("Club Sandwich", "🥪", 380, 38),
    ];
    return treats[Math.floor(Math.random() * treats.length)];
  }
}

class TreatManager {
  constructor(maxTreats = 5) {
    this.maxTreats = maxTreats;
    this.currentTreats = 0;
    this.totalCalories = 0;
    this.treats = [];
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.gameActive = false;
    this.gameTime = 60;
    this.remainingTime = this.gameTime;
    this.level = 1;
    this.targetScore = 1000;
    this.specialTreats = 0;

    this.messages = {
      success: [
        "Perfect timing! 🎯",
        "Amazing combo! 🔥",
        "You're on fire! ⚡",
        "Incredible! 🌟",
        "Master chef! 👨‍🍳"
      ],
      error: [
        "Too slow! ⏰",
        "Missed it! 😅",
        "Almost there! 🎯",
      ],
      levelUp: [
        "Level Up! 🚀",
        "You're getting better! 📈",
        "New level unlocked! 🎮"
      ]
    };
  }

  startGame() {
    this.gameActive = true;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.remainingTime = this.gameTime;
    this.level = 1;
    this.targetScore = 1000;
    this.specialTreats = 0;
    this.updateStats();
    this.showMessage("Game Started! Collect treats at the perfect time! 🎮", "success");
  }

  endGame() {
    this.gameActive = false;
    const finalScore = this.calculateFinalScore();
    const message = `Game Over! Final Score: ${finalScore} 🎯\nLevel Reached: ${this.level} 🌟`;
    this.showMessage(message, "info");
    this.updateStats();
  }

  calculateFinalScore() {
    return this.score + (this.maxCombo * 100) + (this.level * 500);
  }

  addTreat() {
    if (!this.gameActive) {
      this.showMessage("Start the game first! 🎮", "error");
      return false;
    }

    if (this.currentTreats >= this.maxTreats) {
      this.showMessage("Collection full! Collect some treats first! 🎯", "error");
      this.combo = 0;
      return false;
    }

    const treat = Treat.getRandomTreat();

    // Add special treats based on level
    if (Math.random() < (this.level * 0.1)) {
      treat.multiplier = 2;
      treat.emoji = "⭐" + treat.emoji;
      this.specialTreats++;
    }

    this.currentTreats++;
    this.totalCalories += treat.calories;
    this.treats.push(treat);

    const message = treat.multiplier > 1 ?
      `Special treat! ${treat.multiplier}x points! 🌟` :
      this.messages.success[Math.floor(Math.random() * this.messages.success.length)];

    this.showMessage(message, "success");
    return treat;
  }

  collectTreat(index) {
    if (index >= 0 && index < this.treats.length) {
      const treat = this.treats[index];
      if (!treat.collected) {
        const timingBonus = this.calculateTimingBonus(treat);
        treat.collected = true;

        // Calculate points with timing bonus and multiplier
        const points = Math.floor((treat.points + timingBonus) * treat.multiplier);
        this.score += points;

        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);

        // Check for level up
        if (this.score >= this.targetScore) {
          this.levelUp();
        }

        return true;
      }
    }
    return false;
  }

  calculateTimingBonus(treat) {
    // Perfect timing when calories are between 30-70% remaining
    const percentage = (treat.remainingCalories / treat.calories) * 100;
    if (percentage >= 30 && percentage <= 70) {
      return treat.points * 0.5; // 50% bonus for perfect timing
    }
    return 0;
  }

  levelUp() {
    this.level++;
    this.targetScore = this.level * 1000;
    this.maxTreats = Math.min(8, 5 + Math.floor(this.level / 2));
    this.showMessage(this.messages.levelUp[Math.floor(Math.random() * this.messages.levelUp.length)], "success");
  }

  removeTreat(index) {
    if (index >= 0 && index < this.treats.length) {
      const treat = this.treats[index];
      if (!treat.collected) {
        this.combo = 0;
        this.showMessage(this.messages.error[Math.floor(Math.random() * this.messages.error.length)], "error");
      }
      this.totalCalories -= treat.remainingCalories;
      this.currentTreats--;
      this.treats.splice(index, 1);
      this.updateStats();
    }
  }

  updateCalories() {
    let hasChanges = false;
    this.treats.forEach((treat, index) => {
      if (treat.remainingCalories > 0) {
        treat.remainingCalories = Math.max(0, treat.remainingCalories - 5);
        hasChanges = true;

        if (treat.remainingCalories === 0) {
          const $treat = $(`.treat-item[data-index="${index}"]`);
          if ($treat.length) {
            $treat.addClass('fading');
            setTimeout(() => {
              $treat.remove();
              this.removeTreat(index);
            }, 1000);
          }
        }
      }
    });

    if (hasChanges) {
      this.updateStats();
      this.updateTreatDisplay();
    }
  }

  updateStats() {
    $(".treat-count").text(this.currentTreats);
    $(".calorie-count").text(this.totalCalories);
    $(".remaining-count").text(this.maxTreats - this.currentTreats);
    $(".score-count").text(this.score);
    $(".combo-count").text(this.combo);
    $(".time-remaining").text(this.remainingTime);
    $(".level-count").text(this.level);
    $(".target-score").text(this.targetScore);
  }

  updateTreatDisplay() {
    this.treats.forEach((treat, index) => {
      const $treat = $(`.treat-item[data-index="${index}"]`);
      if ($treat.length) {
        const percentage = (treat.remainingCalories / treat.calories) * 100;
        $treat.find('.treat-calories').text(`${Math.round(treat.remainingCalories)} cal`);

        // Add timing indicator
        if (percentage >= 30 && percentage <= 70) {
          $treat.addClass('perfect-timing');
        } else {
          $treat.removeClass('perfect-timing');
        }

        if (treat.collected) {
          $treat.addClass('collected');
        }

        // Update multiplier display
        if (treat.multiplier > 1) {
          $treat.addClass('special-treat');
          $treat.find('.multiplier').text(`${treat.multiplier}x`);
        }
      }
    });
  }

  showMessage(message, type = "info") {
    const $message = $("<section>").addClass(`treat-message ${type}`).html(`
      <span class="message-icon">${type === "error" ? "⚠️" : "🎉"}</span>
      <span class="message-text">${message}</span>
      <button class="message-close" aria-label="Close message">×</button>
    `);

    $(".treat-messages").append($message);

    $message.find(".message-close").on("click", () => {
      $message.addClass("removing");
      setTimeout(() => $message.remove(), 300);
    });

    setTimeout(() => {
      if ($message.parent().length) {
        $message.addClass("removing");
        setTimeout(() => $message.remove(), 300);
      }
    }, 3000);
  }
}

$(document).ready(() => {
  const treatManager = new TreatManager(5);
  let treatUpdateInterval;
  let gameLoopInterval;

  const $messageContainer = $("<section>")
    .addClass("treat-messages")
    .appendTo("body");

  const $button = $("<button>").addClass("treat-button").html(`
    <span class="button-icon">🍪</span>
    <span class="button-text">Get a Treat!</span>
  `);

  const $startButton = $("<button>").addClass("start-button").html(`
    <span class="button-icon">🎮</span>
    <span class="button-text">Start Game</span>
  `);

  const $stats = $("<section>").addClass("stats").html(`
    <section class="stats-item">
      <span class="stats-label">Level:</span>
      <span class="level-count">1</span>
    </section>
    <section class="stats-item">
      <span class="stats-label">Score:</span>
      <span class="score-count">0</span>
    </section>
    <section class="stats-item">
      <span class="stats-label">Target:</span>
      <span class="target-score">1000</span>
    </section>
    <section class="stats-item">
      <span class="stats-label">Combo:</span>
      <span class="combo-count">0</span>x
    </section>
    <section class="stats-item">
      <span class="stats-label">Time:</span>
      <span class="time-remaining">60</span>s
    </section>
  `);

  const $treatContainer = $("<section>").addClass("treat-container");

  $(".sweet-treats").append($startButton).append($button).append($stats).append($treatContainer);

  function startCalorieCountdown() {
    if (treatUpdateInterval) {
      clearInterval(treatUpdateInterval);
    }
    treatUpdateInterval = setInterval(() => {
      treatManager.updateCalories();
    }, 1000);
  }

  function startGameLoop() {
    if (gameLoopInterval) {
      clearInterval(gameLoopInterval);
    }
    gameLoopInterval = setInterval(() => {
      if (treatManager.gameActive) {
        treatManager.remainingTime--;
        treatManager.updateStats();

        if (treatManager.remainingTime <= 0) {
          treatManager.endGame();
          clearInterval(gameLoopInterval);
        }
      }
    }, 1000);
  }

  $startButton.on("click", () => {
    if (!treatManager.gameActive) {
      treatManager.startGame();
      startGameLoop();
      startCalorieCountdown();
      $startButton.find('.button-text').text('Restart Game');
    } else {
      treatManager.endGame();
      treatManager.startGame();
    }
  });

  $button.on("click", () => {
    const treat = treatManager.addTreat();
    if (treat) {
      const $treat = $("<section>")
        .addClass("treat-item")
        .attr('data-index', treatManager.treats.length - 1)
        .html(`
          <span class="treat-emoji">${treat.emoji}</span>
          <span class="treat-name">${treat.name}</span>
          <span class="treat-calories">${treat.calories} cal</span>
          ${treat.multiplier > 1 ? '<span class="multiplier">2x</span>' : ''}
        `)
        .css("animation", "pop 0.5s");

      $treatContainer.append($treat);
      treatManager.updateStats();

      $treat.on("click", function () {
        const index = $(this).data('index');
        if (treatManager.collectTreat(index)) {
          $(this).addClass('collected');
          treatManager.updateStats();
        }
      });
    }
  });
});
