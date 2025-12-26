'use client';

import React, { ReactNode } from 'react';

/**
 * Landing Theme Provider (Simplified - Light mode only)
 * Dark mode support removed for future implementation
 */

interface ThemeProviderProps {
  children: ReactNode;
}

// Simplified hook that always returns light theme
export function useTheme() {
  return {
    theme: 'light' as const,
    toggleTheme: () => {} // No-op, dark mode disabled
  };
}

export function LandingThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}
