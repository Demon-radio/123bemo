import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings, Zap, Target, Crown, Skull } from "lucide-react";

export type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

export interface DifficultySettings {
  level: DifficultyLevel;
  scoreMultiplier: number;
  speedMultiplier: number;
  enemyCountMultiplier: number;
  timeMultiplier: number;
  lives: number;
  specialAbilities: boolean;
}

const difficultyConfigs: Record<DifficultyLevel, DifficultySettings> = {
  easy: {
    level: "easy",
    scoreMultiplier: 0.8,
    speedMultiplier: 0.7,
    enemyCountMultiplier: 0.6,
    timeMultiplier: 1.5,
    lives: 5,
    specialAbilities: true
  },
  medium: {
    level: "medium",
    scoreMultiplier: 1.0,
    speedMultiplier: 1.0,
    enemyCountMultiplier: 1.0,
    timeMultiplier: 1.0,
    lives: 3,
    specialAbilities: true
  },
  hard: {
    level: "hard",
    scoreMultiplier: 1.5,
    speedMultiplier: 1.3,
    enemyCountMultiplier: 1.4,
    timeMultiplier: 0.8,
    lives: 2,
    specialAbilities: false
  },
  expert: {
    level: "expert",
    scoreMultiplier: 2.0,
    speedMultiplier: 1.6,
    enemyCountMultiplier: 1.8,
    timeMultiplier: 0.6,
    lives: 1,
    specialAbilities: false
  }
};

const difficultyInfo = {
  easy: {
    name: "Easy",
    icon: Zap,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    description: "Perfect for beginners. Slower pace, more lives, extended time.",
    features: ["5 Lives", "Extra Time", "Special Abilities", "Reduced Speed"]
  },
  medium: {
    name: "Medium",
    icon: Target,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Balanced gameplay for regular players. Standard difficulty.",
    features: ["3 Lives", "Normal Time", "Special Abilities", "Standard Speed"]
  },
  hard: {
    name: "Hard",
    icon: Crown,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    description: "Challenging for experienced players. Faster pace, fewer lives.",
    features: ["2 Lives", "Less Time", "No Special Abilities", "Increased Speed"]
  },
  expert: {
    name: "Expert",
    icon: Skull,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "Only for masters. Maximum challenge, one life, extreme speed.",
    features: ["1 Life", "Minimal Time", "No Special Abilities", "Maximum Speed"]
  }
};

interface DifficultySelectorProps {
  onDifficultyChange?: (settings: DifficultySettings) => void;
  currentDifficulty?: DifficultyLevel;
}

export function DifficultySelector({ onDifficultyChange, currentDifficulty = "medium" }: DifficultySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(currentDifficulty);

  // Load difficulty from localStorage on mount
  useEffect(() => {
    const savedDifficulty = localStorage.getItem("bemora-difficulty") as DifficultyLevel;
    if (savedDifficulty && difficultyConfigs[savedDifficulty]) {
      setSelectedDifficulty(savedDifficulty);
      if (onDifficultyChange) {
        onDifficultyChange(difficultyConfigs[savedDifficulty]);
      }
    }
  }, [onDifficultyChange]);

  const handleDifficultySelect = (difficulty: DifficultyLevel) => {
    setSelectedDifficulty(difficulty);
    localStorage.setItem("bemora-difficulty", difficulty);
    
    if (onDifficultyChange) {
      onDifficultyChange(difficultyConfigs[difficulty]);
    }
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent("difficultyChange", { 
      detail: difficultyConfigs[difficulty] 
    }));
    
    setIsOpen(false);
  };

  const currentInfo = difficultyInfo[selectedDifficulty];
  const IconComponent = currentInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${currentInfo.bgColor} ${currentInfo.borderColor} hover:${currentInfo.bgColor}`}
        >
          <Settings className="h-4 w-4" />
          <IconComponent className={`h-4 w-4 ${currentInfo.color}`} />
          <span className="hidden sm:inline">{currentInfo.name}</span>
          <Badge variant="secondary" className="text-xs">
            {difficultyConfigs[selectedDifficulty].scoreMultiplier}x
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Select Difficulty Level
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {(Object.keys(difficultyInfo) as DifficultyLevel[]).map((difficulty) => {
            const info = difficultyInfo[difficulty];
            const config = difficultyConfigs[difficulty];
            const IconComp = info.icon;
            const isSelected = selectedDifficulty === difficulty;
            
            return (
              <motion.div
                key={difficulty}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDifficultySelect(difficulty)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? `${info.bgColor} ${info.borderColor} border-2` 
                    : "bg-muted/30 border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${info.bgColor}`}>
                    <IconComp className={`h-6 w-6 ${info.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-bold ${isSelected ? info.color : ""}`}>
                        {info.name}
                      </h3>
                      <Badge 
                        variant={isSelected ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {config.scoreMultiplier}x Score
                      </Badge>
                      {isSelected && (
                        <Badge variant="outline" className="text-xs border-primary text-primary">
                          SELECTED
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {info.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {info.features.map((feature, index) => (
                        <div
                          key={index}
                          className="text-xs bg-background/50 rounded px-2 py-1 text-center"
                        >
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Speed:</span>
                        <span className={`ml-1 font-bold ${info.color}`}>
                          {config.speedMultiplier}x
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Enemies:</span>
                        <span className={`ml-1 font-bold ${info.color}`}>
                          {config.enemyCountMultiplier}x
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time:</span>
                        <span className={`ml-1 font-bold ${info.color}`}>
                          {config.timeMultiplier}x
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lives:</span>
                        <span className={`ml-1 font-bold ${info.color}`}>
                          {config.lives}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Difficulty Effects</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• <strong>Score Multiplier:</strong> Affects final score calculation</p>
            <p>• <strong>Speed:</strong> Controls game element movement speed</p>
            <p>• <strong>Enemies:</strong> Number of enemies that appear</p>
            <p>• <strong>Time:</strong> Available time to complete objectives</p>
            <p>• <strong>Lives:</strong> Number of attempts before game over</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for components to use difficulty settings
export function useDifficulty() {
  const [difficulty, setDifficulty] = useState<DifficultySettings>(difficultyConfigs.medium);

  useEffect(() => {
    // Load difficulty from localStorage
    const savedDifficulty = localStorage.getItem("bemora-difficulty") as DifficultyLevel;
    if (savedDifficulty && difficultyConfigs[savedDifficulty]) {
      setDifficulty(difficultyConfigs[savedDifficulty]);
    }

    // Listen for difficulty changes
    const handleDifficultyChange = (event: CustomEvent) => {
      setDifficulty(event.detail);
    };

    window.addEventListener("difficultyChange", handleDifficultyChange as EventListener);
    return () => window.removeEventListener("difficultyChange", handleDifficultyChange as EventListener);
  }, []);

  return difficulty;
}