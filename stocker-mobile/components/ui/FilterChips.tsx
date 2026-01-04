import React from 'react';
import { ScrollView, Pressable, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/theme';

export interface FilterChip<T = string> {
    key: T;
    label: string;
    count?: number;
}

interface FilterChipsProps<T = string> {
    filters: FilterChip<T>[];
    selected: T;
    onSelect: (key: T) => void;

    // Appearance
    variant?: 'filled' | 'outlined';
    size?: 'sm' | 'md';
    showCounts?: boolean;
    moduleColor?: string;

    // Styling
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
}

export function FilterChips<T = string>({
    filters,
    selected,
    onSelect,
    variant = 'filled',
    size = 'md',
    showCounts = false,
    moduleColor,
    style,
    contentContainerStyle,
}: FilterChipsProps<T>) {
    const { colors } = useTheme();
    const activeColor = moduleColor || colors.brand.primary;

    const paddingVertical = size === 'sm' ? 6 : 8;
    const paddingHorizontal = size === 'sm' ? 12 : 16;
    const fontSize = size === 'sm' ? 13 : 14;

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={style}
            contentContainerStyle={[{ paddingHorizontal: 16, gap: 8 }, contentContainerStyle]}
        >
            {filters.map((filter) => {
                const isActive = selected === filter.key;

                return (
                    <Pressable
                        key={String(filter.key)}
                        onPress={() => onSelect(filter.key)}
                        style={{
                            paddingVertical,
                            paddingHorizontal,
                            borderRadius: 20,
                            backgroundColor: isActive
                                ? variant === 'filled'
                                    ? activeColor
                                    : activeColor + '20'
                                : colors.surface.primary,
                            borderWidth: 1,
                            borderColor: isActive
                                ? activeColor
                                : colors.border.primary,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={{
                                color: isActive
                                    ? variant === 'filled'
                                        ? '#fff'
                                        : activeColor
                                    : colors.text.secondary,
                                fontSize,
                                fontWeight: isActive ? '600' : '400',
                            }}
                        >
                            {filter.label}
                        </Text>
                        {showCounts && filter.count !== undefined && (
                            <View
                                style={{
                                    marginLeft: 6,
                                    backgroundColor: isActive
                                        ? variant === 'filled'
                                            ? 'rgba(255,255,255,0.3)'
                                            : activeColor + '30'
                                        : colors.background.tertiary,
                                    borderRadius: 10,
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    minWidth: 20,
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        color: isActive
                                            ? variant === 'filled'
                                                ? '#fff'
                                                : activeColor
                                            : colors.text.tertiary,
                                        fontSize: 11,
                                        fontWeight: '600',
                                    }}
                                >
                                    {filter.count}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}
