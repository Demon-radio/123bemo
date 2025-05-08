import { useState, useEffect, useRef } from "react";
import { X, Gamepad2, Heart, Sword, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BMOImage from "@assets/image_1746719364511.png";

// Game characters and enemies based on Adventure Time
const PLAYER_CHARACTER = {
  name: "Fionna and Cake",
  health: 100,
  attack: 15,
  defense: 10,
  sprite: "👱‍♀️🐱"
};

// Define enemy types with special abilities
const ENEMIES = [
  { 
    name: "Evil Bug", 
    health: 50, 
    attack: 10, 
    defense: 5, 
    sprite: "🐞",
    specialAbility: "Swarm",
    specialAbilityDescription: "Summons tiny bugs that deal additional damage",
    specialAbilityChance: 0.3,
    specialAbilityEffect: { type: "damage", value: 5 }
  },
  { 
    name: "Memory Thief", 
    health: 70, 
    attack: 12, 
    defense: 8, 
    sprite: "👾",
    specialAbility: "Memory Drain",
    specialAbilityDescription: "Steals attack power temporarily",
    specialAbilityChance: 0.25,
    specialAbilityEffect: { type: "weakenAttack", value: 3, duration: 2 }
  },
  { 
    name: "Virus Monster", 
    health: 90, 
    attack: 15, 
    defense: 10, 
    sprite: "🦠",
    specialAbility: "Infect",
    specialAbilityDescription: "Causes damage over time",
    specialAbilityChance: 0.2,
    specialAbilityEffect: { type: "dot", value: 3, duration: 3 }
  },
  { 
    name: "Ling of Ooo", 
    health: 120, 
    attack: 18, 
    defense: 12, 
    sprite: "👨‍🦰", // Yellow man
    specialAbility: "Dark Magic",
    specialAbilityDescription: "High chance of a powerful magic attack",
    specialAbilityChance: 0.4,
    specialAbilityEffect: { type: "damage", value: 15 }
  },
  { 
    name: "Sweet Bee", 
    health: 150, 
    attack: 20, 
    defense: 15, 
    sprite: "👦", // Older boy
    specialAbility: "Mind Control",
    specialAbilityDescription: "Makes you attack yourself",
    specialAbilityChance: 0.3,
    specialAbilityEffect: { type: "selfDamage", value: 0.5 } // 50% of your own attack
  }
];

// Define types for status effects and player special abilities
type StatusEffect = {
  type: string;
  value: number;
  duration: number;
  source: string;
};

type PlayerSpecialAbility = {
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  effect: any;
};

export function BmoAdventureGame() {
  // Game state
  const [isOpen, setIsOpen] = useState(false);
  const [gameState, setGameState] = useState<"register" | "playing" | "gameover" | "victory">("register");
  const [playerName, setPlayerName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [player, setPlayer] = useState({ ...PLAYER_CHARACTER });
  const [enemy, setEnemy] = useState(ENEMIES[0]);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [attackAnimation, setAttackAnimation] = useState(false);
  const [defendAnimation, setDefendAnimation] = useState(false);
  const [healAnimation, setHealAnimation] = useState(false);
  const [enemyAttackAnimation, setEnemyAttackAnimation] = useState(false);
  const [specialAbilityAnimation, setSpecialAbilityAnimation] = useState(false);
  const [statusEffects, setStatusEffects] = useState<StatusEffect[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Special abilities for the player
  const [specialAbilities, setSpecialAbilities] = useState<PlayerSpecialAbility[]>([
    {
      name: "Adventure Call",
      description: "Deal high damage with a powerful attack",
      cooldown: 3,
      currentCooldown: 0,
      effect: { type: "damage", value: 25 }
    },
    {
      name: "Friendship Power",
      description: "Heal a large amount and gain a defense boost",
      cooldown: 4,
      currentCooldown: 0,
      effect: { type: "heal", value: 30, defenseBuff: 5, duration: 2 }
    }
  ]);
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Reset game when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetGame();
    }
  }, [isOpen]);

  // Handle enemy turn
  useEffect(() => {
    if (gameState === "playing" && !isPlayerTurn) {
      const enemyTurnTimer = setTimeout(() => {
        handleEnemyTurn();
      }, 1500);
      
      return () => clearTimeout(enemyTurnTimer);
    }
  }, [isPlayerTurn, gameState]);

  // Scroll battle log to bottom
  useEffect(() => {
    if (gameAreaRef.current) {
      gameAreaRef.current.scrollTop = gameAreaRef.current.scrollHeight;
    }
  }, [battleLog]);

  // Reset game
  const resetGame = () => {
    setGameState("register");
    setScore(0);
    setCurrentLevel(1);
    setPlayer({ ...PLAYER_CHARACTER });
    setEnemy(ENEMIES[0]);
    setBattleLog([]);
    setIsPlayerTurn(true);
    setStatusEffects([]);
    
    // Reset special abilities cooldowns
    setSpecialAbilities(abilities => 
      abilities.map(ability => ({
        ...ability,
        currentCooldown: 0
      }))
    );
  };
  
  // Process status effects at the start of player's turn
  const processStatusEffects = () => {
    if (!isPlayerTurn) return;
    
    let newPlayer = { ...player };
    let newLog = [...battleLog];
    let newStatusEffects = [...statusEffects];
    
    // Apply effects and decrement durations
    newStatusEffects = newStatusEffects.map(effect => {
      // Apply effect
      if (effect.type === "dot") {
        // Damage over time
        const damage = effect.value;
        newPlayer.health = Math.max(0, newPlayer.health - damage);
        newLog.push(`${effect.source} effect deals ${damage} damage!`);
      } else if (effect.type === "defenseBuff") {
        // Defense already applied, just keep track of it
      }
      
      // Decrement duration
      return {
        ...effect,
        duration: effect.duration - 1
      };
    }).filter(effect => effect.duration > 0); // Remove expired effects
    
    // Apply changes
    setPlayer(newPlayer);
    setBattleLog(newLog);
    setStatusEffects(newStatusEffects);
    
    // Check if player was defeated by DOT
    if (newPlayer.health <= 0) {
      handleGameOver();
    }
  };
  
  // Decrement ability cooldowns at the start of player's turn
  const decrementCooldowns = () => {
    if (!isPlayerTurn) return;
    
    setSpecialAbilities(abilities => 
      abilities.map(ability => ({
        ...ability,
        currentCooldown: Math.max(0, ability.currentCooldown - 1)
      }))
    );
  };
  
  // Use a special ability
  const useSpecialAbility = (index: number) => {
    if (!isPlayerTurn || gameState !== "playing") return;
    
    const ability = specialAbilities[index];
    if (ability.currentCooldown > 0) return;
    
    setSpecialAbilityAnimation(true);
    setTimeout(() => setSpecialAbilityAnimation(false), 500);
    
    let newBattleLog = [...battleLog];
    let newEnemy = { ...enemy };
    let newPlayer = { ...player };
    let newStatusEffects = [...statusEffects];
    
    // Apply ability effect
    if (ability.effect.type === "damage") {
      // Damage ability
      const damage = ability.effect.value;
      newEnemy.health = Math.max(0, newEnemy.health - damage);
      newBattleLog.push(`${playerName}'s Fionna & Cake use ${ability.name} for ${damage} damage!`);
    } else if (ability.effect.type === "heal") {
      // Healing ability
      const healAmount = ability.effect.value;
      newPlayer.health = Math.min(PLAYER_CHARACTER.health, newPlayer.health + healAmount);
      newBattleLog.push(`${playerName}'s Fionna & Cake use ${ability.name} and heal for ${healAmount} health!`);
      
      // Add defense buff if present
      if (ability.effect.defenseBuff) {
        newStatusEffects.push({
          type: "defenseBuff",
          value: ability.effect.defenseBuff,
          duration: ability.effect.duration,
          source: ability.name
        });
        newPlayer.defense += ability.effect.defenseBuff;
        newBattleLog.push(`${ability.name} increased defense by ${ability.effect.defenseBuff} for ${ability.effect.duration} turns!`);
      }
    }
    
    // Set cooldown
    const newAbilities = [...specialAbilities];
    newAbilities[index].currentCooldown = newAbilities[index].cooldown;
    
    // Apply changes
    setSpecialAbilities(newAbilities);
    setEnemy(newEnemy);
    setPlayer(newPlayer);
    setStatusEffects(newStatusEffects);
    setBattleLog(newBattleLog);
    
    // Check if enemy is defeated
    if (newEnemy.health <= 0) {
      handleEnemyDefeated();
    } else {
      setIsPlayerTurn(false);
    }
  };

  // Start game function
  const startGame = () => {
    if (!playerName.trim()) {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
      return;
    }
    
    setGameState("playing");
    setPlayer({ ...PLAYER_CHARACTER });
    setEnemy({ ...ENEMIES[0] });
    setBattleLog([
      "BMO: Welcome to my internal system!",
      "BMO: Oh no! Evil programs are attacking!",
      "BMO: Help me fight them off, Fionna and Cake!",
      `BMO: You're facing a ${ENEMIES[0].name}! What will you do?`
    ]);
  };

  // Calculate damage with randomness
  const calculateDamage = (attack: number, defense: number) => {
    const baseDamage = Math.max(1, attack - defense);
    const randomFactor = Math.random() * 0.4 + 0.8; // 0.8 to 1.2 multiplier
    return Math.round(baseDamage * randomFactor);
  };

  // Handle player attack
  const handleAttack = () => {
    if (!isPlayerTurn || gameState !== "playing") return;
    
    setAttackAnimation(true);
    setTimeout(() => setAttackAnimation(false), 500);
    
    const damage = calculateDamage(player.attack, enemy.defense);
    const newEnemyHealth = Math.max(0, enemy.health - damage);
    setEnemy({ ...enemy, health: newEnemyHealth });
    
    const newBattleLog = [...battleLog, `${playerName}'s Fionna & Cake attack for ${damage} damage!`];
    setBattleLog(newBattleLog);
    
    // Check if enemy is defeated
    if (newEnemyHealth <= 0) {
      handleEnemyDefeated();
    } else {
      setIsPlayerTurn(false);
    }
  };

  // Handle player defend
  const handleDefend = () => {
    if (!isPlayerTurn || gameState !== "playing") return;
    
    setDefendAnimation(true);
    setTimeout(() => setDefendAnimation(false), 500);
    
    // Temporary defense boost
    const defenseBoost = Math.round(player.defense * 0.5);
    setPlayer({ ...player, defense: player.defense + defenseBoost });
    
    const newBattleLog = [...battleLog, `${playerName}'s Fionna & Cake prepare to defend! Defense +${defenseBoost}!`];
    setBattleLog(newBattleLog);
    
    setIsPlayerTurn(false);
  };

  // Handle player heal
  const handleHeal = () => {
    if (!isPlayerTurn || gameState !== "playing") return;
    
    setHealAnimation(true);
    setTimeout(() => setHealAnimation(false), 500);
    
    const healAmount = Math.round(PLAYER_CHARACTER.health * 0.2);
    const newHealth = Math.min(PLAYER_CHARACTER.health, player.health + healAmount);
    setPlayer({ ...player, health: newHealth });
    
    const newBattleLog = [...battleLog, `${playerName}'s Fionna & Cake heal for ${healAmount} health!`];
    setBattleLog(newBattleLog);
    
    setIsPlayerTurn(false);
  };

  // Handle enemy turn
  const handleEnemyTurn = () => {
    // Reset defense to base after the turn, but maintain any defense buffs from status effects
    let baseDefense = PLAYER_CHARACTER.defense;
    
    // Add defense from active buffs
    const defenseBuff = statusEffects
      .filter(effect => effect.type === "defenseBuff")
      .reduce((total, effect) => total + effect.value, 0);
    
    let resetDefense = { ...player, defense: baseDefense + defenseBuff };
    
    // Check if enemy uses a special ability
    const useSpecial = Math.random() < (enemy.specialAbilityChance || 0);
    let newBattleLog = [...battleLog];
    
    if (useSpecial && enemy.specialAbility) {
      newBattleLog.push(`${enemy.name} uses ${enemy.specialAbility}!`);
      
      const effect = enemy.specialAbilityEffect;
      if (effect.type === "damage") {
        // Direct damage special attack
        setEnemyAttackAnimation(true);
        setTimeout(() => setEnemyAttackAnimation(false), 500);
        
        resetDefense.health = Math.max(0, resetDefense.health - effect.value);
        newBattleLog.push(`${enemy.specialAbilityDescription}! It deals ${effect.value} damage!`);
      } else if (effect.type === "weakenAttack") {
        // Weaken player attack temporarily
        setEnemyAttackAnimation(true);
        setTimeout(() => setEnemyAttackAnimation(false), 500);
        
        // Add status effect to track the weakened attack
        setStatusEffects(prev => [
          ...prev,
          {
            type: "weakenAttack",
            value: effect.value,
            duration: effect.duration,
            source: enemy.specialAbility
          }
        ]);
        
        newBattleLog.push(`${enemy.specialAbilityDescription}! Your attack is decreased by ${effect.value} for ${effect.duration} turns!`);
      } else if (effect.type === "dot") {
        // Damage over time effect
        setEnemyAttackAnimation(true);
        setTimeout(() => setEnemyAttackAnimation(false), 500);
        
        // Add status effect to track DOT
        setStatusEffects(prev => [
          ...prev,
          {
            type: "dot",
            value: effect.value,
            duration: effect.duration,
            source: enemy.specialAbility
          }
        ]);
        
        newBattleLog.push(`${enemy.specialAbilityDescription}! You'll take ${effect.value} damage for ${effect.duration} turns!`);
      } else if (effect.type === "selfDamage") {
        // Make player attack themselves
        setEnemyAttackAnimation(true);
        setTimeout(() => setEnemyAttackAnimation(false), 500);
        
        const selfDamage = Math.round(player.attack * effect.value);
        resetDefense.health = Math.max(0, resetDefense.health - selfDamage);
        
        newBattleLog.push(`${enemy.specialAbilityDescription}! You take ${selfDamage} damage from your own attack!`);
      }
    } else {
      // Regular attack
      setEnemyAttackAnimation(true);
      setTimeout(() => setEnemyAttackAnimation(false), 500);
      
      const damage = calculateDamage(enemy.attack, resetDefense.defense);
      resetDefense.health = Math.max(0, resetDefense.health - damage);
      
      newBattleLog.push(`${enemy.name} attacks for ${damage} damage!`);
    }
    
    // Apply the updated player state
    setPlayer(resetDefense);
    setBattleLog(newBattleLog);
    
    // Check if player is defeated
    if (resetDefense.health <= 0) {
      handleGameOver();
    } else {
      // Process status effects and cooldowns before giving control back to player
      setIsPlayerTurn(true);
      setTimeout(() => {
        processStatusEffects();
        decrementCooldowns();
      }, 100);
    }
  };

  // Handle enemy defeated
  const handleEnemyDefeated = () => {
    const enemyPoints = currentLevel * 100;
    const newScore = score + enemyPoints;
    setScore(newScore);
    
    const newBattleLog = [
      ...battleLog, 
      `${enemy.name} was defeated!`,
      `You earned ${enemyPoints} points!`
    ];
    
    // Check if this was the final enemy
    if (currentLevel >= ENEMIES.length) {
      setBattleLog([...newBattleLog, "BMO: You defeated all the evil programs! My system is safe now!", "BMO: Thank you, Fionna and Cake!"]);
      setGameState("victory");
    } else {
      // Next enemy
      const nextLevel = currentLevel + 1;
      const nextEnemy = { ...ENEMIES[nextLevel - 1] };
      
      setCurrentLevel(nextLevel);
      setEnemy(nextEnemy);
      
      // Heal player a bit between levels
      const healAmount = Math.round(PLAYER_CHARACTER.health * 0.3);
      const newHealth = Math.min(PLAYER_CHARACTER.health, player.health + healAmount);
      
      setPlayer({ ...player, health: newHealth });
      
      setBattleLog([
        ...newBattleLog, 
        "BMO: Great job! But there's more danger ahead!",
        `BMO: Now you're facing a ${nextEnemy.name}!`,
        `You recovered ${healAmount} health!`
      ]);
      
      setIsPlayerTurn(true);
    }
  };

  // Handle game over
  const handleGameOver = () => {
    setBattleLog([...battleLog, "BMO: Oh no! You were defeated!", "BMO: Game over!"]);
    setGameState("gameover");
  };

  // Submit score
  const submitScore = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('/api/games/submit-score', {
        method: 'POST',
        body: JSON.stringify({
          name: playerName,
          email: playerEmail || null,
          game_type: 'bmo-adventure',
          score: score
        })
      });
      
      if (response.success) {
        toast({
          title: "Score submitted!",
          description: "Your adventure score has been saved.",
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

  // Calculate health percent
  const calculateHealthPercent = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <>
      {/* Game button */}
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full bg-blue-500/10 border-blue-500 text-blue-500 hover:bg-blue-500/20 shine-effect flex items-center gap-2 px-8 py-3 justify-center"
      >
        <Gamepad2 className="h-5 w-5" />
        <span className="font-semibold">BMO Adventure</span>
      </Button>

      {/* Game dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl w-[90vw] h-[80vh] max-h-[600px] p-0 gap-0 bg-background/95 backdrop-blur-sm border-blue-500/20">
          <DialogTitle className="sr-only">BMO Adventure Game</DialogTitle>
          <DialogDescription className="sr-only">
            Help Fionna and Cake fight evil programs inside BMO!
          </DialogDescription>
          
          {/* Game header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold"><span className="text-blue-500">BMO</span> Adventure</h2>
              {gameState === "playing" && (
                <div className="flex gap-4 text-sm font-mono">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-blue-500">Score:</span>
                    <span className="font-bold">{score}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-primary">Level:</span>
                    <span className="font-bold">{currentLevel}/{ENEMIES.length}</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Game area */}
          <div className="relative flex flex-col flex-1 h-full overflow-hidden">
            {/* Registration screen */}
            {gameState === "register" && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center p-6 text-center gap-4 h-full"
              >
                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 mb-4">
                  <img src={BMOImage} alt="BMO" className="w-full h-full object-contain" />
                </div>
              
                <h3 className="text-xl font-bold">BMO Adventure Game</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Help Fionna and Cake fight evil programs inside BMO's system! Battle against Ling of Ooo and Sweet Bee to save BMO from corruption.
                </p>
                
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
                  
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md mt-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-black dark:text-white text-base mb-2">How to play:</h4>
                    <ul className="text-sm space-y-1 list-disc pl-4 text-black dark:text-white font-medium">
                      <li>Play as Fionna and Cake inside BMO's system</li>
                      <li>Battle against Ling of Ooo, Sweet Bee and other enemies</li>
                      <li>Use Attack, Defend, and Heal abilities strategically</li>
                      <li>Defeat all enemies to win!</li>
                      <li>Your score increases based on the levels completed</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={startGame} 
                    className="bg-blue-500 hover:bg-blue-600 w-full mt-4"
                    disabled={!playerName.trim()}
                  >
                    Start Adventure
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Playing state */}
            {gameState === "playing" && (
              <div className="flex flex-col h-full">
                {/* Battle area */}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    {/* Player stats */}
                    <div className="w-1/2 pr-2">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm font-bold">Fionna & Cake</h3>
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-sm">{player.health}/{PLAYER_CHARACTER.health}</span>
                        </div>
                      </div>
                      <Progress 
                        value={calculateHealthPercent(player.health, PLAYER_CHARACTER.health)} 
                        className="h-2"
                        indicatorClassName={`${
                          player.health < PLAYER_CHARACTER.health * 0.25 ? "bg-red-500" : 
                          player.health < PLAYER_CHARACTER.health * 0.5 ? "bg-yellow-500" : 
                          "bg-green-500"
                        }`}
                      />
                    </div>
                    
                    {/* Enemy stats */}
                    <div className="w-1/2 pl-2">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm font-bold">{enemy.name}</h3>
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-sm">{enemy.health}/{ENEMIES[currentLevel-1].health}</span>
                        </div>
                      </div>
                      <Progress 
                        value={calculateHealthPercent(enemy.health, ENEMIES[currentLevel-1].health)} 
                        className="h-2"
                        indicatorClassName={`${
                          enemy.health < ENEMIES[currentLevel-1].health * 0.25 ? "bg-red-500" : 
                          enemy.health < ENEMIES[currentLevel-1].health * 0.5 ? "bg-yellow-500" : 
                          "bg-green-500"
                        }`}
                      />
                    </div>
                  </div>
                  
                  {/* Battle scene */}
                  <div className="flex-1 flex items-center justify-center py-4 relative">
                    {/* BMO screen background */}
                    <div className="absolute inset-0 bg-blue-50/30 dark:bg-blue-950/30 border-4 border-blue-200 dark:border-blue-800 rounded-lg m-2 overflow-hidden">
                      {/* Grid lines */}
                      <div className="absolute inset-0 grid-pattern opacity-30"></div>
                    </div>
                    
                    {/* Player character */}
                    <motion.div 
                      className="absolute left-1/4 transform -translate-x-1/2 text-5xl"
                      animate={{
                        x: attackAnimation ? 20 : 0,
                        scale: defendAnimation ? 0.9 : 1,
                        y: healAnimation ? -10 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {player.sprite}
                    </motion.div>
                    
                    {/* Enemy character */}
                    <motion.div 
                      className="absolute right-1/4 transform translate-x-1/2 text-5xl"
                      animate={{
                        x: enemyAttackAnimation ? -20 : 0,
                        opacity: enemy.health <= 0 ? 0 : 1,
                        scale: enemy.health <= 0 ? 0.5 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {enemy.sprite}
                    </motion.div>
                  </div>
                  
                  {/* Battle log */}
                  <div 
                    ref={gameAreaRef}
                    className="h-32 bg-blue-50/50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded p-2 overflow-y-auto mb-4 text-sm"
                  >
                    {battleLog.map((message, index) => (
                      <div key={index} className="mb-1">
                        {message}
                      </div>
                    ))}
                  </div>
                  
                  {/* Status effects display */}
                  {statusEffects.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold mb-1 text-blue-800 dark:text-blue-200">Status Effects:</h4>
                      <div className="flex flex-wrap gap-2">
                        {statusEffects.map((effect, idx) => (
                          <Badge 
                            key={idx} 
                            variant={
                              effect.type === "dot" ? "destructive" :
                              effect.type === "weakenAttack" ? "destructive" :
                              effect.type === "defenseBuff" ? "outline" : "secondary"
                            }
                            className="flex items-center gap-1"
                          >
                            {effect.type === "dot" && <Flame className="h-3 w-3" />}
                            {effect.type === "weakenAttack" && <ArrowDown className="h-3 w-3" />}
                            {effect.type === "defenseBuff" && <ShieldCheck className="h-3 w-3" />}
                            {effect.source} ({effect.duration}t)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Battle controls */}
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={handleAttack}
                      disabled={!isPlayerTurn}
                      className={`bg-red-500 hover:bg-red-600 flex items-center gap-1 ${attackAnimation ? 'animate-bounce' : ''}`}
                    >
                      <Sword className="w-4 h-4" />
                      <span>Attack</span>
                    </Button>
                    <Button
                      onClick={handleDefend}
                      disabled={!isPlayerTurn}
                      className={`bg-blue-500 hover:bg-blue-600 flex items-center gap-1 ${defendAnimation ? 'animate-pulse' : ''}`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Defend</span>
                    </Button>
                    <Button
                      onClick={handleHeal}
                      disabled={!isPlayerTurn || player.health === PLAYER_CHARACTER.health}
                      className={`bg-green-500 hover:bg-green-600 flex items-center gap-1 ${healAnimation ? 'animate-pulse' : ''}`}
                    >
                      <Heart className="w-4 h-4" />
                      <span>Heal</span>
                    </Button>
                  </div>
                  
                  {/* Special abilities */}
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold mb-1 text-blue-800 dark:text-blue-200">Special Abilities:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {specialAbilities.map((ability, idx) => (
                        <Button 
                          key={idx}
                          onClick={() => useSpecialAbility(idx)}
                          disabled={!isPlayerTurn || ability.currentCooldown > 0}
                          className={`bg-purple-500 hover:bg-purple-600 flex-col h-auto py-2 text-xs ${
                            specialAbilityAnimation ? 'animate-pulse' : ''
                          }`}
                        >
                          <span className="block text-sm font-bold">{ability.name}</span>
                          {ability.currentCooldown > 0 ? (
                            <span className="block text-xs opacity-70 mt-1">Cooldown: {ability.currentCooldown}</span>
                          ) : (
                            <span className="block text-xs opacity-70 mt-1">{ability.description}</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Game over screen */}
            {gameState === "gameover" && (
              <motion.div
                key="gameover"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center p-6 text-center gap-4 h-full"
              >
                <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <img src={BMOImage} alt="BMO" className="w-full h-full object-contain opacity-50" />
                </div>
                
                <h3 className="text-xl font-bold text-red-500">Game Over!</h3>
                <p className="mb-2">
                  Fionna and Cake were defeated by the evil programs.
                </p>
                <p className="text-2xl font-bold mb-6">
                  Your score: <span className="text-blue-500">{score}</span>
                </p>
                
                <p className="text-muted-foreground mb-6">
                  {score < 100 ? "Don't worry! You'll do better next time!" : 
                   score < 300 ? "Good effort! Try different strategies!" : 
                   "Great job! You made it far!"}
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={submitScore}
                    className="bg-blue-500 hover:bg-blue-600"
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
              </motion.div>
            )}

            {/* Victory screen */}
            {gameState === "victory" && (
              <motion.div
                key="victory"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center p-6 text-center gap-4 h-full"
              >
                <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <img src={BMOImage} alt="BMO" className="w-full h-full object-contain" />
                </div>
                
                <h3 className="text-xl font-bold text-green-500">Victory!</h3>
                <p className="mb-2">
                  Fionna and Cake successfully defeated all the evil programs inside BMO!
                </p>
                <p className="text-2xl font-bold mb-6">
                  Your score: <span className="text-blue-500">{score}</span>
                </p>
                
                <p className="text-muted-foreground mb-6">
                  Congratulations! You're the hero of BMO's system!
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={submitScore}
                    className="bg-blue-500 hover:bg-blue-600"
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
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}