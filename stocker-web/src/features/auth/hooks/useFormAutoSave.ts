import { useEffect, useCallback, useRef, useState } from 'react';
import { message } from 'antd';
import { debounce } from 'lodash';

interface AutoSaveConfig {
  storageKey: string;
  debounceMs?: number;
  excludeFields?: string[];
  onSave?: (data: any) => void;
  onRestore?: (data: any) => void;
}

export const useFormAutoSave = <T extends Record<string, any>>(
  formData: T,
  config: AutoSaveConfig
) => {
  const {
    storageKey,
    debounceMs = 1000,
    excludeFields = ['password', 'confirmPassword', 'creditCard', 'cvv'],
    onSave,
    onRestore
  } = config;

  const [hasRestored, setHasRestored] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isFirstRender = useRef(true);

  // Filter out sensitive fields
  const filterData = (data: T): Partial<T> => {
    const filtered: any = {};
    Object.keys(data).forEach(key => {
      if (!excludeFields.includes(key) && data[key] !== undefined && data[key] !== '') {
        filtered[key] = data[key];
      }
    });
    return filtered;
  };

  // Save to localStorage
  const saveData = useCallback((data: T) => {
    try {
      setIsSaving(true);
      const filtered = filterData(data);
      const saveObject = {
        data: filtered,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem(storageKey, JSON.stringify(saveObject));
      setLastSaveTime(new Date());
      
      if (onSave) {
        onSave(filtered);
      }
    } catch (error) {
      // Error handling removed for production
    } finally {
      setIsSaving(false);
    }
  }, [storageKey, excludeFields, onSave]);

  // Debounced save function
  const debouncedSave = useRef(
    debounce((data: T) => {
      saveData(data);
    }, debounceMs)
  ).current;

  // Restore from localStorage
  const restoreData = useCallback((): Partial<T> | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const hoursSinceS = (Date.now() - new Date(parsed.timestamp).getTime()) / (1000 * 60 * 60);
      
      // Don't restore if data is older than 24 hours
      if (hoursSinceSave > 24) {
        localStorage.removeItem(storageKey);
        return null;
      }

      if (onRestore) {
        onRestore(parsed.data);
      }

      return parsed.data;
    } catch (error) {
      // Error handling removed for production
      return null;
    }
  }, [storageKey, onRestore]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(storageKey);
    setLastSaveTime(null);
    message.success('Kaydedilen form verileri temizlendi');
  }, [storageKey]);

  // Auto-save on form data change
  useEffect(() => {
    // Skip first render and if no data
    if (isFirstRender.current || !formData) {
      isFirstRender.current = false;
      return;
    }

    // Only save if we have some data
    const hasData = Object.values(formData).some(value => 
      value !== undefined && value !== '' && value !== null
    );

    if (hasData) {
      debouncedSave(formData);
    }
  }, [formData, debouncedSave]);

  // Show restore prompt
  const promptRestore = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      const savedData = restoreData();
      if (!savedData) {
        resolve(false);
        return;
      }

      const fieldCount = Object.keys(savedData).length;
      if (fieldCount === 0) {
        resolve(false);
        return;
      }

      // You can replace this with a custom modal
      const shouldRestore = window.confirm(
        `Daha önce doldurduğunuz ${fieldCount} alan bulundu. Kaldığınız yerden devam etmek ister misiniz?`
      );

      if (shouldRestore) {
        message.success('Form verileri geri yüklendi');
      } else {
        clearSavedData();
      }

      resolve(shouldRestore);
    });
  }, [restoreData, clearSavedData]);

  return {
    saveData,
    restoreData,
    clearSavedData,
    promptRestore,
    hasRestored,
    lastSaveTime,
    isSaving
  };
};

// Hook for showing auto-save status
export const useAutoSaveStatus = (lastSaveTime: Date | null, isSaving: boolean) => {
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (isSaving) {
      setStatus('Kaydediliyor...');
      return;
    }

    if (!lastSaveTime) {
      setStatus('');
      return;
    }

    const updateStatus = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastSaveTime.getTime()) / 1000);

      if (diff < 5) {
        setStatus('Kaydedildi ✓');
      } else if (diff < 60) {
        setStatus(`${diff} saniye önce kaydedildi`);
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        setStatus(`${minutes} dakika önce kaydedildi`);
      } else {
        setStatus('');
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);
    return () => clearInterval(interval);
  }, [lastSaveTime, isSaving]);

  return status;
};