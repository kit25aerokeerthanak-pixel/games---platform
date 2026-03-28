const styles = document.createElement('style');
styles.innerHTML = `
.ttt-board {
    display: grid;
    grid-template-columns: repeat(3, 100px);
    grid-template-rows: repeat(3, 100px);
    gap: 10px;
    background: var(--glass-border);
    padding: 10px;
    border-radius: 12px;
}
.ttt-cell {
    background: var(--bg-color);
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: var(--font-heading);
    font-size: 4rem;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-main);
}
.ttt-cell:hover {
    background: rgba(255,255,255,0.05);
}
.ttt-x { color: var(--primary); }
.ttt-o { color: var(--secondary); }
`;
document.head.appendChild(styles);

registerGame({
    id: 'tictactoe',
    name: 'Tic Tac Toe',
    description: 'Classic 3x3 grid game. Play against the AI or a friend.',
    icon: '✕◯',
    supportedPlayers: [1, 2],
    difficulties: [
        { id: 'easy', name: 'Easy (Random)' },
        { id: 'hard', name: 'Hard (Minimax Rules)' }
    ],
    init: function(container, options) {
        let board = Array(9).fill('');
        let currentPlayer = 'X';
        let isGameOver = false;
        
        const boardEl = document.createElement('div');
        boardEl.className = 'ttt-board';
        container.appendChild(boardEl);

        const cells = [];
        
        function render() {
            boardEl.innerHTML = '';
            board.forEach((val, i) => {
                const cell = document.createElement('div');
                cell.className = `ttt-cell ${val === 'X' ? 'ttt-x' : val === 'O' ? 'ttt-o' : ''}`;
                cell.textContent = val;
                cell.addEventListener('click', () => handleMove(i));
                boardEl.appendChild(cell);
                cells.push(cell);
            });
        }

        function handleMove(index) {
            if (isGameOver || board[index]) return;
            
            board[index] = currentPlayer;
            render();
            
            if (checkWin(currentPlayer)) {
                endGame(`${currentPlayer} Wins!`, currentPlayer === 'X' ? 50 : 0);
            } else if (board.every(c => c)) {
                endGame(`It's a Draw!`, 10);
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                if (options.players === 1 && currentPlayer === 'O') {
                    setTimeout(aiMove, 500);
                }
            }
        }

        function aiMove() {
            if (isGameOver) return;
            const available = board.map((c, i) => c === '' ? i : null).filter(c => c !== null);
            let move = null;
            
            if (options.difficulty === 'easy') {
                move = available[Math.floor(Math.random() * available.length)];
            } else {
                move = findBestMove(board, 'O') ?? available[Math.floor(Math.random() * available.length)];
            }
            
            if (move !== null && move !== undefined) {
                handleMove(move);
            }
        }

        function findBestMove(b, player) {
            const opponent = player === 'O' ? 'X' : 'O';
            const winPaths = [
                [0,1,2], [3,4,5], [6,7,8],
                [0,3,6], [1,4,7], [2,5,8],
                [0,4,8], [2,4,6]
            ];
            for(let path of winPaths) {
                const [p1,p2,p3] = path;
                if(b[p1]===player && b[p2]===player && b[p3]==='') return p3;
                if(b[p1]===player && b[p3]===player && b[p2]==='') return p2;
                if(b[p2]===player && b[p3]===player && b[p1]==='') return p1;
            }
            for(let path of winPaths) {
                const [p1,p2,p3] = path;
                if(b[p1]===opponent && b[p2]===opponent && b[p3]==='') return p3;
                if(b[p1]===opponent && b[p3]===opponent && b[p2]==='') return p2;
                if(b[p2]===opponent && b[p3]===opponent && b[p1]==='') return p1;
            }
            if(b[4]==='') return 4;
            return null;
        }

        function checkWin(player) {
            const winPaths = [
                [0,1,2], [3,4,5], [6,7,8],
                [0,3,6], [1,4,7], [2,5,8],
                [0,4,8], [2,4,6]
            ];
            return winPaths.some(path => path.every(idx => board[idx] === player));
        }

        function endGame(message, score) {
            isGameOver = true;
            options.onGameOver({ message, score });
        }

        return {
            start() {
                board = Array(9).fill('');
                currentPlayer = 'X';
                isGameOver = false;
                render();
            },
            restart() {
                this.start();
            },
            destroy() {
                container.innerHTML = '';
            }
        };
    }
});
