import React from 'react';
import { View, Pressable, ViewStyle, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/lib/theme';

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    variant?: 'default' | 'outlined' | 'elevated';
    animated?: boolean;
    animationDelay?: number;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    borderRadius?: 'sm' | 'md' | 'lg' | 'xl';
}

const paddingMap = {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
};

const borderRadiusMap = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
};

export function Card({
    children,
    onPress,
    style,
    variant = 'default',
    animated = true,
    animationDelay = 0,
    padding = 'lg',
    borderRadius = 'lg',
}: CardProps) {
    const { colors } = useTheme();

    const baseStyle: ViewStyle = {
        backgroundColor: colors.surface.primary,
        borderRadius: borderRadiusMap[borderRadius],
        padding: paddingMap[padding],
    };

    const variantStyles: Record<string, ViewStyle> = {
        default: {
            borderWidth: 1,
            borderColor: colors.border.primary,
        },
        outlined: {
            borderWidth: 1,
            borderColor: colors.border.secondary,
            backgroundColor: 'transparent',
        },
        elevated: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
    };

    const cardStyle = [baseStyle, variantStyles[variant], style];

    const content = onPress ? (
        <Pressable onPress={onPress} style={cardStyle}>
            {children}
        </Pressable>
    ) : (
        <View style={cardStyle}>{children}</View>
    );

    if (animated) {
        return (
            <Animated.View entering={FadeInDown.duration(400).delay(animationDelay)}>
                {content}
            </Animated.View>
        );
    }

    return content;
}
