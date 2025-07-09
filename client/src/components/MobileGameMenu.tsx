import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Gamepad2, Brain, Swords, MonitorPlay, Joystick, Grid3X3, Map, X } from "lucide-react";

interface MobileGameMenuProps {
  onGameSelect: (gameId: string) => void;
  activeGame: string;
}

export function MobileGameMenu({ onGameSelect, activeGame }: MobileGameMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const games = [
    { id: "catch-game", name: "Catch BEMORA", icon: Gamepad2, color: "text-blue-500" },
    { id: "quiz-game", name: "BEMORA Quiz", icon: Brain, color: "text-purple-500" },
    { id: "battle-game", name: "Knowledge Battle", icon: Swords, color: "text-orange-500" },
    { id: "bmo-game", name: "BMO Adventure", icon: MonitorPlay, color: "text-cyan-500" },
    { id: "rpg-game", name: "BMO RPG", icon: Joystick, color: "text-green-500" },
    { id: "tictactoe-game", name: "BMO X.O", icon: Grid3X3, color: "text-pink-500" },
    { id: "maze-game", name: "BMO Maze", icon: Map, color: "text-indigo-500" },
  ];

  const handleGameSelect = (gameId: string) => {
    onGameSelect(gameId);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-20 right-4 z-50 bg-background/90 backdrop-blur-sm border-primary/50 shadow-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-sm">
          <SheetHeader>
            <SheetTitle className="text-center text-primary">
              BEMORA Games Menu
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-3">
            {games.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={activeGame === game.id ? "default" : "outline"}
                  className={`w-full justify-start gap-3 h-12 ${
                    activeGame === game.id 
                      ? "bg-primary text-white" 
                      : "bg-background/50 hover:bg-primary/10"
                  }`}
                  onClick={() => handleGameSelect(game.id)}
                >
                  <game.icon className={`h-5 w-5 ${activeGame === game.id ? "text-white" : game.color}`} />
                  <span className="font-medium">{game.name}</span>
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Quick access to all 7 games. Tap any game to start playing!
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}