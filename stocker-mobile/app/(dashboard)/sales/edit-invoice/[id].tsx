import React, { useEffect } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, FileText, User, Receipt, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useInvoice, useUpdateInvoice } from '@/lib/api/hooks/useSales';
import { PageHeader } from '@/components/ui';
import { FormSection, FormInput, DatePicker } from '@/components/form';
import { CustomerSelector, ProductSelector } from '@/components/sales';
import { createInvoiceSchema, type CreateInvoiceFormData } from '@/lib/validation/sales.schemas';

export default function EditInvoiceScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const { data: invoice, isLoading: invoiceLoading, isError: invoiceError } = useInvoice(id || '');
    const { mutate: updateInvoice, isPending } = useUpdateInvoice();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateInvoiceFormData>({
        resolver: zodResolver(createInvoiceSchema),
        defaultValues: {
            customerId: '',
            dueDate: '',
            notes: '',
            items: [],
        },
    });

    // Load existing invoice data into form
    useEffect(() => {
        if (invoice) {
            reset({
                customerId: invoice.customerId || '',
                dueDate: invoice.dueDate?.split('T')[0] || '',
                notes: invoice.notes || '',
                items: invoice.items?.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discountPercent: item.discountPercent || 0,
                    taxPercent: item.taxPercent || 18,
                })) || [],
            });
        }
    }, [invoice, reset]);

    const onSubmit = (data: CreateInvoiceFormData) => {
        if (!id) return;

        updateInvoice(
            {
                id,
                data: {
                    customerId: data.customerId,
                    dueDate: data.dueDate,
                    notes: data.notes || undefined,
                    items: data.items.map(({ productName, ...item }) => item),
                },
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'Fatura başarıyla güncellendi', [
                        { text: 'Tamam', onPress: () => router.back() },
                    ]);
                },
                onError: () => {
                    Alert.alert('Hata', 'Fatura güncellenirken bir hata oluştu');
                },
            }
        );
    };

    if (invoiceLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.modules.sales} />
                    <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
                        Fatura yükleniyor...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (invoiceError || !invoice) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={48} color={colors.semantic.error} />
                    <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginTop: 12 }}>
                        Fatura bulunamadı
                    </Text>
                    <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
                        <Text style={{ color: colors.brand.primary }}>Geri Dön</Text>
                    </Pressable>
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
                    title="Fatura Düzenle"
                    subtitle={invoice.invoiceNumber}
                    primaryAction={{
                        icon: Save,
                        label: 'Kaydet',
                        onPress: handleSubmit(onSubmit),
                        variant: 'button',
                        loading: isPending,
                        disabled: isPending,
                        backgroundColor: colors.modules.sales,
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
                        title="Kalemler"
                        icon={Receipt}
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
                            moduleColor={colors.modules.sales}
                            moduleLightColor={colors.modules.salesLight}
                        />
                    </FormSection>

                    {/* Due Date & Notes */}
                    <FormSection
                        title="Detaylar"
                        icon={FileText}
                        iconBgColor={colors.modules.salesLight}
                        iconColor={colors.modules.sales}
                        animationDelay={200}
                    >
                        <DatePicker
                            name="dueDate"
                            control={control}
                            label="Vade Tarihi *"
                            placeholder="Tarih seçin"
                            minimumDate={new Date()}
                        />

                        <FormInput
                            name="notes"
                            control={control}
                            label="Notlar (Opsiyonel)"
                            placeholder="Fatura notları..."
                            icon={FileText}
                            multiline
                        />
                    </FormSection>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
