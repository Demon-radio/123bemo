import { motion } from "framer-motion";
import { RobotLogo } from "@/components/RobotLogo";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  const scrollToSection = (sectionId: string) => () => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16"
    >
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary filter blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary filter blur-[100px]"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 z-10 flex flex-col md:flex-row items-center justify-between py-16">
        <motion.div 
          className="md:w-1/2 text-center md:text-left mb-10 md:mb-0"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">
            Welcome to <span className="text-secondary">BEMORA</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-foreground opacity-90">
            Creating <span className="text-primary">engaging content</span> across social media platforms
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Button 
              size="lg" 
              onClick={scrollToSection("content")}
              className="bg-primary text-background hover:bg-primary/90 transition-all transform hover:scale-105"
            >
              Explore Content
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={scrollToSection("connect")}
              className="border-primary text-primary hover:bg-primary/10 transition-all transform hover:scale-105"
            >
              Connect With Me
            </Button>
          </div>
        </motion.div>

        <motion.div 
          className="md:w-1/2 flex justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative w-64 h-64 animate-float">
            <RobotLogo 
              size={256} 
              className="text-primary filter drop-shadow-[0_0_8px_rgba(12,219,219,0.5)]" 
            />
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-5 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={scrollToSection("social")} 
          className="text-primary"
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
      </motion.div>
    </section>
  );
}
