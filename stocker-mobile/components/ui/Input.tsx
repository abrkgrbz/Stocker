import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

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
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [isFocused, setIsFocused] = useState(false);

    // Focus Color: Slate 900 (#0f172a) for light mode, White for dark
    const focusColor = colorScheme === 'dark' ? '#f8fafc' : '#0f172a';

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: theme.text }]}>
                    {label}
                </Text>
            )}
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: theme.background,
                        borderColor: error ? theme.error : (isFocused ? focusColor : theme.border),
                        color: theme.text,
                        shadowColor: isFocused ? focusColor : 'transparent',
                        shadowOpacity: isFocused ? 0.1 : 0,
                        shadowRadius: 4,
                        elevation: isFocused ? 2 : 0,
                    },
                    style,
                ]}
                placeholderTextColor={theme.muted}
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
