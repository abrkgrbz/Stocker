import env from '@/config/env';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: unknown;
  error?: Error;
  context?: string;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {
    this.logLevel = this.getLogLevelFromString(env.debug.logLevel);
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getLogLevelFromString(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    const contextStr = context ? `[${context}]` : '';
    return `[${timestamp}] [${levelStr}]${contextStr} ${message}`;
  }

  private log(level: LogLevel, message: string, data?: unknown, context?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      context,
    };

    // Store log entry
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const formattedMessage = this.formatMessage(level, message, context);

    // Console output
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, data || '');
        break;
    }

    // Send to external service in production
    if (env.app.isProduction && level >= LogLevel.WARN) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // Integration with Sentry or other logging service
    if (env.services.sentryDsn && window.Sentry) {
      if (entry.level === LogLevel.ERROR) {
        window.Sentry.captureException(entry.error || new Error(entry.message), {
          level: 'error',
          extra: entry.data,
          tags: {
            context: entry.context,
          },
        });
      } else if (entry.level === LogLevel.WARN) {
        window.Sentry.captureMessage(entry.message, 'warning');
      }
    }
  }

  debug(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  info(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  warn(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  error(message: string, error?: Error | unknown, context?: string): void {
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      timestamp: new Date(),
      error: error instanceof Error ? error : new Error(String(error)),
      context,
      data: error instanceof Error ? { stack: error.stack } : error,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const formattedMessage = this.formatMessage(LogLevel.ERROR, message, context);
    console.error(formattedMessage, error);

    if (env.app.isProduction) {
      this.sendToExternalService(entry);
    }
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear all logs
  clearLogs(): void {
    this.logs = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Performance logging
  startTimer(label: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.debug(`Performance: ${label}`, { duration: `${duration.toFixed(2)}ms` }, 'Performance');
    };
  }

  // Group logging
  group(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.groupEnd();
    }
  }

  // Table logging for structured data
  table(data: unknown[], columns?: string[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.table(data, columns);
    }
  }
}

// Export singleton instance
const logger = Logger.getInstance();

// Convenience exports
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const startTimer = logger.startTimer.bind(logger);

// Global window error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('Uncaught error', event.error || event.message, 'Window');
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason, 'Promise');
  });
}

export default logger;