import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = false;
  private reportCallback?: (metrics: PerformanceMetric[]) => void;

  constructor() {
    this.enabled = import.meta.env.PROD || import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';
  }

  /**
   * Initialize Web Vitals monitoring
   */
  public init(callback?: (metrics: PerformanceMetric[]) => void) {
    if (!this.enabled) {
      return;
    }

    this.reportCallback = callback;

    // Core Web Vitals
    onCLS(this.handleMetric.bind(this));  // Cumulative Layout Shift
    onLCP(this.handleMetric.bind(this));  // Largest Contentful Paint
    
    // Additional metrics
    onFCP(this.handleMetric.bind(this));  // First Contentful Paint
    onINP(this.handleMetric.bind(this));  // Interaction to Next Paint
    onTTFB(this.handleMetric.bind(this)); // Time to First Byte

    // Custom performance marks
    this.measureCustomMetrics();
    
    // Report metrics periodically
    this.scheduleReporting();
  }

  /**
   * Handle Web Vitals metric
   */
  private handleMetric(metric: { name: string; value: number; rating?: 'good' | 'needs-improvement' | 'poor' }) {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating || this.getRating(metric.name, metric.value),
      timestamp: Date.now()
    };

    this.metrics.set(metric.name, performanceMetric);

    // Send to analytics if configured
    this.sendToAnalytics(performanceMetric);
  }

  /**
   * Get rating based on Web Vitals thresholds
   */
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      'CLS': { good: 0.1, poor: 0.25 },
      'FCP': { good: 1800, poor: 3000 },
      'LCP': { good: 2500, poor: 4000 },
      'INP': { good: 200, poor: 500 },
      'TTFB': { good: 800, poor: 1800 },
    };

    const threshold = thresholds[name];
    if (!threshold) return 'needs-improvement';

    if (value <= threshold.good) return 'good';
    if (value >= threshold.poor) return 'poor';
    return 'needs-improvement';
  }

  /**
   * Measure custom performance metrics
   */
  private measureCustomMetrics() {
    // Time to Interactive (approximate)
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const tti = timing.domInteractive - timing.navigationStart;
      
      this.metrics.set('TTI', {
        name: 'TTI',
        value: tti,
        rating: this.getRating('TTI', tti),
        timestamp: Date.now()
      });
    }

    // Bundle load time
    this.measureBundleLoadTime();

    // API response times
    this.measureApiResponseTimes();
  }

  /**
   * Measure bundle load time
   */
  private measureBundleLoadTime() {
    if (!window.performance) return;

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    
    const totalJsSize = jsResources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
    const totalJsTime = jsResources.reduce((acc, r) => acc + r.duration, 0);

    this.metrics.set('JS_BUNDLE_SIZE', {
      name: 'JS_BUNDLE_SIZE',
      value: Math.round(totalJsSize / 1024), // KB
      rating: totalJsSize < 500000 ? 'good' : totalJsSize < 1000000 ? 'needs-improvement' : 'poor',
      timestamp: Date.now()
    });

    this.metrics.set('JS_LOAD_TIME', {
      name: 'JS_LOAD_TIME',
      value: Math.round(totalJsTime),
      rating: totalJsTime < 1000 ? 'good' : totalJsTime < 3000 ? 'needs-improvement' : 'poor',
      timestamp: Date.now()
    });
  }

  /**
   * Measure API response times
   */
  private measureApiResponseTimes() {
    // Intercept fetch to measure API times
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Only track API calls
        const url = args[0]?.toString() || '';
        if (url.includes('/api/')) {
          this.trackApiCall(url, duration, response.ok);
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const url = args[0]?.toString() || '';
        if (url.includes('/api/')) {
          this.trackApiCall(url, duration, false);
        }

        throw error;
      }
    };
  }

  /**
   * Track individual API call
   */
  private trackApiCall(url: string, duration: number, success: boolean) {
    const endpoint = new URL(url, window.location.origin).pathname;
    const metricName = `API_${endpoint.replace(/\//g, '_').toUpperCase()}`;

    this.metrics.set(metricName, {
      name: metricName,
      value: Math.round(duration),
      rating: duration < 200 ? 'good' : duration < 1000 ? 'needs-improvement' : 'poor',
      timestamp: Date.now()
    });
  }

  /**
   * Send metrics to analytics service
   */
  private sendToAnalytics(metric: PerformanceMetric) {
    // Google Analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'performance', {
        event_category: 'Web Vitals',
        event_label: metric.name,
        value: metric.value,
        metric_rating: metric.rating,
      });
    }

    // Sentry Performance Monitoring
    if ((window as any).Sentry?.addBreadcrumb) {
      (window as any).Sentry.addBreadcrumb({
        category: 'performance',
        message: `${metric.name}: ${metric.value}ms (${metric.rating})`,
        level: metric.rating === 'poor' ? 'warning' : 'info',
        data: metric,
      });
    }

    // Custom analytics endpoint
    if (import.meta.env.VITE_PERFORMANCE_ENDPOINT) {
      fetch(import.meta.env.VITE_PERFORMANCE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metric,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Silently fail - don't affect user experience
      });
    }
  }

  /**
   * Schedule periodic reporting
   */
  private scheduleReporting() {
    // Report every 30 seconds
    setInterval(() => {
      this.reportMetrics();
    }, 30000);

    // Report on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.reportMetrics();
      }
    });

    // Report before page unload
    window.addEventListener('beforeunload', () => {
      this.reportMetrics();
    });
  }

  /**
   * Report all collected metrics
   */
  private reportMetrics() {
    const metricsArray = Array.from(this.metrics.values());
    
    if (metricsArray.length === 0) return;

    // Call custom callback if provided
    if (this.reportCallback) {
      this.reportCallback(metricsArray);
    }

    // Send batch to analytics
    if (import.meta.env.PROD) {
      this.sendBatchToAnalytics(metricsArray);
    }
  }

  /**
   * Send batch of metrics to analytics
   */
  private sendBatchToAnalytics(metrics: PerformanceMetric[]) {
    // Calculate averages and percentiles
    const summary = {
      timestamp: Date.now(),
      url: window.location.href,
      metrics: metrics,
      summary: {
        goodCount: metrics.filter(m => m.rating === 'good').length,
        needsImprovementCount: metrics.filter(m => m.rating === 'needs-improvement').length,
        poorCount: metrics.filter(m => m.rating === 'poor').length,
      }
    };

    // Send to monitoring service
    if (import.meta.env.VITE_MONITORING_ENDPOINT) {
      fetch(import.meta.env.VITE_MONITORING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary),
      }).catch(() => {
        // Silently fail
      });
    }
  }

  /**
   * Get current metrics
   */
  public getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear metrics
   */
  public clearMetrics() {
    this.metrics.clear();
  }

  /**
   * Enable/disable monitoring
   */
  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export types
export type { PerformanceMetric };

// Extend window interface
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    Sentry?: {
      addBreadcrumb: (breadcrumb: any) => void;
    };
  }
}