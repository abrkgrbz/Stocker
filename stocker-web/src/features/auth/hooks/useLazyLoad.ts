import { useEffect, useRef, useState, useCallback } from 'react';

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const useLazyLoad = (options: LazyLoadOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    onLoad,
    onError
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observerOptions: IntersectionObserverInit = {
      threshold,
      rootMargin
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          
          if (triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      });
    }, observerOptions);

    observerRef.current.observe(ref.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  useEffect(() => {
    if (isInView && !isLoaded) {
      setIsLoaded(true);
      if (onLoad) {
        onLoad();
      }
    }
  }, [isInView, isLoaded, onLoad]);

  return {
    ref,
    isLoaded,
    isInView
  };
};

// Hook for lazy loading images
interface LazyImageOptions {
  src: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const useLazyImage = (options: LazyImageOptions) => {
  const { src, placeholder, onLoad, onError } = options;
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { ref, isInView } = useLazyLoad({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    
    const handleLoad = () => {
      setImageSrc(src);
      setLoading(false);
      if (onLoad) onLoad();
    };

    const handleError = () => {
      const err = new Error(`Failed to load image: ${src}`);
      setError(err);
      setLoading(false);
      if (onError) onError(err);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = src;

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [isInView, src, onLoad, onError]);

  return {
    ref,
    src: imageSrc,
    loading,
    error
  };
};

// Hook for lazy loading components
export const useLazyComponent = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>
) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { ref, isInView } = useLazyLoad({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    if (!isInView || Component) return;

    setLoading(true);
    
    importFn()
      .then((module) => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [isInView, importFn]);

  return {
    ref,
    Component,
    loading,
    error
  };
};

// Virtual scrolling hook for large lists
interface VirtualScrollOptions {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualScroll = (options: VirtualScrollOptions) => {
  const { items, itemHeight, containerHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleCount + overscan * 2
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    scrollRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  };
};