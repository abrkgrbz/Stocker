import { router } from 'expo-router';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';
import Animated, {
    FadeIn,
    FadeInDown,
    SlideInUp,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { authStorage } from '@/lib/auth-store';
import { Logo } from '@/components/ui/Logo';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { ValueCarousel } from '@/components/landing/ValueCarousel';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GlassCard } from '@/components/ui/GlassContainer';

// Animated Counter Component
interface AnimatedCounterProps {
    value: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
    delay?: number;
    decimals?: number;
}

function AnimatedCounter({
    value,
    suffix = '',
    prefix = '',
    duration = 2000,
    delay = 0,
    decimals = 0,
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const animatedValue = useSharedValue(0);

    const updateDisplay = useCallback((val: number) => {
        setDisplayValue(val);
    }, []);

    useEffect(() => {
        animatedValue.value = withDelay(
            delay,
            withTiming(value, {
                duration,
                easing: Easing.out(Easing.cubic),
            })
        );

        // Update display value during animation
        const interval = setInterval(() => {
            const current = animatedValue.value;
            runOnJS(updateDisplay)(Math.round(current * Math.pow(10, decimals)) / Math.pow(10, decimals));
        }, 16);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            setDisplayValue(value);
        }, duration + delay + 100);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [value, duration, delay, decimals]);

    const formatValue = () => {
        if (decimals > 0) {
            return displayValue.toFixed(decimals);
        }
        return displayValue.toLocaleString();
    };

    return (
        <Text className="text-slate-900 font-bold text-lg">
            {prefix}{formatValue()}{suffix}
        </Text>
    );
}

export default function LandingScreen() {
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Oturum kontrolü
        const checkAuth = async () => {
            try {
                const state = await authStorage.getAuthState();
                if (state.isAuthenticated) {
                    router.replace('/(dashboard)');
                    return;
                }
            } catch (e) {
                console.error(e);
            } finally {
                setChecking(false);
            }
        };
        checkAuth();
    }, []);

    if (checking) {
        return (
            <AuroraBackground variant="subtle">
                <SafeAreaView className="flex-1 items-center justify-center">
                    <Animated.View entering={FadeIn.duration(300)}>
                        <View className="w-16 h-16 bg-slate-900 rounded-2xl items-center justify-center">
                            <Text className="text-white text-2xl font-bold">S</Text>
                        </View>
                    </Animated.View>
                </SafeAreaView>
            </AuroraBackground>
        );
    }

    return (
        <AuroraBackground variant="default">
            <SafeAreaView className="flex-1">
                <View className="flex-1 px-6 py-4">
                    {/* Top Section - Logo + Value Carousel */}
                    <View className="flex-1 justify-center" style={{ gap: 6 }}>
                        <Animated.View
                            entering={FadeInDown.duration(600).delay(100)}
                            className="items-center"
                        >
                            <Logo size="2xl" variant="color" showText={false} />
                        </Animated.View>

                        {/* Value Carousel */}
                        <Animated.View entering={FadeIn.duration(800).delay(400)}>
                            <View
                                style={{
                                    shadowColor: '#6366f1',
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 24,
                                    elevation: 8,
                                }}
                            >
                                <GlassCard padding={24} style={{ borderRadius: 28 }}>
                                    <ValueCarousel autoPlayInterval={4000} showIcon={true} />
                                </GlassCard>
                            </View>
                        </Animated.View>
                    </View>

                    {/* Bottom Section - CTA Buttons */}
                    <Animated.View
                        entering={SlideInUp.duration(600).delay(600)}
                        className="pb-4"
                        style={{ gap: 16 }}
                    >
                        {/* Buttons side by side */}
                        <View className="flex-row" style={{ gap: 12 }}>
                            <View className="flex-1">
                                <AnimatedButton
                                    title="Giriş Yap"
                                    variant="primary"
                                    onPress={() => router.push('/(auth)/login')}
                                />
                            </View>
                            <View className="flex-1">
                                <AnimatedButton
                                    title="Hesap Oluştur"
                                    variant="secondary"
                                    onPress={() => router.push('/(auth)/register')}
                                />
                            </View>
                        </View>

                        {/* Stats with soft shadow */}
                        <View
                            style={{
                                shadowColor: '#6366f1',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 16,
                                elevation: 4,
                            }}
                        >
                            <GlassCard padding={16} style={{ borderRadius: 20 }}>
                                <View className="flex-row justify-center items-center" style={{ gap: 24 }}>
                                    <View className="items-center">
                                        <AnimatedCounter
                                            value={2500}
                                            suffix="+"
                                            duration={2000}
                                            delay={800}
                                        />
                                        <Text className="text-slate-400 text-xs">İşletme</Text>
                                    </View>
                                    <View className="w-px h-8 bg-slate-200" />
                                    <View className="items-center">
                                        <AnimatedCounter
                                            value={99.9}
                                            suffix="%"
                                            duration={1800}
                                            delay={1000}
                                            decimals={1}
                                        />
                                        <Text className="text-slate-400 text-xs">Uptime</Text>
                                    </View>
                                    <View className="w-px h-8 bg-slate-200" />
                                    <View className="items-center">
                                        <AnimatedCounter
                                            value={4.9}
                                            suffix="/5"
                                            duration={1600}
                                            delay={1200}
                                            decimals={1}
                                        />
                                        <Text className="text-slate-400 text-xs">Puan</Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </View>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </AuroraBackground>
    );
}
