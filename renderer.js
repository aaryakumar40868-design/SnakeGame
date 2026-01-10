// renderer.js
const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const BOARD_SIZE = canvas.width;
const GRID_COUNT = BOARD_SIZE / GRID_SIZE;

function clearBoard() {
  ctx.fillStyle = '#f0fdfc';
  ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
  
  // Subtle grid
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, BOARD_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(BOARD_SIZE, i * GRID_SIZE);
    ctx.stroke();
  }
}

function drawSnake(snake, direction) {
  snake.forEach((segment, index) => {
    const x = segment.x * GRID_SIZE;
    const y = segment.y * GRID_SIZE;

    if (index === 0) {
      // Draw head with eyes and direction
      const gradient = ctx.createRadialGradient(
        x + GRID_SIZE/2, y + GRID_SIZE/2, 0,
        x + GRID_SIZE/2, y + GRID_SIZE/2, GRID_SIZE/2
      );
      gradient.addColorStop(0, '#81c784');
      gradient.addColorStop(1, '#2e7d32');
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
      
      // Eyes
      ctx.fillStyle = 'white';
      let eye1x, eye1y, eye2x, eye2y;
      
      switch(direction) {
        case 'right':
          eye1x = x + GRID_SIZE - 6; eye1y = y + 6;
          eye2x = x + GRID_SIZE - 6; eye2y = y + GRID_SIZE - 10;
          break;
        case 'left':
          eye1x = x + 6; eye1y = y + 6;
          eye2x = x + 6; eye2y = y + GRID_SIZE - 10;
          break;
        case 'down':
          eye1x = x + 6; eye1y = y + GRID_SIZE - 6;
          eye2x = x + GRID_SIZE - 10; eye2y = y + GRID_SIZE - 6;
          break;
        case 'up':
          eye1x = x + 6; eye1y = y + 6;
          eye2x = x + GRID_SIZE - 10; eye2y = y + 6;
          break;
      }
      
      ctx.beginPath();
      ctx.arc(eye1x, eye1y, 3, 0, Math.PI * 2);
      ctx.arc(eye2x, eye2y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Pupils
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(eye1x + 1, eye1y, 1.5, 0, Math.PI * 2);
      ctx.arc(eye2x + 1, eye2y, 1.5, 0, Math.PI * 2);
      ctx.fill();
      
    } else {
      // Body with gradient
      const gradient = ctx.createLinearGradient(x, y, x + GRID_SIZE, y + GRID_SIZE);
      gradient.addColorStop(0, '#66bb6a');
      gradient.addColorStop(1, '#388e3c');
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
      
      // Scales pattern
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(x + 6, y + 6, 8, 8);
    }
    
    // Border
    ctx.strokeStyle = '#1b5e20';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
  });
}

function drawFood(food) {
  const x = food.x * GRID_SIZE + GRID_SIZE / 2;
  const y = food.y * GRID_SIZE + GRID_SIZE / 2;
  
  // Apple
  ctx.fillStyle = '#ff1744';
  ctx.beginPath();
  ctx.arc(x, y, GRID_SIZE / 2 - 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Shine
  ctx.fillStyle = '#ff8a80';
  ctx.beginPath();
  ctx.arc(x - 4, y - 4, GRID_SIZE / 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Stem
  ctx.strokeStyle = '#4caf50';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - GRID_SIZE / 2 + 3);
  ctx.lineTo(x, y - GRID_SIZE / 2 - 5);
  ctx.stroke();
}

function drawGameOver(finalScore) {
  const overlay = document.createElement('div');
  overlay.className = 'game-over-overlay';
  overlay.innerHTML = `
    <div class="game-over-text">Game Over!</div>
    <div class="final-score">Score: ${finalScore}</div>
    <button id="playAgainBtn">Play Again</button>
  `;
  document.getElementById('gameContainer').appendChild(overlay);
  
  document.getElementById('playAgainBtn').addEventListener('click', () => {
    overlay.remove();
    startGame();
  });
}

export { clearBoard, drawSnake, drawFood, drawGameOver };