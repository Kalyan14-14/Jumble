"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const coinsDisplay = document.getElementById("coins");
const levelDisplay = document.getElementById("level");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const jumpBtn = document.getElementById("jumpBtn");
const restartBtn = document.getElementById("restartBtn");

const groundY = 340;

let player;
let obstacles;
let coins;
let score;
let coinCount;
let speed;
let frame;
let playing = false;
let gameOver = false;
let animationId = null;

function resetGame() {
  player = {
    x: 90,
    y: groundY - 48,
    width: 34,
    height: 48,
    velocityY: 0,
    jumping: false
  };

  obstacles = [];
  coins = [];
  score = 0;
  coinCount = 0;
  speed = 4;
  frame = 0;
  gameOver = false;

  updateHUD();
  draw();
}

function updateHUD() {
  scoreDisplay.textContent = Math.floor(score);
  coinsDisplay.textContent = coinCount;
  levelDisplay.textContent = Math.floor(score / 100) + 1;
}

function startGame() {
  if (playing) return;

  resetGame();
  playing = true;
  message.hidden = true;

  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }

  gameLoop();
}

function jump() {
  if (!playing || gameOver) return;

  if (!player.jumping) {
    player.velocityY = -13;
    player.jumping = true;
  }
}

function spawnObstacle() {
  obstacles.push({
    x: canvas.width + 20,
    y: groundY - 35,
    width: 28,
    height: 35
  });
}

function spawnCoin() {
  coins.push({
    x: canvas.width + 20,
    y: groundY - 75 - Math.random() * 65,
    radius: 10,
    collected: false
  });
}

function update() {
  frame++;

  speed = 4 + Math.floor(score / 100) * 0.5;

  // Player gravity
  player.velocityY += 0.6;
  player.y += player.velocityY;

  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.jumping = false;
  }

  // Spawn obstacles and coins
  if (frame % Math.max(35, Math.floor(90 - speed * 4)) === 0) {
    spawnObstacle();
  }

  if (frame % 75 === 0) {
    spawnCoin();
  }

  // Move obstacles
  for (const obstacle of obstacles) {
    obstacle.x -= speed;

    if (collides(player, obstacle)) {
      endGame();
      return;
    }
  }

  obstacles = obstacles.filter(
    obstacle => obstacle.x + obstacle.width > 0
  );

  // Move and collect coins
  for (const coin of coins) {
    coin.x -= speed;

    const closestX = Math.max(
      player.x,
      Math.min(coin.x, player.x + player.width)
    );

    const closestY = Math.max(
      player.y,
      Math.min(coin.y, player.y + player.height)
    );

    const dx = coin.x - closestX;
    const dy = coin.y - closestY;

    if (!coin.collected &&
        dx * dx + dy * dy < coin.radius * coin.radius) {
      coin.collected = true;
      coinCount++;
      score += 10;
    }
  }

  coins = coins.filter(
    coin => coin.x + coin.radius > 0 && !coin.collected
  );

  score += 0.15;
  updateHUD();
}

function collides(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function drawBackground() {
  ctx.fillStyle = "#111735";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  ctx.fillStyle = "#ffffff";

  for (let i = 0; i < 35; i++) {
    const x = (i * 137) % canvas.width;
    const y = (i * 61) % 250;

    ctx.fillRect(x, y, 2, 2);
  }

  // Ground
  ctx.fillStyle = "#00f5ff";
  ctx.fillRect(0, groundY, canvas.width, 3);

  ctx.fillStyle = "#22294b";
  ctx.fillRect(0, groundY + 3, canvas.width,
               canvas.height - groundY);
}

function drawPlayer() {
  const x = player.x;
  const y = player.y;

  // Legs
  ctx.fillStyle = "#ffb347";
  ctx.fillRect(x + 5, y + 32, 9, 16);
  ctx.fillRect(x + 21, y + 32, 9, 16);

  // Shoes
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 1, y + 43, 14, 5);
  ctx.fillRect(x + 18, y + 43, 14, 5);

  // Body
  ctx.fillStyle = "#00f5ff";
  ctx.fillRect(x + 3, y + 15, 28, 21);

  // Head
  ctx.fillStyle = "#ffcf9c";
  ctx.fillRect(x + 6, y, 23, 20);

  // Hair
  ctx.fillStyle = "#25213c";
  ctx.fillRect(x + 5, y, 25, 6);

  // Eyes
  ctx.fillStyle = "#111735";
  ctx.fillRect(x + 22, y + 8, 3, 4);
}

function draw() {
  drawBackground();

  // Draw coins
  for (const coin of coins || []) {
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd700";
    ctx.fill();
    ctx.strokeStyle = "#fff2a0";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Draw obstacles
  for (const obstacle of obstacles || []) {
    ctx.fillStyle = "#ff416c";
    ctx.fillRect(
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );

    ctx.fillStyle = "#ff8ba7";
    ctx.fillRect(
      obstacle.x + 5,
      obstacle.y + 5,
      6,
      obstacle.height - 10
    );
  }

  // Draw the actual character
  if (player) {
    drawPlayer();
  }
}

function gameLoop() {
  if (!playing) return;

  if (!gameOver) {
    update();
    draw();
  }

  if (playing) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function endGame() {
  gameOver = true;
  playing = false;

  message.hidden = false;
  message.innerHTML = `
    <h2>GAME OVER!</h2>
    <p>Score: ${Math.floor(score)} | Coins: ${coinCount}</p>
    <button id="playAgainBtn" type="button">PLAY AGAIN</button>
  `;

  document.getElementById("playAgainBtn")
    .addEventListener("click", startGame);
}

// Button controls
startBtn.addEventListener("click", startGame);
jumpBtn.addEventListener("click", jump);
restartBtn.addEventListener("click", startGame);

// Keyboard controls
document.addEventListener("keydown", event => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();

    if (!playing && !gameOver) {
      startGame();
    } else {
      jump();
    }
  }
});

// Initialize the game
resetGame();
