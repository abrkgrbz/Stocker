import { ThemeConfig } from 'antd';
import { theme } from 'antd';

export interface CustomThemeConfig {
  name: 'light' | 'dark';
  antdTheme: ThemeConfig;
  cssVariables: Record<string, string>;
}

// Color palette
const colors = {
  primary: '#667eea',
  primaryDark: '#5a67d8',
  primaryLight: '#7c8ef0',
  secondary: '#764ba2',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Light theme colors
  light: {
    bg: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      tertiary: '#f3f4f6',
      elevated: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
    },
    border: {
      primary: '#f0f0f0',
      secondary: '#e5e7eb',
      tertiary: '#d1d5db',
    },
  },
  
  // Dark theme colors
  dark: {
    bg: {
      primary: '#0f1419',
      secondary: '#1a1f2e',
      tertiary: '#252b3b',
      elevated: '#2d3447',
    },
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      tertiary: '#9ca3af',
      inverse: '#1f2937',
    },
    border: {
      primary: '#2d3447',
      secondary: '#374151',
      tertiary: '#4b5563',
    },
  },
};

// Light theme configuration
export const lightTheme: CustomThemeConfig = {
  name: 'light',
  antdTheme: {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: colors.primary,
      colorSuccess: colors.success,
      colorWarning: colors.warning,
      colorError: colors.error,
      colorInfo: colors.info,
      colorBgBase: colors.light.bg.primary,
      colorTextBase: colors.light.text.primary,
      borderRadius: 8,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 14,
      colorBorder: colors.light.border.secondary,
    },
    components: {
      Layout: {
        bodyBg: '#fafbfc',
        headerBg: '#ffffff',
        siderBg: '#34495e', // Lighter sidebar for light mode
        footerBg: '#ffffff',
      },
      Card: {
        colorBgContainer: colors.light.bg.primary,
        colorBorderSecondary: colors.light.border.primary,
      },
      Table: {
        colorBgContainer: '#ffffff',
        headerBg: '#fafbfc',
        rowHoverBg: '#f8f9fa',
        colorBorderSecondary: '#f0f0f0',
      },
      Modal: {
        contentBg: colors.light.bg.primary,
        headerBg: colors.light.bg.primary,
      },
      Dropdown: {
        colorBgElevated: colors.light.bg.elevated,
      },
      Select: {
        colorBgContainer: colors.light.bg.primary,
        colorBgElevated: colors.light.bg.elevated,
        optionSelectedBg: colors.light.bg.tertiary,
      },
      Input: {
        colorBgContainer: colors.light.bg.primary,
        activeBorderColor: colors.primary,
        hoverBorderColor: colors.primaryLight,
      },
      Button: {
        colorPrimary: colors.primary,
        primaryColor: '#ffffff',
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
    },
  },
  cssVariables: {
    '--color-primary': colors.primary,
    '--color-primary-dark': colors.primaryDark,
    '--color-primary-light': colors.primaryLight,
    '--color-secondary': colors.secondary,
    '--color-success': colors.success,
    '--color-warning': colors.warning,
    '--color-error': colors.error,
    '--color-info': colors.info,
    
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8f9fa',
    '--bg-tertiary': '#f3f4f6',
    '--bg-elevated': '#ffffff',
    
    '--text-primary': colors.light.text.primary,
    '--text-secondary': colors.light.text.secondary,
    '--text-tertiary': colors.light.text.tertiary,
    '--text-inverse': colors.light.text.inverse,
    
    '--border-primary': colors.light.border.primary,
    '--border-secondary': colors.light.border.secondary,
    '--border-tertiary': colors.light.border.tertiary,
    
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};

// Dark theme configuration
export const darkTheme: CustomThemeConfig = {
  name: 'dark',
  antdTheme: {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: colors.primary,
      colorSuccess: colors.success,
      colorWarning: colors.warning,
      colorError: colors.error,
      colorInfo: colors.info,
      colorBgBase: colors.dark.bg.primary,
      colorTextBase: colors.dark.text.primary,
      borderRadius: 8,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 14,
      colorBorder: colors.dark.border.secondary,
      colorBgElevated: colors.dark.bg.elevated,
    },
    components: {
      Layout: {
        bodyBg: colors.dark.bg.primary,
        headerBg: colors.dark.bg.secondary,
        siderBg: '#0f1419', // Even darker for sidebar
        footerBg: colors.dark.bg.secondary,
      },
      Card: {
        colorBgContainer: colors.dark.bg.secondary,
        colorBorderSecondary: colors.dark.border.primary,
      },
      Table: {
        colorBgContainer: colors.dark.bg.secondary,
        headerBg: colors.dark.bg.primary,
        rowHoverBg: colors.dark.bg.tertiary,
        colorBorderSecondary: colors.dark.border.primary,
      },
      Modal: {
        contentBg: colors.dark.bg.secondary,
        headerBg: colors.dark.bg.primary,
      },
      Dropdown: {
        colorBgElevated: colors.dark.bg.elevated,
      },
      Select: {
        colorBgContainer: colors.dark.bg.tertiary,
        colorBgElevated: colors.dark.bg.elevated,
        optionSelectedBg: colors.primary,
      },
      Input: {
        colorBgContainer: colors.dark.bg.tertiary,
        activeBorderColor: colors.primaryLight,
        hoverBorderColor: colors.primary,
        colorBorder: colors.dark.border.secondary,
      },
      Button: {
        colorPrimary: colors.primary,
        primaryColor: '#ffffff',
      },
      Menu: {
        darkItemBg: 'transparent',
        darkSubMenuItemBg: 'rgba(0, 0, 0, 0.2)',
        darkItemSelectedBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        darkItemHoverBg: 'rgba(102, 126, 234, 0.1)',
        darkItemColor: '#94a3b8',
        darkItemHoverColor: '#ffffff',
        darkItemSelectedColor: '#ffffff',
      },
    },
  },
  cssVariables: {
    '--color-primary': colors.primary,
    '--color-primary-dark': colors.primaryDark,
    '--color-primary-light': colors.primaryLight,
    '--color-secondary': colors.secondary,
    '--color-success': colors.success,
    '--color-warning': colors.warning,
    '--color-error': colors.error,
    '--color-info': colors.info,
    
    '--bg-primary': colors.dark.bg.primary,
    '--bg-secondary': colors.dark.bg.secondary,
    '--bg-tertiary': colors.dark.bg.tertiary,
    '--bg-elevated': colors.dark.bg.elevated,
    
    '--text-primary': colors.dark.text.primary,
    '--text-secondary': colors.dark.text.secondary,
    '--text-tertiary': colors.dark.text.tertiary,
    '--text-inverse': colors.dark.text.inverse,
    
    '--border-primary': colors.dark.border.primary,
    '--border-secondary': colors.dark.border.secondary,
    '--border-tertiary': colors.dark.border.tertiary,
    
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
    '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  },
};

// Theme presets
export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

// Get theme by name
export const getTheme = (themeName: 'light' | 'dark'): CustomThemeConfig => {
  return themes[themeName];
};