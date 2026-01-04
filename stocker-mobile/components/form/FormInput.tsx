import React from 'react';
import { View, Text, TextInput, ViewStyle, TextStyle } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useTheme } from '@/lib/theme';

interface FormInputProps<T extends FieldValues> {
    // react-hook-form integration
    name: Path<T>;
    control: Control<T>;

    // Core props
    label: string;
    placeholder?: string;

    // Input configuration
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric' | 'decimal-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    multiline?: boolean;
    numberOfLines?: number;
    maxLength?: number;
    secureTextEntry?: boolean;
    editable?: boolean;

    // Visual
    icon?: React.ComponentType<{ size: number; color: string }>;
    rightIcon?: React.ReactNode;

    // Styling
    style?: ViewStyle;
    inputStyle?: TextStyle;
}

export function FormInput<T extends FieldValues>({
    name,
    control,
    label,
    placeholder,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    multiline = false,
    numberOfLines,
    maxLength,
    secureTextEntry = false,
    editable = true,
    icon: Icon,
    rightIcon,
    style,
    inputStyle,
}: FormInputProps<T>) {
    const { colors } = useTheme();

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
                            alignItems: multiline ? 'flex-start' : 'center',
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: error ? colors.semantic.error : colors.border.primary,
                            paddingHorizontal: 12,
                        }}
                    >
                        {Icon && (
                            <Icon
                                size={20}
                                color={colors.text.tertiary}
                                style={multiline ? { marginTop: 14 } : undefined}
                            />
                        )}
                        <TextInput
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder={placeholder}
                            placeholderTextColor={colors.text.tertiary}
                            keyboardType={keyboardType}
                            autoCapitalize={autoCapitalize}
                            multiline={multiline}
                            numberOfLines={numberOfLines}
                            maxLength={maxLength}
                            secureTextEntry={secureTextEntry}
                            editable={editable}
                            style={[
                                {
                                    flex: 1,
                                    paddingVertical: 14,
                                    paddingHorizontal: Icon ? 12 : 0,
                                    color: colors.text.primary,
                                    fontSize: 15,
                                    minHeight: multiline ? 80 : undefined,
                                    textAlignVertical: multiline ? 'top' : 'center',
                                },
                                inputStyle,
                            ]}
                        />
                        {rightIcon}
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
