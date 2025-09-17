# Phase 5B: Advanced Performance & UX Optimization

## Overview
Implement cutting-edge performance optimizations and user experience enhancements to achieve web performance excellence.

## 1. Core Web Vitals Optimization

### Largest Contentful Paint (LCP) < 2.5s
```tsx
// src/utils/performance/lcpOptimizer.ts
class LCPOptimizer {
  private criticalResources: Set<string> = new Set();
  private observer: PerformanceObserver;

  constructor() {
    this.setupLCPMeasurement();
    this.preloadCriticalResources();
  }

  private setupLCPMeasurement() {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      // Track LCP and optimize accordingly
      if (lastEntry.startTime > 2500) {
        this.optimizeLCP(lastEntry);
      }
    });

    this.observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  private optimizeLCP(entry: PerformanceEntry) {
    // Analyze what caused slow LCP
    const element = (entry as any).element;
    if (element?.tagName === 'IMG') {
      this.optimizeImages();
    } else if (element?.tagName === 'DIV') {
      this.optimizeTextRendering();
    }
  }

  preloadCriticalResources() {
    // Preload above-the-fold content
    const criticalRoutes = ['/dashboard', '/login'];
    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = route;
      link.as = 'fetch';
      document.head.appendChild(link);
    });
  }

  optimizeImages() {
    // Implement responsive images with next-gen formats
    document.querySelectorAll('img[data-src]').forEach((img) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const picture = document.createElement('picture');
            
            // WebP support
            const webpSource = document.createElement('source');
            webpSource.srcset = img.dataset.src?.replace(/\.(jpg|jpeg|png)$/, '.webp');
            webpSource.type = 'image/webp';
            
            // AVIF support
            const avifSource = document.createElement('source');
            avifSource.srcset = img.dataset.src?.replace(/\.(jpg|jpeg|png)$/, '.avif');
            avifSource.type = 'image/avif';
            
            picture.appendChild(avifSource);
            picture.appendChild(webpSource);
            picture.appendChild(img);
            
            observer.unobserve(entry.target);
          }
        });
      });
      
      observer.observe(img);
    });
  }
}

export const lcpOptimizer = new LCPOptimizer();
```

### First Input Delay (FID) < 100ms
```tsx
// src/utils/performance/fidOptimizer.ts
class FIDOptimizer {
  private taskScheduler: TaskScheduler;

  constructor() {
    this.taskScheduler = new TaskScheduler();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Optimize click handlers
    document.addEventListener('click', this.optimizeClickHandler.bind(this), { passive: true });
    
    // Optimize form interactions
    document.addEventListener('input', this.optimizeInputHandler.bind(this), { passive: true });
  }

  optimizeClickHandler(event: Event) {
    const target = event.target as HTMLElement;
    
    // Use scheduler for heavy operations
    if (target.dataset.heavy === 'true') {
      event.preventDefault();
      
      this.taskScheduler.postTask(() => {
        this.handleHeavyOperation(target);
      }, { priority: 'user-visible' });
    }
  }

  optimizeInputHandler(event: Event) {
    const input = event.target as HTMLInputElement;
    
    // Debounce and defer expensive operations
    this.taskScheduler.postTask(() => {
      this.handleInputValidation(input);
    }, { priority: 'background' });
  }

  handleHeavyOperation(element: HTMLElement) {
    // Break up heavy operations using scheduler
    const operation = element.dataset.operation;
    
    if (operation === 'data-processing') {
      this.processDataInChunks();
    }
  }

  async processDataInChunks() {
    const chunks = this.divideDataIntoChunks();
    
    for (const chunk of chunks) {
      await this.taskScheduler.postTask(() => {
        this.processChunk(chunk);
      }, { priority: 'background' });
      
      // Yield to main thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}

class TaskScheduler {
  private scheduler: any;

  constructor() {
    // Use native scheduler if available, fallback to setTimeout
    this.scheduler = (window as any).scheduler || {
      postTask: (callback: Function, options: any) => {
        const priority = options?.priority || 'user-visible';
        const delay = priority === 'background' ? 16 : 0;
        return new Promise(resolve => setTimeout(() => resolve(callback()), delay));
      }
    };
  }

  postTask(callback: Function, options?: { priority?: 'user-blocking' | 'user-visible' | 'background' }) {
    return this.scheduler.postTask(callback, options);
  }
}

export const fidOptimizer = new FIDOptimizer();
```

### Cumulative Layout Shift (CLS) < 0.1
```tsx
// src/utils/performance/clsOptimizer.ts
class CLSOptimizer {
  private layoutShiftScore = 0;
  private observer: PerformanceObserver;

  constructor() {
    this.setupCLSMeasurement();
    this.preventLayoutShifts();
  }

  setupCLSMeasurement() {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          this.layoutShiftScore += (entry as any).value;
          
          if (this.layoutShiftScore > 0.1) {
            this.fixLayoutShifts(entry);
          }
        }
      }
    });

    this.observer.observe({ entryTypes: ['layout-shift'] });
  }

  preventLayoutShifts() {
    // Reserve space for dynamic content
    this.reserveImageSpace();
    this.reserveFontSpace();
    this.reserveAdSpace();
  }

  reserveImageSpace() {
    document.querySelectorAll('img[data-width][data-height]').forEach((img: HTMLImageElement) => {
      const width = img.dataset.width;
      const height = img.dataset.height;
      
      if (width && height) {
        img.style.aspectRatio = `${width} / ${height}`;
        img.style.width = '100%';
        img.style.height = 'auto';
      }
    });
  }

  reserveFontSpace() {
    // Use font-display: swap with size adjust
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'CustomFont';
        src: url('/fonts/custom.woff2') format('woff2');
        font-display: swap;
        size-adjust: 100%;
      }
    `;
    document.head.appendChild(style);
  }

  fixLayoutShifts(entry: PerformanceEntry) {
    // Analyze and fix specific layout shifts
    const sources = (entry as any).sources;
    
    sources.forEach((source: any) => {
      const element = source.node;
      if (element) {
        // Add dimensions to prevent future shifts
        this.stabilizeElement(element);
      }
    });
  }

  stabilizeElement(element: HTMLElement) {
    if (!element.style.width && !element.style.height) {
      const rect = element.getBoundingClientRect();
      element.style.minHeight = `${rect.height}px`;
      element.style.minWidth = `${rect.width}px`;
    }
  }
}

export const clsOptimizer = new CLSOptimizer();
```

## 2. Advanced Component Optimizations

### Smart Re-rendering Prevention
```tsx
// src/shared/hooks/useSmartMemo.ts
import { useMemo, useRef } from 'react';

function useSmartMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  isEqual?: (prev: T, next: T) => boolean
): T {
  const previousResult = useRef<T>();
  const previousDeps = useRef<React.DependencyList>();

  return useMemo(() => {
    // Custom comparison for complex objects
    if (isEqual && previousResult.current !== undefined) {
      const newResult = factory();
      if (isEqual(previousResult.current, newResult)) {
        return previousResult.current;
      }
      previousResult.current = newResult;
      return newResult;
    }

    const result = factory();
    previousResult.current = result;
    previousDeps.current = deps;
    return result;
  }, deps);
}

// Usage in components
export const ExpensiveComponent = memo(() => {
  const expensiveData = useSmartMemo(
    () => computeExpensiveValue(props.data),
    [props.data],
    (prev, next) => prev.id === next.id && prev.version === next.version
  );

  return <div>{expensiveData.result}</div>;
});
```

### Virtualized Rendering Engine
```tsx
// src/shared/components/VirtualEngine/VirtualEngine.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';

interface VirtualEngineProps<T> {
  items: T[];
  itemHeight: number | ((item: T, index: number) => number);
  containerHeight: number;
  renderItem: (props: VirtualItemProps<T>) => React.ReactNode;
  overscan?: number;
  scrollingDelay?: number;
}

interface VirtualItemProps<T> {
  item: T;
  index: number;
  style: React.CSSProperties;
  isScrolling?: boolean;
}

export const VirtualEngine = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  scrollingDelay = 150
}: VirtualEngineProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const scrollingTimer = useRef<NodeJS.Timeout>();

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    setIsScrolling(true);

    if (scrollingTimer.current) {
      clearTimeout(scrollingTimer.current);
    }

    scrollingTimer.current = setTimeout(() => {
      setIsScrolling(false);
    }, scrollingDelay);
  }, [scrollingDelay]);

  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    if (typeof itemHeight === 'number') {
      const start = Math.floor(scrollTop / itemHeight);
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      
      return {
        startIndex: Math.max(0, start - overscan),
        endIndex: Math.min(items.length - 1, start + visibleCount + overscan),
        totalHeight: items.length * itemHeight
      };
    }

    // Variable height calculation
    let accumulatedHeight = 0;
    let startIndex = 0;
    let endIndex = 0;
    
    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height = itemHeight(items[i], i);
      if (accumulatedHeight + height > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      accumulatedHeight += height;
    }

    // Find end index
    let visibleHeight = 0;
    for (let i = startIndex; i < items.length; i++) {
      const height = itemHeight(items[i], i);
      visibleHeight += height;
      if (visibleHeight > containerHeight) {
        endIndex = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    // Calculate total height
    let totalHeight = 0;
    for (let i = 0; i < items.length; i++) {
      totalHeight += itemHeight(items[i], i);
    }

    return { startIndex, endIndex, totalHeight };
  }, [scrollTop, containerHeight, items, itemHeight, overscan]);

  const visibleItems = useMemo(() => {
    const result: Array<{
      item: T;
      index: number;
      top: number;
      height: number;
    }> = [];

    let top = 0;
    if (typeof itemHeight === 'number') {
      top = startIndex * itemHeight;
      for (let i = startIndex; i <= endIndex; i++) {
        result.push({
          item: items[i],
          index: i,
          top: top + (i - startIndex) * itemHeight,
          height: itemHeight
        });
      }
    } else {
      // Calculate accumulated height for variable heights
      for (let i = 0; i < startIndex; i++) {
        top += itemHeight(items[i], i);
      }

      for (let i = startIndex; i <= endIndex; i++) {
        const height = itemHeight(items[i], i);
        result.push({
          item: items[i],
          index: i,
          top,
          height
        });
        top += height;
      }
    }

    return result;
  }, [startIndex, endIndex, items, itemHeight]);

  return (
    <div
      ref={setContainerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top, height }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height
            }}
          >
            {renderItem({
              item,
              index,
              style: { height },
              isScrolling
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 3. Advanced UX Patterns

### Progressive Enhancement
```tsx
// src/shared/components/ProgressiveEnhancement.tsx
import { useState, useEffect, useRef } from 'react';

interface ProgressiveEnhancementProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  enhancement?: React.ReactNode;
  enhancementDelay?: number;
}

export const ProgressiveEnhancement: React.FC<ProgressiveEnhancementProps> = ({
  children,
  fallback,
  enhancement,
  enhancementDelay = 100
}) => {
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Base functionality loads immediately
    setIsLoaded(true);

    // Enhancement loads after delay
    timeoutRef.current = setTimeout(() => {
      setIsEnhanced(true);
    }, enhancementDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enhancementDelay]);

  if (!isLoaded) {
    return fallback || null;
  }

  return (
    <>
      {children}
      {isEnhanced && enhancement}
    </>
  );
};

// Usage example
const DataTable = () => (
  <ProgressiveEnhancement
    fallback={<BasicTable />}
    enhancement={<AdvancedFilters />}
    enhancementDelay={200}
  >
    <TableCore />
  </ProgressiveEnhancement>
);
```

### Skeleton Screen System
```tsx
// src/shared/components/SkeletonSystem.tsx
import { memo } from 'react';
import { Skeleton } from 'antd';

interface SkeletonSystemProps {
  type: 'table' | 'card' | 'form' | 'dashboard' | 'custom';
  rows?: number;
  columns?: number;
  customPattern?: React.ReactNode;
}

export const SkeletonSystem = memo<SkeletonSystemProps>(({
  type,
  rows = 5,
  columns = 4,
  customPattern
}) => {
  const patterns = {
    table: (
      <div>
        <Skeleton.Input style={{ width: 200, marginBottom: 16 }} active />
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton.Input key={colIndex} style={{ flex: 1 }} active />
            ))}
          </div>
        ))}
      </div>
    ),

    card: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
            <Skeleton.Avatar size={48} style={{ marginBottom: 16 }} />
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        ))}
      </div>
    ),

    form: (
      <div style={{ maxWidth: 400 }}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} style={{ marginBottom: 24 }}>
            <Skeleton.Input style={{ width: 120, marginBottom: 8 }} active />
            <Skeleton.Input style={{ width: '100%' }} active />
          </div>
        ))}
      </div>
    ),

    dashboard: (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <Skeleton.Input style={{ width: 200 }} active />
          <Skeleton.Button active />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>

        {/* Chart and Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <Skeleton active paragraph={{ rows: 8 }} />
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </div>
    ),

    custom: customPattern
  };

  return (
    <div className="skeleton-system">
      {patterns[type]}
    </div>
  );
});
```

### Smart Loading States
```tsx
// src/shared/hooks/useSmartLoading.ts
import { useState, useEffect, useRef } from 'react';

interface SmartLoadingOptions {
  minDisplayTime?: number; // Minimum time to show loading (prevent flashing)
  delayTime?: number; // Delay before showing loading (prevent unnecessary loading states)
  timeout?: number; // Maximum time to show loading
}

export const useSmartLoading = (
  isLoading: boolean,
  options: SmartLoadingOptions = {}
) => {
  const {
    minDisplayTime = 500,
    delayTime = 200,
    timeout = 30000
  } = options;

  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const [hasShownLoading, setHasShownLoading] = useState(false);
  
  const loadingStartTime = useRef<number>();
  const delayTimer = useRef<NodeJS.Timeout>();
  const minTimer = useRef<NodeJS.Timeout>();
  const timeoutTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isLoading) {
      // Set timeout for maximum loading time
      timeoutTimer.current = setTimeout(() => {
        setShouldShowLoading(false);
        console.warn('Loading timeout reached');
      }, timeout);

      // Delay showing loading state
      delayTimer.current = setTimeout(() => {
        setShouldShowLoading(true);
        setHasShownLoading(true);
        loadingStartTime.current = Date.now();
      }, delayTime);
    } else {
      // Clear delay timer if loading finishes quickly
      if (delayTimer.current) {
        clearTimeout(delayTimer.current);
      }

      // Clear timeout timer
      if (timeoutTimer.current) {
        clearTimeout(timeoutTimer.current);
      }

      if (hasShownLoading && loadingStartTime.current) {
        const elapsedTime = Date.now() - loadingStartTime.current;
        const remainingTime = minDisplayTime - elapsedTime;

        if (remainingTime > 0) {
          // Keep showing loading for minimum time
          minTimer.current = setTimeout(() => {
            setShouldShowLoading(false);
            setHasShownLoading(false);
          }, remainingTime);
        } else {
          setShouldShowLoading(false);
          setHasShownLoading(false);
        }
      } else {
        setShouldShowLoading(false);
        setHasShownLoading(false);
      }
    }

    return () => {
      if (delayTimer.current) clearTimeout(delayTimer.current);
      if (minTimer.current) clearTimeout(minTimer.current);
      if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    };
  }, [isLoading, minDisplayTime, delayTime, timeout, hasShownLoading]);

  return shouldShowLoading;
};
```

## 4. Implementation Priority

### High Priority (Week 1-2)
- [ ] Core Web Vitals optimization
- [ ] Smart loading states
- [ ] Progressive enhancement patterns
- [ ] Basic virtualization

### Medium Priority (Week 3-4)
- [ ] Advanced component optimizations
- [ ] Skeleton screen system
- [ ] Performance monitoring
- [ ] Bundle analysis optimization

### Low Priority (Week 5-6)
- [ ] Advanced virtualization
- [ ] Complex UX patterns
- [ ] Performance debugging tools
- [ ] Documentation and training

## Expected Outcomes

### Performance Metrics
- **Lighthouse Score**: 90+ across all metrics
- **LCP**: < 2.5s consistently
- **FID**: < 100ms for all interactions
- **CLS**: < 0.1 for all pages

### User Experience
- **Perceived performance**: 50% improvement
- **User satisfaction**: 40% increase
- **Task completion**: 30% faster
- **Error rates**: 60% reduction

### Business Impact
- **Conversion rates**: 25% increase
- **User retention**: 35% improvement
- **Support tickets**: 50% reduction
- **SEO rankings**: Significant improvement