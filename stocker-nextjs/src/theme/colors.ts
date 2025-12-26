/**
 * =====================================
 * STOCKER DESIGN SYSTEM - COLOR PALETTE
 * =====================================
 *
 * Enterprise-grade color system following WCAG 2.1 AA accessibility standards.
 * Based on Tailwind CSS Slate scale with custom brand colors.
 *
 * Usage:
 * - Import colors directly: import { colors } from '@/theme/colors'
 * - Access via theme tokens: theme.token.colorPrimary
 */

// =====================================
// NEUTRAL COLORS (Slate Scale)
// =====================================
// Clean corporate aesthetic with high contrast

export const slate = {
  50: '#f8fafc',   // Backgrounds, subtle highlights
  100: '#f1f5f9',  // Hover states, card backgrounds
  200: '#e2e8f0',  // Borders, dividers
  300: '#cbd5e1',  // Disabled text, placeholder
  400: '#94a3b8',  // Secondary text, icons
  500: '#64748b',  // Muted text
  600: '#475569',  // Body text
  700: '#334155',  // Strong body text
  800: '#1e293b',  // Headings
  900: '#0f172a',  // Primary text, active states
  950: '#020617',  // Maximum contrast
} as const;

// =====================================
// BRAND COLORS
// =====================================

export const brand = {
  // Primary - Corporate Blue (Refined Indigo)
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',  // Main brand color
    600: '#4f46e5',  // Hover state
    700: '#4338ca',  // Active state
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },

  // Secondary - Emerald (Success/Positive Actions)
  secondary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',  // Main secondary
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
} as const;

// =====================================
// SEMANTIC COLORS
// =====================================

export const semantic = {
  // Success - Emerald
  success: {
    light: '#ecfdf5',
    default: '#10b981',
    dark: '#047857',
    text: '#065f46',
  },

  // Warning - Amber
  warning: {
    light: '#fffbeb',
    default: '#f59e0b',
    dark: '#d97706',
    text: '#92400e',
  },

  // Error - Red
  error: {
    light: '#fef2f2',
    default: '#ef4444',
    dark: '#dc2626',
    text: '#991b1b',
  },

  // Info - Blue
  info: {
    light: '#eff6ff',
    default: '#3b82f6',
    dark: '#2563eb',
    text: '#1e40af',
  },
} as const;

// =====================================
// BACKGROUND COLORS
// =====================================

export const backgrounds = {
  // Light Mode
  light: {
    primary: '#ffffff',
    secondary: slate[50],
    tertiary: slate[100],
    elevated: '#ffffff',
    overlay: 'rgba(15, 23, 42, 0.5)',
  },

  // Dark Mode
  dark: {
    primary: slate[950],
    secondary: slate[900],
    tertiary: slate[800],
    elevated: slate[900],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

// =====================================
// BORDER COLORS
// =====================================

export const borders = {
  light: {
    default: slate[200],
    subtle: slate[100],
    strong: slate[300],
    focus: brand.primary[500],
  },
  dark: {
    default: slate[700],
    subtle: slate[800],
    strong: slate[600],
    focus: brand.primary[400],
  },
} as const;

// =====================================
// TEXT COLORS
// =====================================

export const text = {
  light: {
    primary: slate[900],
    secondary: slate[600],
    tertiary: slate[500],
    disabled: slate[400],
    inverse: '#ffffff',
  },
  dark: {
    primary: slate[50],
    secondary: slate[300],
    tertiary: slate[400],
    disabled: slate[500],
    inverse: slate[900],
  },
} as const;

// =====================================
// SPECIAL COLORS
// =====================================

export const special = {
  // Landing page neon green CTA
  neonGreen: {
    from: '#00ff88',
    to: '#00dd77',
    glow: 'rgba(0, 255, 136, 0.6)',
  },

  // Status colors for orders/workflows
  status: {
    draft: slate[500],
    pending: '#f59e0b',
    approved: '#3b82f6',
    confirmed: '#06b6d4',
    shipped: '#8b5cf6',
    delivered: brand.primary[500],
    completed: '#10b981',
    cancelled: '#ef4444',
    rejected: '#ef4444',
    expired: '#f59e0b',
  },
} as const;

// =====================================
// CONSOLIDATED EXPORT
// =====================================

export const colors = {
  slate,
  brand,
  semantic,
  backgrounds,
  borders,
  text,
  special,
} as const;

export default colors;
