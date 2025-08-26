// API Configuration

export const getApiUrl = (): string => {
  // Check environment variables
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5104';
  
  // Remove trailing slash if exists
  return apiUrl.replace(/\/$/, '');
};

export const getSignalRUrl = (): string => {
  const apiUrl = getApiUrl();
  return `${apiUrl}/hubs`;
};

export const getEnvironment = (): string => {
  return import.meta.env.MODE || 'development';
};

export const isDevelopment = (): boolean => {
  return getEnvironment() === 'development';
};

export const isProduction = (): boolean => {
  return getEnvironment() === 'production';
};

export const config = {
  apiUrl: getApiUrl(),
  signalRUrl: getSignalRUrl(),
  environment: getEnvironment(),
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
  
  // App settings
  appName: 'Stocker',
  appVersion: '1.0.0',
  
  // Default settings
  defaultLanguage: 'tr',
  defaultTimezone: 'Europe/Istanbul',
  defaultCurrency: 'TRY',
  
  // Pagination
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  
  // File upload
  maxUploadSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  
  // Session
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  tokenRefreshInterval: 5 * 60 * 1000, // 5 minutes
};

export default config;