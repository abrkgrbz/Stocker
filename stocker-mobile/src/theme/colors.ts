export const colors = {
    // Brand Colors
    primary: '#1890ff', // Ant Design Blue
    secondary: '#722ed1', // Violet/Purple from branding
    accent: '#00ff88', // Neon Green from globals.css

    // Backgrounds
    background: '#0a0a0a', // Dark mode background
    surface: '#171717', // Dark mode surface
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

    // Gradients (represented as arrays for LinearGradient if needed, or solid fallbacks)
    gradientViolet: ['#7c3aed', '#c026d3'] as const, // Violet to Fuchsia
    gradientCyan: ['#06b6d4', '#3b82f6'] as const, // Cyan to Blue
    gradientGreen: ['#22c55e', '#10b981'] as const, // Green to Emerald
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
