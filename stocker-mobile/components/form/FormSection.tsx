import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/lib/theme';

interface FormSectionProps {
    title: string;
    icon: React.ComponentType<{ size: number; color: string }>;
    iconBgColor: string;
    iconColor: string;
    children: React.ReactNode;
    animationDelay?: number;
    error?: boolean;
    style?: ViewStyle;
}

export function FormSection({
    title,
    icon: Icon,
    iconBgColor,
    iconColor,
    children,
    animationDelay = 0,
    error = false,
    style,
}: FormSectionProps) {
    const { colors } = useTheme();

    return (
        <Animated.View entering={FadeInDown.duration(400).delay(animationDelay)}>
            <View
                style={[
                    {
                        backgroundColor: colors.surface.primary,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: error ? colors.semantic.error : colors.border.primary,
                    },
                    style,
                ]}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 16,
                    }}
                >
                    <View
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor: iconBgColor,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                        }}
                    >
                        <Icon size={20} color={iconColor} />
                    </View>
                    <Text
                        style={{
                            color: colors.text.primary,
                            fontSize: 16,
                            fontWeight: '600',
                        }}
                    >
                        {title}
                    </Text>
                </View>
                {children}
            </View>
        </Animated.View>
    );
}
