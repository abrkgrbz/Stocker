import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'neon';
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export function Button({
    title,
    variant = 'primary',
    loading = false,
    style,
    textStyle,
    icon,
    disabled,
    ...props
}: ButtonProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const getBackgroundColor = () => {
        if (disabled) return theme.muted + '40'; // 25% opacity
        switch (variant) {
            case 'primary': return theme.primary;
            case 'neon': return theme.accent;
            case 'secondary': return theme.secondary;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return theme.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.muted;
        switch (variant) {
            case 'primary': return theme.background; // Usually white or black depending on theme
            case 'neon': return '#0f172a'; // Always dark for neon
            case 'secondary': return theme.primary;
            case 'outline': return theme.primary;
            case 'ghost': return theme.primary;
            default: return theme.background;
        }
    };

    const getBorderColor = () => {
        if (variant === 'outline') return theme.border;
        return 'transparent';
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: variant === 'outline' ? 1 : 0,
                },
                style,
            ]}
            disabled={disabled || loading}
            activeOpacity={0.7}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon}
                    <Text style={[
                        styles.text,
                        { color: getTextColor(), marginLeft: icon ? 8 : 0 },
                        textStyle
                    ]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 48,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    text: {
        fontSize: 15,
        fontWeight: '600',
    },
});
