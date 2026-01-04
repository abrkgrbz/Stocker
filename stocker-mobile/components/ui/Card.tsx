import React from 'react';
import { View, Pressable, ViewStyle, Platform } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme';

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    variant?: 'default' | 'outlined' | 'elevated';
    animated?: boolean;
    animationDelay?: number;
    animationType?: 'fade-down' | 'fade-right' | 'none';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
    children,
    onPress,
    style,
    variant = 'default',
    animated = true,
    animationDelay = 0,
    animationType = 'fade-down',
    padding = 'lg',
    borderRadius = 'lg',
}: CardProps) {
    const { colors } = useTheme();
    const scale = useSharedValue(1);

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
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 3,
                },
            }),
        },
    };

    // Hafif scale animasyonu - mevcut tasarımı bozmaz
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value, { damping: 15, stiffness: 400 }) }],
    }));

    const handlePressIn = () => {
        if (onPress) {
            scale.value = 0.98;
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            scale.value = 1;
        }
    };

    const cardStyle = [baseStyle, variantStyles[variant], style];

    const getEnteringAnimation = () => {
        if (animationType === 'none') return undefined;
        if (animationType === 'fade-right') {
            return FadeInRight.duration(300).delay(animationDelay);
        }
        return FadeInDown.duration(300).delay(animationDelay);
    };

    const content = onPress ? (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[cardStyle, animatedStyle]}
        >
            {children}
        </AnimatedPressable>
    ) : (
        <View style={cardStyle}>{children}</View>
    );

    if (animated && animationType !== 'none') {
        return (
            <Animated.View entering={getEnteringAnimation()}>
                {content}
            </Animated.View>
        );
    }

    return content;
}
