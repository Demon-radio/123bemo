import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileGameMenu } from "./MobileGameMenu";
import { DifficultySelector } from "./DifficultySelector";

import { QuizGame } from "./QuizGame";
import { BattleGame } from "./BattleGame";
import { BmoAdventureGame } from "./BmoAdventureGame";
import { BmoRpgGame } from "./BmoRpgGame";
import { BmoTicTacToeGame } from "./BmoTicTacToeGame";
import { BmoMazeGame } from "./BmoMazeGame";
import { Gamepad2, Brain, Swords, MonitorPlay, Joystick, Grid3X3, Map } from "lucide-react";

export function GamesSection() {
  const [activeTab, setActiveTab] = useState("quiz-game");

  return (
    <section id="games" className="py-12 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-heading text-center md:text-left mb-4 md:mb-0">
            <span className="gradient-text">BMO Games</span>
          </h2>
          <div className="flex items-center gap-4">
            <DifficultySelector />
          </div>
        </div>

        {/* Mobile Game Menu */}
        <MobileGameMenu 
          onGameSelect={setActiveTab}
          activeGame={activeTab}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8">
              <TabsTrigger 
                value="quiz-game"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white flex items-center gap-2 justify-center"
              >
                <Brain className="h-6 w-6" />
                <span className="hidden sm:inline">BEMORA Quiz</span>
                <span className="sm:hidden">Quiz</span>
              </TabsTrigger>
              <TabsTrigger 
                value="battle-game"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white flex items-center gap-2 justify-center"
              >
                <Swords className="h-6 w-6" />
                <span className="hidden sm:inline">Knowledge Battle</span>
                <span className="sm:hidden">Battle</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bmo-game"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center gap-2 justify-center"
              >
                <MonitorPlay className="h-6 w-6" />
                <span className="hidden sm:inline">BMO Adventure</span>
                <span className="sm:hidden">BMO</span>
              </TabsTrigger>
              <TabsTrigger 
                value="rpg-game"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex items-center gap-2 justify-center"
              >
                <Joystick className="h-6 w-6" />
                <span className="hidden sm:inline">BMO RPG</span>
                <span className="sm:hidden">RPG</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tictactoe-game"
                className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white flex items-center gap-2 justify-center"
              >
                <Grid3X3 className="h-6 w-6" />
                <span className="hidden sm:inline">BMO X.O</span>
                <span className="sm:hidden">X.O</span>
              </TabsTrigger>
              <TabsTrigger 
                value="maze-game"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white flex items-center gap-2 justify-center"
              >
                <Map className="h-6 w-6" />
                <span className="hidden sm:inline">BMO Maze</span>
                <span className="sm:hidden">Maze</span>
              </TabsTrigger>
            </TabsList>

            
            <TabsContent value="quiz-game" className="mt-0">
              <div className="bg-muted/50 rounded-lg p-6 border border-border text-center">
                <h3 className="text-xl font-bold mb-4">BMO Quiz Challenge</h3>
                <p className="text-muted-foreground mb-6">
                  Test your knowledge about BEMORA and Adventure Time! Answer the questions correctly and show how big of a fan you are.
                </p>
                <QuizGame />
              </div>
            </TabsContent>
            
            <TabsContent value="battle-game" className="mt-0">
              <div className="bg-muted/50 rounded-lg p-6 border border-border text-center">
                <h3 className="text-xl font-bold mb-4">Knowledge Battle</h3>
                <p className="text-muted-foreground mb-6">
                  Challenge the AI in a battle of knowledge! Answer questions faster and more accurately than the AI to win.
                </p>
                <BattleGame />
              </div>
            </TabsContent>
            
            <TabsContent value="bmo-game" className="mt-0">
              <div className="bg-muted/50 rounded-lg p-6 border border-border text-center">
                <h3 className="text-xl font-bold mb-4">BMO Adventure</h3>
                <p className="text-muted-foreground mb-6">
                  Help Fionna and Cake fight evil programs inside BMO's system! Experience the adventure from the "BMO" episode.
                </p>
                <BmoAdventureGame />
              </div>
            </TabsContent>
            
            <TabsContent value="rpg-game" className="mt-0">
              <div className="bg-muted/50 rounded-lg p-6 border border-border text-center">
                <h3 className="text-xl font-bold mb-4">BMO RPG Adventure</h3>
                <p className="text-muted-foreground mb-6">
                  Enter BMO's memory banks and play a retro-style Adventure Time RPG! Explore, battle enemies, and collect items.
                </p>
                <BmoRpgGame />
              </div>
            </TabsContent>

            <TabsContent value="tictactoe-game" className="mt-0">
              <div className="bg-muted/50 rounded-lg p-6 border border-border text-center">
                <h3 className="text-xl font-bold mb-4">BMO's X.O Game</h3>
                <p className="text-muted-foreground mb-6">
                  Play the classic Tic-Tac-Toe game on BMO's screen! Challenge a friend or test your skills against BMO's AI.
                </p>
                <BmoTicTacToeGame />
              </div>
            </TabsContent>

            <TabsContent value="maze-game" className="mt-0">
              <div className="bg-muted/50 rounded-lg p-6 border border-border text-center">
                <h3 className="text-xl font-bold mb-4">BMO Maze Escape</h3>
                <p className="text-muted-foreground mb-6">
                  Help BMO escape through 5 different randomly generated mazes! Navigate carefully and find the exit door.
                </p>
                <BmoMazeGame />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}