import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: object;
}

export function SEOHead({
  title = "BEMORA - Mustafa Bemo | Content Creator & Gaming Enthusiast",
  description = "Join BEMORA (Mustafa Bemo) for engaging tech content, gaming videos, live streaming, and interactive games. Follow on YouTube, Twitter, Facebook & WhatsApp for daily updates.",
  keywords = "BEMORA, Mustafa Bemo, content creator, gaming, tech content, YouTube creator, live streaming, social media, BMO tools, interactive games, Arab content creator",
  ogImage = "https://bemora.vercel.app/favicon.jpg",
  canonicalUrl = "https://bemora.vercel.app/",
  structuredData
}: SEOHeadProps) {

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) || 
                 document.querySelector(`meta[property="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update basic meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    
    // Update Open Graph tags
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:image', ogImage);
    updateMeta('og:url', canonicalUrl);
    
    // Update Twitter tags
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Add structured data if provided
    if (structuredData) {
      let structuredScript = document.querySelector('#structured-data');
      if (!structuredScript) {
        structuredScript = document.createElement('script');
        structuredScript.setAttribute('type', 'application/ld+json');
        structuredScript.setAttribute('id', 'structured-data');
        document.head.appendChild(structuredScript);
      }
      structuredScript.textContent = JSON.stringify(structuredData);
    }

  }, [title, description, keywords, ogImage, canonicalUrl, structuredData]);

  return null;
}

// Predefined SEO components for different sections
export function HomePageSEO() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "BEMORA - Home",
    "description": "Official website of BEMORA (Mustafa Bemo) - Content creator featuring gaming, tech content, and interactive experiences",
    "url": "https://bemora.vercel.app/",
    "mainEntity": {
      "@type": "Person",
      "name": "Mustafa Bemo",
      "alternateName": "BEMORA",
      "jobTitle": "Content Creator",
      "description": "Content creator specializing in tech, gaming, and social media entertainment"
    }
  };

  return <SEOHead structuredData={structuredData} />;
}

export function GamesSEO() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "BEMORA Games - Interactive Gaming Experience",
    "description": "Play interactive games created by BEMORA including RPG adventures, quiz games, and more",
    "url": "https://bemora.vercel.app/#games",
    "about": {
      "@type": "VideoGame",
      "name": "BEMORA Interactive Games",
      "genre": ["RPG", "Quiz", "Adventure"],
      "gamePlatform": "Web Browser"
    }
  };

  return (
    <SEOHead
      title="BEMORA Games - Interactive Gaming Experience | Mustafa Bemo"
      description="Play interactive games created by BEMORA including RPG adventures, quiz games, and adventure games. Free browser-based gaming experience."
      keywords="BEMORA games, interactive games, browser games, RPG games, quiz games, Mustafa Bemo games, online gaming"
      canonicalUrl="https://bemora.vercel.app/#games"
      structuredData={structuredData}
    />
  );
}

export function ContentSEO() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "BEMORA Content - Tech & Gaming Videos",
    "description": "Discover BEMORA's latest content including tech reviews, gaming videos, and live streams across YouTube, Facebook, and other platforms",
    "url": "https://bemora.vercel.app/#content",
    "about": {
      "@type": "CreativeWork",
      "name": "BEMORA Content Collection",
      "creator": {
        "@type": "Person",
        "name": "Mustafa Bemo"
      }
    }
  };

  return (
    <SEOHead
      title="BEMORA Content - Tech & Gaming Videos | Mustafa Bemo"
      description="Discover BEMORA's latest content including tech reviews, gaming videos, tutorials, and live streams. Updated daily across all platforms."
      keywords="BEMORA content, tech videos, gaming videos, YouTube content, live streaming, tech reviews, gaming tutorials"
      canonicalUrl="https://bemora.vercel.app/#content"
      structuredData={structuredData}
    />
  );
}