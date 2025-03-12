let board;
let boardWidth = 360; // фиксированная ширина экрана
let boardHeight = 640; // фиксированная высота экрана
let context;

let birdWidth = 34; 
let birdHeight = 24;
let birdX = (boardWidth - birdWidth) / 2;
let birdY = boardHeight / 2;
let birdImg;
let gameStarted = false;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

let pipeArray = [];
let pipeWidth = 64; 
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function () {
    // Инициализируем канвас
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Загружаем изображения
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function () {
        drawStartScreen();
    };

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Обработчик событий для мобильных устройств (касания)
    board.addEventListener("touchstart", handleTouchStart);

    // Обработчик клавиатуры для ПК
    document.addEventListener("keydown", handleKeyDown);
};

function drawStartScreen() {
    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    
    context.fillStyle = "white";
    context.font = "bold 30px sans-serif";
    context.textAlign = "center";
    context.fillText("Flappy Bird", board.width / 2, board.height / 3);
    
    drawButton(board.width / 3, board.height / 2.8, "START", startGame);
}

function drawButton(x, y, text, onClick) {
    context.fillStyle = "orange";
    context.beginPath();
    context.roundRect(x, y, board.width / 3, 50, 10);
    context.fill();
    
    context.fillStyle = "white";
    context.fillText(text, board.width / 2, y + 35);
    
    board.addEventListener("click", function onClickEvent(e) {
        let rect = board.getBoundingClientRect();
        let clickX = e.clientX - rect.left;
        let clickY = e.clientY - rect.top;
        if (clickX >= x && clickX <= x + board.width / 3 && clickY >= y && clickY <= y + 50) {
            board.removeEventListener("click", onClickEvent);
            onClick();
        }
    });
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        requestAnimationFrame(update);
        setInterval(placePipes, 1500);
    }
}

function update() {
    if (gameOver) {
        showGameOverScreen();
        return;
    }
    
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    if (!gameOver) {
        context.fillStyle = "white";
        context.font = "40px sans-serif";
        context.fillText(Math.floor(score), board.width / 2, 50);
    }
}

function showGameOverScreen() {
    // Фон для экрана "Game Over" с закругленными углами
    context.fillStyle = "rgba(255, 87, 34, 0.8)"; // Полупрозрачный оранжевый
    context.beginPath();
    context.moveTo(board.width / 3, board.height / 2 - 60);
    context.lineTo(board.width * 2 / 3, board.height / 2 - 60);
    context.arcTo(board.width * 2 / 3 + 20, board.height / 2 - 60, board.width * 2 / 3 + 20, board.height / 2 + 60, 20);
    context.lineTo(board.width * 2 / 3 + 20, board.height / 2 + 60);
    context.arcTo(board.width / 3 - 20, board.height / 2 + 60, board.width / 3 - 20, board.height / 2 - 60, 20);
    context.lineTo(board.width / 3 - 20, board.height / 2 - 60);
    context.arcTo(board.width / 3 - 20, board.height / 2 - 60, board.width / 3 - 20, board.height / 2 + 60, 20);
    context.fill();

    // Текст "GAME OVER"
    context.fillStyle = "white";
    context.font = "bold 50px sans-serif";
    context.textAlign = "center";
    context.fillText("GAME OVER", board.width / 2, board.height / 2);

    // Текст с результатом
    context.font = "bold 30px sans-serif";
    context.fillText("Score: " + Math.floor(score), board.width / 2, board.height / 2 + 50);

    // Кнопка перезапуска игры
    drawButton(board.width / 3, board.height / 2 + 100, "RESTART", restartGame);
}

function restartGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    gameStarted = true;
    requestAnimationFrame(update);
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function handleKeyDown(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        if (!gameStarted) {
            startGame();
        }
        velocityY = -6;
        if (gameOver) {
            restartGame();
        }
    }
}

// Обработчик касания экрана
function handleTouchStart(e) {
    e.preventDefault(); // предотвращаем стандартное поведение
    if (!gameStarted) {
        startGame();
    }
    velocityY = -6;
    if (gameOver) {
        restartGame();
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
