export interface ThemeColors {
    // Brand Colors
    primary: string;
    secondary: string;
    accent: string;

    // Backgrounds
    background: string;
    surface: string;
    surfaceLight: string;

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
    primary: '#1890ff',
    secondary: '#722ed1',
    accent: '#00ff88',

    // Backgrounds
    background: '#0a0a0a',
    surface: '#171717',
    surfaceLight: '#1f1f1f',

    // Text
    textPrimary: '#ededed',
    textSecondary: '#a0aec0',
    textMuted: '#718096',

    // Status
    success: '#52c41a',
    error: '#ff4d4f',
    warning: '#faad14',
    info: '#1890ff',

    // Gradients
    gradientViolet: ['#7c3aed', '#c026d3'],
    gradientCyan: ['#06b6d4', '#3b82f6'],
    gradientGreen: ['#22c55e', '#10b981'],
};

export const lightColors: ThemeColors = {
    // Brand Colors
    primary: '#1890ff', // Keep brand blue
    secondary: '#722ed1', // Keep brand violet
    accent: '#00b96b', // Darker green for light mode visibility

    // Backgrounds
    background: '#f0f2f5', // Light gray background
    surface: '#ffffff', // White surface
    surfaceLight: '#fafafa', // Very light gray

    // Text
    textPrimary: '#1f1f1f', // Almost black
    textSecondary: '#595959', // Dark gray
    textMuted: '#8c8c8c', // Light gray

    // Status
    success: '#52c41a',
    error: '#ff4d4f',
    warning: '#faad14',
    info: '#1890ff',

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
