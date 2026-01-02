import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, ColorScheme, Colors } from './colors';

const THEME_STORAGE_KEY = '@stocker_theme';

interface ThemeContextType {
    theme: ColorScheme;
    colors: Colors;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const deviceColorScheme = useDeviceColorScheme();
    const [theme, setThemeState] = useState<ColorScheme>('light');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved theme on mount
    useEffect(() => {
        loadSavedTheme();
    }, []);

    const loadSavedTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme === 'light' || savedTheme === 'dark') {
                setThemeState(savedTheme);
            } else if (deviceColorScheme) {
                // Use device preference if no saved theme
                setThemeState(deviceColorScheme);
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const setTheme = async (newTheme: ColorScheme) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
            setThemeState(newTheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    const value: ThemeContextType = {
        theme,
        colors: colors[theme],
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
    };

    // Optionally wait for theme to load before rendering
    // This prevents flash of wrong theme
    if (!isLoaded) {
        return null;
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Hook for getting themed styles
export function useThemedStyles<T>(
    styleFactory: (colors: Colors, isDark: boolean) => T
): T {
    const { colors, isDark } = useTheme();
    return styleFactory(colors, isDark);
}
