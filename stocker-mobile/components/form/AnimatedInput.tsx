import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, Pressable, TextInputProps, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    interpolateColor,
    Easing,
} from 'react-native-reanimated';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react-native';

const AnimatedView = Animated.createAnimatedComponent(View);

interface AnimatedInputProps extends Omit<TextInputProps, 'style'> {
    label: string;
    error?: string;
    success?: boolean;
    icon?: React.ReactNode;
    showPasswordToggle?: boolean;
}

export function AnimatedInput({
    label,
    error,
    success,
    icon,
    showPasswordToggle,
    secureTextEntry,
    value,
    onFocus,
    onBlur,
    ...props
}: AnimatedInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Animation values
    const focusAnimation = useSharedValue(0);
    const labelPosition = useSharedValue(value ? 1 : 0);
    const borderWidth = useSharedValue(1.5);
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    useEffect(() => {
        if (isFocused || value) {
            labelPosition.value = withSpring(1, { damping: 15, stiffness: 150 });
        } else {
            labelPosition.value = withSpring(0, { damping: 15, stiffness: 150 });
        }
    }, [isFocused, value]);

    useEffect(() => {
        if (isFocused) {
            focusAnimation.value = withSpring(1, { damping: 12, stiffness: 180 });
            borderWidth.value = withTiming(2, { duration: 200 });
            scale.value = withSpring(1.01, { damping: 15, stiffness: 200 });
            glowOpacity.value = withTiming(1, { duration: 300 });
        } else {
            focusAnimation.value = withSpring(0, { damping: 12, stiffness: 180 });
            borderWidth.value = withTiming(1.5, { duration: 200 });
            scale.value = withSpring(1, { damping: 15, stiffness: 200 });
            glowOpacity.value = withTiming(0, { duration: 200 });
        }
    }, [isFocused]);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    // Animated styles
    const containerStyle = useAnimatedStyle(() => {
        const borderColor = error
            ? '#ef4444'
            : success
            ? '#22c55e'
            : interpolateColor(
                  focusAnimation.value,
                  [0, 1],
                  ['rgba(255, 255, 255, 0.3)', '#6366f1']
              );

        return {
            borderColor,
            borderWidth: borderWidth.value,
            transform: [{ scale: scale.value }],
        };
    });

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [
            { scale: interpolate(glowOpacity.value, [0, 1], [0.95, 1.02]) },
        ],
    }));

    const labelStyle = useAnimatedStyle(() => {
        const translateY = interpolate(labelPosition.value, [0, 1], [0, -28]);
        const fontSize = interpolate(labelPosition.value, [0, 1], [16, 12]);
        const color = error
            ? '#ef4444'
            : success
            ? '#22c55e'
            : interpolateColor(
                  focusAnimation.value,
                  [0, 1],
                  ['#94a3b8', '#6366f1']
              );

        return {
            transform: [{ translateY }],
            fontSize,
            color,
        };
    });

    const iconColor = error ? '#ef4444' : success ? '#22c55e' : isFocused ? '#6366f1' : '#94a3b8';

    return (
        <View style={styles.wrapper}>
            {/* Glow effect */}
            <AnimatedView
                style={[
                    styles.glow,
                    glowStyle,
                    { borderColor: error ? '#ef4444' : '#6366f1' },
                ]}
            />

            {/* Main container */}
            <AnimatedView style={[styles.container, containerStyle]}>
                {/* Floating Label */}
                <Animated.Text style={[styles.label, labelStyle]}>
                    {label}
                </Animated.Text>

                <View style={styles.inputRow}>
                    {/* Left Icon */}
                    {icon && <View style={styles.leftIcon}>{icon}</View>}

                    {/* Input */}
                    <TextInput
                        ref={inputRef}
                        style={[
                            styles.input,
                            icon ? { paddingLeft: 8 } : undefined,
                            (showPasswordToggle || success || error) ? { paddingRight: 40 } : undefined,
                        ]}
                        value={value}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        secureTextEntry={secureTextEntry && !isPasswordVisible}
                        placeholderTextColor="transparent"
                        {...props}
                    />

                    {/* Right Icons */}
                    <View style={styles.rightIcons}>
                        {success && !error && (
                            <Animated.View entering={require('react-native-reanimated').ZoomIn.duration(200)}>
                                <Check size={20} color="#22c55e" />
                            </Animated.View>
                        )}
                        {error && (
                            <Animated.View entering={require('react-native-reanimated').ZoomIn.duration(200)}>
                                <AlertCircle size={20} color="#ef4444" />
                            </Animated.View>
                        )}
                        {showPasswordToggle && (
                            <Pressable
                                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                {isPasswordVisible ? (
                                    <EyeOff size={20} color={iconColor} />
                                ) : (
                                    <Eye size={20} color={iconColor} />
                                )}
                            </Pressable>
                        )}
                    </View>
                </View>
            </AnimatedView>

            {/* Error message */}
            {error && (
                <Animated.Text
                    entering={require('react-native-reanimated').FadeInDown.duration(200)}
                    style={styles.errorText}
                >
                    {error}
                </Animated.Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 20,
    },
    glow: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 18,
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 12,
        minHeight: 64,
    },
    label: {
        position: 'absolute',
        left: 16,
        top: 20,
        backgroundColor: 'transparent',
        fontWeight: '500',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0f172a',
        padding: 0,
        margin: 0,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
});
