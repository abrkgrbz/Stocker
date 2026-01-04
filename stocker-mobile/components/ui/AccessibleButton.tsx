import React from 'react';
import { Pressable, Text, View, ActivityIndicator, StyleSheet, AccessibilityRole } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { useReducedMotion, announceForAccessibility, MIN_TOUCH_TARGET } from '@/lib/accessibility';
import { lightHaptic } from '@/lib/haptics';
import { useTheme } from '@/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AccessibleButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    accessibilityHint?: string;
    accessibilityRole?: AccessibilityRole;
    haptic?: boolean;
    fullWidth?: boolean;
    announceOnPress?: string;
}

export function AccessibleButton({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    accessibilityHint,
    accessibilityRole = 'button',
    haptic = true,
    fullWidth = true,
    announceOnPress,
}: AccessibleButtonProps) {
    const { isDark } = useTheme();
    const reduceMotion = useReducedMotion();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: reduceMotion ? [] : [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (!reduceMotion) {
            scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
        }
    };

    const handlePressOut = () => {
        if (!reduceMotion) {
            scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }
    };

    const handlePress = () => {
        if (haptic) {
            lightHaptic();
        }
        if (announceOnPress) {
            announceForAccessibility(announceOnPress);
        }
        onPress();
    };

    const isDisabled = disabled || loading;

    // Get variant styles
    const getVariantStyles = () => {
        const variants = {
            primary: {
                bg: isDark ? '#f8fafc' : '#0f172a',
                text: isDark ? '#0f172a' : '#ffffff',
                spinner: isDark ? '#0f172a' : '#ffffff',
            },
            secondary: {
                bg: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9',
                text: isDark ? '#f8fafc' : '#0f172a',
                spinner: isDark ? '#f8fafc' : '#0f172a',
            },
            outline: {
                bg: 'transparent',
                text: isDark ? '#f8fafc' : '#0f172a',
                spinner: isDark ? '#f8fafc' : '#0f172a',
                border: isDark ? '#475569' : '#0f172a',
            },
            danger: {
                bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2',
                text: isDark ? '#fca5a5' : '#dc2626',
                spinner: isDark ? '#fca5a5' : '#dc2626',
            },
            ghost: {
                bg: 'transparent',
                text: isDark ? '#f8fafc' : '#0f172a',
                spinner: isDark ? '#f8fafc' : '#0f172a',
            },
        };
        return variants[variant];
    };

    const getSizeStyles = () => {
        const sizes = {
            sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
            md: { paddingVertical: 14, paddingHorizontal: 20, fontSize: 16 },
            lg: { paddingVertical: 18, paddingHorizontal: 24, fontSize: 18 },
        };
        return sizes[size];
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isDisabled}
            accessible={true}
            accessibilityLabel={loading ? `${title}, yükleniyor` : title}
            accessibilityHint={accessibilityHint}
            accessibilityRole={accessibilityRole}
            accessibilityState={{
                disabled: isDisabled,
                busy: loading,
            }}
            style={[
                styles.button,
                animatedStyle,
                {
                    backgroundColor: variantStyles.bg,
                    paddingVertical: sizeStyles.paddingVertical,
                    paddingHorizontal: sizeStyles.paddingHorizontal,
                    minHeight: MIN_TOUCH_TARGET,
                    opacity: isDisabled ? 0.5 : 1,
                    width: fullWidth ? '100%' : 'auto',
                    borderWidth: variant === 'outline' ? 2 : 0,
                    borderColor: variantStyles.border,
                },
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variantStyles.spinner} />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' && (
                        <View style={styles.iconLeft}>{icon}</View>
                    )}
                    <Text
                        style={[
                            styles.text,
                            {
                                color: variantStyles.text,
                                fontSize: sizeStyles.fontSize,
                            },
                        ]}
                    >
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && (
                        <View style={styles.iconRight}>{icon}</View>
                    )}
                </View>
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
});
