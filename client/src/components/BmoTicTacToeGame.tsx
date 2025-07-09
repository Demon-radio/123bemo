import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, RotateCcw, User, Bot } from "lucide-react";
import { trackGameStart, trackGameComplete } from "@/lib/analytics";

type Player = "X" | "O" | null;
type GameMode = "player" | "bot";
type Difficulty = "easy" | "medium" | "hard";

export function BmoTicTacToeGame() {
  const [isOpen, setIsOpen] = useState(false);
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [gameMode, setGameMode] = useState<GameMode>("player");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [winner, setWinner] = useState<Player | "tie" | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerXWins, setPlayerXWins] = useState(0);
  const [playerOWins, setPlayerOWins] = useState(0);
  const [ties, setTies] = useState(0);
  const [isThinking, setIsThinking] = useState(false);

  // BMO face animation state
  const [bmoExpression, setBmoExpression] = useState<"normal" | "happy" | "sad" | "thinking">("normal");

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  // Check for winner
  const checkWinner = (board: Player[]): Player | "tie" | null => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    
    if (board.every(cell => cell !== null)) {
      return "tie";
    }
    
    return null;
  };

  // Minimax algorithm for bot AI
  const minimax = (board: Player[], depth: number, isMaximizing: boolean, alpha: number = -Infinity, beta: number = Infinity): number => {
    const result = checkWinner(board);
    
    if (result === "O") return 10 - depth;
    if (result === "X") return depth - 10;
    if (result === "tie") return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = "O";
          const evaluation = minimax(board, depth + 1, false, alpha, beta);
          board[i] = null;
          maxEval = Math.max(maxEval, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break;
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = "X";
          const evaluation = minimax(board, depth + 1, true, alpha, beta);
          board[i] = null;
          minEval = Math.min(minEval, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) break;
        }
      }
      return minEval;
    }
  };

  // Get best move for bot
  const getBestMove = (board: Player[]): number => {
    let bestMove = -1;
    let bestValue = -Infinity;

    // Add some randomness based on difficulty
    const availableMoves = board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
    
    if (difficulty === "easy") {
      // 70% random moves
      if (Math.random() < 0.7) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
    } else if (difficulty === "medium") {
      // 30% random moves
      if (Math.random() < 0.3) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
    }

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "O";
        const moveValue = minimax(board, 0, false);
        board[i] = null;

        if (moveValue > bestValue) {
          bestValue = moveValue;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (board[index] || winner || isThinking) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
      setBmoExpression(gameResult === "O" ? "happy" : gameResult === "X" ? "sad" : "normal");
      
      // Update scores
      if (gameResult === "X") {
        setPlayerXWins(prev => prev + 1);
      } else if (gameResult === "O") {
        setPlayerOWins(prev => prev + 1);
      } else if (gameResult === "tie") {
        setTies(prev => prev + 1);
      }

      // Track game completion
      const finalScore = gameResult === "tie" ? 0 : (gameResult === "X" ? 1 : -1);
      trackGameComplete("BMO Tic-Tac-Toe", finalScore);
      return;
    }

    // Switch player
    if (gameMode === "player" || currentPlayer === "O") {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }

    // Bot move
    if (gameMode === "bot" && currentPlayer === "X") {
      setIsThinking(true);
      setBmoExpression("thinking");
      
      setTimeout(() => {
        const botMove = getBestMove(newBoard);
        if (botMove !== -1) {
          const botBoard = [...newBoard];
          botBoard[botMove] = "O";
          setBoard(botBoard);

          const botResult = checkWinner(botBoard);
          if (botResult) {
            setWinner(botResult);
            setBmoExpression(botResult === "O" ? "happy" : botResult === "X" ? "sad" : "normal");
            
            // Update scores
            if (botResult === "X") {
              setPlayerXWins(prev => prev + 1);
            } else if (botResult === "O") {
              setPlayerOWins(prev => prev + 1);
            } else if (botResult === "tie") {
              setTies(prev => prev + 1);
            }

            const finalScore = botResult === "tie" ? 0 : (botResult === "X" ? 1 : -1);
            trackGameComplete("BMO Tic-Tac-Toe", finalScore);
          } else {
            setCurrentPlayer("X");
            setBmoExpression("normal");
          }
        }
        setIsThinking(false);
      }, 1000);
    }
  };

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setBmoExpression("normal");
    setIsThinking(false);
  };

  // Start game
  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameStarted(true);
    resetGame();
    trackGameStart("BMO Tic-Tac-Toe");
  };

  // BMO Face Component
  const BmoFace = () => (
    <div className="relative w-32 h-32 mx-auto mb-4">
      {/* BMO Body */}
      <div className="w-full h-full bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-lg border-4 border-gray-700 relative">
        {/* Screen */}
        <div className="absolute top-3 left-3 right-3 h-16 bg-black rounded border-2 border-gray-600 flex items-center justify-center">
          {/* Eyes */}
          <div className="flex space-x-4">
            <motion.div 
              className={`w-3 h-3 rounded-full ${
                bmoExpression === "happy" ? "bg-green-400" : 
                bmoExpression === "sad" ? "bg-red-400" :
                bmoExpression === "thinking" ? "bg-yellow-400 animate-pulse" :
                "bg-blue-400"
              }`}
              animate={bmoExpression === "thinking" ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <motion.div 
              className={`w-3 h-3 rounded-full ${
                bmoExpression === "happy" ? "bg-green-400" : 
                bmoExpression === "sad" ? "bg-red-400" :
                bmoExpression === "thinking" ? "bg-yellow-400 animate-pulse" :
                "bg-blue-400"
              }`}
              animate={bmoExpression === "thinking" ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1, delay: 0.1 }}
            />
          </div>
        </div>

        {/* Mouth */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className={`w-6 h-2 border-2 border-gray-700 rounded-full ${
            bmoExpression === "happy" ? "border-t-0" :
            bmoExpression === "sad" ? "border-b-0" :
            "border-t-0"
          }`} />
        </div>

        {/* Buttons */}
        <div className="absolute bottom-2 left-2 flex space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full bg-cyan-600/10 border-cyan-600 text-cyan-600 hover:bg-cyan-600/20 shine-effect flex items-center gap-2 px-8 py-3 justify-center"
      >
        <Grid3X3 className="h-5 w-5" />
        <span className="font-semibold">BMO's X.O Game</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <span className="gradient-text">BMO's X.O Game</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <BmoFace />

            {!gameStarted ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2">Choose Game Mode</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Play the classic X.O game on BMO's screen!
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => startGame("player")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Two Players
                  </Button>
                  
                  <Button 
                    onClick={() => startGame("bot")}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2"
                  >
                    <Bot className="h-4 w-4" />
                    Play vs BMO
                  </Button>
                </div>

                {gameMode === "bot" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">BMO Difficulty:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                        <Button
                          key={level}
                          variant={difficulty === level ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDifficulty(level)}
                          className="capitalize"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Game Status */}
                <div className="text-center">
                  {winner ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="space-y-2"
                    >
                      <h3 className="text-lg font-bold">
                        {winner === "tie" ? "It's a Tie!" : 
                         winner === "X" ? "Player X Wins!" : 
                         gameMode === "bot" ? "BMO Wins!" : "Player O Wins!"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {winner === "tie" ? "Good game!" : 
                         winner === "X" ? "Mathematical!" : 
                         "Oh my glob!"}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {isThinking ? "BMO is thinking..." :
                         currentPlayer === "X" ? "Player X's Turn" :
                         gameMode === "bot" ? "BMO's Turn (O)" : "Player O's Turn"}
                      </p>
                      {isThinking && (
                        <div className="text-xs text-cyan-600">Processing... beep boop!</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Game Board */}
                <div className="grid grid-cols-3 gap-2 p-4 bg-black rounded-lg border-2 border-gray-600">
                  {board.map((cell, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      className="aspect-square bg-cyan-900/30 border-2 border-cyan-600 rounded flex items-center justify-center text-2xl font-bold hover:bg-cyan-800/50 transition-colors disabled:cursor-not-allowed"
                      disabled={!!cell || !!winner || isThinking}
                      whileHover={{ scale: cell || winner || isThinking ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <AnimatePresence>
                        {cell && (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className={cell === "X" ? "text-red-400" : "text-green-400"}
                          >
                            {cell}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>

                {/* Score */}
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-bold text-red-400">{playerXWins}</div>
                    <div className="text-muted-foreground">Player X</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-400">{ties}</div>
                    <div className="text-muted-foreground">Ties</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-400">{playerOWins}</div>
                    <div className="text-muted-foreground">
                      {gameMode === "bot" ? "BMO" : "Player O"}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                  <Button 
                    onClick={resetGame}
                    variant="outline"
                    className="flex-1 flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    New Game
                  </Button>
                  <Button 
                    onClick={() => {
                      setGameStarted(false);
                      resetGame();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Change Mode
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}