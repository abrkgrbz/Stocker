import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';
import { reportWebVitals, logPerformance } from './monitoring';
import { analytics } from './analytics';

export interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Thresholds for ratings
const thresholds = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

// Get rating based on value and metric
function getRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'needs-improvement';
  
  if (value <= threshold.good) return 'good';
  if (value >= threshold.poor) return 'poor';
  return 'needs-improvement';
}

// Report handler
function handleMetric(metric: Metric): void {
  const { name, value, delta, id, navigationType } = metric;
  const rating = getRating(name, value);
  
  const vitalMetric = {
    name,
    value,
    rating,
    delta,
    id,
    navigationType: navigationType || 'unknown',
  };
  
  // Log to monitoring service
  reportWebVitals(vitalMetric as any);
  
  // Log performance metric
  logPerformance(`WebVital:${name}`, value, {
    rating,
    navigationType: navigationType || 'unknown',
  });
  
  // Send to Google Analytics
  analytics.event(name, 'Web Vitals', rating, Math.round(value), {
    metric_id: id,
    metric_delta: delta,
    metric_navigation_type: navigationType,
  });
  
  // Log poor performance
  if (rating === 'poor') {
    console.warn(`Poor ${name} performance:`, {
      value: Math.round(value),
      threshold: thresholds[name as keyof typeof thresholds]?.poor,
    });
  }
}

// Initialize Web Vitals tracking
export function initWebVitals(): void {
  // Core Web Vitals
  onCLS(handleMetric);
  onFCP(handleMetric);
  onLCP(handleMetric);
  
  // Other metrics
  onTTFB(handleMetric);
  onINP(handleMetric);
  
  // Additional performance metrics
  trackAdditionalMetrics();
}

// Track additional performance metrics
function trackAdditionalMetrics(): void {
  if (typeof window === 'undefined') return;
  
  // Navigation Timing
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      // DNS lookup time
      const dnsTime = navigation.domainLookupEnd - navigation.domainLookupStart;
      if (dnsTime > 0) {
        logPerformance('DNS Lookup', dnsTime);
      }
      
      // TCP connection time
      const tcpTime = navigation.connectEnd - navigation.connectStart;
      if (tcpTime > 0) {
        logPerformance('TCP Connection', tcpTime);
      }
      
      // Request time
      const requestTime = navigation.responseStart - navigation.requestStart;
      if (requestTime > 0) {
        logPerformance('Request Time', requestTime);
      }
      
      // Response time
      const responseTime = navigation.responseEnd - navigation.responseStart;
      if (responseTime > 0) {
        logPerformance('Response Time', responseTime);
      }
      
      // DOM processing time
      const domTime = navigation.domComplete - navigation.domInteractive;
      if (domTime > 0) {
        logPerformance('DOM Processing', domTime);
      }
      
      // Total page load time
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      if (loadTime > 0) {
        logPerformance('Total Page Load', loadTime);
        analytics.timing('Page', 'Load', loadTime);
      }
    }
  });
  
  // Resource Timing
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'resource') {
        const resource = entry as PerformanceResourceTiming;
        
        // Track slow resources
        if (resource.duration > 1000) {
          logPerformance(`Slow Resource: ${resource.name}`, resource.duration);
        }
        
        // Track large resources
        if (resource.transferSize && resource.transferSize > 500000) {
          console.warn('Large resource detected:', {
            url: resource.name,
            size: `${(resource.transferSize / 1024).toFixed(2)} KB`,
            duration: `${resource.duration.toFixed(2)} ms`,
          });
        }
      }
      
      // Long tasks
      if (entry.entryType === 'longtask') {
        logPerformance('Long Task', entry.duration);
        
        if (entry.duration > 100) {
          console.warn('Long task detected:', {
            duration: `${entry.duration.toFixed(2)} ms`,
            startTime: `${entry.startTime.toFixed(2)} ms`,
          });
        }
      }
    }
  });
  
  // Observe resources and long tasks
  if (PerformanceObserver.supportedEntryTypes.includes('resource')) {
    observer.observe({ entryTypes: ['resource'] });
  }
  
  if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
    observer.observe({ entryTypes: ['longtask'] });
  }
  
  // Memory usage (if available)
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize / 1048576; // Convert to MB
      const totalMemory = memory.totalJSHeapSize / 1048576;
      
      if (usedMemory > 100) {
        console.warn('High memory usage:', {
          used: `${usedMemory.toFixed(2)} MB`,
          total: `${totalMemory.toFixed(2)} MB`,
          percentage: `${((usedMemory / totalMemory) * 100).toFixed(2)}%`,
        });
      }
    }, 30000); // Check every 30 seconds
  }
}

// Custom performance marks
export function markStart(name: string): void {
  performance.mark(`${name}-start`);
}

export function markEnd(name: string): void {
  performance.mark(`${name}-end`);
  
  try {
    performance.measure(name, `${name}-start`, `${name}-end`);
    const measure = performance.getEntriesByName(name)[0];
    
    if (measure) {
      logPerformance(name, measure.duration);
      analytics.timing('Custom', name, measure.duration);
    }
  } catch (error) {
    console.error('Performance measurement error:', error);
  }
}

// Performance budget monitoring
export function checkPerformanceBudget(): void {
  const budgets = {
    js: 500 * 1024, // 500 KB
    css: 100 * 1024, // 100 KB
    img: 200 * 1024, // 200 KB per image
    font: 100 * 1024, // 100 KB
    total: 2000 * 1024, // 2 MB total
  };
  
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const usage = {
    js: 0,
    css: 0,
    img: 0,
    font: 0,
    total: 0,
  };
  
  resources.forEach(resource => {
    if (!resource.transferSize) return;
    
    usage.total += resource.transferSize;
    
    if (resource.name.includes('.js')) {
      usage.js += resource.transferSize;
    } else if (resource.name.includes('.css')) {
      usage.css += resource.transferSize;
    } else if (/\.(png|jpg|jpeg|gif|svg|webp)/.test(resource.name)) {
      usage.img += resource.transferSize;
    } else if (/\.(woff|woff2|ttf|eot)/.test(resource.name)) {
      usage.font += resource.transferSize;
    }
  });
  
  // Check budgets
  Object.entries(usage).forEach(([type, size]) => {
    const budget = budgets[type as keyof typeof budgets];
    if (size > budget) {
      console.warn(`Performance budget exceeded for ${type}:`, {
        used: `${(size / 1024).toFixed(2)} KB`,
        budget: `${(budget / 1024).toFixed(2)} KB`,
        overflow: `${((size - budget) / 1024).toFixed(2)} KB`,
      });
    }
  });
}