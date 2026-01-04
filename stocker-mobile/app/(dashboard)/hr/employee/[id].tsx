import React, { useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Linking,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    Phone,
    Mail,
    User,
    Building2,
    Briefcase,
    Calendar,
    Clock,
    ChevronRight,
    AlertCircle,
    UserCheck,
    UserX,
    UserMinus
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useEmployee, useLeaveBalance, useMyLeaveRequests } from '@/lib/api/hooks/useHR';
import type { EmployeeStatus } from '@/lib/api/types/hr.types';

const STATUS_CONFIG: Record<EmployeeStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    active: { label: 'Aktif', color: '#22c55e', bgColor: '#dcfce7', icon: UserCheck },
    on_leave: { label: 'İzinli', color: '#f59e0b', bgColor: '#fef3c7', icon: Clock },
    terminated: { label: 'Ayrıldı', color: '#64748b', bgColor: '#f1f5f9', icon: UserX },
    suspended: { label: 'Askıda', color: '#ef4444', bgColor: '#fee2e2', icon: UserMinus },
};

export default function EmployeeDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const {
        data: employee,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useEmployee(id || '');

    const { data: leaveBalance } = useLeaveBalance(id);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleCall = () => {
        if (employee?.phone) {
            Linking.openURL(`tel:${employee.phone}`);
        }
    };

    const handleEmail = () => {
        if (employee?.email) {
            Linking.openURL(`mailto:${employee.email}`);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                    <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
                        Çalışan yükleniyor...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isError || !employee) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <AlertCircle size={48} color={colors.semantic.error} />
                    <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '600', marginTop: 16 }}>
                        Çalışan bulunamadı
                    </Text>
                    <Pressable
                        onPress={() => router.back()}
                        style={{
                            marginTop: 24,
                            backgroundColor: colors.brand.primary,
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                            borderRadius: 8
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Geri Dön</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const statusConfig = STATUS_CONFIG[employee.status];
    const StatusIcon = statusConfig.icon;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
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
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="mr-3 p-2 -ml-2">
                        <ArrowLeft size={24} color={colors.text.primary} />
                    </Pressable>
                    <View>
                        <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                            Çalışan Detayı
                        </Text>
                        <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                            {employee.employeeNumber}
                        </Text>
                    </View>
                </View>
            </Animated.View>

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
            >
                {/* Profile Card */}
                <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: colors.border.primary,
                            alignItems: 'center'
                        }}
                    >
                        {/* Avatar */}
                        <View
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundColor: colors.modules.hrLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}
                        >
                            <Text style={{ color: colors.modules.hr, fontSize: 28, fontWeight: '700' }}>
                                {employee.firstName[0]}{employee.lastName[0]}
                            </Text>
                        </View>

                        <Text style={{ color: colors.text.primary, fontSize: 22, fontWeight: '700', marginBottom: 4 }}>
                            {employee.firstName} {employee.lastName}
                        </Text>

                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginBottom: 12 }}>
                            {employee.positionName}
                        </Text>

                        {/* Status Badge */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: statusConfig.bgColor,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 20
                            }}
                        >
                            <StatusIcon size={16} color={statusConfig.color} />
                            <Text style={{ color: statusConfig.color, fontWeight: '600', marginLeft: 6 }}>
                                {statusConfig.label}
                            </Text>
                        </View>

                        {/* Quick Actions */}
                        <View className="flex-row mt-6 pt-4" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary, width: '100%' }}>
                            <Pressable
                                onPress={handleCall}
                                disabled={!employee.phone}
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    opacity: employee.phone ? 1 : 0.5
                                }}
                            >
                                <View
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 14,
                                        backgroundColor: colors.semantic.successLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 6
                                    }}
                                >
                                    <Phone size={22} color={colors.semantic.success} />
                                </View>
                                <Text style={{ color: colors.text.secondary, fontSize: 12, fontWeight: '500' }}>
                                    Ara
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={handleEmail}
                                style={{ flex: 1, alignItems: 'center' }}
                            >
                                <View
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 14,
                                        backgroundColor: colors.semantic.infoLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 6
                                    }}
                                >
                                    <Mail size={22} color={colors.semantic.info} />
                                </View>
                                <Text style={{ color: colors.text.secondary, fontSize: 12, fontWeight: '500' }}>
                                    E-posta
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>

                {/* Contact & Work Info */}
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
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
                            İletişim & İş Bilgileri
                        </Text>

                        {/* Email */}
                        <View className="flex-row items-center mb-4">
                            <Mail size={20} color={colors.text.tertiary} />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>E-posta</Text>
                                <Text style={{ color: colors.text.primary, fontWeight: '500' }}>
                                    {employee.email}
                                </Text>
                            </View>
                        </View>

                        {/* Phone */}
                        {employee.phone && (
                            <View className="flex-row items-center mb-4">
                                <Phone size={20} color={colors.text.tertiary} />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Telefon</Text>
                                    <Text style={{ color: colors.text.primary, fontWeight: '500' }}>
                                        {employee.phone}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Department */}
                        <View className="flex-row items-center mb-4">
                            <Building2 size={20} color={colors.text.tertiary} />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Departman</Text>
                                <Text style={{ color: colors.text.primary, fontWeight: '500' }}>
                                    {employee.departmentName}
                                </Text>
                            </View>
                        </View>

                        {/* Position */}
                        <View className="flex-row items-center mb-4">
                            <Briefcase size={20} color={colors.text.tertiary} />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Pozisyon</Text>
                                <Text style={{ color: colors.text.primary, fontWeight: '500' }}>
                                    {employee.positionName}
                                </Text>
                            </View>
                        </View>

                        {/* Manager */}
                        {employee.managerName && (
                            <View className="flex-row items-center mb-4">
                                <User size={20} color={colors.text.tertiary} />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Yönetici</Text>
                                    <Text style={{ color: colors.text.primary, fontWeight: '500' }}>
                                        {employee.managerName}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Hire Date */}
                        <View className="flex-row items-center">
                            <Calendar size={20} color={colors.text.tertiary} />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>İşe Başlama Tarihi</Text>
                                <Text style={{ color: colors.text.primary, fontWeight: '500' }}>
                                    {formatDate(employee.hireDate)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Leave Balance */}
                {leaveBalance && (
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
                            <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
                                İzin Bakiyesi
                            </Text>

                            <View className="flex-row">
                                {/* Annual Leave */}
                                <View style={{ flex: 1, alignItems: 'center' }}>
                                    <View
                                        style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 28,
                                            backgroundColor: colors.semantic.infoLight,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 8
                                        }}
                                    >
                                        <Text style={{ color: colors.semantic.info, fontSize: 20, fontWeight: '700' }}>
                                            {leaveBalance.annualRemaining}
                                        </Text>
                                    </View>
                                    <Text style={{ color: colors.text.secondary, fontSize: 12 }}>Yıllık İzin</Text>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                                        {leaveBalance.annualUsed}/{leaveBalance.annualTotal} kullanıldı
                                    </Text>
                                </View>

                                {/* Sick Leave */}
                                <View style={{ flex: 1, alignItems: 'center' }}>
                                    <View
                                        style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 28,
                                            backgroundColor: colors.semantic.warningLight,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 8
                                        }}
                                    >
                                        <Text style={{ color: colors.semantic.warning, fontSize: 20, fontWeight: '700' }}>
                                            {leaveBalance.sickRemaining}
                                        </Text>
                                    </View>
                                    <Text style={{ color: colors.text.secondary, fontSize: 12 }}>Hastalık İzni</Text>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                                        {leaveBalance.sickUsed}/{leaveBalance.sickTotal} kullanıldı
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* Quick Links */}
                <Animated.View entering={FadeInDown.duration(400).delay(250)}>
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: colors.border.primary,
                            overflow: 'hidden'
                        }}
                    >
                        <Pressable
                            onPress={() => router.push(`/(dashboard)/hr/leaves?employeeId=${id}` as any)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 16,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border.primary
                            }}
                        >
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
                            <Text style={{ color: colors.text.primary, flex: 1, fontWeight: '500' }}>
                                İzin Talepleri
                            </Text>
                            <ChevronRight size={20} color={colors.text.tertiary} />
                        </Pressable>

                        <Pressable
                            onPress={() => router.push('/(dashboard)/hr/add-leave' as any)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 16
                            }}
                        >
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
                                <Clock size={20} color={colors.semantic.success} />
                            </View>
                            <Text style={{ color: colors.text.primary, flex: 1, fontWeight: '500' }}>
                                Yeni İzin Talebi
                            </Text>
                            <ChevronRight size={20} color={colors.text.tertiary} />
                        </Pressable>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
