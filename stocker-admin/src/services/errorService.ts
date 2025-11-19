/**
 * Centralized Error Handling Service
 * Provides consistent error handling, logging, and user notifications
 */

import { message, notification } from 'antd';
import { auditLogger } from '../utils/auditLogger';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

// Error codes for consistent error handling
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  OFFLINE: 'OFFLINE',
  
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED: 'MISSING_REQUIRED',
  
  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT: 'RATE_LIMIT',
  
  // Client errors
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Custom error class
export class AppError extends Error {
  code: ErrorCode;
  severity: ErrorSeverity;
  category: ErrorCategory;
  details?: any;
  timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.category = category;
    this.details = details;
    this.timestamp = new Date();
  }
}

// Error messages for user display
const USER_FRIENDLY_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.NETWORK_ERROR]: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
  [ERROR_CODES.TIMEOUT]: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
  [ERROR_CODES.OFFLINE]: 'Çevrimdışı görünüyorsunuz. İnternet bağlantınızı kontrol edin.',
  [ERROR_CODES.UNAUTHORIZED]: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
  [ERROR_CODES.FORBIDDEN]: 'Bu işlem için yetkiniz bulunmuyor.',
  [ERROR_CODES.SESSION_EXPIRED]: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Geçersiz kullanıcı adı veya şifre.',
  [ERROR_CODES.VALIDATION_FAILED]: 'Girdiğiniz bilgilerde hatalar var. Lütfen kontrol edin.',
  [ERROR_CODES.INVALID_INPUT]: 'Geçersiz giriş. Lütfen bilgileri kontrol edin.',
  [ERROR_CODES.MISSING_REQUIRED]: 'Zorunlu alanları doldurun.',
  [ERROR_CODES.SERVER_ERROR]: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
  [ERROR_CODES.RATE_LIMIT]: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.',
  [ERROR_CODES.BAD_REQUEST]: 'Geçersiz istek. Lütfen bilgileri kontrol edin.',
  [ERROR_CODES.NOT_FOUND]: 'Aradığınız kayıt bulunamadı.',
  [ERROR_CODES.CONFLICT]: 'Bu işlem başka bir işlemle çakışıyor.',
};

class ErrorService {
  /**
   * Handle and log errors consistently
   */
  handleError(error: Error | AppError | any): void {
    // Convert to AppError if needed
    const appError = this.normalizeError(error);
    
    // Log the error
    this.logError(appError);
    
    // Show user notification based on severity
    this.notifyUser(appError);
    
    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportToMonitoring(appError);
    }
  }

  /**
   * Convert various error types to AppError
   */
  private normalizeError(error: any): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }
    
    // Axios error
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      let code: ErrorCode = ERROR_CODES.SERVER_ERROR;
      let category = ErrorCategory.SERVER;
      let severity = ErrorSeverity.MEDIUM;
      
      // Map HTTP status to error codes
      switch (status) {
        case 400:
          code = ERROR_CODES.BAD_REQUEST;
          category = ErrorCategory.CLIENT;
          severity = ErrorSeverity.LOW;
          break;
        case 401:
          code = ERROR_CODES.UNAUTHORIZED;
          category = ErrorCategory.AUTHENTICATION;
          severity = ErrorSeverity.HIGH;
          break;
        case 403:
          code = ERROR_CODES.FORBIDDEN;
          category = ErrorCategory.AUTHORIZATION;
          severity = ErrorSeverity.MEDIUM;
          break;
        case 404:
          code = ERROR_CODES.NOT_FOUND;
          category = ErrorCategory.CLIENT;
          severity = ErrorSeverity.LOW;
          break;
        case 409:
          code = ERROR_CODES.CONFLICT;
          category = ErrorCategory.CLIENT;
          severity = ErrorSeverity.MEDIUM;
          break;
        case 429:
          code = ERROR_CODES.RATE_LIMIT;
          category = ErrorCategory.CLIENT;
          severity = ErrorSeverity.MEDIUM;
          break;
        case 500:
        case 502:
        case 503:
          code = ERROR_CODES.SERVER_ERROR;
          category = ErrorCategory.SERVER;
          severity = ErrorSeverity.HIGH;
          break;
      }
      
      return new AppError(
        data?.message || error.message || 'Bir hata oluştu',
        code,
        severity,
        category,
        { status, data, originalError: error }
      );
    }
    
    // Network error
    if (error.request && !error.response) {
      return new AppError(
        'Ağ bağlantı hatası',
        ERROR_CODES.NETWORK_ERROR,
        ErrorSeverity.HIGH,
        ErrorCategory.NETWORK,
        { originalError: error }
      );
    }
    
    // Generic Error
    if (error instanceof Error) {
      return new AppError(
        error.message,
        ERROR_CODES.SERVER_ERROR,
        ErrorSeverity.MEDIUM,
        ErrorCategory.UNKNOWN,
        { originalError: error }
      );
    }
    
    // Unknown error
    return new AppError(
      'Beklenmeyen bir hata oluştu',
      ERROR_CODES.SERVER_ERROR,
      ErrorSeverity.HIGH,
      ErrorCategory.UNKNOWN,
      { originalError: error }
    );
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: AppError): void {
    const logData = {
      code: error.code,
      message: error.message,
      severity: error.severity,
      category: error.category,
      timestamp: error.timestamp,
      details: error.details,
      stack: error.stack,
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${error.severity?.toUpperCase() || 'UNKNOWN'} Error`);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('Category:', error.category);
      console.error('Details:', error.details);
      console.error('Stack:', error.stack);
      console.groupEnd();
    }
    
    // Log to audit service
    auditLogger.log({
      action: 'ERROR',
      category: 'system',
      severity: error.severity === ErrorSeverity.CRITICAL ? 'high' : 
                error.severity === ErrorSeverity.HIGH ? 'medium' : 'low',
      details: logData,
      timestamp: error.timestamp,
    });
  }

  /**
   * Show user-friendly notification
   */
  private notifyUser(error: AppError): void {
    const userMessage = USER_FRIENDLY_MESSAGES[error.code] || error.message;
    
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        notification.error({
          message: 'Hata',
          description: userMessage,
          duration: 5,
        });
        break;
        
      case ErrorSeverity.MEDIUM:
        message.error(userMessage, 3);
        break;
        
      case ErrorSeverity.LOW:
        message.warning(userMessage, 2);
        break;
    }
  }

  /**
   * Report to external monitoring service (e.g., Sentry)
   */
  private reportToMonitoring(error: AppError): void {
    // TODO: Integrate with Sentry or similar service
    // For now, just log to console
    console.error('Report to monitoring:', error);
  }

  /**
   * Create standardized API error handler
   */
  createApiErrorHandler(context: string) {
    return (error: any) => {
      const appError = this.normalizeError(error);
      appError.details = { ...appError.details, context };
      this.handleError(appError);
      throw appError;
    };
  }

  /**
   * Wrap async functions with error handling
   */
  async wrapAsync<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const appError = this.normalizeError(error);
      if (context) {
        appError.details = { ...appError.details, context };
      }
      this.handleError(appError);
      throw appError;
    }
  }
}

// Export singleton instance
export const errorService = new ErrorService();

// Export for testing
export { ErrorService };