const Store = {
    init() {
        if (!localStorage.getItem('arcadia_score')) {
            localStorage.setItem('arcadia_score', 0);
        }
        if (!localStorage.getItem('arcadia_stats')) {
            localStorage.setItem('arcadia_stats', JSON.stringify({}));
        }
    },

    getGlobalScore() {
        return parseInt(localStorage.getItem('arcadia_score'), 10) || 0;
    },

    addScore(points) {
        const current = this.getGlobalScore();
        localStorage.setItem('arcadia_score', current + points);
        return current + points;
    },

    getGameStats(gameId) {
        const stats = JSON.parse(localStorage.getItem('arcadia_stats'));
        return stats[gameId] || { plays: 0, highestScore: 0, wins: 0, losses: 0 };
    },

    updateGameStats(gameId, newStats) {
        const stats = JSON.parse(localStorage.getItem('arcadia_stats'));
        if (!stats[gameId]) {
            stats[gameId] = { plays: 0, highestScore: 0, wins: 0, losses: 0 };
        }
        stats[gameId] = { ...stats[gameId], ...newStats };
        localStorage.setItem('arcadia_stats', JSON.stringify(stats));
    }
};

Store.init();
