import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { AnimatedButton } from './AnimatedButton';
import { useTheme } from '@/lib/theme';

interface EmptyStateProps {
    icon: React.ReactNode;
    iconBgColor?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

export function EmptyState({
    icon,
    iconBgColor,
    title,
    description,
    actionLabel,
    onAction,
    style,
}: EmptyStateProps) {
    const { colors } = useTheme();

    return (
        <Animated.View
            entering={FadeIn.duration(400)}
            style={[
                {
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 48,
                    paddingHorizontal: 24,
                },
                style,
            ]}
        >
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                <View
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 20,
                        backgroundColor: iconBgColor || colors.background.tertiary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 24,
                    }}
                >
                    {icon}
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                <Text
                    style={{
                        color: colors.text.primary,
                        fontSize: 18,
                        fontWeight: '600',
                        textAlign: 'center',
                        marginBottom: 8,
                    }}
                >
                    {title}
                </Text>
            </Animated.View>

            {description && (
                <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                    <Text
                        style={{
                            color: colors.text.secondary,
                            fontSize: 14,
                            textAlign: 'center',
                            lineHeight: 20,
                            maxWidth: 280,
                        }}
                    >
                        {description}
                    </Text>
                </Animated.View>
            )}

            {actionLabel && onAction && (
                <Animated.View
                    entering={FadeInDown.duration(400).delay(400)}
                    style={{ marginTop: 24, width: '100%', maxWidth: 200 }}
                >
                    <AnimatedButton
                        title={actionLabel}
                        onPress={onAction}
                        variant="primary"
                    />
                </Animated.View>
            )}
        </Animated.View>
    );
}

// Inline empty state for lists
interface InlineEmptyStateProps {
    message: string;
    style?: ViewStyle;
}

export function InlineEmptyState({ message, style }: InlineEmptyStateProps) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                {
                    paddingVertical: 24,
                    alignItems: 'center',
                },
                style,
            ]}
        >
            <Text
                style={{
                    color: colors.text.tertiary,
                    fontSize: 14,
                    textAlign: 'center',
                }}
            >
                {message}
            </Text>
        </View>
    );
}

// Search empty state
interface SearchEmptyStateProps {
    query: string;
    style?: ViewStyle;
}

export function SearchEmptyState({ query, style }: SearchEmptyStateProps) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                {
                    alignItems: 'center',
                    paddingVertical: 48,
                    paddingHorizontal: 24,
                },
                style,
            ]}
        >
            <Text
                style={{
                    color: colors.text.primary,
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center',
                    marginBottom: 8,
                }}
            >
                Sonuç bulunamadı
            </Text>
            <Text
                style={{
                    color: colors.text.secondary,
                    fontSize: 14,
                    textAlign: 'center',
                }}
            >
                "{query}" için sonuç bulunamadı.{'\n'}
                Farklı bir arama terimi deneyin.
            </Text>
        </View>
    );
}
