import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ViewStyle } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

export interface SelectOption<T = string> {
    value: T;
    label: string;
    disabled?: boolean;
}

interface SelectPickerProps<T extends FieldValues, V = string> {
    // react-hook-form integration
    name: Path<T>;
    control: Control<T>;

    // Core props
    label?: string;
    placeholder?: string;
    options: SelectOption<V>[];

    // Visual
    icon?: React.ComponentType<{ size: number; color: string }>;

    // Behavior
    searchable?: boolean;
    disabled?: boolean;
    maxHeight?: number;

    // Styling
    style?: ViewStyle;
}

export function SelectPicker<T extends FieldValues, V = string>({
    name,
    control,
    label,
    placeholder = 'Seçiniz',
    options,
    icon: Icon,
    disabled = false,
    maxHeight = 200,
    style,
}: SelectPickerProps<T, V>) {
    const { colors } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const getSelectedLabel = (value: V | undefined): string => {
        if (!value) return '';
        const option = options.find(o => o.value === value);
        return option?.label || '';
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={[{ marginBottom: 16 }, style]}>
                    {label && (
                        <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                            {label}
                        </Text>
                    )}

                    <Pressable
                        onPress={() => !disabled && setIsOpen(!isOpen)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: colors.background.tertiary,
                            borderRadius: 12,
                            padding: 14,
                            borderWidth: error ? 1 : 0,
                            borderColor: error ? colors.semantic.error : undefined,
                            opacity: disabled ? 0.5 : 1,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            {Icon && <Icon size={20} color={colors.text.tertiary} />}
                            <Text
                                style={{
                                    color: value ? colors.text.primary : colors.text.tertiary,
                                    fontSize: 15,
                                    marginLeft: Icon ? 12 : 0,
                                    flex: 1,
                                }}
                                numberOfLines={1}
                            >
                                {getSelectedLabel(value as V) || placeholder}
                            </Text>
                        </View>
                        <ChevronDown
                            size={20}
                            color={colors.text.tertiary}
                            style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                        />
                    </Pressable>

                    {isOpen && (
                        <View style={{ marginTop: 8, maxHeight }}>
                            <ScrollView
                                nestedScrollEnabled
                                style={{
                                    backgroundColor: colors.surface.primary,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: colors.border.primary,
                                }}
                            >
                                {options.map((option) => {
                                    const isSelected = value === option.value;
                                    const isDisabled = option.disabled;

                                    return (
                                        <Pressable
                                            key={String(option.value)}
                                            onPress={() => {
                                                if (!isDisabled) {
                                                    onChange(option.value);
                                                    setIsOpen(false);
                                                }
                                            }}
                                            style={{
                                                padding: 12,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                backgroundColor: isSelected
                                                    ? colors.brand.primary + '20'
                                                    : 'transparent',
                                                opacity: isDisabled ? 0.5 : 1,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: isSelected
                                                        ? colors.brand.primary
                                                        : colors.text.primary,
                                                    fontSize: 14,
                                                    fontWeight: isSelected ? '600' : '400',
                                                }}
                                            >
                                                {option.label}
                                            </Text>
                                            {isSelected && (
                                                <Check size={18} color={colors.brand.primary} />
                                            )}
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    )}

                    {error && (
                        <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 4 }}>
                            {error.message}
                        </Text>
                    )}
                </View>
            )}
        />
    );
}
