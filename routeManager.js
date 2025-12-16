// Route Manager - handles left/right route decisions
class RouteManager {
    constructor() {
        this.currentRoute = 'neutral'; // 'left', 'right', or 'neutral'
        this.routeTimer = 0;
        this.routeDuration = 0;
        this.showingDecision = false;
        this.decisionX = 0;
        this.decisionTimer = 0;
        this.decisionDuration = 180; // 3 seconds to decide
    }
    
    /**
     * Update route system
     */
    update(gameState) {
        const frameCount = gameState.getFrameCount();
        
        // Check if it's time to show a route decision
        if (!this.showingDecision && this.currentRoute === 'neutral' && 
            frameCount > 0 && frameCount % GAME_CONFIG.ROUTE_DECISION_INTERVAL === 0) {
            this.showDecision();
        }
        
        // Handle decision timer
        if (this.showingDecision) {
            this.decisionTimer++;
            if (this.decisionTimer >= this.decisionDuration) {
                // Auto-select right route if no choice made
                this.selectRoute('right');
            }
        }
        
        // Update route timer
        if (this.currentRoute !== 'neutral') {
            this.routeTimer++;
            if (this.routeTimer >= this.routeDuration) {
                this.currentRoute = 'neutral';
                this.routeTimer = 0;
            }
        }
        
        // Update decision position
        if (this.showingDecision) {
            this.decisionX -= 3; // Move decision indicator left
            if (this.decisionX < -100) {
                this.showingDecision = false;
                this.decisionX = 0;
            }
        }
    }
    
    /**
     * Show route decision prompt
     */
    showDecision() {
        this.showingDecision = true;
        this.decisionTimer = 0;
        this.decisionX = GAME_CONFIG.CANVAS_WIDTH;
    }
    
    /**
     * Select a route (left or right)
     */
    selectRoute(route) {
        if (!this.showingDecision) return;
        
        this.currentRoute = route;
        this.routeTimer = 0;
        this.routeDuration = GAME_CONFIG.ROUTE_DURATION;
        this.showingDecision = false;
        this.decisionTimer = 0;
    }
    
    /**
     * Get current route modifiers
     */
    getRouteModifiers() {
        if (this.currentRoute === 'left') {
            return {
                spawnMultiplier: GAME_CONFIG.LEFT_ROUTE_SPAWN_MULTIPLIER,
                speedMultiplier: GAME_CONFIG.LEFT_ROUTE_SPEED_MULTIPLIER,
                giftValueMultiplier: GAME_CONFIG.LEFT_ROUTE_GIFT_VALUE_MULTIPLIER,
                scoreMultiplier: GAME_CONFIG.LEFT_ROUTE_SCORE_MULTIPLIER
            };
        } else if (this.currentRoute === 'right') {
            return {
                spawnMultiplier: 0.7, // Fewer obstacles
                speedMultiplier: 0.8, // Slower speed
                giftValueMultiplier: 1.0,
                scoreMultiplier: 1.0
            };
        }
        return {
            spawnMultiplier: 1.0,
            speedMultiplier: 1.0,
            giftValueMultiplier: 1.0,
            scoreMultiplier: 1.0
        };
    }
    
    /**
     * Draw route decision UI
     */
    draw(ctx) {
        if (this.showingDecision) {
            const centerX = this.decisionX;
            const centerY = 150;
            
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(centerX - 150, centerY - 60, 300, 120);
            
            // Border
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(centerX - 150, centerY - 60, 300, 120);
            
            // Text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Choose Your Route!', centerX, centerY - 20);
            
            ctx.font = '16px Arial';
            ctx.fillText('← Left: High Risk/Reward', centerX - 70, centerY + 10);
            ctx.fillText('Right: Safe Route →', centerX + 70, centerY + 10);
            
            // Route indicators
            ctx.fillStyle = '#DC143C';
            ctx.fillRect(centerX - 120, centerY + 20, 40, 20);
            ctx.fillStyle = '#228B22';
            ctx.fillRect(centerX + 80, centerY + 20, 40, 20);
        }
        
        // Show current route indicator
        if (this.currentRoute !== 'neutral') {
            const indicatorY = 30;
            ctx.fillStyle = this.currentRoute === 'left' ? 'rgba(220, 20, 60, 0.8)' : 'rgba(34, 139, 34, 0.8)';
            ctx.fillRect(10, indicatorY, 200, 30);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            const routeText = this.currentRoute === 'left' ? 'HIGH RISK ROUTE' : 'SAFE ROUTE';
            ctx.fillText(routeText, 15, indicatorY + 20);
            
            // Timer bar
            const progress = this.routeTimer / this.routeDuration;
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(10, indicatorY + 32, 200 * (1 - progress), 3);
        }
    }
}

