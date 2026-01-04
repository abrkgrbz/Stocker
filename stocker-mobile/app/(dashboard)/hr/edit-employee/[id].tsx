import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    X,
    Save,
    User,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Calendar,
    Hash,
    ChevronDown,
    CheckCircle
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useEmployee, useDepartments, usePositions, useUpdateEmployee } from '@/lib/api/hooks/useHR';
import type { Department, Position, EmployeeStatus } from '@/lib/api/types/hr.types';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    employeeNumber: string;
    departmentId: string;
    positionId: string;
    hireDate: string;
    status: EmployeeStatus;
}

const STATUS_OPTIONS: { value: EmployeeStatus; label: string; color: string }[] = [
    { value: 'active', label: 'Aktif', color: '#22c55e' },
    { value: 'on_leave', label: 'İzinli', color: '#f59e0b' },
    { value: 'suspended', label: 'Askıda', color: '#ef4444' },
    { value: 'terminated', label: 'İşten Ayrıldı', color: '#64748b' },
];

export default function EditEmployeeScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const { data: employee, isLoading: isLoadingEmployee } = useEmployee(id || '');
    const { data: departments } = useDepartments();
    const { data: positions } = usePositions();
    const updateEmployee = useUpdateEmployee();

    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        employeeNumber: '',
        departmentId: '',
        positionId: '',
        hireDate: '',
        status: 'active'
    });

    const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
    const [showPositionPicker, setShowPositionPicker] = useState(false);
    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    // Populate form when employee data loads
    useEffect(() => {
        if (employee) {
            setFormData({
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                phone: employee.phone || '',
                employeeNumber: employee.employeeNumber,
                departmentId: employee.departmentId,
                positionId: employee.positionId,
                hireDate: employee.hireDate.split('T')[0],
                status: employee.status
            });
        }
    }, [employee]);

    const updateField = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Ad gereklidir';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Soyad gereklidir';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'E-posta gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta girin';
        }
        if (!formData.employeeNumber.trim()) {
            newErrors.employeeNumber = 'Sicil numarası gereklidir';
        }
        if (!formData.departmentId) {
            newErrors.departmentId = 'Departman seçiniz';
        }
        if (!formData.positionId) {
            newErrors.positionId = 'Pozisyon seçiniz';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm() || !id) return;

        updateEmployee.mutate(
            {
                id,
                data: {
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim() || undefined,
                    departmentId: formData.departmentId,
                    positionId: formData.positionId,
                    status: formData.status,
                },
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'Çalışan bilgileri güncellendi', [
                        { text: 'Tamam', onPress: () => router.back() }
                    ]);
                },
                onError: (error: any) => {
                    const message = error?.response?.data?.message || 'Çalışan güncellenirken bir hata oluştu';
                    Alert.alert('Hata', message);
                },
            }
        );
    };

    const selectedDepartment = departments?.find((d: Department) => d.id === formData.departmentId);
    const selectedPosition = positions?.find((p: Position) => p.id === formData.positionId);
    const selectedStatus = STATUS_OPTIONS.find(s => s.value === formData.status);

    // Filter positions by selected department
    const filteredPositions = formData.departmentId
        ? positions?.filter((p: Position) => p.departmentId === formData.departmentId)
        : positions;

    const InputField = ({
        label,
        value,
        onChangeText,
        placeholder,
        icon: Icon,
        keyboardType = 'default',
        error,
        editable = true
    }: {
        label: string;
        value: string;
        onChangeText: (text: string) => void;
        placeholder: string;
        icon: any;
        keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
        error?: string;
        editable?: boolean;
    }) => (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                {label}
            </Text>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: editable ? colors.surface.primary : colors.background.tertiary,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: error ? colors.semantic.error : colors.border.primary,
                    paddingHorizontal: 12
                }}
            >
                <Icon size={20} color={colors.text.tertiary} />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType={keyboardType}
                    editable={editable}
                    style={{
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 10,
                        fontSize: 15,
                        color: editable ? colors.text.primary : colors.text.tertiary
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

    const PickerField = ({
        label,
        value,
        placeholder,
        icon: Icon,
        onPress,
        error
    }: {
        label: string;
        value?: string;
        placeholder: string;
        icon: any;
        onPress: () => void;
        error?: string;
    }) => (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                {label}
            </Text>
            <Pressable
                onPress={onPress}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surface.primary,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: error ? colors.semantic.error : colors.border.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 14
                }}
            >
                <Icon size={20} color={colors.text.tertiary} />
                <Text
                    style={{
                        flex: 1,
                        marginLeft: 10,
                        fontSize: 15,
                        color: value ? colors.text.primary : colors.text.tertiary
                    }}
                >
                    {value || placeholder}
                </Text>
                <ChevronDown size={20} color={colors.text.tertiary} />
            </Pressable>
            {error && (
                <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 4 }}>
                    {error}
                </Text>
            )}
        </View>
    );

    const StatusField = () => (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                Durum
            </Text>
            <Pressable
                onPress={() => setShowStatusPicker(!showStatusPicker)}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surface.primary,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 14
                }}
            >
                <View
                    style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: selectedStatus?.color || colors.text.tertiary
                    }}
                />
                <Text
                    style={{
                        flex: 1,
                        marginLeft: 10,
                        fontSize: 15,
                        color: colors.text.primary
                    }}
                >
                    {selectedStatus?.label || 'Durum seçiniz'}
                </Text>
                <ChevronDown size={20} color={colors.text.tertiary} />
            </Pressable>
        </View>
    );

    if (isLoadingEmployee) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.modules.hr} />
                    <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
                        Çalışan bilgileri yükleniyor...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(300)}
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surface.primary,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.primary
                }}
            >
                <Pressable
                    onPress={() => router.back()}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: colors.background.tertiary,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={22} color={colors.text.primary} />
                </Pressable>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                        Çalışan Düzenle
                    </Text>
                    <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                        {employee?.firstName} {employee?.lastName}
                    </Text>
                </View>
                <Pressable
                    onPress={handleSave}
                    disabled={updateEmployee.isPending}
                    style={{
                        backgroundColor: colors.modules.hr,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        opacity: updateEmployee.isPending ? 0.7 : 1
                    }}
                >
                    {updateEmployee.isPending ? (
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
            </Animated.View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Personal Info Section */}
                <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 16
                        }}
                    >
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
                            Kişisel Bilgiler
                        </Text>

                        <InputField
                            label="Ad"
                            value={formData.firstName}
                            onChangeText={(text) => updateField('firstName', text)}
                            placeholder="Çalışan adı"
                            icon={User}
                            error={errors.firstName}
                        />

                        <InputField
                            label="Soyad"
                            value={formData.lastName}
                            onChangeText={(text) => updateField('lastName', text)}
                            placeholder="Çalışan soyadı"
                            icon={User}
                            error={errors.lastName}
                        />

                        <InputField
                            label="E-posta"
                            value={formData.email}
                            onChangeText={(text) => updateField('email', text)}
                            placeholder="ornek@sirket.com"
                            icon={Mail}
                            keyboardType="email-address"
                            error={errors.email}
                        />

                        <InputField
                            label="Telefon"
                            value={formData.phone}
                            onChangeText={(text) => updateField('phone', text)}
                            placeholder="+90 555 123 4567"
                            icon={Phone}
                            keyboardType="phone-pad"
                        />
                    </View>
                </Animated.View>

                {/* Employment Info Section */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 16
                        }}
                    >
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
                            İş Bilgileri
                        </Text>

                        <InputField
                            label="Sicil Numarası"
                            value={formData.employeeNumber}
                            onChangeText={(text) => updateField('employeeNumber', text)}
                            placeholder="EMP001"
                            icon={Hash}
                            error={errors.employeeNumber}
                            editable={false}
                        />

                        <PickerField
                            label="Departman"
                            value={selectedDepartment?.name}
                            placeholder="Departman seçiniz"
                            icon={Building2}
                            onPress={() => setShowDepartmentPicker(!showDepartmentPicker)}
                            error={errors.departmentId}
                        />

                        {showDepartmentPicker && (
                            <View
                                style={{
                                    backgroundColor: colors.background.tertiary,
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    maxHeight: 200
                                }}
                            >
                                <ScrollView nestedScrollEnabled>
                                    {departments?.map((dept: Department) => (
                                        <Pressable
                                            key={dept.id}
                                            onPress={() => {
                                                updateField('departmentId', dept.id);
                                                updateField('positionId', ''); // Reset position when department changes
                                                setShowDepartmentPicker(false);
                                            }}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingVertical: 12,
                                                paddingHorizontal: 16,
                                                borderBottomWidth: 1,
                                                borderBottomColor: colors.border.primary
                                            }}
                                        >
                                            {formData.departmentId === dept.id && (
                                                <CheckCircle size={18} color={colors.modules.hr} style={{ marginRight: 8 }} />
                                            )}
                                            <Text style={{ color: colors.text.primary, fontSize: 14 }}>
                                                {dept.name}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <PickerField
                            label="Pozisyon"
                            value={selectedPosition?.title}
                            placeholder="Pozisyon seçiniz"
                            icon={Briefcase}
                            onPress={() => setShowPositionPicker(!showPositionPicker)}
                            error={errors.positionId}
                        />

                        {showPositionPicker && (
                            <View
                                style={{
                                    backgroundColor: colors.background.tertiary,
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    maxHeight: 200
                                }}
                            >
                                <ScrollView nestedScrollEnabled>
                                    {filteredPositions?.length === 0 ? (
                                        <Text style={{ color: colors.text.tertiary, padding: 16, textAlign: 'center' }}>
                                            {formData.departmentId ? 'Bu departmanda pozisyon yok' : 'Önce departman seçiniz'}
                                        </Text>
                                    ) : (
                                        filteredPositions?.map((pos: Position) => (
                                            <Pressable
                                                key={pos.id}
                                                onPress={() => {
                                                    updateField('positionId', pos.id);
                                                    setShowPositionPicker(false);
                                                }}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    paddingVertical: 12,
                                                    paddingHorizontal: 16,
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: colors.border.primary
                                                }}
                                            >
                                                {formData.positionId === pos.id && (
                                                    <CheckCircle size={18} color={colors.modules.hr} style={{ marginRight: 8 }} />
                                                )}
                                                <Text style={{ color: colors.text.primary, fontSize: 14 }}>
                                                    {pos.title}
                                                </Text>
                                            </Pressable>
                                        ))
                                    )}
                                </ScrollView>
                            </View>
                        )}

                        <InputField
                            label="İşe Başlama Tarihi"
                            value={formData.hireDate}
                            onChangeText={(text) => updateField('hireDate', text)}
                            placeholder="YYYY-MM-DD"
                            icon={Calendar}
                            editable={false}
                        />

                        <StatusField />

                        {showStatusPicker && (
                            <View
                                style={{
                                    backgroundColor: colors.background.tertiary,
                                    borderRadius: 12,
                                    marginBottom: 16
                                }}
                            >
                                {STATUS_OPTIONS.map((status) => (
                                    <Pressable
                                        key={status.value}
                                        onPress={() => {
                                            updateField('status', status.value);
                                            setShowStatusPicker(false);
                                        }}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingVertical: 12,
                                            paddingHorizontal: 16,
                                            borderBottomWidth: 1,
                                            borderBottomColor: colors.border.primary
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: status.color,
                                                marginRight: 10
                                            }}
                                        />
                                        {formData.status === status.value && (
                                            <CheckCircle size={18} color={colors.modules.hr} style={{ marginRight: 8 }} />
                                        )}
                                        <Text style={{ color: colors.text.primary, fontSize: 14 }}>
                                            {status.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
