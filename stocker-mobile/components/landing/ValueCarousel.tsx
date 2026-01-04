import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInUp,
    SlideOutDown,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    interpolate,
    withSpring,
} from 'react-native-reanimated';
import { Package, TrendingUp, Shield } from 'lucide-react-native';
import { selectionHaptic } from '@/lib/haptics';

interface ValueSlide {
    id: number;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ size: number; color: string }>;
}

const VALUE_SLIDES: ValueSlide[] = [
    {
        id: 1,
        title: 'İşletmenizi Tek Yerden Yönetin',
        subtitle: 'CRM, Stok ve Ön Muhasebe tek çatı altında.',
        icon: Package,
    },
    {
        id: 2,
        title: 'Stoklarınız Kontrol Altında',
        subtitle: 'Depo ve envanter takibi hiç bu kadar kolay olmamıştı.',
        icon: TrendingUp,
    },
    {
        id: 3,
        title: 'Güvenilir Altyapı',
        subtitle: '%99.9 Uptime ve güvenli bulut yedekleme.',
        icon: Shield,
    },
];

// Animated Progress Dot Component
interface ProgressDotProps {
    isActive: boolean;
    progress: number; // 0 to 1
    onPress: () => void;
}

function ProgressDot({ isActive, progress, onPress }: ProgressDotProps) {
    const scale = useSharedValue(1);
    const width = useSharedValue(isActive ? 24 : 8);

    useEffect(() => {
        width.value = withSpring(isActive ? 24 : 8, {
            damping: 15,
            stiffness: 150,
        });
        scale.value = withSpring(isActive ? 1 : 0.9, {
            damping: 15,
            stiffness: 150,
        });
    }, [isActive]);

    const dotStyle = useAnimatedStyle(() => ({
        width: width.value,
        transform: [{ scale: scale.value }],
    }));

    const progressStyle = useAnimatedStyle(() => ({
        width: isActive ? `${progress * 100}%` : '0%',
    }));

    return (
        <Pressable
            onPress={onPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Animated.View
                style={[
                    dotStyle,
                    {
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: isActive ? 'rgba(15, 23, 42, 0.2)' : 'rgba(148, 163, 184, 0.5)',
                        overflow: 'hidden',
                    },
                ]}
            >
                {isActive && (
                    <Animated.View
                        style={[
                            progressStyle,
                            {
                                height: '100%',
                                backgroundColor: '#0f172a',
                                borderRadius: 4,
                            },
                        ]}
                    />
                )}
            </Animated.View>
        </Pressable>
    );
}

interface ValueCarouselProps {
    autoPlayInterval?: number;
    showIcon?: boolean;
}

export function ValueCarousel({ autoPlayInterval = 4000, showIcon = true }: ValueCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [key, setKey] = useState(0);
    const [progress, setProgress] = useState(0);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    // Auto-rotate slides with progress tracking
    useEffect(() => {
        // Reset progress when slide changes
        setProgress(0);

        // Clear existing interval
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }

        // Update progress every 50ms for smooth animation
        const updateRate = 50;
        const steps = autoPlayInterval / updateRate;
        let currentStep = 0;

        progressInterval.current = setInterval(() => {
            currentStep++;
            setProgress(currentStep / steps);

            if (currentStep >= steps) {
                setCurrentIndex((prev) => (prev + 1) % VALUE_SLIDES.length);
                setKey((prev) => prev + 1);
                currentStep = 0;
                setProgress(0);
            }
        }, updateRate);

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [currentIndex, autoPlayInterval]);

    const currentSlide = VALUE_SLIDES[currentIndex];
    const IconComponent = currentSlide.icon;

    const handleDotPress = (index: number) => {
        selectionHaptic();
        setCurrentIndex(index);
        setKey((prev) => prev + 1);
        setProgress(0);
    };

    return (
        <View className="items-center py-6">
            {/* Content */}
            <Animated.View
                key={key}
                entering={FadeIn.duration(400).springify()}
                exiting={FadeOut.duration(200)}
                className="items-center px-4"
            >
                {/* Icon */}
                {showIcon && (
                    <Animated.View
                        entering={SlideInUp.duration(300).delay(100)}
                        className="w-14 h-14 bg-slate-100 rounded-2xl items-center justify-center mb-4"
                    >
                        <IconComponent size={28} color="#0f172a" />
                    </Animated.View>
                )}

                {/* Title */}
                <Text className="text-xl font-bold text-slate-900 text-center mb-2">
                    {currentSlide.title}
                </Text>

                {/* Subtitle */}
                <Text className="text-sm text-slate-500 text-center leading-relaxed">
                    {currentSlide.subtitle}
                </Text>
            </Animated.View>

            {/* Animated Progress Dot Indicators */}
            <View className="flex-row items-center justify-center mt-6" style={{ gap: 8 }}>
                {VALUE_SLIDES.map((_, index) => (
                    <ProgressDot
                        key={index}
                        isActive={index === currentIndex}
                        progress={index === currentIndex ? progress : 0}
                        onPress={() => handleDotPress(index)}
                    />
                ))}
            </View>
        </View>
    );
}

// Compact version for login screen
export function ValueCarouselCompact() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [key, setKey] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % VALUE_SLIDES.length);
            setKey((prev) => prev + 1);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const currentSlide = VALUE_SLIDES[currentIndex];

    return (
        <View className="bg-slate-50 rounded-2xl p-5">
            <Animated.View
                key={key}
                entering={FadeIn.duration(400)}
                exiting={FadeOut.duration(200)}
                className="items-center"
            >
                <Text className="text-base font-semibold text-slate-900 text-center mb-1">
                    {currentSlide.title}
                </Text>
                <Text className="text-sm text-slate-500 text-center">
                    {currentSlide.subtitle}
                </Text>
            </Animated.View>

            {/* Dots */}
            <View className="flex-row items-center justify-center mt-4" style={{ gap: 6 }}>
                {VALUE_SLIDES.map((_, index) => (
                    <Pressable
                        key={index}
                        onPress={() => {
                            selectionHaptic();
                            setCurrentIndex(index);
                            setKey((prev) => prev + 1);
                        }}
                    >
                        <View
                            className={`h-1.5 rounded-full ${
                                index === currentIndex ? 'w-6 bg-slate-900' : 'w-1.5 bg-slate-300'
                            }`}
                        />
                    </Pressable>
                ))}
            </View>
        </View>
    );
}
