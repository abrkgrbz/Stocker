// Lightweight monitoring service without Sentry dependency
export interface WebVitalsMetric {
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

export interface MonitoringUser {
  id: string;
  email?: string;
  username?: string;
  tenant?: string;
}

class MonitoringService {
  private isEnabled = false;
  private user: MonitoringUser | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  // Initialize monitoring
  initSentry() {
    this.isEnabled = import.meta.env.PROD && !!import.meta.env.VITE_SENTRY_DSN;
    
    if (this.isEnabled) {
      this.setupErrorHandler();
      this.setupPerformanceMonitoring();
          }
  }

  private setupErrorHandler() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), {
        source: 'window.onerror',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(new Error(String(event.reason)), {
        source: 'unhandledRejection',
        promise: event.promise,
      });
    });
  }

  private setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
              this.trackPerformance(entry.name, entry.duration);
            }
          }
        });
        
        this.performanceObserver.observe({ 
          entryTypes: ['measure', 'navigation'] 
        });
      } catch (e) {}
    }
  }

  // Set user context
  setUser(user: MonitoringUser | null) {
    this.user = user;
    if (this.isEnabled) {}
  }

  // Capture exception
  captureException(error: Error | string, context?: any) {
    if (!this.isEnabled) return;

    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    const errorData = {
      message: errorObj.message,
      stack: errorObj.stack,
      user: this.user,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      environment: import.meta.env.VITE_ENVIRONMENT || 'development',
    };

    // Error handling removed for production
    // In production, send to monitoring endpoint
    if (import.meta.env.PROD) {
      this.sendToMonitoring('error', errorData);
    }
  }

  // Capture message
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (!this.isEnabled) return;

    const messageData = {
      message,
      level,
      user: this.user,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

        if (import.meta.env.PROD) {
      this.sendToMonitoring('message', messageData);
    }
  }

  // Track custom metrics
  trackMetric(name: string, value: number, unit?: string) {
    if (!this.isEnabled) return;

    const metricData = {
      name,
      value,
      unit,
      user: this.user,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

        if (import.meta.env.PROD) {
      this.sendToMonitoring('metric', metricData);
    }
  }

  // Track performance
  trackPerformance(name: string, duration: number) {
    this.trackMetric(`performance.${name}`, duration, 'ms');
  }

  // Track page view
  trackPageView(path: string) {
    if (!this.isEnabled) return;

    const pageViewData = {
      path,
      user: this.user,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      title: document.title,
    };

        if (import.meta.env.PROD) {
      this.sendToMonitoring('pageview', pageViewData);
    }
  }

  // Track web vitals
  trackWebVital(metric: WebVitalsMetric) {
    if (!this.isEnabled) return;

    const vitalData = {
      ...metric,
      user: this.user,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

        if (import.meta.env.PROD) {
      this.sendToMonitoring('webvital', vitalData);
    }
  }

  // Send data to monitoring service
  private async sendToMonitoring(type: string, data: any) {
    try {
      const endpoint = import.meta.env.VITE_MONITORING_ENDPOINT || '/api/monitoring';
      
      await fetch(`${endpoint}/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Silently fail - don't break app if monitoring fails
      // Error handling removed for production
    }
  }

  // Cleanup
  destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }
}

// Create singleton instance
const monitoring = new MonitoringService();

// Export functions for backward compatibility
export const initSentry = () => monitoring.initSentry();
export const setUser = (user: MonitoringUser | null) => monitoring.setUser(user);
export const captureException = (error: Error | string, context?: any) => monitoring.captureException(error, context);
export const captureMessage = (message: string, level?: 'info' | 'warning' | 'error') => monitoring.captureMessage(message, level);
export const trackMetric = (name: string, value: number, unit?: string) => monitoring.trackMetric(name, value, unit);
export const trackPageView = (path: string) => monitoring.trackPageView(path);
export const trackWebVital = (metric: WebVitalsMetric) => monitoring.trackWebVital(metric);
export const reportWebVitals = (metric: WebVitalsMetric) => monitoring.trackWebVital(metric);
export const logPerformance = (name: string, duration: number) => monitoring.trackPerformance(name, duration);

export default monitoring;