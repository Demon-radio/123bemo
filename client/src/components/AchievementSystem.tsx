import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Star, Target, Zap, Crown, Award, Medal, Gem } from "lucide-react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: "score" | "games" | "time" | "special";
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
}

interface AchievementSystemProps {
  gameId?: string;
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

const defaultAchievements: Omit<Achievement, "currentProgress" | "unlocked" | "unlockedAt">[] = [
  // Score-based achievements
  {
    id: "first_score",
    title: "First Steps",
    description: "Score your first points",
    icon: Star,
    category: "score",
    requirement: 1,
    rarity: "common",
    points: 10
  },
  {
    id: "century_club",
    title: "Century Club",
    description: "Score 100 points in any game",
    icon: Target,
    category: "score",
    requirement: 100,
    rarity: "common",
    points: 25
  },
  {
    id: "high_scorer",
    title: "High Scorer",
    description: "Score 500 points in any game",
    icon: Trophy,
    category: "score",
    requirement: 500,
    rarity: "rare",
    points: 50
  },
  {
    id: "master_scorer",
    title: "Master Scorer",
    description: "Score 1000 points in any game",
    icon: Crown,
    category: "score",
    requirement: 1000,
    rarity: "epic",
    points: 100
  },
  {
    id: "legendary_scorer",
    title: "Legendary Scorer",
    description: "Score 2000 points in any game",
    icon: Gem,
    category: "score",
    requirement: 2000,
    rarity: "legendary",
    points: 200
  },
  // Game-based achievements
  {
    id: "game_explorer",
    title: "Game Explorer",
    description: "Play 3 different games",
    icon: Zap,
    category: "games",
    requirement: 3,
    rarity: "common",
    points: 30
  },
  {
    id: "game_master",
    title: "Game Master",
    description: "Play all 7 games",
    icon: Award,
    category: "games",
    requirement: 7,
    rarity: "epic",
    points: 150
  },
  // Time-based achievements
  {
    id: "quick_player",
    title: "Quick Player",
    description: "Play for 5 minutes total",
    icon: Medal,
    category: "time",
    requirement: 300, // 5 minutes in seconds
    rarity: "common",
    points: 20
  },
  {
    id: "dedicated_player",
    title: "Dedicated Player",
    description: "Play for 30 minutes total",
    icon: Trophy,
    category: "time",
    requirement: 1800, // 30 minutes in seconds
    rarity: "rare",
    points: 75
  },
  // Special achievements
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Complete BMO Maze without any mistakes",
    icon: Crown,
    category: "special",
    requirement: 1,
    rarity: "epic",
    points: 125
  },
  {
    id: "bmox_champion",
    title: "BMO X.O Champion",
    description: "Win 10 BMO X.O games",
    icon: Medal,
    category: "special",
    requirement: 10,
    rarity: "rare",
    points: 60
  }
];

export function AchievementSystem({ gameId, onAchievementUnlocked }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  // Initialize achievements from localStorage
  useEffect(() => {
    const savedAchievements = localStorage.getItem("bemora-achievements");
    if (savedAchievements) {
      try {
        const parsed = JSON.parse(savedAchievements);
        setAchievements(parsed);
      } catch {
        initializeAchievements();
      }
    } else {
      initializeAchievements();
    }
  }, []);

  const initializeAchievements = () => {
    const initialAchievements: Achievement[] = defaultAchievements.map(achievement => ({
      ...achievement,
      currentProgress: 0,
      unlocked: false
    }));
    setAchievements(initialAchievements);
    localStorage.setItem("bemora-achievements", JSON.stringify(initialAchievements));
  };

  // Save achievements to localStorage whenever they change
  useEffect(() => {
    if (achievements.length > 0) {
      localStorage.setItem("bemora-achievements", JSON.stringify(achievements));
    }
  }, [achievements]);

  const updateProgress = useCallback((category: Achievement["category"], amount: number, gameSpecific?: string) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => {
        // Skip if achievement is already unlocked
        if (achievement.unlocked) return achievement;

        let shouldUpdate = false;
        let newProgress = achievement.currentProgress;

        // Check if this achievement should be updated
        if (achievement.category === category) {
          if (category === "special" && gameSpecific) {
            // Special achievements might be game-specific
            shouldUpdate = achievement.id.includes(gameSpecific.toLowerCase());
          } else {
            shouldUpdate = true;
          }
        }

        if (shouldUpdate) {
          newProgress = Math.min(achievement.currentProgress + amount, achievement.requirement);
          
          // Check if achievement is now unlocked
          if (newProgress >= achievement.requirement && !achievement.unlocked) {
            const unlockedAchievement = {
              ...achievement,
              currentProgress: newProgress,
              unlocked: true,
              unlockedAt: new Date()
            };
            
            // Add to newly unlocked list for notification
            setNewlyUnlocked(current => [...current, unlockedAchievement]);
            
            // Call callback if provided
            if (onAchievementUnlocked) {
              onAchievementUnlocked(unlockedAchievement);
            }
            
            return unlockedAchievement;
          }
          
          return {
            ...achievement,
            currentProgress: newProgress
          };
        }

        return achievement;
      });
      
      return updated;
    });
  }, [onAchievementUnlocked]);

  // Show notification for newly unlocked achievements
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      // Auto-clear notifications after 5 seconds
      const timer = setTimeout(() => {
        setNewlyUnlocked([]);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked]);

  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common": return "bg-gray-500";
      case "rare": return "bg-blue-500";
      case "epic": return "bg-purple-500";
      case "legendary": return "bg-yellow-500";
    }
  };

  const getRarityTextColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common": return "text-gray-600";
      case "rare": return "text-blue-600";
      case "epic": return "text-purple-600";
      case "legendary": return "text-yellow-600";
    }
  };

  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <>
      {/* Achievement Badge */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed top-20 left-4 z-50 bg-background/90 backdrop-blur-sm border-yellow-500/50 shadow-lg hover:border-yellow-500"
          >
            <Trophy className="h-4 w-4 mr-2 text-yellow-600" />
            <span className="font-bold text-yellow-600">{totalPoints}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-600" />
              Achievements ({unlockedCount}/{achievements.length})
              <Badge variant="secondary">{totalPoints} Points</Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon || Star;
              const progressPercentage = (achievement.currentProgress / achievement.requirement) * 100;
              
              return (
                <motion.div
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all ${
                    achievement.unlocked 
                      ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800" 
                      : "bg-muted/50 border-border hover:border-primary/50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${achievement.unlocked ? "bg-yellow-500" : "bg-muted"}`}>
                      <IconComponent 
                        className={`h-5 w-5 ${achievement.unlocked ? "text-white" : "text-muted-foreground"}`} 
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${achievement.unlocked ? "text-yellow-700 dark:text-yellow-300" : ""}`}>
                          {achievement.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRarityTextColor(achievement.rarity)}`}
                        >
                          {achievement.rarity}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          +{achievement.points}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      
                      {!achievement.unlocked && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress: {achievement.currentProgress}/{achievement.requirement}</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${getRarityColor(achievement.rarity)}`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievement Notifications */}
      <AnimatePresence>
        {newlyUnlocked.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className="fixed top-24 right-4 z-50 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-4 rounded-lg shadow-lg max-w-sm"
            style={{ top: `${6 + index * 5}rem` }}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Achievement Unlocked!</h4>
                <p className="text-xs opacity-90">{achievement.title}</p>
                <p className="text-xs opacity-75">+{achievement.points} points</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}

// Export the update function for use in games
export function useAchievements() {
  const [achievementSystem, setAchievementSystem] = useState<{
    updateProgress: (category: Achievement["category"], amount: number, gameSpecific?: string) => void;
  } | null>(null);

  return {
    updateProgress: (category: Achievement["category"], amount: number, gameSpecific?: string) => {
      window.dispatchEvent(new CustomEvent("achievementProgress", {
        detail: { category, amount, gameSpecific }
      }));
    }
  };
}