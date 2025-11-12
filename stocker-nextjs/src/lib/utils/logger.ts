/**
 * Production-ready logger service with Sentry integration
 * Provides environment-aware logging with structured output
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, any>;
  error?: Error;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  stack?: string;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;
  private isProduction: boolean;
  private minLogLevel: LogLevel;
  private sentryEnabled: boolean = false;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';

    // Set minimum log level based on environment
    this.minLogLevel = this.isDevelopment
      ? LogLevel.DEBUG
      : (process.env.NEXT_PUBLIC_LOG_LEVEL ?
          LogLevel[process.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel] :
          LogLevel.INFO);

    // Initialize Sentry if in production
    if (this.isProduction && typeof window !== 'undefined') {
      this.initializeSentry();
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private initializeSentry(): void {
    // Check if Sentry is available
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'production',
          tracesSampleRate: 1.0,
          integrations: [
            Sentry.replayIntegration({
              maskAllText: false,
              blockAllMedia: false,
            }),
          ],
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
        });
        this.sentryEnabled = true;
        this.info('Sentry initialized successfully');
      }).catch((error) => {
        console.error('Failed to initialize Sentry:', error);
      });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLogLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const levelStr = LogLevel[entry.level];
    const timestamp = entry.timestamp;

    if (this.isDevelopment) {
      // Rich formatting for development
      const prefix = this.getColoredPrefix(entry.level);
      let message = `${prefix} [${timestamp}] ${entry.message}`;

      if (entry.context) {
        message += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
      }

      if (entry.stack) {
        message += `\n  Stack: ${entry.stack}`;
      }

      return message;
    } else {
      // Structured JSON for production
      return JSON.stringify({
        level: levelStr,
        message: entry.message,
        timestamp: entry.timestamp,
        ...entry.context
      });
    }
  }

  private getColoredPrefix(level: LogLevel): string {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m[DEBUG]\x1b[0m',    // Cyan
      [LogLevel.INFO]: '\x1b[32m[INFO]\x1b[0m',      // Green
      [LogLevel.WARN]: '\x1b[33m[WARN]\x1b[0m',      // Yellow
      [LogLevel.ERROR]: '\x1b[31m[ERROR]\x1b[0m',    // Red
      [LogLevel.FATAL]: '\x1b[35m[FATAL]\x1b[0m',    // Magenta
    };
    return colors[level] || '[LOG]';
  }

  private sendToSentry(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.sentryEnabled || typeof window === 'undefined') return;

    import('@sentry/nextjs').then((Sentry) => {
      // Set user context if available
      if (context?.userId) {
        Sentry.setUser({ id: context.userId });
      }

      // Add custom context
      if (context) {
        Sentry.setContext('custom', context);
      }

      // Send based on log level
      switch (level) {
        case LogLevel.ERROR:
          if (context?.error) {
            Sentry.captureException(context.error, {
              extra: context.metadata
            });
          } else {
            Sentry.captureMessage(message, 'error');
          }
          break;
        case LogLevel.FATAL:
          Sentry.captureMessage(message, 'fatal');
          break;
        case LogLevel.WARN:
          Sentry.captureMessage(message, 'warning');
          break;
        case LogLevel.INFO:
          Sentry.addBreadcrumb({
            message,
            level: 'info',
            data: context?.metadata
          });
          break;
        case LogLevel.DEBUG:
          Sentry.addBreadcrumb({
            message,
            level: 'debug',
            data: context?.metadata
          });
          break;
      }
    });
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      stack: context?.error?.stack
    };

    const formattedMessage = this.formatMessage(entry);

    // Console output
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage);
        break;
    }

    // Send to Sentry in production
    if (this.isProduction) {
      this.sendToSentry(level, message, context);
    }

    // Send to external logging service (if configured)
    this.sendToExternalService(entry);
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    // This can be extended to send logs to CloudWatch, LogRocket, DataDog, etc.
    if (process.env.NEXT_PUBLIC_EXTERNAL_LOG_ENDPOINT) {
      try {
        await fetch(process.env.NEXT_PUBLIC_EXTERNAL_LOG_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
      } catch (error) {
        // Silently fail to avoid infinite loop
      }
    }
  }

  // Public logging methods
  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log(LogLevel.ERROR, message, { ...context, error: errorObj });
  }

  public fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log(LogLevel.FATAL, message, { ...context, error: errorObj });
  }

  // Utility methods
  public time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  public timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  public table(data: any): void {
    if (this.isDevelopment) {
      console.table(data);
    }
  }

  public group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  public groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  // Performance monitoring
  public measurePerformance(name: string, fn: () => void | Promise<void>): void | Promise<void> {
    const start = performance.now();
    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        this.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`);
      });
    } else {
      const duration = performance.now() - start;
      this.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    }
  }
}

// Export singleton instance
const logger = Logger.getInstance();

export default logger;

// Convenience exports for direct usage
export const { debug, info, warn, error, fatal, time, timeEnd, table, group, groupEnd, measurePerformance } = logger;