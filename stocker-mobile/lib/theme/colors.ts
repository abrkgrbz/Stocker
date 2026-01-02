// Stocker Mobile - Color Palette
// Light and Dark mode color definitions

export const colors = {
    light: {
        // Background colors
        background: {
            primary: '#ffffff',
            secondary: '#f8fafc',
            tertiary: '#f1f5f9',
        },
        // Surface colors (cards, modals)
        surface: {
            primary: '#ffffff',
            secondary: '#f8fafc',
            elevated: '#ffffff',
        },
        // Text colors
        text: {
            primary: '#0f172a',
            secondary: '#475569',
            tertiary: '#94a3b8',
            inverse: '#ffffff',
        },
        // Border colors
        border: {
            primary: '#e2e8f0',
            secondary: '#cbd5e1',
            focus: '#0f172a',
        },
        // Brand colors
        brand: {
            primary: '#0f172a',
            secondary: '#1e293b',
            accent: '#3b82f6',
        },
        // Semantic colors
        semantic: {
            success: '#059669',
            successLight: '#d1fae5',
            warning: '#d97706',
            warningLight: '#fef3c7',
            error: '#dc2626',
            errorLight: '#fee2e2',
            info: '#2563eb',
            infoLight: '#dbeafe',
        },
        // Module colors
        modules: {
            crm: '#2563eb',
            crmLight: '#dbeafe',
            inventory: '#059669',
            inventoryLight: '#d1fae5',
            sales: '#d97706',
            salesLight: '#fef3c7',
            purchase: '#7c3aed',
            purchaseLight: '#ede9fe',
            hr: '#ec4899',
            hrLight: '#fce7f3',
            reports: '#0ea5e9',
            reportsLight: '#e0f2fe',
        },
        // Tab bar
        tabBar: {
            background: '#ffffff',
            active: '#0f172a',
            inactive: '#64748b',
            border: '#e2e8f0',
        },
    },
    dark: {
        // Background colors
        background: {
            primary: '#0f172a',
            secondary: '#1e293b',
            tertiary: '#334155',
        },
        // Surface colors (cards, modals)
        surface: {
            primary: '#1e293b',
            secondary: '#334155',
            elevated: '#475569',
        },
        // Text colors
        text: {
            primary: '#f8fafc',
            secondary: '#cbd5e1',
            tertiary: '#64748b',
            inverse: '#0f172a',
        },
        // Border colors
        border: {
            primary: '#334155',
            secondary: '#475569',
            focus: '#f8fafc',
        },
        // Brand colors
        brand: {
            primary: '#f8fafc',
            secondary: '#e2e8f0',
            accent: '#60a5fa',
        },
        // Semantic colors
        semantic: {
            success: '#10b981',
            successLight: '#064e3b',
            warning: '#f59e0b',
            warningLight: '#78350f',
            error: '#f87171',
            errorLight: '#7f1d1d',
            info: '#60a5fa',
            infoLight: '#1e3a8a',
        },
        // Module colors
        modules: {
            crm: '#60a5fa',
            crmLight: '#1e3a8a',
            inventory: '#34d399',
            inventoryLight: '#064e3b',
            sales: '#fbbf24',
            salesLight: '#78350f',
            purchase: '#a78bfa',
            purchaseLight: '#4c1d95',
            hr: '#f472b6',
            hrLight: '#831843',
            reports: '#38bdf8',
            reportsLight: '#0c4a6e',
        },
        // Tab bar
        tabBar: {
            background: '#1e293b',
            active: '#f8fafc',
            inactive: '#64748b',
            border: '#334155',
        },
    },
} as const;

export type ColorScheme = 'light' | 'dark';
export type Colors = typeof colors.light | typeof colors.dark;
