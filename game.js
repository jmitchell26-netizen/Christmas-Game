// Main game loop and initialization
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
        
        // Initialize game systems
        this.gameState = new GameState();
        this.player = new Player();
        this.obstacleManager = new ObstacleManager();
        this.collectibleManager = new CollectibleManager();
        this.routeManager = new RouteManager();
        this.momentManager = new MomentManager();
        this.abilityManager = new AbilityManager();
        this.goalsManager = new GoalsManager();
        
        // Setup ability controls
        this.abilityManager.setupControls();
        this.setupRouteControls();
        
        // Set up restart callback
        this.gameState.onRestart = () => this.reset();
        
        // Background elements
        this.snowflakes = this.createSnowflakes();
        this.parallaxLayers = this.createParallaxLayers();
        this.backgroundOffset = 0;
        
        // Camera shake
        this.cameraShake = { x: 0, y: 0, intensity: 0 };
        this.lastNearMissFrame = 0;
        
        // Animation frame
        this.animationId = null;
        
        // Start game loop
        this.gameLoop();
    }
    
    /**
     * Setup route selection controls
     */
    setupRouteControls() {
        document.addEventListener('keydown', (e) => {
            if (this.routeManager.showingDecision) {
                if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                    e.preventDefault();
                    this.routeManager.selectRoute('left');
                } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                    e.preventDefault();
                    this.routeManager.selectRoute('right');
                }
            }
        });
    }
    
    /**
     * Create parallax background layers
     */
    createParallaxLayers() {
        const layers = [];
        for (let i = 0; i < GAME_CONFIG.PARALLAX_LAYER_COUNT; i++) {
            layers.push({
                offset: 0,
                speed: GAME_CONFIG.PARALLAX_SPEEDS[i],
                elements: this.generateParallaxElements(i)
            });
        }
        return layers;
    }
    
    /**
     * Generate elements for parallax layer
     */
    generateParallaxElements(layerIndex) {
        const elements = [];
        const count = 5 + layerIndex * 2; // More elements in foreground layers
        for (let i = 0; i < count; i++) {
            elements.push({
                x: (GAME_CONFIG.CANVAS_WIDTH / count) * i,
                y: Math.random() * GAME_CONFIG.CANVAS_HEIGHT * 0.7,
                size: 20 + layerIndex * 10,
                type: ['cloud', 'mountain'][Math.floor(Math.random() * 2)]
            });
        }
        return elements;
    }
    
    /**
     * Create snowflakes for background effect
     */
    createSnowflakes() {
        const snowflakes = [];
        for (let i = 0; i < GAME_CONFIG.SNOWFLAKE_COUNT; i++) {
            snowflakes.push({
                x: Math.random() * GAME_CONFIG.CANVAS_WIDTH,
                y: Math.random() * GAME_CONFIG.CANVAS_HEIGHT,
                size: Math.random() * 3 + 1,
                speed: Math.random() * GAME_CONFIG.SNOWFLAKE_SPEED + 0.5,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
        return snowflakes;
    }
    
    /**
     * Main game loop using requestAnimationFrame
     */
    gameLoop() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Update game logic
     */
    update() {
        if (this.gameState.currentState === GAME_STATES.PLAYING) {
            this.gameState.incrementFrame();
            this.gameState.updatePowerUps();
            
            // Update managers
            this.routeManager.update(this.gameState);
            this.momentManager.update(this.gameState);
            this.abilityManager.update();
            
            // Get modifiers from all systems
            const routeModifiers = this.routeManager.getRouteModifiers();
            const momentEffects = this.momentManager.getMomentEffects();
            const abilityEffects = this.abilityManager.getAbilityEffects();
            
            // Calculate combined speed multiplier
            const speedMultiplier = momentEffects.speedMultiplier * abilityEffects.timeSlowFactor;
            const isDashing = this.abilityManager.isActive && this.abilityManager.abilityType === 'dash';
            
            // Apply wind force
            const windForce = this.obstacleManager.applyWindForce(this.player.getBounds());
            
            // Update player
            this.player.update(speedMultiplier, windForce, isDashing);
            
            // Update obstacles with route and moment modifiers
            const obstacleSpawnMultiplier = routeModifiers.spawnMultiplier * momentEffects.obstacleSpawnMultiplier;
            const obstacleSpeedMultiplier = routeModifiers.speedMultiplier * momentEffects.speedMultiplier * abilityEffects.timeSlowFactor;
            this.obstacleManager.update(this.gameState, obstacleSpeedMultiplier, {
                spawnMultiplier: obstacleSpawnMultiplier,
                speedMultiplier: obstacleSpeedMultiplier
            });
            
            // Update collectibles with moment spawn multiplier
            const giftSpawnMultiplier = momentEffects.giftSpawnMultiplier;
            this.collectibleManager.update(this.gameState, speedMultiplier, giftSpawnMultiplier);
            
            // Check collisions
            this.checkCollisions();
            
            // Update score with route multiplier
            const scoreMultiplier = routeModifiers.scoreMultiplier * momentEffects.scoreMultiplier;
            this.gameState.updateScore();
            this.gameState.updateUI();
            
            // Update goals
            this.updateGoals();
            
            // Update snowflakes
            this.updateSnowflakes();
            
            // Update parallax
            this.updateParallax();
            
            // Update camera shake
            this.updateCameraShake(momentEffects);
            
            // Check for near misses (for camera shake)
            this.checkNearMisses();
        }
    }
    
    /**
     * Update goals based on gameplay
     */
    updateGoals() {
        // Check score goal
        if (this.gameState.score >= 5000) {
            this.goalsManager.updateGoal('score5000', this.gameState.score);
        }
        
        // Snowstorm survival is tracked in momentManager.endMoment()
        
        // Ability use is tracked in ability manager activation
    }
    
    /**
     * Check for near misses (for camera shake)
     */
    checkNearMisses() {
        const playerBounds = this.player.getBounds();
        const obstacles = this.obstacleManager.getObstacles();
        const frameCount = this.gameState.getFrameCount();
        
        for (const obstacle of obstacles) {
            const distance = Math.abs((obstacle.x + obstacle.width / 2) - (playerBounds.x + playerBounds.width / 2));
            if (distance < 50 && distance > 20 && frameCount - this.lastNearMissFrame > 60) {
                this.addCameraShake(GAME_CONFIG.SHAKE_INTENSITY_NEAR_MISS);
                this.lastNearMissFrame = frameCount;
                break;
            }
        }
    }
    
    /**
     * Add camera shake
     */
    addCameraShake(intensity) {
        this.cameraShake.intensity = Math.max(this.cameraShake.intensity, intensity);
    }
    
    /**
     * Update camera shake
     */
    updateCameraShake(momentEffects) {
        // Add shake from moments
        if (momentEffects.screenShake > 0) {
            this.cameraShake.intensity = Math.max(this.cameraShake.intensity, 
                momentEffects.screenShake * GAME_CONFIG.SHAKE_INTENSITY_SPEED_BURST);
        }
        
        // Apply shake
        this.cameraShake.x = (Math.random() - 0.5) * this.cameraShake.intensity;
        this.cameraShake.y = (Math.random() - 0.5) * this.cameraShake.intensity;
        
        // Decay shake
        this.cameraShake.intensity *= GAME_CONFIG.SHAKE_DECAY;
        if (this.cameraShake.intensity < 0.1) {
            this.cameraShake.intensity = 0;
            this.cameraShake.x = 0;
            this.cameraShake.y = 0;
        }
    }
    
    /**
     * Update parallax layers
     */
    updateParallax() {
        this.parallaxLayers.forEach(layer => {
            layer.offset += layer.speed;
            if (layer.offset > GAME_CONFIG.CANVAS_WIDTH) {
                layer.offset = 0;
            }
        });
    }
    
    /**
     * Draw everything on the canvas
     */
    draw() {
        // Apply camera shake transform
        this.ctx.save();
        this.ctx.translate(this.cameraShake.x, this.cameraShake.y);
        
        // Clear canvas
        this.ctx.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
        
        // Draw parallax background
        this.drawParallaxBackground();
        
        // Draw background gradient
        this.drawBackground();
        
        // Draw snowflakes
        this.drawSnowflakes();
        
        if (this.gameState.currentState === GAME_STATES.PLAYING) {
            // Draw ground/snow
            this.drawGround();
            
            // Draw collectibles
            this.collectibleManager.draw(this.ctx);
            
            // Draw obstacles
            this.obstacleManager.draw(this.ctx);
            
            // Draw player (with equipped items)
            const isDashing = this.abilityManager.isActive && this.abilityManager.abilityType === 'dash';
            const sleighColor = this.goalsManager.equipped.sleighColor;
            const hatType = this.goalsManager.equipped.santaHat;
            this.player.draw(this.ctx, isDashing, sleighColor, hatType);
            
            // Draw shield effect if active
            const hasShield = this.gameState.hasShield() || 
                            (this.abilityManager.isActive && this.abilityManager.abilityType === 'shield');
            if (hasShield) {
                this.drawShield();
            }
            
            // Draw route decision UI
            this.routeManager.draw(this.ctx);
            
            // Draw moment indicator
            this.momentManager.draw(this.ctx);
            
            // Draw ability UI
            this.abilityManager.draw(this.ctx);
            
            // Apply visibility reduction for snowstorm
            const momentEffects = this.momentManager.getMomentEffects();
            if (momentEffects.visibility < 1.0) {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${1 - momentEffects.visibility})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw parallax background layers
     */
    drawParallaxBackground() {
        this.parallaxLayers.forEach((layer, index) => {
            layer.elements.forEach(element => {
                const x = element.x - layer.offset;
                if (x < -element.size) {
                    element.x += GAME_CONFIG.CANVAS_WIDTH + element.size * 2;
                }
                
                this.ctx.fillStyle = index === 0 ? 'rgba(100, 100, 120, 0.3)' : 'rgba(150, 150, 170, 0.2)';
                
                if (element.type === 'cloud') {
                    this.ctx.beginPath();
                    this.ctx.arc(x, element.y, element.size, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (element.type === 'mountain') {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, element.y);
                    this.ctx.lineTo(x + element.size, element.y - element.size);
                    this.ctx.lineTo(x + element.size * 2, element.y);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            });
        });
    }
    
    /**
     * Draw background gradient (with equipped background)
     */
    drawBackground() {
        const backgroundType = this.goalsManager.equipped.background;
        
        if (backgroundType === 'night') {
            // Night background
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(0.5, '#16213e');
            gradient.addColorStop(1, '#0f3460');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Stars
            this.ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 50; i++) {
                const x = (i * 37) % this.canvas.width;
                const y = (i * 23) % (this.canvas.height * 0.7);
                this.ctx.beginPath();
                this.ctx.arc(x, y, 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else if (backgroundType === 'aurora') {
            // Aurora background
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#0a0e27');
            gradient.addColorStop(0.3, '#1a1f3a');
            gradient.addColorStop(0.6, '#2d1b4e');
            gradient.addColorStop(1, '#1a1f3a');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Aurora effect
            const time = Date.now() / 2000;
            this.ctx.fillStyle = `rgba(0, 255, 200, ${0.3 + Math.sin(time) * 0.2})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.4);
        } else {
            // Default background
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, GAME_CONFIG.COLORS.SKY_TOP);
            gradient.addColorStop(0.5, GAME_CONFIG.COLORS.SKY_MID);
            gradient.addColorStop(1, GAME_CONFIG.COLORS.SKY_BOTTOM);
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Draw ground/snow layer
     */
    drawGround() {
        const groundY = GAME_CONFIG.CANVAS_HEIGHT - 20;
        this.ctx.fillStyle = GAME_CONFIG.COLORS.SNOW;
        this.ctx.fillRect(0, groundY, this.canvas.width, 20);
        
        // Add some texture
        this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, groundY);
            this.ctx.lineTo(i + 10, groundY + 5);
            this.ctx.stroke();
        }
    }
    
    /**
     * Update snowflake positions
     */
    updateSnowflakes() {
        this.snowflakes.forEach(flake => {
            flake.y += flake.speed;
            if (flake.y > this.canvas.height) {
                flake.y = -5;
                flake.x = Math.random() * this.canvas.width;
            }
        });
    }
    
    /**
     * Draw snowflakes
     */
    drawSnowflakes() {
        this.ctx.fillStyle = GAME_CONFIG.COLORS.SNOW;
        this.snowflakes.forEach(flake => {
            this.ctx.globalAlpha = flake.opacity;
            this.ctx.beginPath();
            this.ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;
    }
    
    /**
     * Draw shield effect around player
     */
    drawShield() {
        const bounds = this.player.getBounds();
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        const radius = Math.max(bounds.width, bounds.height) / 2 + 10;
        
        this.ctx.strokeStyle = 'rgba(50, 205, 50, 0.6)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Pulsing effect
        const pulse = Math.sin(Date.now() / 100) * 3;
        this.ctx.strokeStyle = 'rgba(50, 205, 50, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius + pulse, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    /**
     * Check for collisions between player and obstacles/collectibles
     */
    checkCollisions() {
        const playerBounds = this.player.getBounds();
        const abilityEffects = this.abilityManager.getAbilityEffects();
        
        // Check obstacle collisions
        const obstacles = this.obstacleManager.getObstacles();
        for (const obstacle of obstacles) {
            if (obstacle.type === 'windGust') continue; // Wind gusts don't cause collisions
            
            if (this.checkAABBCollision(playerBounds, obstacle)) {
                // Shield protects from collision
                if (this.gameState.hasShield() || abilityEffects.hasShield) {
                    if (abilityEffects.hasShield) {
                        // Ability shield - just remove it
                        this.abilityManager.deactivateAbility();
                    } else {
                        // Power-up shield
                        this.gameState.activePowerUps.shield = false;
                        this.gameState.powerUpTimers.shield = 0;
                    }
                } else {
                    this.gameState.gameOver();
                    return;
                }
            }
        }
        
        // Check collectible collisions
        const collectibles = this.collectibleManager.getCollectibles();
        for (const collectible of collectibles) {
            if (this.checkAABBCollision(playerBounds, collectible)) {
                this.handleCollectible(collectible);
                this.collectibleManager.removeCollectible(collectible);
            }
        }
    }
    
    /**
     * Axis-Aligned Bounding Box collision detection
     */
    checkAABBCollision(box1, box2) {
        return box1.x < box2.x + box2.width &&
               box1.x + box1.width > box2.x &&
               box1.y < box2.y + box2.height &&
               box1.y + box1.height > box2.y;
    }
    
    /**
     * Handle collectible pickup
     */
    handleCollectible(collectible) {
        const routeModifiers = this.routeManager.getRouteModifiers();
        
        switch (collectible.type) {
            case 'gift':
                const giftValue = GAME_CONFIG.SCORE_PER_GIFT * routeModifiers.giftValueMultiplier;
                this.gameState.updateScore(giftValue);
                this.goalsManager.updateGoal('deliver10', 1);
                // Check for gold presents (random chance)
                if (Math.random() < 0.1) {
                    this.goalsManager.updateGoal('collect3Gold', 1);
                }
                break;
            case 'slowMotion':
                this.gameState.activatePowerUp('slowMotion');
                this.gameState.updateScore(GAME_CONFIG.SCORE_PER_POWERUP);
                break;
            case 'shield':
                this.gameState.activatePowerUp('shield');
                this.gameState.updateScore(GAME_CONFIG.SCORE_PER_POWERUP);
                break;
            case 'doubleScore':
                this.gameState.activatePowerUp('doubleScore');
                this.gameState.updateScore(GAME_CONFIG.SCORE_PER_POWERUP);
                break;
        }
    }
    
    /**
     * Reset game to initial state
     */
    reset() {
        this.player.reset();
        this.obstacleManager.clear();
        this.collectibleManager.clear();
        this.routeManager = new RouteManager();
        this.momentManager = new MomentManager();
        this.abilityManager = new AbilityManager();
        this.abilityManager.setupControls();
        this.cameraShake = { x: 0, y: 0, intensity: 0 };
        this.lastNearMissFrame = 0;
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new Game();
    
    // Make reset function available globally for UI buttons
    window.gameInstance = game;
});
