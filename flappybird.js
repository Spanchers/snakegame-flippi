let board, bufferCanvas, bufferContext;
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
let context, birdImg, topPipeImg, bottomPipeImg;
let birdWidth = 34, birdHeight = 24;
let birdX = (boardWidth - birdWidth) / 2, birdY = boardHeight / 2;
let bird = { x: birdX, y: birdY, width: birdWidth, height: birdHeight };
let pipeArray = [], pipeWidth = 64, pipeHeight = 512;
let velocityX = -2, velocityY = 0, gravity = 0.4;
let gameOver = false, score = 0, gameStarted = false;
let deathSound = new Audio("./sfx_die.wav"), pointSound = new Audio("./sfxs_point.wav"), jumpSound = new Audio("./sfx_wing.wav");
let deathSoundPlayed = false;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Создаем буферный канвас
    bufferCanvas = document.createElement("canvas");
    bufferCanvas.width = boardWidth;
    bufferCanvas.height = boardHeight;
    bufferContext = bufferCanvas.getContext("2d");

    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function () {
        drawStartScreen();
    };

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    board.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("keydown", handleKeyDown);
};

window.onresize = function () {
    boardWidth = window.innerWidth;
    boardHeight = window.innerHeight;
    board.width = boardWidth;
    board.height = boardHeight;
    bird.x = (boardWidth - bird.width) / 2;
    bird.y = boardHeight / 2;
};

function update() {
    if (gameOver) {
        if (!deathSoundPlayed) {
            deathSound.play();
            deathSoundPlayed = true;
        }
        showGameOverScreen();
        return;
    }

    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    if (bird.y > board.height) {
        gameOver = true;
        deathSound.play();
    }

    // Очищаем только буферный канвас, основной канвас остаётся чистым
    bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);

    // Рисуем птицу и трубы в буфер
    bufferContext.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;

        if (pipe.x + pipe.width < 0) {
            pipeArray.shift();
            continue;
        }

        bufferContext.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            deathSound.play();
        }

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
            setTimeout(() => {
                pointSound.play();
            }, 300);
        }
    }

    // Рисуем счет в буфер
    if (!gameOver) {
        bufferContext.fillStyle = "white";
        bufferContext.font = "40px sans-serif";
        bufferContext.fillText(Math.floor(score), board.width / 2, 50);
    }

    // Копируем отрисованный буфер на основной канвас
    context.clearRect(0, 0, board.width, board.height); // очищаем основной канвас
    context.drawImage(bufferCanvas, 0, 0); // перерисовываем изображение с буферного канваса

    // Используем requestAnimationFrame для плавности
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

function showGameOverScreen() {
    bufferContext.fillStyle = "rgba(255, 87, 34, 0.8)";
    bufferContext.beginPath();
    bufferContext.moveTo(board.width / 3, board.height / 2 - 60);
    bufferContext.lineTo(board.width * 2 / 3, board.height / 2 - 60);
    bufferContext.arcTo(board.width * 2 / 3 + 20, board.height / 2 - 60, board.width * 2 / 3 + 20, board.height / 2 + 60, 20);
    bufferContext.lineTo(board.width * 2 / 3 + 20, board.height / 2 + 60);
    bufferContext.arcTo(board.width / 3 - 20, board.height / 2 + 60, board.width / 3 - 20, board.height / 2 - 60, 20);
    bufferContext.lineTo(board.width / 3 - 20, board.height / 2 - 60);
    bufferContext.arcTo(board.width / 3 - 20, board.height / 2 - 60, board.width / 3 - 20, board.height / 2 + 60, 20);
    bufferContext.fill();

    bufferContext.fillStyle = "white";
    bufferContext.font = "bold 50px sans-serif";
    bufferContext.textAlign = "center";
    bufferContext.fillText("GAME OVER", board.width / 2, board.height / 2);

    bufferContext.font = "bold 30px sans-serif";
    bufferContext.fillText("Score: " + Math.floor(score), board.width / 2, board.height / 2 + 50);

    drawButton(board.width / 3, board.height / 2 + 100, "RESTART", restartGame);
}

function restartGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    gameStarted = true;
    deathSoundPlayed = false;
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
        jumpSound.play();
        if (gameOver) {
            restartGame();
        }
    }
}

function handleTouchStart(e) {
    e.preventDefault();
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
