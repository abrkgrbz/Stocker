import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import trTR from 'antd/locale/tr_TR';

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
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
}

export const MasterThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('master-dark-mode');
    if (saved) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to HTML element
  useEffect(() => {
    localStorage.setItem('master-dark-mode', JSON.stringify(darkMode));
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const themeConfig = {
    locale: trTR,
    algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#667eea',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#f5222d',
      colorInfo: '#1890ff',
      borderRadius: 8,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    components: {
      Layout: {
        siderBg: darkMode ? '#1a1f2e' : '#1a1f2e',
        headerBg: darkMode ? '#1f2937' : '#ffffff',
        bodyBg: darkMode ? '#111827' : '#f5f7fa',
        footerBg: darkMode ? '#1f2937' : '#ffffff',
      },
      Menu: {
        darkItemBg: 'transparent',
        darkSubMenuItemBg: 'rgba(0, 0, 0, 0.1)',
        darkItemSelectedBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        darkItemHoverBg: 'rgba(102, 126, 234, 0.1)',
        darkItemColor: '#94a3b8',
        darkItemHoverColor: '#ffffff',
        darkItemSelectedColor: '#ffffff',
      },
      Card: {
        colorBgContainer: darkMode ? '#1f2937' : '#ffffff',
        colorBorder: darkMode ? '#374151' : '#e5e7eb',
      },
      Input: {
        colorBgContainer: darkMode ? '#374151' : '#ffffff',
        colorBorder: darkMode ? '#4b5563' : '#d1d5db',
        colorText: darkMode ? '#f9fafb' : '#1f2937',
        colorTextPlaceholder: darkMode ? '#9ca3af' : '#9ca3af',
        controlOutline: darkMode ? 'rgba(129, 140, 248, 0.2)' : 'rgba(102, 126, 234, 0.2)',
      },
      Button: {
        colorPrimary: '#667eea',
        algorithm: true,
      },
      Table: {
        colorBgContainer: darkMode ? '#1f2937' : '#ffffff',
        colorBorderSecondary: darkMode ? '#374151' : '#f0f0f0',
        headerBg: darkMode ? '#111827' : '#fafafa',
        rowHoverBg: darkMode ? '#374151' : '#fafafa',
      },
      Modal: {
        contentBg: darkMode ? '#1f2937' : '#ffffff',
        headerBg: darkMode ? '#111827' : '#ffffff',
        footerBg: darkMode ? '#1f2937' : '#ffffff',
      },
      Dropdown: {
        colorBgElevated: darkMode ? '#1f2937' : '#ffffff',
        controlItemBgHover: darkMode ? '#374151' : '#f5f5f5',
      },
      Select: {
        colorBgContainer: darkMode ? '#374151' : '#ffffff',
        colorBgElevated: darkMode ? '#1f2937' : '#ffffff',
        controlItemBgHover: darkMode ? '#374151' : '#f5f5f5',
      },
      DatePicker: {
        colorBgContainer: darkMode ? '#374151' : '#ffffff',
        colorBgElevated: darkMode ? '#1f2937' : '#ffffff',
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode }}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};