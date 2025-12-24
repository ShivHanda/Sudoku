// --- Global Variables ---
let solutionBoard = []; // The answer key
let puzzleBoard = [];   // The current state
let timerInterval;
let secondsElapsed = 0;
let selectedCell = null; // Stores coordinates {r, c} of currently clicked cell
let isGameActive = true;
let hasStarted = false; // NEW: Flag to track if user started playing

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
});

function initGame() {
    // 1. Get Today's Date String (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-display').textContent = formatDate(today);

    // 2. Generate Puzzle using the Engine
    const data = SudokuEngine.generateDaily(today);
    solutionBoard = data.solution;
    // We copy the puzzle to a working board
    puzzleBoard = JSON.parse(JSON.stringify(data.puzzle));

    // 3. Render the Board
    renderBoard();

    // NOTE: Removed startTimer() from here.
}

// --- NEW: Handle First Interaction ---
function handleGameStart() {
    if (!hasStarted && isGameActive) {
        hasStarted = true;
        startTimer();
    }
}

// --- Rendering ---
function renderBoard() {
    const boardContainer = document.getElementById('game-board');
    boardContainer.innerHTML = ''; // Clear previous

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cellValue = puzzleBoard[r][c];
            const cellDiv = document.createElement('div');
            
            cellDiv.classList.add('cell');
            cellDiv.dataset.r = r;
            cellDiv.dataset.c = c;

            if (cellValue !== 0) {
                cellDiv.textContent = cellValue;
                cellDiv.classList.add('fixed');
            } else {
                cellDiv.classList.add('empty');
            }

            // Click Event
            cellDiv.addEventListener('click', () => selectCell(r, c));
            
            boardContainer.appendChild(cellDiv);
        }
    }
}

function updateBoardView() {
    const cells = document.querySelectorAll('.cell');
    
    cells.forEach(cell => {
        const r = parseInt(cell.dataset.r);
        const c = parseInt(cell.dataset.c);
        const val = puzzleBoard[r][c];

        // Clear previous state classes (except fixed)
        cell.classList.remove('selected', 'highlighted', 'error', 'user-input');

        // Visual: Selected Cell
        if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
            cell.classList.add('selected');
        }

        // Visual: Highlight same numbers
        if (selectedCell && val !== 0) {
            const selectedVal = puzzleBoard[selectedCell.r][selectedCell.c];
            if (selectedVal === val) {
                cell.classList.add('highlighted');
            }
        }

        // Update Text
        if (val !== 0) {
            cell.textContent = val;
            if (!cell.classList.contains('fixed')) {
                cell.classList.add('user-input');
                if (val !== solutionBoard[r][c]) {
                    cell.classList.add('error');
                }
            }
        } else {
            cell.textContent = '';
        }
    });

    checkWinCondition();
}

// --- Interaction Logic ---
function selectCell(r, c) {
    if (!isGameActive) return;
    
    handleGameStart(); // Start timer on click
    
    selectedCell = { r, c };
    updateBoardView();
}

function fillNumber(num) {
    if (!isGameActive || !selectedCell) return;
    
    const { r, c } = selectedCell;
    const cellDiv = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);

    // Cannot overwrite fixed cells
    if (cellDiv.classList.contains('fixed')) return;

    // Update state
    puzzleBoard[r][c] = num;
    updateBoardView();
}

function deleteNumber() {
    if (!isGameActive || !selectedCell) return;
    fillNumber(0);
}

// --- Event Listeners ---
function setupEventListeners() {
    // 1. On-screen Numpad (Mobile)
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            const val = parseInt(e.target.dataset.value);
            fillNumber(val);
        });
    });

    document.getElementById('clear-btn').addEventListener('click', deleteNumber);

    // 2. Physical Keyboard (Desktop)
    document.addEventListener('keydown', (e) => {
        if (!isGameActive) return;

        // Start timer if they use arrow keys or type numbers
        if (!hasStarted) handleGameStart();

        const key = e.key;
        if (key >= '1' && key <= '9') {
            fillNumber(parseInt(key));
        } else if (key === 'Backspace' || key === 'Delete') {
            deleteNumber();
        } else if (key.startsWith('Arrow')) {
            moveSelection(key);
        }
    });

    // 3. Solve Button
    document.getElementById('solve-btn').addEventListener('click', () => {
        if(confirm("Give up? This will show the solution and stop the timer.")) {
            puzzleBoard = JSON.parse(JSON.stringify(solutionBoard));
            stopTimer();
            isGameActive = false;
            selectedCell = null;
            updateBoardView();
        }
    });

    // 4. Modal Close
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.getElementById('win-overlay').classList.add('hidden');
    });
}

function moveSelection(key) {
    if (!selectedCell) {
        selectedCell = { r: 0, c: 0 };
    } else {
        let { r, c } = selectedCell;
        if (key === 'ArrowUp') r = Math.max(0, r - 1);
        if (key === 'ArrowDown') r = Math.min(8, r + 1);
        if (key === 'ArrowLeft') c = Math.max(0, c - 1);
        if (key === 'ArrowRight') c = Math.min(8, c + 1);
        selectedCell = { r, c };
    }
    updateBoardView();
}

// --- Timer & Utils ---
function startTimer() {
    if (timerInterval) return; // Prevent double intervals
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const secs = (secondsElapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${mins}:${secs}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatDate(isoDate) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(isoDate).toLocaleDateString(undefined, options);
}

function checkWinCondition() {
    let isFull = true;
    let isCorrect = true;

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (puzzleBoard[r][c] === 0) {
                isFull = false;
                break;
            }
            if (puzzleBoard[r][c] !== solutionBoard[r][c]) {
                isCorrect = false;
            }
        }
    }

    if (isFull && isCorrect && isGameActive) {
        isGameActive = false;
        stopTimer();
        document.getElementById('final-time').textContent = document.getElementById('timer').textContent;
        document.getElementById('win-overlay').classList.remove('hidden');
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
}
