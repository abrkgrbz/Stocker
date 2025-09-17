import { useCallback } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';

/**
 * Custom hook for scrolling to sections
 * Replaces direct DOM queries with React-based navigation
 */
export const useScrollToSection = () => {
  const { refs } = useNavigation();

  const scrollToSection = useCallback((sectionId: string) => {
    // Try to use registered refs first
    const sectionRef = refs.sectionRefs.get(sectionId);
    
    if (sectionRef?.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }

    // Fallback for sections not yet registered
    // This allows gradual migration
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }

    return false;
  }, [refs.sectionRefs]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToBottom = useCallback(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, []);

  return {
    scrollToSection,
    scrollToTop,
    scrollToBottom
  };
};