import React from 'react';
import { View, TextInput, Pressable, ViewStyle } from 'react-native';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onFilterPress?: () => void;
    showFilter?: boolean;
    autoFocus?: boolean;
    style?: ViewStyle;
}

export function SearchBar({
    value,
    onChangeText,
    placeholder = 'Ara...',
    onFilterPress,
    showFilter = false,
    autoFocus = false,
    style,
}: SearchBarProps) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                {
                    backgroundColor: colors.background.tertiary,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                },
                style,
            ]}
        >
            <Search size={20} color={colors.text.tertiary} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.text.tertiary}
                autoFocus={autoFocus}
                style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    color: colors.text.primary,
                    fontSize: 15,
                }}
            />
            {value.length > 0 && (
                <Pressable onPress={() => onChangeText('')} hitSlop={8}>
                    <X size={18} color={colors.text.tertiary} />
                </Pressable>
            )}
            {showFilter && onFilterPress && (
                <Pressable
                    onPress={onFilterPress}
                    style={{
                        marginLeft: 8,
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: colors.surface.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    hitSlop={8}
                >
                    <SlidersHorizontal size={18} color={colors.text.secondary} />
                </Pressable>
            )}
        </View>
    );
}
