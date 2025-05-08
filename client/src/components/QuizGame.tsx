import { useState, useRef, useEffect } from "react";
import { X, Brain, CheckCircle, AlertCircle, ExternalLink, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Import Adventure Time character images
import BMO from "@assets/image_1746719364511.png";
import PrincessBubblegum from "@assets/image_1746719383050.png";
import Hunson from "@assets/image_1746719401970.png";
import FinnAndJake from "@assets/image_1746719423836.png";
import TheLich from "@assets/image_1746719438865.png";
import Tree from "@assets/image_1746719477871.png";
import Marceline from "@assets/image_1746719506278.png";
import PrincessBubbleGum2 from "@assets/image_1746719536526.png";
import Finn from "@assets/image_1746719560491.png";
import Jake from "@assets/image_1746719590160.png";

// Website quiz questions
const websiteQuestions = [
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
  },
  {
    question: "Which messaging platform has a BEMORA community group?",
    options: ["Telegram", "WhatsApp", "Discord", "Signal"],
    correctAnswer: "WhatsApp"
  },
  {
    question: "What game can you play on BEMORA's website?",
    options: ["Sudoku", "Crossword", "Catch the Logo", "Word Puzzle"],
    correctAnswer: "Catch the Logo"
  },
  {
    question: "What social media platform does BEMORA use with an 'X' logo?",
    options: ["Facebook", "Instagram", "Twitter/X", "LinkedIn"],
    correctAnswer: "Twitter/X"
  },
  {
    question: "What feature is available in the hero section of BEMORA's website?",
    options: ["Live chat", "Newsletter signup", "Promotional video", "Location map"],
    correctAnswer: "Promotional video"
  },
  {
    question: "What analytics tool was recently added to BEMORA's website?",
    options: ["Google Analytics", "Vercel Analytics", "Hotjar", "Mixpanel"],
    correctAnswer: "Vercel Analytics"
  },
  {
    question: "Who designed the BEMORA website?",
    options: ["Ahmed", "Mostafa", "Sara", "Khaled"],
    correctAnswer: "Mostafa"
  },
  {
    question: "What happens when you click 'Designed by' in the footer?",
    options: ["Opens email", "Opens LinkedIn profile", "Makes a phone call", "Nothing"],
    correctAnswer: "Makes a phone call"
  },
  {
    question: "How many main sections are in the navigation bar?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "5"
  },
  {
    question: "What animation library is used on the BEMORA website?",
    options: ["Anime.js", "GSAP", "Framer Motion", "Lottie"],
    correctAnswer: "Framer Motion"
  },
  {
    question: "Which section showcases BEMORA's content from different platforms?",
    options: ["Hero Section", "About Section", "Content Showcase", "Connect Section"],
    correctAnswer: "Content Showcase"
  },
  {
    question: "What is the name of BEMORA's YouTube channel URL?",
    options: ["@BEMORA-Official", "@Bemora-site", "@BEMORA_Channel", "@BEMORA-TV"],
    correctAnswer: "@Bemora-site"
  },
  {
    question: "Which styling framework is used for BEMORA's website?",
    options: ["Bootstrap", "Material UI", "Tailwind CSS", "Bulma"],
    correctAnswer: "Tailwind CSS"
  },
  {
    question: "What database is used to store game scores on BEMORA's website?",
    options: ["MongoDB", "MySQL", "PostgreSQL", "Firebase"],
    correctAnswer: "PostgreSQL"
  },
  {
    question: "Which deployment platform is recommended for BEMORA's website?",
    options: ["Netlify", "GitHub Pages", "Vercel", "AWS"],
    correctAnswer: "Vercel"
  },
  {
    question: "What type of input is required to play BEMORA's games?",
    options: ["Email address", "Full name", "Nickname or username", "Phone number"],
    correctAnswer: "Nickname or username"
  }
];

// Adventure Time character questions
const adventureTimeQuestions = [
  {
    question: "Who is this character?",
    image: BMO,
    options: ["Princess Bubblegum", "BMO", "Ice King", "Gunter"],
    correctAnswer: "BMO"
  },
  {
    question: "Who is this character?",
    image: PrincessBubblegum,
    options: ["Princess Bubblegum", "Flame Princess", "Lumpy Space Princess", "Marceline"],
    correctAnswer: "Princess Bubblegum"
  },
  {
    question: "Who is this character?",
    image: Hunson,
    options: ["Magic Man", "Hunson Abadeer", "Death", "The Lich"],
    correctAnswer: "Hunson Abadeer"
  },
  {
    question: "Who are these characters?",
    image: FinnAndJake,
    options: ["Finn and Cake", "Billy and Jake", "Finn and Jake", "Simon and Gunter"],
    correctAnswer: "Finn and Jake"
  },
  {
    question: "Who is this villain?",
    image: TheLich,
    options: ["Ice King", "The Lich", "Hunson Abadeer", "Golb"],
    correctAnswer: "The Lich"
  },
  {
    question: "Who is this character?",
    image: Tree,
    options: ["Tree Trunks", "Mr. Pig", "Shelby", "Cinnamon Bun"],
    correctAnswer: "Tree Trunks"
  },
  {
    question: "Who is this character?",
    image: Marceline,
    options: ["Flame Princess", "Marceline", "Fionna", "Huntress Wizard"],
    correctAnswer: "Marceline"
  },
  {
    question: "Who is this princess?",
    image: PrincessBubbleGum2,
    options: ["Princess Bubblegum", "Flame Princess", "Lumpy Space Princess", "Breakfast Princess"],
    correctAnswer: "Princess Bubblegum"
  },
  {
    question: "Who is this character?",
    image: Finn,
    options: ["Finn", "Fern", "Simon", "Jake"],
    correctAnswer: "Finn"
  },
  {
    question: "Who is this character?",
    image: Jake,
    options: ["BMO", "Gunter", "Finn", "Jake"],
    correctAnswer: "Jake"
  }
];

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  image?: string;
}

export function QuizGame() {
  // Game state
  const [isOpen, setIsOpen] = useState(false);
  const [quizType, setQuizType] = useState<"website" | "adventure">("website");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"start" | "question" | "result" | "feedback">("start");
  const [answerFeedback, setAnswerFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [topPlayers, setTopPlayers] = useState<Array<{name: string, score: number}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Select random questions when quiz type changes
  useEffect(() => {
    if (quizType === "website") {
      // Randomly select 5 questions from the website questions
      const shuffled = [...websiteQuestions].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 5));
    } else {
      // Use all adventure time questions
      setQuestions(adventureTimeQuestions);
    }
  }, [quizType]);

  // Reset game when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetGame();
    }
  }, [isOpen]);

  // Fetch top players
  useEffect(() => {
    if (gameState === "result") {
      fetchTopPlayers();
    }
  }, [gameState, quizType]);

  // Reset game
  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setGameState("start");
    setAnswerFeedback(null);
    
    // Randomly select 5 questions from the website questions
    if (quizType === "website") {
      const shuffled = [...websiteQuestions].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 5));
    }
  };

  // Fetch top players function
  const fetchTopPlayers = async () => {
    try {
      const response = await apiRequest(`/api/games/top-players/quiz-${quizType}?limit=5`, {
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
          game_type: `quiz-${quizType}`,
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

  // Start game after registration
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

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    
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
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setGameState("question");
    } else {
      setGameState("result");
      
      // Log game completion
      console.log("Game completed", {
        name: playerName,
        email: playerEmail || "Not provided",
        score: score,
        quizType: quizType
      });
    }
  };

  // Change quiz type
  const handleQuizTypeChange = (type: "website" | "adventure") => {
    setQuizType(type);
    resetGame();
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
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background/95 backdrop-blur-sm border-secondary/20">
          <DialogTitle className="sr-only">BEMORA Quiz Game</DialogTitle>
          <DialogDescription className="sr-only">
            Test your knowledge about BEMORA and Adventure Time!
          </DialogDescription>
          
          {/* Game header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold"><span className="text-secondary">BEMORA</span> Quiz</h2>
              {gameState !== "start" && (
                <div className="flex gap-4 text-sm font-mono">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-secondary">Score:</span>
                    <span className="font-bold">{score}/{questions.length}</span>
                  </div>
                  {gameState === "question" && (
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-primary">Question:</span>
                      <span className="font-bold">{currentQuestion + 1}/{questions.length}</span>
                    </div>
                  )}
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
                    <p className="text-muted-foreground mb-8">
                      Test your knowledge about BEMORA and Adventure Time characters!
                    </p>
                  </div>

                  <Tabs defaultValue="website" onValueChange={(value) => handleQuizTypeChange(value as "website" | "adventure")} className="w-full mb-6">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="website" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        <span>Website Quiz</span>
                      </TabsTrigger>
                      <TabsTrigger value="adventure" className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span>Adventure Time</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="website" className="mt-4 p-4 border rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Answer questions about BEMORA's website and social media platforms.
                        We'll randomly select 5 questions from our collection.
                      </p>
                    </TabsContent>
                    <TabsContent value="adventure" className="mt-4 p-4 border rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Can you identify all the Adventure Time characters from the images?
                        Test your knowledge of the show!
                      </p>
                    </TabsContent>
                  </Tabs>

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
                  </div>

                  <Button 
                    onClick={startGame}
                    className="bg-secondary hover:bg-secondary/90 w-full mt-4 max-w-md mx-auto"
                    disabled={!playerName.trim()}
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
                    <p className="text-lg mb-6">{questions[currentQuestion].question}</p>
                    
                    {quizType === "adventure" && questions[currentQuestion].image && (
                      <div className="flex justify-center mb-6">
                        <img 
                          src={questions[currentQuestion].image} 
                          alt="Adventure Time Character" 
                          className="max-h-64 rounded-lg border-4 border-primary shadow-lg"
                        />
                      </div>
                    )}
                    
                    <RadioGroup 
                      value={selectedAnswer} 
                      onValueChange={setSelectedAnswer}
                      className="space-y-3"
                    >
                      {questions[currentQuestion].options.map((option) => (
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
                        Great job! You know your stuff.
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-16 w-16 text-red-500" />
                      <h3 className="text-xl font-bold text-red-500">Incorrect</h3>
                      <p className="text-muted-foreground">
                        The correct answer is: <span className="font-bold">{questions[currentQuestion].correctAnswer}</span>
                      </p>
                    </>
                  )}
                  
                  <Button 
                    onClick={nextQuestion}
                    className="bg-primary hover:bg-primary/90 mt-4"
                  >
                    {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
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
                    {score} / {questions.length}
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    {score === questions.length ? "Perfect score! You're amazing!" : 
                     score >= questions.length * 0.7 ? "Great job! You know a lot!" : 
                     score >= questions.length * 0.4 ? "Good effort! Keep learning more." : 
                     "Don't worry! You'll do better next time."}
                  </p>
                  
                  {/* Leaderboard */}
                  {topPlayers.length > 0 && (
                    <div className="w-full max-w-md mb-4">
                      <h4 className="font-bold mb-2">Top Players - {quizType === "website" ? "Website Quiz" : "Adventure Time Quiz"}</h4>
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
                  
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button 
                      onClick={submitScore}
                      className="bg-secondary hover:bg-secondary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Score"}
                    </Button>
                    <Button 
                      onClick={() => {
                        resetGame();
                        setGameState("question");
                      }}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Play Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetGame();
                        setGameState("start");
                      }}
                    >
                      Change Quiz Type
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