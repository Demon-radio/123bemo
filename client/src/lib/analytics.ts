// Google Analytics Helper Functions

/**
 * Track a page view in Google Analytics
 * @param path - Page path (e.g., '/games', '/about')
 * @param title - Page title 
 */
export const trackPageView = (path: string, title: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-BSZKD0NJ69', {
      page_path: path,
      page_title: title,
    });
  }
};

/**
 * Track an event in Google Analytics
 * @param action - Event action (e.g., 'play_game', 'submit_form')
 * @param category - Event category (e.g., 'games', 'engagement')
 * @param label - Optional label for the event
 * @param value - Optional numeric value for the event
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

/**
 * Track when a user starts a game
 * @param gameName - Name of the game being played
 */
export const trackGameStart = (gameName: string) => {
  trackEvent('game_start', 'games', gameName);
};

/**
 * Track when a user completes a game
 * @param gameName - Name of the game completed
 * @param score - Final score achieved in the game
 */
export const trackGameComplete = (gameName: string, score: number) => {
  trackEvent('game_complete', 'games', gameName, score);
};

// Add TypeScript interface for global window object
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: any
    ) => void;
    dataLayer: any[];
  }
}