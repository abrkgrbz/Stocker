import React, { useMemo } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Control, Controller, FieldValues, Path, useWatch } from 'react-hook-form';
import { MapPin, Building2, Globe } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { SelectPicker, SelectOption } from './SelectPicker';
import {
    TURKEY_CITIES,
    getDistrictsByCityId,
    getCityById,
    getDistrictById,
} from '@/lib/data/turkey-locations';

interface LocationSelectorProps<T extends FieldValues> {
    // react-hook-form integration
    control: Control<T>;

    // Field names
    cityFieldName: Path<T>;
    districtFieldName: Path<T>;
    cityNameFieldName?: Path<T>; // Optional: for storing city name
    districtNameFieldName?: Path<T>; // Optional: for storing district name

    // Labels
    cityLabel?: string;
    districtLabel?: string;

    // Layout
    layout?: 'vertical' | 'horizontal';

    // Styling
    style?: ViewStyle;
}

export function LocationSelector<T extends FieldValues>({
    control,
    cityFieldName,
    districtFieldName,
    cityNameFieldName,
    districtNameFieldName,
    cityLabel = 'İl',
    districtLabel = 'İlçe',
    layout = 'horizontal',
    style,
}: LocationSelectorProps<T>) {
    const { colors } = useTheme();

    // Watch the city field to update district options
    const selectedCityId = useWatch({
        control,
        name: cityFieldName,
    });

    // City options
    const cityOptions: SelectOption<string>[] = useMemo(() => {
        return TURKEY_CITIES.map(city => ({
            value: city.id,
            label: city.name,
        }));
    }, []);

    // District options based on selected city
    const districtOptions: SelectOption<string>[] = useMemo(() => {
        if (!selectedCityId) return [];
        return getDistrictsByCityId(selectedCityId as string).map(district => ({
            value: district.id,
            label: district.name,
        }));
    }, [selectedCityId]);

    const containerStyle: ViewStyle = layout === 'horizontal'
        ? { flexDirection: 'row', gap: 12 }
        : { flexDirection: 'column' };

    const itemStyle: ViewStyle = layout === 'horizontal'
        ? { flex: 1 }
        : {};

    return (
        <View style={[containerStyle, style]}>
            {/* Country - Fixed as Turkey */}
            <View style={[itemStyle, { marginBottom: layout === 'vertical' ? 0 : 0 }]}>
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                        Ülke
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: colors.background.tertiary,
                            borderRadius: 12,
                            padding: 14,
                            opacity: 0.7,
                        }}
                    >
                        <Globe size={20} color={colors.text.tertiary} />
                        <Text style={{ color: colors.text.primary, fontSize: 15, marginLeft: 12 }}>
                            Türkiye
                        </Text>
                    </View>
                </View>
            </View>

            {/* City Selector */}
            <Controller
                control={control}
                name={cityFieldName}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <View style={itemStyle}>
                        <SelectPicker
                            name={cityFieldName}
                            control={control}
                            label={cityLabel}
                            placeholder="İl seçin"
                            options={cityOptions}
                            icon={Building2}
                        />
                    </View>
                )}
            />

            {/* District Selector */}
            <View style={itemStyle}>
                <SelectPicker
                    name={districtFieldName}
                    control={control}
                    label={districtLabel}
                    placeholder={selectedCityId ? 'İlçe seçin' : 'Önce il seçin'}
                    options={districtOptions}
                    icon={MapPin}
                    disabled={!selectedCityId || districtOptions.length === 0}
                />
            </View>
        </View>
    );
}

// Simplified version for just city/district text inputs (when IDs are not needed)
interface SimpleLocationSelectorProps<T extends FieldValues> {
    control: Control<T>;
    cityFieldName: Path<T>;
    districtFieldName: Path<T>;
    countryFieldName?: Path<T>;
    cityLabel?: string;
    districtLabel?: string;
    countryLabel?: string;
    layout?: 'vertical' | 'horizontal';
    style?: ViewStyle;
}

export function SimpleLocationSelector<T extends FieldValues>({
    control,
    cityFieldName,
    districtFieldName,
    countryFieldName,
    cityLabel = 'Şehir',
    districtLabel = 'İlçe',
    countryLabel = 'Ülke',
    layout = 'horizontal',
    style,
}: SimpleLocationSelectorProps<T>) {
    const { colors } = useTheme();

    // Watch the city field to get district options
    const selectedCityName = useWatch({
        control,
        name: cityFieldName,
    });

    // Find city by name to get districts
    const selectedCity = useMemo(() => {
        if (!selectedCityName) return null;
        return TURKEY_CITIES.find(
            city => city.name.toLowerCase() === String(selectedCityName).toLowerCase()
        );
    }, [selectedCityName]);

    // City options as names
    const cityOptions: SelectOption<string>[] = useMemo(() => {
        return TURKEY_CITIES.map(city => ({
            value: city.name,
            label: city.name,
        }));
    }, []);

    // District options based on selected city name
    const districtOptions: SelectOption<string>[] = useMemo(() => {
        if (!selectedCity) return [];
        return getDistrictsByCityId(selectedCity.id).map(district => ({
            value: district.name,
            label: district.name,
        }));
    }, [selectedCity]);

    const containerStyle: ViewStyle = layout === 'horizontal'
        ? { flexDirection: 'row', gap: 12 }
        : { flexDirection: 'column' };

    const itemStyle: ViewStyle = layout === 'horizontal'
        ? { flex: 1 }
        : {};

    return (
        <View style={style}>
            {/* Country field if provided */}
            {countryFieldName && (
                <View style={{ marginBottom: 0 }}>
                    <Controller
                        control={control}
                        name={countryFieldName}
                        render={({ field: { value } }) => (
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                    {countryLabel}
                                </Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: colors.background.tertiary,
                                        borderRadius: 12,
                                        padding: 14,
                                    }}
                                >
                                    <Globe size={20} color={colors.text.tertiary} />
                                    <Text style={{ color: colors.text.primary, fontSize: 15, marginLeft: 12 }}>
                                        {value || 'Türkiye'}
                                    </Text>
                                </View>
                            </View>
                        )}
                    />
                </View>
            )}

            <View style={containerStyle}>
                {/* City Selector */}
                <View style={itemStyle}>
                    <SelectPicker
                        name={cityFieldName}
                        control={control}
                        label={cityLabel}
                        placeholder="Şehir seçin"
                        options={cityOptions}
                        icon={Building2}
                    />
                </View>

                {/* District Selector */}
                <View style={itemStyle}>
                    <SelectPicker
                        name={districtFieldName}
                        control={control}
                        label={districtLabel}
                        placeholder={selectedCity ? 'İlçe seçin' : 'Önce şehir seçin'}
                        options={districtOptions}
                        icon={MapPin}
                        disabled={!selectedCity || districtOptions.length === 0}
                    />
                </View>
            </View>
        </View>
    );
}
