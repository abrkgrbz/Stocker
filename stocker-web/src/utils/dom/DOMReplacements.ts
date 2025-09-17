import { useRef, useCallback, useEffect, MutableRefObject } from 'react';

/**
 * Hook to replace document.getElementById with React refs
 * Provides a ref that automatically syncs with a DOM element by ID
 */
export const useElementById = <T extends HTMLElement = HTMLElement>(
  id: string
): MutableRefObject<T | null> => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = document.getElementById(id) as T;
    ref.current = element;
  }, [id]);

  return ref;
};

/**
 * Hook to replace querySelector with React refs
 * Provides a ref that automatically syncs with a DOM element by selector
 */
export const useQuerySelector = <T extends Element = Element>(
  selector: string,
  container?: HTMLElement
): MutableRefObject<T | null> => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = container || document;
    const element = root.querySelector(selector) as T;
    ref.current = element;
  }, [selector, container]);

  return ref;
};

/**
 * Hook for managing focusable elements
 * Provides utilities for focus traversal and management
 */
export const useFocusManagement = () => {
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  const registerFocusableElement = useCallback((element: HTMLElement) => {
    if (element && !focusableElementsRef.current.includes(element)) {
      focusableElementsRef.current.push(element);
    }
  }, []);

  const unregisterFocusableElement = useCallback((element: HTMLElement) => {
    const index = focusableElementsRef.current.indexOf(element);
    if (index > -1) {
      focusableElementsRef.current.splice(index, 1);
    }
  }, []);

  const focusFirst = useCallback(() => {
    const firstElement = focusableElementsRef.current[0];
    if (firstElement) {
      firstElement.focus();
    }
  }, []);

  const focusLast = useCallback(() => {
    const lastElement = focusableElementsRef.current[focusableElementsRef.current.length - 1];
    if (lastElement) {
      lastElement.focus();
    }
  }, []);

  const focusNext = useCallback(() => {
    const currentIndex = focusableElementsRef.current.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % focusableElementsRef.current.length;
    focusableElementsRef.current[nextIndex]?.focus();
  }, []);

  const focusPrevious = useCallback(() => {
    const currentIndex = focusableElementsRef.current.indexOf(document.activeElement as HTMLElement);
    const previousIndex = currentIndex === 0 
      ? focusableElementsRef.current.length - 1 
      : currentIndex - 1;
    focusableElementsRef.current[previousIndex]?.focus();
  }, []);

  const trapFocus = useCallback((containerRef: MutableRefObject<HTMLElement | null>) => {
    if (!containerRef.current) return;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return {
    registerFocusableElement,
    unregisterFocusableElement,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    trapFocus
  };
};

/**
 * Hook for scroll management
 * Provides utilities for scrolling and scroll position management
 */
export const useScrollManagement = () => {
  const scrollToElement = useCallback((
    elementRef: MutableRefObject<HTMLElement | null>,
    options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' }
  ) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView(options);
    }
  }, []);

  const scrollToTop = useCallback((
    containerRef?: MutableRefObject<HTMLElement | null>
  ) => {
    const element = containerRef?.current || window;
    if ('scrollTo' in element) {
      element.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const scrollToBottom = useCallback((
    containerRef?: MutableRefObject<HTMLElement | null>
  ) => {
    const element = containerRef?.current;
    if (element) {
      element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  const getScrollPosition = useCallback((
    containerRef?: MutableRefObject<HTMLElement | null>
  ): { x: number; y: number } => {
    const element = containerRef?.current || document.documentElement;
    return {
      x: element.scrollLeft,
      y: element.scrollTop
    };
  }, []);

  const setScrollPosition = useCallback((
    position: { x?: number; y?: number },
    containerRef?: MutableRefObject<HTMLElement | null>
  ) => {
    const element = containerRef?.current || window;
    if ('scrollTo' in element) {
      element.scrollTo({
        left: position.x,
        top: position.y,
        behavior: 'smooth'
      });
    }
  }, []);

  const isElementInViewport = useCallback((
    elementRef: MutableRefObject<HTMLElement | null>
  ): boolean => {
    if (!elementRef.current) return false;

    const rect = elementRef.current.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, []);

  return {
    scrollToElement,
    scrollToTop,
    scrollToBottom,
    getScrollPosition,
    setScrollPosition,
    isElementInViewport
  };
};

/**
 * Hook for viewport management
 * Provides utilities for viewport detection and responsive behavior
 */
export const useViewportManagement = () => {
  const [viewport, setViewport] = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport.current = {
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      };
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return viewport.current;
};

/**
 * Hook for mutation observation
 * Provides utilities for observing DOM changes
 */
export const useMutationObserver = (
  targetRef: MutableRefObject<HTMLElement | null>,
  callback: MutationCallback,
  options: MutationObserverInit = {
    attributes: true,
    childList: true,
    subtree: true
  }
) => {
  useEffect(() => {
    if (!targetRef.current) return;

    const observer = new MutationObserver(callback);
    observer.observe(targetRef.current, options);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, callback, options]);
};

/**
 * Hook for intersection observation
 * Provides utilities for detecting element visibility
 */
export const useIntersectionObserver = (
  targetRef: MutableRefObject<HTMLElement | null>,
  options: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '0px'
  }
): boolean => {
  const [isIntersecting, setIsIntersecting] = useRef(false);

  useEffect(() => {
    if (!targetRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting.current = entry.isIntersecting;
    }, options);

    observer.observe(targetRef.current);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, options]);

  return isIntersecting.current;
};

/**
 * Hook for resize observation
 * Provides utilities for detecting element size changes
 */
export const useResizeObserver = (
  targetRef: MutableRefObject<HTMLElement | null>,
  callback: (entry: ResizeObserverEntry) => void
) => {
  useEffect(() => {
    if (!targetRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        callback(entries[0]);
      }
    });

    observer.observe(targetRef.current);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, callback]);
};

/**
 * Hook for click outside detection
 * Detects clicks outside a specified element
 */
export const useClickOutside = (
  targetRef: MutableRefObject<HTMLElement | null>,
  callback: () => void
) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (targetRef.current && !targetRef.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [targetRef, callback]);
};