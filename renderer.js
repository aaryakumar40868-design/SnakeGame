// renderer.js
const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const BOARD_SIZE = canvas.width;
const GRID_COUNT = BOARD_SIZE / GRID_SIZE;

function clearBoard() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
  
  // Subtle grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
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
  // Draw tail to head so head renders on top
  for (let i = snake.length - 1; i >= 0; i--) {
    const segment = snake[i];
    const x = segment.x * GRID_SIZE + GRID_SIZE / 2;
    const y = segment.y * GRID_SIZE + GRID_SIZE / 2;

    if (i === 0) {
      // Draw Head
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      
      const gradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, GRID_SIZE / 2 + 2);
      gradient.addColorStop(0, '#81c784');
      gradient.addColorStop(1, '#1b5e20');
      ctx.fillStyle = gradient;
      
      ctx.beginPath();
      ctx.arc(x, y, GRID_SIZE / 2 + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = 'white';
      let e1x, e1y, e2x, e2y, txg, tyg;
      const off = 3, spc = 6;
      
      if (direction === 'right') {
        e1x = x + off; e1y = y - spc; e2x = x + off; e2y = y + spc; txg = x + GRID_SIZE/2; tyg = y;
      } else if (direction === 'left') {
        e1x = x - off; e1y = y - spc; e2x = x - off; e2y = y + spc; txg = x - GRID_SIZE/2; tyg = y;
      } else if (direction === 'down') {
        e1x = x - spc; e1y = y + off; e2x = x + spc; e2y = y + off; txg = x; tyg = y + GRID_SIZE/2;
      } else if (direction === 'up') {
        e1x = x - spc; e1y = y - off; e2x = x + spc; e2y = y - off; txg = x; tyg = y - GRID_SIZE/2;
      }
      
      ctx.beginPath(); ctx.arc(e1x, e1y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(e2x, e2y, 3, 0, Math.PI * 2); ctx.fill();
      
      ctx.fillStyle = 'black';
      const px = direction === 'right' ? 1 : direction === 'left' ? -1 : 0;
      const py = direction === 'down' ? 1 : direction === 'up' ? -1 : 0;
      ctx.beginPath(); ctx.arc(e1x + px*1.5, e1y + py*1.5, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(e2x + px*1.5, e2y + py*1.5, 1.5, 0, Math.PI * 2); ctx.fill();
      
      // Tongue Feature
      ctx.strokeStyle = '#ff5252';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(txg, tyg);
      ctx.lineTo(txg + px*6, tyg + py*6);
      ctx.lineTo(txg + px*10 + py*4, tyg + py*10 + px*4);
      ctx.moveTo(txg + px*6, tyg + py*6);
      ctx.lineTo(txg + px*10 - py*4, tyg + py*10 - px*4);
      ctx.stroke();

    } else {
      // Draw Body
      const sizeMult = 1 - (i / snake.length) * 0.5;
      const r = Math.max(6, (GRID_SIZE / 2 + 1) * sizeMult);
      
      const gradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, r);
      gradient.addColorStop(0, '#66bb6a');
      gradient.addColorStop(1, '#2e7d32');
      
      // Stroke back to the next segment toward the head (index - 1)
      const prevX = snake[i-1].x * GRID_SIZE + GRID_SIZE / 2;
      const prevY = snake[i-1].y * GRID_SIZE + GRID_SIZE / 2;
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = r * 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
}

function drawFood(food) {
  const x = food.x * GRID_SIZE + GRID_SIZE / 2;
  const y = food.y * GRID_SIZE + GRID_SIZE / 2;
  
  ctx.save();
  ctx.shadowColor = '#ff5252';
  ctx.shadowBlur = 15;
  
  // Glowing Apple
  const gradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, GRID_SIZE / 2 - 2);
  gradient.addColorStop(0, '#ff8a80');
  gradient.addColorStop(0.5, '#ff1744');
  gradient.addColorStop(1, '#d50000');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Stem
  ctx.strokeStyle = '#4caf50';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y - GRID_SIZE / 2 + 3);
  ctx.lineTo(x + 2, y - GRID_SIZE / 2 - 4);
  ctx.stroke();
}

function drawGameOver(finalScore, currentDiff = 'medium') {
  const overlay = document.createElement('div');
  overlay.className = 'game-over-overlay';
  overlay.innerHTML = `
    <div class="game-over-text">Game Over!</div>
    <div class="final-score">Score: ${finalScore}</div>
    <div class="difficulty-options" style="margin-bottom: 30px;">
        <button class="diff-btn ${currentDiff === 'easy' ? 'selected' : ''}" data-diff="easy">🟩 Easy</button>
        <button class="diff-btn ${currentDiff === 'medium' ? 'selected' : ''}" data-diff="medium">🟨 Medium</button>
        <button class="diff-btn ${currentDiff === 'hard' ? 'selected' : ''}" data-diff="hard">🟥 Hard</button>
    </div>
    <button id="playAgainBtn">Play Again</button>
  `;
  document.getElementById('gameContainer').appendChild(overlay);
  
  document.getElementById('playAgainBtn').addEventListener('click', () => {
    document.getElementById('resetButton').click();
  });
}

export { clearBoard, drawSnake, drawFood, drawGameOver };