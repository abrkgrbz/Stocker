import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors } from '@/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';

interface CardProps extends ViewProps {
    variant?: 'default' | 'outlined';
}

export function Card({ style, variant = 'default', ...props }: CardProps) {
    const { theme: activeTheme } = useTheme();
    const colorScheme = activeTheme;
    const theme = Colors[activeTheme ?? 'light'];

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colorScheme === 'dark' ? '#374151' : '#F9FAFB', // Dark: Gray 700, Light: Light Gray 50
                    borderColor: colorScheme === 'dark' ? '#4B5563' : '#E5E7EB', // Dark: Gray 600, Light: Gray 200
                    borderWidth: 1,
                    shadowColor: '#000',
                    shadowOpacity: variant === 'default' ? 0.05 : 0,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: variant === 'default' ? 2 : 0,
                },
                style,
            ]}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
});
