/**
 * Sentry Performance Monitoring Hook
 * Track component performance and user interactions
 */

import { useEffect, useRef, useCallback } from 'react';
import * as Sentry from '@sentry/react';
import { sentryService } from '../services/sentryService';

interface PerformanceOptions {
  componentName: string;
  enableAutoTrack?: boolean;
  trackRender?: boolean;
  trackMount?: boolean;
  trackInteractions?: boolean;
}

interface InteractionMetrics {
  name: string;
  duration: number;
  timestamp: number;
  data?: Record<string, any>;
}

/**
 * Hook for component performance monitoring
 */
export function useSentryPerformance(options: PerformanceOptions) {
  const {
    componentName,
    enableAutoTrack = true,
    trackRender = true,
    trackMount = true,
    trackInteractions = true
  } = options;

  const transactionRef = useRef<Sentry.Transaction | null>(null);
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef<number>(0);
  const interactionsRef = useRef<InteractionMetrics[]>([]);

  // Track component mount
  useEffect(() => {
    if (!enableAutoTrack || !trackMount) return;

    const mountStart = performance.now();
    mountTimeRef.current = mountStart;

    // Start transaction for component lifecycle
    transactionRef.current = Sentry.startTransaction({
      name: `Component: ${componentName}`,
      op: 'react.component',
      tags: {
        component: componentName,
        'component.mount': true
      }
    });

    // Create mount span
    const mountSpan = transactionRef.current?.startChild({
      op: 'react.mount',
      description: `${componentName} mount`
    });

    // Component mounted
    const mountEnd = performance.now();
    const mountDuration = mountEnd - mountStart;

    mountSpan?.setData('mount.duration', mountDuration);
    mountSpan?.finish();

    // Add breadcrumb
    Sentry.addBreadcrumb({
      message: `Component ${componentName} mounted`,
      category: 'react.lifecycle',
      level: 'info',
      data: {
        duration: mountDuration,
        timestamp: mountStart
      }
    });

    // Cleanup on unmount
    return () => {
      // Finish transaction
      if (transactionRef.current) {
        transactionRef.current.setData('render.count', renderCountRef.current);
        transactionRef.current.setData('interactions.count', interactionsRef.current.length);
        transactionRef.current.finish();
      }

      // Add unmount breadcrumb
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTimeRef.current;

      Sentry.addBreadcrumb({
        message: `Component ${componentName} unmounted`,
        category: 'react.lifecycle',
        level: 'info',
        data: {
          lifetime: totalLifetime,
          renderCount: renderCountRef.current,
          interactionCount: interactionsRef.current.length
        }
      });
    };
  }, [componentName, enableAutoTrack, trackMount]);

  // Track renders
  useEffect(() => {
    if (!enableAutoTrack || !trackRender) return;

    renderCountRef.current += 1;

    // Skip first render (mount)
    if (renderCountRef.current === 1) return;

    // Create render span
    const renderSpan = transactionRef.current?.startChild({
      op: 'react.render',
      description: `${componentName} render #${renderCountRef.current}`
    });

    // Measure render time
    const renderStart = performance.now();
    
    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(() => {
      const renderEnd = performance.now();
      const renderDuration = renderEnd - renderStart;

      renderSpan?.setData('render.duration', renderDuration);
      renderSpan?.setData('render.number', renderCountRef.current);
      renderSpan?.finish();

      // Log slow renders
      if (renderDuration > 16) { // More than one frame (60fps)
        Sentry.addBreadcrumb({
          message: `Slow render detected in ${componentName}`,
          category: 'react.performance',
          level: 'warning',
          data: {
            duration: renderDuration,
            renderNumber: renderCountRef.current
          }
        });
      }
    });
  });

  /**
   * Track user interaction
   */
  const trackInteraction = useCallback((
    interactionName: string,
    data?: Record<string, any>
  ): (() => void) => {
    if (!enableAutoTrack || !trackInteractions) {
      return () => {};
    }

    const interactionStart = performance.now();

    // Create interaction span
    const interactionSpan = transactionRef.current?.startChild({
      op: 'ui.action',
      description: `${componentName}: ${interactionName}`
    });

    // Add interaction data
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        interactionSpan?.setData(key, value);
      });
    }

    // Return function to end interaction tracking
    return () => {
      const interactionEnd = performance.now();
      const duration = interactionEnd - interactionStart;

      interactionSpan?.setData('interaction.duration', duration);
      interactionSpan?.finish();

      // Store interaction metrics
      const metric: InteractionMetrics = {
        name: interactionName,
        duration,
        timestamp: interactionStart,
        data
      };
      interactionsRef.current.push(metric);

      // Add breadcrumb
      Sentry.addBreadcrumb({
        message: `User interaction: ${interactionName}`,
        category: 'ui.action',
        level: 'info',
        data: {
          component: componentName,
          duration,
          ...data
        }
      });

      // Log slow interactions
      if (duration > 100) {
        Sentry.captureMessage(
          `Slow interaction in ${componentName}: ${interactionName} took ${duration}ms`,
          'warning'
        );
      }
    };
  }, [componentName, enableAutoTrack, trackInteractions]);

  /**
   * Track async operation
   */
  const trackAsyncOperation = useCallback(async <T,>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    if (!enableAutoTrack) {
      return operation();
    }

    const span = transactionRef.current?.startChild({
      op: 'async',
      description: `${componentName}: ${operationName}`
    });

    const startTime = performance.now();

    try {
      const result = await operation();
      
      const duration = performance.now() - startTime;
      span?.setData('async.duration', duration);
      span?.setStatus('ok');
      
      return result;
    } catch (error) {
      span?.setStatus('internal_error');
      
      // Capture exception with context
      Sentry.captureException(error, {
        tags: {
          component: componentName,
          operation: operationName
        }
      });
      
      throw error;
    } finally {
      span?.finish();
    }
  }, [componentName, enableAutoTrack]);

  /**
   * Measure custom metric
   */
  const measureMetric = useCallback((
    metricName: string,
    value: number,
    unit: string = 'ms'
  ) => {
    if (!enableAutoTrack) return;

    // Add custom measurement
    transactionRef.current?.setMeasurement(metricName, value, unit);

    // Add breadcrumb
    Sentry.addBreadcrumb({
      message: `Custom metric: ${metricName}`,
      category: 'measurement',
      level: 'info',
      data: {
        component: componentName,
        value,
        unit
      }
    });
  }, [componentName, enableAutoTrack]);

  /**
   * Get performance metrics
   */
  const getMetrics = useCallback(() => {
    const now = performance.now();
    const lifetime = now - mountTimeRef.current;

    return {
      componentName,
      lifetime,
      renderCount: renderCountRef.current,
      interactions: interactionsRef.current,
      averageInteractionTime: interactionsRef.current.length > 0
        ? interactionsRef.current.reduce((sum, i) => sum + i.duration, 0) / interactionsRef.current.length
        : 0
    };
  }, [componentName]);

  return {
    trackInteraction,
    trackAsyncOperation,
    measureMetric,
    getMetrics
  };
}

/**
 * Hook for tracking specific web vitals
 */
export function useWebVitals(componentName?: string) {
  useEffect(() => {
    // Only track in production
    if (!import.meta.env.PROD) return;

    const reportWebVital = (metric: any) => {
      // Send to Sentry
      const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
      
      if (transaction) {
        transaction.setMeasurement(metric.name, metric.value, 'millisecond');
      }

      // Log as breadcrumb
      Sentry.addBreadcrumb({
        message: `Web Vital: ${metric.name}`,
        category: 'web.vital',
        level: 'info',
        data: {
          component: componentName,
          value: metric.value,
          rating: metric.rating
        }
      });

      // Capture poor performance
      if (metric.rating === 'poor') {
        Sentry.captureMessage(
          `Poor ${metric.name} performance: ${metric.value}ms`,
          'warning'
        );
      }
    };

    // Dynamic import web-vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVital);
      getFID(reportWebVital);
      getFCP(reportWebVital);
      getLCP(reportWebVital);
      getTTFB(reportWebVital);
    });
  }, [componentName]);
}