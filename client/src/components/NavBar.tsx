import { useState } from "react";
import { Link } from "wouter";
import { RobotLogo } from "@/components/RobotLogo";
import { LanguageToggle, useTranslations } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-mobile";

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const t = useTranslations();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const scrollToSection = (sectionId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      closeMenu();
    }
  };

  const navItems = [
    { name: t.home, href: "#home" },
    { name: t.content, href: "#content" },
    { name: t.games, href: "#games" },
    { name: t.about, href: "#about" },
    { name: t.connect, href: "#connect" },
  ];

  return (
    <header className="fixed w-full z-50 bg-background bg-opacity-90 backdrop-blur-sm">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <RobotLogo size={40} className="text-primary" />
          <h1 className="text-2xl font-heading text-secondary font-bold">BEMORA</h1>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={scrollToSection(item.href.substring(1))}
              className="nav-item font-medium hover:text-primary transition-colors"
            >
              {item.name}
            </a>
          ))}
          <LanguageToggle />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <LanguageToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu} 
            className="text-primary focus:outline-none"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("md:hidden bg-muted overflow-hidden")}
          >
            <div className="px-4 py-2 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={scrollToSection(item.href.substring(1))}
                  className="block py-2 text-center hover:bg-background hover:text-primary rounded transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
