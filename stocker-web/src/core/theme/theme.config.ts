import { ThemeConfig } from 'antd';
import { theme } from 'antd';

export interface CustomThemeConfig {
  name: 'light' | 'dark';
  antdTheme: ThemeConfig;
  cssVariables: Record<string, string>;
}

// Color palette - Completely redesigned for proper light/dark themes
const colors = {
  // Brand colors - same for both themes
  primary: '#667eea',
  primaryDark: '#5a67d8',
  primaryLight: '#7c8ef0',
  secondary: '#764ba2',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Light theme - Full gray scale design
  light: {
    bg: {
      primary: '#f8f9fa',      // Light gray background
      secondary: '#ffffff',     // White for cards
      tertiary: '#f3f4f6',      // Lighter gray for sections
      elevated: '#ffffff',      // White for elevated elements
      sidebar: '#e9ecef',       // Light gray sidebar
      hover: '#e9ecef',         // Hover state
      active: '#dee2e6',        // Active state
    },
    text: {
      primary: '#212529',       // Almost black
      secondary: '#495057',     // Dark gray
      tertiary: '#6c757d',      // Medium gray
      muted: '#adb5bd',         // Muted gray
      inverse: '#ffffff',       // White
    },
    border: {
      primary: '#dee2e6',       // Light gray border
      secondary: '#e9ecef',     // Very light gray
      tertiary: '#f8f9fa',      // Almost white
    },
  },
  
  // Dark theme - Deep dark design
  dark: {
    bg: {
      primary: '#0f0f0f',       // Very dark background
      secondary: '#1a1a1a',     // Dark cards
      tertiary: '#242424',      // Slightly lighter sections
      elevated: '#2d2d2d',      // Elevated elements
      sidebar: '#0a0a0a',       // Even darker sidebar
      hover: '#2d2d2d',         // Hover state
      active: '#363636',        // Active state
    },
    text: {
      primary: '#ffffff',       // Pure white
      secondary: '#e0e0e0',     // Light gray
      tertiary: '#b0b0b0',      // Medium gray
      muted: '#808080',         // Muted gray
      inverse: '#0f0f0f',       // Very dark
    },
    border: {
      primary: '#2d2d2d',       // Dark border
      secondary: '#363636',     // Medium dark
      tertiary: '#404040',      // Lighter dark
    },
  },
};

// Light theme configuration - Gray-focused design
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
      colorBgBase: colors.light.bg.secondary,
      colorTextBase: colors.light.text.primary,
      colorBgContainer: colors.light.bg.secondary,
      colorBgLayout: colors.light.bg.primary,
      colorBgElevated: colors.light.bg.elevated,
      colorBorder: colors.light.border.primary,
      borderRadius: 8,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 14,
      wireframe: false,
      motion: true,
    },
    components: {
      Layout: {
        bodyBg: colors.light.bg.primary,
        headerBg: colors.light.bg.secondary,
        siderBg: colors.light.bg.sidebar,
        footerBg: colors.light.bg.secondary,
        triggerBg: colors.light.bg.hover,
        triggerColor: colors.light.text.secondary,
        lightSiderBg: colors.light.bg.sidebar,
        lightTriggerBg: colors.light.bg.hover,
        lightTriggerColor: colors.light.text.secondary,
      },
      Card: {
        colorBgContainer: colors.light.bg.secondary,
        colorBorderSecondary: colors.light.border.primary,
        paddingLG: 24,
        boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
      Table: {
        colorBgContainer: colors.light.bg.secondary,
        headerBg: colors.light.bg.tertiary,
        rowHoverBg: colors.light.bg.hover,
        colorBorderSecondary: colors.light.border.primary,
        headerColor: colors.light.text.primary,
        colorText: colors.light.text.secondary,
      },
      Modal: {
        contentBg: colors.light.bg.secondary,
        headerBg: colors.light.bg.secondary,
        footerBg: colors.light.bg.tertiary,
      },
      Dropdown: {
        colorBgElevated: colors.light.bg.elevated,
        colorBorder: colors.light.border.primary,
      },
      Select: {
        colorBgContainer: colors.light.bg.secondary,
        colorBgElevated: colors.light.bg.elevated,
        optionSelectedBg: colors.light.bg.hover,
        colorBorder: colors.light.border.primary,
      },
      Input: {
        colorBgContainer: colors.light.bg.secondary,
        activeBorderColor: colors.primary,
        hoverBorderColor: colors.primaryLight,
        colorBorder: colors.light.border.primary,
        colorText: colors.light.text.primary,
        colorTextPlaceholder: colors.light.text.muted,
      },
      Button: {
        colorPrimary: colors.primary,
        primaryColor: '#ffffff',
        defaultBg: colors.light.bg.secondary,
        defaultBorderColor: colors.light.border.primary,
        defaultColor: colors.light.text.secondary,
      },
      Menu: {
        colorBgContainer: 'transparent',
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
        itemSelectedBg: colors.light.bg.active,
        itemHoverBg: colors.light.bg.hover,
        itemColor: colors.light.text.secondary,
        itemHoverColor: colors.light.text.primary,
        itemSelectedColor: colors.primary,
        darkItemBg: 'transparent',
        darkSubMenuItemBg: 'rgba(255, 255, 255, 0.05)',
        darkItemSelectedBg: 'rgba(102, 126, 234, 0.15)',
        darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
        darkItemColor: colors.light.text.tertiary,
        darkItemHoverColor: colors.light.text.secondary,
        darkItemSelectedColor: colors.primary,
      },
      Divider: {
        colorSplit: colors.light.border.secondary,
      },
      Badge: {
        colorBgContainer: colors.error,
        colorText: '#ffffff',
      },
      Tooltip: {
        colorBgSpotlight: colors.light.bg.tertiary,
        colorTextLightSolid: colors.light.text.primary,
      },
      Breadcrumb: {
        itemColor: colors.light.text.tertiary,
        lastItemColor: colors.light.text.primary,
        linkColor: colors.light.text.tertiary,
        linkHoverColor: colors.primary,
        separatorColor: colors.light.text.muted,
      },
      Form: {
        labelColor: colors.light.text.secondary,
        labelRequiredMarkColor: colors.error,
      },
      Switch: {
        colorPrimary: colors.primary,
        colorPrimaryHover: colors.primaryLight,
      },
      Radio: {
        colorPrimary: colors.primary,
        colorBorder: colors.light.border.primary,
      },
      Checkbox: {
        colorPrimary: colors.primary,
        colorBorder: colors.light.border.primary,
      },
      Tabs: {
        itemColor: colors.light.text.tertiary,
        itemHoverColor: colors.light.text.secondary,
        itemActiveColor: colors.primary,
        itemSelectedColor: colors.primary,
        inkBarColor: colors.primary,
        cardBg: colors.light.bg.tertiary,
      },
      Pagination: {
        itemBg: colors.light.bg.secondary,
        itemActiveBg: colors.primary,
        itemLinkBg: colors.light.bg.secondary,
        itemInputBg: colors.light.bg.secondary,
      },
      Steps: {
        colorPrimary: colors.primary,
        processTailColor: colors.light.border.primary,
        finishTailColor: colors.primary,
      },
      Alert: {
        colorInfoBg: `${colors.info}15`,
        colorInfoBorder: `${colors.info}30`,
        colorSuccessBg: `${colors.success}15`,
        colorSuccessBorder: `${colors.success}30`,
        colorWarningBg: `${colors.warning}15`,
        colorWarningBorder: `${colors.warning}30`,
        colorErrorBg: `${colors.error}15`,
        colorErrorBorder: `${colors.error}30`,
      },
      Tag: {
        defaultBg: colors.light.bg.tertiary,
        defaultColor: colors.light.text.secondary,
      },
      Avatar: {
        colorBgContainer: colors.light.bg.hover,
        colorTextPlaceholder: colors.light.text.secondary,
      },
      DatePicker: {
        colorBgContainer: colors.light.bg.secondary,
        colorBgElevated: colors.light.bg.elevated,
        colorBorder: colors.light.border.primary,
      },
      TimePicker: {
        colorBgContainer: colors.light.bg.secondary,
        colorBgElevated: colors.light.bg.elevated,
        colorBorder: colors.light.border.primary,
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
    
    '--bg-primary': colors.light.bg.primary,
    '--bg-secondary': colors.light.bg.secondary,
    '--bg-tertiary': colors.light.bg.tertiary,
    '--bg-elevated': colors.light.bg.elevated,
    '--bg-sidebar': colors.light.bg.sidebar,
    '--bg-hover': colors.light.bg.hover,
    '--bg-active': colors.light.bg.active,
    
    '--text-primary': colors.light.text.primary,
    '--text-secondary': colors.light.text.secondary,
    '--text-tertiary': colors.light.text.tertiary,
    '--text-muted': colors.light.text.muted,
    '--text-inverse': colors.light.text.inverse,
    
    '--border-primary': colors.light.border.primary,
    '--border-secondary': colors.light.border.secondary,
    '--border-tertiary': colors.light.border.tertiary,
    
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
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
      colorBgContainer: colors.dark.bg.secondary,
      colorBgLayout: colors.dark.bg.primary,
      colorBgElevated: colors.dark.bg.elevated,
      colorBorder: colors.dark.border.primary,
      borderRadius: 8,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 14,
      wireframe: false,
      motion: true,
    },
    components: {
      Layout: {
        bodyBg: colors.dark.bg.primary,
        headerBg: colors.dark.bg.secondary,
        siderBg: colors.dark.bg.sidebar,
        footerBg: colors.dark.bg.secondary,
        triggerBg: colors.dark.bg.hover,
        triggerColor: colors.dark.text.secondary,
        lightSiderBg: colors.dark.bg.sidebar,
        lightTriggerBg: colors.dark.bg.hover,
        lightTriggerColor: colors.dark.text.secondary,
      },
      Card: {
        colorBgContainer: colors.dark.bg.secondary,
        colorBorderSecondary: colors.dark.border.primary,
        paddingLG: 24,
        boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
      },
      Table: {
        colorBgContainer: colors.dark.bg.secondary,
        headerBg: colors.dark.bg.tertiary,
        rowHoverBg: colors.dark.bg.hover,
        colorBorderSecondary: colors.dark.border.primary,
        headerColor: colors.dark.text.primary,
        colorText: colors.dark.text.secondary,
      },
      Modal: {
        contentBg: colors.dark.bg.secondary,
        headerBg: colors.dark.bg.secondary,
        footerBg: colors.dark.bg.tertiary,
      },
      Dropdown: {
        colorBgElevated: colors.dark.bg.elevated,
        colorBorder: colors.dark.border.primary,
      },
      Select: {
        colorBgContainer: colors.dark.bg.tertiary,
        colorBgElevated: colors.dark.bg.elevated,
        optionSelectedBg: colors.dark.bg.active,
        colorBorder: colors.dark.border.primary,
      },
      Input: {
        colorBgContainer: colors.dark.bg.tertiary,
        activeBorderColor: colors.primaryLight,
        hoverBorderColor: colors.primary,
        colorBorder: colors.dark.border.primary,
        colorText: colors.dark.text.primary,
        colorTextPlaceholder: colors.dark.text.muted,
      },
      Button: {
        colorPrimary: colors.primary,
        primaryColor: '#ffffff',
        defaultBg: colors.dark.bg.tertiary,
        defaultBorderColor: colors.dark.border.primary,
        defaultColor: colors.dark.text.secondary,
      },
      Menu: {
        colorBgContainer: 'transparent',
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
        itemSelectedBg: colors.dark.bg.active,
        itemHoverBg: colors.dark.bg.hover,
        itemColor: colors.dark.text.secondary,
        itemHoverColor: colors.dark.text.primary,
        itemSelectedColor: colors.primary,
        darkItemBg: 'transparent',
        darkSubMenuItemBg: 'rgba(255, 255, 255, 0.02)',
        darkItemSelectedBg: 'rgba(102, 126, 234, 0.15)',
        darkItemHoverBg: 'rgba(255, 255, 255, 0.05)',
        darkItemColor: colors.dark.text.tertiary,
        darkItemHoverColor: colors.dark.text.primary,
        darkItemSelectedColor: colors.primary,
      },
      Divider: {
        colorSplit: colors.dark.border.secondary,
      },
      Badge: {
        colorBgContainer: colors.error,
        colorText: '#ffffff',
      },
      Tooltip: {
        colorBgSpotlight: colors.dark.bg.elevated,
        colorTextLightSolid: colors.dark.text.primary,
      },
      Breadcrumb: {
        itemColor: colors.dark.text.tertiary,
        lastItemColor: colors.dark.text.primary,
        linkColor: colors.dark.text.tertiary,
        linkHoverColor: colors.primary,
        separatorColor: colors.dark.text.muted,
      },
      Form: {
        labelColor: colors.dark.text.secondary,
        labelRequiredMarkColor: colors.error,
      },
      Switch: {
        colorPrimary: colors.primary,
        colorPrimaryHover: colors.primaryLight,
      },
      Radio: {
        colorPrimary: colors.primary,
        colorBorder: colors.dark.border.primary,
      },
      Checkbox: {
        colorPrimary: colors.primary,
        colorBorder: colors.dark.border.primary,
      },
      Tabs: {
        itemColor: colors.dark.text.tertiary,
        itemHoverColor: colors.dark.text.secondary,
        itemActiveColor: colors.primary,
        itemSelectedColor: colors.primary,
        inkBarColor: colors.primary,
        cardBg: colors.dark.bg.tertiary,
      },
      Pagination: {
        itemBg: colors.dark.bg.tertiary,
        itemActiveBg: colors.primary,
        itemLinkBg: colors.dark.bg.tertiary,
        itemInputBg: colors.dark.bg.tertiary,
      },
      Steps: {
        colorPrimary: colors.primary,
        processTailColor: colors.dark.border.primary,
        finishTailColor: colors.primary,
      },
      Alert: {
        colorInfoBg: `${colors.info}15`,
        colorInfoBorder: `${colors.info}30`,
        colorSuccessBg: `${colors.success}15`,
        colorSuccessBorder: `${colors.success}30`,
        colorWarningBg: `${colors.warning}15`,
        colorWarningBorder: `${colors.warning}30`,
        colorErrorBg: `${colors.error}15`,
        colorErrorBorder: `${colors.error}30`,
      },
      Tag: {
        defaultBg: colors.dark.bg.tertiary,
        defaultColor: colors.dark.text.secondary,
      },
      Avatar: {
        colorBgContainer: colors.dark.bg.hover,
        colorTextPlaceholder: colors.dark.text.secondary,
      },
      DatePicker: {
        colorBgContainer: colors.dark.bg.tertiary,
        colorBgElevated: colors.dark.bg.elevated,
        colorBorder: colors.dark.border.primary,
      },
      TimePicker: {
        colorBgContainer: colors.dark.bg.tertiary,
        colorBgElevated: colors.dark.bg.elevated,
        colorBorder: colors.dark.border.primary,
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
    '--bg-sidebar': colors.dark.bg.sidebar,
    '--bg-hover': colors.dark.bg.hover,
    '--bg-active': colors.dark.bg.active,
    
    '--text-primary': colors.dark.text.primary,
    '--text-secondary': colors.dark.text.secondary,
    '--text-tertiary': colors.dark.text.tertiary,
    '--text-muted': colors.dark.text.muted,
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