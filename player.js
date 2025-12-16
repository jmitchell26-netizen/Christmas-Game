// Player (Santa sleigh) class - handles movement and rendering
class Player {
    constructor() {
        this.x = GAME_CONFIG.PLAYER_START_X;
        this.y = GAME_CONFIG.PLAYER_START_Y;
        this.width = GAME_CONFIG.PLAYER_WIDTH;
        this.height = GAME_CONFIG.PLAYER_HEIGHT;
        this.velocityY = 0; // Smooth velocity for sleigh movement
        this.leanAngle = 0; // Visual leaning angle
        this.boostTrail = []; // Boost trail particles
        
        // Input handling
        this.keys = {
            up: false,
            down: false
        };
        
        this.setupControls();
    }
    
    /**
     * Setup keyboard controls
     */
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                this.keys.up = true;
            }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                this.keys.down = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
                this.keys.up = false;
            }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.keys.down = false;
            }
        });
    }
    
    /**
     * Update player position - smooth sleigh movement (no gravity)
     */
    update(speedMultiplier = 1.0, windForce = 0, isDashing = false) {
        const targetSpeed = GAME_CONFIG.PLAYER_VERTICAL_SPEED * speedMultiplier;
        const acceleration = GAME_CONFIG.PLAYER_ACCELERATION * speedMultiplier;
        
        // Apply wind force
        if (windForce !== 0) {
            this.velocityY += windForce * 0.3;
        }
        
        // Smooth acceleration based on input
        if (this.keys.up) {
            // Move up - accelerate toward negative velocity
            this.velocityY = Math.max(
                this.velocityY - acceleration * 2,
                -targetSpeed
            );
            this.leanAngle = Math.max(this.leanAngle - 0.1, -0.3); // Lean up
        } else if (this.keys.down) {
            // Move down - accelerate toward positive velocity
            this.velocityY = Math.min(
                this.velocityY + acceleration * 2,
                targetSpeed
            );
            this.leanAngle = Math.min(this.leanAngle + 0.1, 0.3); // Lean down
        } else {
            // No input - smoothly decelerate to zero
            if (this.velocityY > 0) {
                this.velocityY = Math.max(0, this.velocityY - acceleration);
            } else if (this.velocityY < 0) {
                this.velocityY = Math.min(0, this.velocityY + acceleration);
            }
            // Return to neutral lean
            if (this.leanAngle > 0) {
                this.leanAngle = Math.max(0, this.leanAngle - 0.05);
            } else if (this.leanAngle < 0) {
                this.leanAngle = Math.min(0, this.leanAngle + 0.05);
            }
        }
        
        // Apply velocity to position
        this.y += this.velocityY;
        
        // Keep player within bounds
        const minY = 0;
        const maxY = GAME_CONFIG.CANVAS_HEIGHT - this.height;
        
        if (this.y < minY) {
            this.y = minY;
            this.velocityY = 0;
        }
        if (this.y > maxY) {
            this.y = maxY;
            this.velocityY = 0;
        }
        
        // Update boost trail
        if (isDashing) {
            this.boostTrail.push({
                x: this.x - 10,
                y: this.y + this.height / 2,
                life: 1.0
            });
        }
        
        // Update trail particles
        for (let i = this.boostTrail.length - 1; i >= 0; i--) {
            const particle = this.boostTrail[i];
            particle.x -= 3;
            particle.life -= 0.1;
            if (particle.life <= 0) {
                this.boostTrail.splice(i, 1);
            }
        }
    }
    
    /**
     * Draw boost trail
     */
    drawBoostTrail(ctx) {
        this.boostTrail.forEach(particle => {
            ctx.fillStyle = `rgba(255, 215, 0, ${particle.life * 0.6})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 4 * particle.life, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    /**
     * Draw the player (Santa on sleigh) with animations
     */
    draw(ctx, isDashing = false) {
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Apply rotation for leaning
        ctx.translate(centerX, centerY);
        ctx.rotate(this.leanAngle);
        ctx.translate(-centerX, -centerY);
        
        // Draw boost trail first (behind player)
        if (isDashing) {
            this.drawBoostTrail(ctx);
        }
        
        // Sleigh base
        ctx.fillStyle = GAME_CONFIG.COLORS.PLAYER_SLEIGH;
        ctx.beginPath();
        ctx.ellipse(centerX, this.y + this.height - 10, 
                    this.width / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Sleigh runners
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y + this.height - 5);
        ctx.lineTo(this.x + this.width - 5, this.y + this.height - 5);
        ctx.stroke();
        
        // Santa body
        ctx.fillStyle = GAME_CONFIG.COLORS.PLAYER_SANTA;
        ctx.fillRect(this.x + 15, this.y + 5, 30, 25);
        
        // Santa head
        ctx.fillStyle = '#FFDBAC';
        ctx.beginPath();
        ctx.arc(this.x + 30, this.y + 8, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Santa hat
        ctx.fillStyle = '#DC143C';
        ctx.beginPath();
        ctx.moveTo(this.x + 22, this.y + 8);
        ctx.lineTo(this.x + 30, this.y - 2);
        ctx.lineTo(this.x + 38, this.y + 8);
        ctx.fill();
        
        // Hat pom-pom
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x + 30, this.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Gift bag (optional detail)
        ctx.fillStyle = '#228B22';
        ctx.fillRect(this.x + 45, this.y + 20, 10, 12);
        
        // Dash effect
        if (isDashing) {
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        }
        
        ctx.restore();
    }
    
    /**
     * Get bounding box for collision detection
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * Reset player to starting position
     */
    reset() {
        this.x = GAME_CONFIG.PLAYER_START_X;
        this.y = GAME_CONFIG.PLAYER_START_Y;
        this.velocityY = 0;
        this.keys.up = false;
        this.keys.down = false;
    }
}

