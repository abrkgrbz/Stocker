import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export function Input({
    label,
    error,
    containerStyle,
    style,
    onFocus,
    onBlur,
    ...props
}: InputProps) {
    const { theme: activeTheme } = useTheme();
    const colorScheme = activeTheme;
    const theme = Colors[activeTheme ?? 'light'];
    const [isFocused, setIsFocused] = useState(false);

    // Focus Color: Slate 900 (#0f172a) for light mode, White for dark
    const focusColor = colorScheme === 'dark' ? '#f8fafc' : '#0f172a';

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: colorScheme === 'dark' ? theme.text : '#334155' }]}>
                    {label}
                </Text>
            )}
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6', // Dark Gray 700 / Light Gray 100
                        borderColor: error ? theme.error : (isFocused ? '#7c3aed' : '#E5E7EB'), // Keep Focus Purple, Border Light Gray
                        color: colorScheme === 'dark' ? '#F3F4F6' : '#1F2937', // Text Color
                        borderWidth: 1,
                    },
                    style,
                ]}
                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                onFocus={(e) => {
                    setIsFocused(true);
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    onBlur?.(e);
                }}
                {...props}
            />
            {error && (
                <Text style={[styles.error, { color: theme.error }]}>
                    {error}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    error: {
        fontSize: 12,
        marginTop: 4,
    },
});
