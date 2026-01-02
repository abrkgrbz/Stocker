import React from 'react';
import { Pressable, ViewStyle, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

interface FABProps {
    onPress: () => void;
    icon?: React.ReactNode;
    label?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'error';
    size?: 'sm' | 'md' | 'lg';
    position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
    style?: ViewStyle;
    visible?: boolean;
}

const sizeMap = {
    sm: { size: 48, iconSize: 20 },
    md: { size: 56, iconSize: 24 },
    lg: { size: 64, iconSize: 28 },
};

const positionMap = {
    'bottom-right': { right: 16, bottom: 16 },
    'bottom-center': { alignSelf: 'center' as const, bottom: 16 },
    'bottom-left': { left: 16, bottom: 16 },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FAB({
    onPress,
    icon,
    label,
    variant = 'primary',
    size = 'md',
    position = 'bottom-right',
    style,
    visible = true,
}: FABProps) {
    const { colors } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return {
                    backgroundColor: colors.surface.primary,
                    iconColor: colors.brand.primary,
                    textColor: colors.brand.primary,
                    borderWidth: 1,
                    borderColor: colors.border.primary,
                };
            case 'success':
                return {
                    backgroundColor: colors.semantic.success,
                    iconColor: '#ffffff',
                    textColor: '#ffffff',
                    borderWidth: 0,
                    borderColor: 'transparent',
                };
            case 'error':
                return {
                    backgroundColor: colors.semantic.error,
                    iconColor: '#ffffff',
                    textColor: '#ffffff',
                    borderWidth: 0,
                    borderColor: 'transparent',
                };
            default:
                return {
                    backgroundColor: colors.brand.primary,
                    iconColor: colors.text.inverse,
                    textColor: colors.text.inverse,
                    borderWidth: 0,
                    borderColor: 'transparent',
                };
        }
    };

    const variantStyles = getVariantStyles();
    const sizeStyle = sizeMap[size];
    const positionStyle = positionMap[position];

    if (!visible) return null;

    const isExtended = !!label;

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[
                {
                    position: 'absolute',
                    zIndex: 100,
                    ...positionStyle,
                },
                style,
            ]}
        >
            <Pressable
                onPress={onPress}
                style={{
                    backgroundColor: variantStyles.backgroundColor,
                    borderRadius: isExtended ? sizeStyle.size / 2 : sizeStyle.size / 2,
                    width: isExtended ? undefined : sizeStyle.size,
                    height: sizeStyle.size,
                    paddingHorizontal: isExtended ? 20 : 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    borderWidth: variantStyles.borderWidth,
                    borderColor: variantStyles.borderColor,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 6,
                }}
            >
                {icon || <Plus size={sizeStyle.iconSize} color={variantStyles.iconColor} />}
                {label && (
                    <Text
                        style={{
                            color: variantStyles.textColor,
                            fontSize: 15,
                            fontWeight: '600',
                            marginLeft: 8,
                        }}
                    >
                        {label}
                    </Text>
                )}
            </Pressable>
        </Animated.View>
    );
}

// Mini FAB for secondary actions
interface MiniFABProps {
    onPress: () => void;
    icon: React.ReactNode;
    style?: ViewStyle;
}

export function MiniFAB({ onPress, icon, style }: MiniFABProps) {
    const { colors } = useTheme();

    return (
        <Pressable
            onPress={onPress}
            style={[
                {
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: colors.surface.primary,
                    borderWidth: 1,
                    borderColor: colors.border.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                },
                style,
            ]}
        >
            {icon}
        </Pressable>
    );
}
