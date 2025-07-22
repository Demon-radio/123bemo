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
    connectTitle: "تواصل مع بيمورا",
    footerText: "بيمورا - منشئ محتوى وعاشق للألعاب",
    watchPromo: "شاهد العرض",
    home: "الرئيسية",
    content: "المحتوى",
    games: "الألعاب",
    about: "حول",
    connect: "تواصل",
    connectDescription: "ابق على اطلاع بأحدث المحتوى الخاص بي وتواصل معي على منصاتك المفضلة.",
    contactMe: "تواصل معي",
    aboutDescription1: "مرحباً بكم في عالمي الرقمي! أنا منشئ بيمورا، شغوف بالتكنولوجيا والألعاب وإنشاء محتوى جذاب يتواصل مع الجماهير عبر منصات متعددة.",
    aboutDescription2: "ما بدأ كهواية تطور إلى رحلة مخصصة لإنشاء المحتوى، حيث أشارك تجاربي ورؤيتي والترفيه مع مجتمع متنامي من المتابعين.",
    aboutDescription3: "مهمتي هي إنشاء محتوى لا يسلي فقط بل يعلم ويلهم أيضاً. سواء كنت هنا لمراجعات التقنية أو البث المباشر للألعاب أو مجرد التواصل مع أشخاص متشابهين في التفكير، بيمورا هو منزلك الرقمي.",
    videos: "فيديوهات",
    followers: "متابعين",
    years: "سنوات",
    platforms: "منصات"
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
    connectTitle: "Conectar con BEMORA",
    footerText: "BEMORA - Creador de Contenido y Entusiasta de Juegos",
    watchPromo: "Ver Promoción",
    home: "Inicio",
    content: "Contenido",
    games: "Juegos",
    about: "Acerca",
    connect: "Conectar",
    connectDescription: "Mantente actualizado con mi contenido más reciente y conéctate conmigo en tus plataformas favoritas.",
    contactMe: "Contactarme",
    aboutDescription1: "¡Bienvenido a mi universo digital! Soy el creador detrás de BEMORA, apasionado por la tecnología, los juegos y la creación de contenido atractivo que conecta con audiencias en múltiples plataformas.",
    aboutDescription2: "Lo que comenzó como un pasatiempo ha evolucionado hacia un viaje dedicado de creación de contenido, donde comparto mis experiencias, perspectivas y entretenimiento con una creciente comunidad de seguidores.",
    aboutDescription3: "Mi misión es crear contenido que no solo entretenga sino que también informe e inspire. Ya sea que estés aquí para reseñas de tecnología, transmisiones de juegos o simplemente para conectarte con personas afines, BEMORA es tu hogar digital.",
    videos: "Videos",
    followers: "Seguidores",
    years: "Años",
    platforms: "Plataformas"
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
    connectTitle: "Connecter avec BEMORA",
    footerText: "BEMORA - Créateur de Contenu et Passionné de Jeux",
    watchPromo: "Regarder la Promo",
    home: "Accueil",
    content: "Contenu",
    games: "Jeux",
    about: "À propos",
    connect: "Connecter",
    connectDescription: "Restez informé de mon contenu le plus récent et connectez-vous avec moi sur vos plateformes préférées.",
    contactMe: "Me Contacter",
    aboutDescription1: "Bienvenue dans mon univers numérique ! Je suis le créateur derrière BEMORA, passionné par la technologie, les jeux et la création de contenu engageant qui connecte avec les audiences sur plusieurs plateformes.",
    aboutDescription2: "Ce qui a commencé comme un passe-temps a évolué vers un voyage dédié de création de contenu, où je partage mes expériences, perspectives et divertissement avec une communauté grandissante de followers.",
    aboutDescription3: "Ma mission est de créer du contenu qui non seulement divertit mais aussi informe et inspire. Que vous soyez ici pour des critiques tech, des streams de jeux ou simplement pour vous connecter avec des personnes partageant les mêmes idées, BEMORA est votre maison numérique.",
    videos: "Vidéos",
    followers: "Abonnés",
    years: "Années",
    platforms: "Plateformes"
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
    connectTitle: "Verbinden mit BEMORA",
    footerText: "BEMORA - Content Creator & Gaming-Enthusiast",
    watchPromo: "Promo Ansehen",
    home: "Startseite",
    content: "Inhalte",
    games: "Spiele",
    about: "Über",
    connect: "Verbinden",
    connectDescription: "Bleiben Sie über meine neuesten Inhalte auf dem Laufenden und verbinden Sie sich mit mir auf Ihren bevorzugten Plattformen.",
    contactMe: "Kontaktieren Sie mich",
    aboutDescription1: "Willkommen in meinem digitalen Universum! Ich bin der Schöpfer hinter BEMORA, leidenschaftlich über Technologie, Gaming und die Erstellung ansprechender Inhalte, die mit Audiences auf mehreren Plattformen verbinden.",
    aboutDescription2: "Was als Hobby begann, hat sich zu einer dedizierten Reise der Inhaltserstellung entwickelt, bei der ich meine Erfahrungen, Erkenntnisse und Unterhaltung mit einer wachsenden Gemeinschaft von Followern teile.",
    aboutDescription3: "Meine Mission ist es, Inhalte zu erstellen, die nicht nur unterhalten, sondern auch informieren und inspirieren. Ob Sie hier für Tech-Reviews, Gaming-Streams oder einfach nur sind, um sich mit Gleichgesinnten zu verbinden, BEMORA ist Ihr digitales Zuhause.",
    videos: "Videos",
    followers: "Follower",
    years: "Jahre",
    platforms: "Plattformen"
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
    connectTitle: "BEMORAと接続",
    footerText: "BEMORA - コンテンツクリエイター＆ゲーム愛好家",
    watchPromo: "プロモを見る",
    home: "ホーム",
    content: "コンテンツ",
    games: "ゲーム",
    about: "について",
    connect: "接続",
    connectDescription: "私の最新コンテンツの情報を得て、お気に入りのプラットフォームで私とつながりましょう。",
    contactMe: "お問い合わせ",
    aboutDescription1: "私のデジタル宇宙へようこそ！私はBEMORAの背後にあるクリエイターで、テクノロジー、ゲーム、そして複数のプラットフォームでオーディエンスとつながる魅力的なコンテンツの作成に情熱を持っています。",
    aboutDescription2: "趣味として始まったものが、コンテンツ作成の専門的な旅に発展し、成長するフォロワーコミュニティと私の経験、洞察、エンターテイメントを共有しています。",
    aboutDescription3: "私のミッションは、単に楽しませるだけでなく、情報を提供し、インスピレーションを与えるコンテンツを作成することです。テクノロジーのレビュー、ゲーミングストリーミング、または同じ志を持つ個人とのつながりのためにここにいる場合でも、BEMORAはあなたのデジタルホームです。",
    videos: "動画",
    followers: "フォロワー",
    years: "年",
    platforms: "プラットフォーム"
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
    connectTitle: "BEMORA와 연결",
    footerText: "BEMORA - 콘텐츠 크리에이터 & 게임 애호가",
    watchPromo: "프로모 시청",
    home: "홈",
    content: "콘텐츠",
    games: "게임",
    about: "소개",
    connect: "연결",
    connectDescription: "최신 콘텐츠 업데이트를 받고 선호하는 플랫폼에서 저와 연결하세요.",
    contactMe: "연락하기",
    aboutDescription1: "디지털 우주에 오신 것을 환영합니다! 저는 BEMORA의 창작자로, 기술, 게임, 그리고 여러 플랫폼에서 관객과 연결하는 매력적인 콘텐츠 제작에 열정을 가지고 있습니다.",
    aboutDescription2: "취미로 시작된 것이 콘텐츠 제작의 전문적인 여정으로 발전했으며, 성장하는 팔로워 커뮤니티와 경험, 통찰력, 엔터테인먼트를 공유하고 있습니다.",
    aboutDescription3: "제 사명은 단순히 즐겁게 하는 것뿐만 아니라 정보를 제공하고 영감을 주는 콘텐츠를 만드는 것입니다. 기술 리뷰, 게임 스트리밍, 또는 단순히 같은 생각을 가진 사람들과 연결하기 위해 여기 계시든, BEMORA는 여러분의 디지털 홈입니다.",
    videos: "동영상",
    followers: "팔로워",
    years: "년",
    platforms: "플랫폼"
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
    connectTitle: "与BEMORA连接",
    footerText: "BEMORA - 内容创作者和游戏爱好者",
    watchPromo: "观看宣传片",
    home: "首页",
    content: "内容",
    games: "游戏",
    about: "关于",
    connect: "连接",
    connectDescription: "及时了解我的最新内容并在您喜欢的平台上与我联系。",
    contactMe: "联系我",
    aboutDescription1: "欢迎来到我的数字宇宙！我是BEMORA背后的创作者，对技术、游戏以及创建在多个平台上与观众连接的引人入胜内容充满热情。",
    aboutDescription2: "从一个爱好开始，发展成为专门的内容创作之旅，我与不断增长的关注者社区分享我的经验、见解和娱乐内容。",
    aboutDescription3: "我的使命是创建不仅娱乐而且提供信息和启发的内容。无论您是来看技术评论、游戏直播，还是只是想与志同道合的人联系，BEMORA都是您的数字家园。",
    videos: "视频",
    followers: "关注者",
    years: "年",
    platforms: "平台"
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