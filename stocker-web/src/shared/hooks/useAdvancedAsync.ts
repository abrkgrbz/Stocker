import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

interface AsyncOptions {
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  immediate?: boolean;
}

/**
 * Advanced async hook with retry logic, timeout, and cancellation
 * Replaces repetitive try-catch patterns with a standardized approach
 */
export const useAdvancedAsync = <T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: AsyncOptions = {}
) => {
  const {
    retryCount = 3,
    retryDelay = 1000,
    timeout = 30000,
    onSuccess,
    onError,
    immediate = false
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: false
  });

  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const execute = useCallback(async (...args: any[]) => {
    // Reset state
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    try {
      // Set timeout
      timeoutRef.current = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, timeout);

      const result = await asyncFunction(...args);
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setState({
        data: result,
        error: null,
        loading: false
      });

      onSuccess?.(result);
      retryCountRef.current = 0;
      
      return result;
    } catch (error) {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const errorObj = error as Error;

      // Handle retries
      if (retryCountRef.current < retryCount && errorObj.name !== 'AbortError') {
        retryCountRef.current++;
        
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, retryCountRef.current - 1);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return execute(...args);
      }

      setState({
        data: null,
        error: errorObj,
        loading: false
      });

      onError?.(errorObj);
      throw errorObj;
    }
  }, [asyncFunction, retryCount, retryDelay, timeout, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  const reset = useCallback(() => {
    cancel();
    setState({
      data: null,
      error: null,
      loading: false
    });
    retryCountRef.current = 0;
  }, [cancel]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    ...state,
    execute,
    cancel,
    reset,
    retry: () => execute()
  };
};

/**
 * Specialized hook for API calls with sensible defaults
 */
export const useApiCall = <T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: AsyncOptions = {}
) => {
  return useAdvancedAsync(apiFunction, {
    retryCount: 2,
    retryDelay: 1000,
    timeout: 15000,
    ...options
  });
};

/**
 * Hook for optimistic updates with rollback on failure
 */
export const useOptimisticAsync = <T, U>(
  asyncFunction: (data: T) => Promise<U>,
  optimisticUpdateFn: (data: T) => void,
  rollbackFn: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (data: T) => {
    setIsLoading(true);
    setError(null);

    // Apply optimistic update
    optimisticUpdateFn(data);

    try {
      const result = await asyncFunction(data);
      setIsLoading(false);
      return result;
    } catch (err) {
      // Rollback optimistic update
      rollbackFn();
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, [asyncFunction, optimisticUpdateFn, rollbackFn]);

  return { execute, isLoading, error };
};

/**
 * Hook for debounced async operations
 */
export const useDebouncedAsync = <T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  delay: number = 500
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: false
  });
  
  const timeoutRef = useRef<NodeJS.Timeout>();

  const execute = useCallback((...args: any[]) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState(prev => ({ ...prev, loading: true }));

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await asyncFunction(...args);
        setState({
          data: result,
          error: null,
          loading: false
        });
        return result;
      } catch (error) {
        setState({
          data: null,
          error: error as Error,
          loading: false
        });
        throw error;
      }
    }, delay);
  }, [asyncFunction, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    execute
  };
};

/**
 * Hook for sequential async operations
 */
export const useSequentialAsync = <T>(
  asyncFunctions: Array<(...args: any[]) => Promise<any>>
) => {
  const [state, setState] = useState<{
    results: any[];
    currentStep: number;
    error: Error | null;
    loading: boolean;
  }>({
    results: [],
    currentStep: 0,
    error: null,
    loading: false
  });

  const execute = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      currentStep: 0,
      results: []
    }));

    const results: any[] = [];

    try {
      for (let i = 0; i < asyncFunctions.length; i++) {
        setState(prev => ({ ...prev, currentStep: i }));
        const result = await asyncFunctions[i]();
        results.push(result);
      }

      setState({
        results,
        currentStep: asyncFunctions.length,
        error: null,
        loading: false
      });

      return results;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        loading: false
      }));
      throw error;
    }
  }, [asyncFunctions]);

  return {
    ...state,
    execute,
    progress: state.currentStep / asyncFunctions.length
  };
};

/**
 * Hook for parallel async operations with individual error handling
 */
export const useParallelAsync = () => {
  const [state, setState] = useState<{
    results: Array<{ data: any; error: Error | null }>;
    loading: boolean;
    hasErrors: boolean;
  }>({
    results: [],
    loading: false,
    hasErrors: false
  });

  const execute = useCallback(async (
    asyncFunctions: Array<() => Promise<any>>
  ) => {
    setState({
      results: [],
      loading: true,
      hasErrors: false
    });

    const promises = asyncFunctions.map(fn => 
      fn().then(
        data => ({ data, error: null }),
        error => ({ data: null, error })
      )
    );

    const results = await Promise.all(promises);
    const hasErrors = results.some(r => r.error !== null);

    setState({
      results,
      loading: false,
      hasErrors
    });

    return results;
  }, []);

  return {
    ...state,
    execute
  };
};