const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const coinsDisplay = document.getElementById("coins");
const levelDisplay = document.getElementById("level");

const overlay = document.getElementById("overlay");
const message = document.getElementById("message");
const instructions = document.getElementById("instructions");
const startButton = document.getElementById("startButton");
const jumpButton = document.getElementById("jumpButton");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND = 330;

let playing = false;
let animationId;
let score = 0;
let coins = 0;
let level = 1;
let speed = 5;
let obstacleTimer = 0;
let coinTimer = 0;
let frame = 0;

const player = {
    x: 100,
    y: GROUND - 40,
    width: 32,
    height: 40,
    velocityY: 0,
    grounded: true
};

let obstacles = [];
let coinItems = [];
let stars = [];

function createStars() {
    stars = [];

    for (let i = 0; i < 70; i++) {
        stars.push({
            x: Math.random() * WIDTH,
            y: Math.random() * 240,
            size: Math.random() * 2 + 1
        });
    }
}

function resetGame() {
    score = 0;
    coins = 0;
    level = 1;
    speed = 5;
    obstacleTimer = 70;
    coinTimer = 100;
    frame = 0;

    obstacles = [];
    coinItems = [];

    player.y = GROUND - player.height;
    player.velocityY = 0;
    player.grounded = true;

    updateHUD();
}

function startGame() {
    cancelAnimationFrame(animationId);

    resetGame();

    playing = true;
    overlay.style.display = "none";

    gameLoop();
}

function
