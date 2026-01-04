import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/lib/theme';

interface GlassContainerProps {
    children: React.ReactNode;
    intensity?: number;
    style?: ViewStyle;
    variant?: 'default' | 'light' | 'dark';
    borderRadius?: number;
    padding?: number;
}

export function GlassContainer({
    children,
    intensity = 20,
    style,
    variant = 'default',
    borderRadius = 24,
    padding = 24,
}: GlassContainerProps) {
    const { isDark } = useTheme();

    const getBorderColor = () => {
        if (isDark) {
            switch (variant) {
                case 'light':
                    return 'rgba(255, 255, 255, 0.15)';
                case 'dark':
                    return 'rgba(255, 255, 255, 0.08)';
                default:
                    return 'rgba(255, 255, 255, 0.12)';
            }
        }
        switch (variant) {
            case 'light':
                return 'rgba(255, 255, 255, 0.3)';
            case 'dark':
                return 'rgba(0, 0, 0, 0.1)';
            default:
                return 'rgba(255, 255, 255, 0.2)';
        }
    };

    const getBackgroundColor = () => {
        if (isDark) {
            switch (variant) {
                case 'light':
                    return 'rgba(255, 255, 255, 0.12)';
                case 'dark':
                    return 'rgba(255, 255, 255, 0.06)';
                default:
                    return 'rgba(255, 255, 255, 0.08)';
            }
        }
        switch (variant) {
            case 'light':
                return 'rgba(255, 255, 255, 0.7)';
            case 'dark':
                return 'rgba(255, 255, 255, 0.5)';
            default:
                return 'rgba(255, 255, 255, 0.6)';
        }
    };

    return (
        <View
            style={[
                styles.container,
                {
                    borderRadius,
                    borderColor: getBorderColor(),
                },
                style,
            ]}
        >
            <BlurView
                intensity={intensity}
                tint={isDark ? 'dark' : 'light'}
                style={[
                    styles.blur,
                    { borderRadius },
                ]}
            >
                <View
                    style={[
                        styles.content,
                        {
                            padding,
                            borderRadius,
                            backgroundColor: getBackgroundColor(),
                        },
                    ]}
                >
                    {children}
                </View>
            </BlurView>
        </View>
    );
}

// Simple glass card without blur (for better performance)
interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    padding?: number;
}

export function GlassCard({ children, style, padding = 20 }: GlassCardProps) {
    const { isDark } = useTheme();

    return (
        <View
            style={[
                styles.glassCard,
                {
                    padding,
                    backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.15)',
                    borderColor: isDark
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'rgba(255, 255, 255, 0.25)',
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderWidth: 1,
    },
    blur: {
        overflow: 'hidden',
    },
    content: {
        overflow: 'hidden',
    },
    glassCard: {
        borderRadius: 20,
        borderWidth: 1,
    },
});
