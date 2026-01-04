/**
 * Centralized Query Options Factory
 * Provides consistent caching and fetching behavior across all hooks
 * Optimized to prevent 429 (Too Many Requests) errors
 */

/**
 * Query Categories with different caching strategies
 */
export type QueryCategory =
  | 'list' // Lists that change frequently (customers, orders, etc.)
  | 'detail' // Single item details
  | 'static' // Rarely changing data (settings, roles, etc.)
  | 'realtime' // Data that needs frequent updates (notifications, etc.)
  | 'search'; // Search results (short cache)

/**
 * Query options override type
 */
export interface QueryOptionsOverride {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

/**
 * Query options result type - compatible with useQuery spread
 */
export interface QueryOptionsResult {
  staleTime: number;
  gcTime: number;
  refetchOnWindowFocus: false;
  refetchOnReconnect: false;
  refetchOnMount: false;
  retry: false;
  networkMode: 'offlineFirst';
  enabled?: boolean;
}

/**
 * Caching configuration per category
 */
const CACHE_CONFIG: Record<
  QueryCategory,
  { staleTime: number; gcTime: number }
> = {
  list: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  detail: {
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  static: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  search: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  },
};

/**
 * Base query options that all queries should use
 */
const BASE_QUERY_OPTIONS = {
  refetchOnWindowFocus: false as const,
  refetchOnReconnect: false as const,
  refetchOnMount: false as const,
  retry: false as const,
  networkMode: 'offlineFirst' as const,
};

/**
 * Create optimized query options for a specific category
 */
export function createQueryOptions(category: QueryCategory, overrides?: QueryOptionsOverride): QueryOptionsResult {
  const config = CACHE_CONFIG[category];

  return {
    ...BASE_QUERY_OPTIONS,
    staleTime: config.staleTime,
    gcTime: config.gcTime,
    ...overrides,
  };
}

/**
 * Pre-configured query options for common use cases
 */
export const queryOptions = {
  /**
   * For list pages (customers, orders, products, etc.)
   * - 2 min stale time to prevent excessive refetching
   * - No refetch on mount if data exists
   */
  list: (overrides?: QueryOptionsOverride): QueryOptionsResult =>
    createQueryOptions('list', overrides),

  /**
   * For detail pages (customer detail, order detail, etc.)
   * - 3 min stale time
   * - Longer cache for better back navigation
   */
  detail: (overrides?: QueryOptionsOverride): QueryOptionsResult =>
    createQueryOptions('detail', overrides),

  /**
   * For static/configuration data (roles, settings, departments, etc.)
   * - 10 min stale time (rarely changes)
   * - Long cache time
   */
  static: (overrides?: QueryOptionsOverride): QueryOptionsResult =>
    createQueryOptions('static', overrides),

  /**
   * For real-time data (notifications, dashboard stats, etc.)
   * - 30 sec stale time
   * - Short cache
   */
  realtime: (overrides?: QueryOptionsOverride): QueryOptionsResult =>
    createQueryOptions('realtime', overrides),

  /**
   * For search results
   * - 1 min stale time
   * - Moderate cache
   */
  search: (overrides?: QueryOptionsOverride): QueryOptionsResult =>
    createQueryOptions('search', overrides),

  /**
   * For infinite/paginated queries
   * - Same as list but with specific settings for pagination
   */
  paginated: (overrides?: QueryOptionsOverride): QueryOptionsResult =>
    createQueryOptions('list', overrides),

  /**
   * For dependent queries (queries that depend on other data)
   * - Shorter stale time since they often need fresh parent data
   */
  dependent: (enabled: boolean): QueryOptionsResult =>
    createQueryOptions('detail', { enabled }),
};

/**
 * Helper to check if we should skip refetch
 * Use this in components to avoid unnecessary API calls
 */
export function shouldSkipRefetch(lastFetchTime?: number): boolean {
  if (!lastFetchTime) return false;
  const timeSinceLastFetch = Date.now() - lastFetchTime;
  return timeSinceLastFetch < 60 * 1000; // Skip if fetched within last minute
}

/**
 * Debounce helper for search queries
 */
export function createDebouncedSearch(delay = 500) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (callback: () => void) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
}

export default queryOptions;
