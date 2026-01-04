import React from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, FileText, User, ShoppingCart, Receipt } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useCreateInvoice } from '@/lib/api/hooks/useSales';
import { PageHeader } from '@/components/ui';
import { FormSection, FormInput, DatePicker } from '@/components/form';
import { CustomerSelector, ProductSelector } from '@/components/sales';
import { createInvoiceSchema, type CreateInvoiceFormData } from '@/lib/validation/sales.schemas';

export default function AddInvoiceScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const { mutate: createInvoice, isPending } = useCreateInvoice();

    // Default due date: 30 days from now
    const getDefaultDueDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateInvoiceFormData>({
        resolver: zodResolver(createInvoiceSchema) as any,
        defaultValues: {
            customerId: '',
            dueDate: getDefaultDueDate(),
            notes: '',
            items: [],
        },
    });

    const onSubmit = (data: CreateInvoiceFormData) => {
        createInvoice(
            {
                customerId: data.customerId,
                dueDate: data.dueDate,
                notes: data.notes || undefined,
                items: data.items.map(({ productName, ...item }) => item),
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'Fatura başarıyla oluşturuldu', [
                        { text: 'Tamam', onPress: () => router.back() },
                    ]);
                },
                onError: () => {
                    Alert.alert('Hata', 'Fatura oluşturulurken bir hata oluştu');
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
                    title="Yeni Fatura"
                    subtitle="Satış"
                    primaryAction={{
                        icon: Save,
                        label: 'Oluştur',
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
