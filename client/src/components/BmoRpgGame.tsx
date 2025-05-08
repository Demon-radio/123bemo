import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Gamepad2 } from "lucide-react";
import BMOImage from "@assets/image_1746719364511.png";

// Simple 2D RPG game implementation without Phaser
export function BmoRpgGame() {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  // Game state
  const gameStateRef = useRef({
    player: { x: 400, y: 300, width: 30, height: 30, speed: 5, attackRange: 50, isAttacking: false },
    enemies: [
      { id: 1, x: 200, y: 200, width: 25, height: 25, type: 'bee', health: 30, speed: 2, color: '#FFD700' },
      { id: 2, x: 500, y: 250, width: 35, height: 30, type: 'frog', health: 40, speed: 1.5, color: '#00FF00' },
      { id: 3, x: 300, y: 400, width: 30, height: 25, type: 'rabbit', health: 35, speed: 3, color: '#FFA07A' }
    ],
    keys: { up: false, down: false, left: false, right: false, space: false },
    background: { 
      cells: Array(20).fill(0).map(() => Array(20).fill(0).map(() => Math.floor(Math.random() * 5)))
    }
  });

  // Game loop
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    
    // Start game
    setGameRunning(true);
    setHealth(100);
    setScore(0);
    setGameOver(false);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set up canvas
    canvas.width = 800;
    canvas.height = 600;
    
    // Load images
    const playerImage = new Image();
    playerImage.src = 'https://opengameart.org/sites/default/files/styles/thumbnail/public/finn.png';
    
    const enemyImages: {[key: string]: HTMLImageElement} = {
      bee: new Image(),
      frog: new Image(),
      rabbit: new Image()
    };
    
    enemyImages.bee.src = 'https://art.pixilart.com/1df55bb68dd11eb.png';
    enemyImages.frog.src = 'https://art.pixilart.com/82e0994d66b60f3.png';
    enemyImages.rabbit.src = 'https://art.pixilart.com/99e27ea1eeac673.png';
    
    const backgroundImage = new Image();
    backgroundImage.src = 'https://opengameart.org/sites/default/files/styles/thumbnail/public/plains_2.png';
    
    // Key event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          gameStateRef.current.keys.up = true;
          break;
        case 'ArrowDown':
          gameStateRef.current.keys.down = true;
          break;
        case 'ArrowLeft': 
          gameStateRef.current.keys.left = true;
          break;
        case 'ArrowRight':
          gameStateRef.current.keys.right = true;
          break;
        case ' ':
          gameStateRef.current.keys.space = true;
          gameStateRef.current.player.isAttacking = true;
          setTimeout(() => {
            gameStateRef.current.player.isAttacking = false;
          }, 200);
          break;
        default:
          break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': 
          gameStateRef.current.keys.up = false;
          break;
        case 'ArrowDown':
          gameStateRef.current.keys.down = false;
          break;
        case 'ArrowLeft':
          gameStateRef.current.keys.left = false;
          break;
        case 'ArrowRight':
          gameStateRef.current.keys.right = false;
          break;
        case ' ':
          gameStateRef.current.keys.space = false;
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Game loop
    const gameLoop = () => {
      if (!gameRunning || gameOver) return;
      
      const { player, enemies, keys } = gameStateRef.current;
      
      // Move player
      if (keys.up) player.y -= player.speed;
      if (keys.down) player.y += player.speed;
      if (keys.left) player.x -= player.speed;
      if (keys.right) player.x += player.speed;
      
      // Keep player in bounds
      player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
      player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
      
      // Move enemies toward player
      enemies.forEach(enemy => {
        // Simple AI: move toward player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) { // Don't move if already close
          enemy.x += (dx / distance) * enemy.speed;
          enemy.y += (dy / distance) * enemy.speed;
        }
        
        // Check collision with player (take damage)
        if (
          player.x < enemy.x + enemy.width &&
          player.x + player.width > enemy.x &&
          player.y < enemy.y + enemy.height &&
          player.y + player.height > enemy.y
        ) {
          // Player takes damage
          const damage = enemy.type === 'bee' ? 1 : enemy.type === 'frog' ? 2 : 1.5;
          setHealth(h => {
            const newHealth = Math.max(0, h - damage);
            if (newHealth <= 0) {
              setGameOver(true);
              setGameRunning(false);
            }
            return newHealth;
          });
          
          // Push enemy back a bit
          enemy.x += (dx / distance) * 10;
          enemy.y += (dy / distance) * 10;
        }
        
        // Check if player is attacking and in range
        if (player.isAttacking) {
          const attackDistance = Math.sqrt(
            Math.pow(player.x + player.width/2 - (enemy.x + enemy.width/2), 2) +
            Math.pow(player.y + player.height/2 - (enemy.y + enemy.height/2), 2)
          );
          
          if (attackDistance < player.attackRange) {
            // Enemy takes damage
            enemy.health -= 10;
            
            // Enemy is defeated
            if (enemy.health <= 0) {
              // Add score based on enemy type
              const points = enemy.type === 'bee' ? 10 : enemy.type === 'frog' ? 20 : 15;
              setScore(s => s + points);
              
              // Respawn enemy at a random location
              enemy.health = enemy.type === 'bee' ? 30 : enemy.type === 'frog' ? 40 : 35;
              enemy.x = Math.random() * (canvas.width - enemy.width);
              enemy.y = Math.random() * (canvas.height - enemy.height);
            }
          }
        }
      });
      
      // Render game
      renderGame();
    };
    
    // Render function
    const renderGame = () => {
      if (!ctx) return;
      
      const { player, enemies, background } = gameStateRef.current;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      const cellSize = 40;
      for (let y = 0; y < background.cells.length; y++) {
        for (let x = 0; x < background.cells[y].length; x++) {
          const cellType = background.cells[y][x];
          ctx.fillStyle = ['#87CEEB', '#8FBC8F', '#90EE90', '#9ACD32', '#556B2F'][cellType];
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          
          // Grid lines
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
      
      // Draw player
      ctx.fillStyle = '#3498db'; // Blue player
      if (playerImage.complete) {
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
      } else {
        ctx.fillRect(player.x, player.y, player.width, player.height);
      }
      
      // Draw attack animation if attacking
      if (player.isAttacking) {
        ctx.beginPath();
        ctx.arc(
          player.x + player.width / 2,
          player.y + player.height / 2,
          player.attackRange,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.fill();
      }
      
      // Draw enemies
      enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        
        const img = enemyImages[enemy.type];
        if (img && img.complete) {
          ctx.drawImage(img, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
          ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
        
        // Health bar
        const maxHealth = enemy.type === 'bee' ? 30 : enemy.type === 'frog' ? 40 : 35;
        const healthPercent = enemy.health / maxHealth;
        
        ctx.fillStyle = 'black';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 5);
        ctx.fillStyle = healthPercent > 0.5 ? 'green' : healthPercent > 0.25 ? 'yellow' : 'red';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * healthPercent, 5);
      });
      
      // Draw UI
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText(`Health: ${Math.floor(health)}`, 20, 30);
      ctx.fillText(`Score: ${score}`, 20, 60);
      
      // Draw health bar
      ctx.fillStyle = 'black';
      ctx.fillRect(140, 20, 150, 15);
      ctx.fillStyle = health > 50 ? 'green' : health > 25 ? 'yellow' : 'red';
      ctx.fillRect(140, 20, 150 * (health / 100), 15);
      
      // Draw game over screen
      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.font = '24px Arial';
        ctx.fillText(`Your score: ${score}`, canvas.width / 2, canvas.height / 2);
        
        ctx.font = '18px Arial';
        ctx.fillText('Click the screen to play again', canvas.width / 2, canvas.height / 2 + 40);
      }
    };
    
    // Start game loop
    let animationFrameId: number;
    const animate = () => {
      gameLoop();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle canvas click for restart
    const handleCanvasClick = () => {
      if (gameOver) {
        setGameRunning(true);
        setGameOver(false);
        setHealth(100);
        setScore(0);
        
        // Reset game state
        gameStateRef.current.player.x = 400;
        gameStateRef.current.player.y = 300;
        gameStateRef.current.enemies.forEach(enemy => {
          enemy.health = enemy.type === 'bee' ? 30 : enemy.type === 'frog' ? 40 : 35;
          enemy.x = Math.random() * (canvas.width - enemy.width);
          enemy.y = Math.random() * (canvas.height - enemy.height);
        });
      }
    };
    
    canvas.addEventListener('click', handleCanvasClick);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
      setGameRunning(false);
    };
  }, [isOpen, gameOver]);

  // Handle dialog closing
  useEffect(() => {
    if (!isOpen) {
      setGameRunning(false);
    }
  }, [isOpen]);

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
        <DialogContent className="sm:max-w-3xl md:max-w-4xl w-[90vw] h-auto max-h-[95vh] p-0 gap-0 bg-background/95 backdrop-blur-sm border-green-500/20 overflow-hidden">
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
            className="relative w-full h-[70vh] overflow-hidden bg-black flex flex-col items-center justify-center"
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