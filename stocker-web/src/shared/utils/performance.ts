import { useEffect, useRef, useCallback } from 'react';

/**
 * Debounce hook for optimizing frequent function calls
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  return debouncedCallback;
}

/**
 * Throttle hook for limiting function execution rate
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callbackRef.current(...args);
      }
    },
    [delay]
  ) as T;

  return throttledCallback;
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Request Idle Callback wrapper for non-critical updates
 */
export function requestIdleCallback(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * Batch updates for better performance
 */
export class BatchProcessor<T> {
  private queue: T[] = [];
  private processing = false;
  private batchSize: number;
  private processor: (batch: T[]) => Promise<void>;
  private delay: number;

  constructor(
    processor: (batch: T[]) => Promise<void>,
    batchSize = 10,
    delay = 100
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(item: T): void {
    this.queue.push(item);
    this.processBatch();
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    await new Promise(resolve => setTimeout(resolve, this.delay));

    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      await this.processor(batch);
    } catch (error) {
      // Error handling removed for production
    } finally {
      this.processing = false;
      
      if (this.queue.length > 0) {
        this.processBatch();
      }
    }
  }
}

/**
 * Memory cache with TTL
 */
export class MemoryCache<T> {
  private cache = new Map<string, { value: T; expires: number }>();
  private defaultTTL: number;

  constructor(defaultTTL = 5 * 60 * 1000) {
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
    });
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) return undefined;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

/**
 * Virtual scroll hook for large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  buffer = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);
  
  const start = Math.max(0, visibleStart - buffer);
  const end = Math.min(items.length, visibleEnd + buffer);
  
  const visibleItems = items.slice(start, end);
  const totalHeight = items.length * itemHeight;
  const offsetY = start * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
}

/**
 * Preload images for better performance
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      url =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        })
    )
  );
}

/**
 * Chunk array for processing large datasets
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

import { useState } from 'react';