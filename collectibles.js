// Collectibles system - manages gifts and power-ups
class CollectibleManager {
    constructor() {
        this.collectibles = [];
        this.lastSpawnFrame = 0;
    }
    
    /**
     * Update all collectibles
     */
    update(gameState, speedMultiplier = 1.0, spawnMultiplier = 1.0) {
        const frameCount = gameState.getFrameCount();
        const currentSpeed = GAME_CONFIG.GIFT_SPEED * speedMultiplier;
        
        // Move existing collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            collectible.x -= currentSpeed;
            
            // Add floating animation
            collectible.y += Math.sin(frameCount * 0.1 + collectible.id) * 0.5;
            
            // Remove collectibles that are off-screen
            if (collectible.x + collectible.width < 0) {
                this.collectibles.splice(i, 1);
            }
        }
        
        // Spawn new collectibles with multiplier
        const framesSinceLastSpawn = frameCount - this.lastSpawnFrame;
        const adjustedSpawnRate = GAME_CONFIG.GIFT_SPAWN_RATE * spawnMultiplier;
        if (framesSinceLastSpawn >= GAME_CONFIG.GIFT_MIN_SPAWN_INTERVAL && 
            Math.random() < adjustedSpawnRate) {
            this.spawnCollectible();
            this.lastSpawnFrame = frameCount;
        }
    }
    
    /**
     * Spawn a random collectible
     */
    spawnCollectible() {
        const types = ['gift', 'slowMotion', 'shield', 'doubleScore'];
        const weights = [0.6, 0.15, 0.15, 0.1]; // Gift is most common
        
        const rand = Math.random();
        let cumulative = 0;
        let type = 'gift';
        
        for (let i = 0; i < types.length; i++) {
            cumulative += weights[i];
            if (rand < cumulative) {
                type = types[i];
                break;
            }
        }
        
        const minY = 50;
        const maxY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GIFT_HEIGHT - 50;
        const y = Math.random() * (maxY - minY) + minY;
        
        const collectible = {
            type: type,
            x: GAME_CONFIG.CANVAS_WIDTH,
            y: y,
            width: GAME_CONFIG.GIFT_WIDTH,
            height: GAME_CONFIG.GIFT_HEIGHT,
            id: Math.random() * 1000 // For unique floating animation
        };
        
        this.collectibles.push(collectible);
    }
    
    /**
     * Draw all collectibles
     */
    draw(ctx) {
        this.collectibles.forEach(collectible => {
            switch (collectible.type) {
                case 'gift':
                    this.drawGift(ctx, collectible);
                    break;
                case 'slowMotion':
                    this.drawPowerUp(ctx, collectible, '⏱', '#4169E1');
                    break;
                case 'shield':
                    this.drawPowerUp(ctx, collectible, '🛡', '#32CD32');
                    break;
                case 'doubleScore':
                    this.drawPowerUp(ctx, collectible, '2x', '#FFD700');
                    break;
            }
        });
    }
    
    /**
     * Draw a gift box
     */
    drawGift(ctx, collectible) {
        const colors = [
            GAME_CONFIG.COLORS.GIFT_RED,
            GAME_CONFIG.COLORS.GIFT_GREEN,
            GAME_CONFIG.COLORS.GIFT_GOLD
        ];
        const color = colors[Math.floor(collectible.id) % colors.length];
        
        // Gift box
        ctx.fillStyle = color;
        ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
        
        // Ribbon
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(collectible.x + collectible.width / 2 - 2, collectible.y, 4, collectible.height);
        ctx.fillRect(collectible.x, collectible.y + collectible.height / 2 - 2, collectible.width, 4);
        
        // Bow
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(collectible.x + collectible.width / 2, collectible.y + collectible.height / 2, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draw a power-up icon
     */
    drawPowerUp(ctx, collectible, symbol, color) {
        // Background circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(
            collectible.x + collectible.width / 2,
            collectible.y + collectible.height / 2,
            collectible.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Symbol (simplified as text)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            symbol,
            collectible.x + collectible.width / 2,
            collectible.y + collectible.height / 2
        );
        
        // Pulsing effect
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
            collectible.x + collectible.width / 2,
            collectible.y + collectible.height / 2,
            collectible.width / 2 + 3,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }
    
    /**
     * Get all collectibles for collision detection
     */
    getCollectibles() {
        return this.collectibles;
    }
    
    /**
     * Remove a collectible
     */
    removeCollectible(collectible) {
        const index = this.collectibles.indexOf(collectible);
        if (index > -1) {
            this.collectibles.splice(index, 1);
        }
    }
    
    /**
     * Clear all collectibles
     */
    clear() {
        this.collectibles = [];
        this.lastSpawnFrame = 0;
    }
}

