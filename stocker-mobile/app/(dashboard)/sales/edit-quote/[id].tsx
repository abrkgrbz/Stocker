import React, { useEffect } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, FileText, User, ShoppingCart, Calendar, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useQuote, useUpdateQuote } from '@/lib/api/hooks/useSales';
import { PageHeader } from '@/components/ui';
import { FormSection, FormInput, DatePicker } from '@/components/form';
import { CustomerSelector, ProductSelector } from '@/components/sales';
import { createQuoteSchema, type CreateQuoteFormData } from '@/lib/validation/sales.schemas';

export default function EditQuoteScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const { data: quote, isLoading: isLoadingQuote, isError: quoteError } = useQuote(id || '');
    const { mutate: updateQuote, isPending } = useUpdateQuote();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateQuoteFormData>({
        resolver: zodResolver(createQuoteSchema),
        defaultValues: {
            customerId: '',
            validUntil: '',
            notes: '',
            items: [],
        },
    });

    // Load existing quote data into form
    useEffect(() => {
        if (quote) {
            reset({
                customerId: quote.customerId || '',
                validUntil: quote.validUntil?.split('T')[0] || '',
                notes: quote.notes || '',
                items: quote.items?.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discountPercent: item.discountPercent || 0,
                    taxPercent: item.taxPercent || 18,
                })) || [],
            });
        }
    }, [quote, reset]);

    const onSubmit = (data: CreateQuoteFormData) => {
        if (!id) return;

        updateQuote(
            {
                id,
                data: {
                    validUntil: data.validUntil,
                    notes: data.notes || undefined,
                    items: data.items.map(({ productName, ...item }) => item),
                },
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'Teklif başarıyla güncellendi', [
                        { text: 'Tamam', onPress: () => router.back() },
                    ]);
                },
                onError: () => {
                    Alert.alert('Hata', 'Teklif güncellenirken bir hata oluştu');
                },
            }
        );
    };

    if (isLoadingQuote) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                    <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
                        Teklif yükleniyor...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (quoteError || !quote) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={48} color={colors.semantic.error} />
                    <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginTop: 12 }}>
                        Teklif bulunamadı
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
                    title="Teklif Düzenle"
                    subtitle={quote.quoteNumber}
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

                    {/* Valid Until Date */}
                    <FormSection
                        title="Geçerlilik"
                        icon={Calendar}
                        iconBgColor={colors.semantic.warningLight}
                        iconColor={colors.semantic.warning}
                        animationDelay={120}
                        error={!!errors.validUntil}
                    >
                        <DatePicker
                            name="validUntil"
                            control={control}
                            label="Geçerlilik Tarihi *"
                            placeholder="Tarih seçin"
                            minimumDate={new Date()}
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

                    {/* Notes */}
                    <FormSection
                        title="Notlar"
                        icon={FileText}
                        iconBgColor={colors.modules.salesLight}
                        iconColor={colors.modules.sales}
                        animationDelay={200}
                    >
                        <FormInput
                            name="notes"
                            control={control}
                            label="Notlar (Opsiyonel)"
                            placeholder="Teklif notları..."
                            icon={FileText}
                            multiline
                        />
                    </FormSection>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
