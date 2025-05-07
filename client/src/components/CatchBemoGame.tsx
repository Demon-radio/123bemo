import { useState, useRef, useEffect, useCallback } from "react";
import { X, Gamepad } from "lucide-react";
import { RobotLogo } from "@/components/RobotLogo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function CatchBemoGame() {
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [robotPosition, setRobotPosition] = useState({ x: 50, y: 50 });
  const [startButtonDisabled, setStartButtonDisabled] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset game state
  const resetGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(false);
    setStartButtonDisabled(false);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (moveTimerRef.current) clearInterval(moveTimerRef.current);
  };

  // Move robot randomly - defined with useCallback to avoid recreation
  const moveRobot = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    const robotSize = 60; // Robot size
    
    // Make sure we don't exceed the game area bounds
    const maxX = Math.max(0, gameArea.width - robotSize);
    const maxY = Math.max(0, gameArea.height - robotSize);
    
    const newX = Math.floor(Math.random() * maxX);
    const newY = Math.floor(Math.random() * maxY);
    
    console.log("Moving robot to:", newX, newY, "game area:", gameArea.width, gameArea.height);
    setRobotPosition({ x: newX, y: newY });
  }, []);

  // Handle robot click - Using direct event handling for better click response
  const catchRobot = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    console.log("Robot clicked! Game active:", gameActive);
    if (!gameActive) return;
    
    // Increment score immediately
    setScore(prevScore => prevScore + 1);
    
    // Move robot to a new position after a brief delay
    setTimeout(() => {
      moveRobot();
    }, 100);
  }, [gameActive, moveRobot]);

  // Start game
  const startGame = () => {
    // Prevent double-clicking the start button
    if (startButtonDisabled) return;
    
    setStartButtonDisabled(true);
    
    // Reset game state
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    
    // Clear any existing intervals
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    
    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (gameTimerRef.current) clearInterval(gameTimerRef.current);
          if (moveTimerRef.current) clearInterval(moveTimerRef.current);
          setGameActive(false);
          setStartButtonDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Ensure game area is properly referenced before starting movements
    console.log("Starting game, placing robot...");
    
    // Initial robot placement with a delay to ensure DOM is ready
    setTimeout(() => {
      moveRobot();
      // Start periodic movements
      moveTimerRef.current = setInterval(moveRobot, 1500);
    }, 300);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    };
  }, []);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetGame();
    }
  }, [isOpen]);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full bg-primary/10 border-primary text-primary hover:bg-primary/20 shine-effect flex items-center gap-2 px-8 py-3 justify-center"
      >
        <Gamepad className="h-5 w-5" />
        <span className="font-semibold">Play with BEMORA</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl w-[90vw] h-[80vh] max-h-[600px] p-0 gap-0 bg-background/95 backdrop-blur-sm border-primary/20">
          <DialogTitle className="sr-only">Catch BEMORA Game</DialogTitle>
          <DialogDescription className="sr-only">
            Catch the BEMORA logo as many times as you can before the time runs out!
          </DialogDescription>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Catch <span className="text-primary">BEMORA</span> Game</h2>
              <div className="flex gap-4 text-sm font-mono">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-secondary">Score:</span>
                  <span className="font-bold">{score}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-primary">Time:</span>
                  <span className={`font-bold ${timeLeft <= 10 ? "text-red-500" : ""}`}>{timeLeft}s</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div 
            ref={gameAreaRef} 
            className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_center,rgba(12,219,219,0.05)_0,transparent_70%)]"
          >
            {!gameActive && timeLeft === 30 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4">
                <h3 className="text-xl font-bold">Catch as many <span className="text-primary">BEMORA</span> logos as you can!</h3>
                <p className="text-muted-foreground mb-4">Click on the logo quickly before it escapes. You only have 30 seconds!</p>
                <Button 
                  onClick={startGame} 
                  disabled={startButtonDisabled}
                  className="bg-primary hover:bg-primary/90 relative overflow-hidden group"
                >
                  <span className="relative z-10">Start Game!</span>
                  <span className="absolute inset-0 bg-secondary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                </Button>
              </div>
            )}

            {!gameActive && timeLeft === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4 bg-background/80">
                <h3 className="text-xl font-bold">Game Over!</h3>
                <p className="text-2xl font-bold mb-2">Your Score: <span className="text-primary">{score}</span></p>
                <p className="text-muted-foreground mb-4">
                  {score < 5 ? "Try again! You can do better!" : 
                   score < 10 ? "Good job! Keep improving!" : 
                   score < 15 ? "Amazing! You're a great player!" : 
                   "Incredible! You're a true champion!"}
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={startGame} 
                    disabled={startButtonDisabled}
                    className="bg-primary hover:bg-primary/90 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Play Again</span>
                    <span className="absolute inset-0 bg-secondary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                  </Button>
                </div>
              </div>
            )}

            {gameActive && (
              <div 
                style={{
                  position: 'absolute',
                  left: `${robotPosition.x}px`, 
                  top: `${robotPosition.y}px`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-out'
                }}
                onClick={catchRobot}
              >
                <RobotLogo size={60} className="text-primary hover:text-secondary transition-colors game-robot" />
              </div>
            )}

            {/* Grid pattern for game area */}
            <div className="absolute inset-0 grid-pattern opacity-50"></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}