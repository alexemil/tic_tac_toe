const board = document.querySelector('#board');
const cells = document.querySelectorAll('[data-cell]');
const restartButton = document.querySelector('#restartButton');
const easyModeButton = document.querySelector('#easyMode');
const hardModeButton = document.querySelector('#hardMode');
const leaderboardBody = document.querySelector('#leaderboardBody');
const statusDisplay = document.querySelector('#status');

let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'easy'; // 'easy' o 'hard' para seleccionar la dificultad
let boardState = Array(9).fill('');
let startTime; // Tiempo de inicio del juego
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

// Combinaciones ganadoras
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Inicialización del juego
function initGame() {
    startTime = new Date();
    updateLeaderboard();
    statusDisplay.textContent = "Es tu turno, juega!"; // Mensaje inicial
}

cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
});

// Función para manejar el clic en una celda
function handleCellClick(index) {
    if (boardState[index] !== '' || !gameActive) return;

    boardState[index] = currentPlayer;
    cells[index].textContent = currentPlayer;

    if (checkWin()) {
        gameActive = false;
        let endTime = new Date();
        let gameTime = ((endTime - startTime) / 1000).toFixed(2);
        statusDisplay.textContent = `¡${currentPlayer} ha ganado!`;
        setTimeout(() => {
            let playerName = prompt("¡Felicidades! Has ganado. Ingresa tu nombre:");
            if (playerName) {
                addToLeaderboard(playerName, gameTime);
            }
        }, 500);
        return;
    }

    if (boardState.every(cell => cell !== '')) {
        gameActive = false;
        statusDisplay.textContent = '¡Es un empate!';
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = `Turno de ${currentPlayer}`; // Actualiza el turno
    if (currentPlayer === 'O') computerPlay();
}

// Lógica para la computadora con dificultad seleccionable
function computerPlay() {
    setTimeout(() => {
        if (gameMode === 'easy') {
            easyComputerMove();
        } else {
            hardComputerMove();
        }
        if (checkWin()) {
            gameActive = false;
            statusDisplay.textContent = `¡${currentPlayer} ha ganado!`;
            return;
        }
        currentPlayer = 'X';
        statusDisplay.textContent = `Turno de ${currentPlayer}`;
    }, 500);
}

// Movimiento aleatorio (dificultad Normal)
function easyComputerMove() {
    let availableCells = boardState
        .map((cell, index) => (cell === '' ? index : null))
        .filter(index => index !== null);

    const randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
    boardState[randomIndex] = 'O';
    cells[randomIndex].textContent = 'O';
}

// Movimiento con mayor dificultad (dificultad Difícil)
function hardComputerMove() {
    const bestMove = minimax(boardState, 'O').index;
    boardState[bestMove] = 'O';
    cells[bestMove].textContent = 'O';
}

// Algoritmo Minimax para la dificultad Difícil
function minimax(newBoard, player) {
    const availableSpots = newBoard
        .map((cell, index) => (cell === '' ? index : null))
        .filter(index => index !== null);

    if (checkWinFor('X', newBoard)) return { score: -10 };
    if (checkWinFor('O', newBoard)) return { score: 10 };
    if (availableSpots.length === 0) return { score: 0 };

    let moves = [];

    for (let i = 0; i < availableSpots.length; i++) {
        let move = {};
        move.index = availableSpots[i];
        newBoard[availableSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }

        newBoard[availableSpots[i]] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

// Funciones para verificar ganadores
function checkWin() {
    return winningCombinations.some(combination => {
        return combination.every(index => boardState[index] === currentPlayer);
    });
}

function checkWinFor(player, board) {
    return winningCombinations.some(combination => {
        return combination.every(index => board[index] === player);
    });
}

// Reiniciar juego
function restartGame() {
    boardState = Array(9).fill('');
    cells.forEach(cell => (cell.textContent = ''));
    gameActive = true;
    currentPlayer = 'X';
    statusDisplay.textContent = 'Es tu turno, juega!';
    initGame();
}

// Añadir registro a la tabla de mejores tiempos
function addToLeaderboard(name, time) {
    const now = new Date();
    const record = {
        name,
        time: parseFloat(time),
        date: now.toLocaleDateString(),
        datetime: now
    };
    leaderboard.push(record);

    // Ordenar por tiempo ascendente y limitar a los 10 mejores
    leaderboard.sort((a, b) => a.time - b.time);
    leaderboard = leaderboard.slice(0, 10);

    // Guardar en LocalStorage
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    updateLeaderboard();
}

// Actualizar la tabla de mejores tiempos
function updateLeaderboard() {
    leaderboardBody.innerHTML = '';
    leaderboard.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${record.name}</td>
            <td>${record.time}</td>
            <td>${record.date}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

// Cambiar dificultad
function setEasyMode() {
    gameMode = 'easy';
    restartGame();
}

function setHardMode() {
    gameMode = 'hard';
    restartGame();
}

// Eventos para botones
restartButton.addEventListener('click', restartGame);
easyModeButton.addEventListener('click', setEasyMode);
hardModeButton.addEventListener('click', setHardMode);

// Inicializar juego al cargar la página
initGame();
