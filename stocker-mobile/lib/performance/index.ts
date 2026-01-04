/**
 * Performance Optimization Utilities
 * Memoization, debouncing, throttling, and list optimization
 */
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * Debounce hook for search inputs and rapid events
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [callback, delay]
    ) as T;
}

/**
 * Throttle hook for scroll events and expensive operations
 */
export function useThrottle<T>(value: T, limit: number): T {
    const [throttledValue, setThrottledValue] = useState(value);
    const lastRan = useRef(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, limit - (Date.now() - lastRan.current));

        return () => clearTimeout(handler);
    }, [value, limit]);

    return throttledValue;
}

/**
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
    callback: T,
    limit: number
): T {
    const lastRan = useRef(Date.now());
    const lastArgs = useRef<Parameters<T> | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();
            lastArgs.current = args;

            if (now - lastRan.current >= limit) {
                callback(...args);
                lastRan.current = now;
            } else if (!timeoutRef.current) {
                timeoutRef.current = setTimeout(() => {
                    if (lastArgs.current) {
                        callback(...lastArgs.current);
                        lastRan.current = Date.now();
                    }
                    timeoutRef.current = null;
                }, limit - (now - lastRan.current));
            }
        },
        [callback, limit]
    ) as T;
}

/**
 * Memoized search filter hook
 */
export function useFilteredList<T>(
    items: T[],
    searchQuery: string,
    filterFn: (item: T, query: string) => boolean,
    debounceMs: number = 300
): T[] {
    const debouncedQuery = useDebounce(searchQuery, debounceMs);

    return useMemo(() => {
        if (!debouncedQuery.trim()) {
            return items;
        }
        return items.filter(item => filterFn(item, debouncedQuery.toLowerCase()));
    }, [items, debouncedQuery, filterFn]);
}

/**
 * Pagination hook for large lists
 */
interface PaginationResult<T> {
    paginatedItems: T[];
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
    loadMore: () => void;
    reset: () => void;
}

export function usePagination<T>(
    items: T[],
    pageSize: number = 20
): PaginationResult<T> {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / pageSize);
    const hasMore = currentPage < totalPages;

    const paginatedItems = useMemo(() => {
        return items.slice(0, currentPage * pageSize);
    }, [items, currentPage, pageSize]);

    const loadMore = useCallback(() => {
        if (hasMore) {
            setCurrentPage(prev => prev + 1);
        }
    }, [hasMore]);

    const reset = useCallback(() => {
        setCurrentPage(1);
    }, []);

    return {
        paginatedItems,
        currentPage,
        totalPages,
        hasMore,
        loadMore,
        reset,
    };
}

/**
 * Infinite scroll hook
 */
interface InfiniteScrollResult<T> {
    items: T[];
    isLoading: boolean;
    error: Error | null;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
}

export function useInfiniteScroll<T>(
    fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
    pageSize: number = 20
): InfiniteScrollResult<T> {
    const [items, setItems] = useState<T[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchFn(page);
            setItems(prev => [...prev, ...result.data]);
            setHasMore(result.hasMore);
            setPage(prev => prev + 1);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchFn, page, isLoading, hasMore]);

    const refresh = useCallback(async () => {
        setItems([]);
        setPage(1);
        setHasMore(true);
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchFn(1);
            setItems(result.data);
            setHasMore(result.hasMore);
            setPage(2);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchFn]);

    return {
        items,
        isLoading,
        error,
        hasMore,
        loadMore,
        refresh,
    };
}

/**
 * Cache hook for API responses
 */
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export function useCachedData<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlMs: number = 5 * 60 * 1000 // 5 minutes default
): {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    invalidate: () => void;
} {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async (ignoreCache: boolean = false) => {
        // Check cache first
        if (!ignoreCache) {
            const cached = memoryCache.get(key);
            if (cached && Date.now() - cached.timestamp < ttlMs) {
                setData(cached.data);
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchFn();
            setData(result);
            memoryCache.set(key, { data: result, timestamp: Date.now() });
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [key, fetchFn, ttlMs]);

    const refetch = useCallback(() => fetchData(true), [fetchData]);

    const invalidate = useCallback(() => {
        memoryCache.delete(key);
    }, [key]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch, invalidate };
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
    callback: () => void,
    options?: IntersectionObserverInit
): React.RefObject<any> {
    const targetRef = useRef<any>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    callback();
                }
            });
        }, options);

        const currentTarget = targetRef.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [callback, options]);

    return targetRef;
}

/**
 * Performance measurement hook
 */
export function usePerformanceMeasure(name: string): {
    startMeasure: () => void;
    endMeasure: () => number;
} {
    const startTimeRef = useRef<number | null>(null);

    const startMeasure = useCallback(() => {
        startTimeRef.current = performance.now();
    }, []);

    const endMeasure = useCallback(() => {
        if (startTimeRef.current === null) {
            console.warn(`Performance measure "${name}" was not started`);
            return 0;
        }
        const duration = performance.now() - startTimeRef.current;
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
        startTimeRef.current = null;
        return duration;
    }, [name]);

    return { startMeasure, endMeasure };
}

/**
 * Optimized keyExtractor for FlatList
 */
export function createKeyExtractor<T>(
    idKey: keyof T = 'id' as keyof T
): (item: T, index: number) => string {
    return (item: T, index: number) => {
        const id = item[idKey];
        if (id !== undefined && id !== null) {
            return String(id);
        }
        return String(index);
    };
}

/**
 * Batch state updates
 */
export function useBatchedUpdates<T>(
    initialValue: T,
    batchDelayMs: number = 16 // ~1 frame
): [T, (updater: (prev: T) => T) => void] {
    const [value, setValue] = useState(initialValue);
    const pendingUpdatesRef = useRef<Array<(prev: T) => T>>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const batchedSetValue = useCallback((updater: (prev: T) => T) => {
        pendingUpdatesRef.current.push(updater);

        if (!timeoutRef.current) {
            timeoutRef.current = setTimeout(() => {
                setValue(prev => {
                    let newValue = prev;
                    for (const update of pendingUpdatesRef.current) {
                        newValue = update(newValue);
                    }
                    return newValue;
                });
                pendingUpdatesRef.current = [];
                timeoutRef.current = null;
            }, batchDelayMs);
        }
    }, [batchDelayMs]);

    return [value, batchedSetValue];
}
