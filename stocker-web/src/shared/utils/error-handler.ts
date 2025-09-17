import { message, notification } from 'antd';
import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
  timestamp?: string;
  path?: string;
}

export class AppError extends Error {
  public code?: string;
  public statusCode?: number;
  public details?: Record<string, any>;
  public isOperational: boolean;

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND_ERROR', 404);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 'RATE_LIMIT_ERROR', 429);
  }
}

export class ServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 'SERVER_ERROR', 500);
  }
}

// Error type guards
export function isAxiosError(error: any): error is AxiosError {
  return error?.isAxiosError === true;
}

export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

// Parse error from various sources
export function parseError(error: any): ApiError {
  // Handle Axios errors
  if (isAxiosError(error)) {
    const response = error.response;
    
    if (response?.data) {
      const data = response.data;
      
      // Handle different error response formats
      if (typeof data === 'string') {
        return {
          message: data,
          statusCode: response.status,
        };
      }
      
      if (data.message || data.error || data.errors) {
        return {
          message: data.message || data.error || extractErrorMessage(data.errors),
          code: data.code || data.errorCode,
          statusCode: response.status,
          details: data.errors || data.details,
          timestamp: data.timestamp,
          path: data.path,
        };
      }
    }
    
    // Network or timeout errors
    if (error.code === 'ECONNABORTED') {
      return {
        message: 'Request timeout',
        code: 'TIMEOUT_ERROR',
        statusCode: 408,
      };
    }
    
    if (!error.response) {
      return {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
        statusCode: 0,
      };
    }
    
    return {
      message: error.message || 'An error occurred',
      statusCode: response?.status,
    };
  }
  
  // Handle AppError
  if (isAppError(error)) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }
  
  // Handle standard Error
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
    };
  }
  
  // Unknown error
  return {
    message: 'An unexpected error occurred',
  };
}

// Extract error message from validation errors object
function extractErrorMessage(errors: any): string {
  if (!errors) return 'Validation error';
  
  if (typeof errors === 'string') return errors;
  
  if (Array.isArray(errors)) {
    return errors[0]?.message || errors[0] || 'Validation error';
  }
  
  if (typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    const firstError = errors[firstKey];
    
    if (Array.isArray(firstError)) {
      return firstError[0] || 'Validation error';
    }
    
    if (typeof firstError === 'string') {
      return firstError;
    }
    
    return firstError?.message || 'Validation error';
  }
  
  return 'Validation error';
}

// Global error handler
export function handleError(error: any, options?: {
  showNotification?: boolean;
  silent?: boolean;
  context?: string;
}): void {
  const { showNotification = false, silent = false, context } = options || {};
  
  if (silent) return;
  
  const apiError = parseError(error);
  
  // Log error for debugging
  // Error handling removed for production
  // Handle specific error codes
  switch (apiError.statusCode) {
    case 401:
      // Authentication error - handled by auth interceptor
      break;
      
    case 403:
      notification.error({
        message: 'Access Denied',
        description: apiError.message || 'You do not have permission to perform this action.',
        duration: 5,
      });
      break;
      
    case 404:
      if (showNotification) {
        notification.warning({
          message: 'Not Found',
          description: apiError.message || 'The requested resource was not found.',
          duration: 4,
        });
      } else {
        message.warning(apiError.message || 'Resource not found');
      }
      break;
      
    case 429:
      notification.warning({
        message: 'Too Many Requests',
        description: 'Please slow down and try again later.',
        duration: 6,
      });
      break;
      
    case 500:
    case 502:
    case 503:
    case 504:
      notification.error({
        message: 'Server Error',
        description: 'Something went wrong on our end. Please try again later.',
        duration: 5,
      });
      break;
      
    default:
      if (showNotification) {
        notification.error({
          message: 'Error',
          description: apiError.message,
          duration: 5,
        });
      } else {
        message.error(apiError.message);
      }
  }
}

// Error boundary handler
export function handleErrorBoundary(error: Error, errorInfo: any): void {
  // Error handling removed for production
  // Send error to monitoring service (e.g., Sentry)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Send error to monitoring service (Sentry, LogRocket, etc.)
    // Implementation depends on chosen monitoring service
    // Example: window.Sentry?.captureException(error);
  }
  
  notification.error({
    message: 'Application Error',
    description: 'An unexpected error occurred. The page may need to be refreshed.',
    duration: 0,
    btn: (
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '4px 12px',
          background: '#ff4d4f',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Refresh Page
      </button>
    ),
  });
}

// Success handler
export function handleSuccess(message: string, options?: {
  showNotification?: boolean;
  duration?: number;
}): void {
  const { showNotification = false, duration = 3 } = options || {};
  
  if (showNotification) {
    notification.success({
      message: 'Success',
      description: message,
      duration,
    });
  } else {
    message.success(message);
  }
}