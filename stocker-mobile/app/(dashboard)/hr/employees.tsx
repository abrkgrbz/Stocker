import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    RefreshControl,
    Image,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import {
    ArrowLeft,
    Search,
    Plus,
    User,
    Phone,
    Mail,
    Building2,
    ChevronRight,
    Circle,
    RefreshCw,
    Users
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useEmployees, useDepartments } from '@/lib/api/hooks/useHR';
import type { Employee, EmployeeStatus } from '@/lib/api/types/hr.types';

const STATUS_CONFIG: Record<EmployeeStatus, { label: string; color: string }> = {
    active: { label: 'Aktif', color: '#22c55e' },
    on_leave: { label: 'İzinli', color: '#f59e0b' },
    terminated: { label: 'Ayrıldı', color: '#ef4444' },
    suspended: { label: 'Askıda', color: '#64748b' }
};

export default function EmployeesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<string | 'all'>('all');

    // Fetch employees from API
    const {
        data: employeesResponse,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useEmployees({
        departmentId: selectedDepartment === 'all' ? undefined : selectedDepartment,
        pageSize: 100
    });

    // Fetch departments for filter
    const { data: departmentsData } = useDepartments();

    const employees = employeesResponse?.items || [];

    const departments = useMemo(() => {
        const depts = departmentsData || [];
        return [{ key: 'all', label: 'Tümü' }, ...depts.map(d => ({ key: d.id, label: d.name }))];
    }, [departmentsData]);

    const filteredEmployees = useMemo(() => {
        if (!searchQuery) return employees;
        return employees.filter(employee => {
            const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
            const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                employee.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [employees, searchQuery]);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const EmployeeCard = ({ item, index }: { item: Employee; index: number }) => {
        const statusConfig = STATUS_CONFIG[item.status];

        return (
            <Animated.View entering={FadeInRight.duration(300).delay(index * 50)}>
                <Pressable
                    onPress={() => router.push(`/(dashboard)/hr/employee/${item.id}` as any)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: colors.border.primary
                    }}
                >
                    <View className="flex-row items-center">
                        {/* Avatar */}
                        <View
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: 26,
                                backgroundColor: colors.modules.hrLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 14
                            }}
                        >
                            <Text style={{ color: colors.modules.hr, fontSize: 18, fontWeight: '700' }}>
                                {getInitials(item.firstName, item.lastName)}
                            </Text>
                        </View>

                        {/* Info */}
                        <View style={{ flex: 1 }}>
                            <View className="flex-row items-center">
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    {item.firstName} {item.lastName}
                                </Text>
                                <View
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: statusConfig.color,
                                        marginLeft: 8
                                    }}
                                />
                            </View>
                            <Text style={{ color: colors.text.secondary, fontSize: 13, marginTop: 2 }}>
                                {item.positionName}
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <Building2 size={12} color={colors.text.tertiary} />
                                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginLeft: 4 }}>
                                    {item.departmentName}
                                </Text>
                            </View>
                        </View>

                        <ChevronRight size={20} color={colors.text.tertiary} />
                    </View>

                    {/* Quick Actions */}
                    <View className="flex-row mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation();
                                // Handle phone call
                            }}
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 8,
                                marginRight: 8,
                                backgroundColor: colors.background.tertiary,
                                borderRadius: 8
                            }}
                        >
                            <Phone size={14} color={colors.text.secondary} />
                            <Text style={{ color: colors.text.secondary, fontSize: 12, marginLeft: 6 }}>Ara</Text>
                        </Pressable>
                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation();
                                // Handle email
                            }}
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 8,
                                backgroundColor: colors.background.tertiary,
                                borderRadius: 8
                            }}
                        >
                            <Mail size={14} color={colors.text.secondary} />
                            <Text style={{ color: colors.text.secondary, fontSize: 12, marginLeft: 6 }}>E-posta</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Animated.View>
        );
    };

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
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                        <Pressable onPress={() => router.back()} className="mr-3 p-2 -ml-2">
                            <ArrowLeft size={24} color={colors.text.primary} />
                        </Pressable>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.primary }} className="text-xl font-bold">Çalışanlar</Text>
                            <Text style={{ color: colors.text.secondary }} className="text-sm">
                                {filteredEmployees.length} çalışan
                            </Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(dashboard)/hr/employee/new' as any)}
                        style={{
                            backgroundColor: colors.brand.primary,
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Plus size={22} color={colors.text.inverse} />
                    </Pressable>
                </View>

                {/* Search */}
                <View
                    style={{
                        backgroundColor: colors.background.tertiary,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 12
                    }}
                >
                    <Search size={20} color={colors.text.tertiary} />
                    <Pressable style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8 }}>
                        <Text style={{ color: colors.text.tertiary, fontSize: 15 }}>
                            Çalışan ara...
                        </Text>
                    </Pressable>
                </View>
            </Animated.View>

            {/* Department Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="py-3 px-4"
                style={{ maxHeight: 52, backgroundColor: colors.surface.primary }}
            >
                {departments.map((dept) => (
                    <Pressable
                        key={dept.key}
                        onPress={() => setSelectedDepartment(dept.key)}
                        style={{
                            backgroundColor: selectedDepartment === dept.key
                                ? colors.brand.primary
                                : colors.background.tertiary,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            marginRight: 8
                        }}
                    >
                        <Text
                            style={{
                                color: selectedDepartment === dept.key
                                    ? colors.text.inverse
                                    : colors.text.secondary,
                                fontSize: 13,
                                fontWeight: '500'
                            }}
                        >
                            {dept.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Employees List */}
            <ScrollView
                className="flex-1 px-4"
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
                contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 20 }}
            >
                {isLoading ? (
                    <View className="items-center justify-center py-12">
                        <ActivityIndicator size="large" color={colors.brand.primary} />
                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginTop: 12 }}>
                            Çalışanlar yükleniyor...
                        </Text>
                    </View>
                ) : isError ? (
                    <View className="items-center justify-center py-12">
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 16,
                                backgroundColor: colors.semantic.errorLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}
                        >
                            <RefreshCw size={28} color={colors.semantic.error} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            Bağlantı hatası
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                            Çalışanlar yüklenemedi
                        </Text>
                        <Pressable
                            onPress={() => refetch()}
                            style={{
                                backgroundColor: colors.brand.primary,
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                borderRadius: 8
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600' }}>Tekrar Dene</Text>
                        </Pressable>
                    </View>
                ) : filteredEmployees.length === 0 ? (
                    <View className="items-center justify-center py-12">
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 16,
                                backgroundColor: colors.modules.hrLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}
                        >
                            <Users size={28} color={colors.modules.hr} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            Çalışan bulunamadı
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center' }}>
                            {searchQuery ? 'Arama kriterlerinize uygun çalışan yok' : 'Henüz çalışan eklenmemiş'}
                        </Text>
                    </View>
                ) : (
                    filteredEmployees.map((employee, index) => (
                        <EmployeeCard key={employee.id} item={employee} index={index} />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
