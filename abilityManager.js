// Ability Manager - handles player abilities (dash, shield, slow time)
class AbilityManager {
    constructor() {
        this.abilityType = 'dash'; // 'dash', 'shield', or 'slowTime'
        this.cooldownTimer = 0;
        this.activeTimer = 0;
        this.isActive = false;
        this.abilityKeyPressed = false;
    }
    
    /**
     * Setup ability key (Space for ability, separate from movement)
     */
    setupControls() {
        // Use 'E' key for ability activation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'e' || e.key === 'E') {
                e.preventDefault();
                this.activateAbility();
            }
        });
    }
    
    /**
     * Update ability system
     */
    update() {
        // Update cooldown
        if (this.cooldownTimer > 0) {
            this.cooldownTimer--;
        }
        
        // Update active ability
        if (this.isActive) {
            this.activeTimer--;
            if (this.activeTimer <= 0) {
                this.deactivateAbility();
            }
        }
    }
    
    /**
     * Activate ability
     */
    activateAbility() {
        if (this.cooldownTimer > 0 || this.isActive) return;
        
        this.isActive = true;
        
        // Update goals
        if (window.gameInstance && window.gameInstance.goalsManager) {
            window.gameInstance.goalsManager.updateGoal('useAbility10', 1);
        }
        
        switch (this.abilityType) {
            case 'dash':
                this.activeTimer = GAME_CONFIG.DASH_DURATION;
                break;
            case 'shield':
                this.activeTimer = GAME_CONFIG.SHIELD_ABILITY_DURATION;
                break;
            case 'slowTime':
                this.activeTimer = GAME_CONFIG.SLOW_TIME_DURATION;
                break;
        }
    }
    
    /**
     * Deactivate ability
     */
    deactivateAbility() {
        this.isActive = false;
        this.activeTimer = 0;
        this.cooldownTimer = GAME_CONFIG.ABILITY_COOLDOWN;
    }
    
    /**
     * Get ability effects
     */
    getAbilityEffects() {
        if (!this.isActive) {
            return {
                speedMultiplier: 1.0,
                hasShield: false,
                timeSlowFactor: 1.0
            };
        }
        
        switch (this.abilityType) {
            case 'dash':
                return {
                    speedMultiplier: GAME_CONFIG.DASH_SPEED_BOOST,
                    hasShield: false,
                    timeSlowFactor: 1.0
                };
            case 'shield':
                return {
                    speedMultiplier: 1.0,
                    hasShield: true,
                    timeSlowFactor: 1.0
                };
            case 'slowTime':
                return {
                    speedMultiplier: 1.0,
                    hasShield: false,
                    timeSlowFactor: GAME_CONFIG.SLOW_TIME_FACTOR
                };
        }
    }
    
    /**
     * Check if ability is ready
     */
    isReady() {
        return this.cooldownTimer === 0 && !this.isActive;
    }
    
    /**
     * Get cooldown progress (0-1)
     */
    getCooldownProgress() {
        return 1 - (this.cooldownTimer / GAME_CONFIG.ABILITY_COOLDOWN);
    }
    
    /**
     * Draw ability UI
     */
    draw(ctx) {
        const x = GAME_CONFIG.CANVAS_WIDTH - 120;
        const y = 20;
        const size = 80;
        
        // Background
        ctx.fillStyle = this.isReady() ? 'rgba(50, 205, 50, 0.8)' : 'rgba(100, 100, 100, 0.8)';
        ctx.fillRect(x, y, size, size);
        
        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);
        
        // Ability icon
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let icon = '';
        switch (this.abilityType) {
            case 'dash':
                icon = '⚡';
                break;
            case 'shield':
                icon = '🛡';
                break;
            case 'slowTime':
                icon = '⏱';
                break;
        }
        
        ctx.fillText(icon, x + size / 2, y + size / 2);
        
        // Cooldown overlay
        if (this.cooldownTimer > 0) {
            const progress = this.getCooldownProgress();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(x, y + size * (1 - progress), size, size * progress);
            
            // Cooldown text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Arial';
            const seconds = Math.ceil(this.cooldownTimer / 60);
            ctx.fillText(seconds.toString(), x + size / 2, y + size / 2);
        }
        
        // Active indicator
        if (this.isActive) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 4;
            ctx.strokeRect(x - 2, y - 2, size + 4, size + 4);
        }
        
        // Key hint
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press E', x + size / 2, y + size + 15);
    }
}

