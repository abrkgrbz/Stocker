// Analytics Service for Registration & Auth
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    mixpanel?: any;
    amplitude?: any;
    heap?: any;
    _paq?: any[]; // Matomo
    analytics?: any; // Segment
  }
}

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

interface UserProperties {
  userId?: string;
  email?: string;
  plan?: string;
  company?: string;
  referralSource?: string;
  [key: string]: any;
}

class AnalyticsService {
  private isInitialized = false;
  private queue: AnalyticsEvent[] = [];
  private userId: string | null = null;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadGoogleAnalytics();
    this.loadMixpanel();
    this.processQueue();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private loadGoogleAnalytics() {
    const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
    if (!GA_MEASUREMENT_ID) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer!.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: false,
        custom_map: {
          dimension1: 'user_type',
          dimension2: 'company_size',
          dimension3: 'referral_source'
        }
      });
      this.isInitialized = true;
    };

    document.head.appendChild(script);
  }

  private loadMixpanel() {
    const MIXPANEL_TOKEN = process.env.REACT_APP_MIXPANEL_TOKEN;
    if (!MIXPANEL_TOKEN) return;

    (function(f: any, b: any) {
      if (!b.__SV) {
        var e: any, g: any, i: any, h: any;
        window.mixpanel = b;
        b._i = [];
        b.init = function(e: any, f: any, c: any) {
          function g(a: any, d: any) {
            var b = d.split(".");
            2 == b.length && ((a = a[b[0]]), (d = b[1]));
            a[d] = function() {
              a.push([d].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          var a = b;
          "undefined" !== typeof c ? (a = b[c] = []) : (c = "mixpanel");
          a.people = a.people || [];
          a.toString = function(a: any) {
            var d = "mixpanel";
            "mixpanel" !== c && (d += "." + c);
            a || (d += " (stub)");
            return d;
          };
          a.people.toString = function() {
            return a.toString(1) + ".people (stub)";
          };
          i = "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
          for (h = 0; h < i.length; h++) g(a, i[h]);
          var j = "set set_once union unset remove delete".split(" ");
          a.get_group = function() {
            function b(c: any) {
              d[c] = function() {
                call2_args = arguments;
                call2 = [c].concat(Array.prototype.slice.call(call2_args, 0));
                a.push([e, call2]);
              };
            }
            for (var d: any = {}, e = ["get_group"].concat(Array.prototype.slice.call(arguments, 0)), c = 0; c < j.length; c++) b(j[c]);
            return d;
          };
          b._i.push([e, f, c]);
        };
        b.__SV = 1.2;
        e = f.createElement("script");
        e.type = "text/javascript";
        e.async = !0;
        e.src = "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
        g = f.getElementsByTagName("script")[0];
        g.parentNode!.insertBefore(e, g);
      }
    })(document, window.mixpanel || []);

    window.mixpanel?.init(MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === 'development',
      track_pageview: true,
      persistence: 'localStorage'
    });
  }

  private processQueue() {
    if (!this.isInitialized) {
      setTimeout(() => this.processQueue(), 100);
      return;
    }

    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.sendEvent(event.name, event.properties);
      }
    }
  }

  private sendEvent(eventName: string, properties?: Record<string, any>) {
    const eventData = {
      ...properties,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      user_id: this.userId,
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      locale: navigator.language
    };

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, eventData);
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track(eventName, eventData);
    }

    // Custom backend analytics
    this.sendToBackend(eventName, eventData);
  }

  private async sendToBackend(eventName: string, properties: Record<string, any>) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: eventName,
          properties,
          session_id: this.sessionId,
          user_id: this.userId
        })
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  // Public methods
  public track(eventName: string, properties?: Record<string, any>) {
    if (!this.isInitialized) {
      this.queue.push({ name: eventName, properties });
      return;
    }
    this.sendEvent(eventName, properties);
  }

  public identify(userId: string, traits?: UserProperties) {
    this.userId = userId;
    
    if (window.gtag) {
      window.gtag('set', { user_id: userId });
      window.gtag('set', 'user_properties', traits);
    }
    
    if (window.mixpanel) {
      window.mixpanel.identify(userId);
      if (traits) {
        window.mixpanel.people.set(traits);
      }
    }
  }

  public page(pageName?: string, properties?: Record<string, any>) {
    const pageData = {
      page_name: pageName || document.title,
      page_path: window.location.pathname,
      ...properties
    };

    this.track('page_view', pageData);
  }

  // Registration flow tracking
  public trackRegistrationStart(source?: string) {
    this.track('registration_started', {
      source,
      referrer: document.referrer,
      utm_source: new URLSearchParams(window.location.search).get('utm_source'),
      utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
      utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
    });
  }

  public trackRegistrationStep(step: number, stepName: string, formData?: any) {
    this.track('registration_step_completed', {
      step_number: step,
      step_name: stepName,
      form_data: formData
    });
  }

  public trackRegistrationComplete(userId: string, plan: string, company?: string) {
    this.track('registration_completed', {
      user_id: userId,
      plan,
      company
    });
    
    this.identify(userId, { plan, company });
  }

  public trackRegistrationError(step: string, error: string) {
    this.track('registration_error', {
      step,
      error_message: error
    });
  }

  public trackFormAbandonment(step: string, filledFields: number, totalFields: number) {
    this.track('form_abandoned', {
      step,
      filled_fields: filledFields,
      total_fields: totalFields,
      completion_percentage: (filledFields / totalFields) * 100
    });
  }

  // Login tracking
  public trackLoginAttempt(method: string) {
    this.track('login_attempted', { method });
  }

  public trackLoginSuccess(userId: string, method: string) {
    this.track('login_successful', {
      user_id: userId,
      method
    });
    this.identify(userId);
  }

  public trackLoginError(method: string, error: string) {
    this.track('login_failed', {
      method,
      error_message: error
    });
  }

  // Feature usage tracking
  public trackFeatureUsed(feature: string, metadata?: Record<string, any>) {
    this.track('feature_used', {
      feature_name: feature,
      ...metadata
    });
  }

  // A/B Testing
  public trackExperiment(experimentName: string, variant: string) {
    this.track('experiment_viewed', {
      experiment_name: experimentName,
      variant
    });
  }

  // Conversion tracking
  public trackConversion(type: string, value?: number, metadata?: Record<string, any>) {
    this.track('conversion', {
      conversion_type: type,
      conversion_value: value,
      ...metadata
    });
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// React hooks for analytics
import { useEffect } from 'react';

export const usePageTracking = (pageName?: string) => {
  useEffect(() => {
    analytics.page(pageName);
  }, [pageName]);
};

export const useEventTracking = () => {
  return {
    trackEvent: (eventName: string, properties?: Record<string, any>) => {
      analytics.track(eventName, properties);
    },
    trackFeature: (feature: string, metadata?: Record<string, any>) => {
      analytics.trackFeatureUsed(feature, metadata);
    }
  };
};