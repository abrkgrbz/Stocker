/**
 * Sentry Monitoring Service
 * Error tracking, performance monitoring, and analytics
 */

import * as Sentry from '@sentry/react';
import { CaptureConsole } from '@sentry/integrations';
import { ErrorInfo } from 'react';

// Environment configuration
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';
const RELEASE = import.meta.env.VITE_APP_VERSION || '1.0.0';
const IS_PRODUCTION = import.meta.env.PROD;

export interface ISentryConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
  debug?: boolean;
  enabled?: boolean;
}

export interface IUserContext {
  id?: string;
  email?: string;
  username?: string;
  tenant?: string;
  role?: string;
}

export interface ICustomContext {
  module?: string;
  action?: string;
  metadata?: Record<string, any>;
}

/**
 * Sentry Monitoring Service
 */
export class SentryService {
  private initialized = false;
  private config: ISentryConfig;

  constructor() {
    this.config = {
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,
      release: RELEASE,
      tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,
      replaysSessionSampleRate: IS_PRODUCTION ? 0.1 : 0,
      replaysOnErrorSampleRate: 1.0,
      debug: !IS_PRODUCTION,
      enabled: !!SENTRY_DSN
    };
  }

  /**
   * Initialize Sentry
   */
  initialize(customConfig?: Partial<ISentryConfig>): void {
    if (this.initialized || !this.config.enabled) {
      console.log('Sentry initialization skipped:', {
        initialized: this.initialized,
        enabled: this.config.enabled
      });
      return;
    }

    const finalConfig = { ...this.config, ...customConfig };

    if (!finalConfig.dsn) {
      console.warn('Sentry DSN not provided. Monitoring disabled.');
      return;
    }

    try {
      Sentry.init({
        dsn: finalConfig.dsn,
        environment: finalConfig.environment,
        release: finalConfig.release,
        
        // Integrations
        integrations: [
          // Browser tracing
          Sentry.browserTracingIntegration({
            // Set sampling rates
            tracingOrigins: ['localhost', /^https:\/\/api\.stocker\./, /^\//],
          }),
          
          // Session replay
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
            // Mask sensitive data
            mask: ['.password', '.credit-card', '[data-sensitive]'],
            // Block specific elements
            block: ['.confidential'],
            // Ignore specific interactions
            ignore: ['.no-capture'],
          }),
          
          // Console capture (only errors in production)
          new CaptureConsole({
            levels: IS_PRODUCTION ? ['error'] : ['error', 'warn']
          }),
        ],

        // Performance Monitoring
        tracesSampleRate: finalConfig.tracesSampleRate,
        
        // Session Replay
        replaysSessionSampleRate: finalConfig.replaysSessionSampleRate,
        replaysOnErrorSampleRate: finalConfig.replaysOnErrorSampleRate,

        // Release Health
        autoSessionTracking: true,
        
        // Environment
        debug: finalConfig.debug,
        
        // Filtering
        beforeSend(event, hint) {
          // Filter out specific errors
          if (event.exception) {
            const error = hint.originalException;
            
            // Skip network errors in development
            if (!IS_PRODUCTION && error?.message?.includes('Network')) {
              return null;
            }
            
            // Skip cancelled requests
            if (error?.message?.includes('cancelled') || error?.message?.includes('aborted')) {
              return null;
            }
            
            // Add user context
            const user = SentryService.getCurrentUser();
            if (user) {
              event.user = user;
            }
          }
          
          return event;
        },
        
        // Breadcrumbs
        beforeBreadcrumb(breadcrumb) {
          // Filter out sensitive data from breadcrumbs
          if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
            return null;
          }
          
          // Sanitize form data
          if (breadcrumb.category === 'ui.input' && breadcrumb.message) {
            const element = breadcrumb.message.split(' ')[0];
            if (element.includes('password') || element.includes('token')) {
              breadcrumb.message = '[REDACTED]';
            }
          }
          
          return breadcrumb;
        },
        
        // Ignore specific errors
        ignoreErrors: [
          // Browser extensions
          'top.GLOBALS',
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          // Network errors
          'NetworkError',
          'Failed to fetch',
          // React errors
          'ReactDOMException',
          // Third-party
          'fb_xd_fragment',
          'bfcache',
        ],
        
        // Denied URLs
        denyUrls: [
          // Chrome extensions
          /extensions\//i,
          /^chrome:\/\//i,
          /^chrome-extension:\/\//i,
          // Other browsers
          /^moz-extension:\/\//i,
          /^ms-browser-extension:\/\//i,
        ],
      });

      this.initialized = true;
      console.log('✅ Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Get current user for context
   */
  private static getCurrentUser(): IUserContext | null {
    try {
      // Get from auth store or localStorage
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const auth = JSON.parse(authData);
        const user = auth?.state?.user;
        
        if (user) {
          return {
            id: user.id,
            email: user.email,
            username: user.name || user.username,
            tenant: user.tenantId || user.tenant,
            role: user.role
          };
        }
      }
    } catch (error) {
      console.error('Failed to get user context:', error);
    }
    
    return null;
  }

  /**
   * Set user context
   */
  setUser(user: IUserContext | null): void {
    if (!this.initialized) return;
    
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
        ip_address: '{{auto}}',
        segment: user.tenant,
        role: user.role
      });
    } else {
      Sentry.setUser(null);
    }
  }

  /**
   * Set custom context
   */
  setContext(key: string, context: Record<string, any>): void {
    if (!this.initialized) return;
    Sentry.setContext(key, context);
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(
    message: string,
    category: string = 'custom',
    level: Sentry.SeverityLevel = 'info',
    data?: Record<string, any>
  ): void {
    if (!this.initialized) return;
    
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000
    });
  }

  /**
   * Capture exception
   */
  captureException(
    error: Error | unknown,
    context?: ICustomContext,
    level: Sentry.SeverityLevel = 'error'
  ): string | undefined {
    if (!this.initialized) return;
    
    // Add context if provided
    if (context) {
      Sentry.withScope((scope) => {
        if (context.module) {
          scope.setTag('module', context.module);
        }
        if (context.action) {
          scope.setTag('action', context.action);
        }
        if (context.metadata) {
          scope.setContext('metadata', context.metadata);
        }
        scope.setLevel(level);
        
        return Sentry.captureException(error);
      });
    } else {
      return Sentry.captureException(error, { level });
    }
  }

  /**
   * Capture message
   */
  captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: ICustomContext
  ): string | undefined {
    if (!this.initialized) return;
    
    if (context) {
      Sentry.withScope((scope) => {
        if (context.module) {
          scope.setTag('module', context.module);
        }
        if (context.action) {
          scope.setTag('action', context.action);
        }
        if (context.metadata) {
          scope.setContext('metadata', context.metadata);
        }
        
        return Sentry.captureMessage(message, level);
      });
    } else {
      return Sentry.captureMessage(message, level);
    }
  }

  /**
   * Start transaction for performance monitoring
   */
  startTransaction(
    name: string,
    op: string = 'navigation'
  ): any {
    if (!this.initialized) return;
    
    // Use startSpan for newer Sentry versions
    return Sentry.startSpan({
      name,
      op,
      attributes: {
        module: 'stocker-admin'
      }
    }, () => {
      // Span callback
    });
  }

  /**
   * Measure performance
   */
  measurePerformance<T>(
    name: string,
    operation: () => T | Promise<T>
  ): T | Promise<T> {
    if (!this.initialized) {
      return operation();
    }

    const transaction = this.startTransaction(name, 'function');
    
    try {
      const result = operation();
      
      if (result instanceof Promise) {
        return result.finally(() => {
          transaction?.finish();
        });
      }
      
      transaction?.finish();
      return result;
    } catch (error) {
      transaction?.setStatus('internal_error');
      transaction?.finish();
      throw error;
    }
  }

  /**
   * React Error Boundary handler
   */
  reactErrorHandler(error: Error, errorInfo: ErrorInfo): void {
    if (!this.initialized) return;
    
    Sentry.withScope((scope) => {
      scope.setContext('react', {
        componentStack: errorInfo.componentStack
      });
      scope.setLevel('error');
      Sentry.captureException(error);
    });
  }

  /**
   * Capture user feedback
   */
  showReportDialog(options?: Sentry.ReportDialogOptions): void {
    if (!this.initialized) return;
    
    const user = SentryService.getCurrentUser();
    
    Sentry.showReportDialog({
      title: 'It looks like something went wrong',
      subtitle: 'Our team has been notified',
      subtitle2: "If you'd like to help, tell us what happened below",
      labelName: 'Name',
      labelEmail: 'Email',
      labelComments: 'What happened?',
      labelClose: 'Close',
      labelSubmit: 'Submit',
      errorGeneric: 'An error occurred while submitting your report. Please try again.',
      successMessage: 'Your feedback has been sent. Thank you!',
      user: user ? {
        email: user.email || '',
        name: user.username || ''
      } : undefined,
      ...options
    });
  }

  /**
   * Profiler for React components
   */
  withProfiler<P extends object>(
    Component: React.ComponentType<P>,
    name?: string
  ): React.ComponentType<P> {
    if (!this.initialized) return Component;
    return Sentry.withProfiler(Component, { name });
  }

  /**
   * Create error boundary
   */
  createErrorBoundary(
    fallback?: React.ComponentType<any>,
    showDialog?: boolean
  ): React.ComponentType<any> {
    return Sentry.ErrorBoundary;
  }

  /**
   * Flush events before page unload
   */
  async flush(timeout: number = 2000): Promise<boolean> {
    if (!this.initialized) return true;
    return Sentry.flush(timeout);
  }

  /**
   * Close Sentry client
   */
  async close(timeout: number = 2000): Promise<boolean> {
    if (!this.initialized) return true;
    
    const result = await Sentry.close(timeout);
    this.initialized = false;
    return result;
  }
}

// Create singleton instance
export const sentryService = new SentryService();

// React Router v6 imports for initialization
import React from 'react';
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes
} from 'react-router-dom';