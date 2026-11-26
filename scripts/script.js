
"use strict";

// Game settings and state
const game = {
    words: [],
    selectedWord: "",
    hint: "",
    guessedLetters: [],
    incorrectGuesses: 0,
    maxGuesses: 6,
    isGameOver: false
};

// HTML elements
const wordDisplay = document.getElementById("wordDisplay");
const hintText = document.getElementById("hintText");
const keyboard = document.getElementById("keyboard");
const guessCounter = document.getElementById("guessCounter");
const gameMessage = document.getElementById("gameMessage");
const hangmanImage = document.getElementById("hangmanImage");
const playAgainButton = document.getElementById("playAgainButton");

// Load word list from JSON
async function loadWords() {
    try {
        const response = await fetch("json/words.json");

        if (!response.ok) {
            throw new Error("Could not load the word list.");
        }

        game.words = await response.json();

        if (!game.words.length) {
            throw new Error("The word list is empty.");
        }

        startGame();

    } catch (error) {
        hintText.textContent = "Unable to load game words.";
        gameMessage.textContent = "Check your JSON file and folder location.";
        console.error(error);
    }
}

// Start or restart game
function startGame() {
    game.guessedLetters = [];
    game.incorrectGuesses = 0;
    game.isGameOver = false;

    const randomIndex = Math.floor(Math.random() * game.words.length);
    const selectedEntry = game.words[randomIndex];

    game.selectedWord = selectedEntry.word.toLowerCase();
    game.hint = selectedEntry.hint;

    hintText.textContent = game.hint;
    gameMessage.textContent = "Choose a letter to begin!";

    playAgainButton.hidden = true;

    updateHangmanImage();
    updateGuessCounter();
    displayWord();
    createKeyboard();
}

// Display word
function displayWord() {
    wordDisplay.innerHTML = "";

    for (const letter of game.selectedWord) {
        const letterBox = document.createElement("span");

        letterBox.classList.add("letter");

        if (game.guessedLetters.includes(letter)) {
            letterBox.textContent = letter.toUpperCase();
        } else {
            letterBox.textContent = "";
        }

        wordDisplay.appendChild(letterBox);
    }
}

// Create keyboard
function createKeyboard() {
    keyboard.innerHTML = "";

    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    for (const letter of alphabet) {
        const button = document.createElement("button");

        button.textContent = letter.toUpperCase();
        button.classList.add("letter-button");
        button.setAttribute("aria-label", `Guess letter ${letter}`);

        button.addEventListener("click", function () {
            handleGuess(letter, button);
        });

        keyboard.appendChild(button);
    }
}

// Handle guesses
function handleGuess(letter, button) {
    if (game.isGameOver || game.guessedLetters.includes(letter)) {
        return;
    }

    game.guessedLetters.push(letter);
    button.disabled = true;

    if (game.selectedWord.includes(letter)) {
        button.classList.add("correct");

        gameMessage.textContent = "Correct! Keep going!";

        displayWord();
        checkWin();

    } else {
        button.classList.add("wrong");

        game.incorrectGuesses++;

        gameMessage.textContent = "Wrong guess! Try another letter.";

        updateHangmanImage();
        updateGuessCounter();
        checkLoss();
    }
}

// Update hangman image
function updateHangmanImage() {
    hangmanImage.src = `images/hangman-${game.incorrectGuesses}.svg`;
}

// Update counter
function updateGuessCounter() {
    guessCounter.textContent =
        `${game.incorrectGuesses} / ${game.maxGuesses}`;
}

// Check win
function checkWin() {
    const wordGuessed = [...game.selectedWord].every(letter =>
        game.guessedLetters.includes(letter)
    );

    if (wordGuessed) {
        game.isGameOver = true;
        gameMessage.textContent = "Congratulations! You solved the mystery!";
        endGame();
    }
}

// Check loss
function checkLoss() {
    if (game.incorrectGuesses >= game.maxGuesses) {
        game.isGameOver = true;

        gameMessage.textContent =
            `Game over! The word was ${game.selectedWord.toUpperCase()}.`;

        displayWordAfterLoss();
        endGame();
    }
}

// Reveal word after losing
function displayWordAfterLoss() {
    game.guessedLetters = [...game.selectedWord];
    displayWord();
}

// End game
function endGame() {
    keyboard.querySelectorAll("button").forEach(button => {
        button.disabled = true;
    });

    playAgainButton.hidden = false;
}

// Play again
playAgainButton.addEventListener("click", startGame);

// Physical keyboard support
document.addEventListener("keydown", function (event) {
    const letter = event.key.toLowerCase();

    if (/^[a-z]$/.test(letter)) {
        const buttons = keyboard.querySelectorAll("button");

        const button = [...buttons].find(btn =>
            btn.textContent.toLowerCase() === letter
        );

        if (button && !button.disabled && !game.isGameOver) {
            handleGuess(letter, button);
        }
    }
});

// Animation
function animateGame() {
    document.querySelector(".game-container").classList.add("fade-in");
}

// Initialize
animateGame();
loadWords();
