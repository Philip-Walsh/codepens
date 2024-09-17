document.addEventListener("DOMContentLoaded", init, false);

const TOTAL_QUESTIONS = 20;
const QUESTION_SCORE = 5;
const options = ["A", "B", "C", "D"];

let score;
let random_questions;
let correct_option;

function init() {
	setGameState();
	document.getElementById("restart").addEventListener("click", setGameState);
	document.getElementById("submit").addEventListener("click", submitAnswer);
}
function submitAnswer() {
	let answer = document.querySelector('input[name="question"]:checked').value;
	if (!answer) {
		return;
	}
	document.getElementById("submit").style.display = "none";
	if (answer === correct_option) {
		score += QUESTION_SCORE;
		updateScore();
		addSuccess();
	} else {
		addFailure();
	}
	if (random_questions.length === 0) {
		addGameOver();
	} else {
		setTimeout(() => {
			addQuestion();
			document.getElementById("submit").style.display = "block";
		}, 1000);
	}
}

function addSuccess() {
	const quiz = document.querySelector("#quiz");
	quiz.innerHTML = "";
	const successDiv = document.createElement("div");
	successDiv.setAttribute("class", "success");
	successDiv.innerHTML = "Correct!";
	quiz.appendChild(successDiv);
	setTimeout(() => {
		quiz.innerHTML = "";
	}, 1000);
}

function addFailure() {
	const quiz = document.querySelector("#quiz");
	quiz.innerHTML = "";
	const failureDiv = document.createElement("div");
	failureDiv.setAttribute("class", "failure");
	failureDiv.innerHTML = "Wrong!";
	quiz.appendChild(failureDiv);
	setTimeout(() => {
		quiz.innerHTML = "";
	}, 1000);
}
function addGameOver() {
	const quiz = document.querySelector("#quiz");
	quiz.innerHTML = "";
	const successDiv = document.createElement("div");
	successDiv.setAttribute("class", "success");
	successDiv.innerHTML = "Game Over";
	quiz.appendChild(successDiv);
}
function updateScore() {
	document.getElementById("score").innerHTML = score;
}

function addQuestion() {
	const current_question = random_questions.pop();
	const quiz = document.querySelector("#quiz");
	quiz.innerHTML = "";
	const fieldset = document.createElement("fieldset");
	const ledgend = document.createElement("ledgend");
	const question = document.createElement("p");
	question.innerHTML = current_question.question;
	ledgend.appendChild(question);
	fieldset.appendChild(ledgend);

	correct_option = options[getRandomListItem(options)];
	let dummy_answers = shuffle(current_question.fake_answers);
	for (const opt of options) {
		let ans = "";
		if (opt === correct_option) {
			ans = current_question.correct_answer;
		} else {
			ans = dummy_answers.pop();
		}
		const label = document.createElement("label");
		label.setAttribute("for", `option${opt}`);
		const input = document.createElement("input");
		input.setAttribute("type", "radio");
		input.setAttribute("id", `option${opt}`);
		input.setAttribute("name", "question");
		input.setAttribute("value", opt);
		const answer = document.createElement("p");
		answer.textContent = ans;
		label.appendChild(input);
		label.appendChild(answer);
		fieldset.appendChild(label);
	}
	quiz.appendChild(fieldset);
}
function getRandomListItem(list) {
	return Math.floor(Math.random() * list.length);
}

function setGameState() {
	score = 0;
	setQuestions();
	addQuestion();
}

function shuffle(array) {
	let shuffledArray = [...array];
	let currentIndex = shuffledArray.length;

	while (currentIndex != 0) {
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
			shuffledArray[randomIndex],
			shuffledArray[currentIndex]
		];
	}
	return shuffledArray;
}

function setQuestions() {
	random_questions = [];
	let indexes = [];
	while (indexes.length < TOTAL_QUESTIONS) {
		let index = getRandomListItem(all_questions);
		if (!indexes.includes(index)) {
			indexes.push(index);
			random_questions.push(all_questions[index]);
		}
	}
}

const all_questions = [
	{
		question: "Which cryptid is known as the 'Loch Ness Monster'?",
		correct_answer: "Nessie",
		fake_answers: ["Bigfoot", "Chupacabra", "Yeti"]
	},
	{
		question:
			"What creature is said to drain livestock of their blood in Latin American folklore?",
		correct_answer: "Chupacabra",
		fake_answers: ["Wendigo", "Jersey Devil", "Kraken"]
	},
	{
		question:
			"Which cryptid is often associated with the forests of the Pacific Northwest?",
		correct_answer: "Bigfoot",
		fake_answers: ["Mothman", "Kraken", "Thunderbird"]
	},
	{
		question:
			"What winged creature is said to be a harbinger of disaster in West Virginia?",
		correct_answer: "Mothman",
		fake_answers: ["Banshee", "Bigfoot", "Wendigo"]
	},
	{
		question: "Which giant sea creature has roots in Norse mythology?",
		correct_answer: "Kraken",
		fake_answers: ["Loch Ness Monster", "Ogopogo", "Thunderbird"]
	},
	{
		question: "What cryptid is rumored to roam the Pine Barrens of New Jersey?",
		correct_answer: "Jersey Devil",
		fake_answers: ["Mothman", "Chupacabra", "Kraken"]
	},
	{
		question:
			"Which cryptid is believed to be a spirit of cannibalism in Native American folklore?",
		correct_answer: "Wendigo",
		fake_answers: ["Chupacabra", "Mothman", "Yeti"]
	},
	{
		question:
			"What Himalayan creature is also known as the 'Abominable Snowman'?",
		correct_answer: "Yeti",
		fake_answers: ["Bigfoot", "Wendigo", "Kraken"]
	},
	{
		question:
			"Which cryptid is said to resemble a large, winged serpent and is rumored to inhabit Lake Okanagan in Canada?",
		correct_answer: "Ogopogo",
		fake_answers: ["Nessie", "Chupacabra", "Thunderbird"]
	},
	{
		question:
			"What creature from Australian Aboriginal mythology is said to dwell in swamps and billabongs?",
		correct_answer: "Bunyip",
		fake_answers: ["Mokele-Mbembe", "Wendigo", "Yowie"]
	},
	{
		question:
			"Which large, human-like cryptid is often reported in the Himalayas?",
		correct_answer: "Yeti",
		fake_answers: ["Bigfoot", "Wendigo", "Bunyip"]
	},
	{
		question:
			"Which cryptid is known for having red glowing eyes and has been linked to the collapse of the Silver Bridge in 1967?",
		correct_answer: "Mothman",
		fake_answers: ["Jersey Devil", "Chupacabra", "Thunderbird"]
	},
	{
		question:
			"What is the name of the cryptid said to be a living dinosaur, believed to inhabit the Congo River Basin?",
		correct_answer: "Mokele-Mbembe",
		fake_answers: ["Kraken", "Thunderbird", "Ogopogo"]
	},
	{
		question:
			"Which winged cryptid is said to resemble a giant bird and is a common feature in Native American mythology?",
		correct_answer: "Thunderbird",
		fake_answers: ["Mothman", "Ropen", "Bunyip"]
	},
	{
		question:
			"What cryptid, known for being sighted in Maryland, is a goat-human hybrid often blamed for livestock killings?",
		correct_answer: "Goatman",
		fake_answers: ["Wendigo", "Jersey Devil", "Bigfoot"]
	},
	{
		question:
			"Which cryptid is said to resemble a giant bat or pterosaur and has been sighted in Papua New Guinea?",
		correct_answer: "Ropen",
		fake_answers: ["Mothman", "Thunderbird", "Chupacabra"]
	},
	{
		question:
			"Which cryptid is rumored to inhabit the swamps of Louisiana, often described as a werewolf-like creature?",
		correct_answer: "Rougarou",
		fake_answers: ["Skinwalker", "Goatman", "Chupacabra"]
	},
	{
		question:
			"What cryptid is said to be a giant ape-like creature that roams the mountains of North Carolina?",
		correct_answer: "Knobby",
		fake_answers: ["Bigfoot", "Skunk Ape", "Wendigo"]
	},
	{
		question:
			"Which cryptid is believed to be a prehistoric monster living in Lake Champlain, often called the 'American Loch Ness Monster'?",
		correct_answer: "Champ",
		fake_answers: ["Nessie", "Ogopogo", "Mokele-Mbembe"]
	},
	{
		question:
			"What mythical creature from Filipino folklore is said to separate its upper body from its lower half at night?",
		correct_answer: "Manananggal",
		fake_answers: ["Chupacabra", "Bunyip", "Skinwalker"]
	},
	{
		question:
			"Which cryptid from West Virginia is described as a large, headless, coal-covered monster?",
		correct_answer: "Flatwoods Monster",
		fake_answers: ["Jersey Devil", "Mothman", "Goatman"]
	},
	{
		question:
			"What cryptid is described as a large wolf-like creature with red eyes that has been sighted in Wisconsin?",
		correct_answer: "Beast of Bray Road",
		fake_answers: ["Wendigo", "Bigfoot", "Rougarou"]
	},
	{
		question:
			"Which flying cryptid is said to resemble a dragon and has been sighted in Texas?",
		correct_answer: "Olitiau",
		fake_answers: ["Ropen", "Thunderbird", "Kraken"]
	},
	{
		question:
			"Which cryptid is rumored to be a giant fish inhabiting lakes in the Ozarks?",
		correct_answer: "White River Monster",
		fake_answers: ["Nessie", "Ogopogo", "Champ"]
	},
	{
		question:
			"Which cryptid is said to live in the Pine Ridge Indian Reservation and resembles a wolf or hyena-like creature?",
		correct_answer: "Shunka Warakin",
		fake_answers: ["Chupacabra", "Goatman", "Skinwalker"]
	},
	{
		question:
			"What creature from Japanese folklore is said to be a shapeshifting fox with magical powers?",
		correct_answer: "Kitsune",
		fake_answers: ["Tanuki", "Wendigo", "Manananggal"]
	},
	{
		question:
			"Which cryptid is a giant, ape-like creature from Florida, often described as having a terrible smell?",
		correct_answer: "Skunk Ape",
		fake_answers: ["Bigfoot", "Yeti", "Knobby"]
	},
	{
		question:
			"What cryptid from Appalachian folklore is a feline creature with saber-like teeth and glowing eyes?",
		correct_answer: "Wampus Cat",
		fake_answers: ["Chupacabra", "Beast of Bray Road", "Rougarou"]
	},
	{
		question:
			"Which cryptid from Japanese mythology is a giant turtle with spikes on its back and a snake for a tail?",
		correct_answer: "Kappa",
		fake_answers: ["Kraken", "Ropen", "Bunyip"]
	},
	{
		question:
			"What mythical creature is said to be a massive snake living in the Amazon rainforest, capable of devouring large prey?",
		correct_answer: "Yacumama",
		fake_answers: ["Basilisk", "Mokele-Mbembe", "Ogopogo"]
	},
	{
		question:
			"Which cryptid is said to be a spectral black dog that haunts the English countryside?",
		correct_answer: "Black Shuck",
		fake_answers: ["Beast of Bray Road", "Wampus Cat", "Goatman"]
	},
	{
		question:
			"Which cryptid is rumored to inhabit the Gobi Desert, described as a large, deadly worm that can kill with electricity?",
		correct_answer: "Mongolian Death Worm",
		fake_answers: ["Chupacabra", "Rougarou", "Yeti"]
	},
	{
		question:
			"What winged cryptid has been reported flying over the city of Point Pleasant, West Virginia in the 1960s?",
		correct_answer: "Mothman",
		fake_answers: ["Thunderbird", "Ropen", "Jersey Devil"]
	},
	{
		question:
			"Which cryptid from Russian folklore is believed to be a large, hairy hominid that roams the Siberian wilderness?",
		correct_answer: "Almas",
		fake_answers: ["Yeti", "Bigfoot", "Skunk Ape"]
	},
	{
		question:
			"Which cryptid from Mexican folklore is described as a massive bird with a wingspan of over 15 feet?",
		correct_answer: "El Cuero",
		fake_answers: ["Thunderbird", "Ropen", "Olitiau"]
	},
	{
		question:
			"What mythical creature from Irish folklore is said to wail when someone is about to die?",
		correct_answer: "Banshee",
		fake_answers: ["Mothman", "Chupacabra", "Rougarou"]
	},
	{
		question:
			"Which cryptid is said to live in the lakes of Iceland and resembles a giant worm or serpent?",
		correct_answer: "Lagarfljót Worm",
		fake_answers: ["Ogopogo", "Nessie", "Kraken"]
	},
	{
		question:
			"What cryptid from West Virginia folklore is described as a massive reptilian creature with glowing green eyes?",
		correct_answer: "Flatwoods Monster",
		fake_answers: ["Mothman", "Jersey Devil", "Chupacabra"]
	},
	{
		question:
			"Which cryptid is known for having a long neck and flippers, similar to a plesiosaur, and is said to inhabit Lake Okanagan?",
		correct_answer: "Ogopogo",
		fake_answers: ["Loch Ness Monster", "Champ", "Kraken"]
	},
	{
		question:
			"What cryptid from Chilean mythology is described as a large serpent with the ability to hypnotize people and animals?",
		correct_answer: "Culebrón",
		fake_answers: ["Yacumama", "Mokele-Mbembe", "Chupacabra"]
	},
	{
		question:
			"Which cryptid is said to resemble a large, flying humanoid with bat-like wings, sighted in Mexico and Texas?",
		correct_answer: "La Lechuza",
		fake_answers: ["Mothman", "Thunderbird", "Ropen"]
	},
	{
		question:
			"What cryptid from Central Africa is said to resemble a giant, amphibious elephant with a long neck?",
		correct_answer: "Emela-Ntouka",
		fake_answers: ["Mokele-Mbembe", "Kraken", "Yeti"]
	},
	{
		question:
			"Which cryptid from Caribbean folklore is a bloodsucking spirit that shapeshifts into an old woman by day and a bat by night?",
		correct_answer: "Soucouyant",
		fake_answers: ["Manananggal", "Chupacabra", "Aswang"]
	},
	{
		question:
			"What cryptid is said to be a massive, ape-like creature in the jungles of Sumatra, similar to Bigfoot?",
		correct_answer: "Orang Pendek",
		fake_answers: ["Skunk Ape", "Almas", "Knobby"]
	},
	{
		question:
			"Which cryptid is said to inhabit the waters off the coast of Greenland and is described as a sea serpent?",
		correct_answer: "Hafgufa",
		fake_answers: ["Kraken", "Ogopogo", "Nessie"]
	},
	{
		question:
			"What cryptid from Vietnamese folklore is described as a large, reptilian creature said to dwell in the Mekong River?",
		correct_answer: "Phaya Naga",
		fake_answers: ["Mokele-Mbembe", "Yacumama", "Kraken"]
	}
];
