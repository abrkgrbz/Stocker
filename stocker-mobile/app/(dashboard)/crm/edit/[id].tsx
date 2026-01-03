import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    User,
    Save,
    Mail,
    Phone,
    Building2,
    MapPin,
    Globe,
    FileText,
    Tag,
    ChevronDown
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useCustomer, useUpdateCustomer } from '@/lib/api/hooks/useCRM';
import type { CustomerType } from '@/lib/api/types/crm.types';

const CUSTOMER_TYPES: { value: CustomerType; label: string }[] = [
    { value: 'individual', label: 'Bireysel' },
    { value: 'company', label: 'Kurumsal' },
];

export default function EditCustomerScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const { data: customer, isLoading: isLoadingCustomer } = useCustomer(id || '');
    const { mutate: updateCustomer, isPending } = useUpdateCustomer();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        city: '',
        country: '',
        type: 'individual' as CustomerType,
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showTypePicker, setShowTypePicker] = useState(false);

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                company: customer.company || '',
                address: customer.address || '',
                city: customer.city || '',
                country: customer.country || 'Türkiye',
                type: customer.type || 'individual',
                notes: customer.notes || '',
            });
        }
    }, [customer]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Müşteri adı zorunludur';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        updateCustomer(
            {
                id: id || '',
                data: {
                    name: formData.name.trim(),
                    email: formData.email.trim() || undefined,
                    phone: formData.phone.trim() || undefined,
                    company: formData.company.trim() || undefined,
                    address: formData.address.trim() || undefined,
                    city: formData.city.trim() || undefined,
                    country: formData.country.trim() || undefined,
                    type: formData.type,
                    notes: formData.notes.trim() || undefined,
                }
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'Müşteri başarıyla güncellendi', [
                        { text: 'Tamam', onPress: () => router.back() }
                    ]);
                },
                onError: () => {
                    Alert.alert('Hata', 'Müşteri güncellenirken bir hata oluştu');
                }
            }
        );
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
        autoCapitalize = 'sentences',
    }: {
        label: string;
        value: string;
        onChangeText: (text: string) => void;
        placeholder: string;
        error?: string;
        keyboardType?: 'default' | 'email-address' | 'phone-pad';
        icon: any;
        multiline?: boolean;
        autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
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
                    autoCapitalize={autoCapitalize}
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

    if (isLoadingCustomer) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                    <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
                        Müşteri yükleniyor...
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
                <Animated.View
                    entering={FadeIn.duration(400)}
                    className="px-4 py-3"
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border.primary
                    }}
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <Pressable onPress={() => router.back()} className="mr-3 p-2 -ml-2">
                                <ArrowLeft size={24} color={colors.text.primary} />
                            </Pressable>
                            <View>
                                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                                    Müşteriyi Düzenle
                                </Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                    {customer?.code || id}
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
                            <View className="flex-row items-center mb-4">
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
                                    <User size={20} color={colors.modules.crm} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    Temel Bilgiler
                                </Text>
                            </View>

                            <FormInput
                                label="Müşteri Adı *"
                                value={formData.name}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                                placeholder="Ad Soyad veya Firma Adı"
                                error={errors.name}
                                icon={User}
                                autoCapitalize="words"
                            />

                            {/* Customer Type */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                    Müşteri Tipi
                                </Text>
                                <Pressable
                                    onPress={() => setShowTypePicker(!showTypePicker)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: colors.background.tertiary,
                                        borderRadius: 12,
                                        padding: 14,
                                    }}
                                >
                                    <View className="flex-row items-center">
                                        <Tag size={20} color={colors.text.tertiary} />
                                        <Text style={{ color: colors.text.primary, fontSize: 15, marginLeft: 12 }}>
                                            {CUSTOMER_TYPES.find(t => t.value === formData.type)?.label}
                                        </Text>
                                    </View>
                                    <ChevronDown size={20} color={colors.text.tertiary} />
                                </Pressable>

                                {showTypePicker && (
                                    <View style={{ marginTop: 8 }}>
                                        {CUSTOMER_TYPES.map((type) => (
                                            <Pressable
                                                key={type.value}
                                                onPress={() => {
                                                    setFormData(prev => ({ ...prev, type: type.value }));
                                                    setShowTypePicker(false);
                                                }}
                                                style={{
                                                    padding: 12,
                                                    borderRadius: 8,
                                                    backgroundColor: formData.type === type.value
                                                        ? colors.brand.primary + '20'
                                                        : 'transparent',
                                                }}
                                            >
                                                <Text style={{
                                                    color: formData.type === type.value
                                                        ? colors.brand.primary
                                                        : colors.text.primary,
                                                    fontSize: 14
                                                }}>
                                                    {type.label}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <FormInput
                                label="Şirket"
                                value={formData.company}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, company: text }))}
                                placeholder="Şirket adı (opsiyonel)"
                                icon={Building2}
                                autoCapitalize="words"
                            />
                        </View>
                    </Animated.View>

                    {/* Contact Info */}
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
                            <View className="flex-row items-center mb-4">
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.semantic.infoLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <Phone size={20} color={colors.semantic.info} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    İletişim Bilgileri
                                </Text>
                            </View>

                            <FormInput
                                label="E-posta"
                                value={formData.email}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                                placeholder="ornek@email.com"
                                error={errors.email}
                                keyboardType="email-address"
                                icon={Mail}
                                autoCapitalize="none"
                            />

                            <FormInput
                                label="Telefon"
                                value={formData.phone}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                                placeholder="+90 5XX XXX XX XX"
                                keyboardType="phone-pad"
                                icon={Phone}
                            />
                        </View>
                    </Animated.View>

                    {/* Address */}
                    <Animated.View entering={FadeInDown.duration(400).delay(200)}>
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
                            <View className="flex-row items-center mb-4">
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.semantic.warningLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <MapPin size={20} color={colors.semantic.warning} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    Adres Bilgileri
                                </Text>
                            </View>

                            <FormInput
                                label="Adres"
                                value={formData.address}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                                placeholder="Sokak, mahalle, bina no"
                                icon={MapPin}
                                multiline
                            />

                            <View className="flex-row">
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <FormInput
                                        label="Şehir"
                                        value={formData.city}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
                                        placeholder="İstanbul"
                                        icon={Building2}
                                        autoCapitalize="words"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <FormInput
                                        label="Ülke"
                                        value={formData.country}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, country: text }))}
                                        placeholder="Türkiye"
                                        icon={Globe}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Notes */}
                    <Animated.View entering={FadeInDown.duration(400).delay(250)}>
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
                                placeholder="Müşteri hakkında notlar (opsiyonel)"
                                icon={FileText}
                                multiline
                            />
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
