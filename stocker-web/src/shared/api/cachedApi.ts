import { apiClient } from './client';
import { cacheService } from '@/services/cache.service';

/**
 * Cached API wrapper for frequently accessed data
 */
export const cachedApi = {
  /**
   * GET request with caching
   */
  async get<T>(url: string, ttl?: number): Promise<T> {
    const cacheKey = `GET:${url}`;
    
    return cacheService.withCache(
      cacheKey,
      async () => {
        const response = await apiClient.get<T>(url);
        return response.data;
      },
      ttl
    );
  },

  /**
   * POST request (invalidates related cache)
   */
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await apiClient.post<T>(url, data);
    
    // Invalidate related cache
    const baseUrl = url.split('?')[0];
    cacheService.invalidatePattern(`GET:${baseUrl}`);
    
    return response.data;
  },

  /**
   * PUT request (invalidates related cache)
   */
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await apiClient.put<T>(url, data);
    
    // Invalidate related cache
    const baseUrl = url.split('?')[0];
    cacheService.invalidatePattern(`GET:${baseUrl}`);
    
    return response.data;
  },

  /**
   * DELETE request (invalidates related cache)
   */
  async delete<T>(url: string): Promise<T> {
    const response = await apiClient.delete<T>(url);
    
    // Invalidate related cache
    const baseUrl = url.split('?')[0];
    cacheService.invalidatePattern(`GET:${baseUrl}`);
    
    return response.data;
  },

  /**
   * Clear all cache
   */
  clearCache(): void {
    cacheService.clear();
  },

  /**
   * Clear specific cache pattern
   */
  clearCachePattern(pattern: string | RegExp): void {
    cacheService.invalidatePattern(pattern);
  },
};

export default cachedApi;