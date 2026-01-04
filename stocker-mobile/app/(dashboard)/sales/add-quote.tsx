import React from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, FileText, User, ShoppingCart, Calendar } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useCreateQuote } from '@/lib/api/hooks/useSales';
import { PageHeader } from '@/components/ui';
import { FormSection, FormInput, DatePicker } from '@/components/form';
import { CustomerSelector, ProductSelector } from '@/components/sales';
import { createQuoteSchema, type CreateQuoteFormData } from '@/lib/validation/sales.schemas';

export default function AddQuoteScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const { mutate: createQuote, isPending } = useCreateQuote();

    // Default valid until: 15 days from now
    const getDefaultValidUntil = () => {
        const date = new Date();
        date.setDate(date.getDate() + 15);
        return date.toISOString().split('T')[0];
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateQuoteFormData>({
        resolver: zodResolver(createQuoteSchema),
        defaultValues: {
            customerId: '',
            validUntil: getDefaultValidUntil(),
            notes: '',
            items: [],
        },
    });

    const onSubmit = (data: CreateQuoteFormData) => {
        createQuote(
            {
                customerId: data.customerId,
                validUntil: data.validUntil,
                notes: data.notes || undefined,
                items: data.items.map(({ productName, ...item }) => item),
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'Teklif başarıyla oluşturuldu', [
                        { text: 'Tamam', onPress: () => router.back() },
                    ]);
                },
                onError: () => {
                    Alert.alert('Hata', 'Teklif oluşturulurken bir hata oluştu');
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
                    title="Yeni Teklif"
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
