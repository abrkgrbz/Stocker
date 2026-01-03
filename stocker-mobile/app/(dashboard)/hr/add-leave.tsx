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
    Calendar,
    Save,
    User,
    FileText,
    ChevronDown,
    CalendarDays
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useCreateLeaveRequest, useEmployees } from '@/lib/api/hooks/useHR';
import type { LeaveType } from '@/lib/api/types/hr.types';

const LEAVE_TYPES: { value: LeaveType; label: string; emoji: string }[] = [
    { value: 'annual', label: 'Yıllık İzin', emoji: '🏖️' },
    { value: 'sick', label: 'Hastalık İzni', emoji: '🏥' },
    { value: 'unpaid', label: 'Ücretsiz İzin', emoji: '💰' },
    { value: 'maternity', label: 'Doğum İzni', emoji: '👶' },
    { value: 'paternity', label: 'Babalık İzni', emoji: '👨‍👧' },
    { value: 'marriage', label: 'Evlilik İzni', emoji: '💒' },
    { value: 'bereavement', label: 'Vefat İzni', emoji: '🕯️' },
    { value: 'other', label: 'Diğer', emoji: '📋' },
];

export default function AddLeaveRequestScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const { mutate: createLeaveRequest, isPending } = useCreateLeaveRequest();
    const { data: employeesData } = useEmployees({ pageSize: 100 });
    const employees = employeesData?.items || [];

    const [formData, setFormData] = useState({
        employeeId: '',
        type: 'annual' as LeaveType,
        startDate: '',
        endDate: '',
        reason: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [showEmployeePicker, setShowEmployeePicker] = useState(false);

    const selectedEmployee = employees.find(e => e.id === formData.employeeId);
    const selectedType = LEAVE_TYPES.find(t => t.value === formData.type);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.employeeId) {
            newErrors.employeeId = 'Çalışan seçimi zorunludur';
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Başlangıç tarihi zorunludur';
        }
        if (!formData.endDate) {
            newErrors.endDate = 'Bitiş tarihi zorunludur';
        }
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end < start) {
                newErrors.endDate = 'Bitiş tarihi başlangıçtan önce olamaz';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        createLeaveRequest(
            {
                employeeId: formData.employeeId,
                type: formData.type,
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason.trim() || undefined,
            },
            {
                onSuccess: () => {
                    Alert.alert('Başarılı', 'İzin talebi başarıyla oluşturuldu', [
                        { text: 'Tamam', onPress: () => router.back() }
                    ]);
                },
                onError: () => {
                    Alert.alert('Hata', 'İzin talebi oluşturulurken bir hata oluştu');
                }
            }
        );
    };

    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleDateInput = (field: 'startDate' | 'endDate', text: string) => {
        // Basic date input handling - format: YYYY-MM-DD
        const cleaned = text.replace(/[^0-9-]/g, '');
        setFormData(prev => ({ ...prev, [field]: cleaned }));
    };

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
                                    Yeni İzin Talebi
                                </Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                    İnsan Kaynakları
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
                                        Gönder
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
                    {/* Employee Selection */}
                    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: errors.employeeId ? colors.semantic.error : colors.border.primary
                            }}
                        >
                            <View className="flex-row items-center mb-4">
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
                                    Çalışan *
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => setShowEmployeePicker(!showEmployeePicker)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: colors.background.tertiary,
                                    borderRadius: 12,
                                    padding: 14,
                                }}
                            >
                                <Text style={{
                                    color: selectedEmployee ? colors.text.primary : colors.text.tertiary,
                                    fontSize: 15
                                }}>
                                    {selectedEmployee
                                        ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
                                        : 'Çalışan seçin'}
                                </Text>
                                <ChevronDown size={20} color={colors.text.tertiary} />
                            </Pressable>

                            {showEmployeePicker && (
                                <View style={{ marginTop: 8, maxHeight: 200 }}>
                                    <ScrollView nestedScrollEnabled>
                                        {employees.map((employee) => (
                                            <Pressable
                                                key={employee.id}
                                                onPress={() => {
                                                    setFormData(prev => ({ ...prev, employeeId: employee.id }));
                                                    setShowEmployeePicker(false);
                                                }}
                                                style={{
                                                    padding: 12,
                                                    borderRadius: 8,
                                                    backgroundColor: formData.employeeId === employee.id
                                                        ? colors.brand.primary + '20'
                                                        : 'transparent',
                                                }}
                                            >
                                                <Text style={{
                                                    color: formData.employeeId === employee.id
                                                        ? colors.brand.primary
                                                        : colors.text.primary,
                                                    fontSize: 14,
                                                    fontWeight: '500'
                                                }}>
                                                    {employee.firstName} {employee.lastName}
                                                </Text>
                                                <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                                    {employee.departmentName} • {employee.positionName}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {errors.employeeId && (
                                <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 8 }}>
                                    {errors.employeeId}
                                </Text>
                            )}
                        </View>
                    </Animated.View>

                    {/* Leave Type */}
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
                                    <Calendar size={20} color={colors.semantic.info} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    İzin Türü
                                </Text>
                            </View>

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
                                <Text style={{ color: colors.text.primary, fontSize: 15 }}>
                                    {selectedType?.emoji} {selectedType?.label}
                                </Text>
                                <ChevronDown size={20} color={colors.text.tertiary} />
                            </Pressable>

                            {showTypePicker && (
                                <View style={{ marginTop: 8 }}>
                                    {LEAVE_TYPES.map((type) => (
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
                                                {type.emoji} {type.label}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>
                    </Animated.View>

                    {/* Date Range */}
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
                                    <CalendarDays size={20} color={colors.semantic.warning} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    Tarih Aralığı
                                </Text>
                            </View>

                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                    Başlangıç Tarihi * (YYYY-MM-DD)
                                </Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: colors.background.tertiary,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: errors.startDate ? colors.semantic.error : colors.border.primary,
                                        paddingHorizontal: 12,
                                    }}
                                >
                                    <Calendar size={20} color={colors.text.tertiary} />
                                    <TextInput
                                        value={formData.startDate}
                                        onChangeText={(text) => handleDateInput('startDate', text)}
                                        placeholder="2024-01-15"
                                        placeholderTextColor={colors.text.tertiary}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 14,
                                            paddingHorizontal: 12,
                                            color: colors.text.primary,
                                            fontSize: 15,
                                        }}
                                    />
                                </View>
                                {errors.startDate && (
                                    <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 4 }}>
                                        {errors.startDate}
                                    </Text>
                                )}
                            </View>

                            <View>
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                    Bitiş Tarihi * (YYYY-MM-DD)
                                </Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: colors.background.tertiary,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: errors.endDate ? colors.semantic.error : colors.border.primary,
                                        paddingHorizontal: 12,
                                    }}
                                >
                                    <Calendar size={20} color={colors.text.tertiary} />
                                    <TextInput
                                        value={formData.endDate}
                                        onChangeText={(text) => handleDateInput('endDate', text)}
                                        placeholder="2024-01-20"
                                        placeholderTextColor={colors.text.tertiary}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 14,
                                            paddingHorizontal: 12,
                                            color: colors.text.primary,
                                            fontSize: 15,
                                        }}
                                    />
                                </View>
                                {errors.endDate && (
                                    <Text style={{ color: colors.semantic.error, fontSize: 12, marginTop: 4 }}>
                                        {errors.endDate}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </Animated.View>

                    {/* Reason */}
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
                            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6 }}>
                                Açıklama (Opsiyonel)
                            </Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                    backgroundColor: colors.background.tertiary,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: colors.border.primary,
                                    paddingHorizontal: 12,
                                }}
                            >
                                <FileText size={20} color={colors.text.tertiary} style={{ marginTop: 14 }} />
                                <TextInput
                                    value={formData.reason}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, reason: text }))}
                                    placeholder="İzin sebebinizi açıklayın..."
                                    placeholderTextColor={colors.text.tertiary}
                                    multiline
                                    style={{
                                        flex: 1,
                                        paddingVertical: 14,
                                        paddingHorizontal: 12,
                                        color: colors.text.primary,
                                        fontSize: 15,
                                        minHeight: 100,
                                        textAlignVertical: 'top',
                                    }}
                                />
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
