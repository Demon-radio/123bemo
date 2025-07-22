import { useState, useRef, useEffect } from "react";
import { X, Swords, Trophy, AlertTriangle, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AudioManager } from "@/lib/audioManager";
import { submitGameSession, type GameResult } from "@/lib/pointsSystem";
import { PlayerPointsDisplay } from "./PlayerPointsDisplay";

// Adventure Time battle questions
const battleQuestions = [
  {
    question: "What is the real name of the Lich in Adventure Time?",
    options: ["Lich King", "Ling of Ooo", "Death", "Golb"],
    correctAnswer: "Ling of Ooo"
  },
  {
    question: "Which character was created from the Lich?",
    options: ["Sweet P", "Sweet Bee", "Fern", "Gumbald"],
    correctAnswer: "Sweet Bee"
  },
  {
    question: "Who are the gender-swapped versions of Finn and Jake?",
    options: ["Fionna and Cake", "Bonnie and Neddy", "Susan and Frieda", "Marceline and Bubblegum"],
    correctAnswer: "Fionna and Cake"
  },
  {
    question: "What is BMO's full name?",
    options: ["Binary Matrix Operator", "Be MOre", "Beemo", "Basic Memory Organism"],
    correctAnswer: "Be MOre"
  },
  {
    question: "What creature is Ice King's companion?",
    options: ["Gunter", "Flambo", "Shelby", "Peppermint Butler"],
    correctAnswer: "Gunter"
  },
  {
    question: "Who rules the Candy Kingdom?",
    options: ["Ice King", "Princess Bubblegum", "Hunson Abadeer", "Flame Princess"],
    correctAnswer: "Princess Bubblegum"
  },
  {
    question: "What is Finn's last name?",
    options: ["The Human", "Mertens", "Adventure", "Campbell"],
    correctAnswer: "Mertens"
  },
  {
    question: "What instrument does Marceline play?",
    options: ["Guitar", "Drums", "Bass", "Keyboard"],
    correctAnswer: "Bass"
  },
  {
    question: "Which princess was Finn's first crush?",
    options: ["Princess Bubblegum", "Flame Princess", "Huntress Wizard", "Slime Princess"],
    correctAnswer: "Princess Bubblegum"
  },
  {
    question: "What is the name of Jake and Lady Rainicorn's daughter?",
    options: ["Charlie", "Viola", "Jake Jr.", "T.V."],
    correctAnswer: "Charlie"
  },
  {
    question: "What kingdom does Flame Princess rule?",
    options: ["Fire Kingdom", "Flame Empire", "Molten Lands", "Cinder Realm"],
    correctAnswer: "Fire Kingdom"
  },
  {
    question: "Who is Marceline's father?",
    options: ["Hunson Abadeer", "The Lich", "Death", "Simon Petrikov"],
    correctAnswer: "Hunson Abadeer"
  },
  {
    question: "What is BMO's favorite game?",
    options: ["Adventure Master", "Kompy's Castle", "Bug Battle", "Football"],
    correctAnswer: "Football"
  },
  {
    question: "Who was the Ice King before he found the crown?",
    options: ["Simon Petrikov", "Gunter", "Evergreen", "Normal Man"],
    correctAnswer: "Simon Petrikov"
  },
  {
    question: "What is the name of Jake's shape-shifting ability?",
    options: ["Stretchy Power", "Elastic Magic", "Morphing Mutation", "Dimensional Stretching"],
    correctAnswer: "Stretchy Power"
  }
];

export function BattleGame() {
  // Game state
  const [isOpen, setIsOpen] = useState(false);
  const [gameState, setGameState] = useState<"register" | "battle" | "result">("register");
  const [playerName, setPlayerName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalRounds] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [countdown, setCountdown] = useState(10);
  const [showResult, setShowResult] = useState(false);
  const [roundResult, setRoundResult] = useState<"win" | "lose" | "tie" | null>(null);
  const [roundExplanation, setRoundExplanation] = useState("");
  const [gameHistory, setGameHistory] = useState<Array<{round: number, playerAnswer: string, aiAnswer: string, correct: string, result: string}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [winMessage, setWinMessage] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const audioManager = AudioManager.getInstance();

  // Timer effect
  useEffect(() => {
    if (gameState !== "battle" || showResult || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, countdown, showResult]);

  // Reset game when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetGame();
    }
  }, [isOpen]);

  // Handle when time is up
  const handleTimeUp = () => {
    if (!currentQuestion) return;
    
    const correctAnswer = battleQuestions[currentQuestion].correctAnswer;
    const aiAnswer = getAIAnswer(correctAnswer);
    
    // Player didn't answer in time
    const result: "win" | "lose" | "tie" = aiAnswer === correctAnswer ? "lose" : "tie";
    
    if (aiAnswer === correctAnswer) {
      setAiScore(aiScore + 1);
      // Play game over sound when AI wins by timeout
      audioManager.playGameOverSound();
    }
    
    setRoundResult(result);
    setRoundExplanation(getExplanation(null, aiAnswer, correctAnswer));
    
    // Add to history
    setGameHistory([
      ...gameHistory,
      {
        round: roundNumber,
        playerAnswer: "No answer (time up)",
        aiAnswer,
        correct: correctAnswer,
        result: result === "lose" ? "AI won" : "Tie"
      }
    ]);
    
    setShowResult(true);
  };

  // Reset game
  const resetGame = () => {
    setGameState("register");
    setPlayerScore(0);
    setAiScore(0);
    setRoundNumber(1);
    setCurrentQuestion(null);
    setSelectedAnswer("");
    setCountdown(10);
    setShowResult(false);
    setRoundResult(null);
    setRoundExplanation("");
    setGameHistory([]);
    setSessionStartTime(0);
  };

  // Get AI answer - sometimes correct, sometimes wrong
  const getAIAnswer = (correctAnswer: string) => {
    const question = battleQuestions[currentQuestion!];
    
    // AI has 70% chance to get the answer right
    if (Math.random() < 0.7) {
      return correctAnswer;
    } else {
      // Return a random wrong answer
      const wrongOptions = question.options.filter(opt => opt !== correctAnswer);
      return wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    }
  };

  // Get explanation for the round result
  const getExplanation = (playerAnswer: string | null, aiAnswer: string, correctAnswer: string) => {
    if (!playerAnswer) {
      return `You ran out of time! The AI chose "${aiAnswer}". The correct answer was "${correctAnswer}".`;
    }
    
    if (playerAnswer === correctAnswer && aiAnswer !== correctAnswer) {
      return `You were right! The AI chose "${aiAnswer}", but the correct answer was "${correctAnswer}".`;
    } else if (playerAnswer !== correctAnswer && aiAnswer === correctAnswer) {
      return `The AI was right! You chose "${playerAnswer}", but the correct answer was "${correctAnswer}".`;
    } else if (playerAnswer === correctAnswer && aiAnswer === correctAnswer) {
      return `Both you and the AI chose the correct answer: "${correctAnswer}".`;
    } else {
      return `Both you and the AI were wrong! You chose "${playerAnswer}", the AI chose "${aiAnswer}", but the correct answer was "${correctAnswer}".`;
    }
  };

  // Submit final score
  const submitScore = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('/api/games/submit-score', {
        method: 'POST',
        body: JSON.stringify({
          name: playerName,
          email: playerEmail || null,
          game_type: 'battle',
          score: playerScore
        })
      });
      
      if (response.success) {
        toast({
          title: "Score submitted!",
          description: "Your battle score has been saved.",
        });
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

  // Start game
  const startGame = () => {
    if (!playerName.trim()) {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
      return;
    }
    
    setGameState("battle");
    setSessionStartTime(Date.now());
    startNewRound();
  };
  
  // Submit score with points system
  const submitScoreWithPoints = async () => {
    if (!playerName.trim()) {
      toast({
        title: "اسم مطلوب",
        description: "يرجى إدخال اسمك لحفظ النتيجة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate session duration
      const sessionDuration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
      
      // Submit to points system
      const gameResult: GameResult = {
        playerName,
        gameType: 'battle',
        score: playerScore * 1500, // Convert to points (each win = 1500 points)
        levelReached: roundNumber,
        sessionDuration,
        completed: true
      };
      
      const pointsResult = await submitGameSession(gameResult);
      
      if (pointsResult.success) {
        toast({
          title: "تم حفظ النقاط!",
          description: `حصلت على ${pointsResult.pointsEarned} نقطة! نتيجتك: ${playerScore} انتصار`,
        });
        
        // Show points dialog
        setShowPointsDialog(true);
      } else {
        // Fallback to old score submission
        await submitScore();
      }
      
    } catch (error) {
      console.error("Error submitting battle score:", error);
      toast({
        title: "خطأ في الشبكة",
        description: "فشل في حفظ النتيجة بسبب خطأ في الشبكة.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start a new round
  const startNewRound = () => {
    // Get a random question that hasn't been used yet
    const usedQuestions = gameHistory.map(h => battleQuestions.findIndex(q => q.correctAnswer === h.correct));
    
    // Create an array of indexes 0 to battleQuestions.length-1
    const allIndexes = Array.from({ length: battleQuestions.length }, (_, i) => i);
    
    // Filter out the used questions
    let availableQuestions = allIndexes.filter(i => !usedQuestions.includes(i));
    
    // If we're out of questions, just use all of them again
    if (availableQuestions.length === 0) {
      availableQuestions = allIndexes;
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    setCurrentQuestion(availableQuestions[randomIndex]);
    setSelectedAnswer("");
    setCountdown(10);
    setShowResult(false);
    setRoundResult(null);
    setRoundExplanation("");
  };

  // Submit player answer
  const submitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    const correctAnswer = battleQuestions[currentQuestion].correctAnswer;
    const aiAnswer = getAIAnswer(correctAnswer);
    
    let result: "win" | "lose" | "tie" = "tie";
    
    if (selectedAnswer === correctAnswer && aiAnswer !== correctAnswer) {
      result = "win";
      setPlayerScore(playerScore + 1);
    } else if (selectedAnswer !== correctAnswer && aiAnswer === correctAnswer) {
      result = "lose";
      setAiScore(aiScore + 1);
    } else if (selectedAnswer === correctAnswer && aiAnswer === correctAnswer) {
      // Both correct - tie
      setPlayerScore(playerScore + 1);
      setAiScore(aiScore + 1);
    }
    
    setRoundResult(result);
    setRoundExplanation(getExplanation(selectedAnswer, aiAnswer, correctAnswer));
    
    // Add to history
    setGameHistory([
      ...gameHistory,
      {
        round: roundNumber,
        playerAnswer: selectedAnswer,
        aiAnswer,
        correct: correctAnswer,
        result: result === "win" ? "Player won" : result === "lose" ? "AI won" : "Tie"
      }
    ]);
    
    setShowResult(true);
  };

  // Continue to next round
  const nextRound = () => {
    if (roundNumber >= totalRounds) {
      // Game over
      let message = "";
      if (playerScore > aiScore) {
        message = "Congratulations! You defeated the AI!";
      } else if (playerScore < aiScore) {
        message = "The AI won this time. Better luck next time!";
      } else {
        message = "It's a tie! You and the AI are evenly matched.";
      }
      
      setWinMessage(message);
      setGameState("result");
    } else {
      // Next round
      setRoundNumber(roundNumber + 1);
      startNewRound();
    }
  };

  return (
    <>
      {/* Game button */}
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full bg-orange-600/10 border-orange-600 text-orange-600 hover:bg-orange-600/20 shine-effect flex items-center gap-2 px-8 py-3 justify-center"
      >
        <Swords className="h-5 w-5" />
        <span className="font-semibold">Adventure Time Trivia</span>
      </Button>

      {/* Game dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background/95 backdrop-blur-sm border-orange-600/20">
          <DialogTitle className="sr-only">Adventure Time Trivia Battle</DialogTitle>
          <DialogDescription className="sr-only">
            Test your Adventure Time knowledge against BMO's AI! Answer questions about Fionna, Cake, Ling of Ooo, and Sweet Bee!
          </DialogDescription>
          
          {/* Game header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold"><span className="text-orange-600">Adventure Time</span> Trivia</h2>
              {gameState !== "register" && (
                <div className="flex gap-4 text-sm font-mono">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-primary">You:</span>
                    <span className="font-bold">{playerScore}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-orange-600">AI:</span>
                    <span className="font-bold">{aiScore}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">Round:</span>
                    <span className="font-bold">{roundNumber}/{totalRounds}</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Game area */}
          <div className="p-6 flex flex-col">
            <AnimatePresence mode="wait">
              {/* Registration screen */}
              {gameState === "register" && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">Adventure Time <span className="text-orange-600">Trivia Battle</span></h3>
                    <p className="text-muted-foreground mb-6">
                      Test your Adventure Time knowledge! Answer questions about Fionna, Cake, Ling of Ooo, and Sweet Bee faster and more accurately than BMO's AI to win.
                    </p>
                  </div>

                  <div className="w-full max-w-md space-y-4 mx-auto">
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
                    
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-md mt-4 border-2 border-black dark:border-white">
                      <h4 className="font-bold text-black dark:text-white text-base mb-2">How to play:</h4>
                      <ul className="text-sm space-y-1 list-disc pl-4 text-black dark:text-white font-bold">
                        <li>Answer 5 rounds of questions.</li>
                        <li>You have 10 seconds to answer each question.</li>
                        <li>Score a point when you get an answer right and the AI gets it wrong.</li>
                        <li>The AI scores a point when it's right and you're wrong.</li>
                        <li>Both get a point if both are correct.</li>
                        <li>No points if both are wrong.</li>
                      </ul>
                    </div>
                  </div>

                  <Button 
                    onClick={startGame}
                    className="bg-orange-600 hover:bg-orange-700 w-full mt-4 max-w-md mx-auto"
                    disabled={!playerName.trim()}
                  >
                    Start Battle
                  </Button>
                </motion.div>
              )}

              {/* Battle screen */}
              {gameState === "battle" && !showResult && currentQuestion !== null && (
                <motion.div
                  key={`battle-${roundNumber}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Round {roundNumber}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">Time:</span>
                      <span 
                        className={`text-sm font-mono ${
                          countdown <= 3 ? "text-red-500" : countdown <= 5 ? "text-orange-500" : ""
                        }`}
                      >
                        {countdown}s
                      </span>
                    </div>
                  </div>
                  
                  <Progress value={(countdown / 10) * 100} className="h-2" 
                    indicatorClassName={`${
                      countdown <= 3 ? "bg-red-500" : countdown <= 5 ? "bg-orange-500" : "bg-primary"
                    }`}
                  />
                  
                  <div className="py-4">
                    <h4 className="text-xl mb-6">{battleQuestions[currentQuestion].question}</h4>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {battleQuestions[currentQuestion].options.map((option) => (
                        <Button
                          key={option}
                          variant={selectedAnswer === option ? "default" : "outline"}
                          className={`justify-start text-left p-4 h-auto ${
                            selectedAnswer === option ? "border-primary" : "border-border"
                          }`}
                          onClick={() => setSelectedAnswer(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={submitAnswer}
                    disabled={!selectedAnswer}
                    className="bg-orange-600 hover:bg-orange-700 mt-4"
                  >
                    Submit Answer
                  </Button>
                </motion.div>
              )}

              {/* Round result screen */}
              {gameState === "battle" && showResult && (
                <motion.div
                  key={`result-${roundNumber}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-6 text-center py-8"
                >
                  {roundResult === "win" ? (
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Trophy className="h-10 w-10 text-green-500" />
                    </div>
                  ) : roundResult === "lose" ? (
                    <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <AlertTriangle className="h-10 w-10 text-red-500" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-blue-500" />
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold">
                    {roundResult === "win" 
                      ? "You win this round!" 
                      : roundResult === "lose" 
                        ? "AI wins this round!" 
                        : "It's a tie!"}
                  </h3>
                  
                  <p className="text-muted-foreground">
                    {roundExplanation}
                  </p>
                  
                  <div className="w-full max-w-md grid grid-cols-2 gap-4 bg-muted p-4 rounded-md">
                    <div className="text-center">
                      <p className="text-sm font-medium mb-1">Your Score</p>
                      <p className="text-2xl font-bold text-primary">{playerScore}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium mb-1">AI Score</p>
                      <p className="text-2xl font-bold text-orange-600">{aiScore}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={nextRound}
                    className="bg-orange-600 hover:bg-orange-700 mt-4"
                  >
                    {roundNumber >= totalRounds ? "See Final Results" : "Next Round"}
                  </Button>
                </motion.div>
              )}

              {/* Game over screen */}
              {gameState === "result" && (
                <motion.div
                  key="game-over"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center gap-6 text-center py-8"
                >
                  <h3 className="text-2xl font-bold mb-2">Battle Complete!</h3>
                  
                  <div className="w-full max-w-md grid grid-cols-2 gap-4 bg-muted p-6 rounded-md">
                    <div className="text-center">
                      <p className="text-sm font-medium mb-1">Your Final Score</p>
                      <p className="text-3xl font-bold text-primary">{playerScore}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium mb-1">AI Final Score</p>
                      <p className="text-3xl font-bold text-orange-600">{aiScore}</p>
                    </div>
                    
                    <div className="col-span-2 mt-4">
                      <div className={`p-3 rounded-md ${
                        playerScore > aiScore 
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" 
                          : playerScore < aiScore 
                            ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                      }`}>
                        <p className="font-medium">{winMessage}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full max-w-md mt-4">
                    <h4 className="font-bold mb-2 text-left">Battle History</h4>
                    <div className="bg-muted rounded-md overflow-hidden">
                      <div className="grid grid-cols-12 text-xs font-medium p-2 bg-muted-foreground/10">
                        <div className="col-span-1">Round</div>
                        <div className="col-span-4">Your Answer</div>
                        <div className="col-span-4">AI Answer</div>
                        <div className="col-span-3">Result</div>
                      </div>
                      <div className="divide-y divide-border">
                        {gameHistory.map((round, index) => (
                          <div key={index} className="grid grid-cols-12 text-xs p-2">
                            <div className="col-span-1">{round.round}</div>
                            <div className="col-span-4 truncate" title={round.playerAnswer}>{round.playerAnswer}</div>
                            <div className="col-span-4 truncate" title={round.aiAnswer}>{round.aiAnswer}</div>
                            <div className={`col-span-3 font-medium ${
                              round.result === "Player won" 
                                ? "text-green-600 dark:text-green-400" 
                                : round.result === "AI won" 
                                  ? "text-red-600 dark:text-red-400" 
                                  : ""
                            }`}>
                              {round.result}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button 
                      onClick={submitScoreWithPoints}
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "جاري الحفظ..." : "احفظ النتيجة"}
                    </Button>
                    <Button 
                      onClick={resetGame}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Play Again
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Points dialog */}
      {showPointsDialog && (
        <PlayerPointsDisplay
          isOpen={showPointsDialog}
          onClose={() => setShowPointsDialog(false)}
          playerName={playerName}
        />
      )}
    </>
  );
}