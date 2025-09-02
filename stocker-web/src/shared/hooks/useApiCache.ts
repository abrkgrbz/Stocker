import { useState, useEffect, useRef, useCallback } from 'react';
import { MemoryCache } from '@/shared/utils/performance';

interface CacheOptions {
  ttl?: number;
  staleTime?: number;
  retryCount?: number;
  retryDelay?: number;
}

interface CacheResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

const cache = new MemoryCache<any>();

export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): CacheResult<T> {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    staleTime = 30 * 1000, // 30 seconds
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const fetchTimeRef = useRef<number>(0);
  const mountedRef = useRef(true);

  const fetchWithRetry = useCallback(async (retriesLeft = retryCount): Promise<T> => {
    try {
      const result = await fetcher();
      return result;
    } catch (err) {
      if (retriesLeft > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchWithRetry(retriesLeft - 1);
      }
      throw err;
    }
  }, [fetcher, retryCount, retryDelay]);

  const fetchData = useCallback(async (bypassCache = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (!bypassCache) {
        const cachedData = cache.get(key);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          fetchTimeRef.current = Date.now();
          
          // Check if data is stale
          setTimeout(() => {
            if (mountedRef.current) {
              setIsStale(true);
            }
          }, staleTime);
          
          return;
        }
      }

      // Fetch fresh data
      const freshData = await fetchWithRetry();
      
      if (mountedRef.current) {
        setData(freshData);
        cache.set(key, freshData, ttl);
        fetchTimeRef.current = Date.now();
        setIsStale(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [key, fetchWithRetry, ttl, staleTime]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [key]);

  // Check for staleness periodically
  useEffect(() => {
    const checkStaleness = () => {
      if (fetchTimeRef.current && Date.now() - fetchTimeRef.current > staleTime) {
        setIsStale(true);
      }
    };

    const interval = setInterval(checkStaleness, staleTime / 2);
    return () => clearInterval(interval);
  }, [staleTime]);

  return {
    data,
    loading,
    error,
    refetch,
    isStale,
  };
}

// Prefetch data for better UX
export function prefetchApi<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 5 * 60 * 1000
): void {
  if (!cache.has(key)) {
    fetcher().then(data => {
      cache.set(key, data, ttl);
    }).catch(console.error);
  }
}

// Clear specific cache or all
export function clearApiCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Batch API calls
export function useBatchApi<T, R>(
  batchProcessor: (items: T[]) => Promise<R[]>,
  batchSize = 10,
  delay = 100
) {
  const [results, setResults] = useState<Map<T, R>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queueRef = useRef<T[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const processBatch = useCallback(async () => {
    if (queueRef.current.length === 0) return;

    setLoading(true);
    const batch = queueRef.current.splice(0, batchSize);

    try {
      const batchResults = await batchProcessor(batch);
      setResults(prev => {
        const newMap = new Map(prev);
        batch.forEach((item, index) => {
          newMap.set(item, batchResults[index]);
        });
        return newMap;
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);

      if (queueRef.current.length > 0) {
        timeoutRef.current = setTimeout(processBatch, delay);
      }
    }
  }, [batchProcessor, batchSize, delay]);

  const addToBatch = useCallback((item: T) => {
    queueRef.current.push(item);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(processBatch, delay);
  }, [processBatch, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    results,
    loading,
    error,
    addToBatch,
  };
}