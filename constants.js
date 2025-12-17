// Game constants - avoiding magic numbers
const GAME_CONFIG = {
    // Canvas dimensions
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // Player settings
    PLAYER_WIDTH: 60,
    PLAYER_HEIGHT: 40,
    PLAYER_START_X: 100,
    PLAYER_START_Y: 300,
    PLAYER_VERTICAL_SPEED: 4, // Smooth vertical movement speed
    PLAYER_ACCELERATION: 0.15, // Smooth acceleration/deceleration
    
    // Obstacle settings
    OBSTACLE_SPAWN_RATE: 0.04, // Probability per frame (increased from 0.02)
    OBSTACLE_MIN_SPAWN_INTERVAL: 30, // Minimum frames between spawns (reduced from 60)
    OBSTACLE_BASE_SPEED: 3,
    OBSTACLE_SPEED_INCREASE: 0.001, // Speed increase per frame
    
    // Obstacle dimensions (base sizes - will be varied)
    CHIMNEY_WIDTH: 50,
    CHIMNEY_HEIGHT: 80,
    SNOWMAN_WIDTH: 60,
    SNOWMAN_HEIGHT: 70,
    TREE_WIDTH: 50,
    TREE_HEIGHT: 100,
    CLOUD_WIDTH: 80,
    CLOUD_HEIGHT: 50,
    
    // Size variation ranges (multipliers)
    OBSTACLE_SIZE_MIN: 0.7, // 70% of base size
    OBSTACLE_SIZE_MAX: 1.4, // 140% of base size
    
    // Height variation for ground obstacles (offset from ground)
    GROUND_OBSTACLE_HEIGHT_VARIATION: 100, // Can spawn up to 100px above ground
    
    // Horizontal position variation
    OBSTACLE_HORIZONTAL_VARIATION: 200, // Can spawn up to 200px ahead/behind normal position
    OBSTACLE_LANE_COUNT: 3, // Number of horizontal lanes (left, center, right)
    
    // Collectible settings
    GIFT_SPAWN_RATE: 0.01,
    GIFT_MIN_SPAWN_INTERVAL: 120,
    GIFT_WIDTH: 30,
    GIFT_HEIGHT: 30,
    GIFT_SPEED: 2.5,
    
    // Scoring
    SCORE_PER_SECOND: 10,
    SCORE_PER_GIFT: 50,
    SCORE_PER_POWERUP: 100,
    
    // Difficulty scaling
    MAX_SPEED_MULTIPLIER: 2.5,
    MAX_SPAWN_RATE_MULTIPLIER: 2.0,
    DIFFICULTY_INCREASE_RATE: 0.0001,
    
    // Power-up durations (in frames at 60fps)
    SLOW_MOTION_DURATION: 300, // 5 seconds
    SHIELD_DURATION: 600, // 10 seconds
    DOUBLE_SCORE_DURATION: 900, // 15 seconds
    
    // Background
    SNOWFLAKE_COUNT: 50,
    SNOWFLAKE_SPEED: 1,
    
    // Route System
    ROUTE_DECISION_INTERVAL: 600, // Frames between route decisions (~10 seconds)
    ROUTE_DURATION: 480, // Frames route stays active (~8 seconds)
    LEFT_ROUTE_SPAWN_MULTIPLIER: 1.5,
    LEFT_ROUTE_SPEED_MULTIPLIER: 1.3,
    LEFT_ROUTE_GIFT_VALUE_MULTIPLIER: 2.0,
    LEFT_ROUTE_SCORE_MULTIPLIER: 1.5,
    
    // Ability System
    ABILITY_COOLDOWN: 600, // 10 seconds at 60fps
    DASH_DURATION: 30, // 0.5 seconds
    DASH_SPEED_BOOST: 2.0,
    SHIELD_ABILITY_DURATION: 180, // 3 seconds
    SLOW_TIME_DURATION: 300, // 5 seconds
    SLOW_TIME_FACTOR: 0.4, // Slow to 40% speed
    
    // Moment System
    MOMENT_INTERVAL_MIN: 900, // 15 seconds minimum
    MOMENT_INTERVAL_MAX: 1800, // 30 seconds maximum
    SNOWSTORM_DURATION: 300, // 5 seconds
    SPEED_BURST_DURATION: 360, // 6 seconds
    GIFT_RUSH_DURATION: 420, // 7 seconds
    
    // Camera Shake
    SHAKE_INTENSITY_NEAR_MISS: 2,
    SHAKE_INTENSITY_SPEED_BURST: 3,
    SHAKE_DECAY: 0.9,
    
    // Parallax Layers
    PARALLAX_LAYER_COUNT: 3,
    PARALLAX_SPEEDS: [0.2, 0.5, 0.8], // Background layer speeds
    
    // Colors
    COLORS: {
        SKY_TOP: '#87CEEB',
        SKY_MID: '#E0F6FF',
        SKY_BOTTOM: '#FFFFFF',
        SNOW: '#FFFFFF',
        CHIMNEY: '#2C2C2C',
        SNOWMAN_BODY: '#FFFFFF',
        SNOWMAN_NOSE: '#FF8C00',
        TREE: '#228B22',
        TREE_TRUNK: '#8B4513',
        CLOUD: '#E6E6FA',
        GIFT_RED: '#DC143C',
        GIFT_GREEN: '#228B22',
        GIFT_GOLD: '#FFD700',
        PLAYER_SLEIGH: '#8B0000',
        PLAYER_SANTA: '#DC143C'
    }
};

// Game states enum
const GAME_STATES = {
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

