// Theme Provider and Context
export { ThemeProvider, useTheme } from './ThemeProvider';

// Theme Configuration
export { lightTheme, darkTheme, themes, getTheme } from './theme.config';
export type { CustomThemeConfig } from './theme.config';

// Hooks
export { useThemeMode } from './hooks/useThemeMode';
export type { ThemeModeOptions } from './hooks/useThemeMode';

// Components
export { ThemeSwitcher } from './components/ThemeSwitcher';

// Re-export theme type
export type Theme = 'light' | 'dark';