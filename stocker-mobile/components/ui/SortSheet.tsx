import React from 'react';
import { View, Text, Pressable, Modal, ViewStyle } from 'react-native';
import Animated, { SlideInDown, FadeIn } from 'react-native-reanimated';
import { ArrowUpDown, ArrowUp, ArrowDown, X, Check } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

export interface SortOption {
    key: string;
    label: string;
    icon?: React.ReactNode;
}

export interface SortValue {
    key: string;
    order: 'asc' | 'desc';
}

interface SortSheetProps {
    visible: boolean;
    onClose: () => void;
    options: SortOption[];
    value: SortValue | null;
    onChange: (value: SortValue | null) => void;
    title?: string;
}

export function SortSheet({
    visible,
    onClose,
    options,
    value,
    onChange,
    title = 'Sıralama',
}: SortSheetProps) {
    const { colors } = useTheme();

    const handleSelect = (option: SortOption) => {
        if (value?.key === option.key) {
            // Toggle order or clear
            if (value.order === 'asc') {
                onChange({ key: option.key, order: 'desc' });
            } else {
                onChange(null); // Clear sort
            }
        } else {
            onChange({ key: option.key, order: 'asc' });
        }
    };

    const getOrderIcon = (optionKey: string) => {
        if (value?.key !== optionKey) return null;
        return value.order === 'asc' ? (
            <ArrowUp size={16} color={colors.brand.primary} />
        ) : (
            <ArrowDown size={16} color={colors.brand.primary} />
        );
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                <Pressable style={{ flex: 1 }} onPress={onClose} />
                <Animated.View
                    entering={SlideInDown.duration(300)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                    }}
                >
                    {/* Header */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border.primary,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <ArrowUpDown size={20} color={colors.brand.primary} />
                            <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                                {title}
                            </Text>
                        </View>
                        <Pressable onPress={onClose} hitSlop={8}>
                            <X size={24} color={colors.text.secondary} />
                        </Pressable>
                    </View>

                    {/* Options */}
                    <View style={{ padding: 8 }}>
                        {/* Clear sort option */}
                        <Pressable
                            onPress={() => {
                                onChange(null);
                                onClose();
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 16,
                                borderRadius: 12,
                                backgroundColor: !value ? colors.brand.primary + '10' : 'transparent',
                            }}
                        >
                            <Text style={{ color: colors.text.secondary, fontSize: 15 }}>Varsayılan</Text>
                            {!value && <Check size={20} color={colors.brand.primary} />}
                        </Pressable>

                        {options.map((option) => {
                            const isSelected = value?.key === option.key;
                            return (
                                <Pressable
                                    key={option.key}
                                    onPress={() => handleSelect(option)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 16,
                                        borderRadius: 12,
                                        backgroundColor: isSelected ? colors.brand.primary + '10' : 'transparent',
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        {option.icon}
                                        <Text
                                            style={{
                                                color: isSelected ? colors.brand.primary : colors.text.primary,
                                                fontSize: 15,
                                                fontWeight: isSelected ? '600' : '400',
                                            }}
                                        >
                                            {option.label}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        {getOrderIcon(option.key)}
                                        {isSelected && (
                                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                                {value?.order === 'asc' ? 'Artan' : 'Azalan'}
                                            </Text>
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Info */}
                    <View style={{ padding: 16, paddingTop: 0 }}>
                        <Text style={{ color: colors.text.tertiary, fontSize: 12, textAlign: 'center' }}>
                            Aynı sıralamaya tekrar tıklayarak yönü değiştirebilirsiniz
                        </Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

// Sort Button Component
interface SortButtonProps {
    onPress: () => void;
    value: SortValue | null;
    options: SortOption[];
    style?: ViewStyle;
}

export function SortButton({ onPress, value, options, style }: SortButtonProps) {
    const { colors } = useTheme();
    const selectedOption = options.find(o => o.key === value?.key);

    return (
        <Pressable
            onPress={onPress}
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: value ? colors.brand.primary : colors.background.tertiary,
                },
                style,
            ]}
        >
            {value?.order === 'asc' ? (
                <ArrowUp size={16} color={value ? '#fff' : colors.text.secondary} />
            ) : value?.order === 'desc' ? (
                <ArrowDown size={16} color={value ? '#fff' : colors.text.secondary} />
            ) : (
                <ArrowUpDown size={16} color={colors.text.secondary} />
            )}
            <Text
                style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: value ? '#fff' : colors.text.secondary,
                }}
            >
                {selectedOption?.label || 'Sırala'}
            </Text>
        </Pressable>
    );
}
