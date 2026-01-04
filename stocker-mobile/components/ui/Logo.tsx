import React from 'react';
import { View, Text, Image } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    variant?: 'dark' | 'light' | 'color';
    showText?: boolean;
    animated?: boolean;
}

// Import logo images
const logos = {
    color: require('@/assets/images/stoocker.png'),
    dark: require('@/assets/images/stoocker_black.png'),
    light: require('@/assets/images/stoocker_white.png'),
};

export function Logo({ size = 'md', variant = 'color', showText = true, animated = true }: LogoProps) {
    const sizes = {
        sm: { logo: 48, text: 18, subtitle: 11 },
        md: { logo: 72, text: 24, subtitle: 13 },
        lg: { logo: 96, text: 32, subtitle: 15 },
        xl: { logo: 120, text: 40, subtitle: 18 },
        '2xl': { logo: 240, text: 48, subtitle: 20 },
    };

    const s = sizes[size];
    const isDark = variant === 'dark';
    const isLight = variant === 'light';

    const Container = animated ? Animated.View : View;
    const AnimatedImage = animated ? Animated.Image : Image;

    // Select logo based on variant
    const logoSource = isLight ? logos.light : isDark ? logos.dark : logos.color;

    return (
        <Container
            className="items-center"
            {...(animated && { entering: FadeInDown.duration(600).delay(100) })}
        >
            {/* Logo Image */}
            <AnimatedImage
                source={logoSource}
                style={{ width: s.logo, height: s.logo }}
                resizeMode="contain"
                {...(animated && { entering: FadeIn.duration(500) })}
            />

            {showText && (
                <View className="items-center mt-3">
                    <Text
                        className={`font-bold ${isLight ? 'text-white' : 'text-slate-900'}`}
                        style={{ fontSize: s.text }}
                    >
                        Stoocker
                    </Text>
                    <Text
                        className={`${isLight ? 'text-slate-300' : 'text-slate-500'} text-center mt-1`}
                        style={{ fontSize: s.subtitle }}
                    >
                        Kurumsal Stok Yönetimi
                    </Text>
                </View>
            )}
        </Container>
    );
}
