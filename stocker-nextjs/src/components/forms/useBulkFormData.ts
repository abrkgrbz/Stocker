'use client';

import { useState, useCallback } from 'react';
import { message } from 'antd';

interface BulkLoadOptions<T, R> {
  /** Function to fetch data */
  fetchFn: () => Promise<T[]>;
  /** Transform fetched data to form items */
  transformFn: (item: T) => R;
  /** Callback when data is loaded */
  onSuccess?: (items: R[]) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Success message */
  successMessage?: string;
  /** Error message */
  errorMessage?: string;
}

interface UseBulkFormDataReturn<R> {
  /** Whether data is being loaded */
  isLoading: boolean;
  /** Loaded items */
  items: R[];
  /** Load data and transform to form items */
  loadItems: () => Promise<void>;
  /** Clear loaded items */
  clearItems: () => void;
  /** Add single item */
  addItem: (item: R) => void;
  /** Remove item by index */
  removeItem: (index: number) => void;
  /** Update item by index */
  updateItem: (index: number, item: Partial<R>) => void;
  /** Replace all items */
  setItems: (items: R[]) => void;
}

/**
 * Hook for bulk loading and managing form data
 * Useful for forms with dynamic item lists (like stock counts, adjustments, etc.)
 */
export function useBulkFormData<T, R>(
  options: BulkLoadOptions<T, R>
): UseBulkFormDataReturn<R> {
  const {
    fetchFn,
    transformFn,
    onSuccess,
    onError,
    successMessage = 'Veriler yüklendi',
    errorMessage = 'Veriler yüklenirken hata oluştu',
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<R[]>([]);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchFn();
      const transformedItems = data.map(transformFn);
      setItems(transformedItems);
      onSuccess?.(transformedItems);
      message.success(successMessage);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(err);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, transformFn, onSuccess, onError, successMessage, errorMessage]);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const addItem = useCallback((item: R) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index: number, updates: Partial<R>) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    ));
  }, []);

  return {
    isLoading,
    items,
    loadItems,
    clearItems,
    addItem,
    removeItem,
    updateItem,
    setItems,
  };
}

/**
 * Preset configurations for common bulk load scenarios
 */
export const BulkLoadPresets = {
  /**
   * Create a stock count items loader
   */
  stockCount: <T extends { id: number; name: string; sku?: string; currentStock?: number }>(
    fetchFn: () => Promise<T[]>
  ) => ({
    fetchFn,
    transformFn: (item: T) => ({
      productId: item.id,
      productName: item.name,
      sku: item.sku || '',
      systemQuantity: item.currentStock || 0,
      countedQuantity: 0,
      variance: 0,
    }),
    successMessage: 'Tüm ürünler yüklendi',
  }),

  /**
   * Create an inventory adjustment items loader
   */
  adjustment: <T extends { id: number; name: string; currentStock?: number; unitCost?: number }>(
    fetchFn: () => Promise<T[]>
  ) => ({
    fetchFn,
    transformFn: (item: T) => ({
      productId: item.id,
      productName: item.name,
      systemQuantity: item.currentStock || 0,
      actualQuantity: item.currentStock || 0,
      unitCost: item.unitCost || 0,
      notes: '',
    }),
    successMessage: 'Ürünler yüklendi',
  }),

  /**
   * Create a transfer items loader
   */
  transfer: <T extends { id: number; name: string; sku?: string; availableStock?: number }>(
    fetchFn: () => Promise<T[]>
  ) => ({
    fetchFn,
    transformFn: (item: T) => ({
      productId: item.id,
      productName: item.name,
      sku: item.sku || '',
      availableQuantity: item.availableStock || 0,
      quantity: 0,
    }),
    successMessage: 'Ürünler yüklendi',
  }),
};

export default useBulkFormData;
