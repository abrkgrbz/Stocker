/**
 * API Service - Electron IPC Bridge
 *
 * This is the refactored version of stocker-nextjs/src/lib/api/api-service.ts
 * that uses Electron IPC instead of HTTP/Axios.
 *
 * Migration from HTTP to IPC:
 * - Before: ApiService.get('/api/inventory/products', { params })
 * - After:  ApiService.invoke('inventory:products:list', params)
 */

import type { IpcChannel, IpcResult, IpcError } from '../../../preload/api';

// ============================================
// Error Types
// ============================================

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly type: string = 'Internal'
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromIpcError(error: IpcError): ApiError {
    return new ApiError(error.code, error.message, error.type);
  }

  static validation(code: string, message: string): ApiError {
    return new ApiError(code, message, 'Validation');
  }

  static notFound(code: string, message: string): ApiError {
    return new ApiError(code, message, 'NotFound');
  }

  static conflict(code: string, message: string): ApiError {
    return new ApiError(code, message, 'Conflict');
  }
}

// ============================================
// Response Types
// ============================================

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ListResult<T> {
  items: T[];
  count: number;
}

// ============================================
// API Service
// ============================================

export class ApiService {
  /**
   * Invoke an IPC channel and return the result
   * Throws ApiError on failure
   */
  static async invoke<T>(channel: IpcChannel, payload?: unknown): Promise<T> {
    if (!window.electron) {
      throw new ApiError('NotElectron', 'This application must run in Electron');
    }

    const result: IpcResult<T> = await window.electron.invoke(channel, payload);

    if (!result.isSuccess) {
      if (result.error) {
        throw ApiError.fromIpcError(result.error);
      }
      throw new ApiError('Unknown', 'An unknown error occurred');
    }

    return result.value as T;
  }

  /**
   * Invoke and return the raw IpcResult (for cases where you need to handle errors manually)
   */
  static async invokeRaw<T>(channel: IpcChannel, payload?: unknown): Promise<IpcResult<T>> {
    if (!window.electron) {
      return {
        isSuccess: false,
        error: {
          code: 'NotElectron',
          message: 'This application must run in Electron',
          type: 'Internal',
        },
      };
    }

    return window.electron.invoke<T>(channel, payload);
  }

  // ============================================
  // Convenience Methods (for migration compatibility)
  // ============================================

  /**
   * List resources (paginated)
   * Replaces: ApiService.get('/api/{module}/{resource}', { params: filters })
   */
  static async list<T>(resource: string, filters?: Record<string, unknown>): Promise<PagedResult<T>> {
    const channel = `${resource}:list` as IpcChannel;
    return this.invoke<PagedResult<T>>(channel, filters);
  }

  /**
   * Get a single resource by ID
   * Replaces: ApiService.get('/api/{module}/{resource}/{id}')
   */
  static async get<T>(resource: string, id: string | number): Promise<T> {
    const channel = `${resource}:get` as IpcChannel;
    return this.invoke<T>(channel, { id });
  }

  /**
   * Create a new resource
   * Replaces: ApiService.post('/api/{module}/{resource}', data)
   */
  static async create<T>(resource: string, data: unknown): Promise<T> {
    const channel = `${resource}:create` as IpcChannel;
    return this.invoke<T>(channel, data);
  }

  /**
   * Update an existing resource
   * Replaces: ApiService.put('/api/{module}/{resource}/{id}', data)
   */
  static async update<T>(resource: string, id: string | number, data: unknown): Promise<T> {
    const channel = `${resource}:update` as IpcChannel;
    return this.invoke<T>(channel, { id, ...data });
  }

  /**
   * Delete a resource
   * Replaces: ApiService.delete('/api/{module}/{resource}/{id}')
   */
  static async remove(resource: string, id: string | number): Promise<void> {
    const channel = `${resource}:delete` as IpcChannel;
    return this.invoke<void>(channel, { id });
  }

  /**
   * Perform a custom action on a resource
   * Replaces: ApiService.post('/api/{module}/{resource}/{id}/{action}', data)
   */
  static async action<T>(resource: string, action: string, payload?: unknown): Promise<T> {
    const channel = `${resource}:${action}` as IpcChannel;
    return this.invoke<T>(channel, payload);
  }

  // ============================================
  // File Operations (Desktop-specific)
  // ============================================

  /**
   * Export data to file
   */
  static async export(format: 'csv' | 'excel', resource: string, filters?: Record<string, unknown>): Promise<string> {
    const channel = `system:export:${format}` as IpcChannel;
    return this.invoke<string>(channel, { resource, filters });
  }

  /**
   * Import data from file
   */
  static async import(format: 'csv', filePath: string, resource: string): Promise<{ imported: number; errors: string[] }> {
    const channel = `system:import:${format}` as IpcChannel;
    return this.invoke(channel, { filePath, resource });
  }

  // ============================================
  // Event Subscriptions
  // ============================================

  /**
   * Subscribe to real-time events
   */
  static on<T>(event: string, callback: (data: T) => void): void {
    if (!window.electron) return;

    window.electron.on(event as any, (_event, data) => {
      callback(data as T);
    });
  }

  /**
   * Unsubscribe from events
   */
  static off<T>(event: string, callback: (data: T) => void): void {
    if (!window.electron) return;

    window.electron.off(event as any, callback as any);
  }
}

// ============================================
// Migration Helper
// ============================================

/**
 * URL to IPC Channel mapping for migration
 *
 * Use this to convert existing API calls:
 * - '/api/inventory/products' -> 'inventory:products:list'
 * - '/api/inventory/products/123' -> 'inventory:products:get' with { id: 123 }
 * - POST '/api/inventory/products' -> 'inventory:products:create'
 * - PUT '/api/inventory/products/123' -> 'inventory:products:update' with { id: 123, ...data }
 * - DELETE '/api/inventory/products/123' -> 'inventory:products:delete' with { id: 123 }
 */
export function urlToChannel(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'): IpcChannel {
  // Remove /api prefix and trailing slashes
  const path = url.replace(/^\/api\//, '').replace(/\/$/, '');

  // Split into parts: [module, resource, id?, action?]
  const parts = path.split('/');

  if (parts.length < 2) {
    throw new Error(`Invalid URL format: ${url}`);
  }

  const [module, resource, ...rest] = parts;
  const hasId = rest.length > 0 && !isNaN(Number(rest[0]));
  const action = hasId && rest.length > 1 ? rest[1] : rest[0];

  let operation: string;

  if (action && isNaN(Number(action))) {
    // Custom action: /api/sales/orders/123/approve -> sales:orders:approve
    operation = action;
  } else if (method === 'GET' && hasId) {
    operation = 'get';
  } else if (method === 'GET') {
    operation = 'list';
  } else if (method === 'POST') {
    operation = 'create';
  } else if (method === 'PUT') {
    operation = 'update';
  } else if (method === 'DELETE') {
    operation = 'delete';
  } else {
    operation = 'list';
  }

  return `${module}:${resource}:${operation}` as IpcChannel;
}

export default ApiService;
