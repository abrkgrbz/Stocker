import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CardProps extends ViewProps {
    variant?: 'default' | 'outlined';
}

export function Card({ style, variant = 'default', ...props }: CardProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
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
