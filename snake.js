registerGame({
    id: 'snake',
    name: 'Neon Snake',
    description: 'Navigate the grid, collect energy, grow longer. Avoid walls and yourself.',
    icon: '🐍',
    supportedPlayers: [1],
    difficulties: [
        { id: 'slow', name: 'Slow', speed: 150 },
        { id: 'normal', name: 'Normal', speed: 100 },
        { id: 'fast', name: 'Fast', speed: 60 }
    ],
    init: function(container, options) {
        const TILE_SIZE = 20;
        const GRID_SIZE = 20;
        
        const canvas = document.createElement('canvas');
        canvas.width = TILE_SIZE * GRID_SIZE;
        canvas.height = TILE_SIZE * GRID_SIZE;
        canvas.style.background = 'rgba(0,0,0,0.5)';
        canvas.style.borderRadius = '8px';
        canvas.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.2)';
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        
        let snake = [];
        let food = null;
        let dx = 1;
        let dy = 0;
        let timer = null;
        let score = 0;
        let isGameOver = false;
        
        function handleKey(e) {
            if(['ArrowUp', 'w', 'W'].includes(e.key) && dy !== 1) { dx = 0; dy = -1; e.preventDefault(); }
            if(['ArrowDown', 's', 'S'].includes(e.key) && dy !== -1) { dx = 0; dy = 1; e.preventDefault(); }
            if(['ArrowLeft', 'a', 'A'].includes(e.key) && dx !== 1) { dx = -1; dy = 0; e.preventDefault(); }
            if(['ArrowRight', 'd', 'D'].includes(e.key) && dx !== -1) { dx = 1; dy = 0; e.preventDefault(); }
        }
        
        function spawnFood() {
            food = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            for(let s of snake) {
                if(s.x === food.x && s.y === food.y) spawnFood();
            }
        }
        
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#ff0055';
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 10;
            ctx.fillRect(food.x * TILE_SIZE, food.y * TILE_SIZE, TILE_SIZE-2, TILE_SIZE-2);
            
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
            snake.forEach(seg => {
                ctx.fillRect(seg.x * TILE_SIZE, seg.y * TILE_SIZE, TILE_SIZE-2, TILE_SIZE-2);
            });
            ctx.shadowBlur = 0;
        }
        
        function update() {
            if(isGameOver) return;
            
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };
            
            if(head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                return endGame();
            }
            for(let seg of snake) {
                if(head.x === seg.x && head.y === seg.y) {
                    return endGame();
                }
            }
            
            snake.unshift(head);
            
            if(head.x === food.x && head.y === food.y) {
                score += 10;
                spawnFood();
            } else {
                snake.pop();
            }
            
            draw();
        }
        
        function endGame() {
            isGameOver = true;
            clearInterval(timer);
            options.onGameOver({ message: `Crash!`, score });
        }
        
        return {
            start() {
                snake = [
                    {x: 10, y: 10},
                    {x: 9, y: 10},
                    {x: 8, y: 10}
                ];
                dx = 1; dy = 0;
                score = 0;
                isGameOver = false;
                spawnFood();
                document.addEventListener('keydown', handleKey);
                if(timer) clearInterval(timer);
                timer = setInterval(update, options.diffConfig.speed);
                draw();
            },
            restart() {
                this.start();
            },
            destroy() {
                clearInterval(timer);
                document.removeEventListener('keydown', handleKey);
                container.innerHTML = '';
            }
        };
    }
});
