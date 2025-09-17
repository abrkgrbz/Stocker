export const storageService = {
  set: (key: string, value: any): void => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      // Error handling removed for production
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      // Error handling removed for production
      return null;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Error handling removed for production
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      // Error handling removed for production
    }
  },

  setSession: (key: string, value: any): void => {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      // Error handling removed for production
    }
  },

  getSession: <T>(key: string): T | null => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      // Error handling removed for production
      return null;
    }
  },

  removeSession: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      // Error handling removed for production
    }
  },

  clearSession: (): void => {
    try {
      sessionStorage.clear();
    } catch (error) {
      // Error handling removed for production
    }
  }
};