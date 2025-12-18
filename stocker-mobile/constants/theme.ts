/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#0f172a', // Slate 900
    background: '#ffffff',
    tint: '#00ff88', // Neon Green
    icon: '#64748b', // Slate 500
    tabIconDefault: '#94a3b8', // Slate 400
    tabIconSelected: '#0f172a', // Slate 900

    // Custom Palette
    primary: '#0f172a', // Slate 900
    secondary: '#f1f5f9', // Slate 100
    accent: '#00ff88', // Neon Green
    muted: '#64748b', // Slate 500
    border: '#e2e8f0', // Slate 200
    card: '#ffffff',
    error: '#ef4444',
  },
  dark: {
    text: '#f8fafc', // Slate 50
    background: '#0a0a0a', // Darker background
    tint: '#00ff88',
    icon: '#94a3b8',
    tabIconDefault: '#64748b',
    tabIconSelected: '#f8fafc',

    // Custom Palette
    primary: '#f8fafc',
    secondary: '#1e293b', // Slate 800
    accent: '#00ff88',
    muted: '#94a3b8', // Slate 400
    border: '#334155', // Slate 700
    card: '#171717', // Neutral 900
    error: '#f87171',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
