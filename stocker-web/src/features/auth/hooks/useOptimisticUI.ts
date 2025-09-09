import { useState, useCallback, useRef } from 'react';
import { message } from 'antd';

interface OptimisticUpdate<T> {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: T;
  previousData?: T;
  timestamp: number;
}

interface OptimisticUIOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollbackData?: T) => void;
  retryCount?: number;
  retryDelay?: number;
}

export function useOptimisticUI<T>(
  initialData: T,
  options: OptimisticUIOptions<T> = {}
) {
  const { onSuccess, onError, retryCount = 3, retryDelay = 1000 } = options;
  
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const pendingUpdates = useRef<OptimisticUpdate<T>[]>([]);
  const rollbackStack = useRef<T[]>([]);

  // Apply optimistic update immediately
  const applyOptimisticUpdate = useCallback((
    updateFn: (current: T) => T,
    updateId?: string
  ): string => {
    const id = updateId || Date.now().toString();
    
    setData((current) => {
      const previousData = current;
      const newData = updateFn(current);
      
      // Store rollback data
      rollbackStack.current.push(previousData);
      
      // Store pending update
      pendingUpdates.current.push({
        id,
        type: 'update',
        data: newData,
        previousData,
        timestamp: Date.now()
      });
      
      return newData;
    });
    
    return id;
  }, []);

  // Rollback to previous state
  const rollback = useCallback((updateId?: string) => {
    if (updateId) {
      // Rollback specific update
      const updateIndex = pendingUpdates.current.findIndex(u => u.id === updateId);
      if (updateIndex !== -1) {
        const update = pendingUpdates.current[updateIndex];
        if (update.previousData) {
          setData(update.previousData);
          pendingUpdates.current.splice(updateIndex, 1);
        }
      }
    } else {
      // Rollback last update
      const previousData = rollbackStack.current.pop();
      if (previousData) {
        setData(previousData);
        pendingUpdates.current.pop();
      }
    }
  }, []);

  // Commit optimistic update with server call
  const commitUpdate = useCallback(async (
    updateFn: (current: T) => T,
    serverCall: () => Promise<T>,
    options?: {
      showLoading?: boolean;
      successMessage?: string;
      errorMessage?: string;
    }
  ) => {
    const { showLoading = true, successMessage, errorMessage } = options || {};
    
    // Apply optimistic update
    const updateId = applyOptimisticUpdate(updateFn);
    
    if (showLoading) {
      setIsUpdating(true);
    }
    
    let attempts = 0;
    const maxAttempts = retryCount;
    
    const executeServerCall = async (): Promise<T> => {
      try {
        const result = await serverCall();
        
        // Remove from pending updates
        pendingUpdates.current = pendingUpdates.current.filter(u => u.id !== updateId);
        
        // Clear rollback for this update
        if (rollbackStack.current.length > 0) {
          rollbackStack.current.pop();
        }
        
        // Update with server response
        setData(result);
        setError(null);
        
        if (successMessage) {
          message.success(successMessage);
        }
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        attempts++;
        
        if (attempts < maxAttempts) {
          // Retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
          return executeServerCall();
        }
        
        // All retries failed, rollback
        rollback(updateId);
        
        const error = err as Error;
        setError(error);
        
        if (errorMessage) {
          message.error(errorMessage);
        } else {
          message.error('İşlem başarısız, değişiklikler geri alındı');
        }
        
        if (onError) {
          onError(error, rollbackStack.current[rollbackStack.current.length - 1]);
        }
        
        throw error;
      } finally {
        setIsUpdating(false);
      }
    };
    
    return executeServerCall();
  }, [applyOptimisticUpdate, rollback, retryCount, retryDelay, onSuccess, onError]);

  // Batch multiple optimistic updates
  const batchUpdate = useCallback(async (
    updates: Array<{
      updateFn: (current: T) => T;
      serverCall: () => Promise<T>;
    }>
  ) => {
    const updateIds: string[] = [];
    
    // Apply all optimistic updates
    updates.forEach(({ updateFn }) => {
      const id = applyOptimisticUpdate(updateFn);
      updateIds.push(id);
    });
    
    setIsUpdating(true);
    
    try {
      // Execute all server calls
      const results = await Promise.all(
        updates.map(({ serverCall }) => serverCall())
      );
      
      // Use the last result as the final state
      const finalResult = results[results.length - 1];
      setData(finalResult);
      
      // Clear pending updates
      pendingUpdates.current = pendingUpdates.current.filter(
        u => !updateIds.includes(u.id)
      );
      
      // Clear rollback stack
      rollbackStack.current = [];
      
      message.success('Tüm değişiklikler kaydedildi');
      
      return finalResult;
    } catch (err) {
      // Rollback all updates in reverse order
      updateIds.reverse().forEach(id => rollback(id));
      
      const error = err as Error;
      setError(error);
      message.error('İşlemler başarısız, tüm değişiklikler geri alındı');
      
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [applyOptimisticUpdate, rollback]);

  // Check if there are pending updates
  const hasPendingUpdates = pendingUpdates.current.length > 0;

  // Clear all pending updates
  const clearPendingUpdates = useCallback(() => {
    pendingUpdates.current = [];
    rollbackStack.current = [];
  }, []);

  return {
    data,
    isUpdating,
    error,
    hasPendingUpdates,
    applyOptimisticUpdate,
    commitUpdate,
    batchUpdate,
    rollback,
    clearPendingUpdates
  };
}

// Hook for optimistic list operations
export function useOptimisticList<T extends { id: string }>(
  initialItems: T[] = []
) {
  const {
    data: items,
    applyOptimisticUpdate,
    commitUpdate,
    rollback,
    ...rest
  } = useOptimisticUI<T[]>(initialItems);

  const addItem = useCallback(async (
    item: T,
    serverCall: () => Promise<T>
  ) => {
    return commitUpdate(
      (current) => [...current, item],
      serverCall,
      { successMessage: 'Eklendi' }
    );
  }, [commitUpdate]);

  const updateItem = useCallback(async (
    id: string,
    updates: Partial<T>,
    serverCall: () => Promise<T>
  ) => {
    return commitUpdate(
      (current) => current.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ),
      async () => {
        const result = await serverCall();
        return items.map(item => item.id === id ? result : item);
      },
      { successMessage: 'Güncellendi' }
    );
  }, [commitUpdate, items]);

  const deleteItem = useCallback(async (
    id: string,
    serverCall: () => Promise<void>
  ) => {
    return commitUpdate(
      (current) => current.filter(item => item.id !== id),
      async () => {
        await serverCall();
        return items.filter(item => item.id !== id);
      },
      { successMessage: 'Silindi' }
    );
  }, [commitUpdate, items]);

  const reorderItems = useCallback((
    fromIndex: number,
    toIndex: number
  ) => {
    applyOptimisticUpdate((current) => {
      const newItems = [...current];
      const [removed] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, removed);
      return newItems;
    });
  }, [applyOptimisticUpdate]);

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    rollback,
    ...rest
  };
}