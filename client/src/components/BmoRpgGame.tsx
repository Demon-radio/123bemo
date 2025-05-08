import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Gamepad2, Info } from "lucide-react";
import BMOImage from "@assets/image_1746719364511.png";

// Adventure Time RPG Game
// -----------------------
// A fully developed 2D RPG game inspired by Adventure Time
// with Finn, Fionna & Cake, and other characters

interface Entity {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
  direction: 'up' | 'down' | 'left' | 'right';
  frameX: number;
  frameY: number;
  type: string;
  animationFrame: number;
  isMoving: boolean;
}

interface Player extends Entity {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  experience: number;
  level: number;
  isAttacking: boolean;
  attackCooldown: number;
  attackDuration: number;
  specialAttack: boolean;
  specialAttackCooldown: number;
  invulnerable: boolean;
  invulnerabilityTimer: number;
}

interface Enemy extends Entity {
  health: number;
  maxHealth: number;
  attackCooldown: number;
  currentAttackCooldown: number;
  attackRange: number;
  attackDamage: number;
  staggerTime: number;
  isStaggered: boolean;
  deathFrame: number;
  isDying: boolean;
  isDead: boolean;
  respawnTime: number;
  respawnTimer: number;
  value: number; // Score value when defeated
}

interface Item extends Entity {
  effect: 'health' | 'mana' | 'experience' | 'attackBoost';
  value: number;
  isCollected: boolean;
  respawnTime: number;
  respawnTimer: number;
}

interface Projectile extends Entity {
  damage: number;
  lifetime: number;
  isActive: boolean;
  sourceType: 'player' | 'enemy';
  sourceId: number;
}

interface Tile {
  type: number;
  collides: boolean;
  animationFrame?: number;
}

interface GameMap {
  width: number;
  height: number;
  tileSize: number;
  tiles: Tile[][];
}

interface GameState {
  player: Player;
  enemies: Enemy[];
  items: Item[];
  projectiles: Projectile[];
  map: GameMap;
  camera: {
    x: number;
    y: number;
  };
  score: number;
  time: number;
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    space: boolean;
    shift: boolean;
    z: boolean;
  };
  gameOver: boolean;
  victory: boolean;
  levelComplete: boolean;
  paused: boolean;
  wave: number;
  enemiesDefeated: number;
  specialCharges: number;
  showTutorial: boolean;
  showMinimap: boolean;
  debug: boolean;
}

// Game assets paths
const ASSETS = {
  player: '/assets/images/rpg/player.svg',
  enemies: {
    yellowMan: '/assets/images/rpg/enemy1.svg',
    sweetBee: '/assets/images/rpg/enemy2.svg',
    fionnaAndCake: '/assets/images/rpg/enemy3.svg'
  },
  items: {
    healthPotion: '/assets/images/rpg/potion.svg'
  },
  effects: {
    attack: '/assets/images/rpg/attack.svg'
  },
  background: '/assets/images/rpg/background.svg'
};

// Main RPG Game Component
export function BmoRpgGame() {
  // Component state
  const [isOpen, setIsOpen] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [mana, setMana] = useState(100);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [wave, setWave] = useState(1);
  const [specialAttackCharge, setSpecialAttackCharge] = useState(3);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameVictory, setGameVictory] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const loadedAssetsRef = useRef<Record<string, HTMLImageElement>>({});
  const audioRef = useRef<Record<string, HTMLAudioElement>>({});
  
  // Game state
  const gameStateRef = useRef<GameState>({
    player: {
      id: 0,
      x: 400,
      y: 300,
      width: 48,
      height: 48,
      speedX: 0,
      speedY: 0,
      direction: 'down',
      frameX: 0,
      frameY: 0,
      animationFrame: 0,
      isMoving: false,
      type: 'player',
      health: 100,
      maxHealth: 100,
      mana: 100,
      maxMana: 100,
      attack: 10,
      defense: 5,
      experience: 0,
      level: 1,
      isAttacking: false,
      attackCooldown: 0,
      attackDuration: 0,
      specialAttack: false,
      specialAttackCooldown: 0,
      invulnerable: false,
      invulnerabilityTimer: 0
    },
    enemies: [],
    items: [],
    projectiles: [],
    map: {
      width: 25,  // 25 tiles wide
      height: 20, // 20 tiles high
      tileSize: 40,
      tiles: Array(20).fill(0).map(() => 
        Array(25).fill(0).map(() => ({
          type: Math.floor(Math.random() * 4),
          collides: false
        }))
      )
    },
    camera: {
      x: 0,
      y: 0
    },
    score: 0,
    time: 0,
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false,
      shift: false,
      z: false
    },
    gameOver: false,
    victory: false,
    levelComplete: false,
    paused: false,
    wave: 1,
    enemiesDefeated: 0,
    specialCharges: 3,
    showTutorial: false, // Changed to false to avoid showing tutorial on start
    showMinimap: false,
    debug: false
  });

  // Initialize the game
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    
    // Set up canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 800;
    canvas.height = 600;
    
    // Load all game assets
    const loadAssets = async () => {
      // Helper function to load an image
      const loadImage = (path: string): Promise<HTMLImageElement> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = path;
        });
      };
      
      // Load all images
      try {
        const playerImg = await loadImage(ASSETS.player);
        const yellowManImg = await loadImage(ASSETS.enemies.yellowMan);
        const sweetBeeImg = await loadImage(ASSETS.enemies.sweetBee);
        const fionnaAndCakeImg = await loadImage(ASSETS.enemies.fionnaAndCake);
        const healthPotionImg = await loadImage(ASSETS.items.healthPotion);
        const attackImg = await loadImage(ASSETS.effects.attack);
        const backgroundImg = await loadImage(ASSETS.background);
        
        // Store loaded images
        loadedAssetsRef.current = {
          player: playerImg,
          yellowMan: yellowManImg,
          sweetBee: sweetBeeImg,
          fionnaAndCake: fionnaAndCakeImg,
          healthPotion: healthPotionImg,
          attack: attackImg,
          background: backgroundImg
        };
        
        // Create basic sound effects
        const createAudioElement = (frequency: number, duration: number, volume: number) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          gainNode.gain.value = volume;
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.start();
          gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration);
          oscillator.stop(audioContext.currentTime + duration);
          
          return audioContext;
        };
        
        // Initialize game state
        resetGameState();
        
        // Game loaded successfully
        setGameLoaded(true);
        setGameRunning(true);
        
      } catch (error) {
        console.error("Failed to load game assets:", error);
      }
    };
    
    loadAssets();
    
    // Set up key event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current.gameOver || gameStateRef.current.victory) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          gameStateRef.current.keys.up = true;
          break;
        case 'ArrowDown':
        case 's':
          gameStateRef.current.keys.down = true;
          break;
        case 'ArrowLeft':
        case 'a':
          gameStateRef.current.keys.left = true;
          break;
        case 'ArrowRight':
        case 'd':
          gameStateRef.current.keys.right = true;
          break;
        case ' ':
          // Attack / Confirm action
          gameStateRef.current.keys.space = true;
          if (!gameStateRef.current.player.isAttacking && gameStateRef.current.player.attackCooldown <= 0) {
            playerAttack();
          }
          break;
        case 'Shift':
          // Special attack
          gameStateRef.current.keys.shift = true;
          if (gameStateRef.current.specialCharges > 0 && !gameStateRef.current.player.specialAttack) {
            playerSpecialAttack();
          }
          break;
        case 'z':
        case 'Z':
          // Secondary action (secondary attack or item use)
          gameStateRef.current.keys.z = true;
          break;
        case 'p':
        case 'P':
          // Pause game
          gameStateRef.current.paused = !gameStateRef.current.paused;
          break;
        case 'm':
        case 'M':
          // Toggle minimap
          gameStateRef.current.showMinimap = !gameStateRef.current.showMinimap;
          break;
        case 'h':
        case 'H':
          // Toggle tutorial
          gameStateRef.current.showTutorial = !gameStateRef.current.showTutorial;
          setShowTutorial(!showTutorial);
          break;
        default:
          break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          gameStateRef.current.keys.up = false;
          break;
        case 'ArrowDown':
        case 's':
          gameStateRef.current.keys.down = false;
          break;
        case 'ArrowLeft':
        case 'a':
          gameStateRef.current.keys.left = false;
          break;
        case 'ArrowRight':
        case 'd':
          gameStateRef.current.keys.right = false;
          break;
        case ' ':
          gameStateRef.current.keys.space = false;
          break;
        case 'Shift':
          gameStateRef.current.keys.shift = false;
          break;
        case 'z':
        case 'Z':
          gameStateRef.current.keys.z = false;
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Start game loop
    const gameLoop = (timestamp: number) => {
      if (!gameLoaded) return;
      
      // Calculate delta time for smooth animation regardless of frame rate
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      if (gameRunning && !gameStateRef.current.paused) {
        // Update game state
        updateGame(deltaTime / 1000); // Convert to seconds
        
        // Render the game
        renderGame();
        
        // Update UI state from game state
        setScore(gameStateRef.current.score);
        setHealth(gameStateRef.current.player.health);
        setMana(gameStateRef.current.player.mana);
        setLevel(gameStateRef.current.player.level);
        setExperience(gameStateRef.current.player.experience);
        setWave(gameStateRef.current.wave);
        setSpecialAttackCharge(gameStateRef.current.specialCharges);
        setEnemiesDefeated(gameStateRef.current.enemiesDefeated);
        
        // Check for game over or victory
        if (gameStateRef.current.gameOver && !gameOver) {
          setGameOver(true);
          setGameRunning(false);
        }
        
        if (gameStateRef.current.victory && !gameVictory) {
          setGameVictory(true);
          setGameRunning(false);
        }
      }
      
      // Request next frame
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };
    
    // Helper function to reset game state
    const resetGameState = () => {
      // Reset player
      gameStateRef.current.player = {
        ...gameStateRef.current.player,
        x: 400,
        y: 300,
        health: 100,
        maxHealth: 100,
        mana: 100,
        maxMana: 100,
        attack: 10,
        defense: 5,
        experience: 0,
        level: 1,
        isAttacking: false,
        attackCooldown: 0,
        attackDuration: 0,
        specialAttack: false,
        specialAttackCooldown: 0,
        invulnerable: false,
        invulnerabilityTimer: 0
      };
      
      // Reset game status
      gameStateRef.current.score = 0;
      gameStateRef.current.time = 0;
      gameStateRef.current.gameOver = false;
      gameStateRef.current.victory = false;
      gameStateRef.current.levelComplete = false;
      gameStateRef.current.paused = false;
      gameStateRef.current.wave = 1;
      gameStateRef.current.enemiesDefeated = 0;
      gameStateRef.current.specialCharges = 3;
      
      // Create enemies based on wave
      spawnEnemiesForWave(1);
      
      // Spawn some health potions
      spawnItems();
      
      // Clear projectiles
      gameStateRef.current.projectiles = [];
      
      // Reset camera
      gameStateRef.current.camera = {
        x: 0,
        y: 0
      };
      
      // Reset UI state
      setGameOver(false);
      setGameVictory(false);
      setGameRunning(true);
      setScore(0);
      setHealth(100);
      setMana(100);
      setLevel(1);
      setExperience(0);
      setWave(1);
      setSpecialAttackCharge(3);
      setEnemiesDefeated(0);
    };
    
    // Handle canvas click for restart
    const handleCanvasClick = () => {
      if (gameStateRef.current.gameOver || gameStateRef.current.victory) {
        resetGameState();
      }
    };
    
    // Add event listener
    canvas.addEventListener('click', handleCanvasClick);
    
    // Start game loop
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('click', handleCanvasClick);
      
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isOpen, gameLoaded, gameOver, gameVictory, showTutorial]);
  
  // Handle dialog closing
  useEffect(() => {
    if (!isOpen) {
      setGameRunning(false);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = 0;
      }
    }
  }, [isOpen]);
  
  // Game logic functions
  // --------------------
  
  // Player attack function
  const playerAttack = () => {
    const player = gameStateRef.current.player;
    
    player.isAttacking = true;
    player.attackDuration = 0.3; // Attack animation duration in seconds
    
    // After attack animation finishes, set cooldown
    setTimeout(() => {
      player.isAttacking = false;
      player.attackCooldown = 0.5; // 0.5 second cooldown
    }, player.attackDuration * 1000);
    
    // Check for enemy hits
    checkAttackHits();
  };
  
  // Player special attack (deals damage to all enemies in range)
  const playerSpecialAttack = () => {
    if (gameStateRef.current.specialCharges <= 0) return;
    
    const player = gameStateRef.current.player;
    
    // Use a special charge
    gameStateRef.current.specialCharges--;
    setSpecialAttackCharge(gameStateRef.current.specialCharges);
    
    // Activate special attack
    player.specialAttack = true;
    
    // Special attack has bigger range and damage
    const specialRange = 150;
    
    // Deal damage to all enemies in range
    gameStateRef.current.enemies.forEach(enemy => {
      if (enemy.isDead || enemy.isDying) return;
      
      const dx = player.x + player.width/2 - (enemy.x + enemy.width/2);
      const dy = player.y + player.height/2 - (enemy.y + enemy.height/2);
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      if (distance <= specialRange) {
        // Deal massive damage
        const damage = player.attack * 3;
        enemy.health -= damage;
        
        // Knock back enemy
        const knockbackForce = 10;
        const knockbackX = (dx / distance) * knockbackForce;
        const knockbackY = (dy / distance) * knockbackForce;
        
        enemy.x -= knockbackX;
        enemy.y -= knockbackY;
        
        // Stagger enemy
        enemy.isStaggered = true;
        enemy.staggerTime = 1.0; // 1 second stagger
        
        // Check if enemy is defeated
        if (enemy.health <= 0) {
          defeatedEnemy(enemy);
        }
      }
    });
    
    // Set cooldown
    player.specialAttackCooldown = 10; // 10 seconds cooldown
    
    // End special attack after animation
    setTimeout(() => {
      player.specialAttack = false;
    }, 500);
  };
  
  // Check if player attack hits enemies
  const checkAttackHits = () => {
    const player = gameStateRef.current.player;
    const attackRange = 60; // Range of regular attack
    
    gameStateRef.current.enemies.forEach(enemy => {
      if (enemy.isDead || enemy.isDying) return;
      
      // Calculate distance between player and enemy
      const dx = player.x + player.width/2 - (enemy.x + enemy.width/2);
      const dy = player.y + player.height/2 - (enemy.y + enemy.height/2);
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      // Check if attack is in range and facing the enemy
      let inAttackRange = false;
      
      if (distance <= attackRange) {
        // Check if player is facing the enemy
        if (
          (player.direction === 'up' && dy > 0) ||
          (player.direction === 'down' && dy < 0) ||
          (player.direction === 'left' && dx > 0) ||
          (player.direction === 'right' && dx < 0)
        ) {
          inAttackRange = true;
        }
      }
      
      if (inAttackRange) {
        // Calculate damage based on player attack and enemy defense
        const damage = player.attack;
        enemy.health -= damage;
        
        // Push enemy back slightly
        const knockback = 5;
        if (player.direction === 'up') enemy.y -= knockback;
        if (player.direction === 'down') enemy.y += knockback;
        if (player.direction === 'left') enemy.x -= knockback;
        if (player.direction === 'right') enemy.x += knockback;
        
        // Make enemy briefly staggered
        enemy.isStaggered = true;
        enemy.staggerTime = 0.3; // Staggered for 0.3 seconds
        
        // Check if enemy is defeated
        if (enemy.health <= 0) {
          defeatedEnemy(enemy);
        }
      }
    });
  };
  
  // Handle enemy defeat
  const defeatedEnemy = (enemy: Enemy) => {
    // Mark the enemy as dying to play death animation
    enemy.isDying = true;
    enemy.deathFrame = 0;
    
    // Increase score
    gameStateRef.current.score += enemy.value;
    
    // Increase enemy defeat counter
    gameStateRef.current.enemiesDefeated++;
    
    // Award player experience
    const expGain = enemy.value;
    gameStateRef.current.player.experience += expGain;
    
    // Check for level up
    checkLevelUp();
    
    // After death animation, mark enemy as dead for respawn
    setTimeout(() => {
      enemy.isDead = true;
      enemy.isDying = false;
      enemy.respawnTimer = enemy.respawnTime;
      
      // Check if all enemies are defeated to start next wave
      checkWaveComplete();
    }, 1000);
  };
  
  // State for level up celebration
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);
  
  // Check if player leveled up
  const checkLevelUp = () => {
    const player = gameStateRef.current.player;
    const expNeeded = player.level * 50; // Simple formula for exp needed
    
    if (player.experience >= expNeeded) {
      // Level up!
      player.level++;
      player.experience -= expNeeded;
      
      // Improve player stats
      player.maxHealth += 10;
      player.health = player.maxHealth;
      player.maxMana += 5;
      player.mana = player.maxMana;
      player.attack += 2;
      player.defense += 1;
      
      // Restore one special attack charge
      if (gameStateRef.current.specialCharges < 3) {
        gameStateRef.current.specialCharges++;
      }
      
      // Update UI
      setLevel(player.level);
      setHealth(player.health);
      setMana(player.mana);
      setExperience(player.experience);
      setSpecialAttackCharge(gameStateRef.current.specialCharges);
      
      // Show level up celebration
      setShowLevelUpCelebration(true);
      
      // Hide celebration after 3 seconds
      setTimeout(() => {
        setShowLevelUpCelebration(false);
      }, 3000);
    }
  };
  
  // Check if the current wave is complete
  const checkWaveComplete = () => {
    // Check if all enemies are dead
    const allEnemiesDead = gameStateRef.current.enemies.every(enemy => enemy.isDead);
    
    if (allEnemiesDead) {
      // Wave complete!
      gameStateRef.current.wave++;
      
      // Check for victory condition (5 waves)
      if (gameStateRef.current.wave > 5) {
        gameStateRef.current.victory = true;
      } else {
        // Start next wave
        spawnEnemiesForWave(gameStateRef.current.wave);
        
        // Update UI
        setWave(gameStateRef.current.wave);
        
        // Restore one special attack charge
        if (gameStateRef.current.specialCharges < 3) {
          gameStateRef.current.specialCharges++;
          setSpecialAttackCharge(gameStateRef.current.specialCharges);
        }
        
        // Restore some health and mana
        gameStateRef.current.player.health = Math.min(
          gameStateRef.current.player.maxHealth,
          gameStateRef.current.player.health + 20
        );
        gameStateRef.current.player.mana = Math.min(
          gameStateRef.current.player.maxMana,
          gameStateRef.current.player.mana + 30
        );
        
        // Spawn new items
        spawnItems();
      }
    }
  };
  
  // Spawn enemies based on current wave
  const spawnEnemiesForWave = (wave: number) => {
    const enemies: Enemy[] = [];
    const map = gameStateRef.current.map;
    const mapWidth = map.width * map.tileSize;
    const mapHeight = map.height * map.tileSize;
    
    // Define enemy types to spawn for each wave
    const getEnemyType = (wave: number, index: number) => {
      switch (wave) {
        case 1:
          return 'yellowMan'; // Wave 1: Yellow Men only
        case 2:
          return index % 2 === 0 ? 'yellowMan' : 'sweetBee'; // Wave 2: Yellow Men and Sweet Bees
        case 3:
          return index % 3 === 0 ? 'fionnaAndCake' : (index % 3 === 1 ? 'yellowMan' : 'sweetBee'); // Wave 3: Mix of all
        case 4:
          return index % 2 === 0 ? 'sweetBee' : 'fionnaAndCake'; // Wave 4: Sweet Bees and Fionna & Cake
        case 5:
          return 'fionnaAndCake'; // Wave 5: Fionna & Cake only (bosses)
        default:
          return 'yellowMan';
      }
    };
    
    // Number of enemies to spawn increases with wave
    const enemyCount = wave === 5 ? 3 : wave * 3;
    
    // Create enemies
    for (let i = 0; i < enemyCount; i++) {
      const enemyType = getEnemyType(wave, i);
      
      // Position enemies on edges of map
      const x = Math.random() < 0.5 ? 100 : mapWidth - 150;
      const y = Math.random() < 0.5 ? 100 : mapHeight - 150;
      
      // Create different enemy types with different stats
      const baseEnemy: Enemy = {
        id: i,
        x,
        y,
        width: 48,
        height: 48,
        speedX: 0,
        speedY: 0,
        direction: 'down',
        frameX: 0,
        frameY: 0,
        type: enemyType,
        animationFrame: 0,
        isMoving: false,
        health: 50,
        maxHealth: 50,
        attackCooldown: 2,
        currentAttackCooldown: Math.random() * 2, // Random initial cooldown
        attackRange: 60,
        attackDamage: 10,
        staggerTime: 0,
        isStaggered: false,
        deathFrame: 0,
        isDying: false,
        isDead: false,
        respawnTime: 20,
        respawnTimer: 0,
        value: 10
      };
      
      // Customize based on type
      if (enemyType === 'yellowMan') {
        baseEnemy.health = 40;
        baseEnemy.maxHealth = 40;
        baseEnemy.attackDamage = 8;
        baseEnemy.attackRange = 50;
        baseEnemy.value = 10;
      } else if (enemyType === 'sweetBee') {
        baseEnemy.health = 30;
        baseEnemy.maxHealth = 30;
        baseEnemy.attackDamage = 6;
        baseEnemy.attackRange = 70;
        baseEnemy.value = 15;
      } else if (enemyType === 'fionnaAndCake') {
        baseEnemy.health = 100;
        baseEnemy.maxHealth = 100;
        baseEnemy.attackDamage = 15;
        baseEnemy.attackRange = 80;
        baseEnemy.value = 30;
      }
      
      // Scale enemies based on wave
      const waveScaling = 0.2; // 20% stronger per wave
      baseEnemy.maxHealth = Math.round(baseEnemy.maxHealth * (1 + (wave - 1) * waveScaling));
      baseEnemy.health = baseEnemy.maxHealth;
      baseEnemy.attackDamage = Math.round(baseEnemy.attackDamage * (1 + (wave - 1) * waveScaling));
      baseEnemy.value = Math.round(baseEnemy.value * (1 + (wave - 1) * waveScaling));
      
      enemies.push(baseEnemy);
    }
    
    gameStateRef.current.enemies = enemies;
  };
  
  // Spawn items on the map
  const spawnItems = () => {
    const items: Item[] = [];
    const map = gameStateRef.current.map;
    const mapWidth = map.width * map.tileSize;
    const mapHeight = map.height * map.tileSize;
    
    // Spawn 3 health potions in different locations
    for (let i = 0; i < 3; i++) {
      const item: Item = {
        id: i,
        x: 100 + Math.random() * (mapWidth - 200),
        y: 100 + Math.random() * (mapHeight - 200),
        width: 24,
        height: 24,
        speedX: 0,
        speedY: 0,
        direction: 'down',
        frameX: 0,
        frameY: 0,
        type: 'healthPotion',
        animationFrame: 0,
        isMoving: false,
        effect: 'health',
        value: 30, // Restore 30 health
        isCollected: false,
        respawnTime: 30, // 30 seconds to respawn
        respawnTimer: 0
      };
      
      items.push(item);
    }
    
    gameStateRef.current.items = items;
  };
  
  // Update game state
  const updateGame = (deltaTime: number) => {
    const state = gameStateRef.current;
    
    // Skip update if game is over
    if (state.gameOver || state.victory) return;
    
    // Update game time
    state.time += deltaTime;
    
    // Update player
    updatePlayer(deltaTime);
    
    // Update enemies
    updateEnemies(deltaTime);
    
    // Update items
    updateItems(deltaTime);
    
    // Update projectiles
    updateProjectiles(deltaTime);
    
    // Update camera to follow player
    updateCamera();
    
    // Check collisions
    checkCollisions();
  };
  
  // Update player position and state
  const updatePlayer = (deltaTime: number) => {
    const player = gameStateRef.current.player;
    const keys = gameStateRef.current.keys;
    
    // Handle player movement
    const baseSpeed = 150; // Pixels per second
    player.speedX = 0;
    player.speedY = 0;
    
    // Don't move if attacking
    if (!player.isAttacking) {
      if (keys.up) {
        player.speedY = -baseSpeed * deltaTime;
        player.direction = 'up';
        player.isMoving = true;
      } else if (keys.down) {
        player.speedY = baseSpeed * deltaTime;
        player.direction = 'down';
        player.isMoving = true;
      }
      
      if (keys.left) {
        player.speedX = -baseSpeed * deltaTime;
        player.direction = 'left';
        player.isMoving = true;
      } else if (keys.right) {
        player.speedX = baseSpeed * deltaTime;
        player.direction = 'right';
        player.isMoving = true;
      }
    }
    
    // Update position if moving
    if (player.speedX !== 0 || player.speedY !== 0) {
      player.x += player.speedX;
      player.y += player.speedY;
      player.isMoving = true;
      
      // Animation
      player.animationFrame += deltaTime * 10; // Animate at 10 frames per second
      if (player.animationFrame >= 4) {
        player.animationFrame = 0;
      }
    } else {
      player.isMoving = false;
      player.animationFrame = 0;
    }
    
    // Constrain player to map bounds
    const map = gameStateRef.current.map;
    const mapWidth = map.width * map.tileSize;
    const mapHeight = map.height * map.tileSize;
    
    player.x = Math.max(0, Math.min(mapWidth - player.width, player.x));
    player.y = Math.max(0, Math.min(mapHeight - player.height, player.y));
    
    // Decrease attack cooldown
    if (player.attackCooldown > 0) {
      player.attackCooldown -= deltaTime;
    }
    
    // Decrease special attack cooldown
    if (player.specialAttackCooldown > 0) {
      player.specialAttackCooldown -= deltaTime;
    }
    
    // Decrease attack duration
    if (player.attackDuration > 0) {
      player.attackDuration -= deltaTime;
      if (player.attackDuration <= 0) {
        player.isAttacking = false;
      }
    }
    
    // Handle invulnerability after hit
    if (player.invulnerable) {
      player.invulnerabilityTimer -= deltaTime;
      if (player.invulnerabilityTimer <= 0) {
        player.invulnerable = false;
      }
    }
    
    // Mana regeneration
    if (player.mana < player.maxMana) {
      player.mana = Math.min(player.maxMana, player.mana + deltaTime * 5); // 5 mana per second
    }
    
    // Check for game over
    if (player.health <= 0) {
      gameStateRef.current.gameOver = true;
    }
  };
  
  // Update enemy positions and states
  const updateEnemies = (deltaTime: number) => {
    const enemies = gameStateRef.current.enemies;
    const player = gameStateRef.current.player;
    
    enemies.forEach(enemy => {
      // Skip dead enemies
      if (enemy.isDead) {
        // Handle respawn timer
        enemy.respawnTimer -= deltaTime;
        if (enemy.respawnTimer <= 0) {
          // Respawn enemy at a different location
          const map = gameStateRef.current.map;
          const mapWidth = map.width * map.tileSize;
          const mapHeight = map.height * map.tileSize;
          
          enemy.x = Math.random() * (mapWidth - 100);
          enemy.y = Math.random() * (mapHeight - 100);
          enemy.health = enemy.maxHealth;
          enemy.isDead = false;
        }
        return;
      }
      
      // Skip dying enemies
      if (enemy.isDying) {
        // Advance death animation
        enemy.deathFrame += deltaTime * 5;
        return;
      }
      
      // Handle staggered state
      if (enemy.isStaggered) {
        enemy.staggerTime -= deltaTime;
        if (enemy.staggerTime <= 0) {
          enemy.isStaggered = false;
        }
        return;
      }
      
      // Calculate distance to player
      const dx = player.x + player.width/2 - (enemy.x + enemy.width/2);
      const dy = player.y + player.height/2 - (enemy.y + enemy.height/2);
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      // Attack player if in range
      if (distance <= enemy.attackRange) {
        enemy.currentAttackCooldown -= deltaTime;
        
        if (enemy.currentAttackCooldown <= 0) {
          // Attack!
          if (!player.invulnerable) {
            player.health -= Math.max(0, enemy.attackDamage - player.defense/2);
            
            // Make player briefly invulnerable
            player.invulnerable = true;
            player.invulnerabilityTimer = 0.5; // 0.5 seconds of invulnerability
          }
          
          // Reset cooldown
          enemy.currentAttackCooldown = enemy.attackCooldown;
        }
      } else {
        // Move toward player
        const speed = 70 * deltaTime; // Pixels per second
        
        // Normalize direction vector
        const length = Math.sqrt(dx*dx + dy*dy);
        const dirX = dx / length;
        const dirY = dy / length;
        
        // Move enemy
        enemy.x += dirX * speed;
        enemy.y += dirY * speed;
        
        // Set direction based on movement
        if (Math.abs(dirX) > Math.abs(dirY)) {
          enemy.direction = dirX > 0 ? 'right' : 'left';
        } else {
          enemy.direction = dirY > 0 ? 'down' : 'up';
        }
        
        // Animate
        enemy.isMoving = true;
        enemy.animationFrame += deltaTime * 8; // Animate at 8 frames per second
        if (enemy.animationFrame >= 4) {
          enemy.animationFrame = 0;
        }
      }
    });
  };
  
  // Update items
  const updateItems = (deltaTime: number) => {
    const items = gameStateRef.current.items;
    
    items.forEach(item => {
      if (item.isCollected) {
        // Handle respawn timer
        item.respawnTimer -= deltaTime;
        if (item.respawnTimer <= 0) {
          // Respawn item at a different location
          const map = gameStateRef.current.map;
          const mapWidth = map.width * map.tileSize;
          const mapHeight = map.height * map.tileSize;
          
          item.x = Math.random() * (mapWidth - 100);
          item.y = Math.random() * (mapHeight - 100);
          item.isCollected = false;
        }
      } else {
        // Simple floating animation for items
        item.y += Math.sin(gameStateRef.current.time * 3) * 0.1;
      }
    });
  };
  
  // Update projectiles
  const updateProjectiles = (deltaTime: number) => {
    const projectiles = gameStateRef.current.projectiles;
    
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];
      
      // Move projectile
      projectile.x += projectile.speedX * deltaTime;
      projectile.y += projectile.speedY * deltaTime;
      
      // Decrease lifetime
      projectile.lifetime -= deltaTime;
      
      // Remove if lifetime is over
      if (projectile.lifetime <= 0) {
        projectile.isActive = false;
        projectiles.splice(i, 1);
      }
    }
  };
  
  // Update camera position
  const updateCamera = () => {
    const player = gameStateRef.current.player;
    const camera = gameStateRef.current.camera;
    const canvas = canvasRef.current;
    
    if (!canvas) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Center camera on player
    camera.x = player.x + player.width/2 - canvasWidth/2;
    camera.y = player.y + player.height/2 - canvasHeight/2;
    
    // Constrain camera to map bounds
    const map = gameStateRef.current.map;
    const mapWidth = map.width * map.tileSize;
    const mapHeight = map.height * map.tileSize;
    
    camera.x = Math.max(0, Math.min(mapWidth - canvasWidth, camera.x));
    camera.y = Math.max(0, Math.min(mapHeight - canvasHeight, camera.y));
  };
  
  // Check collisions between entities
  const checkCollisions = () => {
    const player = gameStateRef.current.player;
    const items = gameStateRef.current.items;
    
    // Check collision with items
    items.forEach(item => {
      if (item.isCollected) return;
      
      // Simple collision check
      if (
        player.x < item.x + item.width &&
        player.x + player.width > item.x &&
        player.y < item.y + item.height &&
        player.y + player.height > item.y
      ) {
        // Collect item
        item.isCollected = true;
        item.respawnTimer = item.respawnTime;
        
        // Apply item effect
        if (item.effect === 'health') {
          player.health = Math.min(player.maxHealth, player.health + item.value);
        } else if (item.effect === 'mana') {
          player.mana = Math.min(player.maxMana, player.mana + item.value);
        } else if (item.effect === 'experience') {
          player.experience += item.value;
          checkLevelUp();
        }
      }
    });
  };
  
  // Render the game to canvas
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get camera position
    const camera = gameStateRef.current.camera;
    
    // Draw game background
    const backgroundImg = loadedAssetsRef.current.background;
    if (backgroundImg) {
      // Tiled background
      const patternWidth = 800;
      const patternHeight = 600;
      
      // Number of tiles needed to cover the visible area
      const tilesX = Math.ceil(canvas.width / patternWidth) + 1;
      const tilesY = Math.ceil(canvas.height / patternHeight) + 1;
      
      // Calculate starting position for tiling
      const startX = Math.floor(camera.x / patternWidth) * patternWidth - camera.x;
      const startY = Math.floor(camera.y / patternHeight) * patternHeight - camera.y;
      
      // Draw tiles
      for (let x = 0; x < tilesX; x++) {
        for (let y = 0; y < tilesY; y++) {
          const posX = startX + x * patternWidth;
          const posY = startY + y * patternHeight;
          ctx.drawImage(backgroundImg, posX, posY, patternWidth, patternHeight);
        }
      }
    } else {
      // Fallback background
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw map grid (debug mode)
    if (gameStateRef.current.debug) {
      const map = gameStateRef.current.map;
      const tileSize = map.tileSize;
      
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const screenX = x * tileSize - camera.x;
          const screenY = y * tileSize - camera.y;
          
          // Skip tiles outside screen
          if (
            screenX + tileSize < 0 ||
            screenY + tileSize < 0 ||
            screenX > canvas.width ||
            screenY > canvas.height
          ) {
            continue;
          }
          
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.strokeRect(screenX, screenY, tileSize, tileSize);
        }
      }
    }
    
    // Draw items
    gameStateRef.current.items.forEach(item => {
      if (item.isCollected) return;
      
      const screenX = item.x - camera.x;
      const screenY = item.y - camera.y;
      
      // Skip if outside screen
      if (
        screenX + item.width < 0 ||
        screenY + item.height < 0 ||
        screenX > canvas.width ||
        screenY > canvas.height
      ) {
        return;
      }
      
      // Get correct item image
      let itemImg = null;
      
      if (item.type === 'healthPotion') {
        itemImg = loadedAssetsRef.current.healthPotion;
      }
      
      // Draw item
      if (itemImg) {
        ctx.drawImage(itemImg, screenX, screenY, item.width, item.height);
      } else {
        // Fallback if image not loaded
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX, screenY, item.width, item.height);
      }
    });
    
    // Draw projectiles
    gameStateRef.current.projectiles.forEach(projectile => {
      const screenX = projectile.x - camera.x;
      const screenY = projectile.y - camera.y;
      
      // Skip if outside screen
      if (
        screenX + projectile.width < 0 ||
        screenY + projectile.height < 0 ||
        screenX > canvas.width ||
        screenY > canvas.height
      ) {
        return;
      }
      
      // Draw projectile
      ctx.fillStyle = projectile.sourceType === 'player' ? '#4facfe' : '#ff0000';
      ctx.beginPath();
      ctx.arc(
        screenX + projectile.width/2,
        screenY + projectile.height/2,
        projectile.width/2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    
    // Draw enemies
    gameStateRef.current.enemies.forEach(enemy => {
      if (enemy.isDead) return;
      
      const screenX = enemy.x - camera.x;
      const screenY = enemy.y - camera.y;
      
      // Skip if outside screen
      if (
        screenX + enemy.width < 0 ||
        screenY + enemy.height < 0 ||
        screenX > canvas.width ||
        screenY > canvas.height
      ) {
        return;
      }
      
      // Get correct enemy image
      let enemyImg = null;
      
      if (enemy.type === 'yellowMan') {
        enemyImg = loadedAssetsRef.current.yellowMan;
      } else if (enemy.type === 'sweetBee') {
        enemyImg = loadedAssetsRef.current.sweetBee;
      } else if (enemy.type === 'fionnaAndCake') {
        enemyImg = loadedAssetsRef.current.fionnaAndCake;
      }
      
      // Draw enemy
      if (enemyImg) {
        // If enemy is dying, apply death animation
        if (enemy.isDying) {
          ctx.globalAlpha = 1 - enemy.deathFrame / 5;
          ctx.drawImage(enemyImg, screenX, screenY, enemy.width, enemy.height);
          ctx.globalAlpha = 1.0;
        } 
        // If enemy is staggered, apply flash effect
        else if (enemy.isStaggered) {
          if (Math.floor(enemy.staggerTime * 10) % 2 === 0) {
            ctx.drawImage(enemyImg, screenX, screenY, enemy.width, enemy.height);
          } else {
            ctx.globalAlpha = 0.7;
            ctx.drawImage(enemyImg, screenX, screenY, enemy.width, enemy.height);
            ctx.globalAlpha = 1.0;
          }
        } else {
          ctx.drawImage(enemyImg, screenX, screenY, enemy.width, enemy.height);
        }
      } else {
        // Fallback if image not loaded
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX, screenY, enemy.width, enemy.height);
      }
      
      // Draw health bar
      const healthBarWidth = enemy.width;
      const healthBarHeight = 5;
      const healthPercent = enemy.health / enemy.maxHealth;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(screenX, screenY - 10, healthBarWidth, healthBarHeight);
      
      ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : 
                     healthPercent > 0.25 ? '#ffff00' : '#ff0000';
      ctx.fillRect(screenX, screenY - 10, healthBarWidth * healthPercent, healthBarHeight);
    });
    
    // Draw player
    const player = gameStateRef.current.player;
    const screenX = player.x - camera.x;
    const screenY = player.y - camera.y;
    
    // Get player image
    const playerImg = loadedAssetsRef.current.player;
    
    // Draw player
    if (playerImg) {
      // Apply invulnerability flash effect
      if (player.invulnerable) {
        if (Math.floor(player.invulnerabilityTimer * 10) % 2 === 0) {
          ctx.globalAlpha = 0.7;
        }
      }
      
      ctx.drawImage(playerImg, screenX, screenY, player.width, player.height);
      ctx.globalAlpha = 1.0;
      
      // Draw attack animation
      if (player.isAttacking) {
        const attackImg = loadedAssetsRef.current.attack;
        
        if (attackImg) {
          // Position the attack based on player direction
          let attackX = screenX;
          let attackY = screenY;
          
          if (player.direction === 'up') {
            attackX = screenX + player.width/2 - 25;
            attackY = screenY - 50;
          } else if (player.direction === 'down') {
            attackX = screenX + player.width/2 - 25;
            attackY = screenY + player.height;
          } else if (player.direction === 'left') {
            attackX = screenX - 50;
            attackY = screenY + player.height/2 - 25;
          } else if (player.direction === 'right') {
            attackX = screenX + player.width;
            attackY = screenY + player.height/2 - 25;
          }
          
          // Rotate the attack based on direction
          ctx.save();
          ctx.translate(attackX + 25, attackY + 25);
          
          if (player.direction === 'up') {
            ctx.rotate(Math.PI * 1.5);
          } else if (player.direction === 'right') {
            // Default orientation
          } else if (player.direction === 'down') {
            ctx.rotate(Math.PI * 0.5);
          } else if (player.direction === 'left') {
            ctx.rotate(Math.PI);
          }
          
          ctx.drawImage(attackImg, -25, -25, 50, 50);
          ctx.restore();
        }
      }
      
      // Draw special attack animation
      if (player.specialAttack) {
        ctx.beginPath();
        ctx.arc(
          screenX + player.width/2,
          screenY + player.height/2,
          150, // Special attack range
          0,
          Math.PI * 2
        );
        
        // Create radial gradient for special attack
        const gradient = ctx.createRadialGradient(
          screenX + player.width/2,
          screenY + player.height/2,
          0,
          screenX + player.width/2,
          screenY + player.height/2,
          150
        );
        
        gradient.addColorStop(0, 'rgba(64, 224, 208, 0.7)');
        gradient.addColorStop(0.7, 'rgba(64, 224, 208, 0.3)');
        gradient.addColorStop(1, 'rgba(64, 224, 208, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    } else {
      // Fallback if image not loaded
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(screenX, screenY, player.width, player.height);
    }
    
    // Draw UI overlay
    renderUI(ctx);
    
    // Draw minimap if enabled
    if (gameStateRef.current.showMinimap) {
      renderMinimap(ctx);
    }
    
    // Draw game over screen
    if (gameStateRef.current.gameOver) {
      renderGameOver(ctx);
    }
    
    // Draw victory screen
    if (gameStateRef.current.victory) {
      renderVictory(ctx);
    }
    
    // Draw tutorial if enabled
    if (gameStateRef.current.showTutorial) {
      renderTutorial(ctx);
    }
    
    // Draw pause screen
    if (gameStateRef.current.paused) {
      renderPauseScreen(ctx);
    }
  };
  
  // Render UI elements
  const renderUI = (ctx: CanvasRenderingContext2D) => {
    const player = gameStateRef.current.player;
    const canvas = canvasRef.current;
    
    if (!canvas) return;
    
    // Create a semi-transparent background for the UI
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(10, 10, 200, 200);
    
    // Draw health bar
    const healthBarWidth = 150;
    const healthBarHeight = 15;
    const healthPercent = player.health / player.maxHealth;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(20, 20, healthBarWidth, healthBarHeight);
    
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : 
                    healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(20, 20, healthBarWidth * healthPercent, healthBarHeight);
    
    // Black text for better visibility
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`HP: ${Math.floor(player.health)}/${player.maxHealth}`, 25, 32);
    
    // Draw mana bar
    const manaBarWidth = 150;
    const manaBarHeight = 10;
    const manaPercent = player.mana / player.maxMana;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(20, 40, manaBarWidth, manaBarHeight);
    
    ctx.fillStyle = '#4facfe';
    ctx.fillRect(20, 40, manaBarWidth * manaPercent, manaBarHeight);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px Arial';
    ctx.fillText(`MP: ${Math.floor(player.mana)}/${player.maxMana}`, 25, 48);
    
    // Draw experience bar
    const expBarWidth = 150;
    const expBarHeight = 5;
    const expNeeded = player.level * 50;
    const expPercent = player.experience / expNeeded;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(20, 55, expBarWidth, expBarHeight);
    
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(20, 55, expBarWidth * expPercent, expBarHeight);
    
    // Draw level indicator
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Level: ${player.level}`, 20, 75);
    
    // Draw score
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Score: ${gameStateRef.current.score}`, 20, 95);
    
    // Draw wave indicator
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Wave: ${gameStateRef.current.wave}/5`, 20, 115);
    
    // Draw enemies defeated
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Enemies Defeated: ${gameStateRef.current.enemiesDefeated}`, 20, 135);
    
    // Draw special attack charges
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Special Attacks: ${gameStateRef.current.specialCharges}/3`, 20, 155);
    
    // Draw attack cooldown indicator
    if (player.attackCooldown > 0) {
      ctx.fillStyle = '#880000';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`Attack: ${player.attackCooldown.toFixed(1)}s`, 20, 175);
    } else {
      ctx.fillStyle = '#008800';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`Attack: Ready`, 20, 175);
    }
    
    // Draw special attack cooldown indicator
    if (player.specialAttackCooldown > 0) {
      ctx.fillStyle = '#880000';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`Special: ${player.specialAttackCooldown.toFixed(1)}s`, 20, 195);
    } else if (gameStateRef.current.specialCharges > 0) {
      ctx.fillStyle = '#008800';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`Special: Ready`, 20, 195);
    }
    
    // Draw controls reminder with better visibility
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(canvas.width - 400, canvas.height - 30, 390, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Controls: Arrow keys to move, Spacebar to attack, Shift for special, H for help', 
      canvas.width - 390, canvas.height - 15);
  };
  
  // Render minimap
  const renderMinimap = (ctx: CanvasRenderingContext2D) => {
    const map = gameStateRef.current.map;
    const player = gameStateRef.current.player;
    const enemies = gameStateRef.current.enemies;
    const items = gameStateRef.current.items;
    const canvas = canvasRef.current;
    
    if (!canvas) return;
    
    // Minimap dimensions and position
    const minimapSize = 150;
    const minimapX = canvas.width - minimapSize - 20;
    const minimapY = 20;
    
    // Draw minimap background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Calculate scaling factors
    const mapWidth = map.width * map.tileSize;
    const mapHeight = map.height * map.tileSize;
    const scaleX = minimapSize / mapWidth;
    const scaleY = minimapSize / mapHeight;
    
    // Draw player on minimap
    const playerMinimapX = minimapX + player.x * scaleX;
    const playerMinimapY = minimapY + player.y * scaleY;
    
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(playerMinimapX, playerMinimapY, 4, 4);
    
    // Draw enemies on minimap
    enemies.forEach(enemy => {
      if (enemy.isDead) return;
      
      const enemyMinimapX = minimapX + enemy.x * scaleX;
      const enemyMinimapY = minimapY + enemy.y * scaleY;
      
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(enemyMinimapX, enemyMinimapY, 3, 3);
    });
    
    // Draw items on minimap
    items.forEach(item => {
      if (item.isCollected) return;
      
      const itemMinimapX = minimapX + item.x * scaleX;
      const itemMinimapY = minimapY + item.y * scaleY;
      
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(itemMinimapX, itemMinimapY, 2, 2);
    });
    
    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
  };
  
  // Render game over screen
  const renderGameOver = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game over text
    ctx.fillStyle = '#ff0000';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
    
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${gameStateRef.current.score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText(`Enemies Defeated: ${gameStateRef.current.enemiesDefeated}`, canvas.width / 2, canvas.height / 2 + 40);
    
    // Restart instructions
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText('Click anywhere to restart', canvas.width / 2, canvas.height / 2 + 100);
    
    // Reset text alignment
    ctx.textAlign = 'left';
  };
  
  // Render victory screen
  const renderVictory = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Victory text
    ctx.fillStyle = '#ffff00';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VICTORY!', canvas.width / 2, canvas.height / 2 - 50);
    
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${gameStateRef.current.score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText(`Enemies Defeated: ${gameStateRef.current.enemiesDefeated}`, canvas.width / 2, canvas.height / 2 + 40);
    
    // Restart instructions
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText('Click anywhere to play again', canvas.width / 2, canvas.height / 2 + 100);
    
    // Reset text alignment
    ctx.textAlign = 'left';
  };
  
  // Render tutorial
  const renderTutorial = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Semi-transparent white background for better readability
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Tutorial title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BMO RPG Adventure - Instructions', canvas.width / 2, 50);
    
    // Add a colored header for controls
    ctx.fillStyle = 'rgba(0, 100, 0, 0.15)';
    ctx.fillRect(canvas.width/2 - 200, 70, 400, 40);
    
    // Instructions
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Controls:', canvas.width / 2, 100);
    
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Arrow keys / WASD: Move character', canvas.width / 2, 130);
    ctx.fillText('Spacebar: Attack enemies', canvas.width / 2, 160);
    ctx.fillText('Shift: Special attack (limited uses)', canvas.width / 2, 190);
    ctx.fillText('H: Show/hide help', canvas.width / 2, 220);
    ctx.fillText('M: Show/hide minimap', canvas.width / 2, 250);
    ctx.fillText('P: Pause game', canvas.width / 2, 280);
    
    // Add a colored header for gameplay
    ctx.fillStyle = 'rgba(0, 100, 0, 0.15)';
    ctx.fillRect(canvas.width/2 - 200, 300, 400, 40);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Gameplay:', canvas.width / 2, 330);
    
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Defeat all enemies to complete a wave', canvas.width / 2, 360);
    ctx.fillText('There are 5 waves in total - survive to win!', canvas.width / 2, 390);
    ctx.fillText('Collect health potions to restore health', canvas.width / 2, 420);
    ctx.fillText('Defeat enemies to gain experience and level up', canvas.width / 2, 450);
    ctx.fillText('Special attacks damage all enemies in range', canvas.width / 2, 480);
    
    // Continue instructions - make this stand out with a button-like style
    ctx.fillStyle = 'rgba(0, 150, 0, 1)';
    ctx.fillRect(canvas.width/2 - 190, 520, 380, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Press H to close this help screen and play', canvas.width / 2, 545);
    
    // Reset text alignment
    ctx.textAlign = 'left';
  };
  
  // Render pause screen
  const renderPauseScreen = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Pause text
    ctx.fillStyle = '#ffffff';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME PAUSED', canvas.width / 2, canvas.height / 2);
    
    // Continue instructions
    ctx.font = '20px Arial';
    ctx.fillText('Press P to continue', canvas.width / 2, canvas.height / 2 + 50);
    
    // Reset text alignment
    ctx.textAlign = 'left';
  };

  return (
    <>
      {/* Game button */}
      <Button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800"
      >
        <Gamepad2 className="h-5 w-5" />
        <span className="font-semibold">BMO RPG Adventure</span>
      </Button>

      {/* Game dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl md:max-w-5xl w-[90vw] h-auto max-h-[95vh] p-0 gap-0 bg-background/95 backdrop-blur-sm border-green-500/20 overflow-hidden">
          <DialogTitle className="sr-only">BMO RPG Adventure</DialogTitle>
          <DialogDescription className="sr-only">
            Enter BMO's memory banks and play a retro-style Adventure Time RPG!
          </DialogDescription>
          
          {/* Game header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-green-50 dark:bg-green-950/30">
            <div className="flex items-center gap-4">
              <img src={BMOImage} alt="BMO" className="w-8 h-8 object-contain" />
              <h2 className="text-xl font-bold"><span className="text-green-500">BMO</span> RPG Adventure</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault(); // Prevent default button behavior
                  e.stopPropagation(); // Stop event propagation to parent elements
                  
                  // Update state to toggle tutorial display
                  setShowTutorial((prev) => !prev);
                  
                  // Also update the game state reference directly
                  gameStateRef.current.showTutorial = !gameStateRef.current.showTutorial;
                }}
              >
                <Info className="h-4 w-4 mr-1" />
                Help
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Game container */}
          <div 
            ref={gameContainerRef} 
            className="relative w-full h-[75vh] overflow-hidden bg-black flex flex-col items-center justify-center"
          >
            <canvas 
              ref={canvasRef} 
              className="max-w-full max-h-full"
              style={{ imageRendering: 'pixelated' }}
            />
            
            {!isOpen && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                Loading game...
              </div>
            )}
            
            {/* Level Up Celebration Overlay */}
            {showLevelUpCelebration && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  {/* First we show Finn celebration image for levels 1-3 */}
                  {level <= 3 && (
                    <img 
                      src="/assets/images/rpg/finn-victory1.svg" 
                      alt="Level Up!" 
                      className="w-64 h-64 animate-bounce"
                    />
                  )}
                  
                  {/* For higher levels, show Finn and Jake celebration */}
                  {level > 3 && (
                    <img 
                      src="/assets/images/rpg/finn-jake-victory.svg" 
                      alt="Level Up!" 
                      className="w-80 h-80 animate-bounce"
                    />
                  )}
                  
                  {/* Celebration text */}
                  <div className="absolute top-0 left-0 right-0 text-center">
                    <h2 className="text-yellow-300 text-3xl font-bold drop-shadow-lg animate-pulse">
                      LEVEL UP!
                    </h2>
                    <p className="text-white text-xl font-bold mt-1 drop-shadow-lg">
                      You reached level {level}!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Game status bar */}
          <div className="p-3 border-t border-border bg-green-100 dark:bg-green-900">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-black dark:text-white">
                <span className="font-bold">Level: {level}</span> | 
                <span className="font-bold ml-2">Score: {score}</span> |
                <span className="font-bold ml-2">Wave: {wave}/5</span>
              </div>
              <div className="text-center text-black dark:text-white">
                <span className="font-bold">Controls: Arrow keys to move, Spacebar to attack, Shift for special</span>
              </div>
              <div className="text-right text-black dark:text-white">
                <span className="font-bold">Enemies Defeated: {enemiesDefeated}</span> | 
                <span className="font-bold ml-2">Special Attacks: {specialAttackCharge}/3</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}