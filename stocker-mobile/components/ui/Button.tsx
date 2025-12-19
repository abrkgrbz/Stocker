import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { useTheme } from '../../src/context/ThemeContext'; // Using relative path since alias might be tricky in components
import { LinearGradient } from 'expo-linear-gradient';

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
    const { theme: activeTheme } = useTheme();
    // Use activeTheme ('light' or 'dark') to determine colors. 
    // We can map this to colorScheme variable name to minimize changes
    const colorScheme = activeTheme;
    const theme = Colors[activeTheme ?? 'light'];

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
            case 'primary':
                // If Light Mode (Light Gray Button), we need Dark Text
                // If Dark Mode (Dark Gray Button), we need Light Text
                return colorScheme === 'dark' ? '#F9FAFB' : '#1F2937';
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



    const renderContent = () => (
        <>
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
        </>
    );

    if (variant === 'primary' && !disabled) {
        return (
            <TouchableOpacity
                style={[
                    styles.container,
                    {
                        backgroundColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB', // Dark Gray 700 / Light Gray 200
                        borderWidth: 0,
                    },
                    style
                ]}
                activeOpacity={0.8}
                disabled={loading}
                {...props}
            >
                {renderContent()}
            </TouchableOpacity>
        );
    }

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
            {renderContent()}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 48,
        borderRadius: 12, // Increased radius for softer look
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        width: '100%',
    },
    wrapper: {
        width: '100%',
        borderRadius: 12,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});
