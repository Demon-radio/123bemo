import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import Phaser from "phaser";
import BMOImage from "@assets/image_1746719364511.png";

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  scene: [], // We'll set this dynamically when the game is mounted
  parent: "game-container", // This will be set dynamically
};

// Game scenes
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // Load assets needed for the loading screen
    this.load.image("loading-background", "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/skies/space3.png");
    
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: "Loading...",
      style: {
        font: "20px monospace",
        color: "#ffffff",
      },
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: "0%",
      style: {
        font: "18px monospace",
        color: "#ffffff",
      },
    });
    percentText.setOrigin(0.5, 0.5);
    
    // Update progress bar as assets load
    this.load.on("progress", (value: number) => {
      percentText.setText(parseInt(String(value * 100)) + "%");
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });
    
    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      
      this.scene.start("MainMenuScene");
    });
    
    // Load game assets
    this.load.image("pixel-tile", "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/tilemaps/tiles/catastrophi_tiles_16.png");
    this.load.image("hero", "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/phaser-dude.png");
    this.load.image("bee", "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/beball1.png");
    this.load.image("frog", "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/frog.png");
    this.load.image("rabbit", "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/bunny.png");
    this.load.image("health-potion", "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/phaser-dude.png");
    
    // Load audio
    this.load.audio("bgm", ["https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/audio/tech/sci-fi-sweep.mp3"]);
    this.load.audio("hit", ["https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/audio/impact/thud.mp3"]);
    this.load.audio("pickup", ["https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/audio/pistol.mp3"]);
  }

  create() {
    // This will set up the loading scene
    this.add.image(400, 300, "loading-background");
  }
}

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
  }

  create() {
    // Set up the main menu
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Add title
    this.add.text(width / 2, height / 4, "BMO's Adventure", {
      font: "40px Arial",
      color: "#ffffff",
    }).setOrigin(0.5);
    
    // Add menu options
    const startText = this.add.text(width / 2, height / 2, "Start Game", {
      font: "32px Arial",
      color: "#ffffff",
    }).setOrigin(0.5).setInteractive();
    
    const optionsText = this.add.text(width / 2, height / 2 + 60, "Options", {
      font: "32px Arial",
      color: "#ffffff",
    }).setOrigin(0.5).setInteractive();
    
    // Handle button clicks
    startText.on("pointerdown", () => {
      this.scene.start("GameScene");
    });
    
    optionsText.on("pointerdown", () => {
      // Options scene would go here
      console.log("Options clicked");
    });
    
    // Add hover effects
    startText.on("pointerover", () => {
      startText.setColor("#ffff00");
    });
    
    startText.on("pointerout", () => {
      startText.setColor("#ffffff");
    });
    
    optionsText.on("pointerover", () => {
      optionsText.setColor("#ffff00");
    });
    
    optionsText.on("pointerout", () => {
      optionsText.setColor("#ffffff");
    });
    
    // Add background music
    const music = this.sound.add("bgm", {
      volume: 0.5,
      loop: true,
    });
    music.play();
  }
}

class GameScene extends Phaser.Scene {
  hero: Phaser.Physics.Arcade.Sprite | null = null;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  enemies: Phaser.Physics.Arcade.Group | null = null;
  healthPoints: number = 100;
  healthText: Phaser.GameObjects.Text | null = null;
  scorePoints: number = 0;
  scoreText: Phaser.GameObjects.Text | null = null;
  gameOver: boolean = false;
  
  constructor() {
    super({ key: "GameScene" });
  }
  
  create() {
    // Create map and tileset
    const map = this.make.tilemap({
      width: 50,
      height: 50,
      tileWidth: 16,
      tileHeight: 16,
    });
    
    const tiles = map.addTilesetImage("pixel-tile") || undefined;
    if (tiles) {
      const layer = map.createBlankLayer("ground", tiles);
      
      // Fill the map with random tiles
      if (layer) {
        for (let y = 0; y < 50; y++) {
          for (let x = 0; x < 50; x++) {
            layer.putTileAt(Phaser.Math.Between(0, 48), x, y);
          }
        }
      }
    }
    
    // Hero character
    this.hero = this.physics.add.sprite(400, 300, "hero");
    this.hero.setCollideWorldBounds(true);
    
    // Camera follows the hero
    this.cameras.main.setBounds(0, 0, 50 * 16, 50 * 16);
    this.cameras.main.startFollow(this.hero);
    
    // Enemies
    this.enemies = this.physics.add.group();
    
    // Add some enemies
    this.addEnemy("bee", 300, 300);
    this.addEnemy("frog", 500, 200);
    this.addEnemy("rabbit", 200, 400);
    
    // Collision handling
    this.physics.add.collider(
      this.hero,
      this.enemies,
      (hero, enemy) => {
        // Type cast to ensure correct types
        this.handleEnemyCollision(
          hero as Phaser.Types.Physics.Arcade.GameObjectWithBody,
          enemy as Phaser.Types.Physics.Arcade.GameObjectWithBody
        );
      },
      undefined,
      this
    );
    
    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // UI
    this.healthText = this.add.text(16, 16, "HP: 100", {
      fontSize: "18px",
      color: "#ffffff",
    }).setScrollFactor(0);
    
    this.scoreText = this.add.text(16, 40, "Score: 0", {
      fontSize: "18px",
      color: "#ffffff",
    }).setScrollFactor(0);
  }
  
  addEnemy(type: string, x: number, y: number) {
    if (this.enemies) {
      const enemy = this.enemies.create(x, y, type);
      enemy.setCollideWorldBounds(true);
      enemy.setData("type", type);
      enemy.setData("health", type === "bee" ? 30 : type === "frog" ? 50 : 40);
      
      // Add random movement
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          if (!enemy.active) return;
          
          const targetX = Phaser.Math.Between(0, 800);
          const targetY = Phaser.Math.Between(0, 600);
          
          this.physics.moveToObject(enemy, { x: targetX, y: targetY }, 50);
        },
        callbackScope: this,
        loop: true,
      });
    }
  }
  
  handleEnemyCollision(
    hero: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    if (this.gameOver) return;
    
    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
    const type = enemySprite.getData("type");
    let damage = 0;
    
    // Different enemies do different damage
    if (type === "bee") damage = 5;
    else if (type === "frog") damage = 10;
    else if (type === "rabbit") damage = 7;
    
    // Apply damage
    this.healthPoints -= damage;
    if (this.healthPoints <= 0) {
      this.healthPoints = 0;
      this.gameOver = true;
      
      // Handle game over
      this.scene.pause();
      this.cameras.main.fade(1000, 0, 0, 0);
      this.time.delayedCall(1000, () => {
        this.scene.start("MainMenuScene");
      });
    }
    
    // Update health display
    if (this.healthText) {
      this.healthText.setText(`HP: ${this.healthPoints}`);
    }
    
    // Play hit sound
    this.sound.play("hit");
    
    // Flash the hero to indicate damage
    this.hero?.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      this.hero?.clearTint();
    });
  }
  
  update() {
    if (this.gameOver || !this.hero || !this.cursors) return;
    
    // Hero movement
    const speed = 160;
    
    if (this.cursors.left.isDown) {
      this.hero.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.hero.setVelocityX(speed);
    } else {
      this.hero.setVelocityX(0);
    }
    
    if (this.cursors.up.isDown) {
      this.hero.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.hero.setVelocityY(speed);
    } else {
      this.hero.setVelocityY(0);
    }
    
    // Attack enemies with spacebar
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.attackEnemies();
    }
  }
  
  attackEnemies() {
    if (!this.hero || !this.enemies) return;
    
    // Simple attack - check if enemies are close and damage them
    const attackRange = 50;
    
    this.enemies.getChildren().forEach((enemy) => {
      const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
      
      // Check distance
      const distance = Phaser.Math.Distance.Between(
        this.hero!.x,
        this.hero!.y,
        enemySprite.x,
        enemySprite.y
      );
      
      if (distance < attackRange) {
        // Damage enemy
        const health = enemySprite.getData("health") - 10;
        enemySprite.setData("health", health);
        
        // Flash enemy to indicate hit
        enemySprite.setTint(0xff0000);
        this.time.delayedCall(200, () => {
          enemySprite.clearTint();
        });
        
        // Check if enemy is defeated
        if (health <= 0) {
          // Increase score based on enemy type
          const type = enemySprite.getData("type");
          let points = 0;
          
          if (type === "bee") points = 10;
          else if (type === "frog") points = 20;
          else if (type === "rabbit") points = 15;
          
          this.scorePoints += points;
          
          if (this.scoreText) {
            this.scoreText.setText(`Score: ${this.scorePoints}`);
          }
          
          // Play pickup sound
          this.sound.play("pickup");
          
          // Remove enemy
          enemySprite.destroy();
          
          // Spawn a new enemy after a delay
          this.time.delayedCall(3000, () => {
            const types = ["bee", "frog", "rabbit"];
            const randomType = types[Phaser.Math.Between(0, 2)];
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            
            this.addEnemy(randomType, x, y);
          });
        }
      }
    });
  }
}

// Main component
export function BmoRpgGame() {
  const [isOpen, setIsOpen] = useState(false);
  const [game, setGame] = useState<Phaser.Game | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Initialize game when dialog opens
  useEffect(() => {
    if (isOpen && gameContainerRef.current && !game) {
      // Configure scenes
      const gameConfig = {
        ...config,
        scene: [BootScene, MainMenuScene, GameScene],
        parent: gameContainerRef.current,
      };

      // Create game instance
      const newGame = new Phaser.Game(gameConfig);
      setGame(newGame);

      // Cleanup when component unmounts
      return () => {
        newGame.destroy(true);
        setGame(null);
      };
    }
    
    // Cleanup when dialog closes
    if (!isOpen && game) {
      game.destroy(true);
      setGame(null);
    }
  }, [isOpen, game]);

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
        <DialogContent className="sm:max-w-5xl md:max-w-5xl w-[90vw] h-auto max-h-[95vh] p-0 gap-0 bg-background/95 backdrop-blur-sm border-green-500/20 overflow-hidden">
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
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Game container */}
          <div 
            ref={gameContainerRef} 
            id="game-container" 
            className="relative w-full h-[70vh] overflow-hidden bg-black"
          >
            {!isOpen && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                Loading game...
              </div>
            )}
          </div>
          
          {/* Game controls help */}
          <div className="p-3 border-t border-border bg-green-50 dark:bg-green-950/30">
            <h3 className="font-semibold text-sm mb-1">Controls:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <ul className="list-disc pl-4">
                <li>Arrow keys to move</li>
                <li>Spacebar to attack</li>
              </ul>
              <ul className="list-disc pl-4">
                <li>Defeat enemies to earn points</li>
                <li>Watch your health points!</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}