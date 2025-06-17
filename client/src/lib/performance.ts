// Performance monitoring and optimization utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Core Web Vitals monitoring
  measureCLS(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            this.metrics.set('CLS', (entry as any).value);
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  measureFID(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.set('FID', (entry as any).processingStart - entry.startTime);
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  measureLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.set('LCP', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  // Page load performance
  measurePageLoad(): void {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.metrics.set('TTFB', navigation.responseStart - navigation.requestStart);
      this.metrics.set('FCP', performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0);
      this.metrics.set('LoadTime', navigation.loadEventEnd - navigation.fetchStart);
      this.metrics.set('DOMContentLoaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
    });
  }

  // Send metrics to analytics
  reportMetrics(): void {
    if (typeof window !== 'undefined' && window.gtag) {
      this.metrics.forEach((value, key) => {
        window.gtag('event', 'performance_metric', {
          metric_name: key,
          metric_value: Math.round(value),
          custom_parameter: 'web_vitals'
        });
      });
    }
  }

  // Initialize all monitoring
  init(): void {
    this.measurePageLoad();
    this.measureCLS();
    this.measureFID();
    this.measureLCP();

    // Report metrics after page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => this.reportMetrics(), 3000);
    });
  }
}

// SEO and performance optimization helpers
export const SEOUtils = {
  // Generate breadcrumb schema
  generateBreadcrumbSchema(items: Array<{name: string, url: string}>): object {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };
  },

  // Generate FAQ schema
  generateFAQSchema(faqs: Array<{question: string, answer: string}>): object {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  },

  // Generate video schema
  generateVideoSchema(video: {
    name: string,
    description: string,
    thumbnailUrl: string,
    uploadDate: string,
    duration: string
  }): object {
    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": video.name,
      "description": video.description,
      "thumbnailUrl": video.thumbnailUrl,
      "uploadDate": video.uploadDate,
      "duration": video.duration,
      "embedUrl": "https://www.youtube.com/embed/B_WnTN1ni3U"
    };
  }
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceMonitor.getInstance().init();
}