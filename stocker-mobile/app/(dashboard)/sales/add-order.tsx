import React from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, FileText, User, ShoppingCart } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useCreateOrder } from '@/lib/api/hooks/useSales';
import { PageHeader } from '@/components/ui';
import { FormSection, FormInput, DatePicker } from '@/components/form';
import { CustomerSelector, ProductSelector } from '@/components/sales';
import { createOrderSchema, type CreateOrderFormData } from '@/lib/validation/sales.schemas';

export default function AddOrderScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const { mutate: createOrder, isPending } = useCreateOrder();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateOrderFormData>({
        resolver: zodResolver(createOrderSchema) as any,
        defaultValues: {
            customerId: '',
            deliveryDate: '',
            notes: '',
            items: [],
        },
    });

    const onSubmit = (data: CreateOrderFormData) => {
        createOrder(
            {
                customerId: data.customerId,
                deliveryDate: data.deliveryDate || undefined,
                notes: data.notes || undefined,
                items: data.items.map(({ productName, ...item }) => item),
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'Sipariş başarıyla oluşturuldu', [
                        { text: 'Tamam', onPress: () => router.back() },
                    ]);
                },
                onError: () => {
                    Alert.alert('Hata', 'Sipariş oluşturulurken bir hata oluştu');
                },
            }
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <PageHeader
                    title="Yeni Sipariş"
                    subtitle="Satış"
                    primaryAction={{
                        icon: Save,
                        label: 'Oluştur',
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
