interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfter?: number;
}

interface RequestQueue {
  request: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private requestQueue: RequestQueue[] = [];
  private processing = false;
  
  private readonly defaultConfig: RateLimitConfig = {
    maxRequests: 10, // 10 requests
    windowMs: 1000,  // per 1 second
    retryAfter: 1000 // retry after 1 second
  };

  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Set specific limits for different endpoints
    this.configs.set('/api/master/dashboard', { maxRequests: 5, windowMs: 1000, retryAfter: 2000 });
    this.configs.set('/api/master/tenants', { maxRequests: 10, windowMs: 1000, retryAfter: 1000 });
    this.configs.set('/api/master/users', { maxRequests: 10, windowMs: 1000, retryAfter: 1000 });
    this.configs.set('/api/master/auth', { maxRequests: 3, windowMs: 60000, retryAfter: 5000 }); // 3 per minute for auth
  }

  private getConfig(endpoint: string): RateLimitConfig {
    // Check for exact match
    if (this.configs.has(endpoint)) {
      return this.configs.get(endpoint)!;
    }

    // Check for partial match
    for (const [key, config] of this.configs.entries()) {
      if (endpoint.includes(key)) {
        return config;
      }
    }

    return this.defaultConfig;
  }

  private getKey(endpoint: string): string {
    // Extract base path for grouping
    const match = endpoint.match(/^(\/api\/[^\/]+\/[^\/]+)/);
    return match ? match[1] : endpoint;
  }

  private cleanOldRequests(key: string, windowMs: number): void {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length > 0) {
      this.requests.set(key, validRequests);
    } else {
      this.requests.delete(key);
    }
  }

  async throttle<T>(endpoint: string, requestFn: () => Promise<T>): Promise<T> {
    const key = this.getKey(endpoint);
    const config = this.getConfig(endpoint);
    
    // Clean old requests
    this.cleanOldRequests(key, config.windowMs);
    
    // Get current requests for this endpoint
    const requests = this.requests.get(key) || [];
    
    // Check if we're at the limit
    if (requests.length >= config.maxRequests) {
      const oldestRequest = requests[0];
      const waitTime = config.windowMs - (Date.now() - oldestRequest);
      
      if (waitTime > 0) {
        console.warn(`⏳ Rate limit reached for ${endpoint}. Waiting ${waitTime}ms...`);
        await this.delay(waitTime);
        return this.throttle(endpoint, requestFn); // Retry after waiting
      }
    }
    
    // Record this request
    requests.push(Date.now());
    this.requests.set(key, requests);
    
    try {
      return await requestFn();
    } catch (error: any) {
      // If we still get 429, wait and retry
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : config.retryAfter || 2000;
        
        console.warn(`⚠️ Still rate limited. Waiting ${waitTime}ms before retry...`);
        await this.delay(waitTime);
        
        // Remove this failed request from history
        const updatedRequests = this.requests.get(key) || [];
        updatedRequests.pop();
        if (updatedRequests.length > 0) {
          this.requests.set(key, updatedRequests);
        } else {
          this.requests.delete(key);
        }
        
        return this.throttle(endpoint, requestFn);
      }
      
      throw error;
    }
  }

  async queue<T>(endpoint: string, requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        request: () => this.throttle(endpoint, requestFn),
        resolve,
        reject
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const item = this.requestQueue.shift();
      if (!item) continue;

      try {
        const result = await item.request();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }

      // Small delay between queued requests
      if (this.requestQueue.length > 0) {
        await this.delay(100);
      }
    }

    this.processing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get current rate limit status
  getStatus(endpoint?: string): { [key: string]: { count: number; limit: number } } {
    const status: { [key: string]: { count: number; limit: number } } = {};
    
    if (endpoint) {
      const key = this.getKey(endpoint);
      const config = this.getConfig(endpoint);
      this.cleanOldRequests(key, config.windowMs);
      const requests = this.requests.get(key) || [];
      status[key] = { count: requests.length, limit: config.maxRequests };
    } else {
      for (const [key, requests] of this.requests.entries()) {
        const config = this.getConfig(key);
        this.cleanOldRequests(key, config.windowMs);
        const currentRequests = this.requests.get(key) || [];
        status[key] = { count: currentRequests.length, limit: config.maxRequests };
      }
    }
    
    return status;
  }

  // Clear all rate limit history
  reset(): void {
    this.requests.clear();
    this.requestQueue = [];
    this.processing = false;
  }

  // Update rate limit for specific endpoint
  setLimit(endpoint: string, config: Partial<RateLimitConfig>): void {
    const existingConfig = this.configs.get(endpoint) || this.defaultConfig;
    this.configs.set(endpoint, { ...existingConfig, ...config });
  }
}

export const rateLimiter = new RateLimiter();