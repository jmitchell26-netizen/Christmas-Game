# 🎅 Santa's Delivery Dash

A browser-based 2D endless runner game where you control Santa flying on a sleigh, delivering gifts while avoiding obstacles. Features smooth, responsive controls, route decisions, dynamic moments, abilities, and a goals system.

## 🎮 Game Features

### Core Gameplay
- **Smooth Movement**: No gravity/tap mechanics - pilot your sleigh with smooth vertical controls
- **Route Decisions**: Choose between high-risk/high-reward left routes or safe right routes
- **Dynamic Obstacles**: Chimneys rise vertically, snowmen slide between lanes, wind gusts push you around
- **Moments System**: Special events like snowstorms, speed bursts, and gift rushes change gameplay pacing
- **Ability System**: Dash ability with cooldown for strategic gameplay
- **Goals & Unlockables**: Complete goals to unlock sleigh colors, Santa hats, and backgrounds

### Visual Features
- Parallax scrolling background layers
- Camera shake on near-misses and speed bursts
- Santa animations (leaning up/down)
- Boost trail effects when dashing
- Snowstorm visibility effects

## 🎯 Controls

- **↑ / Space**: Move up
- **↓**: Move down
- **E**: Activate ability (Dash)
- **← / A**: Choose left route (when prompted)
- **→ / D**: Choose right route (when prompted)
- **ESC**: Pause

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/jmitchell26-netizen/Christmas-Game.git
```

2. Open `index.html` in a modern web browser

3. Click "Start Game" and enjoy!

## 📁 Project Structure

```
Christmas-Game/
├── index.html              # Main HTML file
├── styles.css              # Game styling
├── constants.js            # Game configuration constants
├── gameState.js            # Game state management
├── player.js               # Player (Santa) class
├── obstacles.js            # Obstacle system with behaviors
├── collectibles.js         # Gifts and power-ups
├── routeManager.js         # Route decision system
├── momentManager.js        # Pacing events (moments)
├── abilityManager.js       # Ability system
├── goalsManager.js         # Goals and unlockables
└── game.js                 # Main game loop
```

## 🎨 Game Systems

### Route System
- **Left Route**: High risk/reward - more obstacles, faster speed, 2x gift value, 1.5x score multiplier
- **Right Route**: Safe route - fewer obstacles, slower speed, standard rewards
- Routes last ~8 seconds and affect spawn rates

### Obstacle Behaviors
- **Chimneys**: Rise and fall vertically in sine wave pattern
- **Snowmen**: Slide horizontally between lanes
- **Wind Gusts**: Invisible zones that push Santa up/down with particle effects
- **Trees & Clouds**: Static obstacles

### Moments (Pacing Events)
- **❄️ Snowstorm**: Reduced visibility, screen shake, fewer but dangerous obstacles
- **🎅 Speed Burst**: Increased game speed, boost trail, 1.5x score multiplier
- **🎁 Gift Rush**: 3x gift spawn rate, fewer obstacles

### Goals System
- Deliver 10 Gifts → Unlocks Gold Sleigh
- Survive a Snowstorm → Unlocks Elf Hat
- Collect 3 Gold Presents → Unlocks Silver Sleigh
- Score 5000 Points → Unlocks Night Background
- Use Ability 10 Times → Unlocks Reindeer Hat

## 🛠️ Technical Details

- **Framework**: Vanilla JavaScript (no dependencies)
- **Rendering**: HTML5 Canvas
- **Game Loop**: requestAnimationFrame for 60fps
- **Storage**: localStorage for high scores and goals
- **Collision**: Axis-Aligned Bounding Box (AABB)

## 📝 Code Quality

- Modular architecture with separate managers for each system
- No magic numbers - all constants in `constants.js`
- Clear comments explaining game logic
- Maintains smooth 60fps performance
- Anti-Flappy Bird: Smooth movement, no gravity/tap mechanics

## 🎁 Features Implemented

✅ Route decision system (left/right forks)  
✅ Behavior-based obstacles (chimneys, snowmen, wind gusts)  
✅ Moments system (snowstorm, speed burst, gift rush)  
✅ Ability system with cooldown  
✅ Goals & unlockables system  
✅ Visual improvements (parallax, camera shake, animations)  
✅ Smooth player movement (no gravity)  
✅ Score system with localStorage  
✅ Difficulty scaling  

## 📄 License

This project is open source and available for personal and educational use.

## 🎄 Enjoy the Game!

Have fun delivering gifts and avoiding obstacles! Try to beat your high score and unlock all the goals.
