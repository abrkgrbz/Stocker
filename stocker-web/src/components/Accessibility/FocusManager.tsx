import React, { useEffect, useRef, ReactNode } from 'react';

interface FocusManagerProps {
  children: ReactNode;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  trapFocus?: boolean;
  className?: string;
}

/**
 * Component for managing focus within a container
 * Useful for modals, dropdowns, and other overlay components
 */
export const FocusManager: React.FC<FocusManagerProps> = ({
  children,
  restoreFocus = true,
  autoFocus = true,
  trapFocus = false,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element
  useEffect(() => {
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      return () => {
        // Restore focus when component unmounts
        if (previousFocusRef.current && previousFocusRef.current.focus) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [restoreFocus]);

  // Auto-focus the first focusable element
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [autoFocus]);

  // Trap focus within the container
  useEffect(() => {
    if (trapFocus && containerRef.current) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = getFocusableElements(containerRef.current!);
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [trapFocus]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]:not([disabled])',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  const elements = container.querySelectorAll<HTMLElement>(focusableSelectors);
  return Array.from(elements).filter(element => {
    // Check if element is visible
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

/**
 * Hook for managing focus
 */
export const useFocusManager = () => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    if (previousFocusRef.current && previousFocusRef.current.focus) {
      previousFocusRef.current.focus();
    }
  };

  const focusFirst = (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  };

  const focusLast = (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  };

  return {
    saveFocus,
    restoreFocus,
    focusFirst,
    focusLast,
    getFocusableElements
  };
};

export default FocusManager;