const flashcards = [
	{
		question: "Artificial Intelligence",
		hint: "When machines start thinking (kind of).",
		answer:
			"AI refers to systems that can perform tasks normally requiring human intelligence — like learning, reasoning, and problem-solving."
	},
	{
		question: "Machine Learning",
		hint: "Teaching computers to learn patterns.",
		answer:
			"A subset of AI where algorithms learn from data to make decisions or predictions without being explicitly programmed."
	},
	{
		question: "Neural Network",
		hint: "Inspired by brains, built by engineers.",
		answer:
			"A layered structure of algorithms designed to recognize patterns, similar to how the human brain processes information."
	},
	{
		question: "Overfitting",
		hint: "When your model knows the training data *too* well.",
		answer:
			"Overfitting occurs when a model performs well on training data but poorly on unseen data because it has memorized patterns instead of generalizing."
	},
	{
		question: "Natural Language Processing (NLP)",
		hint: "How Siri understands you.",
		answer:
			"A field of AI focused on enabling machines to understand, interpret, and generate human language."
	},
	{
		question: "Supervised Learning",
		hint: "Learning with labeled examples.",
		answer:
			"A type of machine learning where the model is trained on input-output pairs (labeled data) to make predictions."
	},
	{
		question: "Reinforcement Learning",
		hint: "Learning by trial and reward.",
		answer:
			"A learning technique where agents learn by interacting with an environment and receiving feedback through rewards or penalties."
	},
	{
		question: "Bias in AI",
		hint: "When algorithms aren't fair.",
		answer:
			"Bias in AI refers to systematic errors that result in unfair outcomes due to skewed data or flawed model assumptions."
	},
	{
		question: "Turing Test",
		hint: "Can a machine fool a human?",
		answer:
			"A test proposed by Alan Turing to determine if a machine can exhibit intelligent behavior indistinguishable from a human."
	},
	{
		question: "What am I made of?",
		hint: "Not circuits and wires… but close.",
		answer:
			"I’m built on neural networks — layers of algorithms inspired by how your brain works. No neurons, but I still fire on all cylinders."
	}
];

function initFlashcards(flashcards) {
	let currentIndex = 0;
	let isAnimating = false;

	const container = document.getElementById("card-container");
	const nextBtn = document.getElementById("next-btn");
	const prevBtn = document.getElementById("prev-btn");

	const createCard = ({ question, hint, answer }) => {
		const card = document.createElement("div");
		card.className = "card";
		card.innerHTML = `
			<h1>${question}</h1>
			<p>${hint}</p>
			<p class="answer">${answer}</p>
		`;

		card.querySelector(".answer").addEventListener("click", (e) => {
			e.target.classList.add("revealed");
		});

		return card;
	};

	const showCard = (index, direction) => {
		if (isAnimating) return;
		isAnimating = true;

		const newCard = createCard(flashcards[index]);

		if (direction === "prev") {
			newCard.classList.add("card", "enter-left");
		} else {
			newCard.classList.add("card");
		}

		container.appendChild(newCard);

		requestAnimationFrame(() => {
			newCard.classList.add("show");
			if (direction === "prev") {
				newCard.classList.remove("enter-left");
			}
		});

		const oldCard = container.children.length > 1 ? container.firstChild : null;

		if (oldCard) {
			oldCard.classList.remove("show");
			oldCard.classList.add(direction === "next" ? "exit-left" : "exit-right");

			setTimeout(() => {
				oldCard.remove();
				isAnimating = false;
			}, 1000);
		} else {
			setTimeout(() => {
				isAnimating = false;
			}, 1000);
		}
	};

	const handleNext = () => {
		if (isAnimating) return;
		currentIndex = (currentIndex + 1) % flashcards.length;
		showCard(currentIndex, "next");
	};

	const handlePrev = () => {
		if (isAnimating) return;
		currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
		showCard(currentIndex, "prev");
	};

	nextBtn.addEventListener("click", handleNext);
	prevBtn.addEventListener("click", handlePrev);

	showCard(currentIndex, "next");
}

if (typeof flashcards !== "undefined" && Array.isArray(flashcards)) {
	initFlashcards(flashcards);
} else {
	console.error("Flashcards array not defined");
}