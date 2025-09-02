import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as ThemeMode) || 'light';
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', themeMode);
    
    // Add/remove dark class to body
    if (themeMode === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const antThemeConfig = {
    algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#667eea',
      borderRadius: 8,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      ...(themeMode === 'dark' ? {
        colorBgContainer: '#1a1a1a',
        colorBgElevated: '#2a2a2a',
        colorBgLayout: '#0a0a0a',
        colorBorder: '#333333',
        colorText: '#e0e0e0',
        colorTextSecondary: '#a0a0a0',
      } : {
        colorBgContainer: '#ffffff',
        colorBgElevated: '#ffffff',
        colorBgLayout: '#f5f5f5',
        colorBorder: '#e8e8e8',
        colorText: '#1a1a1a',
        colorTextSecondary: '#595959',
      }),
    },
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <ConfigProvider theme={antThemeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};