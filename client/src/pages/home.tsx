import { NavBar } from "@/components/NavBar";
import { HeroSection } from "@/components/HeroSection";
import { SocialLinksSection } from "@/components/SocialLinksSection";
import { ContentShowcase } from "@/components/ContentShowcase";
import { GamesSection } from "@/components/GamesSection";
import { AboutSection } from "@/components/AboutSection";
import { ConnectSection } from "@/components/ConnectSection";
import { Footer } from "@/components/Footer";
import { HeaderAd, InContentAd, FooterAd } from "@/components/GoogleAd";
import { HomePageSEO } from "@/components/SEOHead";

export function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground grid-pattern">
      <HomePageSEO />
      <NavBar />
      <HeroSection />
      <HeaderAd />
      <SocialLinksSection />
      <ContentShowcase />
      <InContentAd />
      <GamesSection />
      <AboutSection />
      <InContentAd />
      <ConnectSection />
      <FooterAd />
      <Footer />
    </div>
  );
}
