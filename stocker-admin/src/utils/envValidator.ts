/**
 * Environment Variable Validator
 * Ensures required environment variables are configured
 */

interface EnvConfig {
  VITE_API_URL: string;
  VITE_NODE_ENV?: 'development' | 'production' | 'test';
  VITE_ENABLE_LOGGING?: string;
  VITE_SENTRY_DSN?: string;
}

class EnvironmentValidator {
  private requiredVars = [
    'VITE_API_URL'
  ];

  private optionalVars = [
    'VITE_NODE_ENV',
    'VITE_ENABLE_LOGGING',
    'VITE_SENTRY_DSN'
  ];

  /**
   * Validate environment variables
   * @throws Error if required variables are missing
   */
  validate(): EnvConfig {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    this.requiredVars.forEach(varName => {
      if (!import.meta.env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`);
      }
    });

    // Check optional variables
    this.optionalVars.forEach(varName => {
      if (!import.meta.env[varName]) {
        warnings.push(`Optional environment variable not set: ${varName}`);
      }
    });

    // Log warnings in development
    if (warnings.length > 0 && import.meta.env.DEV) {
      console.warn('Environment configuration warnings:', warnings);
    }

    // Throw error if required variables are missing
    if (errors.length > 0) {
      const errorMessage = `Environment configuration errors:\n${errors.join('\n')}`;
      console.error(errorMessage);
      
      // In production, show user-friendly error
      if (import.meta.env.PROD) {
        throw new Error('Application configuration error. Please contact administrator.');
      } else {
        throw new Error(errorMessage);
      }
    }

    // Validate API URL format
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl && !this.isValidUrl(apiUrl)) {
      throw new Error(`Invalid API URL format: ${apiUrl}`);
    }

    // Return validated configuration
    return {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
      VITE_ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING || 'false',
      VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    };
  }

  /**
   * Check if URL is valid
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      // Allow relative URLs in development
      if (import.meta.env.DEV && (url.startsWith('/') || url === '')) {
        return true;
      }
      return false;
    }
  }

  /**
   * Get safe API URL with fallback
   */
  getApiUrl(): string {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Production check
    if (import.meta.env.PROD && !apiUrl) {
      throw new Error('API URL not configured for production');
    }

    // Development fallback
    if (!apiUrl && import.meta.env.DEV) {
      console.warn('Using default development API URL: http://localhost:7014');
      return 'http://localhost:7014';
    }

    return apiUrl;
  }

  /**
   * Check if environment is production
   */
  isProduction(): boolean {
    return import.meta.env.PROD || import.meta.env.VITE_NODE_ENV === 'production';
  }

  /**
   * Check if environment is development
   */
  isDevelopment(): boolean {
    return import.meta.env.DEV || import.meta.env.VITE_NODE_ENV === 'development';
  }

  /**
   * Check if logging is enabled
   */
  isLoggingEnabled(): boolean {
    return import.meta.env.VITE_ENABLE_LOGGING === 'true';
  }

  /**
   * Get Sentry DSN if configured
   */
  getSentryDsn(): string | undefined {
    return import.meta.env.VITE_SENTRY_DSN;
  }
}

// Export singleton instance
export const envValidator = new EnvironmentValidator();

// Validate on import (will throw if critical vars missing)
if (typeof window !== 'undefined') {
  try {
    envValidator.validate();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // Show alert in production
    if (import.meta.env.PROD) {
      alert('Application configuration error. Please contact administrator.');
    }
  }
}

// Export config type
export type { EnvConfig };