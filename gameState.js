// Game state manager - handles all game state transitions
class GameState {
    constructor() {
        this.currentState = GAME_STATES.START;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.frameCount = 0;
        this.startTime = 0;
        this.pausedTime = 0;
        this.pauseStartTime = 0;
        
        // Power-up states
        this.activePowerUps = {
            slowMotion: false,
            shield: false,
            doubleScore: false
        };
        this.powerUpTimers = {
            slowMotion: 0,
            shield: 0,
            doubleScore: 0
        };
        
        this.initializeUI();
    }
    
    /**
     * Initialize UI event listeners
     */
    initializeUI() {
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('resumeButton').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('playAgainButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Achievements buttons
        document.getElementById('achievementsButton').addEventListener('click', () => {
            this.showAchievements();
        });
        
        document.getElementById('achievementsButtonPause').addEventListener('click', () => {
            this.showAchievements();
        });
        
        document.getElementById('achievementsButtonGameOver').addEventListener('click', () => {
            this.showAchievements();
        });
        
        document.getElementById('closeAchievementsButton').addEventListener('click', () => {
            this.hideAchievements();
        });
        
        // Pause on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentState === GAME_STATES.PLAYING) {
                this.pauseGame();
            } else if (e.key === 'Escape' && document.getElementById('achievementsScreen') && 
                      !document.getElementById('achievementsScreen').classList.contains('hidden')) {
                this.hideAchievements();
            }
        });
    }
    
    /**
     * Start a new game
     */
    startGame() {
        this.currentState = GAME_STATES.PLAYING;
        this.score = 0;
        this.frameCount = 0;
        this.startTime = Date.now();
        this.pausedTime = 0;
        this.resetPowerUps();
        this.updateUI();
        
        // Trigger reset callback if available
        if (this.onRestart) {
            this.onRestart();
        }
    }
    
    /**
     * Pause the game
     */
    pauseGame() {
        if (this.currentState === GAME_STATES.PLAYING) {
            this.currentState = GAME_STATES.PAUSED;
            this.pauseStartTime = Date.now();
            this.updateUI();
        }
    }
    
    /**
     * Resume the game
     */
    resumeGame() {
        if (this.currentState === GAME_STATES.PAUSED) {
            this.currentState = GAME_STATES.PLAYING;
            this.pausedTime += Date.now() - this.pauseStartTime;
            this.updateUI();
        }
    }
    
    /**
     * Restart the game
     */
    restartGame() {
        this.currentState = GAME_STATES.PLAYING;
        this.score = 0;
        this.frameCount = 0;
        this.startTime = Date.now();
        this.pausedTime = 0;
        this.resetPowerUps();
        this.updateUI();
        
        // Trigger reset callback if available
        if (this.onRestart) {
            this.onRestart();
        }
    }
    
    /**
     * End the game
     */
    gameOver() {
        this.currentState = GAME_STATES.GAME_OVER;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        this.updateUI();
    }
    
    /**
     * Update score based on time and events
     */
    updateScore(points = 0) {
        const multiplier = this.activePowerUps.doubleScore ? 2 : 1;
        this.score += points * multiplier;
        
        // Also add time-based score
        if (this.currentState === GAME_STATES.PLAYING) {
            const elapsed = (Date.now() - this.startTime - this.pausedTime) / 1000;
            const timeScore = Math.floor(elapsed * GAME_CONFIG.SCORE_PER_SECOND);
            this.score = Math.max(this.score, timeScore);
        }
    }
    
    /**
     * Activate a power-up
     */
    activatePowerUp(type) {
        this.activePowerUps[type] = true;
        const duration = GAME_CONFIG[`${type.toUpperCase().replace(/([A-Z])/g, '_$1')}_DURATION`];
        this.powerUpTimers[type] = duration;
    }
    
    /**
     * Update power-up timers
     */
    updatePowerUps() {
        for (const [key, active] of Object.entries(this.activePowerUps)) {
            if (active) {
                this.powerUpTimers[key]--;
                if (this.powerUpTimers[key] <= 0) {
                    this.activePowerUps[key] = false;
                    this.powerUpTimers[key] = 0;
                }
            }
        }
    }
    
    /**
     * Reset all power-ups
     */
    resetPowerUps() {
        this.activePowerUps = {
            slowMotion: false,
            shield: false,
            doubleScore: false
        };
        this.powerUpTimers = {
            slowMotion: 0,
            shield: 0,
            doubleScore: 0
        };
    }
    
    /**
     * Get current speed multiplier (affected by slow motion)
     */
    getSpeedMultiplier() {
        return this.activePowerUps.slowMotion ? 0.5 : 1.0;
    }
    
    /**
     * Check if player has shield
     */
    hasShield() {
        return this.activePowerUps.shield;
    }
    
    /**
     * Show achievements screen
     */
    showAchievements() {
        document.getElementById('achievementsScreen').classList.remove('hidden');
        this.updateAchievementsDisplay();
    }
    
    /**
     * Hide achievements screen
     */
    hideAchievements() {
        document.getElementById('achievementsScreen').classList.add('hidden');
    }
    
    /**
     * Update achievements display
     */
    updateAchievementsDisplay() {
        if (!window.gameInstance || !window.gameInstance.goalsManager) return;
        
        const goalsManager = window.gameInstance.goalsManager;
        const goals = goalsManager.getGoalProgress();
        const unlocked = goalsManager.unlocked;
        
        // Update goals list
        const goalsList = document.getElementById('achievementsGoalsList');
        goalsList.innerHTML = '';
        
        goals.forEach(goal => {
            const item = document.createElement('div');
            item.className = `achievement-item ${goal.completed ? 'completed' : ''}`;
            
            const progressPercent = Math.min((goal.progress / goal.target) * 100, 100);
            
            item.innerHTML = `
                <div class="achievement-name">
                    ${goal.completed ? '✓' : '○'} ${goal.name}
                </div>
                <div class="achievement-progress">
                    ${goal.progress} / ${goal.target}
                </div>
                <div class="achievement-progress-bar">
                    <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            `;
            
            goalsList.appendChild(item);
        });
        
        // Update unlockables list
        const unlockedList = document.getElementById('achievementsUnlockedList');
        unlockedList.innerHTML = '';
        
        // Sleigh Colors
        const sleighColors = ['default', 'gold', 'silver', 'green'];
        sleighColors.forEach(color => {
            const isUnlocked = unlocked.sleighColors.includes(color);
            const item = document.createElement('div');
            item.className = `unlockable-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            
            const colorNames = {
                'default': '🎅 Default Sleigh',
                'gold': '✨ Gold Sleigh',
                'silver': '💎 Silver Sleigh',
                'green': '🎄 Green Sleigh'
            };
            
            item.innerHTML = `
                <span class="unlockable-icon">${isUnlocked ? '🎁' : '🔒'}</span>
                <span class="unlockable-name">${colorNames[color]}</span>
                <span class="unlockable-status ${isUnlocked ? 'unlocked' : 'locked'}">
                    ${isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
            `;
            
            unlockedList.appendChild(item);
        });
        
        // Santa Hats
        const santaHats = ['default', 'elf', 'reindeer'];
        santaHats.forEach(hat => {
            const isUnlocked = unlocked.santaHats.includes(hat);
            const item = document.createElement('div');
            item.className = `unlockable-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            
            const hatNames = {
                'default': '🎅 Default Hat',
                'elf': '🧝 Elf Hat',
                'reindeer': '🦌 Reindeer Hat'
            };
            
            item.innerHTML = `
                <span class="unlockable-icon">${isUnlocked ? '🎁' : '🔒'}</span>
                <span class="unlockable-name">${hatNames[hat]}</span>
                <span class="unlockable-status ${isUnlocked ? 'unlocked' : 'locked'}">
                    ${isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
            `;
            
            unlockedList.appendChild(item);
        });
        
        // Backgrounds
        const backgrounds = ['default', 'night', 'aurora'];
        backgrounds.forEach(bg => {
            const isUnlocked = unlocked.backgrounds.includes(bg);
            const item = document.createElement('div');
            item.className = `unlockable-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            
            const bgNames = {
                'default': '☀️ Default Background',
                'night': '🌙 Night Background',
                'aurora': '🌌 Aurora Background'
            };
            
            item.innerHTML = `
                <span class="unlockable-icon">${isUnlocked ? '🎁' : '🔒'}</span>
                <span class="unlockable-name">${bgNames[bg]}</span>
                <span class="unlockable-status ${isUnlocked ? 'unlocked' : 'locked'}">
                    ${isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
            `;
            
            unlockedList.appendChild(item);
        });
    }
    
    /**
     * Update UI based on current state
     */
    updateUI() {
        // Show/hide screens (but not achievements screen - it's handled separately)
        const achievementsScreen = document.getElementById('achievementsScreen');
        const isAchievementsVisible = achievementsScreen && !achievementsScreen.classList.contains('hidden');
        
        if (!isAchievementsVisible) {
            document.getElementById('startScreen').classList.toggle('hidden', 
                this.currentState !== GAME_STATES.START);
            document.getElementById('pauseScreen').classList.toggle('hidden', 
                this.currentState !== GAME_STATES.PAUSED);
            document.getElementById('gameOverScreen').classList.toggle('hidden', 
                this.currentState !== GAME_STATES.GAME_OVER);
        }
        
        document.getElementById('hud').classList.toggle('hidden', 
            this.currentState !== GAME_STATES.PLAYING);
        
        // Update score displays
        document.getElementById('currentScore').textContent = Math.floor(this.score);
        document.getElementById('finalScore').textContent = Math.floor(this.score);
        document.getElementById('highScore').textContent = Math.floor(this.highScore);
        
        // Update power-up indicator
        this.updatePowerUpIndicator();
        
        // Update goals display on game over
        if (this.currentState === GAME_STATES.GAME_OVER && window.gameInstance) {
            this.updateGoalsDisplay();
        }
    }
    
    /**
     * Update goals display on game over screen
     */
    updateGoalsDisplay() {
        const goalsDisplay = document.getElementById('goalsDisplay');
        if (!goalsDisplay || !window.gameInstance || !window.gameInstance.goalsManager) return;
        
        const goals = window.gameInstance.goalsManager.getGoalProgress();
        goalsDisplay.innerHTML = '<h3 style="color: #FFD700; margin-bottom: 10px;">Goals:</h3>';
        
        goals.forEach(goal => {
            const status = goal.completed ? '✓' : '○';
            const color = goal.completed ? '#90EE90' : '#FFFFFF';
            const progress = `${goal.progress}/${goal.target}`;
            const p = document.createElement('p');
            p.style.color = color;
            p.style.margin = '5px 0';
            p.textContent = `${status} ${goal.name}: ${progress}`;
            goalsDisplay.appendChild(p);
        });
    }
    
    /**
     * Update power-up indicator in HUD
     */
    updatePowerUpIndicator() {
        const indicator = document.getElementById('powerupIndicator');
        const active = [];
        
        if (this.activePowerUps.slowMotion) {
            active.push('⏱ Slow Motion');
        }
        if (this.activePowerUps.shield) {
            active.push('🛡 Shield');
        }
        if (this.activePowerUps.doubleScore) {
            active.push('2x Score');
        }
        
        indicator.textContent = active.length > 0 ? active.join(' | ') : '';
    }
    
    /**
     * Load high score from localStorage
     */
    loadHighScore() {
        const saved = localStorage.getItem('santaHighScore');
        return saved ? parseInt(saved, 10) : 0;
    }
    
    /**
     * Save high score to localStorage
     */
    saveHighScore() {
        localStorage.setItem('santaHighScore', this.highScore.toString());
    }
    
    /**
     * Increment frame count
     */
    incrementFrame() {
        if (this.currentState === GAME_STATES.PLAYING) {
            this.frameCount++;
        }
    }
    
    /**
     * Get current frame count
     */
    getFrameCount() {
        return this.frameCount;
    }
}

