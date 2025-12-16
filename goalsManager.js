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
        
        this.loadProgress();
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

