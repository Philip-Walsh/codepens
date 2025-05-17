const messages = {
      info: [
        "Heads up, your noodles are almost ready!",
        "You’re low on milk.",
        "Eggs expire in 2 days.",
        "Bananas ripening fast!",
        "You’ve got basil. Use it while it’s fresh!",
        "🍋 Lemons boost flavor *and* Vitamin C!",
        "🥒 Cucumbers are 96% water. Stay hydrated!"
      ],
      success: [
        "Order sent to the kitchen!",
        "🥐 Croissants are golden and ready!",
        "Toast is perfectly browned.",
        "Fridge restocked with goodies.",
        "🍓 Jam applied with precision.",
        "Ice cubes set. Summer mode activated."
      ],
      warning: [
        "Your broth is cooling down.",
        "Delivery running a bit late.",
        "🍕 Pizza slice imbalance detected!",
        "Melt alert: Ice cream left out!",
        "Oven still hot — caution advised.",
        "That’s a lot of garlic!"
      ],
      error: [
        "Burnt toast detected!",
        "Fridge door left open!",
        "🥵 Blender overload — cool it down!",
        "Something went wrong.",
        "Unable to reach the kitchen.",
        "☕ Coffee machine failed to brew."
      ]
    };

function showToast(type, message) {
	const container = document.getElementById("toast-container");
	const toast = document.createElement("div");
	toast.className = `toast ${type}`;
	toast.innerHTML = `
        <div class="message">${message}</div>
        <button class="close" onclick="this.parentElement.remove()">✖</button>
      `;

	container.appendChild(toast);

	setTimeout(() => {
		toast.remove();
	}, 5000);
}

function showRandomToast() {
	const types = ["info", "success", "warning", "error"];
	const type = types[Math.floor(Math.random() * types.length)];
	const msgs = messages[type];
	const msg = msgs[Math.floor(Math.random() * msgs.length)];
	showToast(type, msg);
}

function triggerInitialToasts(count = 15) {
	for (let i = 0; i < count; i++) {
		setTimeout(() => showRandomToast(), i * 700);
	}
}

window.onload = () => triggerInitialToasts();