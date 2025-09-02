// Google Analytics 4 Integration

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface AnalyticsConfig {
  measurementId?: string;
  debug?: boolean;
  enabled?: boolean;
}

class Analytics {
  private initialized = false;
  private config: AnalyticsConfig = {};
  private queue: Array<() => void> = [];

  initialize(config: AnalyticsConfig): void {
    if (this.initialized || !config.measurementId || !config.enabled) {
      return;
    }

    this.config = config;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer?.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', config.measurementId, {
      debug_mode: config.debug,
      send_page_view: false, // We'll manually track page views
    });

    this.initialized = true;

    // Process queued events
    this.queue.forEach(fn => fn());
    this.queue = [];
  }

  private execute(fn: () => void): void {
    if (this.initialized) {
      fn();
    } else {
      this.queue.push(fn);
    }
  }

  // Page tracking
  pageView(path: string, title?: string): void {
    this.execute(() => {
      if (window.gtag && this.config.measurementId) {
        window.gtag('event', 'page_view', {
          page_path: path,
          page_title: title || document.title,
          page_location: window.location.href,
        });
      }
    });
  }

  // Event tracking
  event(
    action: string,
    category?: string,
    label?: string,
    value?: number,
    parameters?: Record<string, any>
  ): void {
    this.execute(() => {
      if (window.gtag) {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
          value,
          ...parameters,
        });
      }
    });
  }

  // E-commerce tracking
  purchase(transaction: {
    transactionId: string;
    value: number;
    currency: string;
    items: Array<{
      id: string;
      name: string;
      category?: string;
      quantity: number;
      price: number;
    }>;
  }): void {
    this.execute(() => {
      if (window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: transaction.transactionId,
          value: transaction.value,
          currency: transaction.currency,
          items: transaction.items.map(item => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.category,
            quantity: item.quantity,
            price: item.price,
          })),
        });
      }
    });
  }

  // User properties
  setUserProperties(properties: Record<string, any>): void {
    this.execute(() => {
      if (window.gtag) {
        window.gtag('set', 'user_properties', properties);
      }
    });
  }

  // User ID for cross-device tracking
  setUserId(userId: string | null): void {
    this.execute(() => {
      if (window.gtag && this.config.measurementId) {
        if (userId) {
          window.gtag('config', this.config.measurementId, {
            user_id: userId,
          });
        } else {
          // Clear user ID
          window.gtag('config', this.config.measurementId, {
            user_id: undefined,
          });
        }
      }
    });
  }

  // Custom dimensions
  setCustomDimension(name: string, value: string): void {
    this.execute(() => {
      if (window.gtag) {
        window.gtag('set', {
          [name]: value,
        });
      }
    });
  }

  // Timing events
  timing(
    category: string,
    variable: string,
    value: number,
    label?: string
  ): void {
    this.execute(() => {
      if (window.gtag) {
        window.gtag('event', 'timing_complete', {
          event_category: category,
          name: variable,
          value,
          event_label: label,
        });
      }
    });
  }

  // Exception tracking
  exception(description: string, fatal = false): void {
    this.execute(() => {
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description,
          fatal,
        });
      }
    });
  }

  // Social interactions
  social(network: string, action: string, target: string): void {
    this.execute(() => {
      if (window.gtag) {
        window.gtag('event', 'social', {
          social_network: network,
          social_action: action,
          social_target: target,
        });
      }
    });
  }

  // Search tracking
  search(query: string, category?: string, resultsCount?: number): void {
    this.execute(() => {
      if (window.gtag) {
        window.gtag('event', 'search', {
          search_term: query,
          search_category: category,
          search_results: resultsCount,
        });
      }
    });
  }

  // Login tracking
  login(method: string): void {
    this.execute(() => {
      if (window.gtag) {
        window.gtag('event', 'login', {
          method,
        });
      }
    });
  }

  // Sign up tracking
  signUp(method: string): void {
    this.execute(() => {
      if (window.gtag) {
        window.gtag('event', 'sign_up', {
          method,
        });
      }
    });
  }

  // Share tracking
  share(method: string, contentType: string, itemId?: string): void {
    this.execute(() => {
      if (window.gtag) {
        window.gtag('event', 'share', {
          method,
          content_type: contentType,
          item_id: itemId,
        });
      }
    });
  }
}

// Singleton instance
export const analytics = new Analytics();

// Helper functions for common events
export const trackClick = (element: string, category = 'UI') => {
  analytics.event('click', category, element);
};

export const trackFormSubmit = (formName: string, success: boolean) => {
  analytics.event('form_submit', 'Form', formName, success ? 1 : 0);
};

export const trackError = (error: string, fatal = false) => {
  analytics.exception(error, fatal);
};

export const trackApiResponse = (endpoint: string, status: number, duration: number) => {
  analytics.timing('API', endpoint, duration, `Status: ${status}`);
};

export const trackFeatureUsage = (feature: string, variant?: string) => {
  analytics.event('feature_use', 'Feature', feature, undefined, { variant });
};

export const trackUserAction = (action: string, target: string, value?: number) => {
  analytics.event(action, 'User Action', target, value);
};