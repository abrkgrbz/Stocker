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
    Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    User,
    Save,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Calendar,
    Hash,
    ChevronDown,
    UserCircle
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useDepartments, usePositions, useCreateEmployee } from '@/lib/api/hooks/useHR';

export default function AddEmployeeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const { data: departments } = useDepartments();
    const { data: positions } = usePositions();
    const createEmployee = useCreateEmployee();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        departmentId: '',
        positionId: '',
        hireDate: new Date().toISOString().split('T')[0],
        employeeNumber: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
    const [showPositionPicker, setShowPositionPicker] = useState(false);

    const selectedDepartment = departments?.find(d => d.id === formData.departmentId);
    const selectedPosition = positions?.find(p => p.id === formData.positionId);
    const filteredPositions = formData.departmentId
        ? positions?.filter(p => p.departmentId === formData.departmentId)
        : positions;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Ad zorunludur';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Soyad zorunludur';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'E-posta zorunludur';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }
        if (!formData.departmentId) {
            newErrors.departmentId = 'Departman seçimi zorunludur';
        }
        if (!formData.positionId) {
            newErrors.positionId = 'Pozisyon seçimi zorunludur';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        createEmployee.mutate(
            {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim() || undefined,
                departmentId: formData.departmentId,
                positionId: formData.positionId,
                hireDate: formData.hireDate,
                employeeNumber: formData.employeeNumber.trim() || undefined,
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'Çalışan başarıyla eklendi', [
                        { text: 'Tamam', onPress: () => router.back() }
                    ]);
                },
                onError: (error: any) => {
                    const message = error?.response?.data?.message || 'Çalışan eklenirken bir hata oluştu';
                    Alert.alert('Hata', message);
                },
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
        autoCapitalize = 'sentences',
    }: {
        label: string;
        value: string;
        onChangeText: (text: string) => void;
        placeholder: string;
        error?: string;
        keyboardType?: 'default' | 'email-address' | 'phone-pad';
        icon: any;
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
                    style={{
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                        color: colors.text.primary,
                        fontSize: 15,
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
                                    Yeni Çalışan
                                </Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                    Çalışan bilgilerini girin
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={handleSubmit}
                            disabled={createEmployee.isPending}
                            style={{
                                backgroundColor: colors.brand.primary,
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                borderRadius: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                opacity: createEmployee.isPending ? 0.7 : 1,
                            }}
                        >
                            {createEmployee.isPending ? (
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
                    {/* Personal Info */}
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
                                        backgroundColor: colors.modules.hrLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <User size={20} color={colors.modules.hr} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    Kişisel Bilgiler
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <FormInput
                                        label="Ad *"
                                        value={formData.firstName}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                                        placeholder="Ad"
                                        error={errors.firstName}
                                        icon={UserCircle}
                                        autoCapitalize="words"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <FormInput
                                        label="Soyad *"
                                        value={formData.lastName}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                                        placeholder="Soyad"
                                        error={errors.lastName}
                                        icon={UserCircle}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>

                            <FormInput
                                label="E-posta *"
                                value={formData.email}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                                placeholder="ornek@firma.com"
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

                    {/* Employment Info */}
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
                                        backgroundColor: colors.semantic.infoLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    <Briefcase size={20} color={colors.semantic.info} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    İş Bilgileri
                                </Text>
                            </View>

                            <FormInput
                                label="Sicil No"
                                value={formData.employeeNumber}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, employeeNumber: text }))}
                                placeholder="EMP-001"
                                icon={Hash}
                            />

                            {/* Department Picker */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                    Departman *
                                </Text>
                                <Pressable
                                    onPress={() => setShowDepartmentPicker(!showDepartmentPicker)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: colors.background.tertiary,
                                        borderRadius: 12,
                                        padding: 14,
                                        borderWidth: errors.departmentId ? 1 : 0,
                                        borderColor: colors.semantic.error,
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Building2 size={20} color={colors.text.tertiary} />
                                        <Text style={{
                                            color: selectedDepartment ? colors.text.primary : colors.text.tertiary,
                                            fontSize: 15,
                                            marginLeft: 12
                                        }}>
                                            {selectedDepartment?.name || 'Departman seçin'}
                                        </Text>
                                    </View>
                                    <ChevronDown size={20} color={colors.text.tertiary} />
                                </Pressable>

                                {showDepartmentPicker && departments && (
                                    <View style={{ marginTop: 8, maxHeight: 200 }}>
                                        <ScrollView nestedScrollEnabled>
                                            {departments.map((dept) => (
                                                <Pressable
                                                    key={dept.id}
                                                    onPress={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            departmentId: dept.id,
                                                            positionId: ''
                                                        }));
                                                        setShowDepartmentPicker(false);
                                                    }}
                                                    style={{
                                                        padding: 12,
                                                        borderRadius: 8,
                                                        backgroundColor: formData.departmentId === dept.id
                                                            ? colors.brand.primary + '20'
                                                            : 'transparent',
                                                    }}
                                                >
                                                    <Text style={{
                                                        color: formData.departmentId === dept.id
                                                            ? colors.brand.primary
                                                            : colors.text.primary,
                                                        fontSize: 14,
                                                        fontWeight: '500'
                                                    }}>
                                                        {dept.name}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {errors.departmentId && (
                                    <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 4 }}>
                                        {errors.departmentId}
                                    </Text>
                                )}
                            </View>

                            {/* Position Picker */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                    Pozisyon *
                                </Text>
                                <Pressable
                                    onPress={() => setShowPositionPicker(!showPositionPicker)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: colors.background.tertiary,
                                        borderRadius: 12,
                                        padding: 14,
                                        borderWidth: errors.positionId ? 1 : 0,
                                        borderColor: colors.semantic.error,
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Briefcase size={20} color={colors.text.tertiary} />
                                        <Text style={{
                                            color: selectedPosition ? colors.text.primary : colors.text.tertiary,
                                            fontSize: 15,
                                            marginLeft: 12
                                        }}>
                                            {selectedPosition?.title || 'Pozisyon seçin'}
                                        </Text>
                                    </View>
                                    <ChevronDown size={20} color={colors.text.tertiary} />
                                </Pressable>

                                {showPositionPicker && filteredPositions && (
                                    <View style={{ marginTop: 8, maxHeight: 200 }}>
                                        <ScrollView nestedScrollEnabled>
                                            {filteredPositions.map((pos) => (
                                                <Pressable
                                                    key={pos.id}
                                                    onPress={() => {
                                                        setFormData(prev => ({ ...prev, positionId: pos.id }));
                                                        setShowPositionPicker(false);
                                                    }}
                                                    style={{
                                                        padding: 12,
                                                        borderRadius: 8,
                                                        backgroundColor: formData.positionId === pos.id
                                                            ? colors.brand.primary + '20'
                                                            : 'transparent',
                                                    }}
                                                >
                                                    <Text style={{
                                                        color: formData.positionId === pos.id
                                                            ? colors.brand.primary
                                                            : colors.text.primary,
                                                        fontSize: 14,
                                                        fontWeight: '500'
                                                    }}>
                                                        {pos.title}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {errors.positionId && (
                                    <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 4 }}>
                                        {errors.positionId}
                                    </Text>
                                )}
                            </View>

                            {/* Hire Date */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                    İşe Başlama Tarihi
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
                                    <Calendar size={20} color={colors.text.tertiary} />
                                    <Text style={{ color: colors.text.primary, fontSize: 15, marginLeft: 12 }}>
                                        {new Date(formData.hireDate).toLocaleDateString('tr-TR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
