const SudokuEngine = {
    
    // Internal state for the pseudo-random generator
    _seed: 0,

    /**
     * Initialize the seed based on a string (e.g., "2025-12-24")
     * This ensures the puzzle is the same for everyone on the same day.
     */
    _setSeed(str) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 16777619);
        }
        this._seed = h >>> 0;
    },

    /**
     * Returns a random number between 0 and 1 using the seeded state.
     */
    _random() {
        this._seed = (this._seed * 9301 + 49297) % 233280;
        return this._seed / 233280;
    },

    /**
     * Generates a valid 9x9 Sudoku grid (solved).
     * Uses a mathematical pattern to ensure validity, then shuffles it.
     */
    _generateBaseGrid() {
        let grid = [];
        // 1. Create a structured valid grid
        // Pattern: (row * 3 + floor(row/3) + col) % 9 + 1
        for (let r = 0; r < 9; r++) {
            let row = [];
            for (let c = 0; c < 9; c++) {
                let n = Math.floor((r * 3 + Math.floor(r / 3) + c) % 9) + 1;
                row.push(n);
            }
            grid.push(row);
        }
        return grid;
    },

    /**
     * Shuffles the grid while maintaining Sudoku rules.
     * We can only swap rows/cols within the same 3x3 'block'.
     */
    _shuffleGrid(grid) {
        // Shuffle rows within each 3-row band (0-2, 3-5, 6-8)
        for (let i = 0; i < 9; i += 3) {
            this._shuffleRows(grid, i, i + 3);
        }
        
        // Transpose grid (swap rows and cols) to shuffle columns
        grid = this._transpose(grid);
        
        // Shuffle rows again (which are now columns)
        for (let i = 0; i < 9; i += 3) {
            this._shuffleRows(grid, i, i + 3);
        }
        
        // Transpose back
        grid = this._transpose(grid);
        
        return grid;
    },

    _shuffleRows(grid, start, end) {
        for (let i = start; i < end; i++) {
            let target = start + Math.floor(this._random() * (end - start));
            // Swap row i and row target
            let temp = grid[i];
            grid[i] = grid[target];
            grid[target] = temp;
        }
    },

    _transpose(grid) {
        let newGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                newGrid[c][r] = grid[r][c];
            }
        }
        return newGrid;
    },

    /**
     * MAIN FUNCTION: Generates the daily puzzle.
     * Returns an object with the 'puzzle' (with zeros) and 'solution' (filled).
     */
    generateDaily(dateString) {
        this._setSeed(dateString);

        // 1. Create Solved Board
        let solvedGrid = this._generateBaseGrid();
        solvedGrid = this._shuffleGrid(solvedGrid);

        // 2. Create Puzzle by removing numbers
        // Deep copy the solved grid to create the puzzle grid
        let puzzleGrid = solvedGrid.map(row => [...row]);

        // Difficulty: How many numbers to remove? 
        // 40-50 is roughly Medium/Hard. Let's go with 45.
        let attempts = 45;
        while (attempts > 0) {
            let r = Math.floor(this._random() * 9);
            let c = Math.floor(this._random() * 9);
            
            // Only remove if it's not already removed
            if (puzzleGrid[r][c] !== 0) {
                puzzleGrid[r][c] = 0; // 0 represents an empty cell
                attempts--;
            }
        }

        return {
            solution: solvedGrid,
            puzzle: puzzleGrid
        };
    }
};
