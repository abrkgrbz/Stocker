import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay,
    withSequence,
    Easing,
    interpolate,
    runOnJS,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SuccessAnimationProps {
    visible: boolean;
    onComplete?: () => void;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'check' | 'confetti' | 'both';
}

// Confetti particle component
function ConfettiParticle({
    delay,
    startX,
    startY,
    color,
    size,
}: {
    delay: number;
    startX: number;
    startY: number;
    color: string;
    size: number;
}) {
    const translateX = useSharedValue(startX);
    const translateY = useSharedValue(startY);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0);

    useEffect(() => {
        const targetX = startX + (Math.random() - 0.5) * 200;
        const targetY = startY + Math.random() * 300 + 100;

        opacity.value = withDelay(delay, withSequence(
            withTiming(1, { duration: 100 }),
            withDelay(800, withTiming(0, { duration: 400 }))
        ));

        scale.value = withDelay(delay, withSpring(1, { damping: 8, stiffness: 200 }));

        translateX.value = withDelay(delay, withTiming(targetX, {
            duration: 1200,
            easing: Easing.out(Easing.cubic),
        }));

        translateY.value = withDelay(delay, withTiming(targetY, {
            duration: 1200,
            easing: Easing.in(Easing.quad),
        }));

        rotate.value = withDelay(delay, withTiming(Math.random() * 720 - 360, {
            duration: 1200,
        }));
    }, []);

    const style = useAnimatedStyle(() => ({
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 4,
        backgroundColor: color,
        opacity: opacity.value,
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { rotate: `${rotate.value}deg` },
            { scale: scale.value },
        ],
    }));

    return <Animated.View style={style} />;
}

// Animated check mark component
function AnimatedCheck({ size }: { size: number }) {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const circleScale = useSharedValue(0);
    const checkProgress = useSharedValue(0);

    useEffect(() => {
        // Circle animation
        circleScale.value = withSpring(1, { damping: 12, stiffness: 150 });
        opacity.value = withTiming(1, { duration: 200 });

        // Check mark animation (delayed)
        scale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 180 }));
        checkProgress.value = withDelay(200, withTiming(1, {
            duration: 400,
            easing: Easing.out(Easing.cubic),
        }));
    }, []);

    const circleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: circleScale.value }],
        opacity: opacity.value,
    }));

    const checkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: interpolate(checkProgress.value, [0, 0.5, 1], [0, 0.5, 1]),
    }));

    return (
        <View style={[styles.checkContainer, { width: size, height: size }]}>
            {/* Background circle with pulse effect */}
            <Animated.View style={[styles.checkCircle, circleStyle, { width: size, height: size, borderRadius: size / 2 }]}>
                {/* Inner circle */}
                <View style={[styles.innerCircle, { width: size * 0.85, height: size * 0.85, borderRadius: size * 0.425 }]} />
            </Animated.View>

            {/* Check icon */}
            <Animated.View style={[styles.checkIcon, checkStyle]}>
                <Check size={size * 0.45} color="#ffffff" strokeWidth={3} />
            </Animated.View>
        </View>
    );
}

export function SuccessAnimation({
    visible,
    onComplete,
    size = 'md',
    variant = 'both',
}: SuccessAnimationProps) {
    const containerOpacity = useSharedValue(0);
    const containerScale = useSharedValue(0.8);

    const sizes = {
        sm: 60,
        md: 100,
        lg: 140,
    };

    const checkSize = sizes[size];

    useEffect(() => {
        if (visible) {
            containerOpacity.value = withTiming(1, { duration: 200 });
            containerScale.value = withSpring(1, { damping: 12, stiffness: 150 });

            // Call onComplete after animation
            if (onComplete) {
                setTimeout(() => {
                    runOnJS(onComplete)();
                }, 1500);
            }
        } else {
            containerOpacity.value = withTiming(0, { duration: 200 });
            containerScale.value = withTiming(0.8, { duration: 200 });
        }
    }, [visible]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
        transform: [{ scale: containerScale.value }],
    }));

    if (!visible) return null;

    // Generate confetti particles
    const confettiColors = ['#22c55e', '#10b981', '#6366f1', '#8b5cf6', '#f59e0b', '#ec4899'];
    const confettiParticles = variant !== 'check' ? Array.from({ length: 30 }, (_, i) => ({
        id: i,
        delay: Math.random() * 200,
        startX: SCREEN_WIDTH / 2 - 5,
        startY: SCREEN_HEIGHT / 2 - checkSize / 2,
        color: confettiColors[i % confettiColors.length],
        size: Math.random() * 8 + 4,
    })) : [];

    return (
        <View style={styles.overlay} pointerEvents="none">
            {/* Confetti particles */}
            {variant !== 'check' && confettiParticles.map((particle) => (
                <ConfettiParticle key={particle.id} {...particle} />
            ))}

            {/* Check mark */}
            {variant !== 'confetti' && (
                <Animated.View style={[styles.centerContainer, containerStyle]}>
                    <AnimatedCheck size={checkSize} />
                </Animated.View>
            )}
        </View>
    );
}

// Simpler success check for inline use
interface SuccessCheckProps {
    visible: boolean;
    size?: number;
}

export function SuccessCheck({ visible, size = 24 }: SuccessCheckProps) {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            scale.value = withSpring(1, { damping: 10, stiffness: 200 });
            opacity.value = withTiming(1, { duration: 150 });
        } else {
            scale.value = withSpring(0, { damping: 15 });
            opacity.value = withTiming(0, { duration: 100 });
        }
    }, [visible]);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                style,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: '#22c55e',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
            ]}
        >
            <Check size={size * 0.6} color="#ffffff" strokeWidth={3} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkCircle: {
        backgroundColor: '#22c55e',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    innerCircle: {
        backgroundColor: '#22c55e',
        position: 'absolute',
    },
    checkIcon: {
        position: 'absolute',
    },
});
