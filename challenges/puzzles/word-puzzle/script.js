let secretWord = '';
let maxGuesses = 15;
let incorrectGuesses = 0;
let words = [];

window.onload = () => {
  readWordsFromFile('./dictionary.txt')
    .then(words => {
      words = words;
      startGame();
    })
    .catch(err => console.error(err));
};

function startGame() {
  pickSecretWord();
  addGoalLetters();
  addLetterButtons();
  displayRemainingGuesses();
  document.getElementById('game-over').innerHTML = '';
}

function addLetterButtons() {
  const letterButtonsContainer = document.getElementById('letter-buttons');
  letterButtonsContainer.innerHTML = ''; // Clear existing buttons
  for (let i = 0; i < 26; i++) {
    let letter = String.fromCharCode(97 + i);
    let button = document.createElement('button');
    button.innerHTML = letter;
    button.classList.add('letter-button');
    button.classList.add(`letter-${letter}`);
    button.addEventListener('click', () => {
      checkLetter(letter);
    });
    letterButtonsContainer.appendChild(button);
  }
}

function checkLetter(letter) {
  let goalLetters = document.getElementsByClassName('goal-letter');
  let isGuessCorrect = false;

  for (let i = 0; i < secretWord.length; i++) {
    if (secretWord[i] === letter) {
      goalLetters[i].classList.remove('not-found');
      goalLetters[i].innerHTML = letter; // Reveal the correct letter
      isGuessCorrect = true;
    }
  }

  document.getElementsByClassName(`letter-${letter}`)[0].disabled = true;

  if (!isGuessCorrect) {
    incorrectGuesses++;
    displayRemainingGuesses();
    if (incorrectGuesses >= maxGuesses) {
      endGame(false);
    }
  } else {
    if (checkWin()) {
      endGame(true);
    }
  }
}

function pickSecretWord() {
  secretWord = words[Math.floor(Math.random() * words.length)];
  console.log(secretWord);
}

function addGoalLetters() {
  const goalLettersContainer = document.getElementById('goal-letters');
  goalLettersContainer.innerHTML = ''; // Clear existing letters
  for (let i = 0; i < secretWord.length; i++) {
    let letter = document.createElement('span');
    letter.classList.add('goal-letter');
    letter.classList.add('not-found');
    letter.innerHTML = '_'; // Initially, show an underscore for each letter
    letter.dataset.letter = secretWord[i]; // Store the actual letter in a data attribute
    goalLettersContainer.appendChild(letter);
  }
}

function displayRemainingGuesses() {
  let guessesLeft = maxGuesses - incorrectGuesses;
  document.getElementById('guesses-left').innerText = guessesLeft;
}

function endGame(isWin) {
  disableAllButtons();
  showGameOverMessage(isWin);
}

function disableAllButtons() {
  let buttons = document.getElementsByClassName('letter-button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
  }
}

function showGameOverMessage(isWin) {
  let message = document.createElement('div');
  if (isWin) {
    message.innerHTML = 'Congratulations! You guessed the word: ' + secretWord;
  } else {
    message.innerHTML = 'Game Over! The word was: ' + secretWord;
  }
  document.getElementById('game-over').appendChild(message);
}

function checkWin() {
  let goalLetters = document.getElementsByClassName('goal-letter');
  for (let i = 0; i < goalLetters.length; i++) {
    if (goalLetters[i].classList.contains('not-found')) {
      return false;
    }
  }
  return true;
}

function resetGame() {
  incorrectGuesses = 0;
  startGame();
}

function readWordsFromFile(file) {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.open('GET', file);
    request.onload = () => {
      if (request.status === 200) {
        resolve(request.responseText.split('\n'));
      } else if (request.status === 0) {
        reject(
          Error(
            'Cross origin requests are only supported for protocol schemes: http, data, isolated-app, chrome-extension, chrome-untrusted, https, edge.'
          )
        );
      } else {
        reject(Error('Could not load file: ' + file));
      }
    };
    request.onerror = err => {
      reject(err);
    };
    request.send(null);
  });
}
