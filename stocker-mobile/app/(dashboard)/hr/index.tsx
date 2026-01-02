import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    Users,
    Calendar,
    Briefcase,
    UserCheck,
    Clock,
    AlertCircle,
    ChevronRight,
    TrendingUp
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import {
    useEmployees,
    usePendingApprovals,
    useDailyAttendanceSummary
} from '@/lib/api/hooks/useHR';

export default function HRDashboardScreen() {
    const router = useRouter();
    const { colors } = useTheme();

    // Fetch data from API
    const { data: employeesData, isLoading: employeesLoading, refetch: refetchEmployees, isRefetching } = useEmployees({ pageSize: 1 });
    const { data: pendingData } = usePendingApprovals();
    const { data: attendanceSummary } = useDailyAttendanceSummary();

    // Calculate stats
    const stats = {
        totalEmployees: employeesData?.totalCount || 0,
        activeEmployees: employeesData?.totalCount || 0, // Would need filter for active
        onLeaveCount: attendanceSummary?.onLeaveCount || 0,
        pendingLeaveRequests: pendingData?.length || 0,
        todayAbsent: attendanceSummary?.absentCount || 0,
        todayPresent: attendanceSummary?.presentCount || 0,
        todayLate: attendanceSummary?.lateCount || 0,
        totalAssets: 0,
        assignedAssets: 0
    };

    const isLoading = employeesLoading;

    const onRefresh = useCallback(() => {
        refetchEmployees();
    }, [refetchEmployees]);

    const menuItems = [
        {
            title: 'Çalışanlar',
            subtitle: `${stats.activeEmployees} aktif çalışan`,
            icon: Users,
            color: colors.modules.hr,
            bgColor: colors.modules.hrLight,
            route: '/(dashboard)/hr/employees',
            badge: null
        },
        {
            title: 'İzin Talepleri',
            subtitle: `${stats.pendingLeaveRequests} bekleyen talep`,
            icon: Calendar,
            color: colors.semantic.warning,
            bgColor: colors.semantic.warningLight,
            route: '/(dashboard)/hr/leaves',
            badge: stats.pendingLeaveRequests
        },
        {
            title: 'Zimmetler',
            subtitle: `${stats.assignedAssets}/${stats.totalAssets} atanmış`,
            icon: Briefcase,
            color: colors.semantic.info,
            bgColor: colors.semantic.infoLight,
            route: '/(dashboard)/hr/assets',
            badge: null
        }
    ];

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
                        <Text style={{ color: colors.text.primary }} className="text-xl font-bold">
                            İnsan Kaynakları
                        </Text>
                        <Text style={{ color: colors.text.tertiary }} className="text-sm">
                            Çalışanlar, İzinler, Zimmetler
                        </Text>
                    </View>
                </View>
            </Animated.View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
            >
                {/* Stats Card */}
                <Animated.View entering={FadeInDown.duration(400).delay(100)} className="p-4">
                    <View
                        style={{
                            backgroundColor: colors.modules.hr,
                            borderRadius: 20,
                            padding: 20,
                            marginBottom: 16
                        }}
                    >
                        <View className="flex-row items-center mb-4">
                            <Users size={24} color="#fff" />
                            <Text style={{ color: '#fff', opacity: 0.9, marginLeft: 8 }} className="text-base">
                                Toplam Çalışan
                            </Text>
                        </View>
                        {isLoading ? (
                            <ActivityIndicator color="#fff" size="large" />
                        ) : (
                            <>
                                <Text style={{ color: '#fff' }} className="text-4xl font-bold mb-4">
                                    {stats.totalEmployees}
                                </Text>
                                <View className="flex-row">
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#fff', opacity: 0.7, fontSize: 12 }}>Aktif</Text>
                                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 18 }}>
                                            {stats.activeEmployees}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#fff', opacity: 0.7, fontSize: 12 }}>İzinli</Text>
                                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 18 }}>
                                            {stats.onLeaveCount}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#fff', opacity: 0.7, fontSize: 12 }}>Bugün Yok</Text>
                                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 18 }}>
                                            {stats.todayAbsent}
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </Animated.View>

                {/* Quick Stats Row */}
                <Animated.View entering={FadeInDown.duration(400).delay(150)} className="px-4 mb-4">
                    <View className="flex-row">
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                marginRight: 8,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <View className="flex-row items-center mb-2">
                                <Clock size={18} color={colors.semantic.warning} />
                                <Text style={{ color: colors.text.tertiary, marginLeft: 6, fontSize: 12 }}>Bekleyen</Text>
                            </View>
                            <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700' }}>
                                {stats.pendingLeaveRequests}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>izin talebi</Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                marginLeft: 8,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <View className="flex-row items-center mb-2">
                                <Briefcase size={18} color={colors.semantic.info} />
                                <Text style={{ color: colors.text.tertiary, marginLeft: 6, fontSize: 12 }}>Zimmetler</Text>
                            </View>
                            <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700' }}>
                                {stats.assignedAssets}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>atanmış</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Menu Items */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)} className="px-4">
                    <Text style={{ color: colors.text.secondary, marginBottom: 12 }} className="text-sm font-medium">
                        Modüller
                    </Text>
                    {menuItems.map((item) => (
                        <Pressable
                            key={item.title}
                            onPress={() => router.push(item.route as any)}
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: colors.border.primary,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <View
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 12,
                                    backgroundColor: item.bgColor,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 14
                                }}
                            >
                                <item.icon size={24} color={item.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                    {item.title}
                                </Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                    {item.subtitle}
                                </Text>
                            </View>
                            {item.badge && item.badge > 0 && (
                                <View
                                    style={{
                                        backgroundColor: item.color,
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        borderRadius: 12,
                                        marginRight: 8
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                                        {item.badge}
                                    </Text>
                                </View>
                            )}
                            <ChevronRight size={20} color={colors.text.tertiary} />
                        </Pressable>
                    ))}
                </Animated.View>

                {/* Today's Attendance Summary */}
                <Animated.View entering={FadeInDown.duration(400).delay(250)} className="p-4">
                    <Text style={{ color: colors.text.secondary, marginBottom: 12 }} className="text-sm font-medium">
                        Bugünkü Devam Durumu
                    </Text>
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: colors.border.primary,
                            padding: 16
                        }}
                    >
                        <View className="flex-row justify-between mb-4">
                            <View style={{ alignItems: 'center', flex: 1 }}>
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.semantic.successLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 8
                                    }}
                                >
                                    <UserCheck size={20} color={colors.semantic.success} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700' }}>{stats.todayPresent}</Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Mevcut</Text>
                            </View>
                            <View style={{ alignItems: 'center', flex: 1 }}>
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.semantic.warningLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 8
                                    }}
                                >
                                    <Clock size={20} color={colors.semantic.warning} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700' }}>{stats.todayLate}</Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Geç Kaldı</Text>
                            </View>
                            <View style={{ alignItems: 'center', flex: 1 }}>
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.semantic.infoLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 8
                                    }}
                                >
                                    <Calendar size={20} color={colors.semantic.info} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700' }}>{stats.onLeaveCount}</Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>İzinli</Text>
                            </View>
                        </View>

                        <View
                            style={{
                                height: 6,
                                backgroundColor: colors.background.tertiary,
                                borderRadius: 3,
                                flexDirection: 'row',
                                overflow: 'hidden'
                            }}
                        >
                            <View style={{ flex: stats.todayPresent || 1, backgroundColor: colors.semantic.success }} />
                            <View style={{ flex: stats.todayLate || 0, backgroundColor: colors.semantic.warning }} />
                            <View style={{ flex: stats.onLeaveCount || 0, backgroundColor: colors.semantic.info }} />
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
