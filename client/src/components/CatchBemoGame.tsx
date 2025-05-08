import { useState, useEffect, useRef } from "react";
import { X, Gamepad } from "lucide-react";
import { RobotLogo } from "@/components/RobotLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function CatchBemoGame() {
  // Game state
  const [isOpen, setIsOpen] = useState(false);
  const [gameState, setGameState] = useState<"register" | "playing" | "gameover">("register");
  const [playerName, setPlayerName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [robotPosition, setRobotPosition] = useState({ x: 100, y: 100 });
  const [gameAreaSize, setGameAreaSize] = useState({ width: 400, height: 400 });
  const [topPlayers, setTopPlayers] = useState<Array<{name: string, score: number}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Reset game when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setScore(0);
      setTimeLeft(30);
      setGameActive(false);
      setGameState("register");
    }
  }, [isOpen]);

  // Handle game timer
  useEffect(() => {
    if (!gameActive) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameActive(false);
          setGameState("gameover");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive]);
  
  // Handle robot movement
  useEffect(() => {
    if (!gameActive) return;
    
    moveRobot();
    
    const moveInterval = setInterval(moveRobot, 1500);
    
    return () => clearInterval(moveInterval);
  }, [gameActive, gameAreaSize]);
  
  // Fetch top players
  useEffect(() => {
    if (gameState === "gameover") {
      fetchTopPlayers();
    }
  }, [gameState]);
  
  // Fetch top players function
  const fetchTopPlayers = async () => {
    try {
      const response = await apiRequest(`/api/games/top-players/catch?limit=5`, {
        method: 'GET'
      });
      
      if (response.success) {
        setTopPlayers(response.players);
      }
    } catch (error) {
      console.error('Failed to fetch top players:', error);
    }
  };
  
  // Submit score function
  const submitScore = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('/api/games/submit-score', {
        method: 'POST',
        body: JSON.stringify({
          name: playerName,
          email: playerEmail || null,
          game_type: 'catch',
          score: score
        })
      });
      
      if (response.success) {
        toast({
          title: "Score submitted!",
          description: "Your score has been saved.",
        });
        fetchTopPlayers();
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
      toast({
        title: "Failed to submit score",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Start game function
  const startRegistration = () => {
    setGameState("register");
    
    // Focus the name input
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 100);
  };
  
  // Start game after registration
  const startGame = () => {
    if (!playerName.trim()) {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
      return;
    }
    
    setGameState("playing");
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    
    // Measure game area
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
    
    if (maxX <= 0 || maxY <= 0) return;
    
    const newX = Math.floor(Math.random() * maxX);
    const newY = Math.floor(Math.random() * maxY);
    
    setRobotPosition({ x: newX, y: newY });
  };
  
  // Handle robot click
  const catchRobot = () => {
    if (!gameActive) return;
    
    setScore(prev => prev + 1);
    moveRobot();
  };

  return (
    <>
      {/* Game button */}
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
              {gameState === "playing" && (
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
              )}
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
            {/* Registration screen */}
            {gameState === "register" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4">
                <h3 className="text-xl font-bold">Catch <span className="text-primary">BEMORA</span> Game</h3>
                <p className="text-muted-foreground mb-4">Enter your details to start playing!</p>
                
                <div className="w-full max-w-md space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="player-name">Your Name or Nickname <span className="text-red-500">*</span></Label>
                    <Input 
                      id="player-name" 
                      ref={nameInputRef}
                      value={playerName} 
                      onChange={(e) => setPlayerName(e.target.value)} 
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="player-email">Your Email (optional)</Label>
                    <Input 
                      id="player-email" 
                      type="email"
                      value={playerEmail} 
                      onChange={(e) => setPlayerEmail(e.target.value)} 
                      placeholder="your.email@example.com"
                    />
                    <p className="text-xs text-muted-foreground">We'll use this to send you updates about new content.</p>
                  </div>
                  
                  <Button 
                    onClick={startGame} 
                    className="bg-primary hover:bg-primary/90 w-full mt-4"
                    disabled={!playerName.trim()}
                  >
                    Start Game
                  </Button>
                </div>
              </div>
            )}

            {/* Playing state */}
            {gameState === "playing" && (
              <>
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

                {/* Game instructions */}
                {gameActive && timeLeft >= 28 && (
                  <div className="absolute top-4 left-0 right-0 text-center">
                    <p className="bg-background/80 mx-auto inline-block px-4 py-2 rounded-full text-sm">
                      Click on the BEMORA logo as fast as you can!
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Game over screen */}
            {gameState === "gameover" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4 bg-background/80">
                <h3 className="text-xl font-bold">Game Over!</h3>
                <p className="text-2xl font-bold mb-2">
                  {playerName}, your score: <span className="text-primary">{score}</span>
                </p>
                <p className="text-muted-foreground mb-4">
                  {score < 5 ? "Try again! You can do better!" : 
                   score < 10 ? "Good job! Keep improving!" : 
                   score < 15 ? "Amazing! You're a great player!" : 
                   "Incredible! You're a true champion!"}
                </p>
                
                {/* Leaderboard */}
                {topPlayers.length > 0 && (
                  <div className="w-full max-w-md mb-4">
                    <h4 className="font-bold mb-2">Top Players</h4>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="grid grid-cols-4 text-sm font-medium pb-2 border-b border-border">
                        <div className="col-span-1 text-left">Rank</div>
                        <div className="col-span-2 text-left">Player</div>
                        <div className="col-span-1 text-right">Score</div>
                      </div>
                      {topPlayers.map((player, index) => (
                        <div key={index} className="grid grid-cols-4 text-sm py-2 border-b border-border/50 last:border-0">
                          <div className="col-span-1 text-left">{index + 1}</div>
                          <div className="col-span-2 text-left">{player.name}</div>
                          <div className="col-span-1 text-right">{player.score}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={submitScore}
                    className="bg-secondary hover:bg-secondary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Score"}
                  </Button>
                  <Button 
                    onClick={startGame}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Play Again
                  </Button>
                </div>
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