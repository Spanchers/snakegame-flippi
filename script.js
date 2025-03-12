const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('game-over');

// Настройка размеров canvas под контейнер
const gameContainer = document.getElementById('game-container');
canvas.width = gameContainer.clientWidth;
canvas.height = gameContainer.clientHeight;

// Параметры игры
const bird = {
    x: 50,
    y: canvas.height / 2,
    radius: 20,
    velocity: 0,
    gravity: 0.5,
    jump: -10
};

const pipes = [];
const pipeWidth = 50;
const pipeGap = 150;
let pipeSpeed = 2;
let score = 0;
let gameRunning = true;

// Добавляем первую трубу
function spawnPipe() {
    const pipeHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({
        x: canvas.width,
        topHeight: pipeHeight,
        bottomHeight: canvas.height - pipeHeight - pipeGap,
        counted: false
    });
}

// Управление тапом/кликом
canvas.addEventListener('touchstart', jump); // Для мобильных
canvas.addEventListener('click', jump);     // Для ПК

function jump(e) {
    e.preventDefault(); // Предотвращаем нежелательное поведение на мобильных
    if (!gameRunning) {
        resetGame();
        return;
    }
    bird.velocity = bird.jump;
}

// Обновление состояния игры
function update() {
    if (!gameRunning) return;

    // Движение птички
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Проверка границ
    if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
        endGame();
        return;
    }

    // Движение труб
    pipes.forEach((pipe, index) => {
        pipe.x -= pipeSpeed;

        // Столкновение с трубами
        if (
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + pipeWidth &&
            (bird.y - bird.radius < pipe.topHeight || bird.y + bird.radius > canvas.height - pipe.bottomHeight)
        ) {
            endGame();
            return;
        }

        // Подсчет очков
        if (!pipe.counted && bird.x > pipe.x + pipeWidth) {
            score++;
            pipe.counted = true;
            scoreDisplay.textContent = Score: ${score};
        }

        // Удаление труб за пределами экрана
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }
    });

    // Генерация новых труб
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        spawnPipe();
    }
}

// Отрисовка
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка птички
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();

    // Отрисовка труб
    ctx.fillStyle = '#228b22';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight); // Верхняя труба
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight); // Нижняя труба
    });
}

// Завершение игры
function endGame() {
    gameRunning = false;
    gameOverDisplay.style.display = 'block';
}

// Перезапуск игры
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    scoreDisplay.textContent = Score: ${score};
    gameOverDisplay.style.display = 'none';
    gameRunning = true;
    spawnPipe();
}

// Игровой цикл
function gameLoop() {
    update();
    draw();
    if (gameRunning) requestAnimationFrame(gameLoop);
}

// Старт игры
spawnPipe();
gameLoop();
