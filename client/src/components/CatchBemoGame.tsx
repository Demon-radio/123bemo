import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
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
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const moveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset game state
  const resetGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(false);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (moveTimerRef.current) clearInterval(moveTimerRef.current);
  };

  // Start game
  const startGame = () => {
    resetGame();
    setGameActive(true);
    
    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(gameTimerRef.current as NodeJS.Timeout);
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start robot movement
    moveRobot();
    moveTimerRef.current = setInterval(moveRobot, 1500);
  };

  // Move robot randomly
  const moveRobot = () => {
    if (!gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    const maxX = gameArea.width - 60; // Robot width
    const maxY = gameArea.height - 60; // Robot height
    
    const newX = Math.floor(Math.random() * maxX);
    const newY = Math.floor(Math.random() * maxY);
    
    setRobotPosition({ x: newX, y: newY });
  };

  // Handle robot click
  const catchRobot = () => {
    if (!gameActive) return;
    setScore((prev) => prev + 1);
    moveRobot(); // Move immediately after catch
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
                <Button onClick={startGame} className="bg-primary hover:bg-primary/90">
                  Start Game!
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
                  <Button onClick={startGame} className="bg-primary hover:bg-primary/90">
                    Play Again
                  </Button>
                </div>
              </div>
            )}

            {gameActive && (
              <motion.div
                animate={{ x: robotPosition.x, y: robotPosition.y }}
                transition={{ type: "spring", damping: 10, stiffness: 100 }}
                className="absolute cursor-pointer"
                onClick={catchRobot}
              >
                <RobotLogo size={60} className="text-primary hover:text-secondary transition-colors" />
              </motion.div>
            )}

            {/* Grid pattern for game area */}
            <div className="absolute inset-0 grid-pattern opacity-50"></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}