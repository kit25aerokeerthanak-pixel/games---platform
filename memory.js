const memStyles = document.createElement('style');
memStyles.innerHTML = `
.mem-board {
    display: grid;
    gap: 10px;
    background: var(--glass-border);
    padding: 15px;
    border-radius: 12px;
}
.mem-card {
    width: 60px;
    height: 60px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    cursor: pointer;
    transition: transform 0.3s, background 0.3s;
    user-select: none;
}
.mem-card.flipped {
    background: rgba(0, 240, 255, 0.1);
    transform: rotateY(180deg);
    border-color: var(--primary);
}
.mem-card.matched {
    background: rgba(112, 0, 255, 0.2);
    border-color: var(--accent);
    cursor: default;
}
.mem-card span {
    display: none;
    transform: rotateY(180deg);
}
.mem-card.flipped span, .mem-card.matched span {
    display: block;
}
@media (max-width: 600px) {
    .mem-card { width: 45px; height: 45px; font-size: 1.5rem; }
}
`;
document.head.appendChild(memStyles);

registerGame({
    id: 'memory',
    name: 'Memory Matrix',
    description: 'Test your cognitive limits by matching pairs of symbols.',
    icon: '🎴',
    supportedPlayers: [1],
    difficulties: [
        { id: 'easy', name: '4x4 Grid', size: 16, cols: 4 },
        { id: 'medium', name: '6x4 Grid', size: 24, cols: 6 },
        { id: 'hard', name: '6x6 Grid', size: 36, cols: 6 }
    ],
    init: function(container, options) {
        const boardEl = document.createElement('div');
        boardEl.className = 'mem-board';
        const cols = options.diffConfig.cols;
        boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        container.appendChild(boardEl);
        
        const symbols = ['👻','👽','🤖','👾','🎃','💀','🤡','👹','👺','💩','🦁','🐯','🐸','🐙','🦋','🦄','🦖','🐢'];
        let cards = [];
        let flippedIndices = [];
        let matchedCount = 0;
        let moves = 0;
        let lockBoard = false;
        
        function generateCards(count) {
            let deck = [];
            for(let i=0; i<count/2; i++) {
                deck.push(symbols[i % symbols.length]);
                deck.push(symbols[i % symbols.length]);
            }
            for(let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            return deck;
        }
        
        function render() {
            boardEl.innerHTML = '';
            cards.forEach((symbol, i) => {
                const card = document.createElement('div');
                card.className = 'mem-card';
                card.innerHTML = `<span>${symbol}</span>`;
                card.addEventListener('click', () => flipCard(i, card));
                boardEl.appendChild(card);
            });
        }
        
        function flipCard(idx, cardEl) {
            if(lockBoard) return;
            if(cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
            
            cardEl.classList.add('flipped');
            flippedIndices.push({idx, el: cardEl});
            
            if(flippedIndices.length === 2) {
                moves++;
                lockBoard = true;
                const [first, second] = flippedIndices;
                
                if(cards[first.idx] === cards[second.idx]) {
                    setTimeout(() => {
                        first.el.classList.add('matched');
                        second.el.classList.add('matched');
                        matchedCount += 2;
                        flippedIndices = [];
                        lockBoard = false;
                        
                        if(matchedCount === cards.length) {
                            const score = Math.max(0, (cards.length * 10) - (moves * 2));
                            options.onGameOver({ message: `Cleared in ${moves} moves!`, score });
                        }
                    }, 500);
                } else {
                    setTimeout(() => {
                        first.el.classList.remove('flipped');
                        second.el.classList.remove('flipped');
                        flippedIndices = [];
                        lockBoard = false;
                    }, 1000);
                }
            }
        }
        
        return {
            start() {
                matchedCount = 0;
                moves = 0;
                flippedIndices = [];
                lockBoard = false;
                cards = generateCards(options.diffConfig.size);
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
