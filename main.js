// main.js
import { clearBoard, drawSnake, drawFood, drawGameOver } from './renderer.js';

const GRID_SIZE = 20;
const BOARD_SIZE = 700;
const GRID_COUNT = BOARD_SIZE / GRID_SIZE;

let snake = [];
let food = {};
let dx = 1, dy = 0;
let direction = 'right';
let score = 0;
let currentDifficulty = 'medium';
let highScore = localStorage.getItem(`snakeHighScore_${currentDifficulty}`) || localStorage.getItem('snakeHighScore') || 0;
let gameInterval = null;
let gameRunning = false;
let paused = false;
let currentSpeed = 130;

const scoreDisplay = document.getElementById('scoreDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const gameContainer = document.getElementById('gameContainer');
const pauseOverlay = document.getElementById('pauseOverlay');
const introduction = document.getElementById('introduction');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const resetButton = document.getElementById('resetButton');

const diffButtons = document.querySelectorAll('.diff-btn');
// Set up initial selection state
const initDiff = currentDifficulty;
document.querySelectorAll(`.diff-btn[data-diff="${initDiff}"]`).forEach(b => b.classList.add('selected'));

document.body.addEventListener('click', (e) => {
  if (e.target.classList.contains('diff-btn')) {
    const selectedDiff = e.target.getAttribute('data-diff');
    
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll(`.diff-btn[data-diff="${selectedDiff}"]`).forEach(b => b.classList.add('selected'));
    
    currentDifficulty = selectedDiff;
    highScore = localStorage.getItem(`snakeHighScore_${currentDifficulty}`) || localStorage.getItem('snakeHighScore') || 0;
    
    if (gameRunning && !paused) {
      resetGame();
    } else {
      highScoreDisplay.textContent = highScore;
    }
  }
});

function initGame() {
  snake = [
    { x: 17, y: 17 },
    { x: 16, y: 17 },
    { x: 15, y: 17 }
  ];
  dx = 1; dy = 0;
  direction = 'right';
  score = 0;
  
  if (currentDifficulty === 'easy') currentSpeed = 160;
  else if (currentDifficulty === 'medium') currentSpeed = 130;
  else if (currentDifficulty === 'hard') currentSpeed = 90;

  scoreDisplay.textContent = score;
  highScore = localStorage.getItem(`snakeHighScore_${currentDifficulty}`) || localStorage.getItem('snakeHighScore') || 0;
  highScoreDisplay.textContent = highScore;
  spawnFood();
  clearBoard();
  drawFood(food);
  drawSnake(snake, direction);
}

function spawnFood() {
  do {
    food = {
      x: Math.floor(Math.random() * GRID_COUNT),
      y: Math.floor(Math.random() * GRID_COUNT)
    };
  } while (snake.some(seg => seg.x === food.x && seg.y === food.y));
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
    return gameOver();
  }

  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    return gameOver();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.textContent = score;
    
    if (score > highScore) {
      highScore = score;
      highScoreDisplay.textContent = highScore;
      localStorage.setItem(`snakeHighScore_${currentDifficulty}`, highScore);
    }
    
    let baseSpeed = 130;
    let minSpeed = 50;
    let dropPer5 = 10;
    
    if (currentDifficulty === 'easy') { baseSpeed = 160; minSpeed = 80; dropPer5 = 5; }
    else if (currentDifficulty === 'medium') { baseSpeed = 130; minSpeed = 50; dropPer5 = 10; }
    else if (currentDifficulty === 'hard') { baseSpeed = 90; minSpeed = 40; dropPer5 = 15; }
    
    let newSpeed = Math.max(minSpeed, baseSpeed - Math.floor(score / 5) * dropPer5);
    
    if (newSpeed !== currentSpeed) {
      currentSpeed = newSpeed;
      clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, currentSpeed);
    }
    
    spawnFood();
  } else {
    snake.pop();
  }
}

function gameLoop() {
  if (paused) return;
  moveSnake();
  clearBoard();
  drawFood(food);
  drawSnake(snake, direction);
}

function startGame() {
  introduction.style.display = 'none';
  gameContainer.style.display = 'flex';
  initGame();
  if (gameInterval) clearInterval(gameInterval);
  gameRunning = true;
  paused = false;
  pauseOverlay.style.display = 'none';
  stopButton.textContent = 'Stop';
  gameInterval = setInterval(gameLoop, currentSpeed);
}

function resetGame() {
  if (gameInterval) clearInterval(gameInterval);
  const overlay = document.querySelector('.game-over-overlay');
  if (overlay) overlay.remove();
  startGame();
}

function gameOver() {
  if (!gameRunning) return;
  gameRunning = false;
  clearInterval(gameInterval);
  drawGameOver(score, currentDifficulty);
}

function changeDirection(newDx, newDy, newDir) {
  if (!gameRunning || paused) return;
  // Prevent reverse
  if (dx * -1 === newDx && dy * -1 === newDy) return;
  
  dx = newDx;
  dy = newDy;
  direction = newDir;
}

// Keyboard controls
document.addEventListener('keydown', e => {
  switch(e.key) {
    case 'ArrowUp':    changeDirection(0, -1, 'up'); break;
    case 'ArrowDown':  changeDirection(0, 1, 'down'); break;
    case 'ArrowLeft':  changeDirection(-1, 0, 'left'); break;
    case 'ArrowRight': changeDirection(1, 0, 'right'); break;
    case ' ': // Space to pause
      e.preventDefault();
      if (gameRunning) {
        paused = !paused;
        if (!paused) {
          gameInterval = setInterval(gameLoop, currentSpeed);
          pauseOverlay.style.display = 'none';
          stopButton.textContent = 'Stop';
        } else {
          clearInterval(gameInterval);
          pauseOverlay.style.display = 'flex';
          stopButton.textContent = 'Resume';
        }
      }
      break;
  }
});

// Touch controls
document.getElementById('up').addEventListener('click', () => changeDirection(0, -1, 'up'));
document.getElementById('down').addEventListener('click', () => changeDirection(0, 1, 'down'));
document.getElementById('left').addEventListener('click', () => changeDirection(-1, 0, 'left'));
document.getElementById('right').addEventListener('click', () => changeDirection(1, 0, 'right'));

startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
stopButton.addEventListener('click', () => {
    if (!gameRunning) return;
    paused = !paused;
    if (!paused) {
        gameInterval = setInterval(gameLoop, currentSpeed);
        pauseOverlay.style.display = 'none';
        stopButton.textContent = 'Stop';
    } else {
        clearInterval(gameInterval);
        pauseOverlay.style.display = 'flex';
        stopButton.textContent = 'Resume';
    }
});



// Initial clear
clearBoard();