import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '@/lib/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AuroraBackgroundProps {
    children: React.ReactNode;
    variant?: 'default' | 'subtle' | 'vibrant';
    animated?: boolean;
}

export function AuroraBackground({
    children,
    variant = 'default',
    animated = true,
}: AuroraBackgroundProps) {
    const { isDark } = useTheme();
    // Animation values for floating effect
    const blob1X = useSharedValue(0);
    const blob1Y = useSharedValue(0);
    const blob2X = useSharedValue(0);
    const blob2Y = useSharedValue(0);

    // Breathing animation values
    const blob1Scale = useSharedValue(1);
    const blob2Scale = useSharedValue(1);
    const blob1Opacity = useSharedValue(1);
    const blob2Opacity = useSharedValue(1);

    useEffect(() => {
        if (animated) {
            // Blob 1 - Slow floating animation
            blob1X.value = withRepeat(
                withSequence(
                    withTiming(20, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(-20, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
            blob1Y.value = withRepeat(
                withSequence(
                    withTiming(-15, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(15, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );

            // Blob 2 - Different timing for organic feel
            blob2X.value = withRepeat(
                withSequence(
                    withTiming(-25, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(25, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 10000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
            blob2Y.value = withRepeat(
                withSequence(
                    withTiming(20, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(-20, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 7000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );

            // Breathing animation - scale pulsing
            blob1Scale.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.95, { duration: 4000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
            blob2Scale.value = withRepeat(
                withSequence(
                    withTiming(0.9, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1.1, { duration: 5000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );

            // Breathing animation - opacity pulsing
            blob1Opacity.value = withRepeat(
                withSequence(
                    withTiming(0.7, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
            blob2Opacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.6, { duration: 3500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        }
    }, [animated]);

    const animatedBlob1Style = useAnimatedStyle(() => ({
        transform: [
            { translateX: blob1X.value },
            { translateY: blob1Y.value },
            { scale: blob1Scale.value },
        ],
        opacity: blob1Opacity.value,
    }));

    const animatedBlob2Style = useAnimatedStyle(() => ({
        transform: [
            { translateX: blob2X.value },
            { translateY: blob2Y.value },
            { scale: blob2Scale.value },
        ],
        opacity: blob2Opacity.value,
    }));

    // Color configurations based on variant and theme
    const getColors = () => {
        if (isDark) {
            // Dark mode - more vibrant, glowing colors
            switch (variant) {
                case 'subtle':
                    return {
                        blob1: ['rgba(56, 189, 248, 0.2)', 'rgba(34, 211, 238, 0.12)', 'transparent'] as const,
                        blob2: ['rgba(129, 140, 248, 0.18)', 'rgba(167, 139, 250, 0.1)', 'transparent'] as const,
                    };
                case 'vibrant':
                    return {
                        blob1: ['rgba(56, 189, 248, 0.45)', 'rgba(34, 211, 238, 0.3)', 'transparent'] as const,
                        blob2: ['rgba(129, 140, 248, 0.4)', 'rgba(167, 139, 250, 0.25)', 'transparent'] as const,
                    };
                default:
                    return {
                        blob1: ['rgba(56, 189, 248, 0.3)', 'rgba(34, 211, 238, 0.2)', 'transparent'] as const,
                        blob2: ['rgba(129, 140, 248, 0.25)', 'rgba(167, 139, 250, 0.15)', 'transparent'] as const,
                    };
            }
        }

        // Light mode
        switch (variant) {
            case 'subtle':
                return {
                    blob1: ['rgba(14, 165, 233, 0.15)', 'rgba(6, 182, 212, 0.1)', 'transparent'] as const,
                    blob2: ['rgba(99, 102, 241, 0.12)', 'rgba(139, 92, 246, 0.08)', 'transparent'] as const,
                };
            case 'vibrant':
                return {
                    blob1: ['rgba(14, 165, 233, 0.35)', 'rgba(6, 182, 212, 0.25)', 'transparent'] as const,
                    blob2: ['rgba(99, 102, 241, 0.3)', 'rgba(139, 92, 246, 0.2)', 'transparent'] as const,
                };
            default:
                return {
                    blob1: ['rgba(14, 165, 233, 0.25)', 'rgba(6, 182, 212, 0.15)', 'transparent'] as const,
                    blob2: ['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.12)', 'transparent'] as const,
                };
        }
    };

    const blobColors = getColors();
    const backgroundColor = isDark ? '#0f172a' : '#ffffff';

    return (
        <View style={[styles.container, { backgroundColor }]}>
            {/* Background */}
            <View style={styles.background}>
                {/* Blob 1 - Top Left (Teal/Cyan) */}
                <Animated.View style={[styles.blob1Container, animatedBlob1Style]}>
                    <LinearGradient
                        colors={blobColors.blob1}
                        style={styles.blob}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                    />
                </Animated.View>

                {/* Blob 2 - Bottom Right (Indigo/Purple) */}
                <Animated.View style={[styles.blob2Container, animatedBlob2Style]}>
                    <LinearGradient
                        colors={blobColors.blob2}
                        style={styles.blob}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                    />
                </Animated.View>
            </View>

            {/* Content */}
            <View style={styles.content}>{children}</View>
        </View>
    );
}

const BLOB_SIZE = SCREEN_WIDTH * 1.2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    blob1Container: {
        position: 'absolute',
        top: -BLOB_SIZE * 0.4,
        left: -BLOB_SIZE * 0.3,
    },
    blob2Container: {
        position: 'absolute',
        bottom: -BLOB_SIZE * 0.4,
        right: -BLOB_SIZE * 0.3,
    },
    blob: {
        width: BLOB_SIZE,
        height: BLOB_SIZE,
        borderRadius: BLOB_SIZE / 2,
    },
    content: {
        flex: 1,
    },
});
