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
    rotationY: 0.05
  },
  animation: {
    duration: 600,
    staggerDelay: 20
  },
  spread: {
    // These values are now controlled by CSS variables for responsive design
    yOffset: -30
  }
};

// Card data
const CardData = {
  suits: {
    clubs: "♣️",
    diamonds: "♦️",
    hearts: "❤️",
    spades: "♠️"
  },
  faceCards: {
    1: { letter: "A", face: "", name: "Ace" },
    11: { letter: "J", face: "🤴", name: "Jack" },
    12: { letter: "Q", face: "👸", name: "Queen" },
    13: { letter: "K", face: "👑", name: "King" }
  }
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
      
      this.deckElement.appendChild(card);
      this.cardElements.push(card);
    });
    
    // Force reflow to ensure the initial position is applied
    void this.deckElement.offsetHeight;
    
    // Now position all cards with animation
    this.cardElements.forEach((card, index) => {
      setTimeout(() => {
        const position = this.isSpread 
          ? this.calculateSpreadPosition(index, this.cardElements.length) 
          : this.calculateStackPosition(index, this.cardElements.length);
        
        this.applyCardPosition(card, position, animate);
      }, animate ? CardConfig.animation.staggerDelay * index : 0);
    });
  }
  
  /**
   * Create a card DOM element
   * @param {string} suit - The card suit
   * @param {number} value - The card value (1-13)
   * @returns {HTMLElement} - The card element
   */
  createCardElement(suit, value) {
    const card = document.createElement("div");
    card.className = "card";
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
    let face = "";
    
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
    return `
      <span class="corner top-left">
        <div>${letter}</div>
        <div>${face ? CardData.suits[suit] : ""}</div>
      </span>

      <span class="center ${!face ? "num num-" + value : "face"}">
        ${face || Array(value).fill(`<span>${CardData.suits[suit]}</span>`).join("")}
      </span>

      <div class="corner bottom-right">
        <div>${letter}</div>
        <span>${face ? CardData.suits[suit] : ""}</span>
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
      zIndex: index
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
    const angle = startAngle + (index * angleIncrement);
    
    // Calculate position based on angle
    const xOffset = Math.sin(angle * Math.PI / 180) * spreadDistance;
    
    return {
      transform: `
        translate(-50%, -50%)
        translateX(${xOffset}px)
        translateY(${CardConfig.spread.yOffset}px)
        translateZ(${index * 0.2}px)
        rotateY(${angle * 0.2}deg)
      `,
      zIndex: index
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
      
      // Bring selected card forward
      const selectedPosition = {
        transform: `
          translate(-50%, -50%)
          translateY(-60px)
          translateZ(30px)
          rotateX(-5deg)
          scale(1.1)
        `,
        zIndex: 1000
      };
      
      this.applyCardPosition(card, selectedPosition);
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
document.addEventListener("DOMContentLoaded", initializeApp);