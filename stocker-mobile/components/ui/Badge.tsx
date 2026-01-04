import React, { useEffect } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
    label: string;
    variant?: BadgeVariant;
    size?: BadgeSize;
    icon?: React.ReactNode;
    style?: ViewStyle;
}

const sizeStyles = {
    sm: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        fontSize: 10,
        iconSize: 10,
    },
    md: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        fontSize: 11,
        iconSize: 12,
    },
    lg: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        fontSize: 12,
        iconSize: 14,
    },
};

export function Badge({
    label,
    variant = 'default',
    size = 'md',
    icon,
    style,
}: BadgeProps) {
    const { colors } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return {
                    backgroundColor: colors.semantic.successLight,
                    color: colors.semantic.success,
                    borderColor: 'transparent',
                };
            case 'warning':
                return {
                    backgroundColor: colors.semantic.warningLight,
                    color: colors.semantic.warning,
                    borderColor: 'transparent',
                };
            case 'error':
                return {
                    backgroundColor: colors.semantic.errorLight,
                    color: colors.semantic.error,
                    borderColor: 'transparent',
                };
            case 'info':
                return {
                    backgroundColor: colors.semantic.infoLight,
                    color: colors.semantic.info,
                    borderColor: 'transparent',
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    color: colors.text.secondary,
                    borderColor: colors.border.primary,
                };
            default:
                return {
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.secondary,
                    borderColor: 'transparent',
                };
        }
    };

    const variantStyles = getVariantStyles();
    const sizeStyle = sizeStyles[size];

    return (
        <View
            style={[
                {
                    backgroundColor: variantStyles.backgroundColor,
                    paddingHorizontal: sizeStyle.paddingHorizontal,
                    paddingVertical: sizeStyle.paddingVertical,
                    borderRadius: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    borderWidth: variant === 'outline' ? 1 : 0,
                    borderColor: variantStyles.borderColor,
                },
                style,
            ]}
        >
            {icon && <View style={{ marginRight: 4 }}>{icon}</View>}
            <Text
                style={{
                    color: variantStyles.color,
                    fontSize: sizeStyle.fontSize,
                    fontWeight: '600',
                }}
            >
                {label}
            </Text>
        </View>
    );
}

// Notification badge for icons with optional pulse animation
interface NotificationBadgeProps {
    count: number;
    max?: number;
    style?: ViewStyle;
    pulse?: boolean;
}

export function NotificationBadge({ count, max = 99, style, pulse = false }: NotificationBadgeProps) {
    const { colors } = useTheme();
    const scale = useSharedValue(1);

    useEffect(() => {
        if (pulse && count > 0) {
            scale.value = withRepeat(
                withSequence(
                    withSpring(1.15, { damping: 10, stiffness: 200 }),
                    withSpring(1, { damping: 10, stiffness: 200 })
                ),
                -1,
                false
            );
        } else {
            scale.value = 1;
        }
    }, [pulse, count]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    if (count <= 0) return null;

    const displayCount = count > max ? `${max}+` : count.toString();

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: colors.semantic.error,
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                },
                animatedStyle,
                style,
            ]}
        >
            <Text
                style={{
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: '700',
                }}
            >
                {displayCount}
            </Text>
        </Animated.View>
    );
}

// Live/Active indicator with pulse
interface PulseIndicatorProps {
    color?: string;
    size?: number;
    style?: ViewStyle;
}

export function PulseIndicator({ color, size = 8, style }: PulseIndicatorProps) {
    const { colors } = useTheme();
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.6);

    const indicatorColor = color || colors.semantic.success;

    useEffect(() => {
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.8, { duration: 1000 }),
                withTiming(1, { duration: 0 })
            ),
            -1,
            false
        );
        pulseOpacity.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 1000 }),
                withTiming(0.6, { duration: 0 })
            ),
            -1,
            false
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    return (
        <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: indicatorColor,
                    },
                    pulseStyle,
                ]}
            />
            <View
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: indicatorColor,
                }}
            />
        </View>
    );
}
