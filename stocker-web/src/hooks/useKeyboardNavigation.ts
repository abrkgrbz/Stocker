import { useEffect, useCallback } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
}

/**
 * Hook for managing keyboard navigation and shortcuts
 */
export const useKeyboardNavigation = (shortcuts?: KeyboardShortcut[]) => {
  const { refs, isKeyboardNavigation, setIsKeyboardNavigation } = useNavigation();

  // Add visual indicator for keyboard navigation
  useEffect(() => {
    const handleMouseDown = () => {
      if (isKeyboardNavigation) {
        setIsKeyboardNavigation(false);
        document.body.classList.remove('keyboard-navigation');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !isKeyboardNavigation) {
        setIsKeyboardNavigation(true);
        document.body.classList.add('keyboard-navigation');
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isKeyboardNavigation, setIsKeyboardNavigation]);

  // Handle custom keyboard shortcuts
  useEffect(() => {
    if (!shortcuts || shortcuts.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const matchesAlt = shortcut.alt ? e.altKey : !e.altKey;
        const matchesShift = shortcut.shift ? e.shiftKey : !e.shiftKey;

        if (matchesKey && matchesCtrl && matchesAlt && matchesShift) {
          e.preventDefault();
          shortcut.handler(e);
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  // Skip to main content
  const skipToMain = useCallback(() => {
    const mainContent = refs.mainContentRef.current;
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }, [refs.mainContentRef]);

  // Navigate between sections
  const navigateToSection = useCallback((sectionId: string) => {
    const sectionRef = refs.sectionRefs.get(sectionId);
    if (sectionRef?.current) {
      sectionRef.current.focus();
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [refs.sectionRefs]);

  // Focus search
  const focusSearch = useCallback(() => {
    const searchInput = refs.searchInputRef.current;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, [refs.searchInputRef]);

  // Toggle help modal
  const toggleHelp = useCallback(() => {
    // Dispatch custom event that can be handled by help modal component
    const event = new CustomEvent('toggle-help-modal');
    document.dispatchEvent(event);
  }, []);

  return {
    skipToMain,
    navigateToSection,
    focusSearch,
    toggleHelp
  };
};

/**
 * Factory function to create default keyboard shortcuts with context
 */
export const createDefaultKeyboardShortcuts = (navigation: ReturnType<typeof useNavigation>): KeyboardShortcut[] => [
  {
    key: '1',
    alt: true,
    handler: () => {
      const mainContent = navigation.refs.mainContentRef.current;
      if (mainContent) mainContent.focus();
    },
    description: 'Skip to main content'
  },
  {
    key: '/',
    handler: (e) => {
      // Only trigger if not in an input field
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = navigation.refs.searchInputRef.current;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    },
    description: 'Focus search'
  },
  {
    key: 'Escape',
    handler: () => {
      // Close any open modals or dropdowns
      const event = new CustomEvent('close-active-modal');
      document.dispatchEvent(event);
    },
    description: 'Close modal or dropdown'
  },
  {
    key: '?',
    shift: true,
    handler: () => {
      const event = new CustomEvent('toggle-help-modal');
      document.dispatchEvent(event);
    },
    description: 'Show keyboard shortcuts'
  },
  {
    key: 'n',
    alt: true,
    handler: () => {
      const event = new CustomEvent('navigate-next');
      document.dispatchEvent(event);
    },
    description: 'Go to next page'
  },
  {
    key: 'p',
    alt: true,
    handler: () => {
      const event = new CustomEvent('navigate-previous');
      document.dispatchEvent(event);
    },
    description: 'Go to previous page'
  }
];

/**
 * Default keyboard shortcuts for backward compatibility
 * @deprecated Use createDefaultKeyboardShortcuts with NavigationContext instead
 */
export const defaultKeyboardShortcuts: KeyboardShortcut[] = [];

export default useKeyboardNavigation;