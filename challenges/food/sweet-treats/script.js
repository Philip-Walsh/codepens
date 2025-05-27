class Treat {
    constructor(name, emoji, calories) {
        this.name = name;
        this.emoji = emoji;
        this.calories = calories;
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
            new Treat("sandwich", "🥪", 320)
        ];
        return treats[Math.floor(Math.random() * treats.length)];
    }
}

class TreatManager {
    constructor(maxTreats = 5) {
        this.maxTreats = maxTreats;
        this.currentTreats = 0;
        this.totalCalories = 0;
        this.angryMessages = [
            "That's enough treats! 😠",
            "You're going to get a tummy ache! 🤢",
            "No more treats for you! 😤",
            "Stop being so greedy! 😡",
            "You've had too many! 😫"
        ];
    }

    addTreat() {
        if (this.currentTreats >= this.maxTreats) {
            this.showAngryMessage();
            return false;
        }

        const treat = Treat.getRandomTreat();
        this.currentTreats++;
        this.totalCalories += treat.calories;
        return treat;
    }

    showAngryMessage() {
        const message = this.angryMessages[Math.floor(Math.random() * this.angryMessages.length)];
        const $message = $("<div>")
            .addClass("angry-message")
            .text(message);

        $("body").append($message);
        setTimeout(() => $message.remove(), 2000);
    }

    getStats() {
        return {
            treats: this.currentTreats,
            calories: this.totalCalories,
            remaining: this.maxTreats - this.currentTreats
        };
    }
}

$(document).ready(() => {
    const treatManager = new TreatManager(5);

    // Add styles for animations
    $("<style>")
        .text(`
            @keyframes shake {
                0%, 100% { transform: translateX(-50%); }
                25% { transform: translateX(-52%); }
                75% { transform: translateX(-48%); }
            }
            .treat-item {
                display: inline-block;
                margin: 5px;
                font-size: 2em;
                transition: transform 0.3s;
            }
            .treat-item:hover {
                transform: scale(1.2);
            }
            .stats {
                margin: 10px 0;
                padding: 10px;
                background-color: #f0f0f0;
                border-radius: 5px;
            }
        `)
        .appendTo("head");

    // Create treat button
    const $button = $("<button>")
        .addClass("treat-button")
        .text("Get a Treat! 🍪");

    // Create stats display
    const $stats = $("<div>")
        .addClass("stats")
        .html(`
            <div>Treats: <span class="treat-count">0</span>/5</div>
            <div>Calories: <span class="calorie-count">0</span></div>
        `);

    // Add elements to page
    $(".sweet-treats")
        .append($button)
        .append($stats);

    // Handle treat button click
    $button.on("click", () => {
        const treat = treatManager.addTreat();
        if (treat) {
            const $treat = $("<span>")
                .addClass("treat-item")
                .text(treat.emoji)
                .css("animation", "pop 0.5s");

            $(".sweet-treats").append($treat);

            // Update stats
            const stats = treatManager.getStats();
            $(".treat-count").text(stats.treats);
            $(".calorie-count").text(stats.calories);
        }
    });
});