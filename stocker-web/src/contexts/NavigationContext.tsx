import React, { createContext, useContext, useRef, MutableRefObject, ReactNode } from 'react';

interface NavigationRefs {
  mainContentRef: MutableRefObject<HTMLElement | null>;
  searchInputRef: MutableRefObject<HTMLInputElement | null>;
  sectionRefs: Map<string, MutableRefObject<HTMLElement | null>>;
}

interface NavigationContextType {
  refs: NavigationRefs;
  registerSection: (id: string, ref: MutableRefObject<HTMLElement | null>) => void;
  unregisterSection: (id: string) => void;
  isKeyboardNavigation: boolean;
  setIsKeyboardNavigation: (value: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const mainContentRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const sectionRefs = useRef(new Map<string, MutableRefObject<HTMLElement | null>>());
  const [isKeyboardNavigation, setIsKeyboardNavigation] = React.useState(false);

  const registerSection = (id: string, ref: MutableRefObject<HTMLElement | null>) => {
    sectionRefs.current.set(id, ref);
  };

  const unregisterSection = (id: string) => {
    sectionRefs.current.delete(id);
  };

  const value: NavigationContextType = {
    refs: {
      mainContentRef,
      searchInputRef,
      sectionRefs: sectionRefs.current
    },
    registerSection,
    unregisterSection,
    isKeyboardNavigation,
    setIsKeyboardNavigation
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};