import { useState, useRef } from "react";
import { X, Brain, CheckCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";

// Quiz questions
const quizQuestions = [
  {
    question: "What is the main platform where BEMORA publishes content?",
    options: ["Instagram", "YouTube", "TikTok", "Snapchat"],
    correctAnswer: "YouTube"
  },
  {
    question: "What color scheme is prominent in BEMORA's branding?",
    options: ["Red and Blue", "Green and Yellow", "Turquoise and Pink", "Purple and Orange"],
    correctAnswer: "Turquoise and Pink"
  },
  {
    question: "What type of content does BEMORA typically create?",
    options: ["Cooking tutorials", "Gaming videos", "Adventure and entertainment", "Financial advice"],
    correctAnswer: "Adventure and entertainment"
  },
  {
    question: "What character is associated with BEMORA's brand?",
    options: ["A robot", "A dragon", "A superhero", "A chef"],
    correctAnswer: "A robot"
  },
  {
    question: "What is the best way to support BEMORA?",
    options: ["Follow on social media", "Subscribe to channels", "Share content with friends", "All of the above"],
    correctAnswer: "All of the above"
  }
];

export function QuizGame() {
  // Game state
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"start" | "question" | "result" | "feedback">("start");
  const [answerFeedback, setAnswerFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset game
  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setGameState("start");
    setAnswerFeedback(null);
  };

  // Close dialog handler
  const handleClose = () => {
    setIsOpen(false);
    resetGame();
  };

  // Start game
  const startGame = () => {
    if (!playerName.trim()) {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
      return;
    }
    setGameState("question");
  };

  // Check answer and move to next question
  const checkAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === quizQuestions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      setAnswerFeedback("correct");
    } else {
      setAnswerFeedback("incorrect");
    }
    
    setGameState("feedback");
  };

  // Move to next question or results
  const nextQuestion = () => {
    setSelectedAnswer("");
    setAnswerFeedback(null);
    
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setGameState("question");
    } else {
      setGameState("result");
      
      // Here we would typically send the player data to the server
      console.log("Game completed", {
        name: playerName,
        email: playerEmail || "Not provided",
        score: score
      });
      
      // In a real implementation, we would send this data to the server
      // submitQuizResults(playerName, playerEmail, score);
    }
  };

  return (
    <>
      {/* Game button */}
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full bg-secondary/10 border-secondary text-secondary hover:bg-secondary/20 shine-effect flex items-center gap-2 px-8 py-3 justify-center"
      >
        <Brain className="h-5 w-5" />
        <span className="font-semibold">Test Your Knowledge</span>
      </Button>

      {/* Game dialog */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md md:max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background/95 backdrop-blur-sm border-secondary/20">
          <DialogTitle className="sr-only">BEMORA Quiz Game</DialogTitle>
          <DialogDescription className="sr-only">
            Test your knowledge about BEMORA!
          </DialogDescription>
          
          {/* Game header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold"><span className="text-secondary">BEMORA</span> Quiz</h2>
              {gameState !== "start" && (
                <div className="flex gap-4 text-sm font-mono">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-secondary">Score:</span>
                    <span className="font-bold">{score}/{quizQuestions.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-primary">Question:</span>
                    <span className="font-bold">{currentQuestion + 1}/{quizQuestions.length}</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Game area */}
          <div className="p-6 flex flex-col">
            <AnimatePresence mode="wait">
              {/* Start screen */}
              {gameState === "start" && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">Welcome to the <span className="text-secondary">BEMORA</span> Quiz!</h3>
                    <p className="text-muted-foreground mb-4">
                      Answer 5 questions to test your knowledge about BEMORA. Let's see how big of a fan you are!
                    </p>
                  </div>

                  <div className="grid gap-4">
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
                      <Label htmlFor="player-email">Your Email (for updates, optional)</Label>
                      <Input 
                        id="player-email" 
                        type="email"
                        value={playerEmail} 
                        onChange={(e) => setPlayerEmail(e.target.value)} 
                        placeholder="your.email@example.com"
                      />
                      <p className="text-xs text-muted-foreground">We'll use this to send you updates about new content and games.</p>
                    </div>
                  </div>

                  <Button 
                    onClick={startGame}
                    className="bg-secondary hover:bg-secondary/90 w-full mt-4"
                  >
                    Start Quiz
                  </Button>
                </motion.div>
              )}

              {/* Question screen */}
              {gameState === "question" && (
                <motion.div
                  key={`question-${currentQuestion}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="flex flex-col gap-6"
                >
                  <div>
                    <h3 className="text-xl font-bold mb-4">Question {currentQuestion + 1}</h3>
                    <p className="text-lg mb-6">{quizQuestions[currentQuestion].question}</p>
                    
                    <RadioGroup 
                      value={selectedAnswer} 
                      onValueChange={setSelectedAnswer}
                      className="space-y-3"
                    >
                      {quizQuestions[currentQuestion].options.map((option) => (
                        <div key={option} className="flex items-center space-x-2 border border-border rounded-md p-3 hover:bg-muted transition-colors">
                          <RadioGroupItem value={option} id={option} />
                          <Label htmlFor={option} className="flex-1 cursor-pointer">{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Button 
                    onClick={checkAnswer}
                    disabled={!selectedAnswer}
                    className="bg-secondary hover:bg-secondary/90 mt-4"
                  >
                    Submit Answer
                  </Button>
                </motion.div>
              )}

              {/* Feedback screen */}
              {gameState === "feedback" && (
                <motion.div
                  key={`feedback-${currentQuestion}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-6 text-center py-8"
                >
                  {answerFeedback === "correct" ? (
                    <>
                      <CheckCircle className="h-16 w-16 text-green-500" />
                      <h3 className="text-xl font-bold text-green-500">Correct!</h3>
                      <p className="text-muted-foreground">
                        Great job! You know your BEMORA facts.
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-16 w-16 text-red-500" />
                      <h3 className="text-xl font-bold text-red-500">Incorrect</h3>
                      <p className="text-muted-foreground">
                        The correct answer is: <span className="font-bold">{quizQuestions[currentQuestion].correctAnswer}</span>
                      </p>
                    </>
                  )}
                  
                  <Button 
                    onClick={nextQuestion}
                    className="bg-primary hover:bg-primary/90 mt-4"
                  >
                    {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "See Results"}
                  </Button>
                </motion.div>
              )}

              {/* Results screen */}
              {gameState === "result" && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center gap-6 text-center py-8"
                >
                  <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                  <p className="text-xl">
                    <span className="font-bold text-secondary">{playerName}</span>, your score is:
                  </p>
                  <div className="text-4xl font-bold text-primary mb-4">
                    {score} / {quizQuestions.length}
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    {score === 5 ? "Perfect score! You're a true BEMORA fan!" : 
                     score >= 3 ? "Great job! You know BEMORA well!" : 
                     score >= 1 ? "Good effort! Learn more about BEMORA by following their channels." : 
                     "Don't worry! Follow BEMORA on social media to learn more."}
                  </p>
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={resetGame}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      Play Again
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleClose}
                    >
                      Close
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