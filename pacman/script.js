const initialMaze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 1, 1, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Copy of the initial maze to track changes
let maze = JSON.parse(JSON.stringify(initialMaze));

let upPressed = false,
  downPressed = false,
  leftPressed = false,
  rightPressed = false;

let gameStarted = false,
  gameOver = false;

let score = 0,
  lives = 3,
  totalPoints = 0;

let playerPosition = { x: 1, y: 1 };
let enemies = [];

const main = document.querySelector("main");
const scoreElement = document.getElementById("score");
const livesList = document.getElementById("lives-list");
const gameOverDiv = document.getElementById("game-over");
const restartBtn = document.getElementById("restart-btn");
const leaderboardList = document.getElementById("leaderboard-list");

// Initialize lives display
function initializeLives() {
  livesList.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    const life = document.createElement("li");
    life.style.backgroundColor = "yellow";
    livesList.appendChild(life);
  }
}

// Update score display
function updateScore() {
  scoreElement.textContent = score;
}

// Show game over message and prompt for player name
function showGameOver(win = false) {
  const title = document.getElementById("game-over-title");
  title.innerText = win ? "You won!" : "Game Over";
  gameOverDiv.style.display = "block";
  setTimeout(promptPlayerName, 100);
}

// Hide game over message
function hideGameOver() {
  gameOverDiv.style.display = "none";
}

// Reset the game to its initial state
function resetGame() {
  Object.assign(playerPosition, { x: 1, y: 1 });
  [gameStarted, gameOver, score, lives, enemies] = [true, false, 0, 3, []];
  maze = JSON.parse(JSON.stringify(initialMaze));

  initializeMaze();
  initializeLives();
  updateScore();
  hideGameOver();
  moveEnemies();
}

// Start the game
function startGame() {
  document.querySelector(".startDiv").style.display = "none";
  gameStarted = true;
}

// Initialize the maze layout in the DOM
function initializeMaze() {
  main.innerHTML = "";
  maze.forEach((row) => {
    row.forEach((cell) => {
      const block = document.createElement("div");

      block.classList.add("block");

      switch (cell) {
        case 1:
          block.classList.add("wall");
          break;
        case 2:
          block.id = "player";

          const mouth = document.createElement("div");
          mouth.id = "mouth";
          mouth.classList.add("mouth");
          block.appendChild(mouth);

          break;
        default:
          block.classList.add("point");

          block.style.height = "1vh";
          block.style.width = "1vh";
      }

      main.appendChild(block);
    });
  });

  // Number of enemys in the maze
  for (let i = 0; i < 3; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * maze[0].length);
      y = Math.floor(Math.random() * maze.length);
    } while (maze[y][x] !== 0);

    const enemy = document.createElement("div");
    const enemyBody = document.createElement("div");

    enemyBody.classList.add("enemy-body");
    enemy.classList.add("enemy");

    enemies.push({ element: enemy, x, y });

    enemy.appendChild(enemyBody);
    main.appendChild(enemy);
  }
}

// Position an element in the maze grid
function positionElement(element, x, y) {
  element.style.left = `${(x - 1) * 100}%`;
  element.style.top = `${(y - 1) * 100}%`;
}

// Position an enemy in the maze grid
function positionEnemy(element, x, y) {
  element.style.left = `${x * 10}%`;
  element.style.top = `${y * 10}%`;
}

// Handle player movement based on key presses
function handlePlayerMovement() {
  if (
    !gameStarted ||
    gameOver ||
    document.getElementById("player").classList.contains("hit")
  )
    return;

  let { x, y } = playerPosition;
  if (upPressed) y--;
  if (downPressed) y++;
  if (leftPressed) x--;
  if (rightPressed) x++;
// Move player direction + pacman mouth
  if (maze[y][x] !== 1) {
    playerPosition = { x, y };
    const mouth = document.getElementById("mouth");
    ["up", "right", "left", "down"].forEach((dir) =>
      mouth.classList.remove(dir)
    );
    if (rightPressed) mouth.classList.add("right");
    else if (upPressed) mouth.classList.add("up");
    else if (leftPressed) mouth.classList.add("left");
    else if (downPressed) mouth.classList.add("down");
    positionElement(document.getElementById("player"), x, y);
    checkCollisions();
  }
}

// Check for collisions with points or enemies
function checkCollisions() {
  if (document.getElementById("player").classList.contains("hit")) return;

  const playerCell = maze[playerPosition.y][playerPosition.x];
  if (playerCell === 0) {
    maze[playerPosition.y][playerPosition.x] = 2;
    score++;
    updateScore();
    const point = document.querySelector(
      `.block:nth-child(${playerPosition.y * 10 + playerPosition.x + 1})`
    );
    point.classList.remove("point");
    point.classList.add("block");

    if (!maze.some((row) => row.includes(0))) {
      gameOver = true;
      showGameOver(true);
    }
  }

  enemies.forEach((enemy) => {
    if (enemy.x === playerPosition.x && enemy.y === playerPosition.y)
      handlePlayerHit();
  });
}

// Handle player getting hit by an enemy
function handlePlayerHit() {
  const player = document.getElementById("player");

  player.classList.add("hit");
  lives--;

  initializeLives();

  setTimeout(() => {
    player.classList.remove("hit");
    if (lives > 0) {
      resetPlayerPosition();
    } else {
      gameOver = true;
      showGameOver();
    }
  }, 1500);
}

// Move enemies randomly within the maze
function moveEnemies() {
  if (gameOver) return;
  enemies.forEach((enemy) => {
    let direction;
    do {
      direction = Math.floor(Math.random() * 4);
    } while (!isValidMove(enemy, direction));
    switch (direction) {
      case 0:
        enemy.y--;
        break;
      case 1:
        enemy.y++;
        break;
      case 2:
        enemy.x--;
        break;
      case 3:
        enemy.x++;
        break;
    }
    positionEnemy(enemy.element, enemy.x, enemy.y);
  });
  setTimeout(moveEnemies, 1000);
}

// Check if a move is valid (not into a wall)
function isValidMove(entity, direction) {
  let { x, y } = entity;
  switch (direction) {
    case 0:
      y--;
      break;
    case 1:
      y++;
      break;
    case 2:
      x--;
      break;
    case 3:
      x++;
      break;
  }
  return maze[y][x] !== 1 && maze[y][x] !== 3;
}

// Event listeners for arrow key presses
document.addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "ArrowUp":
      upPressed = true;
      break;
    case "ArrowDown":
      downPressed = true;
      break;
    case "ArrowLeft":
      leftPressed = true;
      break;
    case "ArrowRight":
      rightPressed = true;
      break;
  }
  handlePlayerMovement();
});

document.addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "ArrowUp":
      upPressed = false;
      break;
    case "ArrowDown":
      downPressed = false;
      break;
    case "ArrowLeft":
      leftPressed = false;
      break;
    case "ArrowRight":
      rightPressed = false;
      break;
  }
});

// Load leaderboard from local storage and display it
function loadLeaderboard() {
  const scores = JSON.parse(localStorage.getItem("scores")) || [];

  leaderboardList.innerHTML = scores
    .sort((a, b) => b.score - a.score)
    .map((score) => `<li>${score.name}........${score.score}</li>`)
    .join("");
}

// Save the current score to local storage
function saveScore(name, score) {
  const scores = JSON.parse(localStorage.getItem("scores")) || [];

  scores.push({ name, score });
  localStorage.setItem("scores", JSON.stringify(scores));

  loadLeaderboard();
}

// Prompt player for name to save score
function promptPlayerName() {
  const name = prompt("Enter your name:");
  if (name) saveScore(name, score);
}

// Initialize game on window load
window.addEventListener("load", () => {
  loadLeaderboard();
  initializeMaze();
  updateScore();
  moveEnemies();
  initializeLives();
});

// Start game on start button click
document.querySelector(".startDiv").addEventListener("click", startGame);
// Reset game on restart button click
restartBtn.addEventListener("click", resetGame);

// Additional button event listeners for player movement
lbttn.addEventListener("click", () => {
  leftPressed = true;
  handlePlayerMovement();
  leftPressed = false;
});

ubttn.addEventListener("click", () => {
  upPressed = true;
  handlePlayerMovement();
  upPressed = false;
});

rbttn.addEventListener("click", () => {
  rightPressed = true;
  handlePlayerMovement();
  rightPressed = false;
});

dbttn.addEventListener("click", () => {
  downPressed = true;
  handlePlayerMovement();
  downPressed = false;
});
