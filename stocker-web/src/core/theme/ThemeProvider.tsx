import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ConfigProvider } from 'antd';
import trTR from 'antd/locale/tr_TR';
import { getTheme, CustomThemeConfig } from './theme.config';

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isSystemTheme: boolean;
  setSystemTheme: (useSystem: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'app-theme',
}) => {
  const [isSystemTheme, setIsSystemTheme] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}-mode`);
    return saved ? saved === 'system' : defaultTheme === 'system';
  });

  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (isSystemTheme) {
      return getSystemTheme();
    }
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return defaultTheme === 'system' ? getSystemTheme() : defaultTheme;
  });

  // Apply CSS variables to root
  const applyTheme = useCallback((themeName: 'light' | 'dark') => {
    const themeConfig = getTheme(themeName);
    const root = document.documentElement;

    // Apply CSS variables
    Object.entries(themeConfig.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply data attributes
    root.setAttribute('data-theme', themeName);
    root.classList.remove('light', 'dark');
    root.classList.add(themeName);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeName === 'dark' ? '#0f1419' : '#ffffff');
    }
  }, []);

  // Set theme with persistence
  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
    if (!isSystemTheme) {
      applyTheme(newTheme);
    }
  }, [storageKey, isSystemTheme, applyTheme]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // Set system theme mode
  const setSystemTheme = useCallback((useSystem: boolean) => {
    setIsSystemTheme(useSystem);
    localStorage.setItem(`${storageKey}-mode`, useSystem ? 'system' : 'manual');
    
    if (useSystem) {
      const systemTheme = getSystemTheme();
      setThemeState(systemTheme);
      applyTheme(systemTheme);
    }
  }, [storageKey, getSystemTheme, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setThemeState(newTheme);
      applyTheme(newTheme);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [isSystemTheme, applyTheme]);

  // Apply theme on mount and changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Memoize theme config
  const themeConfig = useMemo(() => getTheme(theme), [theme]);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isSystemTheme,
      setSystemTheme,
    }),
    [theme, setTheme, toggleTheme, isSystemTheme, setSystemTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={themeConfig.antdTheme} locale={trTR}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};