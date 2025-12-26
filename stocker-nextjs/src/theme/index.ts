/**
 * =====================================
 * STOCKER DESIGN SYSTEM - MAIN THEME CONFIG
 * =====================================
 *
 * Central theme configuration for Ant Design 5.
 * Supports light and dark mode with SSR compatibility.
 *
 * Usage:
 * ```tsx
 * import { lightTheme, darkTheme, useThemeConfig } from '@/theme';
 *
 * // In ConfigProvider
 * <ConfigProvider theme={lightTheme}>
 *   <App />
 * </ConfigProvider>
 *
 * // Or with hook for dynamic theme
 * const theme = useThemeConfig('light');
 * ```
 */

import { theme as antdTheme, type ThemeConfig } from 'antd';
import { lightTokens, darkTokens } from './tokens';
import { lightComponents, darkComponents } from './components';

// Re-export everything for convenience
export * from './colors';
export * from './tokens';
export * from './components';

// =====================================
// LIGHT THEME CONFIGURATION
// =====================================

export const lightTheme: ThemeConfig = {
  // Use default algorithm for light mode
  algorithm: antdTheme.defaultAlgorithm,

  // Design tokens
  token: lightTokens,

  // Component-level overrides
  components: lightComponents,

  // CSS Variable mode for better performance
  cssVar: {
    key: 'stocker',
  },

  // Hash for style stability
  hashed: true,
};

// =====================================
// DARK THEME CONFIGURATION
// =====================================

export const darkTheme: ThemeConfig = {
  // Use dark algorithm for dark mode
  algorithm: antdTheme.darkAlgorithm,

  // Design tokens (dark mode specific)
  token: darkTokens,

  // Component-level overrides (dark mode specific)
  components: darkComponents,

  // CSS Variable mode for better performance
  cssVar: {
    key: 'stocker-dark',
  },

  // Hash for style stability
  hashed: true,
};

// =====================================
// COMPACT THEME VARIANTS
// =====================================

export const lightCompactTheme: ThemeConfig = {
  algorithm: [antdTheme.defaultAlgorithm, antdTheme.compactAlgorithm],
  token: lightTokens,
  components: lightComponents,
  cssVar: { key: 'stocker-compact' },
  hashed: true,
};

export const darkCompactTheme: ThemeConfig = {
  algorithm: [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm],
  token: darkTokens,
  components: darkComponents,
  cssVar: { key: 'stocker-dark-compact' },
  hashed: true,
};

// =====================================
// THEME UTILITY TYPES
// =====================================

export type ThemeMode = 'light' | 'dark';
export type ThemeVariant = 'default' | 'compact';

export interface ThemeOptions {
  mode: ThemeMode;
  variant?: ThemeVariant;
}

// =====================================
// THEME SELECTOR UTILITY
// =====================================

/**
 * Get theme configuration based on mode and variant
 */
export function getThemeConfig(options: ThemeOptions): ThemeConfig {
  const { mode, variant = 'default' } = options;

  if (variant === 'compact') {
    return mode === 'dark' ? darkCompactTheme : lightCompactTheme;
  }

  return mode === 'dark' ? darkTheme : lightTheme;
}

/**
 * Get theme configuration by mode string (convenience function)
 */
export function getThemeByMode(mode: ThemeMode): ThemeConfig {
  return mode === 'dark' ? darkTheme : lightTheme;
}

// =====================================
// THEME CONTEXT HELPERS
// =====================================

/**
 * Default theme configuration
 */
export const defaultThemeConfig: ThemeConfig = lightTheme;

/**
 * Theme algorithms map for easy access
 */
export const themeAlgorithms = {
  light: antdTheme.defaultAlgorithm,
  dark: antdTheme.darkAlgorithm,
  compact: antdTheme.compactAlgorithm,
};

// =====================================
// SSR-SAFE THEME DETECTION
// =====================================

/**
 * Get initial theme mode from system preference (SSR-safe)
 * Returns 'light' on server, actual preference on client
 */
export function getSystemThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'; // Default for SSR
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Get stored theme mode from localStorage (SSR-safe)
 */
export function getStoredThemeMode(): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem('stocker-theme-mode');
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  return null;
}

/**
 * Store theme mode to localStorage (SSR-safe)
 */
export function setStoredThemeMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('stocker-theme-mode', mode);
}

// =====================================
// REACT HOOK FOR THEME CONFIG
// =====================================

import { useMemo } from 'react';

/**
 * React hook to get theme configuration
 * Memoizes the config for performance
 */
export function useThemeConfig(mode: ThemeMode, variant?: ThemeVariant): ThemeConfig {
  return useMemo(
    () => getThemeConfig({ mode, variant }),
    [mode, variant]
  );
}

// =====================================
// DEFAULT EXPORT
// =====================================

export default {
  light: lightTheme,
  dark: darkTheme,
  lightCompact: lightCompactTheme,
  darkCompact: darkCompactTheme,
  getThemeConfig,
  getThemeByMode,
  algorithms: themeAlgorithms,
};
