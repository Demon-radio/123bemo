import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Gamepad2, RotateCcw } from "lucide-react";
import { trackEvent, trackGameStart, trackGameComplete } from "@/lib/analytics";
import { AudioManager } from "@/lib/audioManager";

// BMO Maze Game with 5 random maps
// BMO needs to escape from different mazes

interface Position {
  x: number;
  y: number;
}

interface GameState {
  level: number;
  score: number;
  timeElapsed: number;
  gameStarted: boolean;
  gameCompleted: boolean;
  currentMaze: number[][];
  bmoPosition: Position;
  exitPosition: Position;
  moves: number;
}

const MAZE_SIZE = 15;
const CELL_SIZE = 20;

// Generate 5 different maze patterns
const generateMaze = (mazeNumber: number): number[][] => {
  const maze = Array(MAZE_SIZE).fill(null).map(() => Array(MAZE_SIZE).fill(1));
  
  // Different maze patterns for each level
  const patterns = [
    // Maze 1: Simple path
    () => {
      for (let i = 1; i < MAZE_SIZE - 1; i += 2) {
        for (let j = 1; j < MAZE_SIZE - 1; j += 2) {
          maze[i][j] = 0;
          if (Math.random() > 0.3) {
            if (i + 1 < MAZE_SIZE - 1) maze[i + 1][j] = 0;
          }
          if (Math.random() > 0.3) {
            if (j + 1 < MAZE_SIZE - 1) maze[i][j + 1] = 0;
          }
        }
      }
    },
    
    // Maze 2: Spiral pattern
    () => {
      let x = 1, y = 1;
      let dx = 0, dy = 1;
      for (let i = 0; i < 50; i++) {
        if (x >= 1 && x < MAZE_SIZE - 1 && y >= 1 && y < MAZE_SIZE - 1) {
          maze[x][y] = 0;
        }
        x += dx;
        y += dy;
        if (x <= 1 || x >= MAZE_SIZE - 2 || y <= 1 || y >= MAZE_SIZE - 2 || maze[x][y] === 0) {
          [dx, dy] = [-dy, dx];
        }
      }
    },
    
    // Maze 3: Random paths
    () => {
      for (let i = 1; i < MAZE_SIZE - 1; i++) {
        for (let j = 1; j < MAZE_SIZE - 1; j++) {
          if (Math.random() > 0.6) {
            maze[i][j] = 0;
          }
        }
      }
    },
    
    // Maze 4: Cross pattern
    () => {
      const mid = Math.floor(MAZE_SIZE / 2);
      for (let i = 1; i < MAZE_SIZE - 1; i++) {
        maze[i][mid] = 0;
        maze[mid][i] = 0;
      }
      for (let i = 2; i < MAZE_SIZE - 2; i += 3) {
        for (let j = 2; j < MAZE_SIZE - 2; j += 3) {
          maze[i][j] = 0;
          if (i + 1 < MAZE_SIZE - 1) maze[i + 1][j] = 0;
          if (j + 1 < MAZE_SIZE - 1) maze[i][j + 1] = 0;
        }
      }
    },
    
    // Maze 5: Complex maze
    () => {
      for (let i = 1; i < MAZE_SIZE - 1; i += 2) {
        for (let j = 1; j < MAZE_SIZE - 1; j += 2) {
          maze[i][j] = 0;
          const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]].filter(
            ([di, dj]) => i + di > 0 && i + di < MAZE_SIZE - 1 && 
                         j + dj > 0 && j + dj < MAZE_SIZE - 1
          );
          if (directions.length > 0) {
            const [di, dj] = directions[Math.floor(Math.random() * directions.length)];
            maze[i + di/2][j + dj/2] = 0;
            maze[i + di][j + dj] = 0;
          }
        }
      }
    }
  ];
  
  patterns[mazeNumber % patterns.length]();
  
  // Ensure start and end are accessible
  maze[1][1] = 0; // Start position
  maze[MAZE_SIZE - 2][MAZE_SIZE - 2] = 0; // End position
  
  return maze;
};

export function BmoMazeGame() {
  const [isOpen, setIsOpen] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    score: 0,
    timeElapsed: 0,
    gameStarted: false,
    gameCompleted: false,
    currentMaze: generateMaze(0),
    bmoPosition: { x: 1, y: 1 },
    exitPosition: { x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 },
    moves: 0
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const audioManager = AudioManager.getInstance();
  
  // BMO image from attached assets
  const bmoImageRef = useRef<HTMLImageElement>();
  
  useEffect(() => {
    if (isOpen) {
      // Load BMO image
      const img = new Image();
      img.src = '/attached_assets/5f6bfebca549bf0ac706a4c2f6ad9d1c_1752086091371.jpg';
      img.onload = () => {
        bmoImageRef.current = img;
      };
      
      startGameLoop();
      trackGameStart("BMO Maze Game");
    } else {
      stopGameLoop();
    }
    
    return () => stopGameLoop();
  }, [isOpen]);
  
  useEffect(() => {
    if (gameState.gameStarted) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (gameState.gameCompleted) return;
        
        let newX = gameState.bmoPosition.x;
        let newY = gameState.bmoPosition.y;
        
        switch (e.key.toLowerCase()) {
          case 'arrowup':
          case 'w':
            newX = Math.max(0, newX - 1);
            break;
          case 'arrowdown':
          case 's':
            newX = Math.min(MAZE_SIZE - 1, newX + 1);
            break;
          case 'arrowleft':
          case 'a':
            newY = Math.max(0, newY - 1);
            break;
          case 'arrowright':
          case 'd':
            newY = Math.min(MAZE_SIZE - 1, newY + 1);
            break;
          case 'escape':
            setIsOpen(false);
            return;
        }
        
        // Check if move is valid (not hitting a wall)
        if (gameState.currentMaze[newX][newY] === 0) {
          audioManager.playSound("mazeMove");
          
          setGameState(prev => {
            const newState = {
              ...prev,
              bmoPosition: { x: newX, y: newY },
              moves: prev.moves + 1
            };
            
            // Check if reached exit
            if (newX === prev.exitPosition.x && newY === prev.exitPosition.y) {
              if (prev.level < 5) {
                // Next level
                audioManager.playSound("levelUp");
                newState.level = prev.level + 1;
                newState.score = prev.score + (1000 - prev.moves * 10);
                newState.currentMaze = generateMaze(prev.level);
                newState.bmoPosition = { x: 1, y: 1 };
                newState.moves = 0;
              } else {
                // Game completed
                audioManager.playSound("mazeWin");
                newState.gameCompleted = true;
                newState.score = prev.score + (1000 - prev.moves * 10);
                trackGameComplete("BMO Maze Game", newState.score);
              }
            }
            
            return newState;
          });
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameState.gameStarted, gameState.bmoPosition, gameState.currentMaze, gameState.level, gameState.moves, gameState.gameCompleted]);
  
  const startGameLoop = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
    
    const gameLoop = () => {
      if (gameState.gameStarted && !gameState.gameCompleted) {
        setGameState(prev => ({
          ...prev,
          timeElapsed: Math.floor((Date.now() - startTimeRef.current!) / 1000)
        }));
      }
      
      draw();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
  };
  
  const stopGameLoop = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };
  
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze
    for (let i = 0; i < MAZE_SIZE; i++) {
      for (let j = 0; j < MAZE_SIZE; j++) {
        const x = j * CELL_SIZE;
        const y = i * CELL_SIZE;
        
        if (gameState.currentMaze[i][j] === 1) {
          // Wall
          ctx.fillStyle = '#2dd4bf';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = '#0f766e';
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        } else {
          // Path
          ctx.fillStyle = '#f0f9ff';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }
      }
    }
    
    // Draw exit
    const exitX = gameState.exitPosition.y * CELL_SIZE;
    const exitY = gameState.exitPosition.x * CELL_SIZE;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(exitX + 2, exitY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    ctx.fillStyle = '#f59e0b';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🚪', exitX + CELL_SIZE/2, exitY + CELL_SIZE/2 + 4);
    
    // Draw BMO
    const bmoX = gameState.bmoPosition.y * CELL_SIZE;
    const bmoY = gameState.bmoPosition.x * CELL_SIZE;
    
    if (bmoImageRef.current) {
      ctx.drawImage(bmoImageRef.current, bmoX + 1, bmoY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    } else {
      // Fallback BMO representation
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(bmoX + 2, bmoY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      ctx.fillStyle = '#0891b2';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('BMO', bmoX + CELL_SIZE/2, bmoY + CELL_SIZE/2 + 3);
    }
    
    // Reset text alignment
    ctx.textAlign = 'left';
  };
  
  const startGame = () => {
    setGameState({
      level: 1,
      score: 0,
      timeElapsed: 0,
      gameStarted: true,
      gameCompleted: false,
      currentMaze: generateMaze(0),
      bmoPosition: { x: 1, y: 1 },
      exitPosition: { x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 },
      moves: 0
    });
    startTimeRef.current = Date.now();
  };
  
  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      currentMaze: generateMaze(prev.level - 1),
      bmoPosition: { x: 1, y: 1 },
      moves: 0
    }));
  };
  
  // Mobile touch controls
  const moveBMO = (direction: string) => {
    if (gameState.gameCompleted) return;
    
    let newX = gameState.bmoPosition.x;
    let newY = gameState.bmoPosition.y;
    
    switch (direction) {
      case 'up':
        newX = Math.max(0, newX - 1);
        break;
      case 'down':
        newX = Math.min(MAZE_SIZE - 1, newX + 1);
        break;
      case 'left':
        newY = Math.max(0, newY - 1);
        break;
      case 'right':
        newY = Math.min(MAZE_SIZE - 1, newY + 1);
        break;
    }
    
    // Check if move is valid
    if (gameState.currentMaze[newX][newY] === 0) {
      setGameState(prev => {
        const newState = {
          ...prev,
          bmoPosition: { x: newX, y: newY },
          moves: prev.moves + 1
        };
        
        // Check if reached exit
        if (newX === prev.exitPosition.x && newY === prev.exitPosition.y) {
          if (prev.level < 5) {
            newState.level = prev.level + 1;
            newState.score = prev.score + (1000 - prev.moves * 10);
            newState.currentMaze = generateMaze(prev.level);
            newState.bmoPosition = { x: 1, y: 1 };
            newState.moves = 0;
          } else {
            newState.gameCompleted = true;
            newState.score = prev.score + (1000 - prev.moves * 10);
            trackGameComplete("BMO Maze Game", newState.score);
          }
        }
        
        return newState;
      });
    }
  };
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-700 hover:from-cyan-600 hover:to-teal-800"
      >
        <Gamepad2 className="h-6 w-6" />
        <span className="font-semibold">BMO Maze Escape</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl w-[95vw] h-auto max-h-[95vh] p-0 gap-0 bg-background/95 backdrop-blur-sm border-cyan-500/20">
          <DialogTitle className="sr-only">BMO Maze Escape Game</DialogTitle>
          <DialogDescription className="sr-only">
            Help BMO escape through 5 different mazes!
          </DialogDescription>
          
          {/* Game header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-cyan-50 dark:bg-cyan-950/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-white font-bold">
                BMO
              </div>
              <h2 className="text-xl font-bold">
                <span className="text-cyan-500">BMO</span> Maze Escape
              </h2>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Game area */}
          <div className="p-4 flex flex-col items-center">
            {!gameState.gameStarted ? (
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Help BMO Escape!</h3>
                <p className="mb-6 text-muted-foreground">
                  Navigate BMO through 5 different mazes to help him escape!
                </p>
                <Button onClick={startGame} className="bg-cyan-500 hover:bg-cyan-600">
                  Start Adventure
                </Button>
              </div>
            ) : (
              <>
                {/* Game stats */}
                <div className="w-full mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-cyan-600">Level</div>
                    <div className="text-2xl">{gameState.level}/5</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">Score</div>
                    <div className="text-2xl">{gameState.score}</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">Moves</div>
                    <div className="text-2xl">{gameState.moves}</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">Time</div>
                    <div className="text-2xl">{gameState.timeElapsed}s</div>
                  </div>
                </div>
                
                {/* Game canvas */}
                <canvas 
                  ref={canvasRef}
                  width={MAZE_SIZE * CELL_SIZE}
                  height={MAZE_SIZE * CELL_SIZE}
                  className="border-2 border-cyan-500 rounded mb-4"
                  style={{ imageRendering: 'pixelated' }}
                />
                
                {/* Mobile controls */}
                <div className="md:hidden grid grid-cols-3 gap-2 mb-4">
                  <div></div>
                  <button 
                    className="bg-cyan-500 text-white p-3 rounded-lg touch-manipulation"
                    onTouchStart={() => moveBMO('up')}
                  >
                    ↑
                  </button>
                  <div></div>
                  <button 
                    className="bg-cyan-500 text-white p-3 rounded-lg touch-manipulation"
                    onTouchStart={() => moveBMO('left')}
                  >
                    ←
                  </button>
                  <button 
                    className="bg-red-500 text-white p-3 rounded-lg touch-manipulation"
                    onClick={resetGame}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button 
                    className="bg-cyan-500 text-white p-3 rounded-lg touch-manipulation"
                    onTouchStart={() => moveBMO('right')}
                  >
                    →
                  </button>
                  <div></div>
                  <button 
                    className="bg-cyan-500 text-white p-3 rounded-lg touch-manipulation"
                    onTouchStart={() => moveBMO('down')}
                  >
                    ↓
                  </button>
                  <div></div>
                </div>
                
                {/* Controls info */}
                <div className="text-center text-sm text-muted-foreground">
                  <p className="hidden md:block">Use arrow keys or WASD to move BMO • ESC to exit</p>
                  <p className="md:hidden">Use the buttons above to move BMO</p>
                  <p>Find the door 🚪 to escape to the next level!</p>
                </div>
                
                {/* Game completion */}
                {gameState.gameCompleted && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center">
                      <h2 className="text-3xl font-bold text-green-600 mb-4">
                        BMO Escaped! 🎉
                      </h2>
                      <p className="text-xl mb-4">
                        Final Score: {gameState.score}
                      </p>
                      <p className="mb-6">
                        Total Time: {gameState.timeElapsed} seconds
                      </p>
                      <Button onClick={() => setIsOpen(false)}>
                        Close Game
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}