import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withSpring,
    withTiming,
    interpolateColor,
    useAnimatedStyle,
    Easing,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { Check, X, AlertTriangle, Shield } from 'lucide-react-native';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PasswordStrengthIndicatorProps {
    password: string;
    size?: number;
    strokeWidth?: number;
    showLabel?: boolean;
}

interface StrengthResult {
    score: number; // 0-4
    label: string;
    color: string;
    checks: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        number: boolean;
        special: boolean;
    };
}

function calculatePasswordStrength(password: string): StrengthResult {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    let score = 0;
    let label = 'Çok Zayıf';
    let color = '#ef4444';

    if (passedChecks === 0 || password.length === 0) {
        score = 0;
        label = 'Şifre Girin';
        color = '#94a3b8';
    } else if (passedChecks === 1) {
        score = 1;
        label = 'Çok Zayıf';
        color = '#ef4444';
    } else if (passedChecks === 2) {
        score = 2;
        label = 'Zayıf';
        color = '#f97316';
    } else if (passedChecks === 3) {
        score = 3;
        label = 'Orta';
        color = '#eab308';
    } else if (passedChecks === 4) {
        score = 4;
        label = 'Güçlü';
        color = '#22c55e';
    } else {
        score = 5;
        label = 'Çok Güçlü';
        color = '#10b981';
    }

    return { score, label, color, checks };
}

export function PasswordStrengthIndicator({
    password,
    size = 80,
    strokeWidth = 6,
    showLabel = true,
}: PasswordStrengthIndicatorProps) {
    const strength = calculatePasswordStrength(password);
    const progress = useSharedValue(0);
    const colorProgress = useSharedValue(0);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        const targetProgress = strength.score / 5;
        progress.value = withSpring(targetProgress, {
            damping: 15,
            stiffness: 100,
        });
        colorProgress.value = withTiming(strength.score, {
            duration: 300,
            easing: Easing.out(Easing.cubic),
        });
    }, [strength.score]);

    const animatedCircleProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    const iconContainerStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: withSpring(password.length > 0 ? 1 : 0.8, { damping: 15 }) },
        ],
        opacity: withTiming(password.length > 0 ? 1 : 0.5, { duration: 200 }),
    }));

    const getIcon = () => {
        if (password.length === 0) {
            return <Shield size={size * 0.35} color="#94a3b8" />;
        }
        if (strength.score <= 1) {
            return <X size={size * 0.35} color={strength.color} />;
        }
        if (strength.score <= 2) {
            return <AlertTriangle size={size * 0.35} color={strength.color} />;
        }
        return <Check size={size * 0.35} color={strength.color} />;
    };

    return (
        <View style={styles.container}>
            {/* Circular Progress */}
            <View style={[styles.circleContainer, { width: size, height: size }]}>
                <Svg width={size} height={size}>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        {/* Background Circle */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="rgba(148, 163, 184, 0.2)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        {/* Progress Circle */}
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={strength.color}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circumference}
                            animatedProps={animatedCircleProps}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>

                {/* Center Icon */}
                <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
                    {getIcon()}
                </Animated.View>
            </View>

            {/* Label and Checks */}
            {showLabel && (
                <View style={styles.labelContainer}>
                    <Text style={[styles.label, { color: strength.color }]}>
                        {strength.label}
                    </Text>

                    {/* Check items */}
                    <View style={styles.checksContainer}>
                        <CheckItem
                            label="8+ karakter"
                            checked={strength.checks.length}
                        />
                        <CheckItem
                            label="Büyük harf"
                            checked={strength.checks.uppercase}
                        />
                        <CheckItem
                            label="Küçük harf"
                            checked={strength.checks.lowercase}
                        />
                        <CheckItem
                            label="Rakam"
                            checked={strength.checks.number}
                        />
                        <CheckItem
                            label="Özel karakter"
                            checked={strength.checks.special}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

// Compact version for inline use
interface PasswordStrengthBarProps {
    password: string;
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
    const strength = calculatePasswordStrength(password);
    const width = useSharedValue(0);

    useEffect(() => {
        width.value = withSpring((strength.score / 5) * 100, {
            damping: 15,
            stiffness: 100,
        });
    }, [strength.score]);

    const barStyle = useAnimatedStyle(() => ({
        width: `${width.value}%`,
    }));

    if (password.length === 0) return null;

    return (
        <View style={styles.barContainer}>
            <View style={styles.barBackground}>
                <Animated.View
                    style={[
                        styles.barFill,
                        barStyle,
                        { backgroundColor: strength.color },
                    ]}
                />
            </View>
            <Text style={[styles.barLabel, { color: strength.color }]}>
                {strength.label}
            </Text>
        </View>
    );
}

// Check item component
function CheckItem({ label, checked }: { label: string; checked: boolean }) {
    const opacity = useSharedValue(0.4);
    const scale = useSharedValue(0.9);

    useEffect(() => {
        opacity.value = withTiming(checked ? 1 : 0.4, { duration: 200 });
        scale.value = withSpring(checked ? 1 : 0.9, { damping: 15 });
    }, [checked]);

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.checkItem, style]}>
            <View
                style={[
                    styles.checkDot,
                    { backgroundColor: checked ? '#22c55e' : '#94a3b8' },
                ]}
            />
            <Text
                style={[
                    styles.checkLabel,
                    { color: checked ? '#0f172a' : '#94a3b8' },
                ]}
            >
                {label}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    circleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelContainer: {
        alignItems: 'center',
        marginTop: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    checksContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    checkDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    checkLabel: {
        fontSize: 11,
    },
    barContainer: {
        marginTop: 8,
    },
    barBackground: {
        height: 4,
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 2,
    },
    barLabel: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'right',
    },
});
