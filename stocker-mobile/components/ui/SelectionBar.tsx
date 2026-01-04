import React from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { X, CheckSquare, Square, Trash2, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

export interface BulkAction {
    key: string;
    label: string;
    icon: React.ReactNode;
    variant?: 'default' | 'danger';
    onPress: () => void;
}

interface SelectionBarProps {
    visible: boolean;
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onCancel: () => void;
    actions: BulkAction[];
    style?: ViewStyle;
}

export function SelectionBar({
    visible,
    selectedCount,
    totalCount,
    onSelectAll,
    onDeselectAll,
    onCancel,
    actions,
    style,
}: SelectionBarProps) {
    const { colors } = useTheme();

    if (!visible) return null;

    const allSelected = selectedCount === totalCount && totalCount > 0;

    return (
        <Animated.View
            entering={SlideInDown.duration(300)}
            exiting={SlideOutDown.duration(300)}
            style={[
                {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: colors.surface.primary,
                    borderTopWidth: 1,
                    borderTopColor: colors.border.primary,
                    paddingBottom: 34, // Safe area
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 8,
                },
                style,
            ]}
        >
            {/* Selection Info */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.secondary,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Pressable
                        onPress={onCancel}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: colors.background.tertiary,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <X size={20} color={colors.text.primary} />
                    </Pressable>
                    <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                        {selectedCount} seçili
                    </Text>
                </View>

                <Pressable
                    onPress={allSelected ? onDeselectAll : onSelectAll}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        backgroundColor: colors.background.tertiary,
                    }}
                >
                    {allSelected ? (
                        <CheckSquare size={18} color={colors.brand.primary} />
                    ) : (
                        <Square size={18} color={colors.text.secondary} />
                    )}
                    <Text
                        style={{
                            color: allSelected ? colors.brand.primary : colors.text.secondary,
                            fontSize: 13,
                            fontWeight: '500',
                        }}
                    >
                        {allSelected ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                    </Text>
                </Pressable>
            </View>

            {/* Actions */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                }}
            >
                {actions.map((action) => (
                    <Pressable
                        key={action.key}
                        onPress={action.onPress}
                        disabled={selectedCount === 0}
                        style={{
                            alignItems: 'center',
                            gap: 4,
                            opacity: selectedCount === 0 ? 0.5 : 1,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                        }}
                    >
                        {action.icon}
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: '500',
                                color: action.variant === 'danger' ? colors.semantic.error : colors.text.primary,
                            }}
                        >
                            {action.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </Animated.View>
    );
}

// Selection Checkbox Component
interface SelectionCheckboxProps {
    selected: boolean;
    onToggle: () => void;
    size?: number;
}

export function SelectionCheckbox({ selected, onToggle, size = 24 }: SelectionCheckboxProps) {
    const { colors } = useTheme();

    return (
        <Pressable
            onPress={onToggle}
            hitSlop={8}
            style={{
                width: size,
                height: size,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: selected ? colors.brand.primary : colors.border.primary,
                backgroundColor: selected ? colors.brand.primary : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {selected && (
                <Animated.View entering={FadeIn.duration(150)}>
                    <CheckSquare size={size - 8} color="#fff" strokeWidth={3} />
                </Animated.View>
            )}
        </Pressable>
    );
}

// Floating Selection Button (to enter selection mode)
interface SelectionModeButtonProps {
    onPress: () => void;
    style?: ViewStyle;
}

export function SelectionModeButton({ onPress, style }: SelectionModeButtonProps) {
    const { colors } = useTheme();

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
                    backgroundColor: colors.background.tertiary,
                },
                style,
            ]}
        >
            <CheckSquare size={16} color={colors.text.secondary} />
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.secondary }}>
                Seç
            </Text>
        </Pressable>
    );
}

// Bulk Action Sheet (for more actions)
interface BulkActionSheetProps {
    visible: boolean;
    onClose: () => void;
    actions: BulkAction[];
    selectedCount: number;
}

export function BulkActionSheet({ visible, onClose, actions, selectedCount }: BulkActionSheetProps) {
    const { colors } = useTheme();

    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'flex-end',
            }}
        >
            <Pressable style={{ flex: 1 }} onPress={onClose} />
            <Animated.View
                entering={SlideInDown.duration(300)}
                style={{
                    backgroundColor: colors.surface.primary,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    paddingBottom: 34,
                }}
            >
                <View
                    style={{
                        alignItems: 'center',
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border.primary,
                    }}
                >
                    <View
                        style={{
                            width: 40,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: colors.border.primary,
                            marginBottom: 12,
                        }}
                    />
                    <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                        {selectedCount} öğe için işlemler
                    </Text>
                </View>

                <View style={{ padding: 8 }}>
                    {actions.map((action) => (
                        <Pressable
                            key={action.key}
                            onPress={() => {
                                action.onPress();
                                onClose();
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12,
                                padding: 16,
                                borderRadius: 12,
                            }}
                        >
                            {action.icon}
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: action.variant === 'danger' ? colors.semantic.error : colors.text.primary,
                                }}
                            >
                                {action.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <Pressable
                    onPress={onClose}
                    style={{
                        margin: 16,
                        padding: 14,
                        backgroundColor: colors.background.tertiary,
                        borderRadius: 12,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: colors.text.secondary, fontSize: 15, fontWeight: '500' }}>
                        İptal
                    </Text>
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
}
