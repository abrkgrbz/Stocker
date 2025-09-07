import { useEffect, useState } from 'react';
import { useTheme } from '../ThemeProvider';

export interface ThemeModeOptions {
  onChange?: (theme: 'light' | 'dark') => void;
  persist?: boolean;
}

export const useThemeMode = (options?: ThemeModeOptions) => {
  const { theme, setTheme, toggleTheme, isSystemTheme, setSystemTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle theme change with transition
  const changeTheme = (newTheme: 'light' | 'dark') => {
    setIsTransitioning(true);
    setTheme(newTheme);
    
    // Call onChange callback if provided
    options?.onChange?.(newTheme);

    // End transition after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  // Toggle with transition
  const toggle = () => {
    setIsTransitioning(true);
    toggleTheme();
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    options?.onChange?.(newTheme);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  return {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isSystemTheme,
    isTransitioning,
    setTheme: changeTheme,
    toggleTheme: toggle,
    setSystemTheme,
  };
};