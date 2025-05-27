class Treat {
  constructor(name, emoji, calories) {
    this.name = name;
    this.emoji = emoji;
    this.calories = calories;
    this.remainingCalories = calories;
  }

  static getRandomTreat() {
    const treats = [
      new Treat("cake", "🍰", 300),
      new Treat("cupcake", "🧁", 250),
      new Treat("donut", "🍩", 280),
      new Treat("ice cream", "🍦", 200),
      new Treat("popsicle", "🍧", 150),
      new Treat("pie", "🥧", 350),
      new Treat("pizza", "🍕", 400),
      new Treat("sandwich", "🥪", 320),
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
    this.angryMessages = [
      "That's enough treats! 😠",
      "You're going to get a tummy ache! 🤢",
      "No more treats for you! 😤",
      "Stop being so greedy! 😡",
      "You've had too many! 😫",
    ];
    this.successMessages = [
      "Yummy treat! 🍪",
      "Delicious! 😋",
      "Enjoy your treat! 🎉",
      "Here's something sweet! 🍭",
      "Treat time! 🍫",
    ];
  }

  addTreat() {
    if (this.currentTreats >= this.maxTreats) {
      this.showMessage(
        this.angryMessages[Math.floor(Math.random() * this.angryMessages.length)],
        "error"
      );
      return false;
    }

    const treat = Treat.getRandomTreat();
    this.currentTreats++;
    this.totalCalories += treat.calories;
    this.treats.push(treat);
    this.showMessage(
      this.successMessages[Math.floor(Math.random() * this.successMessages.length)],
      "success"
    );
    return treat;
  }

  removeTreat(index) {
    if (index >= 0 && index < this.treats.length) {
      const treat = this.treats[index];
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
  }

  updateTreatDisplay() {
    this.treats.forEach((treat, index) => {
      const $treat = $(`.treat-item[data-index="${index}"]`);
      if ($treat.length) {
        $treat.find('.treat-calories').text(`${Math.round(treat.remainingCalories)} cal`);
        const burnedCalories = treat.calories - treat.remainingCalories;
        $treat.find('.calorie-countdown').text(`-${Math.round(burnedCalories)} cal`);
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

  getStats() {
    return {
      treats: this.currentTreats,
      calories: this.totalCalories,
      remaining: this.maxTreats - this.currentTreats,
    };
  }
}

$(document).ready(() => {
  const treatManager = new TreatManager(5);
  let treatUpdateInterval;

  const $messageContainer = $("<section>")
    .addClass("treat-messages")
    .appendTo("body");

  const $button = $("<button>").addClass("treat-button").html(`
    <span class="button-icon">🍪</span>
    <span class="button-text">Get a Treat!</span>
  `);

  const $stats = $("<section>").addClass("stats").html(`
    <section class="stats-item">
      <span class="stats-label">Treats:</span>
      <span class="treat-count">0</span>/5
    </section>
    <section class="stats-item">
      <span class="stats-label">Calories:</span>
      <span class="calorie-count">0</span>
    </section>
    <section class="stats-item">
      <span class="stats-label">Remaining:</span>
      <span class="remaining-count">5</span>
    </section>
  `);

  const $treatContainer = $("<section>").addClass("treat-container");

  $(".sweet-treats").append($button).append($stats).append($treatContainer);

  function startCalorieCountdown() {
    if (treatUpdateInterval) {
      clearInterval(treatUpdateInterval);
    }
    treatUpdateInterval = setInterval(() => {
      treatManager.updateCalories();
    }, 1000);
  }

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
          <span class="calorie-countdown">0 cal</span>
        `)
        .css("animation", "pop 0.5s");

      $treatContainer.append($treat);
      treatManager.updateStats();
      startCalorieCountdown();
    }
  });

  // Start the countdown immediately
  startCalorieCountdown();
});
