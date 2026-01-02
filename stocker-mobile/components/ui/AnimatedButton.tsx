import React from 'react';
import { Text, ActivityIndicator, Pressable, PressableProps, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedButtonProps extends PressableProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    size?: 'sm' | 'md' | 'lg';
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
    ...props
}: AnimatedButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15 });
    };

    const variants = {
        primary: {
            bg: 'bg-slate-900',
            bgActive: 'active:bg-slate-800',
            text: 'text-white',
            border: '',
            spinnerColor: '#ffffff',
        },
        secondary: {
            bg: 'bg-slate-100',
            bgActive: 'active:bg-slate-200',
            text: 'text-slate-900',
            border: 'border border-slate-200',
            spinnerColor: '#0f172a',
        },
        outline: {
            bg: 'bg-transparent',
            bgActive: 'active:bg-slate-50',
            text: 'text-slate-900',
            border: 'border-2 border-slate-900',
            spinnerColor: '#0f172a',
        },
        danger: {
            bg: 'bg-red-50',
            bgActive: 'active:bg-red-100',
            text: 'text-red-600',
            border: 'border border-red-200',
            spinnerColor: '#dc2626',
        },
        success: {
            bg: 'bg-emerald-500',
            bgActive: 'active:bg-emerald-600',
            text: 'text-white',
            border: '',
            spinnerColor: '#ffffff',
        },
    };

    const sizes = {
        sm: 'py-3',
        md: 'py-4',
        lg: 'py-5',
    };

    const v = variants[variant];
    const isDisabled = disabled || loading;

    return (
        <AnimatedPressable
            style={animatedStyle}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            disabled={isDisabled}
            className={`w-full ${sizes[size]} rounded-xl items-center justify-center flex-row ${v.bg} ${v.border} ${isDisabled ? 'opacity-50' : v.bgActive}`}
            {...props}
        >
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
