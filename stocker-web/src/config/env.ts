// Environment variables type definitions and configuration
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
  
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_API_VERSION: string;
  
  readonly VITE_AUTH_TOKEN_KEY: string;
  readonly VITE_AUTH_REFRESH_TOKEN_KEY: string;
  readonly VITE_AUTH_TENANT_KEY: string;
  
  readonly VITE_FEATURE_DARK_MODE: string;
  readonly VITE_FEATURE_MULTI_LANGUAGE: string;
  readonly VITE_FEATURE_NOTIFICATIONS: string;
  readonly VITE_FEATURE_WEBSOCKET: string;
  
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
  readonly VITE_MIXPANEL_TOKEN?: string;
  
  readonly VITE_STORAGE_PREFIX: string;
  readonly VITE_MAX_FILE_SIZE: string;
  
  readonly VITE_ENABLE_DEVTOOLS: string;
  readonly VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Environment configuration with defaults
export const env = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Stocker',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    env: import.meta.env.VITE_APP_ENV || 'development',
    isDevelopment: import.meta.env.VITE_APP_ENV === 'development',
    isStaging: import.meta.env.VITE_APP_ENV === 'staging',
    isProduction: import.meta.env.VITE_APP_ENV === 'production',
  },
  
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5104',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    version: import.meta.env.VITE_API_VERSION || 'v1',
  },
  
  auth: {
    tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'stocker_token',
    refreshTokenKey: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'stocker_refresh_token',
    tenantKey: import.meta.env.VITE_AUTH_TENANT_KEY || 'stocker_tenant',
  },
  
  features: {
    darkMode: import.meta.env.VITE_FEATURE_DARK_MODE === 'true',
    multiLanguage: import.meta.env.VITE_FEATURE_MULTI_LANGUAGE === 'true',
    notifications: import.meta.env.VITE_FEATURE_NOTIFICATIONS === 'true',
    websocket: import.meta.env.VITE_FEATURE_WEBSOCKET === 'true',
  },
  
  services: {
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
    mixpanelToken: import.meta.env.VITE_MIXPANEL_TOKEN || '',
  },
  
  storage: {
    prefix: import.meta.env.VITE_STORAGE_PREFIX || 'stocker_',
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  
  debug: {
    enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'VITE_API_BASE_URL',
];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please check your .env file');
  }
  
  return missing.length === 0;
};

export default env;