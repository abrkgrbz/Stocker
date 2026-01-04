import React from 'react';
import { View, Text, Pressable, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/theme';

export interface HeaderAction {
    icon: React.ComponentType<{ size: number; color: string }>;
    onPress: () => void;
    label?: string;
    variant?: 'icon' | 'button';
    color?: string;
    backgroundColor?: string;
    disabled?: boolean;
    loading?: boolean;
}

interface PageHeaderProps {
    // Navigation
    title: string;
    subtitle?: string;
    onBack?: () => void;
    showBack?: boolean;

    // Actions
    actions?: HeaderAction[];
    primaryAction?: HeaderAction;

    // Visual
    animated?: boolean;
    borderBottom?: boolean;

    // Styling
    style?: ViewStyle;
    titleStyle?: TextStyle;
}

export function PageHeader({
    title,
    subtitle,
    onBack,
    showBack = true,
    actions = [],
    primaryAction,
    animated = true,
    borderBottom = true,
    style,
    titleStyle,
}: PageHeaderProps) {
    const router = useRouter();
    const { colors } = useTheme();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    const content = (
        <View
            style={[
                {
                    backgroundColor: colors.surface.primary,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: borderBottom ? 1 : 0,
                    borderBottomColor: colors.border.primary,
                },
                style,
            ]}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Left side: Back button + Title */}
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {showBack && (
                        <Pressable
                            onPress={handleBack}
                            style={{ marginRight: 12, padding: 8, marginLeft: -8 }}
                            hitSlop={8}
                        >
                            <ArrowLeft size={24} color={colors.text.primary} />
                        </Pressable>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text
                            style={[
                                {
                                    color: colors.text.primary,
                                    fontSize: 18,
                                    fontWeight: '700',
                                },
                                titleStyle,
                            ]}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                        {subtitle && (
                            <Text
                                style={{
                                    color: colors.text.tertiary,
                                    fontSize: 13,
                                    marginTop: 2,
                                }}
                                numberOfLines={1}
                            >
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Right side: Actions */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {actions.map((action, index) => (
                        <ActionButton key={index} action={action} colors={colors} />
                    ))}
                    {primaryAction && (
                        <ActionButton action={primaryAction} colors={colors} isPrimary />
                    )}
                </View>
            </View>
        </View>
    );

    if (animated) {
        return (
            <Animated.View entering={FadeIn.duration(400)}>
                {content}
            </Animated.View>
        );
    }

    return content;
}

interface ActionButtonProps {
    action: HeaderAction;
    colors: any;
    isPrimary?: boolean;
}

function ActionButton({ action, colors, isPrimary = false }: ActionButtonProps) {
    const Icon = action.icon;
    const isButton = action.variant === 'button' || action.label;
    const bgColor = action.backgroundColor || (isPrimary ? colors.brand.primary : undefined);
    const iconColor = action.color || (isButton && bgColor ? '#fff' : colors.text.primary);

    return (
        <Pressable
            onPress={action.onPress}
            disabled={action.disabled || action.loading}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: isButton ? 16 : 8,
                paddingVertical: isButton ? 10 : 8,
                borderRadius: 10,
                backgroundColor: bgColor,
                opacity: action.disabled ? 0.5 : 1,
            }}
        >
            {action.loading ? (
                <ActivityIndicator size="small" color={iconColor} />
            ) : (
                <>
                    <Icon size={18} color={iconColor} />
                    {action.label && (
                        <Text
                            style={{
                                color: iconColor,
                                fontWeight: '600',
                                marginLeft: 6,
                                fontSize: 14,
                            }}
                        >
                            {action.label}
                        </Text>
                    )}
                </>
            )}
        </Pressable>
    );
}
