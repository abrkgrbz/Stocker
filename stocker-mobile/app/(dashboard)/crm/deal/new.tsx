import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    Save,
    Target,
    DollarSign,
    Calendar,
    User,
    FileText,
    ChevronDown,
    Percent,
    Building2,
    Search,
    X
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useCreateDeal, useCustomers } from '@/lib/api/hooks/useCRM';
import { useToast } from '@/components/ui';
import type { DealStage, Customer } from '@/lib/api/types/crm.types';

const DEAL_STAGES: { value: DealStage; label: string; color: string }[] = [
    { value: 'lead', label: 'Potansiyel', color: '#64748b' },
    { value: 'qualified', label: 'Nitelikli', color: '#3b82f6' },
    { value: 'proposal', label: 'Teklif', color: '#8b5cf6' },
    { value: 'negotiation', label: 'Müzakere', color: '#f59e0b' },
];

const PROBABILITY_OPTIONS = [10, 25, 50, 75, 90];

export default function NewDealScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const toast = useToast();

    const { mutate: createDeal, isPending } = useCreateDeal();
    const { data: customersData } = useCustomers({ pageSize: 100 });
    const customers = customersData?.items || [];

    const [formData, setFormData] = useState({
        title: '',
        customerId: '',
        customerName: '',
        value: '',
        currency: 'TRY',
        stage: 'lead' as DealStage,
        probability: 25,
        expectedCloseDate: '',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showStagePicker, setShowStagePicker] = useState(false);
    const [showCustomerPicker, setShowCustomerPicker] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');

    const filteredCustomers = customers.filter(c =>
        c.companyName.toLowerCase().includes(customerSearch.toLowerCase())
    );

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Fırsat adı zorunludur';
        }
        if (!formData.customerId) {
            newErrors.customerId = 'Müşteri seçimi zorunludur';
        }
        if (!formData.value || isNaN(parseFloat(formData.value))) {
            newErrors.value = 'Geçerli bir tutar girin';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        createDeal(
            {
                title: formData.title.trim(),
                customerId: formData.customerId,
                value: parseFloat(formData.value),
                currency: formData.currency,
                stage: formData.stage,
                probability: formData.probability,
                expectedCloseDate: formData.expectedCloseDate || undefined,
                notes: formData.notes.trim() || undefined,
            },
            {
                onSuccess: () => {
                    toast.success('Başarılı', 'Fırsat başarıyla oluşturuldu');
                    router.back();
                },
                onError: () => {
                    toast.error('Hata', 'Fırsat oluşturulurken bir hata oluştu');
                }
            }
        );
    };

    const selectCustomer = (customer: Customer) => {
        setFormData(prev => ({
            ...prev,
            customerId: customer.id,
            customerName: customer.companyName
        }));
        setShowCustomerPicker(false);
        setCustomerSearch('');
    };

    const FormInput = ({
        label,
        value,
        onChangeText,
        placeholder,
        error,
        keyboardType = 'default',
        icon: Icon,
        multiline = false,
    }: {
        label: string;
        value: string;
        onChangeText: (text: string) => void;
        placeholder: string;
        error?: string;
        keyboardType?: 'default' | 'numeric' | 'decimal-pad';
        icon: any;
        multiline?: boolean;
    }) => (
        <View style={{ marginBottom: 16 }}>
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
                <Icon size={20} color={colors.text.tertiary} />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    style={{
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                        color: colors.text.primary,
                        fontSize: 15,
                        minHeight: multiline ? 80 : undefined,
                        textAlignVertical: multiline ? 'top' : 'center',
                    }}
                />
            </View>
            {error && (
                <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 4 }}>
                    {error}
                </Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <Animated.View
                    entering={FadeIn.duration(400)}
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: colors.surface.primary,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border.primary
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Pressable onPress={() => router.back()} style={{ marginRight: 12, padding: 8, marginLeft: -8 }}>
                                <ArrowLeft size={24} color={colors.text.primary} />
                            </Pressable>
                            <View>
                                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                                    Yeni Fırsat
                                </Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                    CRM
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={handleSubmit}
                            disabled={isPending}
                            style={{
                                backgroundColor: colors.brand.primary,
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                borderRadius: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                opacity: isPending ? 0.7 : 1,
                            }}
                        >
                            {isPending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Save size={18} color="#fff" />
                                    <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6 }}>
                                        Kaydet
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </Animated.View>

                <ScrollView
                    contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Basic Info */}
                    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.modules.crmLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <Target size={20} color={colors.modules.crm} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    Fırsat Bilgileri
                                </Text>
                            </View>

                            <FormInput
                                label="Fırsat Adı *"
                                value={formData.title}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                                placeholder="Örn: Yıllık Bakım Sözleşmesi"
                                error={errors.title}
                                icon={Target}
                            />

                            {/* Customer Selection */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                    Müşteri *
                                </Text>
                                <Pressable
                                    onPress={() => setShowCustomerPicker(true)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: colors.background.tertiary,
                                        borderRadius: 12,
                                        padding: 14,
                                        borderWidth: 1,
                                        borderColor: errors.customerId ? colors.semantic.error : colors.border.primary,
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Building2 size={20} color={colors.text.tertiary} />
                                        <Text style={{
                                            color: formData.customerName ? colors.text.primary : colors.text.tertiary,
                                            fontSize: 15,
                                            marginLeft: 12
                                        }}>
                                            {formData.customerName || 'Müşteri seçin'}
                                        </Text>
                                    </View>
                                    <ChevronDown size={20} color={colors.text.tertiary} />
                                </Pressable>
                                {errors.customerId && (
                                    <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 4 }}>
                                        {errors.customerId}
                                    </Text>
                                )}
                            </View>

                            {/* Stage Selection */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                    Aşama
                                </Text>
                                <Pressable
                                    onPress={() => setShowStagePicker(!showStagePicker)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: colors.background.tertiary,
                                        borderRadius: 12,
                                        padding: 14,
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View
                                            style={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: 6,
                                                backgroundColor: DEAL_STAGES.find(s => s.value === formData.stage)?.color,
                                                marginRight: 12
                                            }}
                                        />
                                        <Text style={{ color: colors.text.primary, fontSize: 15 }}>
                                            {DEAL_STAGES.find(s => s.value === formData.stage)?.label}
                                        </Text>
                                    </View>
                                    <ChevronDown size={20} color={colors.text.tertiary} />
                                </Pressable>

                                {showStagePicker && (
                                    <View style={{ marginTop: 8 }}>
                                        {DEAL_STAGES.map((stage) => (
                                            <Pressable
                                                key={stage.value}
                                                onPress={() => {
                                                    setFormData(prev => ({ ...prev, stage: stage.value }));
                                                    setShowStagePicker(false);
                                                }}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    padding: 12,
                                                    borderRadius: 8,
                                                    backgroundColor: formData.stage === stage.value
                                                        ? stage.color + '20'
                                                        : 'transparent',
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: 5,
                                                        backgroundColor: stage.color,
                                                        marginRight: 12
                                                    }}
                                                />
                                                <Text style={{
                                                    color: formData.stage === stage.value
                                                        ? stage.color
                                                        : colors.text.primary,
                                                    fontSize: 14,
                                                    fontWeight: formData.stage === stage.value ? '600' : '400'
                                                }}>
                                                    {stage.label}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    </Animated.View>

                    {/* Value & Probability */}
                    <Animated.View entering={FadeInDown.duration(400).delay(150)}>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.semantic.successLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <DollarSign size={20} color={colors.semantic.success} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    Değer ve Olasılık
                                </Text>
                            </View>

                            <FormInput
                                label="Tahmini Değer *"
                                value={formData.value}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, value: text }))}
                                placeholder="50000"
                                error={errors.value}
                                keyboardType="decimal-pad"
                                icon={DollarSign}
                            />

                            {/* Probability */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 8 }}>
                                    Kazanma Olasılığı: %{formData.probability}
                                </Text>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    {PROBABILITY_OPTIONS.map((prob) => (
                                        <Pressable
                                            key={prob}
                                            onPress={() => setFormData(prev => ({ ...prev, probability: prob }))}
                                            style={{
                                                flex: 1,
                                                paddingVertical: 10,
                                                borderRadius: 8,
                                                backgroundColor: formData.probability === prob
                                                    ? colors.brand.primary
                                                    : colors.background.tertiary,
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{
                                                color: formData.probability === prob ? '#fff' : colors.text.secondary,
                                                fontSize: 13,
                                                fontWeight: '500'
                                            }}>
                                                %{prob}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            <FormInput
                                label="Beklenen Kapanış Tarihi"
                                value={formData.expectedCloseDate}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, expectedCloseDate: text }))}
                                placeholder="YYYY-MM-DD"
                                icon={Calendar}
                            />
                        </View>
                    </Animated.View>

                    {/* Notes */}
                    <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <FormInput
                                label="Notlar"
                                value={formData.notes}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                                placeholder="Fırsat hakkında notlar (opsiyonel)"
                                icon={FileText}
                                multiline
                            />
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Customer Picker Modal */}
            <Modal
                visible={showCustomerPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCustomerPicker(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            maxHeight: '70%',
                        }}
                    >
                        {/* Modal Header */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 16,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border.primary
                            }}
                        >
                            <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                                Müşteri Seç
                            </Text>
                            <Pressable onPress={() => setShowCustomerPicker(false)}>
                                <X size={24} color={colors.text.secondary} />
                            </Pressable>
                        </View>

                        {/* Search */}
                        <View style={{ padding: 16, paddingBottom: 8 }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: colors.background.tertiary,
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                }}
                            >
                                <Search size={20} color={colors.text.tertiary} />
                                <TextInput
                                    value={customerSearch}
                                    onChangeText={setCustomerSearch}
                                    placeholder="Müşteri ara..."
                                    placeholderTextColor={colors.text.tertiary}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 12,
                                        paddingHorizontal: 12,
                                        color: colors.text.primary,
                                        fontSize: 15,
                                    }}
                                />
                            </View>
                        </View>

                        {/* Customer List */}
                        <ScrollView style={{ padding: 16, paddingTop: 0 }}>
                            {filteredCustomers.map((customer) => (
                                <Pressable
                                    key={customer.id}
                                    onPress={() => selectCustomer(customer)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: 14,
                                        borderRadius: 12,
                                        marginBottom: 8,
                                        backgroundColor: formData.customerId === customer.id
                                            ? colors.brand.primary + '20'
                                            : colors.background.tertiary,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            backgroundColor: colors.modules.crmLight,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 12
                                        }}
                                    >
                                        <Building2 size={20} color={colors.modules.crm} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            color: colors.text.primary,
                                            fontSize: 15,
                                            fontWeight: formData.customerId === customer.id ? '600' : '400'
                                        }}>
                                            {customer.companyName}
                                        </Text>
                                        {customer.email && (
                                            <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                                {customer.email}
                                            </Text>
                                        )}
                                    </View>
                                </Pressable>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
                                        Müşteri bulunamadı
                                    </Text>
                                </View>
                            )}
                            <View style={{ height: insets.bottom + 20 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
