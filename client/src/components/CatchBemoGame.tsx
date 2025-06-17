import { Gamepad } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CatchBemoGame() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <Button 
      onClick={() => scrollToSection("games")}
      variant="outline"
      className="w-full bg-primary/10 border-primary text-primary hover:bg-primary/20 shine-effect flex items-center gap-2 px-8 py-3 justify-center"
    >
      <Gamepad className="h-5 w-5" />
      <span className="font-semibold">Play with BEMORA</span>
    </Button>
  );
}