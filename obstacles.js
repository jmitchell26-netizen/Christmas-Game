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
     * Update chimney - slowly rises vertically (scaled movement)
     */
    updateChimney(obstacle, frameCount) {
        if (!obstacle.startY) {
            obstacle.startY = obstacle.y;
            obstacle.riseSpeed = 0.1;
        }
        
        const scale = obstacle.sizeMultiplier || 1.0;
        // Rise up and down in a sine wave pattern (scaled)
        obstacle.y = obstacle.startY + Math.sin(frameCount * 0.05 + obstacle.x * 0.01) * 15 * scale;
        
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
     * Create a chimney obstacle with random size and height
     */
    createChimney() {
        const sizeMultiplier = GAME_CONFIG.OBSTACLE_SIZE_MIN + 
            Math.random() * (GAME_CONFIG.OBSTACLE_SIZE_MAX - GAME_CONFIG.OBSTACLE_SIZE_MIN);
        const width = GAME_CONFIG.CHIMNEY_WIDTH * sizeMultiplier;
        const height = GAME_CONFIG.CHIMNEY_HEIGHT * sizeMultiplier;
        
        // Vary height - can spawn at different elevations
        const heightVariation = Math.random() * GAME_CONFIG.GROUND_OBSTACLE_HEIGHT_VARIATION;
        const groundY = GAME_CONFIG.CANVAS_HEIGHT - 20;
        const y = groundY - height - heightVariation;
        
        return {
            type: 'chimney',
            x: GAME_CONFIG.CANVAS_WIDTH,
            y: y,
            width: width,
            height: height,
            sizeMultiplier: sizeMultiplier
        };
    }
    
    /**
     * Create a snowman obstacle with random size and height
     */
    createSnowman() {
        const sizeMultiplier = GAME_CONFIG.OBSTACLE_SIZE_MIN + 
            Math.random() * (GAME_CONFIG.OBSTACLE_SIZE_MAX - GAME_CONFIG.OBSTACLE_SIZE_MIN);
        const width = GAME_CONFIG.SNOWMAN_WIDTH * sizeMultiplier;
        const height = GAME_CONFIG.SNOWMAN_HEIGHT * sizeMultiplier;
        
        // Vary height - can spawn at different elevations
        const heightVariation = Math.random() * GAME_CONFIG.GROUND_OBSTACLE_HEIGHT_VARIATION;
        const groundY = GAME_CONFIG.CANVAS_HEIGHT - 20;
        const y = groundY - height - heightVariation;
        
        return {
            type: 'snowman',
            x: GAME_CONFIG.CANVAS_WIDTH,
            y: y,
            width: width,
            height: height,
            sizeMultiplier: sizeMultiplier
        };
    }
    
    /**
     * Create a tree obstacle with random size and height
     */
    createTree() {
        const sizeMultiplier = GAME_CONFIG.OBSTACLE_SIZE_MIN + 
            Math.random() * (GAME_CONFIG.OBSTACLE_SIZE_MAX - GAME_CONFIG.OBSTACLE_SIZE_MIN);
        const width = GAME_CONFIG.TREE_WIDTH * sizeMultiplier;
        const height = GAME_CONFIG.TREE_HEIGHT * sizeMultiplier;
        
        // Vary height - can spawn at different elevations
        const heightVariation = Math.random() * GAME_CONFIG.GROUND_OBSTACLE_HEIGHT_VARIATION;
        const groundY = GAME_CONFIG.CANVAS_HEIGHT - 20;
        const y = groundY - height - heightVariation;
        
        return {
            type: 'tree',
            x: GAME_CONFIG.CANVAS_WIDTH,
            y: y,
            width: width,
            height: height,
            sizeMultiplier: sizeMultiplier
        };
    }
    
    /**
     * Create a cloud obstacle (floating) with random size and height
     */
    createCloud() {
        const sizeMultiplier = GAME_CONFIG.OBSTACLE_SIZE_MIN + 
            Math.random() * (GAME_CONFIG.OBSTACLE_SIZE_MAX - GAME_CONFIG.OBSTACLE_SIZE_MIN);
        const width = GAME_CONFIG.CLOUD_WIDTH * sizeMultiplier;
        const height = GAME_CONFIG.CLOUD_HEIGHT * sizeMultiplier;
        
        // Clouds spawn at random heights across the screen
        const minY = 50;
        const maxY = GAME_CONFIG.CANVAS_HEIGHT - height - 100;
        const y = Math.random() * (maxY - minY) + minY;
        
        return {
            type: 'cloud',
            x: GAME_CONFIG.CANVAS_WIDTH,
            y: y,
            width: width,
            height: height,
            sizeMultiplier: sizeMultiplier
        };
    }
    
    /**
     * Create a wind gust (invisible zone that pushes player) with random size
     */
    createWindGust() {
        const sizeMultiplier = GAME_CONFIG.OBSTACLE_SIZE_MIN + 
            Math.random() * (GAME_CONFIG.OBSTACLE_SIZE_MAX - GAME_CONFIG.OBSTACLE_SIZE_MIN);
        const width = 100 * sizeMultiplier;
        const height = 150 * sizeMultiplier;
        
        const minY = 100;
        const maxY = GAME_CONFIG.CANVAS_HEIGHT - height - 50;
        const y = Math.random() * (maxY - minY) + minY;
        
        return {
            type: 'windGust',
            x: GAME_CONFIG.CANVAS_WIDTH,
            y: y,
            width: width,
            height: height,
            force: Math.random() > 0.5 ? -2 : 2, // Push up or down
            particles: [], // For visual effect
            sizeMultiplier: sizeMultiplier
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
     * Draw a chimney (scaled to obstacle size)
     */
    drawChimney(ctx, obstacle) {
        const scale = obstacle.sizeMultiplier || 1.0;
        ctx.fillStyle = GAME_CONFIG.COLORS.CHIMNEY;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Chimney top (scaled)
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(obstacle.x - 5 * scale, obstacle.y, obstacle.width + 10 * scale, 10 * scale);
        
        // Smoke (scaled)
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.beginPath();
        ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y - 10 * scale, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draw a snowman (scaled to obstacle size)
     */
    drawSnowman(ctx, obstacle) {
        const centerX = obstacle.x + obstacle.width / 2;
        const scale = obstacle.sizeMultiplier || 1.0;
        const baseY = obstacle.y + obstacle.height;
        
        // Bottom snowball (scaled)
        ctx.fillStyle = GAME_CONFIG.COLORS.SNOWMAN_BODY;
        ctx.beginPath();
        ctx.arc(centerX, baseY - 20 * scale, 25 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Middle snowball (scaled)
        ctx.beginPath();
        ctx.arc(centerX, baseY - 50 * scale, 20 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Top snowball (scaled)
        ctx.beginPath();
        ctx.arc(centerX, baseY - 70 * scale, 15 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Carrot nose (scaled)
        ctx.fillStyle = GAME_CONFIG.COLORS.SNOWMAN_NOSE;
        ctx.beginPath();
        ctx.moveTo(centerX + 5 * scale, baseY - 70 * scale);
        ctx.lineTo(centerX + 15 * scale, baseY - 70 * scale);
        ctx.lineTo(centerX + 5 * scale, baseY - 65 * scale);
        ctx.fill();
        
        // Eyes (scaled)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(centerX - 5 * scale, baseY - 72 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.arc(centerX + 5 * scale, baseY - 72 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draw a tree (scaled to obstacle size)
     */
    drawTree(ctx, obstacle) {
        const centerX = obstacle.x + obstacle.width / 2;
        const scale = obstacle.sizeMultiplier || 1.0;
        const baseY = obstacle.y + obstacle.height;
        
        // Trunk (scaled)
        ctx.fillStyle = GAME_CONFIG.COLORS.TREE_TRUNK;
        ctx.fillRect(centerX - 5 * scale, baseY - 20 * scale, 10 * scale, 20 * scale);
        
        // Tree layers (triangles) (scaled)
        ctx.fillStyle = GAME_CONFIG.COLORS.TREE;
        for (let i = 0; i < 3; i++) {
            const y = baseY - 30 * scale - (i * 25 * scale);
            const width = (30 - (i * 5)) * scale;
            ctx.beginPath();
            ctx.moveTo(centerX, y);
            ctx.lineTo(centerX - width / 2, y + 20 * scale);
            ctx.lineTo(centerX + width / 2, y + 20 * scale);
            ctx.closePath();
            ctx.fill();
        }
        
        // Star on top (scaled)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(centerX, obstacle.y + 5 * scale);
        ctx.lineTo(centerX - 3 * scale, obstacle.y + 10 * scale);
        ctx.lineTo(centerX + 3 * scale, obstacle.y + 10 * scale);
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Draw a cloud (scaled to obstacle size)
     */
    drawCloud(ctx, obstacle) {
        ctx.fillStyle = GAME_CONFIG.COLORS.CLOUD;
        const centerX = obstacle.x + obstacle.width / 2;
        const centerY = obstacle.y + obstacle.height / 2;
        const scale = obstacle.sizeMultiplier || 1.0;
        
        // Draw cloud as overlapping circles (scaled)
        ctx.beginPath();
        ctx.arc(centerX - 15 * scale, centerY, 15 * scale, 0, Math.PI * 2);
        ctx.arc(centerX, centerY, 20 * scale, 0, Math.PI * 2);
        ctx.arc(centerX + 15 * scale, centerY, 15 * scale, 0, Math.PI * 2);
        ctx.arc(centerX - 5 * scale, centerY - 10 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.arc(centerX + 10 * scale, centerY - 10 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some sparkle for icy effect (scaled)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(centerX - 10 * scale, centerY - 5 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.arc(centerX + 10 * scale, centerY, 3 * scale, 0, Math.PI * 2);
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

