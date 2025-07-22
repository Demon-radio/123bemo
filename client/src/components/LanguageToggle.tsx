import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

interface LanguageContent {
  [key: string]: {
    heroTitle: string;
    heroSubtitle: string;
    exploreContent: string;
    playGames: string;
    connectWithMe: string;
    gamesTitle: string;
    aboutTitle: string;
    contentTitle: string;
    connectTitle: string;
    footerText: string;
    watchPromo: string;
    home: string;
    content: string;
    games: string;
    about: string;
    connect: string;
    connectDescription?: string;
    contactMe?: string;
    aboutDescription1?: string;
    aboutDescription2?: string;
    aboutDescription3?: string;
    videos?: string;
    followers?: string;
    years?: string;
    platforms?: string;
  };
}

const translations: LanguageContent = {
  en: {
    heroTitle: "Welcome to BEMORA",
    heroSubtitle: "Creating engaging content across social media platforms",
    exploreContent: "Explore Content",
    playGames: "Play Games",
    connectWithMe: "Connect With Me",
    gamesTitle: "BEMORA Games",
    aboutTitle: "About BEMORA",
    contentTitle: "Latest Content",
    connectTitle: "Connect with BEMORA",
    footerText: "BEMORA - Content Creator & Gaming Enthusiast",
    watchPromo: "Watch Promo",
    home: "Home",
    content: "Content",
    games: "Games",
    about: "About",
    connect: "Connect",
    connectDescription: "Stay updated with my latest content and connect with me on your favorite platforms.",
    contactMe: "Contact Me",
    aboutDescription1: "Welcome to my digital universe! I'm the creator behind BEMORA, passionate about technology, gaming, and creating engaging content that connects with audiences across multiple platforms.",
    aboutDescription2: "What began as a hobby has evolved into a dedicated journey of content creation, where I share my experiences, insights, and entertainment with a growing community of followers.",
    aboutDescription3: "My mission is to create content that not only entertains but also informs and inspires. Whether you're here for tech reviews, gaming streams, or just to connect with like-minded individuals, BEMORA is your digital home.",
    videos: "Videos",
    followers: "Followers",
    years: "Years",
    platforms: "Platforms"
  },
  ar: {
    heroTitle: "مرحباً بكم في بيمورا",
    heroSubtitle: "إنشاء محتوى جذاب عبر منصات التواصل الاجتماعي",
    exploreContent: "استكشف المحتوى",
    playGames: "العب الألعاب",
    connectWithMe: "تواصل معي",
    gamesTitle: "ألعاب بيمورا",
    aboutTitle: "حول بيمورا",
    contentTitle: "أحدث المحتوى",
    connectTitle: "تواصل",
    footerText: "بيمورا - منشئ محتوى وعاشق للألعاب",
    watchPromo: "شاهد العرض",
    home: "الرئيسية",
    content: "المحتوى",
    games: "الألعاب",
    about: "حول",
    connect: "تواصل"
  },
  es: {
    heroTitle: "Bienvenido a BEMORA",
    heroSubtitle: "Creando contenido atractivo en plataformas de redes sociales",
    exploreContent: "Explorar Contenido",
    playGames: "Jugar Juegos",
    connectWithMe: "Conéctate Conmigo",
    gamesTitle: "Juegos BEMORA",
    aboutTitle: "Acerca de BEMORA",
    contentTitle: "Contenido Reciente",
    connectTitle: "Conectar",
    footerText: "BEMORA - Creador de Contenido y Entusiasta de Juegos",
    watchPromo: "Ver Promoción",
    home: "Inicio",
    content: "Contenido",
    games: "Juegos",
    about: "Acerca",
    connect: "Conectar"
  },
  fr: {
    heroTitle: "Bienvenue chez BEMORA",
    heroSubtitle: "Créer du contenu engageant sur les plateformes de médias sociaux",
    exploreContent: "Explorer le Contenu",
    playGames: "Jouer aux Jeux",
    connectWithMe: "Connectez-vous avec Moi",
    gamesTitle: "Jeux BEMORA",
    aboutTitle: "À propos de BEMORA",
    contentTitle: "Contenu Récent",
    connectTitle: "Connecter",
    footerText: "BEMORA - Créateur de Contenu et Passionné de Jeux",
    watchPromo: "Regarder la Promo",
    home: "Accueil",
    content: "Contenu",
    games: "Jeux",
    about: "À propos",
    connect: "Connecter"
  },
  de: {
    heroTitle: "Willkommen bei BEMORA",
    heroSubtitle: "Erstellung ansprechender Inhalte auf Social-Media-Plattformen",
    exploreContent: "Inhalte Erkunden",
    playGames: "Spiele Spielen",
    connectWithMe: "Verbinde dich mit Mir",
    gamesTitle: "BEMORA Spiele",
    aboutTitle: "Über BEMORA",
    contentTitle: "Neueste Inhalte",
    connectTitle: "Verbinden",
    footerText: "BEMORA - Content Creator & Gaming-Enthusiast",
    watchPromo: "Promo Ansehen",
    home: "Startseite",
    content: "Inhalte",
    games: "Spiele",
    about: "Über",
    connect: "Verbinden"
  },
  ja: {
    heroTitle: "BEMORAへようこそ",
    heroSubtitle: "ソーシャルメディアプラットフォーム全体で魅力的なコンテンツを作成",
    exploreContent: "コンテンツを探索",
    playGames: "ゲームをプレイ",
    connectWithMe: "私と繋がる",
    gamesTitle: "BEMORAゲーム",
    aboutTitle: "BEMORAについて",
    contentTitle: "最新コンテンツ",
    connectTitle: "接続",
    footerText: "BEMORA - コンテンツクリエイター＆ゲーム愛好家",
    watchPromo: "プロモを見る",
    home: "ホーム",
    content: "コンテンツ",
    games: "ゲーム",
    about: "について",
    connect: "接続"
  },
  ko: {
    heroTitle: "BEMORA에 오신 것을 환영합니다",
    heroSubtitle: "소셜 미디어 플랫폼에서 매력적인 콘텐츠 제작",
    exploreContent: "콘텐츠 탐색",
    playGames: "게임 플레이",
    connectWithMe: "나와 연결",
    gamesTitle: "BEMORA 게임",
    aboutTitle: "BEMORA 소개",
    contentTitle: "최신 콘텐츠",
    connectTitle: "연결",
    footerText: "BEMORA - 콘텐츠 크리에이터 & 게임 애호가",
    watchPromo: "프로모 시청",
    home: "홈",
    content: "콘텐츠",
    games: "게임",
    about: "소개",
    connect: "연결"
  },
  zh: {
    heroTitle: "欢迎来到BEMORA",
    heroSubtitle: "在社交媒体平台上创建引人入胜的内容",
    exploreContent: "探索内容",
    playGames: "玩游戏",
    connectWithMe: "与我联系",
    gamesTitle: "BEMORA游戏",
    aboutTitle: "关于BEMORA",
    contentTitle: "最新内容",
    connectTitle: "连接",
    footerText: "BEMORA - 内容创作者和游戏爱好者",
    watchPromo: "观看宣传片",
    home: "首页",
    content: "内容",
    games: "游戏",
    about: "关于",
    connect: "连接"
  }
};

export function LanguageToggle() {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("bemora-language") || "en";
    setCurrentLanguage(savedLanguage);
    document.documentElement.lang = savedLanguage;
    if (savedLanguage === "ar") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem("bemora-language", languageCode);
    document.documentElement.lang = languageCode;
    
    // Set text direction for Arabic
    if (languageCode === "ar") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent("languageChange", { detail: languageCode }));
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-background/80 backdrop-blur-sm border-primary/30 hover:border-primary/60"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang.flag} {currentLang.name}</span>
          <span className="sm:hidden">{currentLang.flag}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-3 cursor-pointer ${
              currentLanguage === language.code ? "bg-primary/10 text-primary" : ""
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook to get current language translations
export function useTranslations() {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("bemora-language") || "en";
    setCurrentLanguage(savedLanguage);

    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail);
    };

    window.addEventListener("languageChange", handleLanguageChange as EventListener);
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener);
  }, []);

  return translations[currentLanguage] || translations.en;
}