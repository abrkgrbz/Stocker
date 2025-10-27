import AsyncStorage from '@react-native-async-storage/async-storage';

export const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting storage item ${key}:`, error);
    throw error;
  }
};

export const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting storage item ${key}:`, error);
    return null;
  }
};

export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing storage item ${key}:`, error);
    throw error;
  }
};

export const clearStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
};

export const setObjectItem = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error setting object item ${key}:`, error);
    throw error;
  }
};

export const getObjectItem = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error getting object item ${key}:`, error);
    return null;
  }
};

export const getAllKeys = async (): Promise<readonly string[]> => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};

export const multiGet = async (keys: string[]): Promise<readonly [string, string | null][]> => {
  try {
    return await AsyncStorage.multiGet(keys);
  } catch (error) {
    console.error('Error getting multiple items:', error);
    return [];
  }
};

export const multiSet = async (keyValuePairs: [string, string][]): Promise<void> => {
  try {
    await AsyncStorage.multiSet(keyValuePairs);
  } catch (error) {
    console.error('Error setting multiple items:', error);
    throw error;
  }
};

export const multiRemove = async (keys: string[]): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error removing multiple items:', error);
    throw error;
  }
};
