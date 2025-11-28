import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, darkColors, lightColors } from '../theme/theme';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: 'light' | 'dark';
    colors: ThemeColors;
    toggleTheme: () => void;
    setTheme: (theme: ThemeType) => void;
    themePreference: ThemeType;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    colors: darkColors,
    toggleTheme: () => { },
    setTheme: () => { },
    themePreference: 'system',
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themePreference, setThemePreference] = useState<ThemeType>('system');
    const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        loadThemePreference();
    }, []);

    useEffect(() => {
        // Update active theme when preference or system theme changes
        if (themePreference === 'system') {
            setActiveTheme(systemColorScheme === 'light' ? 'light' : 'dark');
        } else {
            setActiveTheme(themePreference);
        }
    }, [themePreference, systemColorScheme]);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('themePreference');
            if (savedTheme) {
                setThemePreference(savedTheme as ThemeType);
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    };

    const toggleTheme = async () => {
        const newTheme = activeTheme === 'light' ? 'dark' : 'light';
        setThemePreference(newTheme);
        try {
            await AsyncStorage.setItem('themePreference', newTheme);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const setTheme = async (newTheme: ThemeType) => {
        setThemePreference(newTheme);
        try {
            await AsyncStorage.setItem('themePreference', newTheme);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const colors = activeTheme === 'light' ? lightColors : darkColors;

    return (
        <ThemeContext.Provider value={{ theme: activeTheme, colors, toggleTheme, setTheme, themePreference }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
