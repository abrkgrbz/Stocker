import { ComponentType, lazy } from 'react';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Enhanced lazy loading with retry mechanism
 * Handles network failures and chunk loading errors
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  options: RetryOptions = {}
): React.LazyExoticComponent<T> {
  const { maxRetries = 3, retryDelay = 1000 } = options;

  return lazy(async () => {
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
      try {
        // Try to load the component
        const component = await componentImport();
        
        // Success - return the component
        return component;
      } catch (error: any) {
        lastError = error;

        // Check if it's a chunk loading error
        const isChunkLoadError = 
          error?.message?.includes('Loading chunk') ||
          error?.message?.includes('Failed to fetch') ||
          error?.message?.includes('ChunkLoadError');

        // If it's a chunk load error and we haven't exhausted retries
        if (isChunkLoadError && i < maxRetries - 1) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));

          // Clear module cache to force reload
          if (window.location?.reload && i === maxRetries - 2) {
            // On last retry, try refreshing the page
            window.location.reload();
          }
        } else {
          // Not a chunk error or exhausted retries - throw the error
          throw error;
        }
      }
    }

    // If we get here, we've exhausted all retries
    throw lastError || new Error('Failed to load component');
  });
}

/**
 * Preload a lazy component
 * Useful for preloading critical components on idle time
 */
export function preloadComponent(
  componentImport: () => Promise<any>
): Promise<void> {
  return componentImport()
    .then(() => {
      // Component loaded successfully
    })
    .catch(error => {
      // Error handling removed for production
    });
}

/**
 * Create a lazy component with preload capability
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  options: RetryOptions = {}
) {
  const LazyComponent = lazyWithRetry(componentImport, options);
  
  // Add preload method to the component
  (LazyComponent as any).preload = () => preloadComponent(componentImport);
  
  return LazyComponent as React.LazyExoticComponent<T> & {
    preload: () => Promise<void>;
  };
}

/**
 * Preload components on network idle
 */
export function preloadOnIdle(
  components: Array<{ preload: () => Promise<void> }>
) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      components.forEach(component => {
        if (component.preload) {
          component.preload();
        }
      });
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      components.forEach(component => {
        if (component.preload) {
          component.preload();
        }
      });
    }, 2000);
  }
}

/**
 * Preload components when they're likely to be needed soon
 * Based on IntersectionObserver
 */
export function preloadOnApproach(
  element: HTMLElement,
  componentPreload: () => Promise<void>,
  rootMargin = '200px'
) {
  if (!('IntersectionObserver' in window)) {
    // Fallback - just preload after a delay
    setTimeout(componentPreload, 2000);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          componentPreload();
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin }
  );

  observer.observe(element);
}

/**
 * Create lazy routes with retry and preload
 */
export function createLazyRoute<T extends ComponentType<any>>(
  path: string,
  componentImport: () => Promise<{ default: T }>,
  options: RetryOptions = {}
) {
  const LazyComponent = lazyWithPreload(componentImport, options);
  
  return {
    path,
    component: LazyComponent,
    preload: (LazyComponent as any).preload,
  };
}