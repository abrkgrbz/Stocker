/**
 * =====================================
 * STOCKER DESIGN SYSTEM - DESIGN TOKENS
 * =====================================
 *
 * Ant Design 5 Design Tokens for consistent theming.
 * These tokens map to Ant Design's token system.
 *
 * Token Categories:
 * - Seed Tokens: Base values that generate other tokens
 * - Map Tokens: Derived from seed tokens
 * - Alias Tokens: Semantic tokens for specific use cases
 */

import type { AliasToken } from 'antd/es/theme/internal';
import { colors, slate, brand, semantic } from './colors';

// =====================================
// TYPOGRAPHY TOKENS
// =====================================

export const typography = {
  // Font Family - Uses Geist from Next.js
  fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontFamilyCode: 'var(--font-geist-mono), SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

  // Font Sizes (px)
  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 16,
  fontSizeXL: 20,
  fontSizeHeading1: 38,
  fontSizeHeading2: 30,
  fontSizeHeading3: 24,
  fontSizeHeading4: 20,
  fontSizeHeading5: 16,

  // Line Heights
  lineHeight: 1.5714285714285714,
  lineHeightLG: 1.5,
  lineHeightSM: 1.6666666666666667,
  lineHeightHeading1: 1.2105263157894737,
  lineHeightHeading2: 1.2666666666666666,
  lineHeightHeading3: 1.3333333333333333,
  lineHeightHeading4: 1.4,
  lineHeightHeading5: 1.5,

  // Font Weights
  fontWeightStrong: 600,
} as const;

// =====================================
// SPACING & SIZING TOKENS
// =====================================

export const spacing = {
  // Border Radius
  borderRadius: 6,
  borderRadiusXS: 2,
  borderRadiusSM: 4,
  borderRadiusLG: 8,

  // Control Heights
  controlHeight: 32,
  controlHeightLG: 40,
  controlHeightSM: 24,
  controlHeightXS: 16,

  // Margins & Paddings (Base: 4px)
  marginXXS: 4,
  marginXS: 8,
  marginSM: 12,
  margin: 16,
  marginMD: 20,
  marginLG: 24,
  marginXL: 32,
  marginXXL: 48,

  paddingXXS: 4,
  paddingXS: 8,
  paddingSM: 12,
  padding: 16,
  paddingMD: 20,
  paddingLG: 24,
  paddingXL: 32,

  // Content Padding
  paddingContentHorizontal: 16,
  paddingContentVertical: 12,
  paddingContentHorizontalSM: 16,
  paddingContentVerticalSM: 8,
  paddingContentHorizontalLG: 24,
  paddingContentVerticalLG: 16,
} as const;

// =====================================
// SHADOW TOKENS
// =====================================

export const shadows = {
  // Box Shadows - Refined, subtle shadows for clean corporate look
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
  boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',

  // Dark mode shadows
  boxShadowDark: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  boxShadowSecondaryDark: '0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 9px 28px 8px rgba(0, 0, 0, 0.2)',
} as const;

// =====================================
// MOTION TOKENS
// =====================================

export const motion = {
  // Animation Durations
  motionDurationFast: '0.1s',
  motionDurationMid: '0.2s',
  motionDurationSlow: '0.3s',

  // Easing Functions
  motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  motionEaseIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  motionEaseOutBack: 'cubic-bezier(0.12, 0.4, 0.29, 1.46)',
  motionEaseInBack: 'cubic-bezier(0.71, -0.46, 0.88, 0.6)',
  motionEaseOutCirc: 'cubic-bezier(0.08, 0.82, 0.17, 1)',
  motionEaseInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.34)',
  motionEaseOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
  motionEaseInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
} as const;

// =====================================
// LIGHT MODE TOKENS
// =====================================

export const lightTokens: Partial<AliasToken> = {
  // Brand Colors
  colorPrimary: brand.primary[500],
  colorPrimaryHover: brand.primary[600],
  colorPrimaryActive: brand.primary[700],
  colorPrimaryBg: brand.primary[50],
  colorPrimaryBgHover: brand.primary[100],
  colorPrimaryBorder: brand.primary[200],
  colorPrimaryBorderHover: brand.primary[300],
  colorPrimaryText: brand.primary[600],
  colorPrimaryTextHover: brand.primary[500],
  colorPrimaryTextActive: brand.primary[700],

  // Success Colors
  colorSuccess: semantic.success.default,
  colorSuccessBg: semantic.success.light,
  colorSuccessBorder: '#a7f3d0',
  colorSuccessHover: '#34d399',
  colorSuccessActive: semantic.success.dark,
  colorSuccessText: semantic.success.text,
  colorSuccessTextHover: semantic.success.default,
  colorSuccessTextActive: semantic.success.dark,

  // Warning Colors
  colorWarning: semantic.warning.default,
  colorWarningBg: semantic.warning.light,
  colorWarningBorder: '#fde68a',
  colorWarningHover: '#fbbf24',
  colorWarningActive: semantic.warning.dark,
  colorWarningText: semantic.warning.text,
  colorWarningTextHover: semantic.warning.default,
  colorWarningTextActive: semantic.warning.dark,

  // Error Colors
  colorError: semantic.error.default,
  colorErrorBg: semantic.error.light,
  colorErrorBorder: '#fecaca',
  colorErrorHover: '#f87171',
  colorErrorActive: semantic.error.dark,
  colorErrorText: semantic.error.text,
  colorErrorTextHover: semantic.error.default,
  colorErrorTextActive: semantic.error.dark,

  // Info Colors
  colorInfo: semantic.info.default,
  colorInfoBg: semantic.info.light,
  colorInfoBorder: '#bfdbfe',
  colorInfoHover: '#60a5fa',
  colorInfoActive: semantic.info.dark,
  colorInfoText: semantic.info.text,
  colorInfoTextHover: semantic.info.default,
  colorInfoTextActive: semantic.info.dark,

  // Neutral Colors
  colorText: colors.text.light.primary,
  colorTextSecondary: colors.text.light.secondary,
  colorTextTertiary: colors.text.light.tertiary,
  colorTextDisabled: colors.text.light.disabled,

  colorBgContainer: colors.backgrounds.light.primary,
  colorBgElevated: colors.backgrounds.light.elevated,
  colorBgLayout: colors.backgrounds.light.secondary,
  colorBgSpotlight: colors.backgrounds.light.tertiary,
  colorBgMask: colors.backgrounds.light.overlay,

  colorBorder: colors.borders.light.default,
  colorBorderSecondary: colors.borders.light.subtle,

  colorFill: slate[100],
  colorFillSecondary: slate[50],
  colorFillTertiary: slate[50],
  colorFillQuaternary: slate[50],

  // Typography
  ...typography,

  // Spacing
  ...spacing,

  // Shadows
  ...shadows,

  // Motion
  ...motion,

  // Other
  wireframe: false,
  colorWhite: '#ffffff',
  colorLink: brand.primary[500],
  colorLinkHover: brand.primary[600],
  colorLinkActive: brand.primary[700],
};

// =====================================
// DARK MODE TOKENS
// =====================================

export const darkTokens: Partial<AliasToken> = {
  // Brand Colors (adjusted for dark mode)
  colorPrimary: brand.primary[400],
  colorPrimaryHover: brand.primary[300],
  colorPrimaryActive: brand.primary[500],
  colorPrimaryBg: 'rgba(99, 102, 241, 0.15)',
  colorPrimaryBgHover: 'rgba(99, 102, 241, 0.25)',
  colorPrimaryBorder: brand.primary[600],
  colorPrimaryBorderHover: brand.primary[500],
  colorPrimaryText: brand.primary[400],
  colorPrimaryTextHover: brand.primary[300],
  colorPrimaryTextActive: brand.primary[500],

  // Success Colors (dark mode)
  colorSuccess: '#34d399',
  colorSuccessBg: 'rgba(16, 185, 129, 0.15)',
  colorSuccessBorder: 'rgba(16, 185, 129, 0.3)',
  colorSuccessHover: '#6ee7b7',
  colorSuccessActive: '#10b981',
  colorSuccessText: '#34d399',
  colorSuccessTextHover: '#6ee7b7',
  colorSuccessTextActive: '#10b981',

  // Warning Colors (dark mode)
  colorWarning: '#fbbf24',
  colorWarningBg: 'rgba(245, 158, 11, 0.15)',
  colorWarningBorder: 'rgba(245, 158, 11, 0.3)',
  colorWarningHover: '#fcd34d',
  colorWarningActive: '#f59e0b',
  colorWarningText: '#fbbf24',
  colorWarningTextHover: '#fcd34d',
  colorWarningTextActive: '#f59e0b',

  // Error Colors (dark mode)
  colorError: '#f87171',
  colorErrorBg: 'rgba(239, 68, 68, 0.15)',
  colorErrorBorder: 'rgba(239, 68, 68, 0.3)',
  colorErrorHover: '#fca5a5',
  colorErrorActive: '#ef4444',
  colorErrorText: '#f87171',
  colorErrorTextHover: '#fca5a5',
  colorErrorTextActive: '#ef4444',

  // Info Colors (dark mode)
  colorInfo: '#60a5fa',
  colorInfoBg: 'rgba(59, 130, 246, 0.15)',
  colorInfoBorder: 'rgba(59, 130, 246, 0.3)',
  colorInfoHover: '#93c5fd',
  colorInfoActive: '#3b82f6',
  colorInfoText: '#60a5fa',
  colorInfoTextHover: '#93c5fd',
  colorInfoTextActive: '#3b82f6',

  // Neutral Colors (dark mode)
  colorText: colors.text.dark.primary,
  colorTextSecondary: colors.text.dark.secondary,
  colorTextTertiary: colors.text.dark.tertiary,
  colorTextDisabled: colors.text.dark.disabled,

  colorBgContainer: colors.backgrounds.dark.primary,
  colorBgElevated: colors.backgrounds.dark.elevated,
  colorBgLayout: colors.backgrounds.dark.secondary,
  colorBgSpotlight: colors.backgrounds.dark.tertiary,
  colorBgMask: colors.backgrounds.dark.overlay,

  colorBorder: colors.borders.dark.default,
  colorBorderSecondary: colors.borders.dark.subtle,

  colorFill: slate[800],
  colorFillSecondary: slate[900],
  colorFillTertiary: slate[900],
  colorFillQuaternary: slate[950],

  // Typography (same as light)
  ...typography,

  // Spacing (same as light)
  ...spacing,

  // Shadows (dark mode)
  boxShadow: shadows.boxShadowDark,
  boxShadowSecondary: shadows.boxShadowSecondaryDark,

  // Motion (same as light)
  ...motion,

  // Other
  wireframe: false,
  colorWhite: '#ffffff',
  colorLink: brand.primary[400],
  colorLinkHover: brand.primary[300],
  colorLinkActive: brand.primary[500],
};

export default {
  light: lightTokens,
  dark: darkTokens,
  typography,
  spacing,
  shadows,
  motion,
};
