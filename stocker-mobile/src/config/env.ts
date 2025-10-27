import Constants from 'expo-constants';

interface EnvConfig {
  API_URL: string;
  API_TIMEOUT: number;
  ENABLE_LOGGING: boolean;
  APP_VERSION: string;
}

const ENV = {
  dev: {
    API_URL: 'http://localhost:5000/api',
    API_TIMEOUT: 30000,
    ENABLE_LOGGING: true,
    APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  },
  staging: {
    API_URL: 'https://staging-api.stocker.com/api',
    API_TIMEOUT: 30000,
    ENABLE_LOGGING: true,
    APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  },
  prod: {
    API_URL: 'https://api.stocker.com/api',
    API_TIMEOUT: 30000,
    ENABLE_LOGGING: false,
    APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  },
};

const getEnvVars = (): EnvConfig => {
  // You can also use __DEV__ to detect dev mode
  const environment = __DEV__ ? 'dev' : 'prod';
  return ENV[environment];
};

export default getEnvVars();
