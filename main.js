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
let gameInterval = null;
let gameRunning = false;
let paused = false;

const scoreDisplay = document.getElementById('scoreDisplay');
const gameContainer = document.getElementById('gameContainer');
const introduction = document.getElementById('introduction');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');

function initGame() {
  snake = [
    { x: 17, y: 17 },
    { x: 16, y: 17 },
    { x: 15, y: 17 }
  ];
  dx = 1; dy = 0;
  direction = 'right';
  score = 0;
  scoreDisplay.textContent = score;
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
  gameInterval = setInterval(gameLoop, 130);
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
  drawGameOver(score);
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
        if (!paused) gameInterval = setInterval(gameLoop, 130);
        else clearInterval(gameInterval);
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

// Add touch controls to HTML (add inside #gameContainer after resetButton)
gameContainer.insertAdjacentHTML('beforeend', `
  <div id="controls">
    <button class="control-btn" id="up">↑</button>
    <button class="control-btn" id="left">←</button>
    <button class="control-btn" id="down">↓</button>
    <button class="control-btn" id="right">→</button>
  </div>
`);

// Initial clear
clearBoard();