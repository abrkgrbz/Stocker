import React, { useState } from 'react';
import { View, Text, Pressable, Platform, ViewStyle } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Calendar, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/lib/theme';

interface DatePickerProps<T extends FieldValues> {
    // react-hook-form integration
    name: Path<T>;
    control: Control<T>;

    // Core props
    label?: string;
    placeholder?: string;

    // Date configuration
    minimumDate?: Date;
    maximumDate?: Date;
    mode?: 'date' | 'datetime';

    // Styling
    style?: ViewStyle;
}

const formatDate = (date: Date | null, mode: 'date' | 'datetime'): string => {
    if (!date) return '';

    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    };

    if (mode === 'datetime') {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return date.toLocaleDateString('tr-TR', options);
};

const formatISODate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

export function DatePicker<T extends FieldValues>({
    name,
    control,
    label,
    placeholder = 'Tarih seçin',
    minimumDate,
    maximumDate,
    mode = 'date',
    style,
}: DatePickerProps<T>) {
    const { colors } = useTheme();
    const [showPicker, setShowPicker] = useState(false);

    const parseDate = (value: string | Date | null): Date | null => {
        if (!value) return null;
        if (value instanceof Date) return value;
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                const dateValue = parseDate(value);

                return (
                    <View style={[{ marginBottom: 16 }, style]}>
                        {label && (
                            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                {label}
                            </Text>
                        )}

                        <Pressable
                            onPress={() => setShowPicker(true)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.background.tertiary,
                                borderRadius: 12,
                                paddingHorizontal: 12,
                                paddingVertical: 14,
                                borderWidth: error ? 1 : 0,
                                borderColor: error ? colors.semantic.error : undefined,
                            }}
                        >
                            <Calendar size={20} color={colors.text.tertiary} />
                            <Text
                                style={{
                                    flex: 1,
                                    marginLeft: 12,
                                    color: dateValue ? colors.text.primary : colors.text.tertiary,
                                    fontSize: 15,
                                }}
                            >
                                {dateValue ? formatDate(dateValue, mode) : placeholder}
                            </Text>
                            {dateValue && (
                                <Pressable
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onChange('');
                                    }}
                                    hitSlop={8}
                                >
                                    <X size={18} color={colors.text.tertiary} />
                                </Pressable>
                            )}
                        </Pressable>

                        {showPicker && (
                            <DateTimePicker
                                value={dateValue || new Date()}
                                mode={mode === 'datetime' ? 'datetime' : 'date'}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                minimumDate={minimumDate}
                                maximumDate={maximumDate}
                                locale="tr-TR"
                                onChange={(event, selectedDate) => {
                                    setShowPicker(Platform.OS === 'ios');
                                    if (event.type === 'set' && selectedDate) {
                                        onChange(formatISODate(selectedDate));
                                    }
                                    if (Platform.OS === 'android') {
                                        setShowPicker(false);
                                    }
                                }}
                            />
                        )}

                        {Platform.OS === 'ios' && showPicker && (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                    marginTop: 8,
                                }}
                            >
                                <Pressable
                                    onPress={() => setShowPicker(false)}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                        backgroundColor: colors.brand.primary,
                                        borderRadius: 8,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: '600' }}>Tamam</Text>
                                </Pressable>
                            </View>
                        )}

                        {error && (
                            <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 4 }}>
                                {error.message}
                            </Text>
                        )}
                    </View>
                );
            }}
        />
    );
}
