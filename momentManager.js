// Moment Manager - handles pacing events (snowstorm, speed burst, gift rush)
class MomentManager {
    constructor() {
        this.activeMoment = null;
        this.momentTimer = 0;
        this.momentDuration = 0;
        this.nextMomentFrame = GAME_CONFIG.MOMENT_INTERVAL_MIN;
        this.momentCooldown = 0;
        this.snowstormSurvived = false;
    }
    
    /**
     * Update moment system
     */
    update(gameState) {
        const frameCount = gameState.getFrameCount();
        
        // Update active moment
        if (this.activeMoment) {
            this.momentTimer++;
            if (this.momentTimer >= this.momentDuration) {
                this.endMoment();
            }
        }
        
        // Check if it's time for a new moment
        if (!this.activeMoment && frameCount >= this.nextMomentFrame && this.momentCooldown <= 0) {
            this.triggerRandomMoment();
        }
        
        // Update cooldown
        if (this.momentCooldown > 0) {
            this.momentCooldown--;
        }
    }
    
    /**
     * Trigger a random moment
     */
    triggerRandomMoment() {
        const moments = ['snowstorm', 'speedBurst', 'giftRush'];
        const moment = moments[Math.floor(Math.random() * moments.length)];
        
        this.activeMoment = moment;
        this.momentTimer = 0;
        
        switch (moment) {
            case 'snowstorm':
                this.momentDuration = GAME_CONFIG.SNOWSTORM_DURATION;
                break;
            case 'speedBurst':
                this.momentDuration = GAME_CONFIG.SPEED_BURST_DURATION;
                break;
            case 'giftRush':
                this.momentDuration = GAME_CONFIG.GIFT_RUSH_DURATION;
                break;
        }
        
        // Set next moment interval
        const interval = GAME_CONFIG.MOMENT_INTERVAL_MIN + 
                        Math.random() * (GAME_CONFIG.MOMENT_INTERVAL_MAX - GAME_CONFIG.MOMENT_INTERVAL_MIN);
        this.nextMomentFrame = this.momentTimer + interval;
    }
    
    /**
     * End current moment
     */
    endMoment() {
        // Track snowstorm survival
        if (this.activeMoment === 'snowstorm') {
            this.snowstormSurvived = true;
            if (window.gameInstance && window.gameInstance.goalsManager) {
                window.gameInstance.goalsManager.updateGoal('surviveSnowstorm', 1);
            }
        }
        
        this.activeMoment = null;
        this.momentTimer = 0;
        this.momentCooldown = 300; // 5 second cooldown
    }
    
    /**
     * Get current moment effects
     */
    getMomentEffects() {
        if (!this.activeMoment) {
            return {
                visibility: 1.0,
                screenShake: 0,
                obstacleSpawnMultiplier: 1.0,
                giftSpawnMultiplier: 1.0,
                speedMultiplier: 1.0,
                scoreMultiplier: 1.0
            };
        }
        
        switch (this.activeMoment) {
            case 'snowstorm':
                return {
                    visibility: 0.5, // Reduced visibility
                    screenShake: 1,
                    obstacleSpawnMultiplier: 0.7, // Fewer but more dangerous
                    giftSpawnMultiplier: 0.5,
                    speedMultiplier: 1.0,
                    scoreMultiplier: 1.2
                };
            case 'speedBurst':
                return {
                    visibility: 1.0,
                    screenShake: 0.5,
                    obstacleSpawnMultiplier: 1.0,
                    giftSpawnMultiplier: 1.0,
                    speedMultiplier: 1.5,
                    scoreMultiplier: 1.5
                };
            case 'giftRush':
                return {
                    visibility: 1.0,
                    screenShake: 0,
                    obstacleSpawnMultiplier: 0.5, // Fewer obstacles
                    giftSpawnMultiplier: 3.0, // Many gifts
                    speedMultiplier: 1.0,
                    scoreMultiplier: 1.0
                };
        }
    }
    
    /**
     * Draw moment indicator
     */
    draw(ctx) {
        if (this.activeMoment) {
            const centerX = GAME_CONFIG.CANVAS_WIDTH / 2;
            const y = 80;
            
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(centerX - 150, y - 25, 300, 50);
            
            // Border
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(centerX - 150, y - 25, 300, 50);
            
            // Moment name
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            
            let momentText = '';
            switch (this.activeMoment) {
                case 'snowstorm':
                    momentText = '❄️ SNOWSTORM';
                    break;
                case 'speedBurst':
                    momentText = '🎅 SPEED BURST';
                    break;
                case 'giftRush':
                    momentText = '🎁 GIFT RUSH';
                    break;
            }
            
            ctx.fillText(momentText, centerX, y + 8);
            
            // Timer bar
            const progress = this.momentTimer / this.momentDuration;
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(centerX - 140, y + 15, 280 * (1 - progress), 5);
        }
    }
}

