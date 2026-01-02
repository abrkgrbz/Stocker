import { router } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInUp } from 'react-native-reanimated';
import { authStorage } from '@/lib/auth-store';
import { Logo } from '@/components/ui/Logo';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

// Testimonial data - from stocker-nextjs
const TESTIMONIALS = [
    {
        id: 1,
        quote: "Stoocker ile stok yönetimimiz tamamen değişti.",
        author: "Ahmet Yılmaz",
        role: "Operasyon Müdürü",
        initials: "AY",
    },
    {
        id: 2,
        quote: "Envanter takibi hiç bu kadar kolay olmamıştı.",
        author: "Elif Demir",
        role: "Satın Alma Direktörü",
        initials: "ED",
    },
];

export default function LandingScreen() {
    const [checking, setChecking] = useState(true);
    const [testimonialIndex, setTestimonialIndex] = useState(0);

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

    // Testimonial slider
    useEffect(() => {
        const interval = setInterval(() => {
            setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    if (checking) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Animated.View entering={FadeIn.duration(300)}>
                    <View className="w-16 h-16 bg-slate-900 rounded-2xl items-center justify-center">
                        <Text className="text-white text-2xl font-bold">S</Text>
                    </View>
                </Animated.View>
            </SafeAreaView>
        );
    }

    const currentTestimonial = TESTIMONIALS[testimonialIndex];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 justify-between py-8">
                {/* Top Section - Logo */}
                <View className="items-center pt-12">
                    <Logo size="xl" variant="color" />
                </View>

                {/* Middle Section - Testimonial */}
                <Animated.View
                    entering={FadeInUp.duration(800).delay(400)}
                    className="bg-slate-50 rounded-2xl p-6 mx-2"
                >
                    {/* Quote Icon */}
                    <View className="mb-4">
                        <Text className="text-slate-300 text-4xl font-serif">"</Text>
                    </View>

                    <Text className="text-slate-700 text-lg leading-relaxed mb-6">
                        {currentTestimonial.quote}
                    </Text>

                    <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-slate-900 rounded-full items-center justify-center mr-3">
                            <Text className="text-white font-semibold">{currentTestimonial.initials}</Text>
                        </View>
                        <View>
                            <Text className="text-slate-900 font-medium">{currentTestimonial.author}</Text>
                            <Text className="text-slate-500 text-sm">{currentTestimonial.role}</Text>
                        </View>
                    </View>

                    {/* Dots */}
                    <View className="flex-row items-center justify-center mt-6" style={{ gap: 6 }}>
                        {TESTIMONIALS.map((_, i) => (
                            <View
                                key={i}
                                className={`h-1.5 rounded-full ${i === testimonialIndex ? 'w-6 bg-slate-900' : 'w-1.5 bg-slate-300'}`}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Bottom Section - CTA Buttons */}
                <Animated.View
                    entering={SlideInUp.duration(600).delay(600)}
                    className="pb-4"
                    style={{ gap: 12 }}
                >
                    <AnimatedButton
                        title="Giriş Yap"
                        variant="primary"
                        onPress={() => router.push('/(auth)/login')}
                    />

                    <AnimatedButton
                        title="Hesap Oluştur"
                        variant="secondary"
                        onPress={() => router.push('/(auth)/register')}
                    />

                    {/* Stats */}
                    <View className="flex-row justify-center items-center mt-4" style={{ gap: 24 }}>
                        <View className="items-center">
                            <Text className="text-slate-900 font-bold text-lg">2,500+</Text>
                            <Text className="text-slate-500 text-xs">İşletme</Text>
                        </View>
                        <View className="w-px h-8 bg-slate-200" />
                        <View className="items-center">
                            <Text className="text-slate-900 font-bold text-lg">99.9%</Text>
                            <Text className="text-slate-500 text-xs">Uptime</Text>
                        </View>
                        <View className="w-px h-8 bg-slate-200" />
                        <View className="items-center">
                            <Text className="text-slate-900 font-bold text-lg">4.9/5</Text>
                            <Text className="text-slate-500 text-xs">Puan</Text>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}
