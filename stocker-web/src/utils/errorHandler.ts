import { message, notification } from 'antd';
import logger from './logger';
import env from '@/config/env';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
  timestamp: Date;
  path?: string;
}

export class ApplicationError extends Error {
  public code: string;
  public statusCode: number;
  public details?: any;
  public timestamp: Date;

  constructor(message: string, code: string = 'APP_ERROR', statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError);
    }
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, 'AUTHZ_ERROR', 403, details);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends ApplicationError {
  constructor(message: string = 'Network error occurred', details?: any) {
    super(message, 'NETWORK_ERROR', 0, details);
    this.name = 'NetworkError';
  }
}

export class ServerError extends ApplicationError {
  constructor(message: string = 'Server error occurred', details?: any) {
    super(message, 'SERVER_ERROR', 500, details);
    this.name = 'ServerError';
  }
}

interface ErrorMessages {
  [key: string]: string;
}

const DEFAULT_ERROR_MESSAGES: ErrorMessages = {
  NETWORK_ERROR: 'Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edin.',
  AUTH_ERROR: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
  AUTHZ_ERROR: 'Bu işlem için yetkiniz bulunmamaktadır.',
  VALIDATION_ERROR: 'Girdiğiniz bilgileri kontrol ediniz.',
  NOT_FOUND: 'Aradığınız kayıt bulunamadı.',
  SERVER_ERROR: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
  UNKNOWN_ERROR: 'Beklenmeyen bir hata oluştu.',
};

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorMessages: ErrorMessages;

  private constructor() {
    this.errorMessages = { ...DEFAULT_ERROR_MESSAGES };
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  setErrorMessage(code: string, message: string): void {
    this.errorMessages[code] = message;
  }

  handle(error: any, showNotification: boolean = true): AppError {
    let appError: AppError;

    // Convert different error types to AppError
    if (error instanceof ApplicationError) {
      appError = {
        code: error.code,
        message: error.message,
        details: error.details,
        statusCode: error.statusCode,
        timestamp: error.timestamp,
      };
    } else if (error.response) {
      // Axios error
      const { data, status } = error.response;
      appError = {
        code: data?.code || this.getCodeFromStatus(status),
        message: data?.message || this.getMessageFromStatus(status),
        details: data?.details || data,
        statusCode: status,
        timestamp: new Date(),
        path: error.config?.url,
      };
    } else if (error.request) {
      // Network error
      appError = {
        code: 'NETWORK_ERROR',
        message: this.errorMessages.NETWORK_ERROR,
        statusCode: 0,
        timestamp: new Date(),
      };
    } else {
      // Unknown error
      appError = {
        code: 'UNKNOWN_ERROR',
        message: error.message || this.errorMessages.UNKNOWN_ERROR,
        details: error,
        statusCode: 500,
        timestamp: new Date(),
      };
    }

    // Log error
    logger.error('Error handled', appError, 'ErrorHandler');

    // Show notification to user
    if (showNotification) {
      this.showErrorNotification(appError);
    }

    return appError;
  }

  private getCodeFromStatus(status: number): string {
    switch (status) {
      case 400: return 'VALIDATION_ERROR';
      case 401: return 'AUTH_ERROR';
      case 403: return 'AUTHZ_ERROR';
      case 404: return 'NOT_FOUND';
      case 500: return 'SERVER_ERROR';
      default: return 'UNKNOWN_ERROR';
    }
  }

  private getMessageFromStatus(status: number): string {
    const code = this.getCodeFromStatus(status);
    return this.errorMessages[code] || this.errorMessages.UNKNOWN_ERROR;
  }

  private showErrorNotification(error: AppError): void {
    const userMessage = this.errorMessages[error.code] || error.message;

    if (error.statusCode === 401) {
      // Authentication error - show message and redirect to login
      message.error(userMessage);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else if (error.statusCode && error.statusCode >= 500) {
      // Server error - show notification
      notification.error({
        message: 'Sistem Hatası',
        description: userMessage,
        duration: 5,
        placement: 'topRight',
      });
    } else {
      // Client error - show message
      message.error(userMessage);
    }
  }

  // Async error handler wrapper
  async handleAsync<T>(
    promise: Promise<T>,
    showNotification: boolean = true
  ): Promise<[T | null, AppError | null]> {
    try {
      const result = await promise;
      return [result, null];
    } catch (error) {
      const appError = this.handle(error, showNotification);
      return [null, appError];
    }
  }

  // React error boundary error handler
  handleBoundaryError(error: Error, _errorInfo: any): void {
    logger.error('React Error Boundary', error, 'ErrorBoundary');
    
    if (env.app.isProduction) {
      notification.error({
        message: 'Uygulama Hatası',
        description: 'Beklenmeyen bir hata oluştu. Sayfa yenileniyor...',
        duration: 3,
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }

  // Form validation error handler
  handleValidationErrors(errors: Record<string, string[]>): void {
    const errorList = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');

    message.error({
      content: `Lütfen aşağıdaki hataları düzeltin:\n${errorList}`,
      duration: 5,
    });
  }

  // Clear all error notifications
  clearErrors(): void {
    message.destroy();
    notification.destroy();
  }
}

// Export singleton instance
const errorHandler = ErrorHandler.getInstance();

export default errorHandler;