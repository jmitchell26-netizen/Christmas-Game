// Goals Manager - handles run-based goals and unlockables
class GoalsManager {
    constructor() {
        this.goals = [
            { id: 'deliver10', name: 'Deliver 10 Gifts', progress: 0, target: 10, completed: false },
            { id: 'surviveSnowstorm', name: 'Survive a Snowstorm', progress: 0, target: 1, completed: false },
            { id: 'collect3Gold', name: 'Collect 3 Gold Presents', progress: 0, target: 3, completed: false },
            { id: 'score5000', name: 'Score 5000 Points', progress: 0, target: 5000, completed: false },
            { id: 'useAbility10', name: 'Use Ability 10 Times', progress: 0, target: 10, completed: false }
        ];
        
        this.unlockables = {
            sleighColors: ['default', 'gold', 'silver', 'green'],
            santaHats: ['default', 'elf', 'reindeer'],
            backgrounds: ['default', 'night', 'aurora']
        };
        
        this.unlocked = {
            sleighColors: ['default'],
            santaHats: ['default'],
            backgrounds: ['default']
        };
        
        // Currently equipped items
        this.equipped = {
            sleighColor: 'default',
            santaHat: 'default',
            background: 'default'
        };
        
        this.loadProgress();
        this.loadEquipped();
    }
    
    /**
     * Update goal progress
     */
    updateGoal(goalId, amount = 1) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal && !goal.completed) {
            goal.progress = Math.min(goal.progress + amount, goal.target);
            if (goal.progress >= goal.target) {
                goal.completed = true;
                this.completeGoal(goal);
            }
            this.saveProgress();
        }
    }
    
    /**
     * Handle goal completion
     */
    completeGoal(goal) {
        // Award unlockables based on goal
        switch (goal.id) {
            case 'deliver10':
                this.unlock('sleighColors', 'gold');
                break;
            case 'surviveSnowstorm':
                this.unlock('santaHats', 'elf');
                break;
            case 'collect3Gold':
                this.unlock('sleighColors', 'silver');
                break;
            case 'score5000':
                this.unlock('backgrounds', 'night');
                break;
            case 'useAbility10':
                this.unlock('santaHats', 'reindeer');
                break;
        }
    }
    
    /**
     * Unlock an item
     */
    unlock(category, item) {
        if (!this.unlocked[category].includes(item)) {
            this.unlocked[category].push(item);
            this.saveProgress();
        }
    }
    
    /**
     * Get goal progress for display
     */
    getGoalProgress() {
        return this.goals.map(goal => ({
            name: goal.name,
            progress: goal.progress,
            target: goal.target,
            completed: goal.completed
        }));
    }
    
    /**
     * Get completed goals count
     */
    getCompletedCount() {
        return this.goals.filter(g => g.completed).length;
    }
    
    /**
     * Equip an item
     */
    equip(category, item) {
        // Verify item is unlocked
        if (this.unlocked[category].includes(item)) {
            this.equipped[category === 'sleighColors' ? 'sleighColor' : 
                         category === 'santaHats' ? 'santaHat' : 'background'] = item;
            this.saveEquipped();
            return true;
        }
        return false;
    }
    
    /**
     * Get currently equipped item for a category
     */
    getEquipped(category) {
        const key = category === 'sleighColors' ? 'sleighColor' : 
                   category === 'santaHats' ? 'santaHat' : 'background';
        return this.equipped[key];
    }
    
    /**
     * Save progress to localStorage
     */
    saveProgress() {
        localStorage.setItem('santaGoals', JSON.stringify({
            goals: this.goals,
            unlocked: this.unlocked
        }));
    }
    
    /**
     * Load progress from localStorage
     */
    loadProgress() {
        const saved = localStorage.getItem('santaGoals');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.goals = data.goals || this.goals;
                this.unlocked = data.unlocked || this.unlocked;
            } catch (e) {
                console.error('Failed to load goals:', e);
            }
        }
    }
    
    /**
     * Save equipped items to localStorage
     */
    saveEquipped() {
        localStorage.setItem('santaEquipped', JSON.stringify(this.equipped));
    }
    
    /**
     * Load equipped items from localStorage
     */
    loadEquipped() {
        const saved = localStorage.getItem('santaEquipped');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.equipped = { ...this.equipped, ...data };
                // Verify equipped items are still unlocked
                if (!this.unlocked.sleighColors.includes(this.equipped.sleighColor)) {
                    this.equipped.sleighColor = 'default';
                }
                if (!this.unlocked.santaHats.includes(this.equipped.santaHat)) {
                    this.equipped.santaHat = 'default';
                }
                if (!this.unlocked.backgrounds.includes(this.equipped.background)) {
                    this.equipped.background = 'default';
                }
            } catch (e) {
                console.error('Failed to load equipped items:', e);
            }
        }
    }
    
    /**
     * Draw goals on game over screen
     */
    draw(ctx, x, y) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Goals Progress:', x, y);
        
        y += 30;
        ctx.font = '14px Arial';
        
        this.goals.forEach(goal => {
            const progressText = `${goal.progress}/${goal.target}`;
            const status = goal.completed ? '✓' : '○';
            const color = goal.completed ? '#90EE90' : '#FFFFFF';
            
            ctx.fillStyle = color;
            ctx.fillText(`${status} ${goal.name}: ${progressText}`, x, y);
            y += 25;
        });
    }
}

