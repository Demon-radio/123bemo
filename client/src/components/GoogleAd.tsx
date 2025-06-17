import { useEffect, useRef } from 'react';

interface GoogleAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'banner' | 'leaderboard' | 'square';
  className?: string;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function GoogleAd({ 
  adSlot, 
  adFormat = 'auto', 
  className = '',
  responsive = true 
}: GoogleAdProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Google Ads error:', error);
    }
  }, []);

  const getAdSize = () => {
    switch (adFormat) {
      case 'rectangle':
        return { width: 300, height: 250 };
      case 'banner':
        return { width: 728, height: 90 };
      case 'leaderboard':
        return { width: 728, height: 90 };
      case 'square':
        return { width: 250, height: 250 };
      default:
        return responsive ? {} : { width: 320, height: 100 };
    }
  };

  const adSize = getAdSize();

  return (
    <div className={`google-ad-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...adSize,
        }}
        data-ad-client="ca-pub-XXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={responsive ? 'auto' : undefined}
        data-full-width-responsive={responsive ? 'true' : undefined}
      />
    </div>
  );
}

// Predefined ad components for common placements
export function HeaderAd() {
  return (
    <GoogleAd 
      adSlot="1234567890"
      adFormat="banner"
      className="w-full max-w-4xl mx-auto my-4"
    />
  );
}

export function SidebarAd() {
  return (
    <GoogleAd 
      adSlot="1234567891"
      adFormat="rectangle"
      className="w-full max-w-xs mx-auto my-4"
    />
  );
}

export function FooterAd() {
  return (
    <GoogleAd 
      adSlot="1234567892"
      adFormat="leaderboard"
      className="w-full max-w-4xl mx-auto my-4"
    />
  );
}

export function InContentAd() {
  return (
    <GoogleAd 
      adSlot="1234567893"
      adFormat="rectangle"
      className="w-full max-w-sm mx-auto my-6"
    />
  );
}