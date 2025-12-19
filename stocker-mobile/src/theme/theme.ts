export interface ThemeColors {
    // Brand Colors
    primary: string;
    secondary: string;
    accent: string;

    // Backgrounds
    background: string;
    surface: string;
    surfaceLight: string;
    border: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // Status
    success: string;
    error: string;
    warning: string;
    info: string;

    // Gradients
    gradientViolet: [string, string];
    gradientCyan: [string, string];
    gradientGreen: [string, string];
}

export const darkColors: ThemeColors = {
    // Brand Colors
    primary: '#f8fafc', // Slate 50 (Text/Icon primary)
    secondary: '#1e293b', // Slate 800
    accent: '#00ff88', // Neon Green

    // Backgrounds
    background: '#0a0a0a',
    surface: '#171717',
    surfaceLight: '#262626',
    border: 'rgba(255,255,255,0.1)',

    // Text
    textPrimary: '#ededed',
    textSecondary: '#a3a3a3',
    textMuted: '#525252',

    // Status
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',

    // Gradients
    gradientViolet: ['#7c3aed', '#c026d3'],
    gradientCyan: ['#06b6d4', '#3b82f6'],
    gradientGreen: ['#22c55e', '#10b981'],
};

export const lightColors: ThemeColors = {
    // Brand Colors
    primary: '#0f172a', // Slate 900
    secondary: '#f1f5f9', // Slate 100
    accent: '#00ff88', // Neon Green

    // Backgrounds
    background: '#ffffff',
    surface: '#ffffff',
    surfaceLight: '#f8fafc', // Slate 50
    border: '#e2e8f0', // Slate 200

    // Text
    textPrimary: '#0f172a', // Slate 900
    textSecondary: '#64748b', // Slate 500
    textMuted: '#94a3b8', // Slate 400

    // Status
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',

    // Gradients
    gradientViolet: ['#7c3aed', '#c026d3'],
    gradientCyan: ['#06b6d4', '#3b82f6'],
    gradientGreen: ['#22c55e', '#10b981'],
};

export const spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 24, fontWeight: 'bold' },
    h3: { fontSize: 20, fontWeight: 'bold' },
    body: { fontSize: 16 },
    caption: { fontSize: 14 },
};
