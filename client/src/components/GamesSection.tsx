import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CatchBemoGame } from "./CatchBemoGame";
import { QuizGame } from "./QuizGame";
import { BattleGame } from "./BattleGame";
import { Gamepad2, Brain, Swords } from "lucide-react";

export function GamesSection() {
  const [activeTab, setActiveTab] = useState("catch-game");

  return (
    <section id="games" className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading text-center mb-12">
          <span className="gradient-text">BEMORA Games</span>
        </h2>

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
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger 
                value="catch-game"
                className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2 justify-center"
              >
                <Gamepad2 className="h-4 w-4" />
                <span className="hidden sm:inline">Catch BEMORA</span>
                <span className="sm:hidden">Catch</span>
              </TabsTrigger>
              <TabsTrigger 
                value="quiz-game"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white flex items-center gap-2 justify-center"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">BEMORA Quiz</span>
                <span className="sm:hidden">Quiz</span>
              </TabsTrigger>
              <TabsTrigger 
                value="battle-game"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white flex items-center gap-2 justify-center"
              >
                <Swords className="h-4 w-4" />
                <span className="hidden sm:inline">Knowledge Battle</span>
                <span className="sm:hidden">Battle</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="catch-game" className="mt-0">
              <div className="bg-muted/50 rounded-lg p-6 border border-border text-center">
                <h3 className="text-xl font-bold mb-4">Catch BEMORA Game</h3>
                <p className="text-muted-foreground mb-6">
                  Test your reflexes! Try to catch the BEMORA logo as many times as you can before the time runs out.
                </p>
                <CatchBemoGame />
              </div>
            </TabsContent>
            
            <TabsContent value="quiz-game" className="mt-0">
              <div className="bg-muted/50 rounded-lg p-6 border border-border text-center">
                <h3 className="text-xl font-bold mb-4">BEMORA Quiz Challenge</h3>
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
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}