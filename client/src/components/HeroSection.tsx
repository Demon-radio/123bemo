import { motion } from "framer-motion";
import { useState } from "react";
import { RobotLogo } from "@/components/RobotLogo";
import { Button } from "@/components/ui/button";
import { ChevronDown, Play, X, Gamepad } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CatchBemoGame } from "@/components/CatchBemoGame";

export function HeroSection() {
  const [videoOpen, setVideoOpen] = useState(false);
  
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
          className="md:w-1/2 flex flex-col items-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative w-64 h-64 mb-8 animate-float">
            <RobotLogo 
              size={256} 
              className="text-primary filter drop-shadow-[0_0_8px_rgba(12,219,219,0.5)]" 
            />
          </div>
          
          {/* Buttons Container */}
          <div className="flex flex-col gap-4 mt-4">
            {/* Promo Video Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <button
                onClick={() => setVideoOpen(true)}
                className="relative bg-gradient-to-r from-primary to-secondary rounded-xl overflow-hidden shine-effect"
              >
                <div className="absolute inset-0.5 bg-background rounded-[0.7rem] z-10"></div>
                <div className="relative flex items-center gap-2 px-8 py-3 text-white z-20 group-hover:text-white transition-colors">
                  <Play className="h-6 w-6 fill-primary group-hover:fill-white transition-colors" /> 
                  <span className="font-semibold text-primary group-hover:text-white transition-colors">Watch Promo</span>
                </div>
              </button>
              
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
            </motion.div>
            
            {/* Game Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-secondary/70 to-primary/70 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative">
                <CatchBemoGame />
                
                {/* NEW badge */}
                <div className="absolute -top-3 -right-3 bg-secondary text-white text-xs font-bold py-1 px-2 rounded-full animate-bounce">
                  NEW!
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Trending Now Badge */}
          <div className="absolute -top-4 right-0 bg-secondary text-white text-sm font-bold py-1 px-3 rounded-full shadow-lg flex items-center gap-1 pulse-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            TRENDING NOW
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

      {/* Video Modal Dialog */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur-sm border-primary/20">
          <DialogTitle className="sr-only">BEMORA Promotional Video</DialogTitle>
          <div className="relative pt-[56.25%] w-full">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/B_WnTN1ni3U?autoplay=1"
              title="BEMORA Promotional Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <button 
              className="absolute top-2 right-2 bg-background/80 text-primary hover:text-secondary p-2 rounded-full z-50"
              onClick={() => setVideoOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="text-secondary">BEMORA</span> 
              <span className="text-primary">Showcase</span>
            </h3>
            <p className="text-muted-foreground text-sm">Experience the best content from all my social media channels in one place.</p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
