import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, ViewStyle } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { User, Building2, ChevronDown, Search, X, Check } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import type { Customer } from '@/lib/api/types/crm.types';

interface CustomerSelectorProps<T extends FieldValues> {
    // react-hook-form integration
    name: Path<T>;
    control: Control<T>;

    // Core props
    label?: string;
    placeholder?: string;

    // Styling
    style?: ViewStyle;
}

export function CustomerSelector<T extends FieldValues>({
    name,
    control,
    label = 'Müşteri *',
    placeholder = 'Müşteri seçin',
    style,
}: CustomerSelectorProps<T>) {
    const { colors } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch customers
    const { data: customersData, isLoading } = useCustomers({ pageSize: 100 });
    const customers = customersData?.items || [];

    // Filter customers based on search
    const filteredCustomers = useMemo(() => {
        if (!searchQuery) return customers;
        const query = searchQuery.toLowerCase();
        return customers.filter(
            (customer) =>
                customer.companyName.toLowerCase().includes(query) ||
                customer.contactPerson?.toLowerCase().includes(query) ||
                customer.email?.toLowerCase().includes(query)
        );
    }, [customers, searchQuery]);

    const getCustomerById = (id: string): Customer | undefined => {
        return customers.find((c) => c.id === id);
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                const selectedCustomer = value ? getCustomerById(value as string) : null;

                return (
                    <View style={style}>
                        {label && (
                            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                {label}
                            </Text>
                        )}

                        {/* Selected Customer or Placeholder */}
                        <Pressable
                            onPress={() => setIsOpen(!isOpen)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: colors.background.tertiary,
                                borderRadius: 12,
                                padding: 14,
                                borderWidth: error ? 1 : 0,
                                borderColor: error ? colors.semantic.error : undefined,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 18,
                                        backgroundColor: selectedCustomer
                                            ? colors.modules.crmLight
                                            : colors.surface.primary,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12,
                                    }}
                                >
                                    {selectedCustomer?.customerType === 'Corporate' ? (
                                        <Building2 size={18} color={selectedCustomer ? colors.modules.crm : colors.text.tertiary} />
                                    ) : (
                                        <User size={18} color={selectedCustomer ? colors.modules.crm : colors.text.tertiary} />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            color: selectedCustomer ? colors.text.primary : colors.text.tertiary,
                                            fontSize: 15,
                                            fontWeight: selectedCustomer ? '500' : '400',
                                        }}
                                        numberOfLines={1}
                                    >
                                        {selectedCustomer?.companyName || placeholder}
                                    </Text>
                                    {selectedCustomer?.contactPerson && (
                                        <Text
                                            style={{
                                                color: colors.text.tertiary,
                                                fontSize: 12,
                                                marginTop: 2,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {selectedCustomer.contactPerson}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {selectedCustomer && (
                                    <Pressable
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            onChange('');
                                        }}
                                        style={{ marginRight: 8 }}
                                        hitSlop={8}
                                    >
                                        <X size={18} color={colors.text.tertiary} />
                                    </Pressable>
                                )}
                                <ChevronDown
                                    size={20}
                                    color={colors.text.tertiary}
                                    style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                                />
                            </View>
                        </Pressable>

                        {/* Dropdown */}
                        {isOpen && (
                            <View
                                style={{
                                    marginTop: 8,
                                    backgroundColor: colors.surface.primary,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: colors.border.primary,
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Search Input */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: 12,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.border.primary,
                                    }}
                                >
                                    <Search size={18} color={colors.text.tertiary} />
                                    <TextInput
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        placeholder="Müşteri ara..."
                                        placeholderTextColor={colors.text.tertiary}
                                        style={{
                                            flex: 1,
                                            marginLeft: 8,
                                            color: colors.text.primary,
                                            fontSize: 14,
                                        }}
                                        autoFocus
                                    />
                                    {searchQuery.length > 0 && (
                                        <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                                            <X size={16} color={colors.text.tertiary} />
                                        </Pressable>
                                    )}
                                </View>

                                {/* Customer List */}
                                <ScrollView
                                    style={{ maxHeight: 250 }}
                                    nestedScrollEnabled
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {isLoading ? (
                                        <View style={{ padding: 20, alignItems: 'center' }}>
                                            <Text style={{ color: colors.text.tertiary }}>Yükleniyor...</Text>
                                        </View>
                                    ) : filteredCustomers.length === 0 ? (
                                        <View style={{ padding: 20, alignItems: 'center' }}>
                                            <Text style={{ color: colors.text.tertiary }}>
                                                {searchQuery ? 'Müşteri bulunamadı' : 'Henüz müşteri yok'}
                                            </Text>
                                        </View>
                                    ) : (
                                        filteredCustomers.map((customer) => {
                                            const isSelected = value === customer.id;

                                            return (
                                                <Pressable
                                                    key={customer.id}
                                                    onPress={() => {
                                                        onChange(customer.id);
                                                        setIsOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        padding: 12,
                                                        backgroundColor: isSelected
                                                            ? colors.brand.primary + '20'
                                                            : 'transparent',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 16,
                                                            backgroundColor: colors.modules.crmLight,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginRight: 12,
                                                        }}
                                                    >
                                                        {customer.customerType === 'Corporate' ? (
                                                            <Building2 size={16} color={colors.modules.crm} />
                                                        ) : (
                                                            <User size={16} color={colors.modules.crm} />
                                                        )}
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Text
                                                            style={{
                                                                color: isSelected
                                                                    ? colors.brand.primary
                                                                    : colors.text.primary,
                                                                fontSize: 14,
                                                                fontWeight: isSelected ? '600' : '500',
                                                            }}
                                                            numberOfLines={1}
                                                        >
                                                            {customer.companyName}
                                                        </Text>
                                                        {customer.contactPerson && (
                                                            <Text
                                                                style={{
                                                                    color: colors.text.tertiary,
                                                                    fontSize: 12,
                                                                }}
                                                                numberOfLines={1}
                                                            >
                                                                {customer.contactPerson}
                                                            </Text>
                                                        )}
                                                    </View>
                                                    {isSelected && (
                                                        <Check size={18} color={colors.brand.primary} />
                                                    )}
                                                </Pressable>
                                            );
                                        })
                                    )}
                                </ScrollView>
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
