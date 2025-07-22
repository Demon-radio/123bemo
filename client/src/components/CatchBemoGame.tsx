import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad, Play, RotateCcw, Trophy } from "lucide-react";
import { RobotLogo } from "@/components/RobotLogo";
import { trackGameStart, trackGameComplete } from "@/lib/analytics";
import { AudioManager } from "@/lib/audioManager";

interface FallingItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: "logo" | "bomb";
}

export function CatchBemoGame() {
  const [isOpen, setIsOpen] = useState(false);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [basketPosition, setBaskethPosition] = useState(50);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [highScore, setHighScore] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();
  const nextItemId = useRef(0);
  
  const audioManager = AudioManager.getInstance();

  // Game settings
  const GAME_DURATION = 30; // seconds
  const BASKET_SIZE = 60;
  const ITEM_SIZE = 40;
  const ITEM_SPAWN_RATE = 0.02; // probability per frame
  const BOMB_PROBABILITY = 0.3; // 30% chance for bombs

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("catchBemoHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  const startGame = () => {
    if (!playerName.trim()) return;
    
    setGameState("playing");
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setBaskethPosition(50);
    setFallingItems([]);
    nextItemId.current = 0;
    
    audioManager.playSound("gameStart");
    trackGameStart("Catch BEMORA");
    startGameLoop();
  };

  const startGameLoop = () => {
    let lastTime = Date.now();
    
    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Update timer
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - deltaTime / 1000);
        if (newTime <= 0) {
          endGame();
          return 0;
        }
        return newTime;
      });

      // Spawn new items
      if (Math.random() < ITEM_SPAWN_RATE) {
        const newItem: FallingItem = {
          id: nextItemId.current++,
          x: Math.random() * 80 + 10, // 10% to 90% of game area width
          y: -5,
          speed: Math.random() * 3 + 2, // 2-5 units per frame
          type: Math.random() < BOMB_PROBABILITY ? "bomb" : "logo"
        };
        
        setFallingItems(prev => [...prev, newItem]);
      }

      // Update falling items
      setFallingItems(prev => 
        prev.map(item => ({
          ...item,
          y: item.y + item.speed
        })).filter(item => item.y < 110) // Remove items that fall off screen
      );

      if (gameState === "playing") {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    setGameState("gameOver");
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    audioManager.playSound("gameOver");

    // Update high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("catchBemoHighScore", score.toString());
      audioManager.playSound("levelUp"); // Play special sound for new high score
    }

    trackGameComplete("Catch BEMORA", score);
  };

  const checkCollisions = () => {
    setFallingItems(prev => {
      const remaining: FallingItem[] = [];
      let scoreChange = 0;

      prev.forEach(item => {
        // Check if item is in basket area (y position between 80-90)
        if (item.y >= 80 && item.y <= 90) {
          // Check horizontal collision
          const itemCenter = item.x + ITEM_SIZE / 2;
          const basketLeft = basketPosition;
          const basketRight = basketPosition + BASKET_SIZE;

          if (itemCenter >= basketLeft && itemCenter <= basketRight) {
            // Collision detected!
            if (item.type === "logo") {
              scoreChange += 10;
              audioManager.playSound("coin");
            } else if (item.type === "bomb") {
              scoreChange -= 5;
              audioManager.playSound("explosion");
            }
            return; // Don't add to remaining items
          }
        }
        remaining.push(item);
      });

      if (scoreChange !== 0) {
        setScore(prev => Math.max(0, prev + scoreChange));
      }

      return remaining;
    });
  };

  useEffect(() => {
    if (gameState === "playing") {
      checkCollisions();
    }
  }, [fallingItems, basketPosition, gameState, score]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== "playing" || !gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setBaskethPosition(Math.max(0, Math.min(100 - BASKET_SIZE, x - BASKET_SIZE / 2)));
  };

  const resetGame = () => {
    setGameState("menu");
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setBaskethPosition(50);
    setFallingItems([]);
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full bg-primary/10 border-primary text-primary hover:bg-primary/20 shine-effect flex items-center gap-2 px-8 py-3 justify-center"
      >
        <Gamepad className="h-5 w-5" />
        <span className="font-semibold">Catch BEMORA</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <span className="gradient-text">Catch BEMORA Game</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {gameState === "menu" && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <RobotLogo size={60} className="mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-bold mb-2">Catch the BEMORA Logo!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Move your basket to catch as many BEMORA logos as possible in 30 seconds. Avoid the bombs!
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>🤖 Logo: +10 points</p>
                      <p>💣 Bomb: -5 points</p>
                    </div>
                  </div>

                  {highScore > 0 && (
                    <div className="text-center p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-yellow-800 dark:text-yellow-200">
                        <Trophy className="h-4 w-4" />
                        <span className="font-bold">High Score: {highScore}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Name:</label>
                    <Input
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      onKeyPress={(e) => e.key === "Enter" && startGame()}
                    />
                  </div>

                  <Button 
                    onClick={startGame}
                    disabled={!playerName.trim()}
                    className="w-full bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Game
                  </Button>
                </motion.div>
              )}

              {gameState === "playing" && (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  {/* Game Stats */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="font-bold">Score: {score}</div>
                    <div className="font-bold">Time: {Math.ceil(timeLeft)}s</div>
                  </div>

                  {/* Game Area */}
                  <div 
                    ref={gameAreaRef}
                    className="relative h-64 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg border-2 border-primary overflow-hidden cursor-none"
                    onMouseMove={handleMouseMove}
                  >
                    {/* Falling Items */}
                    {fallingItems.map(item => (
                      <motion.div
                        key={item.id}
                        className="absolute"
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          width: `${ITEM_SIZE}px`,
                          height: `${ITEM_SIZE}px`,
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        {item.type === "logo" ? (
                          <RobotLogo size={ITEM_SIZE} className="text-white drop-shadow-lg" />
                        ) : (
                          <div className="w-full h-full bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            💣
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {/* Basket */}
                    <motion.div
                      className="absolute bottom-2 bg-yellow-600 rounded-b-lg border-2 border-yellow-800"
                      style={{
                        left: `${basketPosition}%`,
                        width: `${BASKET_SIZE}px`,
                        height: "30px",
                      }}
                      animate={{ x: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className="text-center text-xs font-bold text-yellow-100 pt-1">
                        {playerName}
                      </div>
                    </motion.div>
                  </div>

                  <div className="text-xs text-center text-muted-foreground">
                    Move your mouse to control the basket
                  </div>
                </motion.div>
              )}

              {gameState === "gameOver" && (
                <motion.div
                  key="gameOver"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 text-center"
                >
                  <div>
                    <h3 className="text-xl font-bold mb-2">Game Over!</h3>
                    <p className="text-lg font-semibold text-primary">Final Score: {score}</p>
                    {score === highScore && score > 0 && (
                      <p className="text-sm text-yellow-600 font-bold">🎉 New High Score!</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={resetGame}
                      variant="outline"
                      className="flex-1 flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Play Again
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}