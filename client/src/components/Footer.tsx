import { RobotLogo } from "@/components/RobotLogo";
import { Link } from "wouter";
import { FaXTwitter, FaFacebookF, FaWhatsapp, FaYoutube, FaLinkedin } from "react-icons/fa6";
import { Heart } from "lucide-react";
import { useTranslations } from "@/components/LanguageToggle";

export function Footer() {
  const t = useTranslations();
  const scrollToSection = (sectionId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const navItems = [
    { name: t.home, href: "#home" },
    { name: t.content, href: "#content" },
    { name: t.games, href: "#games" },
    { name: t.about, href: "#about" },
    { name: t.connect, href: "#connect" },
  ];

  const socialLinks = [
    { icon: FaXTwitter, href: "https://x.com/Bemora_BEMO" },
    { icon: FaFacebookF, href: "https://www.facebook.com/share/12LQYx45ZEV/" },
    { icon: FaWhatsapp, href: "https://chat.whatsapp.com/CmQ8KDLZtmz0BmOKoHCzZh" },
    { icon: FaYoutube, href: "https://www.youtube.com/@Bemora-site/shorts" },
  ];

  return (
    <footer className="bg-muted py-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <RobotLogo size={40} className="text-primary mr-3" />
            <h2 className="text-2xl font-heading text-secondary font-bold">BEMORA</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={scrollToSection(item.href.substring(1))}
                className="hover:text-primary transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="flex space-x-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-background transition-all"
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BEMORA. All rights reserved.</p>
          <p className="mt-2">
            {t.footerText}
          </p>
        </div>
      </div>
    </footer>
  );
}
