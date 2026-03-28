const GAME_REGISTRY = [];

function registerGame(gameConfig) {
    GAME_REGISTRY.push(gameConfig);
}

document.addEventListener('DOMContentLoaded', () => {
    const mainView = document.getElementById('main-view');
    const gameView = document.getElementById('game-view');
    const gameGrid = document.getElementById('game-grid');
    const globalScoreEl = document.getElementById('global-score');
    
    const setupModal = document.getElementById('setup-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const setupForm = document.getElementById('setup-form');
    
    const gameOverModal = document.getElementById('game-over-modal');
    
    let currentGame = null;
    let currentGameConfig = null;

    globalScoreEl.textContent = Store.getGlobalScore();

    GAME_REGISTRY.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-icon">${game.icon}</div>
            <h3>${game.name}</h3>
            <p>${game.description}</p>
            <div class="play-badge">Play Now</div>
        `;
        card.addEventListener('click', () => openSetupModal(game));
        gameGrid.appendChild(card);
    });

    function openSetupModal(game) {
        currentGameConfig = game;
        document.getElementById('modal-game-title').textContent = game.name;
        
        const playersGroup = document.getElementById('players-group');
        const playersOptionsContainer = document.getElementById('players-options');
        playersOptionsContainer.innerHTML = '';
        
        if (game.supportedPlayers.length > 1) {
            playersGroup.style.display = 'block';
            game.supportedPlayers.forEach((p, idx) => {
                const checked = idx === 0 ? 'checked' : '';
                playersOptionsContainer.innerHTML += `
                    <label class="radio-option">
                        <input type="radio" name="players" value="${p}" ${checked}>
                        <span class="radio-btn">${p} ${p === 1 ? 'Player' : 'Players'}</span>
                    </label>
                `;
            });
        } else {
            playersGroup.style.display = 'none';
            playersOptionsContainer.innerHTML = `<input type="hidden" name="players" value="${game.supportedPlayers[0]}">`;
        }

        const difficultyOptionsContainer = document.getElementById('difficulty-options');
        difficultyOptionsContainer.innerHTML = '';
        game.difficulties.forEach((diff, idx) => {
            const checked = idx === 0 ? 'checked' : '';
            difficultyOptionsContainer.innerHTML += `
                <label class="radio-option">
                    <input type="radio" name="difficulty" value="${diff.id}" ${checked}>
                    <span class="radio-btn">${diff.name}</span>
                </label>
            `;
        });

        setupModal.classList.remove('hidden');
    }

    btnCloseModal.addEventListener('click', () => {
        setupModal.classList.add('hidden');
    });

    setupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(setupForm);
        const players = parseInt(formData.get('players'), 10);
        const difficulty = formData.get('difficulty');
        
        setupModal.classList.add('hidden');
        startGame(currentGameConfig, players, difficulty);
    });

    function startGame(config, players, difficultyId) {
        mainView.classList.add('hidden');
        gameView.classList.remove('hidden');
        
        document.getElementById('current-game-title').textContent = config.name;
        const diffName = config.difficulties.find(d => d.id === difficultyId).name;
        document.getElementById('current-difficulty').textContent = `Difficulty: ${diffName}`;
        document.getElementById('current-players').textContent = `Players: ${players}`;
        
        const container = document.getElementById('game-container');
        container.innerHTML = '';
        
        currentGame = config.init(container, {
            players,
            difficulty: difficultyId,
            diffConfig: config.difficulties.find(d => d.id === difficultyId),
            onGameOver: handleGameOver
        });
        
        currentGame.start();
    }

    function handleGameOver(result) {
        Store.addScore(result.score || 0);
        globalScoreEl.textContent = Store.getGlobalScore();
        
        document.getElementById('game-over-message').textContent = result.message;
        document.getElementById('final-score').textContent = result.score || 0;
        
        gameOverModal.classList.remove('hidden');
    }

    document.getElementById('btn-back').addEventListener('click', () => {
        if(currentGame && currentGame.destroy) currentGame.destroy();
        gameView.classList.add('hidden');
        mainView.classList.remove('hidden');
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
        if(currentGame && currentGame.restart) currentGame.restart();
    });

    document.getElementById('btn-play-again').addEventListener('click', () => {
        gameOverModal.classList.add('hidden');
        if(currentGame && currentGame.restart) currentGame.restart();
    });

    document.getElementById('btn-hub').addEventListener('click', () => {
        gameOverModal.classList.add('hidden');
        if(currentGame && currentGame.destroy) currentGame.destroy();
        gameView.classList.add('hidden');
        mainView.classList.remove('hidden');
    });
});
