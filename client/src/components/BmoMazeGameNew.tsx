import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, 
  X, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Trophy,
  Clock,
  Target,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { trackEvent, trackGameStart, trackGameComplete } from "@/lib/analytics";
import { AudioManager } from "@/lib/audioManager";

const audioManager = AudioManager.getInstance();

// Game constants
const MAZE_SIZE = 15;
const CELL_SIZE = 20;
const TOTAL_LEVELS = 10;

// Cell types
const WALL = 1;
const PATH = 0;
const EXIT = 2;
const BMO = 3;

interface Position {
  x: number;
  y: number;
}

interface GameState {
  level: number;
  score: number;
  moves: number;
  timeLeft: number;
  bmoPosition: Position;
  exitPosition: Position;
  currentMaze: number[][];
  gameCompleted: boolean;
  gameStarted: boolean;
}

interface PlayerData {
  name: string;
  email: string;
}

export default function BmoMazeGameNew() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [playerData, setPlayerData] = useState<PlayerData>({ name: "", email: "" });
  const { toast } = useToast();
  const gameLoopRef = useRef<number>();
  
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    score: 0,
    moves: 0,
    timeLeft: 300, // 5 minutes per level
    bmoPosition: { x: 1, y: 1 },
    exitPosition: { x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 },
    currentMaze: [],
    gameCompleted: false,
    gameStarted: false
  });

  // Generate maze using recursive backtracking algorithm
  const generateMaze = useCallback((level: number): number[][] => {
    const maze: number[][] = Array(MAZE_SIZE).fill(null).map(() => Array(MAZE_SIZE).fill(WALL));
    
    // Recursive backtracking maze generation
    const stack: Position[] = [];
    const visited: boolean[][] = Array(MAZE_SIZE).fill(null).map(() => Array(MAZE_SIZE).fill(false));
    
    const start = { x: 1, y: 1 };
    stack.push(start);
    visited[start.y][start.x] = true;
    maze[start.y][start.x] = PATH;
    
    const directions = [
      { x: 0, y: -2 }, // Up
      { x: 2, y: 0 },  // Right
      { x: 0, y: 2 },  // Down
      { x: -2, y: 0 }  // Left
    ];
    
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors: Position[] = [];
      
      // Find unvisited neighbors
      for (const dir of directions) {
        const next = { x: current.x + dir.x, y: current.y + dir.y };
        if (next.x > 0 && next.x < MAZE_SIZE - 1 && 
            next.y > 0 && next.y < MAZE_SIZE - 1 && 
            !visited[next.y][next.x]) {
          neighbors.push(next);
        }
      }
      
      if (neighbors.length > 0) {
        // Choose random neighbor
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Create path to neighbor
        const wallX = current.x + (next.x - current.x) / 2;
        const wallY = current.y + (next.y - current.y) / 2;
        
        maze[wallY][wallX] = PATH;
        maze[next.y][next.x] = PATH;
        visited[next.y][next.x] = true;
        
        stack.push(next);
      } else {
        stack.pop();
      }
    }
    
    // Add some extra paths for higher levels to make it more complex
    const extraPaths = Math.min(level * 2, 10);
    for (let i = 0; i < extraPaths; i++) {
      const x = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1;
      const y = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1;
      if (maze[y][x] === WALL) {
        maze[y][x] = PATH;
      }
    }
    
    // Ensure exit is accessible
    maze[MAZE_SIZE - 2][MAZE_SIZE - 2] = EXIT;
    maze[MAZE_SIZE - 2][MAZE_SIZE - 3] = PATH;
    maze[MAZE_SIZE - 3][MAZE_SIZE - 2] = PATH;
    
    return maze;
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const newMaze = generateMaze(1);
    setGameState({
      level: 1,
      score: 0,
      moves: 0,
      timeLeft: 300,
      bmoPosition: { x: 1, y: 1 },
      exitPosition: { x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 },
      currentMaze: newMaze,
      gameCompleted: false,
      gameStarted: true
    });
  }, [generateMaze]);

  // Game timer
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameCompleted && gameState.timeLeft > 0) {
      gameLoopRef.current = window.setTimeout(() => {
        setGameState(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          if (newTimeLeft <= 0) {
            // Time's up - game over
            audioManager.playGameOverSound();
            toast({
              title: "Time's Up!",
              description: `You ran out of time on level ${prev.level}`,
              variant: "destructive"
            });
            return { ...prev, timeLeft: 0, gameStarted: false };
          }
          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);
    }
    
    return () => {
      if (gameLoopRef.current) {
        window.clearTimeout(gameLoopRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameCompleted, gameState.timeLeft, toast]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.gameStarted || gameState.gameCompleted) return;
      
      let direction: 'up' | 'down' | 'left' | 'right' | null = null;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = 'right';
          break;
        case 'Escape':
          setIsOpen(false);
          return;
      }
      
      if (direction) {
        e.preventDefault();
        moveBMO(direction);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, gameState.gameStarted, gameState.gameCompleted]);

  // Move BMO
  const moveBMO = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!gameState.gameStarted || gameState.gameCompleted) return;
    
    setGameState(prev => {
      let newX = prev.bmoPosition.x;
      let newY = prev.bmoPosition.y;
      
      switch (direction) {
        case 'up':
          newY = Math.max(0, newY - 1);
          break;
        case 'down':
          newY = Math.min(MAZE_SIZE - 1, newY + 1);
          break;
        case 'left':
          newX = Math.max(0, newX - 1);
          break;
        case 'right':
          newX = Math.min(MAZE_SIZE - 1, newX + 1);
          break;
      }
      
      // Check if move is valid (not hitting a wall)
      if (prev.currentMaze[newY][newX] === WALL) {
        audioManager.playSound("explosion");
        return prev; // Invalid move
      }
      
      audioManager.playSound("coin");
      const newMoves = prev.moves + 1;
      
      // Check if reached exit
      if (newX === prev.exitPosition.x && newY === prev.exitPosition.y) {
        // Level completed!
        const timeBonus = Math.max(0, prev.timeLeft * 10);
        const moveBonus = Math.max(0, (200 - newMoves) * 5);
        const levelBonus = prev.level * 1000;
        const totalLevelScore = timeBonus + moveBonus + levelBonus;
        
        audioManager.playSound("levelUp");
        
        if (prev.level < TOTAL_LEVELS) {
          // Next level
          const newLevel = prev.level + 1;
          const newMaze = generateMaze(newLevel);
          const newTimeLimit = Math.max(180, 300 - (newLevel * 15)); // Decrease time per level
          
          toast({
            title: `Level ${prev.level} Complete!`,
            description: `+${totalLevelScore} points! Moving to level ${newLevel}`,
          });
          
          return {
            ...prev,
            level: newLevel,
            score: prev.score + totalLevelScore,
            moves: 0,
            timeLeft: newTimeLimit,
            bmoPosition: { x: 1, y: 1 },
            currentMaze: newMaze
          };
        } else {
          // Game completed!
          const finalScore = prev.score + totalLevelScore;
          
          toast({
            title: "🎉 Congratulations!",
            description: `You completed all ${TOTAL_LEVELS} levels!`,
          });
          
          trackGameComplete("BMO Maze Game", finalScore);
          
          return {
            ...prev,
            score: finalScore,
            gameCompleted: true,
            gameStarted: false,
            moves: newMoves,
            bmoPosition: { x: newX, y: newY }
          };
        }
      }
      
      return {
        ...prev,
        bmoPosition: { x: newX, y: newY },
        moves: newMoves
      };
    });
  };

  // Start new game
  const startNewGame = () => {
    if (playerData.name.trim() === "") {
      toast({
        title: "Name Required",
        description: "Please enter your name to start playing",
        variant: "destructive"
      });
      return;
    }
    
    trackGameStart("BMO Maze Game");
    initializeGame();
    
    toast({
      title: "Game Started!",
      description: "Help BMO escape through 10 challenging mazes!",
    });
  };

  // Handle game completion and points submission
  const handleGameEnd = async () => {
    if (gameState.score === 0) {
      toast({
        title: "No Points to Submit",
        description: "Complete at least one level to earn points!",
        variant: "destructive"
      });
      return;
    }

    setFinalScore(gameState.score);
    setShowPointsDialog(true);
  };

  // Submit points to database
  const submitPoints = async () => {
    if (!playerData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to submit points",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest("/api/games/submit-score", {
        method: "POST",
        body: JSON.stringify({
          playerName: playerData.name,
          playerEmail: playerData.email || null,
          gameName: "BMO Maze Game",
          score: finalScore,
          level: gameState.level,
          additionalData: {
            totalMoves: gameState.moves,
            levelsCompleted: gameState.level - 1,
            gameCompleted: gameState.gameCompleted
          }
        })
      });

      toast({
        title: "Points Submitted!",
        description: `${finalScore} points saved successfully!`,
      });

      setShowPointsDialog(false);
    } catch (error) {
      console.error("Error submitting points:", error);
      toast({
        title: "Submission Failed",
        description: "Could not save your points. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render maze cell
  const renderCell = (row: number, col: number) => {
    const cell = gameState.currentMaze[row]?.[col];
    const isBMO = gameState.bmoPosition.x === col && gameState.bmoPosition.y === row;
    const isExit = gameState.exitPosition.x === col && gameState.exitPosition.y === row;
    
    let className = "absolute transition-all duration-200 ";
    let content = "";
    
    if (isBMO) {
      className += "bg-cyan-400 rounded-full border-2 border-cyan-600 animate-pulse z-10";
      content = "BMO";
    } else if (isExit) {
      className += "bg-yellow-400 rounded border-2 border-yellow-600 animate-bounce";
      content = "🚪";
    } else if (cell === WALL) {
      className += "bg-gray-800 border border-gray-600";
    } else {
      className += "bg-gray-100 dark:bg-gray-900";
    }
    
    return (
      <div
        key={`${row}-${col}`}
        className={className}
        style={{
          left: col * CELL_SIZE,
          top: row * CELL_SIZE,
          width: CELL_SIZE,
          height: CELL_SIZE,
          fontSize: CELL_SIZE * 0.4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}
      >
        {content}
      </div>
    );
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
        <DialogContent className="sm:max-w-4xl w-[95vw] h-auto max-h-[95vh] p-0 gap-0 bg-background/95 backdrop-blur-sm border-cyan-500/20">
          <DialogTitle className="sr-only">BMO Maze Escape Game</DialogTitle>
          <DialogDescription className="sr-only">
            Help BMO escape through 10 challenging mazes with time limits and scoring system!
          </DialogDescription>
          
          {/* Game header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-cyan-50 dark:bg-cyan-950/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-white font-bold text-sm">
                BMO
              </div>
              <h2 className="text-xl font-bold">
                <span className="text-cyan-600">BMO</span> Maze Escape
              </h2>
              <Badge variant="secondary">{TOTAL_LEVELS} Levels</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Game stats */}
          {gameState.gameStarted && (
            <div className="p-4 bg-muted/50 border-b border-border">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-mono">{gameState.score.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span>Level {gameState.level}/{TOTAL_LEVELS}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-red-500" />
                    <span className="font-mono">{formatTime(gameState.timeLeft)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span>Moves: {gameState.moves}</span>
                </div>
              </div>
              
              {/* Time progress bar */}
              <div className="mt-2">
                <Progress 
                  value={(gameState.timeLeft / 300) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          )}

          {/* Game content */}
          <div className="p-4 flex-1 overflow-auto">
            {!gameState.gameStarted ? (
              <div className="space-y-6">
                {/* Player registration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Player Information</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="playerName">Name *</Label>
                      <Input
                        id="playerName"
                        placeholder="Enter your name"
                        value={playerData.name}
                        onChange={(e) => setPlayerData(prev => ({ ...prev, name: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && startNewGame()}
                      />
                    </div>
                    <div>
                      <Label htmlFor="playerEmail">Email (Optional)</Label>
                      <Input
                        id="playerEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={playerData.email}
                        onChange={(e) => setPlayerData(prev => ({ ...prev, email: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && startNewGame()}
                      />
                    </div>
                  </div>
                </div>

                {/* Game instructions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">How to Play</h3>
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-cyan-400 rounded-full border border-cyan-600 flex items-center justify-center text-xs font-bold">BMO</div>
                      <span>Navigate BMO through the maze</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-400 rounded border border-yellow-600 flex items-center justify-center">🚪</div>
                      <span>Reach the exit to complete each level</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <ArrowUp className="h-4 w-4" />
                        <ArrowDown className="h-4 w-4" />
                        <ArrowLeft className="h-4 w-4" />
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Use arrow keys or WASD to move</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span>Complete each level before time runs out</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Earn bonus points for speed and efficiency</span>
                    </div>
                  </div>
                </div>

                <Button onClick={startNewGame} className="w-full" size="lg">
                  Start Adventure
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Maze container */}
                <div className="flex justify-center">
                  <div 
                    className="relative border-2 border-cyan-500 bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
                    style={{ 
                      width: MAZE_SIZE * CELL_SIZE, 
                      height: MAZE_SIZE * CELL_SIZE 
                    }}
                  >
                    {gameState.currentMaze.map((row, rowIndex) =>
                      row.map((_, colIndex) => renderCell(rowIndex, colIndex))
                    )}
                  </div>
                </div>

                {/* Mobile controls */}
                <div className="md:hidden">
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveBMO('up')}
                      className="w-12 h-12"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveBMO('left')}
                        className="w-12 h-12"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveBMO('down')}
                        className="w-12 h-12"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveBMO('right')}
                        className="w-12 h-12"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Game controls */}
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={initializeGame}
                    variant="outline"
                    size="sm"
                  >
                    Restart Level
                  </Button>
                  <Button 
                    onClick={handleGameEnd}
                    variant="outline"
                    size="sm"
                    disabled={gameState.score === 0}
                  >
                    Submit Points
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Points submission dialog */}
      <Dialog open={showPointsDialog} onOpenChange={setShowPointsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Submit Your Score</DialogTitle>
          <DialogDescription>
            Great job! You scored {finalScore.toLocaleString()} points.
          </DialogDescription>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="finalName">Name</Label>
              <Input
                id="finalName"
                value={playerData.name}
                onChange={(e) => setPlayerData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="finalEmail">Email (Optional)</Label>
              <Input
                id="finalEmail"
                type="email"
                value={playerData.email}
                onChange={(e) => setPlayerData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={submitPoints} className="flex-1">
              Submit Score
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowPointsDialog(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}