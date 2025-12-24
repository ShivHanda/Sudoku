// --- Global Variables ---
let solutionBoard = []; // The answer key
let puzzleBoard = [];   // The current state
let timerInterval;
let secondsElapsed = 0;
let selectedCell = null; // Stores coordinates {r, c} of currently clicked cell
let isGameActive = true;

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

    // 4. Start Timer
    startTimer();
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
                // If this value matches the initial puzzle logic, it's fixed
                // (For simplicity, we assume non-zero in initial generation is fixed. 
                // To track user input vs fixed perfectly, we'd need a separate 'initialBoard' state,
                // but checking against solution for correctness is enough for now.)
                
                // Better approach: Check if it was part of the original generation
                // We re-generate just to check "isFixed" or we can tag them in the DOM.
                // For this simple version: We will tag them as 'fixed' purely if they exist on load.
                // (Note: This render runs once on load for fixed cells, updates later for user input)
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
    // Updates only the numbers/classes, doesn't rebuild DOM
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
            
            // Check if it's a user input (not fixed)
            // We distinguish by checking if the cell DOES NOT have the 'fixed' class
            if (!cell.classList.contains('fixed')) {
                cell.classList.add('user-input');
                
                // Error checking: Is it wrong?
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
            // Prevent focus loss issues
            e.preventDefault(); 
            const val = parseInt(e.target.dataset.value);
            fillNumber(val);
        });
    });

    document.getElementById('clear-btn').addEventListener('click', deleteNumber);

    // 2. Physical Keyboard (Desktop)
    document.addEventListener('keydown', (e) => {
        if (!isGameActive) return;

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
    // Simple check: Does puzzleBoard match solutionBoard?
    // (In a real app, we might check validity even if numbers differ, but for this generated logic, unique solution is guaranteed)
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
    }
}
