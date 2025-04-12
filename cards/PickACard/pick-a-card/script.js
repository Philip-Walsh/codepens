let deck = [];

let suits = {
  clubs: "♣️",
  diamonds: "♦️",
  hearts: "❤️",
  spades: "♠️"
};

let faceCards = {
  1: { letter: "A", face: "", name: "Ace" },
  11: { letter: "J", face: "🤴", name: "Jack" },
  12: { letter: "Q", face: "👸", name: "Queen" },
  13: { letter: "K", face: "👑", name: "King" }
};

document.addEventListener("DOMContentLoaded", init);

function createCard(suit, value) {
  const card = document.createElement("div");
  card.className = "card";

  let letter = value;
  let face = "";
  if (faceCards[value]) {
    letter = faceCards[value].letter;
    face = faceCards[value].face;
    if (face === "") {
      face = suits[suit];
    }
  }

  card.innerHTML = `
  <span class="corner top-left">
    <div>${letter}</div>
    <div>${face ? suits[suit] : ""}</div>
  </span>

  <span class="center ${!face ? "num num-" + value : "face"}">
    ${face || Array(value).fill(`<span>${suits[suit]}</span>`).join("")}
  </d>

  <div class="corner bottom-right">
    <div>${letter}</div>
    <span>${face ? suits[suit] : ""}</span>
  </div>
`;
  return card;
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function init() {
  const deck = document.getElementById('deck');
  deckList = [];

  Object.keys(suits).forEach(suit => {
    for (let i = 1; i <= 13; i++) {
      deckList.push({ suit, value: i });
    }
  });

  shuffle(deckList);

  deckList.forEach((cardData, index) => {
    const card = createCard(cardData.suit, cardData.value);
    card.dataset.index = index;
    deck.appendChild(card);
  });
}