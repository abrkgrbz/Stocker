import React, { useEffect } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, FileText, User, ShoppingCart } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useOrder, useUpdateOrder } from '@/lib/api/hooks/useSales';
import { PageHeader } from '@/components/ui';
import { FormSection, FormInput, DatePicker } from '@/components/form';
import { CustomerSelector, ProductSelector } from '@/components/sales';
import { createOrderSchema, type CreateOrderFormData, type SalesItem } from '@/lib/validation/sales.schemas';

export default function EditOrderScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const { data: order, isLoading: isLoadingOrder } = useOrder(id || '');
    const { mutate: updateOrder, isPending } = useUpdateOrder();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateOrderFormData>({
        resolver: zodResolver(createOrderSchema) as any,
        defaultValues: {
            customerId: '',
            deliveryDate: '',
            notes: '',
            items: [],
        },
    });

    // Load existing order data into form
    useEffect(() => {
        if (order) {
            reset({
                customerId: order.customerId || '',
                deliveryDate: order.deliveryDate?.split('T')[0] || '',
                notes: order.notes || '',
                items: order.items?.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discountPercent: item.discountPercent || 0,
                    taxPercent: item.taxPercent || 18,
                })) || [],
            });
        }
    }, [order, reset]);

    const onSubmit = (data: CreateOrderFormData) => {
        if (!id) return;

        updateOrder(
            {
                id,
                data: {
                    deliveryDate: data.deliveryDate || undefined,
                    notes: data.notes || undefined,
                    items: data.items.map(({ productName, ...item }) => item),
                },
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'Sipariş başarıyla güncellendi', [
                        { text: 'Tamam', onPress: () => router.back() },
                    ]);
                },
                onError: () => {
                    Alert.alert('Hata', 'Sipariş güncellenirken bir hata oluştu');
                },
            }
        );
    };

    if (isLoadingOrder) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                    <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
                        Sipariş yükleniyor...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <PageHeader
                    title="Siparişi Düzenle"
                    subtitle={order?.orderNumber || id}
                    primaryAction={{
                        icon: Save,
                        label: 'Kaydet',
                        onPress: handleSubmit(onSubmit),
                        variant: 'button',
                        loading: isPending,
                        disabled: isPending,
                    }}
                />

                <ScrollView
                    contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Customer Selection */}
                    <FormSection
                        title="Müşteri"
                        icon={User}
                        iconBgColor={colors.modules.crmLight}
                        iconColor={colors.modules.crm}
                        animationDelay={100}
                        error={!!errors.customerId}
                    >
                        <CustomerSelector
                            name="customerId"
                            control={control}
                            label=""
                        />
                    </FormSection>

                    {/* Products */}
                    <FormSection
                        title="Ürünler"
                        icon={ShoppingCart}
                        iconBgColor={colors.modules.inventoryLight}
                        iconColor={colors.modules.inventory}
                        animationDelay={150}
                        error={!!errors.items}
                        style={{ paddingBottom: 8 }}
                    >
                        <ProductSelector
                            name="items"
                            control={control}
                            label=""
                            moduleColor={colors.modules.inventory}
                            moduleLightColor={colors.modules.inventoryLight}
                        />
                    </FormSection>

                    {/* Delivery Date & Notes */}
                    <FormSection
                        title="Detaylar"
                        icon={FileText}
                        iconBgColor={colors.modules.salesLight}
                        iconColor={colors.modules.sales}
                        animationDelay={200}
                    >
                        <DatePicker
                            name="deliveryDate"
                            control={control}
                            label="Teslimat Tarihi (Opsiyonel)"
                            placeholder="Tarih seçin"
                            minimumDate={new Date()}
                        />

                        <FormInput
                            name="notes"
                            control={control}
                            label="Notlar (Opsiyonel)"
                            placeholder="Sipariş notları..."
                            icon={FileText}
                            multiline
                        />
                    </FormSection>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
