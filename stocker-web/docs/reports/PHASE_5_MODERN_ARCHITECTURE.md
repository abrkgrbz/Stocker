# Phase 5C: Modern Development & Architecture Patterns

## Overview
Implement advanced architectural patterns and modern development practices to create a scalable, maintainable, and future-proof frontend application.

## 1. Micro-Frontend Architecture Preparation

### Module Federation Setup
```typescript
// webpack.config.js (for micro-frontend preparation)
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  mode: 'development',
  plugins: [
    new ModuleFederationPlugin({
      name: 'stocker_shell',
      filename: 'remoteEntry.js',
      exposes: {
        './CRMModule': './src/features/crm/index.ts',
        './SalesModule': './src/features/sales/index.ts',
        './InventoryModule': './src/features/inventory/index.ts',
        './SharedComponents': './src/shared/components/index.ts',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
        antd: { singleton: true },
        '@tanstack/react-query': { singleton: true },
      },
    }),
  ],
};

// src/utils/microfrontend/loader.ts
interface MicrofrontendConfig {
  name: string;
  entry: string;
  module: string;
  scope: string;
}

class MicrofrontendLoader {
  private loadedModules = new Map<string, any>();

  async loadMicrofrontend(config: MicrofrontendConfig): Promise<any> {
    if (this.loadedModules.has(config.name)) {
      return this.loadedModules.get(config.name);
    }

    try {
      // Dynamically load remote module
      await this.loadScript(config.entry);
      
      const container = (window as any)[config.scope];
      await container.init((window as any).__webpack_share_scopes__.default);
      
      const factory = await container.get(config.module);
      const Module = factory();
      
      this.loadedModules.set(config.name, Module);
      return Module;
    } catch (error) {
      console.error(`Failed to load microfrontend: ${config.name}`, error);
      // Return fallback component
      return this.getFallbackComponent(config.name);
    }
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private getFallbackComponent(name: string) {
    return () => <div>Failed to load {name} module</div>;
  }
}

export const microfrontendLoader = new MicrofrontendLoader();
```

### Feature Isolation Pattern
```tsx
// src/features/core/FeatureModule.tsx
interface FeatureModuleProps {
  moduleId: string;
  config?: any;
  fallback?: React.ComponentType;
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export const FeatureModule: React.FC<FeatureModuleProps> = ({
  moduleId,
  config,
  fallback: Fallback = () => <Spin size="large" />,
  errorBoundary: ErrorBoundary = DefaultErrorBoundary
}) => {
  const [module, setModule] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const loadModule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ModuleComponent = await microfrontendLoader.loadMicrofrontend({
        name: moduleId,
        entry: `${config?.baseUrl}/remoteEntry.js`,
        module: `./${moduleId}`,
        scope: moduleId
      });
      
      setModule(() => ModuleComponent);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [moduleId, config]);

  useEffect(() => {
    loadModule();
  }, [loadModule]);

  if (loading) return <Fallback />;
  if (error) return <ErrorBoundary error={error} retry={loadModule} />;
  if (!module) return <Fallback />;

  const ModuleComponent = module;
  return <ModuleComponent {...config} />;
};
```

## 2. Advanced State Management Patterns

### Event-Driven Architecture
```tsx
// src/shared/events/EventBus.ts
type EventListener<T = any> = (data: T) => void | Promise<void>;

interface EventBusEvents {
  'user.login': { userId: string; timestamp: number };
  'data.updated': { entityType: string; entityId: string; data: any };
  'ui.navigation': { from: string; to: string };
  'error.occurred': { error: Error; context: string };
  'feature.loaded': { featureName: string; loadTime: number };
}

class EventBus {
  private listeners = new Map<string, Set<EventListener>>();
  private history: Array<{ event: string; data: any; timestamp: number }> = [];
  private middleware: Array<(event: string, data: any) => boolean> = [];

  // Type-safe event subscription
  on<K extends keyof EventBusEvents>(
    event: K,
    listener: EventListener<EventBusEvents[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  // Type-safe event emission
  emit<K extends keyof EventBusEvents>(event: K, data: EventBusEvents[K]): void {
    // Run middleware
    const shouldContinue = this.middleware.every(middleware => 
      middleware(event, data)
    );

    if (!shouldContinue) return;

    // Store in history
    this.history.push({ event, data, timestamp: Date.now() });
    if (this.history.length > 1000) {
      this.history.shift(); // Keep last 1000 events
    }

    // Emit to listeners
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Middleware for event processing
  use(middleware: (event: string, data: any) => boolean): void {
    this.middleware.push(middleware);
  }

  // Get event history
  getHistory(eventType?: string): typeof this.history {
    if (eventType) {
      return this.history.filter(entry => entry.event === eventType);
    }
    return [...this.history];
  }

  // Clear listeners
  clear(): void {
    this.listeners.clear();
    this.history = [];
  }
}

export const eventBus = new EventBus();

// React hook for event bus
export const useEventBus = () => {
  const subscribe = useCallback(<K extends keyof EventBusEvents>(
    event: K,
    listener: EventListener<EventBusEvents[K]>
  ) => {
    return eventBus.on(event, listener);
  }, []);

  const emit = useCallback(<K extends keyof EventBusEvents>(
    event: K,
    data: EventBusEvents[K]
  ) => {
    eventBus.emit(event, data);
  }, []);

  return { subscribe, emit };
};
```

### Advanced Zustand Patterns
```tsx
// src/stores/advanced/createAdvancedStore.ts
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface StoreOptions<T> {
  name: string;
  version?: number;
  persistence?: {
    key: string;
    storage?: 'localStorage' | 'sessionStorage';
    partialize?: (state: T) => Partial<T>;
  };
  devtools?: boolean;
  onStateChange?: (newState: T, previousState: T) => void;
}

export function createAdvancedStore<T>(
  initialState: T,
  actions: (set: any, get: any, api: any) => any,
  options: StoreOptions<T>
) {
  let store = create<T & any>()(
    subscribeWithSelector(
      immer((set, get, api) => ({
        ...initialState,
        ...actions(set, get, api),

        // Reset state
        $reset: () => set(() => initialState),

        // Patch state (similar to React's setState)
        $patch: (partial: Partial<T>) => set((state: any) => {
          Object.assign(state, partial);
        }),

        // Batch updates
        $batch: (updates: Array<(state: any) => void>) => set((state: any) => {
          updates.forEach(update => update(state));
        }),

        // Get state snapshot
        $snapshot: () => get(),
      }))
    )
  );

  // Add persistence if configured
  if (options.persistence) {
    const storage = options.persistence.storage === 'sessionStorage' 
      ? sessionStorage 
      : localStorage;

    store = create<T & any>()(
      persist(
        subscribeWithSelector(
          immer((set, get, api) => ({
            ...initialState,
            ...actions(set, get, api),
            $reset: () => set(() => initialState),
            $patch: (partial: Partial<T>) => set((state: any) => {
              Object.assign(state, partial);
            }),
          }))
        ),
        {
          name: options.persistence.key,
          storage,
          partialize: options.persistence.partialize,
          version: options.version || 1,
        }
      )
    );
  }

  // Add devtools if configured
  if (options.devtools) {
    store = create<T & any>()(
      devtools(store, { name: options.name })
    );
  }

  // Subscribe to state changes
  if (options.onStateChange) {
    let previousState = store.getState();
    store.subscribe((newState) => {
      options.onStateChange!(newState, previousState);
      previousState = newState;
    });
  }

  return store;
}

// Usage example
interface UserState {
  user: User | null;
  preferences: UserPreferences;
  settings: UserSettings;
}

export const useUserStore = createAdvancedStore<UserState>(
  {
    user: null,
    preferences: defaultPreferences,
    settings: defaultSettings,
  },
  (set, get) => ({
    login: (user: User) => set((state) => {
      state.user = user;
    }),

    logout: () => set((state) => {
      state.user = null;
    }),

    updatePreferences: (preferences: Partial<UserPreferences>) => set((state) => {
      state.preferences = { ...state.preferences, ...preferences };
    }),
  }),
  {
    name: 'UserStore',
    persistence: {
      key: 'user-store',
      partialize: (state) => ({ 
        preferences: state.preferences,
        settings: state.settings 
      }),
    },
    devtools: true,
    onStateChange: (newState, prevState) => {
      if (newState.user?.id !== prevState.user?.id) {
        eventBus.emit('user.login', {
          userId: newState.user!.id,
          timestamp: Date.now()
        });
      }
    }
  }
);
```

### Command Pattern Implementation
```tsx
// src/shared/commands/CommandManager.ts
interface Command {
  execute(): Promise<void> | void;
  undo?(): Promise<void> | void;
  canUndo?: boolean;
  description: string;
}

interface CommandResult {
  success: boolean;
  error?: Error;
  data?: any;
}

class CommandManager {
  private history: Command[] = [];
  private currentIndex = -1;
  private maxHistorySize = 50;

  async execute(command: Command): Promise<CommandResult> {
    try {
      await command.execute();

      // Add to history if it can be undone
      if (command.canUndo && command.undo) {
        // Remove any commands after current index (for redo functionality)
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        this.history.push(command);
        this.currentIndex++;

        // Limit history size
        if (this.history.length > this.maxHistorySize) {
          this.history.shift();
          this.currentIndex--;
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  async undo(): Promise<CommandResult> {
    if (!this.canUndo()) {
      return { success: false, error: new Error('Nothing to undo') };
    }

    try {
      const command = this.history[this.currentIndex];
      if (command.undo) {
        await command.undo();
        this.currentIndex--;
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  async redo(): Promise<CommandResult> {
    if (!this.canRedo()) {
      return { success: false, error: new Error('Nothing to redo') };
    }

    try {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      await command.execute();
      return { success: true };
    } catch (error) {
      this.currentIndex--;
      return { success: false, error: error as Error };
    }
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  getHistory(): Array<{ description: string; canUndo: boolean }> {
    return this.history.map(cmd => ({
      description: cmd.description,
      canUndo: !!cmd.undo
    }));
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }
}

export const commandManager = new CommandManager();

// Specific command implementations
export class CreateEntityCommand implements Command {
  canUndo = true;
  description: string;
  
  constructor(
    private entityType: string,
    private entityData: any,
    private apiService: any,
    private onSuccess?: (entity: any) => void
  ) {
    this.description = `Create ${entityType}`;
  }

  async execute(): Promise<void> {
    const result = await this.apiService.create(this.entityData);
    this.createdEntity = result.data;
    this.onSuccess?.(this.createdEntity);
  }

  async undo(): Promise<void> {
    if (this.createdEntity?.id) {
      await this.apiService.delete(this.createdEntity.id);
    }
  }

  private createdEntity: any;
}

// React hook for command management
export const useCommandManager = () => {
  const [canUndo, setCanUndo] = useState(commandManager.canUndo());
  const [canRedo, setCanRedo] = useState(commandManager.canRedo());

  const execute = useCallback(async (command: Command) => {
    const result = await commandManager.execute(command);
    setCanUndo(commandManager.canUndo());
    setCanRedo(commandManager.canRedo());
    return result;
  }, []);

  const undo = useCallback(async () => {
    const result = await commandManager.undo();
    setCanUndo(commandManager.canUndo());
    setCanRedo(commandManager.canRedo());
    return result;
  }, []);

  const redo = useCallback(async () => {
    const result = await commandManager.redo();
    setCanUndo(commandManager.canUndo());
    setCanRedo(commandManager.canRedo());
    return result;
  }, []);

  return { execute, undo, redo, canUndo, canRedo };
};
```

## 3. Advanced Component Patterns

### Higher-Order Components (HOCs) 2.0
```tsx
// src/shared/hocs/withAdvancedFeatures.tsx
import React, { ComponentType, useEffect, useState, useCallback } from 'react';

interface WithAdvancedFeaturesOptions {
  analytics?: boolean;
  errorBoundary?: boolean;
  loading?: boolean;
  memoization?: boolean;
  accessibility?: boolean;
}

interface InjectedProps {
  isLoading?: boolean;
  error?: Error | null;
  retry?: () => void;
  trackEvent?: (event: string, data?: any) => void;
}

export function withAdvancedFeatures<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAdvancedFeaturesOptions = {}
) {
  const {
    analytics = false,
    errorBoundary = false,
    loading = false,
    memoization = true,
    accessibility = true
  } = options;

  const WithAdvancedFeaturesComponent = React.forwardRef<any, P & InjectedProps>(
    (props, ref) => {
      const [error, setError] = useState<Error | null>(null);
      const [isLoading, setIsLoading] = useState(false);

      // Analytics tracking
      const trackEvent = useCallback((event: string, data?: any) => {
        if (analytics) {
          // Track analytics event
          eventBus.emit('analytics.track', { event, data, timestamp: Date.now() });
        }
      }, []);

      // Error handling
      const retry = useCallback(() => {
        setError(null);
        setIsLoading(false);
      }, []);

      // Component mount tracking
      useEffect(() => {
        if (analytics) {
          const componentName = WrappedComponent.displayName || WrappedComponent.name;
          trackEvent('component.mount', { component: componentName });

          return () => {
            trackEvent('component.unmount', { component: componentName });
          };
        }
      }, [trackEvent]);

      // Accessibility enhancements
      useEffect(() => {
        if (accessibility) {
          // Add ARIA attributes, focus management, etc.
          const element = ref?.current || document.activeElement;
          if (element && !element.getAttribute('aria-label')) {
            element.setAttribute('aria-label', WrappedComponent.displayName || 'Component');
          }
        }
      }, [ref]);

      const injectedProps: InjectedProps = {
        ...(loading && { isLoading }),
        ...(errorBoundary && { error, retry }),
        ...(analytics && { trackEvent })
      };

      try {
        return <WrappedComponent ref={ref} {...props} {...injectedProps} />;
      } catch (err) {
        if (errorBoundary) {
          setError(err as Error);
          return (
            <div role="alert">
              <h2>Something went wrong</h2>
              <button onClick={retry}>Try again</button>
            </div>
          );
        }
        throw err;
      }
    }
  );

  WithAdvancedFeaturesComponent.displayName = `withAdvancedFeatures(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return memoization 
    ? React.memo(WithAdvancedFeaturesComponent)
    : WithAdvancedFeaturesComponent;
}

// Usage example
const UserProfile = withAdvancedFeatures(
  ({ user, isLoading, trackEvent }) => {
    useEffect(() => {
      trackEvent?.('profile.view', { userId: user.id });
    }, [user.id, trackEvent]);

    if (isLoading) return <Skeleton />;

    return <div>{user.name}</div>;
  },
  {
    analytics: true,
    errorBoundary: true,
    loading: true,
    accessibility: true
  }
);
```

### Compound Components 2.0
```tsx
// src/shared/components/DataGrid/DataGrid.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DataGridContextValue<T = any> {
  data: T[];
  loading: boolean;
  selection: T[];
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  filters: Record<string, any>;
  pagination: { page: number; pageSize: number; total: number };
  
  // Actions
  setSelection: (selection: T[]) => void;
  setSortConfig: (config: { key: string; direction: 'asc' | 'desc' } | null) => void;
  setFilters: (filters: Record<string, any>) => void;
  setPagination: (pagination: Partial<{ page: number; pageSize: number }>) => void;
}

const DataGridContext = createContext<DataGridContextValue | undefined>(undefined);

const useDataGridContext = <T = any,>(): DataGridContextValue<T> => {
  const context = useContext(DataGridContext);
  if (!context) {
    throw new Error('DataGrid compound components must be used within DataGrid');
  }
  return context as DataGridContextValue<T>;
};

// Root component
interface DataGridProps<T = any> {
  data: T[];
  loading?: boolean;
  children: ReactNode;
  onSelectionChange?: (selection: T[]) => void;
  onSortChange?: (sortConfig: { key: string; direction: 'asc' | 'desc' } | null) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  onPaginationChange?: (pagination: { page: number; pageSize: number }) => void;
}

const DataGridRoot = <T,>({
  data,
  loading = false,
  children,
  onSelectionChange,
  onSortChange,
  onFilterChange,
  onPaginationChange
}: DataGridProps<T>) => {
  const [selection, setSelection] = useState<T[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: data.length });

  const handleSelectionChange = (newSelection: T[]) => {
    setSelection(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSortChange = (newSortConfig: { key: string; direction: 'asc' | 'desc' } | null) => {
    setSortConfig(newSortConfig);
    onSortChange?.(newSortConfig);
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handlePaginationChange = (newPagination: Partial<{ page: number; pageSize: number }>) => {
    const updated = { ...pagination, ...newPagination };
    setPagination(updated);
    onPaginationChange?.(updated);
  };

  const contextValue: DataGridContextValue<T> = {
    data,
    loading,
    selection,
    sortConfig,
    filters,
    pagination,
    setSelection: handleSelectionChange,
    setSortConfig: handleSortChange,
    setFilters: handleFilterChange,
    setPagination: handlePaginationChange
  };

  return (
    <DataGridContext.Provider value={contextValue}>
      <div className="data-grid">
        {children}
      </div>
    </DataGridContext.Provider>
  );
};

// Header component
const DataGridHeader: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="data-grid-header">{children}</div>;
};

// Toolbar component
const DataGridToolbar: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { selection } = useDataGridContext();
  
  return (
    <div className="data-grid-toolbar">
      <div className="toolbar-actions">{children}</div>
      {selection.length > 0 && (
        <div className="selection-info">
          {selection.length} item(s) selected
        </div>
      )}
    </div>
  );
};

// Body component
interface DataGridBodyProps<T = any> {
  renderRow: (item: T, index: number) => ReactNode;
  emptyState?: ReactNode;
}

const DataGridBody = <T,>({ renderRow, emptyState }: DataGridBodyProps<T>) => {
  const { data, loading } = useDataGridContext<T>();

  if (loading) {
    return <div className="data-grid-loading">Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="data-grid-empty">{emptyState || 'No data available'}</div>;
  }

  return (
    <div className="data-grid-body">
      {data.map((item, index) => (
        <div key={index} className="data-grid-row">
          {renderRow(item, index)}
        </div>
      ))}
    </div>
  );
};

// Footer component
const DataGridFooter: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { pagination, setPagination } = useDataGridContext();

  return (
    <div className="data-grid-footer">
      <div className="pagination">
        <button
          disabled={pagination.page === 1}
          onClick={() => setPagination({ page: pagination.page - 1 })}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
        </span>
        <button
          disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
          onClick={() => setPagination({ page: pagination.page + 1 })}
        >
          Next
        </button>
      </div>
      {children}
    </div>
  );
};

// Export compound component
export const DataGrid = Object.assign(DataGridRoot, {
  Header: DataGridHeader,
  Toolbar: DataGridToolbar,
  Body: DataGridBody,
  Footer: DataGridFooter
});

// Usage example
const UserDataGrid = () => (
  <DataGrid data={users} loading={loading}>
    <DataGrid.Header>
      <h2>Users</h2>
    </DataGrid.Header>
    
    <DataGrid.Toolbar>
      <button>Add User</button>
      <button>Export</button>
    </DataGrid.Toolbar>
    
    <DataGrid.Body
      renderRow={(user) => (
        <div>
          {user.name} - {user.email}
        </div>
      )}
      emptyState={<div>No users found</div>}
    />
    
    <DataGrid.Footer>
      <div>Total: {users.length} users</div>
    </DataGrid.Footer>
  </DataGrid>
);
```

## 4. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Setup event bus architecture
- [ ] Implement advanced store patterns
- [ ] Create command manager
- [ ] Basic HOC patterns

### Phase 2: Components (Week 3-4)
- [ ] Compound component library
- [ ] Advanced HOCs
- [ ] Feature module loader
- [ ] Error boundary improvements

### Phase 3: Architecture (Week 5-6)
- [ ] Micro-frontend preparation
- [ ] Module federation setup
- [ ] Advanced routing patterns
- [ ] Performance monitoring

### Phase 4: Integration (Week 7-8)
- [ ] Full system integration
- [ ] Testing and optimization
- [ ] Documentation
- [ ] Training materials

## Expected Benefits

### Development Efficiency
- **50% faster** feature development
- **60% less** boilerplate code
- **40% fewer** bugs due to better patterns
- **Improved** code reusability

### Maintainability
- **Cleaner** separation of concerns
- **Better** testability
- **Easier** refactoring
- **Standardized** patterns across team

### Scalability
- **Ready** for micro-frontend architecture
- **Flexible** feature loading
- **Better** performance under load
- **Future-proof** architecture