import { useState, useEffect } from "react";
import { X, Gamepad } from "lucide-react";
import { RobotLogo } from "@/components/RobotLogo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function CatchBemoGame() {
  // Game state
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [robotPosition, setRobotPosition] = useState({ x: 100, y: 100 });
  const [gameAreaSize, setGameAreaSize] = useState({ width: 400, height: 400 });

  // Handle dialog open/close
  useEffect(() => {
    if (!isOpen) {
      // Reset game when dialog closes
      setScore(0);
      setTimeLeft(30);
      setGameActive(false);
    }
  }, [isOpen]);

  // Handle game timer
  useEffect(() => {
    // Only run if game is active
    if (!gameActive) return;
    
    // Start the timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // When timer reaches 0, end game
        if (prev <= 1) {
          clearInterval(timer);
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Cleanup timer on unmount or when game status changes
    return () => clearInterval(timer);
  }, [gameActive]);
  
  // Handle robot movement
  useEffect(() => {
    // Only run if game is active
    if (!gameActive) return;
    
    // Move robot initially
    moveRobot();
    
    // Set up interval for movement
    const moveInterval = setInterval(moveRobot, 1500);
    
    // Cleanup on unmount or when game status changes
    return () => clearInterval(moveInterval);
  }, [gameActive, gameAreaSize]);
  
  // Start game function
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    
    // Measure game area after a small delay to ensure DOM is ready
    setTimeout(() => {
      const gameArea = document.getElementById('game-area');
      if (gameArea) {
        const rect = gameArea.getBoundingClientRect();
        setGameAreaSize({
          width: rect.width,
          height: rect.height
        });
      }
    }, 100);
  };
  
  // Move robot to random position
  const moveRobot = () => {
    const robotSize = 60;
    const maxX = Math.max(0, gameAreaSize.width - robotSize - 20);
    const maxY = Math.max(0, gameAreaSize.height - robotSize - 20);
    
    // Ensure we have valid dimensions
    if (maxX <= 0 || maxY <= 0) return;
    
    const newX = Math.floor(Math.random() * maxX);
    const newY = Math.floor(Math.random() * maxY);
    
    setRobotPosition({ x: newX, y: newY });
  };
  
  // Handle robot click
  const catchRobot = () => {
    if (!gameActive) return;
    
    // Increment score
    setScore(prev => prev + 1);
    
    // Move robot to new position
    moveRobot();
  };

  return (
    <>
      {/* Game button in hero section */}
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full bg-primary/10 border-primary text-primary hover:bg-primary/20 shine-effect flex items-center gap-2 px-8 py-3 justify-center"
      >
        <Gamepad className="h-5 w-5" />
        <span className="font-semibold">Play with BEMORA</span>
      </Button>

      {/* Game dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl w-[90vw] h-[80vh] max-h-[600px] p-0 gap-0 bg-background/95 backdrop-blur-sm border-primary/20">
          <DialogTitle className="sr-only">Catch BEMORA Game</DialogTitle>
          <DialogDescription className="sr-only">
            Catch the BEMORA logo as many times as you can before the time runs out!
          </DialogDescription>
          
          {/* Game header */}
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

          {/* Game area */}
          <div 
            id="game-area"
            className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_center,rgba(12,219,219,0.05)_0,transparent_70%)]"
          >
            {/* Start screen */}
            {!gameActive && timeLeft === 30 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4">
                <h3 className="text-xl font-bold">Catch as many <span className="text-primary">BEMORA</span> logos as you can!</h3>
                <p className="text-muted-foreground mb-4">Click on the logo quickly before it escapes. You only have 30 seconds!</p>
                <Button 
                  onClick={startGame} 
                  className="bg-primary hover:bg-primary/90 relative overflow-hidden group"
                >
                  <span className="relative z-10">Start Game!</span>
                  <span className="absolute inset-0 bg-secondary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                </Button>
              </div>
            )}

            {/* Game over screen */}
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
                    className="bg-primary hover:bg-primary/90 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Play Again</span>
                    <span className="absolute inset-0 bg-secondary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                  </Button>
                </div>
              </div>
            )}

            {/* Active game - the robot logo */}
            {gameActive && (
              <div 
                style={{
                  position: 'absolute',
                  left: `${robotPosition.x}px`, 
                  top: `${robotPosition.y}px`,
                  zIndex: 10,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-out'
                }}
              >
                <button 
                  onClick={catchRobot}
                  className="bg-transparent border-0 p-0 m-0 cursor-pointer"
                >
                  <RobotLogo 
                    size={60} 
                    className="text-primary hover:text-secondary transition-colors game-robot" 
                  />
                </button>
              </div>
            )}

            {/* Grid pattern */}
            <div className="absolute inset-0 grid-pattern opacity-50"></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}