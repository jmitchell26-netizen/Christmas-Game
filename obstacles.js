// Obstacle system - manages spawning and rendering of obstacles
class ObstacleManager {
    constructor() {
        this.obstacles = [];
        this.lastSpawnFrame = 0;
        this.spawnCounter = 0;
    }
    
    /**
     * Update all obstacles and spawn new ones
     */
    update(gameState, speedMultiplier = 1.0, routeModifiers = {}) {
        const frameCount = gameState.getFrameCount();
        const difficultyMultiplier = this.getDifficultyMultiplier(frameCount);
        const currentSpeed = GAME_CONFIG.OBSTACLE_BASE_SPEED * difficultyMultiplier * speedMultiplier * (routeModifiers.speedMultiplier || 1.0);
        
        // Move existing obstacles and update behaviors
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            // Update obstacle-specific behavior
            this.updateObstacleBehavior(obstacle, frameCount);
            
            // Move horizontally
            obstacle.x -= currentSpeed;
            
            // Remove obstacles that are off-screen
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
        
        // Spawn new obstacles
        const framesSinceLastSpawn = frameCount - this.lastSpawnFrame;
        const spawnRate = GAME_CONFIG.OBSTACLE_SPAWN_RATE * difficultyMultiplier * (routeModifiers.spawnMultiplier || 1.0);
        const minInterval = GAME_CONFIG.OBSTACLE_MIN_SPAWN_INTERVAL / difficultyMultiplier;
        
        if (framesSinceLastSpawn >= minInterval && Math.random() < spawnRate) {
            this.spawnObstacle();
            this.lastSpawnFrame = frameCount;
        }
    }
    
    /**
     * Update obstacle-specific behaviors
     */
    updateObstacleBehavior(obstacle, frameCount) {
        switch (obstacle.type) {
            case 'chimney':
                this.updateChimney(obstacle, frameCount);
                break;
            case 'snowman':
                this.updateSnowman(obstacle, frameCount);
                break;
            case 'windGust':
                // Wind gusts don't need position updates, they're zones
                break;
        }
    }
    
    /**
     * Update chimney - slowly rises vertically
     */
    updateChimney(obstacle, frameCount) {
        if (!obstacle.startY) {
            obstacle.startY = obstacle.y;
            obstacle.riseSpeed = 0.1;
        }
        
        // Rise up and down in a sine wave pattern
        obstacle.y = obstacle.startY + Math.sin(frameCount * 0.05 + obstacle.x * 0.01) * 15;
        
        // Periodically emit soot clouds
        if (!obstacle.lastSootEmission) obstacle.lastSootEmission = 0;
        if (frameCount - obstacle.lastSootEmission > 120) {
            obstacle.lastSootEmission = frameCount;
            // Soot clouds are handled as secondary hazards in collision
        }
    }
    
    /**
     * Update snowman - slides between lanes
     */
    updateSnowman(obstacle, frameCount) {
        if (!obstacle.startX) {
            obstacle.startX = obstacle.x;
            obstacle.laneWidth = 100;
        }
        
        // Slide horizontally in a sine wave pattern
        const offset = Math.sin(frameCount * 0.08) * obstacle.laneWidth;
        obstacle.x = obstacle.startX + offset;
    }
    
    /**
     * Spawn a random obstacle
     */
    spawnObstacle() {
        const types = ['chimney', 'snowman', 'tree', 'cloud', 'windGust'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let obstacle;
        
        switch (type) {
            case 'chimney':
                obstacle = this.createChimney();
                break;
            case 'snowman':
                obstacle = this.createSnowman();
                break;
            case 'tree':
                obstacle = this.createTree();
                break;
            case 'cloud':
                obstacle = this.createCloud();
                break;
            case 'windGust':
                obstacle = this.createWindGust();
                break;
        }
        
        this.obstacles.push(obstacle);
    }
    
    /**
     * Create a chimney obstacle
     */
    createChimney() {
        return {
            type: 'chimney',
            x: GAME_CONFIG.CANVAS_WIDTH,
            y: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.CHIMNEY_HEIGHT - 20,
            width: GAME_CONFIG.CHIMNEY_WIDTH,
            height: GAME_CONFIG.CHIMNEY_HEIGHT
        };
    }
    
    /**
     * Create a snowman obstacle
     */
    createSnowman() {
        return {
            type: 'snowman',
            x: GAME_CONFIG.CANVAS_WIDTH,
            y: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.SNOWMAN_HEIGHT - 20,
            width: GAME_CONFIG.SNOWMAN_WIDTH,
            height: GAME_CONFIG.SNOWMAN_HEIGHT
        };
    }
    
    /**
     * Create a tree obstacle
     */
    createTree() {
        return {
            type: 'tree',
            x: GAME_CONFIG.CANVAS_WIDTH,
            y: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.TREE_HEIGHT - 20,
            width: GAME_CONFIG.TREE_WIDTH,
            height: GAME_CONFIG.TREE_HEIGHT
        };
    }
    
    /**
     * Create a cloud obstacle (floating)
     */
    createCloud() {
        // Clouds spawn at random heights
        const minY = 50;
        const maxY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.CLOUD_HEIGHT - 100;
        const y = Math.random() * (maxY - minY) + minY;
        
        return {
            type: 'cloud',
            x: GAME_CONFIG.CANVAS_WIDTH,
            y: y,
            width: GAME_CONFIG.CLOUD_WIDTH,
            height: GAME_CONFIG.CLOUD_HEIGHT
        };
    }
    
    /**
     * Create a wind gust (invisible zone that pushes player)
     */
    createWindGust() {
        const minY = 100;
        const maxY = GAME_CONFIG.CANVAS_HEIGHT - 200;
        const y = Math.random() * (maxY - minY) + minY;
        
        return {
            type: 'windGust',
            x: GAME_CONFIG.CANVAS_WIDTH,
            y: y,
            width: 100,
            height: 150,
            force: Math.random() > 0.5 ? -2 : 2, // Push up or down
            particles: [] // For visual effect
        };
    }
    
    /**
     * Draw all obstacles
     */
    draw(ctx) {
        this.obstacles.forEach(obstacle => {
            switch (obstacle.type) {
                case 'chimney':
                    this.drawChimney(ctx, obstacle);
                    break;
                case 'snowman':
                    this.drawSnowman(ctx, obstacle);
                    break;
                case 'tree':
                    this.drawTree(ctx, obstacle);
                    break;
                case 'cloud':
                    this.drawCloud(ctx, obstacle);
                    break;
                case 'windGust':
                    this.drawWindGust(ctx, obstacle);
                    break;
            }
        });
    }
    
    /**
     * Draw a chimney
     */
    drawChimney(ctx, obstacle) {
        ctx.fillStyle = GAME_CONFIG.COLORS.CHIMNEY;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Chimney top
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(obstacle.x - 5, obstacle.y, obstacle.width + 10, 10);
        
        // Smoke (optional)
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.beginPath();
        ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y - 10, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draw a snowman
     */
    drawSnowman(ctx, obstacle) {
        const centerX = obstacle.x + obstacle.width / 2;
        
        // Bottom snowball
        ctx.fillStyle = GAME_CONFIG.COLORS.SNOWMAN_BODY;
        ctx.beginPath();
        ctx.arc(centerX, obstacle.y + obstacle.height - 20, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Middle snowball
        ctx.beginPath();
        ctx.arc(centerX, obstacle.y + obstacle.height - 50, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Top snowball
        ctx.beginPath();
        ctx.arc(centerX, obstacle.y + obstacle.height - 70, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Carrot nose
        ctx.fillStyle = GAME_CONFIG.COLORS.SNOWMAN_NOSE;
        ctx.beginPath();
        ctx.moveTo(centerX + 5, obstacle.y + obstacle.height - 70);
        ctx.lineTo(centerX + 15, obstacle.y + obstacle.height - 70);
        ctx.lineTo(centerX + 5, obstacle.y + obstacle.height - 65);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(centerX - 5, obstacle.y + obstacle.height - 72, 2, 0, Math.PI * 2);
        ctx.arc(centerX + 5, obstacle.y + obstacle.height - 72, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draw a tree
     */
    drawTree(ctx, obstacle) {
        const centerX = obstacle.x + obstacle.width / 2;
        
        // Trunk
        ctx.fillStyle = GAME_CONFIG.COLORS.TREE_TRUNK;
        ctx.fillRect(centerX - 5, obstacle.y + obstacle.height - 20, 10, 20);
        
        // Tree layers (triangles)
        ctx.fillStyle = GAME_CONFIG.COLORS.TREE;
        for (let i = 0; i < 3; i++) {
            const y = obstacle.y + obstacle.height - 30 - (i * 25);
            const width = 30 - (i * 5);
            ctx.beginPath();
            ctx.moveTo(centerX, y);
            ctx.lineTo(centerX - width / 2, y + 20);
            ctx.lineTo(centerX + width / 2, y + 20);
            ctx.closePath();
            ctx.fill();
        }
        
        // Star on top
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(centerX, obstacle.y + 5);
        ctx.lineTo(centerX - 3, obstacle.y + 10);
        ctx.lineTo(centerX + 3, obstacle.y + 10);
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Draw a cloud
     */
    drawCloud(ctx, obstacle) {
        ctx.fillStyle = GAME_CONFIG.COLORS.CLOUD;
        const centerX = obstacle.x + obstacle.width / 2;
        const centerY = obstacle.y + obstacle.height / 2;
        
        // Draw cloud as overlapping circles
        ctx.beginPath();
        ctx.arc(centerX - 15, centerY, 15, 0, Math.PI * 2);
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.arc(centerX + 15, centerY, 15, 0, Math.PI * 2);
        ctx.arc(centerX - 5, centerY - 10, 12, 0, Math.PI * 2);
        ctx.arc(centerX + 10, centerY - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some sparkle for icy effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(centerX - 10, centerY - 5, 3, 0, Math.PI * 2);
        ctx.arc(centerX + 10, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draw wind gust with particle effects
     */
    drawWindGust(ctx, obstacle) {
        // Update particles
        if (obstacle.particles.length < 20) {
            obstacle.particles.push({
                x: obstacle.x + Math.random() * obstacle.width,
                y: obstacle.y + Math.random() * obstacle.height,
                speed: obstacle.force * 2,
                life: 1.0
            });
        }
        
        // Draw particles (snow streaks)
        obstacle.particles.forEach((particle, i) => {
            particle.x -= 2;
            particle.y += particle.speed;
            particle.life -= 0.02;
            
            if (particle.life <= 0 || particle.x < 0) {
                obstacle.particles.splice(i, 1);
            } else {
                ctx.strokeStyle = `rgba(255, 255, 255, ${particle.life * 0.6})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(particle.x - 10, particle.y - particle.speed * 5);
                ctx.stroke();
            }
        });
        
        // Draw wind zone outline (subtle)
        ctx.strokeStyle = 'rgba(200, 200, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.setLineDash([]);
    }
    
    /**
     * Check if player is in wind gust and apply force
     */
    applyWindForce(playerBounds) {
        for (const obstacle of this.obstacles) {
            if (obstacle.type === 'windGust') {
                if (this.checkAABBCollision(playerBounds, obstacle)) {
                    return obstacle.force;
                }
            }
        }
        return 0;
    }
    
    /**
     * Helper for AABB collision
     */
    checkAABBCollision(box1, box2) {
        return box1.x < box2.x + box2.width &&
               box1.x + box1.width > box2.x &&
               box1.y < box2.y + box2.height &&
               box1.y + box1.height > box2.y;
    }
    
    /**
     * Get all obstacles for collision detection
     */
    getObstacles() {
        return this.obstacles;
    }
    
    /**
     * Clear all obstacles
     */
    clear() {
        this.obstacles = [];
        this.lastSpawnFrame = 0;
        this.spawnCounter = 0;
    }
    
    /**
     * Calculate difficulty multiplier based on frame count
     */
    getDifficultyMultiplier(frameCount) {
        const baseMultiplier = 1 + (frameCount * GAME_CONFIG.DIFFICULTY_INCREASE_RATE);
        return Math.min(baseMultiplier, GAME_CONFIG.MAX_SPEED_MULTIPLIER);
    }
}

