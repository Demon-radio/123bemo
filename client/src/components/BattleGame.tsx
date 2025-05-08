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

// Battle questions
const battleQuestions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris"
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars"
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctAnswer: "Leonardo da Vinci"
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: "Pacific Ocean"
  },
  {
    question: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
    correctAnswer: "Oxygen"
  },
  {
    question: "In which year did World War II end?",
    options: ["1943", "1945", "1947", "1950"],
    correctAnswer: "1945"
  },
  {
    question: "Which animal is known as the 'King of the Jungle'?",
    options: ["Tiger", "Elephant", "Lion", "Gorilla"],
    correctAnswer: "Lion"
  },
  {
    question: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Platinum"],
    correctAnswer: "Diamond"
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: "William Shakespeare"
  },
  {
    question: "What is the smallest prime number?",
    options: ["0", "1", "2", "3"],
    correctAnswer: "2"
  },
  {
    question: "Which of these is NOT a primary color?",
    options: ["Red", "Blue", "Green", "Yellow"],
    correctAnswer: "Green"
  },
  {
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "6"
  },
  {
    question: "Which country is home to the kangaroo?",
    options: ["New Zealand", "South Africa", "Australia", "Brazil"],
    correctAnswer: "Australia"
  },
  {
    question: "What is the main ingredient in guacamole?",
    options: ["Banana", "Avocado", "Cucumber", "Eggplant"],
    correctAnswer: "Avocado"
  },
  {
    question: "Which is the longest river in the world?",
    options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
    correctAnswer: "Nile"
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
  const [winMessage, setWinMessage] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    startNewRound();
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
        <span className="font-semibold">Battle of Knowledge</span>
      </Button>

      {/* Game dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background/95 backdrop-blur-sm border-orange-600/20">
          <DialogTitle className="sr-only">BEMORA Battle Game</DialogTitle>
          <DialogDescription className="sr-only">
            Test your knowledge in a battle against AI!
          </DialogDescription>
          
          {/* Game header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold"><span className="text-orange-600">Knowledge</span> Battle</h2>
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
                    <h3 className="text-xl font-bold mb-2">Battle of <span className="text-orange-600">Knowledge</span></h3>
                    <p className="text-muted-foreground mb-6">
                      Challenge the AI in a battle of knowledge! Answer questions faster and more accurately than the AI to win.
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
                    
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-md mt-4 border border-orange-200 dark:border-orange-800">
                      <h4 className="font-semibold text-black dark:text-white text-base mb-2">How to play:</h4>
                      <ul className="text-sm space-y-1 list-disc pl-4 text-black dark:text-white font-medium">
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
                      onClick={submitScore}
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Score"}
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
    </>
  );
}