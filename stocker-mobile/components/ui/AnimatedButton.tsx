import React, { useState } from 'react';
import { Text, ActivityIndicator, Pressable, PressableProps, View, GestureResponderEvent, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
    Easing,
} from 'react-native-reanimated';
import { lightHaptic } from '@/lib/haptics';
import { useReducedMotion, MIN_TOUCH_TARGET } from '@/lib/accessibility';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Ripple effect component
interface RippleProps {
    x: number;
    y: number;
    size: number;
    color: string;
    onComplete: () => void;
}

function Ripple({ x, y, size, color, onComplete }: RippleProps) {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0.3);

    React.useEffect(() => {
        scale.value = withTiming(1, {
            duration: 400,
            easing: Easing.out(Easing.cubic),
        });
        opacity.value = withTiming(0, {
            duration: 400,
            easing: Easing.out(Easing.cubic),
        }, () => {
            runOnJS(onComplete)();
        });
    }, []);

    const style = useAnimatedStyle(() => ({
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return <Animated.View style={style} />;
}

interface AnimatedButtonProps extends PressableProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    size?: 'sm' | 'md' | 'lg';
    haptic?: boolean;
    /** Accessibility label override (defaults to title) */
    accessibilityLabel?: string;
    /** Accessibility hint describing what happens when pressed */
    accessibilityHint?: string;
}

export function AnimatedButton({
    title,
    variant = 'primary',
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    size = 'md',
    onPress,
    haptic = true,
    accessibilityLabel,
    accessibilityHint,
    ...props
}: AnimatedButtonProps) {
    const scale = useSharedValue(1);
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
    const [buttonDimensions, setButtonDimensions] = useState({ width: 0, height: 0 });
    const rippleIdRef = React.useRef(0);
    const reduceMotion = useReducedMotion();

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (e: GestureResponderEvent) => {
        // Skip animations if reduce motion is enabled
        if (!reduceMotion) {
            scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });

            // Add ripple effect
            const { locationX, locationY } = e.nativeEvent;
            const newRipple = {
                id: rippleIdRef.current++,
                x: locationX,
                y: locationY,
            };
            setRipples((prev) => [...prev, newRipple]);
        }
    };

    const handlePressOut = () => {
        if (!reduceMotion) {
            scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }
    };

    const handlePress = (e: GestureResponderEvent) => {
        if (haptic) {
            lightHaptic();
        }
        onPress?.(e);
    };

    const handleLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        setButtonDimensions({ width, height });
    };

    const removeRipple = (id: number) => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    };

    const variants = {
        primary: {
            bg: 'bg-slate-900',
            bgActive: 'active:bg-slate-800',
            text: 'text-white',
            border: '',
            spinnerColor: '#ffffff',
            rippleColor: 'rgba(255, 255, 255, 0.3)',
        },
        secondary: {
            bg: 'bg-slate-100',
            bgActive: 'active:bg-slate-200',
            text: 'text-slate-900',
            border: 'border border-slate-200',
            spinnerColor: '#0f172a',
            rippleColor: 'rgba(15, 23, 42, 0.15)',
        },
        outline: {
            bg: 'bg-transparent',
            bgActive: 'active:bg-slate-50',
            text: 'text-slate-900',
            border: 'border-2 border-slate-900',
            spinnerColor: '#0f172a',
            rippleColor: 'rgba(15, 23, 42, 0.1)',
        },
        danger: {
            bg: 'bg-red-50',
            bgActive: 'active:bg-red-100',
            text: 'text-red-600',
            border: 'border border-red-200',
            spinnerColor: '#dc2626',
            rippleColor: 'rgba(220, 38, 38, 0.2)',
        },
        success: {
            bg: 'bg-emerald-500',
            bgActive: 'active:bg-emerald-600',
            text: 'text-white',
            border: '',
            spinnerColor: '#ffffff',
            rippleColor: 'rgba(255, 255, 255, 0.3)',
        },
    };

    const sizes = {
        sm: 'py-3',
        md: 'py-4',
        lg: 'py-5',
    };

    const v = variants[variant];
    const isDisabled = disabled || loading;
    const rippleSize = Math.max(buttonDimensions.width, buttonDimensions.height) * 2;

    // Generate accessibility label
    const a11yLabel = accessibilityLabel || title;
    const a11yState = loading ? 'Yükleniyor' : '';
    const fullA11yLabel = a11yState ? `${a11yLabel}, ${a11yState}` : a11yLabel;

    return (
        <AnimatedPressable
            style={[
                animatedStyle,
                isDisabled && { opacity: 0.5 },
                styles.button,
            ]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            onLayout={handleLayout}
            disabled={isDisabled}
            className={`w-full ${sizes[size]} rounded-2xl items-center justify-center flex-row ${v.bg} ${v.border} ${isDisabled ? '' : v.bgActive}`}
            // Accessibility props
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={fullA11yLabel}
            accessibilityHint={accessibilityHint}
            accessibilityState={{
                disabled: isDisabled,
                busy: loading,
            }}
            {...props}
        >
            {/* Ripple effects */}
            {ripples.map((ripple) => (
                <Ripple
                    key={ripple.id}
                    x={ripple.x}
                    y={ripple.y}
                    size={rippleSize}
                    color={v.rippleColor}
                    onComplete={() => removeRipple(ripple.id)}
                />
            ))}

            {loading ? (
                <ActivityIndicator color={v.spinnerColor} />
            ) : (
                <View className="flex-row items-center" style={{ gap: 8 }}>
                    {icon && iconPosition === 'left' && icon}
                    <Text className={`font-semibold text-base ${v.text}`}>{title}</Text>
                    {icon && iconPosition === 'right' && icon}
                </View>
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    button: {
        overflow: 'hidden',
        minHeight: MIN_TOUCH_TARGET, // WCAG minimum touch target
    },
});
