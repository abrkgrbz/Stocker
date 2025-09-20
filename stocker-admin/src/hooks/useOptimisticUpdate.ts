import { useState, useCallback } from 'react';
import { useLoadingStore } from '../stores/loadingStore';
import { errorService } from '../services/errorService';
import Swal from 'sweetalert2';

interface OptimisticUpdateOptions<T> {
  loadingKey?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
  showNotification?: boolean;
}

export function useOptimisticUpdate<T = any>() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const { setLoading } = useLoadingStore();

  const execute = useCallback(async (
    optimisticValue: T,
    apiCall: () => Promise<T>,
    options: OptimisticUpdateOptions<T> = {}
  ) => {
    const {
      loadingKey,
      onSuccess,
      onError,
      successMessage = 'Operation completed successfully',
      errorMessage = 'Operation failed',
      showNotification = true,
    } = options;

    // Set loading state
    setIsUpdating(true);
    if (loadingKey) {
      setLoading(loadingKey, true);
    }

    // Apply optimistic update
    setOptimisticData(optimisticValue);

    try {
      // Make API call
      const result = await apiCall();
      
      // Update with real data
      setOptimisticData(result);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      // Show success notification
      if (showNotification) {
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: successMessage,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top',
        });
      }

      return result;
    } catch (error) {
      // Rollback optimistic update
      setOptimisticData(null);
      
      // Handle error
      errorService.handleError(error);
      
      // Call error callback
      if (onError) {
        onError(error);
      }

      // Show error notification
      if (showNotification) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonText: 'OK',
        });
      }

      throw error;
    } finally {
      setIsUpdating(false);
      if (loadingKey) {
        setLoading(loadingKey, false);
      }
    }
  }, [setLoading]);

  const reset = useCallback(() => {
    setOptimisticData(null);
    setIsUpdating(false);
  }, []);

  return {
    execute,
    isUpdating,
    optimisticData,
    reset,
  };
}

// Hook for batch optimistic updates
export function useBatchOptimisticUpdate<T = any>() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [optimisticItems, setOptimisticItems] = useState<Map<string, T>>(new Map());
  const { setLoading } = useLoadingStore();

  const executeItem = useCallback(async (
    id: string,
    optimisticValue: T,
    apiCall: () => Promise<T>,
    options: OptimisticUpdateOptions<T> = {}
  ) => {
    const { loadingKey } = options;

    // Set loading state
    if (loadingKey) {
      setLoading(`${loadingKey}:${id}`, true);
    }

    // Apply optimistic update for this item
    setOptimisticItems(prev => {
      const next = new Map(prev);
      next.set(id, optimisticValue);
      return next;
    });

    try {
      const result = await apiCall();
      
      // Update with real data
      setOptimisticItems(prev => {
        const next = new Map(prev);
        next.set(id, result);
        return next;
      });

      return result;
    } catch (error) {
      // Remove failed optimistic update
      setOptimisticItems(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });

      throw error;
    } finally {
      if (loadingKey) {
        setLoading(`${loadingKey}:${id}`, false);
      }
    }
  }, [setLoading]);

  const executeBatch = useCallback(async (
    updates: Array<{ id: string; optimistic: T; apiCall: () => Promise<T> }>,
    options: OptimisticUpdateOptions<T[]> = {}
  ) => {
    const { loadingKey, onSuccess, onError, showNotification = true } = options;

    setIsUpdating(true);
    if (loadingKey) {
      setLoading(loadingKey, true);
    }

    // Apply all optimistic updates
    const optimisticMap = new Map<string, T>();
    updates.forEach(({ id, optimistic }) => {
      optimisticMap.set(id, optimistic);
    });
    setOptimisticItems(optimisticMap);

    const results: T[] = [];
    const errors: Array<{ id: string; error: any }> = [];

    // Execute all API calls
    await Promise.all(
      updates.map(async ({ id, apiCall }) => {
        try {
          const result = await apiCall();
          results.push(result);
          
          // Update with real data
          setOptimisticItems(prev => {
            const next = new Map(prev);
            next.set(id, result);
            return next;
          });
        } catch (error) {
          errors.push({ id, error });
          
          // Remove failed optimistic update
          setOptimisticItems(prev => {
            const next = new Map(prev);
            next.delete(id);
            return next;
          });
        }
      })
    );

    // Handle results
    if (errors.length === 0) {
      if (onSuccess) {
        onSuccess(results);
      }

      if (showNotification) {
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Successfully updated ${results.length} items`,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top',
        });
      }
    } else {
      if (onError) {
        onError(errors);
      }

      if (showNotification) {
        await Swal.fire({
          icon: 'warning',
          title: 'Partial Success',
          text: `Updated ${results.length} items, ${errors.length} failed`,
          confirmButtonText: 'OK',
        });
      }
    }

    setIsUpdating(false);
    if (loadingKey) {
      setLoading(loadingKey, false);
    }

    return { results, errors };
  }, [setLoading]);

  const reset = useCallback(() => {
    setOptimisticItems(new Map());
    setIsUpdating(false);
  }, []);

  return {
    executeItem,
    executeBatch,
    isUpdating,
    optimisticItems,
    reset,
  };
}