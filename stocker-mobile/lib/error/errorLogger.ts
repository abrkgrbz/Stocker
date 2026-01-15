/**
 * Error Logging Service
 *
 * Provides centralized error tracking with optional Sentry integration.
 * When Sentry DSN is not configured, falls back to console logging.
 */

import { Platform } from 'react-native';

// Sentry types for when the package is available
interface SentryModule {
    init: (options: Record<string, unknown>) => void;
    setContext: (name: string, context: Record<string, unknown>) => void;
    setUser: (user: { id: string; email?: string; username?: string } | null) => void;
    withScope: (callback: (scope: SentryScope) => void) => void;
    captureException: (error: Error) => void;
    addBreadcrumb: (breadcrumb: Record<string, unknown>) => void;
    captureMessage: (message: string, level?: string) => void;
    setTag: (key: string, value: string) => void;
    startSpan: (options: Record<string, unknown>, callback: () => unknown) => unknown;
}

interface SentryScope {
    setTag: (key: string, value: string) => void;
    setExtras: (extras: Record<string, unknown>) => void;
    setExtra: (key: string, value: unknown) => void;
}

// We'll use dynamic import for Sentry to make it optional
let Sentry: SentryModule | null = null;

interface ErrorContext {
  componentStack?: string | null;
  level?: 'screen' | 'component' | 'api' | 'sync' | 'auth';
  userId?: string;
  tenantCode?: string;
  extra?: Record<string, unknown>;
}

interface BreadcrumbData {
  category: string;
  message: string;
  data?: Record<string, unknown>;
  level?: 'debug' | 'info' | 'warning' | 'error';
}

interface UserInfo {
  id: string;
  email: string;
  name?: string;
}

class ErrorLogger {
  private initialized = false;
  private userId: string | null = null;
  private tenantCode: string | null = null;

  /**
   * Initialize the error logger with optional Sentry
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

    if (!dsn) {
      console.log('[ErrorLogger] Sentry DSN not configured - using console logging only');
      this.initialized = true;
      return;
    }

    try {
      // Dynamic import of Sentry - cast to our interface
      const SentryModule = await import('@sentry/react-native') as unknown as SentryModule;
      Sentry = SentryModule;

      Sentry.init({
        dsn,
        environment: __DEV__ ? 'development' : 'production',
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000,
        tracesSampleRate: __DEV__ ? 1.0 : 0.2,
        attachStacktrace: true,
      });

      // Set device context
      Sentry.setContext('device', {
        platform: Platform.OS,
        version: Platform.Version,
      });

      console.log('[ErrorLogger] Sentry initialized successfully');
      this.initialized = true;
    } catch (error) {
      console.warn('[ErrorLogger] Failed to initialize Sentry:', error);
      this.initialized = true; // Still mark as initialized to prevent retries
    }
  }

  /**
   * Set the current user for error tracking
   */
  setUser(user: UserInfo | null): void {
    this.userId = user?.id || null;

    if (Sentry && user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name,
      });
    } else if (Sentry) {
      Sentry.setUser(null);
    }
  }

  /**
   * Set the current tenant for error tracking
   */
  setTenant(tenantCode: string | null): void {
    this.tenantCode = tenantCode;

    if (Sentry) {
      Sentry.setTag('tenant', tenantCode || 'none');
    }
  }

  /**
   * Add a breadcrumb for error context
   */
  addBreadcrumb(data: BreadcrumbData): void {
    if (Sentry) {
      Sentry.addBreadcrumb({
        category: data.category,
        message: data.message,
        data: data.data,
        level: data.level || 'info',
      });
    }

    if (__DEV__) {
      console.log(`[Breadcrumb:${data.category}] ${data.message}`, data.data || '');
    }
  }

  /**
   * Capture an exception with optional context
   */
  captureException(error: Error, context?: ErrorContext): void {
    const errorMessage = error.message || 'Unknown error';
    const contextLevel = context?.level || 'component';

    // Always log to console in development
    console.error(`[ErrorLogger:${contextLevel}]`, errorMessage, {
      stack: error.stack,
      ...context,
    });

    if (!this.initialized || __DEV__) {
      return;
    }

    if (Sentry) {
      const sentry = Sentry; // Capture for closure
      sentry.withScope((scope) => {
        // Set tags
        if (contextLevel) {
          scope.setTag('error_level', contextLevel);
        }
        if (this.userId) {
          scope.setTag('user_id', this.userId);
        }
        if (this.tenantCode) {
          scope.setTag('tenant_code', this.tenantCode);
        }

        // Set extras
        if (context?.componentStack) {
          scope.setExtra('componentStack', context.componentStack);
        }
        if (context?.extra) {
          Object.entries(context.extra).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }

        sentry.captureException(error);
      });
    }
  }

  /**
   * Capture a message for logging
   */
  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info'
  ): void {
    const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
    logFn(`[ErrorLogger:${level}]`, message);

    if (!this.initialized || __DEV__) {
      return;
    }

    if (Sentry) {
      Sentry.captureMessage(message, level);
    }
  }

  /**
   * Log a navigation event
   */
  logNavigation(routeName: string, params?: Record<string, unknown>): void {
    this.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${routeName}`,
      data: params,
      level: 'info',
    });
  }

  /**
   * Log an API request
   */
  logApiRequest(method: string, url: string, status?: number): void {
    this.addBreadcrumb({
      category: 'api',
      message: `${method} ${url}`,
      data: status ? { status } : undefined,
      level: status && status >= 400 ? 'error' : 'info',
    });
  }

  /**
   * Log a user action
   */
  logUserAction(action: string, details?: Record<string, unknown>): void {
    this.addBreadcrumb({
      category: 'user',
      message: action,
      data: details,
      level: 'info',
    });
  }

  /**
   * Wrap an async function for automatic error tracking
   */
  wrapAsync<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    context?: ErrorContext
  ): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.captureException(error as Error, context);
        throw error;
      }
    }) as T;
  }

  /**
   * Start a performance transaction (if Sentry is available)
   */
  startTransaction(name: string, operation: string): unknown {
    if (Sentry) {
      return Sentry.startSpan({ name, op: operation }, () => {});
    }
    return null;
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();
export default errorLogger;
