# 🔢 Daily Sudoku

### A minimalist, algorithmically generated, infinite Sudoku game.
**Play Live:** [Sudoku](https://shivhanda.github.io/Sudoku/)


## 🧠 The "Brain" Behind It

Unlike static puzzle sites, this project runs on a powerful **Client-Side Engine**:

1.  **Procedural Generation:** No database needed! The game generates a valid, unique 9x9 grid on-the-fly using a **Backtracking Algorithm**.
2.  **Seeded Logic:** The engine uses the current date as a "Random Seed". 
    > This ensures **everyone gets the exact same puzzle** on the same day, globally.
3.  **Unique Solution:** The generator ensures that every puzzle created has exactly one valid solution, maintaining true Sudoku logic.

---

## ✨ Key Features

* **📅 Infinite Gameplay:** A fresh, algorithmically crafted puzzle every 24 hours.
* **📱 Adaptive UI:** "No-Scroll" design. The grid scales dynamically using `clamp()` logic to fit perfectly on any device.
* **⚡ Instant Validation:** Inputs are checked against the solved grid in real-time. Mistakes turn <span style="color:red">**RED**</span>.
* **🌙 Pro Dark Mode:** Features a smooth toggle switch, system preference detection, and local storage memory.
* **⏱️ Speed Run:** Built-in timer to track your solving speed against the clock.

---

## 🛠️ Installation

1.  **Clone the Repo**
    ```bash
    git clone [https://github.com/ShivHanda/Sudoku.git](https://github.com/ShivHanda/Sudoku.git)
    ```

2.  **Run**
    Simply open `index.html` in your browser. No Python or Backend required!

---

## ❤️ Credits

* **Developer:** Shiv Handa
* **Engine Logic:** Custom recursive backtracking algorithm for generation and solving.

⭐ **Star this repo if you love clean code & logic!**
