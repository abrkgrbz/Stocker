import React, { useCallback } from 'react';
import { View, Text, TextInput, ViewStyle } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Phone } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

interface PhoneInputProps<T extends FieldValues> {
    // react-hook-form integration
    name: Path<T>;
    control: Control<T>;

    // Core props
    label?: string;
    placeholder?: string;

    // Styling
    style?: ViewStyle;
}

// Turkish phone number mask: +90 5XX XXX XX XX
const formatTurkishPhone = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Remove leading 90 if present (we'll add it back)
    let phoneDigits = digits;
    if (digits.startsWith('90')) {
        phoneDigits = digits.slice(2);
    }

    // Limit to 10 digits (Turkish mobile without country code)
    phoneDigits = phoneDigits.slice(0, 10);

    if (phoneDigits.length === 0) return '';

    // Format: +90 5XX XXX XX XX
    let formatted = '+90 ';

    if (phoneDigits.length > 0) {
        formatted += phoneDigits.slice(0, 3);
    }
    if (phoneDigits.length > 3) {
        formatted += ' ' + phoneDigits.slice(3, 6);
    }
    if (phoneDigits.length > 6) {
        formatted += ' ' + phoneDigits.slice(6, 8);
    }
    if (phoneDigits.length > 8) {
        formatted += ' ' + phoneDigits.slice(8, 10);
    }

    return formatted;
};

// Extract raw digits from formatted phone
export const extractPhoneDigits = (formatted: string): string => {
    return formatted.replace(/\D/g, '');
};

export function PhoneInput<T extends FieldValues>({
    name,
    control,
    label = 'Telefon',
    placeholder = '+90 5XX XXX XX XX',
    style,
}: PhoneInputProps<T>) {
    const { colors } = useTheme();

    const handleChangeText = useCallback((text: string, onChange: (value: string) => void) => {
        const formatted = formatTurkishPhone(text);
        onChange(formatted);
    }, []);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={[{ marginBottom: 16 }, style]}>
                    <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                        {label}
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: error ? colors.semantic.error : colors.border.primary,
                            paddingHorizontal: 12,
                        }}
                    >
                        <Phone size={20} color={colors.text.tertiary} />
                        <TextInput
                            value={value}
                            onChangeText={(text) => handleChangeText(text, onChange)}
                            onBlur={onBlur}
                            placeholder={placeholder}
                            placeholderTextColor={colors.text.tertiary}
                            keyboardType="phone-pad"
                            maxLength={17} // +90 5XX XXX XX XX = 17 characters
                            style={{
                                flex: 1,
                                paddingVertical: 14,
                                paddingHorizontal: 12,
                                color: colors.text.primary,
                                fontSize: 15,
                            }}
                        />
                    </View>
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
