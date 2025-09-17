# Phase 5A: Modern React 18+ Features Implementation

## Overview
Implement advanced React 18 features to enhance performance, user experience, and developer productivity.

## 1. Concurrent Features Implementation

### Suspense for Data Fetching
```tsx
// src/shared/components/SuspenseQuery.tsx
import { Suspense } from 'react';
import { Spin } from 'antd';

interface SuspenseQueryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error: Error }>;
}

export const SuspenseQuery: React.FC<SuspenseQueryProps> = ({
  children,
  fallback = <Spin size="large" />,
  errorFallback: ErrorFallback
}) => {
  return (
    <Suspense fallback={fallback}>
      {ErrorFallback ? (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {children}
        </ErrorBoundary>
      ) : (
        children
      )}
    </Suspense>
  );
};
```

### Concurrent Mode Optimization
```tsx
// src/hooks/useConcurrentState.ts
import { useDeferredValue, useTransition, useState } from 'react';

export const useConcurrentState = <T>(initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);
  const [isPending, startTransition] = useTransition();
  const deferredValue = useDeferredValue(value);

  const updateValue = (newValue: T | ((prev: T) => T)) => {
    startTransition(() => {
      setValue(newValue);
    });
  };

  return {
    value: deferredValue,
    setValue: updateValue,
    isPending
  };
};
```

## 2. Advanced Performance Optimizations

### Smart Component Splitting
```tsx
// src/shared/components/LazySection.tsx
import { lazy, Suspense, memo } from 'react';
import { Skeleton } from 'antd';

interface LazySectionProps {
  componentPath: string;
  fallback?: React.ReactNode;
  intersectionObserver?: boolean;
}

export const LazySection = memo<LazySectionProps>(({
  componentPath,
  fallback = <Skeleton active />,
  intersectionObserver = true
}) => {
  const LazyComponent = lazy(() => import(componentPath));
  
  if (intersectionObserver) {
    return (
      <IntersectionObserver>
        <Suspense fallback={fallback}>
          <LazyComponent />
        </Suspense>
      </IntersectionObserver>
    );
  }

  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
});
```

### Intelligent Preloading
```tsx
// src/utils/preloader.ts
class ComponentPreloader {
  private preloadedComponents = new Set<string>();

  preloadComponent(componentPath: string) {
    if (this.preloadedComponents.has(componentPath)) return;
    
    // Preload during idle time
    requestIdleCallback(() => {
      import(componentPath).then(() => {
        this.preloadedComponents.add(componentPath);
      });
    });
  }

  preloadRoute(route: string) {
    const routeComponents = {
      '/dashboard': () => import('@/features/master/pages/Dashboard'),
      '/crm': () => import('@/features/crm'),
      '/sales': () => import('@/features/sales'),
    };

    const loader = routeComponents[route];
    if (loader) {
      requestIdleCallback(() => loader());
    }
  }
}

export const preloader = new ComponentPreloader();
```

## 3. Advanced State Management

### Optimistic Updates with React Query
```tsx
// src/shared/hooks/useOptimisticMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: string[];
  updateFn: (oldData: any, variables: TVariables) => any;
  rollbackFn?: (oldData: any) => any;
}

export const useOptimisticMutation = <TData, TVariables>({
  mutationFn,
  queryKey,
  updateFn,
  rollbackFn
}: OptimisticMutationOptions<TData, TVariables>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistically update
      queryClient.setQueryData(queryKey, (old) => updateFn(old, variables));
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey });
    }
  });
};
```

### Advanced Zustand Store Patterns
```tsx
// src/stores/optimizedStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface StoreState {
  data: any[];
  loading: boolean;
  error: string | null;
  filters: Record<string, any>;
}

export const useOptimizedStore = create<StoreState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      data: [],
      loading: false,
      error: null,
      filters: {},

      // Optimized actions
      setData: (data: any[]) => set((state) => {
        state.data = data;
        state.loading = false;
        state.error = null;
      }),

      updateItem: (id: string, updates: any) => set((state) => {
        const index = state.data.findIndex(item => item.id === id);
        if (index !== -1) {
          Object.assign(state.data[index], updates);
        }
      }),

      setFilters: (filters: Record<string, any>) => set((state) => {
        state.filters = { ...state.filters, ...filters };
      })
    }))
  )
);

// Selector hooks for performance
export const useStoreData = () => useOptimizedStore(state => state.data);
export const useStoreLoading = () => useOptimizedStore(state => state.loading);
export const useStoreFilters = () => useOptimizedStore(state => state.filters);
```

## 4. Advanced Component Patterns

### Compound Components
```tsx
// src/shared/components/DataTable/index.tsx
interface DataTableContextValue {
  data: any[];
  loading: boolean;
  selection: any[];
  onSelectionChange: (selection: any[]) => void;
}

const DataTableContext = createContext<DataTableContextValue | undefined>(undefined);

const DataTableRoot: React.FC<DataTableProps> = ({ children, ...props }) => {
  const [selection, setSelection] = useState([]);
  
  const contextValue = {
    data: props.data,
    loading: props.loading,
    selection,
    onSelectionChange: setSelection
  };

  return (
    <DataTableContext.Provider value={contextValue}>
      <div className="data-table-container">
        {children}
      </div>
    </DataTableContext.Provider>
  );
};

const DataTableHeader: React.FC = ({ children }) => (
  <div className="data-table-header">{children}</div>
);

const DataTableBody: React.FC = () => {
  const context = useContext(DataTableContext);
  // Implementation...
};

const DataTableToolbar: React.FC = ({ children }) => (
  <div className="data-table-toolbar">{children}</div>
);

// Export as compound component
export const DataTable = Object.assign(DataTableRoot, {
  Header: DataTableHeader,
  Body: DataTableBody,
  Toolbar: DataTableToolbar
});
```

### Render Props Pattern
```tsx
// src/shared/components/VirtualizedList.tsx
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (props: { item: T; index: number; style: CSSProperties }) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}

export const VirtualizedList = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  renderEmpty
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  
  if (items.length === 0) {
    return renderEmpty ? renderEmpty() : null;
  }

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          return renderItem({
            item,
            index: actualIndex,
            style: {
              position: 'absolute',
              top: actualIndex * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight
            }
          });
        })}
      </div>
    </div>
  );
};
```

## 5. Implementation Timeline

### Week 1: Concurrent Features
- [ ] Implement useDeferredValue for search inputs
- [ ] Add useTransition for route navigation
- [ ] Create SuspenseQuery wrapper
- [ ] Optimize heavy computations with concurrent features

### Week 2: Performance Enhancements
- [ ] Implement intelligent preloading
- [ ] Add intersection observer lazy loading
- [ ] Create optimistic update patterns
- [ ] Implement advanced memoization strategies

### Week 3: Component Architecture
- [ ] Build compound component library
- [ ] Implement render props patterns
- [ ] Create virtualized components
- [ ] Add advanced error boundaries

### Week 4: Testing & Documentation
- [ ] Write tests for new patterns
- [ ] Create component documentation
- [ ] Performance benchmarking
- [ ] Migration guides

## Expected Outcomes

### Performance Improvements
- **30% faster** user interactions with concurrent features
- **50% reduction** in unnecessary re-renders
- **40% faster** route transitions with preloading
- **60% better** perceived performance

### Developer Experience
- **Reusable patterns** for common use cases
- **Better component composition** with compound components
- **Optimistic updates** for better UX
- **Advanced state management** patterns

### Bundle Impact
- **Minimal increase** (~5KB) for concurrent features
- **Better tree shaking** with optimized imports
- **Lazy loading improvements** for better initial load
- **Chunk optimization** for better caching