import * as Sentry from '@sentry/react';
import { CaptureContext } from '@sentry/types';

// Web Vitals
export interface WebVitalsMetric {
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

// Initialize Sentry
export function initSentry() {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_ENVIRONMENT || 'development',
      integrations: [
        new Sentry.BrowserTracing({
          tracingOrigins: [
            'localhost',
            import.meta.env.VITE_API_BASE_URL,
            /^\//,
          ],
        }),
      ],
      tracesSampleRate: import.meta.env.VITE_ENVIRONMENT === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter out certain errors
        if (event.exception) {
          const error = hint.originalException;
          
          // Don't send cancelled requests
          if (error?.message?.includes('cancelled')) {
            return null;
          }
          
          // Don't send network errors in development
          if (
            import.meta.env.DEV &&
            error?.message?.includes('Network')
          ) {
            return null;
          }
        }
        
        // Remove sensitive data
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        
        return event;
      },
    });
  }
}

// Error logging
export function logError(
  error: Error | string,
  context?: CaptureContext
): void {
  console.error('[Error]:', error);
  
  if (import.meta.env.VITE_SENTRY_DSN) {
    if (typeof error === 'string') {
      Sentry.captureMessage(error, 'error');
    } else {
      Sentry.captureException(error, context);
    }
  }
}

// Performance monitoring
export function logPerformance(
  name: string,
  value: number,
  tags?: Record<string, string>
): void {
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}:`, value, 'ms');
  }
  
  if (import.meta.env.VITE_SENTRY_DSN) {
    // Performance tracking is now handled through Sentry metrics
    Sentry.metrics.distribution(name, value, {
      tags: tags || {},
      unit: 'millisecond',
    });
  }
}

// User tracking
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
  tenant?: string;
} | null): void {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(user);
  }
}

// Custom breadcrumbs
export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

// Track custom events
export function trackEvent(
  name: string,
  data?: Record<string, any>
): void {
  addBreadcrumb(name, 'user-action', 'info', data);
  
  // Also send to analytics if configured
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, data);
  }
}

// Web Vitals monitoring
export function reportWebVitals(metric: WebVitalsMetric): void {
  const { name, value, rating, id } = metric;
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${name}:`, {
      value: Math.round(value),
      rating,
      id,
    });
  }
  
  // Send to Sentry
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(`Web Vitals: ${name}`, {
      level: rating === 'poor' ? 'warning' : 'info',
      tags: {
        webvital: name,
        rating,
      },
      extra: {
        value,
        id,
        navigationType: metric.navigationType,
      },
    });
  }
  
  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      metric_rating: rating,
      non_interaction: true,
    });
  }
}

// Page view tracking
export function trackPageView(
  path: string,
  title?: string
): void {
  // Sentry
  addBreadcrumb(`Page View: ${path}`, 'navigation');
  
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title,
    });
  }
}

// API call monitoring
export function trackApiCall(
  method: string,
  url: string,
  status: number,
  duration: number
): void {
  const isError = status >= 400;
  
  if (isError || import.meta.env.DEV) {
    console.log(`[API ${isError ? 'Error' : 'Call'}] ${method} ${url}:`, {
      status,
      duration: `${duration}ms`,
    });
  }
  
  // Add breadcrumb
  addBreadcrumb(
    `${method} ${url}`,
    'api',
    isError ? 'error' : 'info',
    { status, duration }
  );
  
  // Track slow API calls
  if (duration > 3000) {
    logError(`Slow API call: ${method} ${url} took ${duration}ms`);
  }
}

// Feature flag tracking
export function trackFeatureUsage(
  feature: string,
  variant?: string
): void {
  trackEvent('feature_usage', {
    feature,
    variant,
  });
}

// Export for React Router integration
export { Sentry };