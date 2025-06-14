/**
 * Card Deck Game - A reusable card deck implementation
 *
 * This module provides a clean, modular implementation of an interactive
 * card deck with animations and user interactions.
 */

// Configuration
const CardConfig = {
  offset: {
    x: 0.3,
    y: 0.2,
    z: 0.5,
    rotationX: 0.1,
    rotationY: 0.05,
  },
  animation: {
    duration: 600,
    staggerDelay: 20,
  },
  spread: {
    // These values are now controlled by CSS variables for responsive design
    yOffset: -30,
  },
};

// Card data
const CardData = {
  suits: {
    clubs: '♣️',
    diamonds: '♦️',
    hearts: '❤️',
    spades: '♠️',
  },
  faceCards: {
    1: { letter: 'A', face: '', name: 'Ace' },
    11: { letter: 'J', face: '🤴', name: 'Jack' },
    12: { letter: 'Q', face: '👸', name: 'Queen' },
    13: { letter: 'K', face: '👑', name: 'King' },
  },
  // Card colors for classic look
  colors: {
    hearts: '#d40000',
    diamonds: '#d40000',
    clubs: '#000000',
    spades: '#000000',
  },
};

/**
 * CardDeck - Main class for managing a deck of cards
 */
class CardDeck {
  constructor(deckElementId) {
    this.deckElement = document.getElementById(deckElementId);
    this.cards = [];
    this.cardElements = [];
    this.selectedCard = null;
    this.isSpread = false;
    this.audioContext = null;
    this.gameMode = false;

    // Game state
    this.gameState = {
      active: false,
      score: 0,
      currentCard: null,
      nextCard: null,
      cardsPlayed: 0,
    };

    // Initialize the deck
    this.initialize();
  }

  /**
   * Initialize the deck with shuffled cards
   */
  initialize() {
    this.createDeck();
    this.shuffleDeck();
    this.renderDeck(true);
    this.setupEventListeners();
    this.setupGameControls();
  }

  /**
   * Create a standard 52-card deck
   */
  createDeck() {
    this.cards = Object.keys(CardData.suits).flatMap(suit =>
      Array.from({ length: 13 }, (_, i) => ({ suit, value: i + 1 }))
    );
  }

  /**
   * Shuffle the deck using Fisher-Yates algorithm
   */
  shuffleDeck() {
    // Save current state
    const wasSpread = this.isSpread;

    // Always collapse cards before shuffling
    if (this.isSpread) {
      this.toggleSpread(false);
    }

    // Play shuffle sound
    this.playShuffleSound();

    // Gather all cards to center first
    this.cardElements.forEach(card => {
      card.style.transform = 'translate(-50%, -50%)';
      card.classList.remove('selected');
    });

    // Wait for cards to gather
    setTimeout(() => {
      // Shuffle the deck
      this.cards = this.shuffleArray(this.cards);

      // Re-render with animation
      this.renderDeck(true);

      // If it was spread before, spread it again after shuffling
      if (wasSpread) {
        setTimeout(() => this.toggleSpread(true), CardConfig.animation.duration + 100);
      }
    }, 300);
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   * @param {Array} array - The array to shuffle
   * @returns {Array} - A new shuffled array
   */
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  /**
   * Render the deck to the DOM
   * @param {boolean} animate - Whether to animate the cards
   */
  renderDeck(animate = true) {
    // Clear the deck element
    this.deckElement.innerHTML = '';

    // Reset selected card
    this.selectedCard = null;
    this.cardElements = [];

    // Create all cards first
    this.cards.forEach((cardData, index) => {
      const card = this.createCardElement(cardData.suit, cardData.value);
      card.dataset.index = index;

      // Start all cards in center with no transition
      card.style.transform = 'translate(-50%, -50%)';
      card.style.transition = 'none';

      // Add dealing animation class if animating
      if (animate) {
        card.classList.add('card-dealing');
        // Stagger the animation for each card
        card.style.animationDelay = `${index * 0.05}s`;
      }

      this.deckElement.appendChild(card);
      this.cardElements.push(card);
    });

    // Force reflow to ensure the initial position is applied
    void this.deckElement.offsetHeight;

    // Now position all cards with animation
    this.cardElements.forEach((card, index) => {
      setTimeout(
        () => {
          const position = this.isSpread
            ? this.calculateSpreadPosition(index, this.cardElements.length)
            : this.calculateStackPosition(index, this.cardElements.length);

          // Remove the dealing animation class after it's complete
          setTimeout(() => {
            card.classList.remove('card-dealing');
          }, 500);

          this.applyCardPosition(card, position, animate);
        },
        animate ? CardConfig.animation.staggerDelay * index : 0
      );
    });
  }

  /**
   * Create a card DOM element
   * @param {string} suit - The card suit
   * @param {number} value - The card value (1-13)
   * @returns {HTMLElement} - The card element
   */
  createCardElement(suit, value) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.suit = suit;
    card.dataset.value = value;

    const { letter, face } = this.getCardDisplay(value, suit);
    card.innerHTML = this.generateCardHTML(letter, face, value, suit);

    // Add click handler
    card.addEventListener('click', () => this.handleCardClick(card));

    return card;
  }

  /**
   * Get the display details for a card
   * @param {number} value - The card value
   * @param {string} suit - The card suit
   * @returns {Object} - The display details
   */
  getCardDisplay(value, suit) {
    let letter = value;
    let face = '';

    if (CardData.faceCards[value]) {
      letter = CardData.faceCards[value].letter;
      face = CardData.faceCards[value].face || CardData.suits[suit];
    }

    return { letter, face };
  }

  /**
   * Generate HTML for a card
   * @param {string|number} letter - The card letter/number
   * @param {string} face - The card face character
   * @param {number} value - The card value
   * @param {string} suit - The card suit
   * @returns {string} - The HTML for the card
   */
  generateCardHTML(letter, face, value, suit) {
    // Apply classic card coloring
    const color = CardData.colors[suit];

    return `
      <span class="corner top-left" style="color: ${color}">
        <div>${letter}</div>
        <div>${face ? CardData.suits[suit] : ''}</div>
      </span>

      <span class="center ${!face ? 'num num-' + value : 'face'}" style="color: ${color}">
        ${face || Array(value).fill(`<span>${CardData.suits[suit]}</span>`).join('')}
      </span>

      <div class="corner bottom-right" style="color: ${color}">
        <div>${letter}</div>
        <span>${face ? CardData.suits[suit] : ''}</span>
      </div>
    `;
  }

  /**
   * Calculate the position for a card in the stack
   * @param {number} index - The card index
   * @param {number} total - The total number of cards
   * @returns {Object} - The position object
   */
  calculateStackPosition(index, total) {
    return {
      transform: `
        translate(-50%, -50%)
        translateX(${index * CardConfig.offset.x}px)
        translateY(${index * CardConfig.offset.y}px)
        translateZ(${-index * CardConfig.offset.z}px)
        rotateX(${index * CardConfig.offset.rotationX}deg)
        rotateY(${index * CardConfig.offset.rotationY}deg)
      `,
      zIndex: index,
    };
  }

  /**
   * Calculate the position for a card in the spread
   * @param {number} index - The card index
   * @param {number} total - The total number of cards
   * @returns {Object} - The position object
   */
  calculateSpreadPosition(index, total) {
    // Get CSS variables for responsive design
    const computedStyle = getComputedStyle(document.documentElement);
    const spreadDistance = parseInt(computedStyle.getPropertyValue('--spread-distance')) || 250;
    const maxAngle = parseInt(computedStyle.getPropertyValue('--spread-angle')) || 60;

    // Calculate angle based on position in deck and total cards
    const totalAngle = Math.min(maxAngle * 2, 160);
    const startAngle = -totalAngle / 2;
    const angleIncrement = totalAngle / (total - 1 || 1);
    const angle = startAngle + index * angleIncrement;

    // Calculate position based on angle
    const xOffset = Math.sin((angle * Math.PI) / 180) * spreadDistance;
    const yOffset =
      Math.cos((angle * Math.PI) / 180) * (spreadDistance * 0.1) + CardConfig.spread.yOffset;

    // Add slight rotation for a more natural fan effect
    const rotation = angle * 0.8;

    return {
      transform: `
        translate(-50%, -50%)
        translateX(${xOffset}px)
        translateY(${yOffset}px)
        translateZ(${index * 0.2}px)
        rotateZ(${rotation}deg)
        rotateY(${angle * 0.2}deg)
      `,
      zIndex: index,
    };
  }

  /**
   * Apply a position to a card
   * @param {HTMLElement} card - The card element
   * @param {Object} position - The position object
   * @param {boolean} animate - Whether to animate the transition
   */
  applyCardPosition(card, position, animate = true) {
    if (animate) {
      // Apply transition for smooth animation
      card.style.transition = `transform ${CardConfig.animation.duration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
    } else {
      card.style.transition = 'none';
    }

    card.style.transform = position.transform;
    card.style.zIndex = position.zIndex;
  }

  /**
   * Handle a card click event
   * @param {HTMLElement} card - The clicked card element
   */
  handleCardClick(card) {
    const index = this.cardElements.indexOf(card);

    if (this.selectedCard === card) {
      // Deselect card
      this.selectedCard = null;
      card.classList.remove('selected');

      // Return to current position (spread or stacked)
      const position = this.isSpread
        ? this.calculateSpreadPosition(index, this.cardElements.length)
        : this.calculateStackPosition(index, this.cardElements.length);

      this.applyCardPosition(card, position);
    } else {
      // Deselect previous card if any
      if (this.selectedCard) {
        const prevIndex = this.cardElements.indexOf(this.selectedCard);
        this.selectedCard.classList.remove('selected');

        const prevPosition = this.isSpread
          ? this.calculateSpreadPosition(prevIndex, this.cardElements.length)
          : this.calculateStackPosition(prevIndex, this.cardElements.length);

        this.applyCardPosition(this.selectedCard, prevPosition);
      }

      // Select new card
      this.selectedCard = card;
      card.classList.add('selected');

      // Add a subtle sound effect for card selection
      this.playCardSound();

      // Bring selected card forward
      const selectedPosition = {
        transform: `
          translate(-50%, -50%)
          translateY(-60px)
          translateZ(30px)
          rotateX(-5deg)
          scale(1.1)
        `,
        zIndex: 1000,
      };

      this.applyCardPosition(card, selectedPosition);
    }
  }

  /**
   * Play a subtle card sound effect
   */
  playCardSound() {
    // Create audio context on first interaction
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  /**
   * Play a shuffle sound effect
   */
  playShuffleSound() {
    // Create audio context on first interaction
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Create multiple short sounds for shuffling effect
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(
          800 + Math.random() * 400,
          this.audioContext.currentTime
        );

        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
      }, i * 60);
    }
  }

  /**
   * Toggle the spread state of the deck
   * @param {boolean|null} shouldSpread - Whether to spread the cards
   */
  toggleSpread(shouldSpread = null) {
    // If no value provided, toggle current state
    this.isSpread = shouldSpread !== null ? shouldSpread : !this.isSpread;

    // Reset selected card
    if (this.selectedCard) {
      this.selectedCard.classList.remove('selected');
      this.selectedCard = null;
    }

    this.cardElements.forEach((card, index) => {
      const position = this.isSpread
        ? this.calculateSpreadPosition(index, this.cardElements.length)
        : this.calculateStackPosition(index, this.cardElements.length);

      this.applyCardPosition(card, position, true);

      if (this.isSpread) {
        card.classList.add('spread');
      } else {
        card.classList.remove('spread');
      }
    });
  }

  /**
   * Set up event listeners for the deck
   */
  setupEventListeners() {
    document.getElementById('shuffle-btn').addEventListener('click', () => this.shuffleDeck());
    document.getElementById('spread-btn').addEventListener('click', () => this.toggleSpread());
    document.getElementById('game-btn').addEventListener('click', () => this.toggleGameMode());
  }

  /**
   * Set up game control event listeners
   */
  setupGameControls() {
    document.getElementById('higher-btn').addEventListener('click', () => this.makeGuess('higher'));
    document.getElementById('lower-btn').addEventListener('click', () => this.makeGuess('lower'));
  }

  /**
   * Toggle game mode on/off
   */
  toggleGameMode() {
    this.gameMode = !this.gameMode;
    const gameControls = document.getElementById('game-controls');

    if (this.gameMode) {
      // Start game
      gameControls.classList.add('active');
      document.getElementById('game-btn').textContent = 'Exit Game';
      this.startGame();
    } else {
      // End game
      gameControls.classList.remove('active');
      document.getElementById('game-btn').textContent = 'Play High-Low';
      this.endGame();
    }
  }

  /**
   * Start a new High-Low game
   */
  startGame() {
    // Reset game state
    this.gameState = {
      active: true,
      score: 0,
      currentCard: null,
      nextCard: null,
      cardsPlayed: 0,
    };

    // Update score display
    document.getElementById('score').textContent = '0';
    document.getElementById('game-message').textContent = '';
    document.getElementById('game-message').className = 'game-message';

    // Shuffle deck and deal first card
    this.shuffleDeck();

    // Deal first card
    setTimeout(() => {
      this.dealNextCard();
    }, 1000);
  }

  /**
   * End the current game
   */
  endGame() {
    this.gameState.active = false;

    // Clear the current card display
    const currentCardDisplay = document.getElementById('current-card-display');
    currentCardDisplay.innerHTML = '';

    // Show final score
    const finalScore = this.gameState.score;
    const message = `Game Over! Final Score: ${finalScore}`;
    this.showGameMessage(message, 'neutral');
  }

  /**
   * Deal the next card in the game
   */
  dealNextCard() {
    if (!this.gameState.active) return;

    // Get the next card from the deck
    if (this.gameState.currentCard === null) {
      // First card
      this.gameState.currentCard = this.cards.pop();
      this.displayGameCard(this.gameState.currentCard);
      this.showGameMessage('Higher or Lower?', 'neutral');
    } else {
      // Move next card to current
      this.gameState.currentCard = this.gameState.nextCard;
      this.displayGameCard(this.gameState.currentCard);
    }

    // Prepare next card
    if (this.cards.length > 0) {
      this.gameState.nextCard = this.cards.pop();
    } else {
      // End game if no more cards
      this.showGameMessage('No more cards! Game Over.', 'neutral');
      setTimeout(() => this.endGame(), 2000);
    }

    this.gameState.cardsPlayed++;
  }

  /**
   * Display a card in the game area
   * @param {Object} cardData - The card data to display
   */
  displayGameCard(cardData) {
    const cardDisplay = document.getElementById('current-card-display');
    cardDisplay.innerHTML = '';

    const cardElement = this.createCardElement(cardData.suit, cardData.value);
    cardElement.style.position = 'absolute';
    cardElement.style.transform = 'translate(-50%, -50%)';
    cardElement.style.left = '50%';
    cardElement.style.top = '50%';
    cardElement.classList.add('game-card');
    cardElement.style.cursor = 'default';

    // Remove click event
    const newCard = cardElement.cloneNode(true);
    cardDisplay.appendChild(newCard);

    // Play card sound
    this.playCardSound();
  }

  /**
   * Make a guess in the High-Low game
   * @param {string} guess - The player's guess ('higher' or 'lower')
   */
  makeGuess(guess) {
    if (!this.gameState.active || !this.gameState.nextCard) return;

    // Disable buttons during animation
    const higherBtn = document.getElementById('higher-btn');
    const lowerBtn = document.getElementById('lower-btn');
    higherBtn.disabled = true;
    lowerBtn.disabled = true;

    const currentValue = this.getCardValue(this.gameState.currentCard);
    const nextValue = this.getCardValue(this.gameState.nextCard);

    let correct = false;
    if (guess === 'higher' && nextValue > currentValue) {
      correct = true;
    } else if (guess === 'lower' && nextValue < currentValue) {
      correct = true;
    } else if (nextValue === currentValue) {
      // Tie - no points
      this.showGameMessage("It's a tie! No points.", 'neutral');
      setTimeout(() => {
        this.dealNextCard();
        higherBtn.disabled = false;
        lowerBtn.disabled = false;
      }, 1500);
      return;
    }

    if (correct) {
      this.gameState.score++;
      document.getElementById('score').textContent = this.gameState.score;
      this.showGameMessage('Correct! +1 point', 'correct');
      this.playCorrectSound();
    } else {
      // Wrong guess - no "try again" message, just show the result and continue
      this.showGameMessage('Incorrect', 'incorrect');
      this.playIncorrectSound();
    }

    // Deal next card after a delay
    setTimeout(() => {
      this.dealNextCard();

      // Re-enable buttons
      higherBtn.disabled = false;
      lowerBtn.disabled = false;

      // Show prompt for next guess
      if (this.gameState.active && this.cards.length > 0) {
        setTimeout(() => {
          this.showGameMessage('Higher or Lower?', 'neutral');
        }, 500);
      }
    }, 1500);
  }

  /**
   * Get the numeric value of a card for comparison
   * @param {Object} card - The card object
   * @returns {number} - The numeric value (Ace = 1, J = 11, Q = 12, K = 13)
   */
  getCardValue(card) {
    return card.value;
  }

  /**
   * Display a message in the game message area
   * @param {string} message - The message to display
   * @param {string} type - The type of message ('correct', 'incorrect', or 'neutral')
   */
  showGameMessage(message, type) {
    const messageElement = document.getElementById('game-message');
    messageElement.textContent = message;
    messageElement.className = 'game-message';

    if (type !== 'neutral') {
      messageElement.classList.add(type);
    }
  }

  /**
   * Play a sound effect for correct guess
   */
  playCorrectSound() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * Play a sound effect for incorrect guess
   */
  playIncorrectSound() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }
}

/**
 * Initialize the application when the DOM is loaded
 */
function initializeApp() {
  // Create a new card deck
  const deck = new CardDeck('deck');
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
