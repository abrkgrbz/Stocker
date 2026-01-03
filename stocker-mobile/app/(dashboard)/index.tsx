import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
    Users,
    TrendingUp,
    DollarSign,
    ChevronRight,
    Package,
    Bell,
    Search,
    ShoppingCart,
    Briefcase,
    Clock
} from 'lucide-react-native';
import { authStorage, User, Tenant } from '@/lib/auth-store';
import { useTheme } from '@/lib/theme';
import { SyncIndicator } from '@/components/ui';
import { useNotifications } from '@/lib/notifications';
import { useCustomers, useDeals } from '@/lib/api/hooks/useCRM';
import { useLowStockProducts } from '@/lib/api/hooks/useInventory';
import { useSalesStats, useOrders, useRecentOrders } from '@/lib/api/hooks/useSales';

const QUICK_ACTIONS = [
    { id: 'customers', title: 'Müşteriler', icon: Users, route: '/(dashboard)/crm', color: '#2563eb', bgColor: '#dbeafe' },
    { id: 'inventory', title: 'Stok', icon: Package, route: '/(dashboard)/inventory', color: '#059669', bgColor: '#d1fae5' },
    { id: 'sales', title: 'Satış', icon: ShoppingCart, route: '/(dashboard)/sales', color: '#d97706', bgColor: '#fef3c7' },
    { id: 'hr', title: 'İK', icon: Briefcase, route: '/(dashboard)/hr', color: '#7c3aed', bgColor: '#ede9fe' },
];

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48 - 12) / 2;

export default function DashboardScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { unreadCount } = useNotifications();
    const [user, setUser] = useState<User | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);

    // Tab bar height for scroll padding
    const tabBarHeight = 60 + insets.bottom;

    // Fetch API data
    const { data: customersData, isLoading: customersLoading, refetch: refetchCustomers, isRefetching: customersRefetching } = useCustomers({ pageSize: 1 });
    const { data: dealsData, refetch: refetchDeals, isRefetching: dealsRefetching } = useDeals({ stage: 'won' as any, pageSize: 1 });
    const { data: lowStockData, refetch: refetchLowStock, isRefetching: lowStockRefetching } = useLowStockProducts();
    const { data: salesStats, refetch: refetchSalesStats, isRefetching: salesRefetching } = useSalesStats();
    const { data: pendingOrdersData, refetch: refetchPendingOrders } = useOrders({ status: 'pending', pageSize: 1 });
    const { data: recentOrdersData, refetch: refetchRecentOrders } = useRecentOrders(4);

    const isRefreshing = customersRefetching || dealsRefetching || lowStockRefetching || salesRefetching;
    const isLoading = customersLoading;

    // Calculate metrics from API data
    const metrics = {
        totalRevenue: salesStats?.monthlySales || 0,
        activeCustomers: customersData?.totalCount || 0,
        wonDeals: dealsData?.totalCount || 0,
        lowStockItems: lowStockData?.length || 0,
        pendingOrders: pendingOrdersData?.totalCount || 0,
    };

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const state = await authStorage.getAuthState();
            setUser(state.user);
            setTenant(state.tenant);
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };

    const onRefresh = useCallback(() => {
        loadUserData();
        refetchCustomers();
        refetchDeals();
        refetchLowStock();
        refetchSalesStats();
        refetchPendingOrders();
        refetchRecentOrders();
    }, [refetchCustomers, refetchDeals, refetchLowStock, refetchSalesStats, refetchPendingOrders, refetchRecentOrders]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getInitials = (name: string | undefined) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Günaydın';
        if (hour < 18) return 'İyi günler';
        return 'İyi akşamlar';
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(400)}
                className="px-6 py-4"
                style={{ backgroundColor: colors.surface.primary, borderBottomWidth: 1, borderBottomColor: colors.border.primary }}
            >
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text style={{ color: colors.text.tertiary }} className="text-sm">{getGreeting()}</Text>
                        <Text style={{ color: colors.text.primary }} className="text-xl font-bold">
                            {user?.name || 'Kullanıcı'}
                        </Text>
                        {tenant && (
                            <Text style={{ color: colors.text.tertiary }} className="text-xs mt-0.5">{tenant.name}</Text>
                        )}
                    </View>
                    <View className="flex-row items-center" style={{ gap: 12 }}>
                        <SyncIndicator variant="icon" />
                        <Pressable style={{ width: 40, height: 40, backgroundColor: colors.background.tertiary, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <Search size={20} color={colors.text.tertiary} />
                        </Pressable>
                        <Pressable
                            onPress={() => router.push('/(dashboard)/notifications' as any)}
                            style={{ width: 40, height: 40, backgroundColor: colors.background.tertiary, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                        >
                            <Bell size={20} color={colors.text.tertiary} />
                            {unreadCount > 0 && (
                                <View style={{ position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, backgroundColor: colors.semantic.error, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                                </View>
                            )}
                        </Pressable>
                        <Pressable
                            onPress={() => router.push('/(dashboard)/settings')}
                            style={{ width: 40, height: 40, backgroundColor: colors.brand.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text style={{ fontWeight: '700', color: '#fff', fontSize: 14 }}>{getInitials(user?.name)}</Text>
                        </Pressable>
                    </View>
                </View>
            </Animated.View>

            <ScrollView
                contentContainerStyle={{ padding: 24, paddingBottom: tabBarHeight + 24 }}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.brand.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Quick Actions */}
                <Animated.View entering={FadeInDown.duration(500).delay(100)}>
                    <Text className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Hızlı İşlemler</Text>
                    <View className="flex-row flex-wrap mb-6" style={{ gap: 12 }}>
                        {QUICK_ACTIONS.map((action, index) => (
                            <Animated.View
                                key={action.id}
                                entering={FadeInUp.duration(400).delay(150 + index * 50)}
                                style={{ width: (screenWidth - 48 - 36) / 4 }}
                            >
                                <Pressable
                                    onPress={() => router.push(action.route as any)}
                                    className="items-center active:opacity-70"
                                >
                                    <View
                                        className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                                        style={{ backgroundColor: action.bgColor }}
                                    >
                                        <action.icon size={24} color={action.color} />
                                    </View>
                                    <Text className="text-xs text-slate-600 font-medium text-center">{action.title}</Text>
                                </Pressable>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Overview Section */}
                <Animated.View entering={FadeInDown.duration(500).delay(200)}>
                    <Text style={{ color: colors.text.tertiary }} className="text-xs font-bold uppercase mb-3 tracking-wider">Genel Bakış</Text>
                    <View className="flex-row flex-wrap mb-6" style={{ gap: 12 }}>
                        {/* Revenue Card */}
                        <View style={{ width: cardWidth, backgroundColor: colors.surface.primary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border.primary }}>
                            <View style={{ width: 32, height: 32, backgroundColor: colors.semantic.successLight, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                <DollarSign size={18} color={colors.semantic.success} />
                            </View>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Bu Ay Satış</Text>
                            {isLoading ? (
                                <ActivityIndicator size="small" color={colors.semantic.success} style={{ marginVertical: 8 }} />
                            ) : (
                                <>
                                    <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>{formatCurrency(metrics.totalRevenue)}</Text>
                                    <Text style={{ color: colors.semantic.success, fontSize: 12, marginTop: 4 }}>Bu ay</Text>
                                </>
                            )}
                        </View>

                        {/* Customers Card */}
                        <View style={{ width: cardWidth, backgroundColor: colors.surface.primary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border.primary }}>
                            <View style={{ width: 32, height: 32, backgroundColor: colors.modules.crmLight, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                <Users size={18} color={colors.modules.crm} />
                            </View>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Toplam Müşteri</Text>
                            {isLoading ? (
                                <ActivityIndicator size="small" color={colors.modules.crm} style={{ marginVertical: 8 }} />
                            ) : (
                                <>
                                    <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>{metrics.activeCustomers}</Text>
                                    <Text style={{ color: colors.modules.crm, fontSize: 12, marginTop: 4 }}>Kayıtlı</Text>
                                </>
                            )}
                        </View>

                        {/* Deals Card */}
                        <View style={{ width: cardWidth, backgroundColor: colors.surface.primary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border.primary }}>
                            <View style={{ width: 32, height: 32, backgroundColor: colors.modules.salesLight, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                <TrendingUp size={18} color={colors.modules.sales} />
                            </View>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Kazanılan Anlaşma</Text>
                            {isLoading ? (
                                <ActivityIndicator size="small" color={colors.modules.sales} style={{ marginVertical: 8 }} />
                            ) : (
                                <>
                                    <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>{metrics.wonDeals}</Text>
                                    <Text style={{ color: colors.modules.sales, fontSize: 12, marginTop: 4 }}>Toplam</Text>
                                </>
                            )}
                        </View>

                        {/* Low Stock Card */}
                        <View style={{ width: cardWidth, backgroundColor: colors.surface.primary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: metrics.lowStockItems > 5 ? colors.semantic.error + '50' : colors.border.primary }}>
                            <View style={{ width: 32, height: 32, backgroundColor: colors.semantic.errorLight, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                <Package size={18} color={colors.semantic.error} />
                            </View>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Kritik Stok</Text>
                            {isLoading ? (
                                <ActivityIndicator size="small" color={colors.semantic.error} style={{ marginVertical: 8 }} />
                            ) : (
                                <>
                                    <Text style={{ color: metrics.lowStockItems > 0 ? colors.semantic.error : colors.text.primary, fontSize: 18, fontWeight: '700' }}>{metrics.lowStockItems}</Text>
                                    <Text style={{ color: metrics.lowStockItems > 0 ? colors.semantic.error : colors.text.tertiary, fontSize: 12, marginTop: 4 }}>{metrics.lowStockItems > 0 ? 'Dikkat!' : 'Sorun yok'}</Text>
                                </>
                            )}
                        </View>
                    </View>
                </Animated.View>

                {/* Recent Orders */}
                <Animated.View entering={FadeInDown.duration(500).delay(300)}>
                    <View className="flex-row items-center justify-between mb-3">
                        <Text style={{ color: colors.text.tertiary }} className="text-xs font-bold uppercase tracking-wider">Son Siparişler</Text>
                        <Pressable onPress={() => router.push('/(dashboard)/sales' as any)}>
                            <Text style={{ color: colors.brand.primary, fontSize: 12, fontWeight: '500' }}>Tümünü Gör</Text>
                        </Pressable>
                    </View>
                    <View style={{ backgroundColor: colors.surface.primary, borderRadius: 12, borderWidth: 1, borderColor: colors.border.primary, overflow: 'hidden' }}>
                        {recentOrdersData && recentOrdersData.length > 0 ? (
                            recentOrdersData.map((order, index) => (
                                <Animated.View
                                    key={order.id}
                                    entering={FadeInUp.duration(400).delay(350 + index * 50)}
                                >
                                    <Pressable
                                        onPress={() => router.push(`/(dashboard)/sales/order/${order.id}` as any)}
                                        style={{
                                            padding: 16,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            borderBottomWidth: index < recentOrdersData.length - 1 ? 1 : 0,
                                            borderBottomColor: colors.border.primary
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 12,
                                                backgroundColor: colors.modules.salesLight,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 12
                                            }}
                                        >
                                            <ShoppingCart size={20} color={colors.modules.sales} />
                                        </View>
                                        <View className="flex-1">
                                            <Text style={{ color: colors.text.primary, fontWeight: '500' }}>
                                                {order.orderNumber || `Sipariş #${order.id.slice(-6)}`}
                                            </Text>
                                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                                {order.customerName || 'Müşteri'} • {formatCurrency(order.totalAmount || 0)}
                                            </Text>
                                        </View>
                                        <ChevronRight size={16} color={colors.text.tertiary} />
                                    </Pressable>
                                </Animated.View>
                            ))
                        ) : (
                            <View style={{ padding: 24, alignItems: 'center' }}>
                                <Clock size={32} color={colors.text.tertiary} />
                                <Text style={{ color: colors.text.tertiary, fontSize: 14, marginTop: 8 }}>
                                    Henüz sipariş yok
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Tenant Info Card */}
                {tenant && (
                    <Animated.View
                        entering={FadeInDown.duration(500).delay(400)}
                        className="mt-6"
                    >
                        <View style={{ backgroundColor: colors.brand.primary, padding: 20, borderRadius: 16 }}>
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500', marginBottom: 4 }}>Çalışma Alanı</Text>
                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{tenant.name}</Text>
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{tenant.code}.stoocker.app</Text>
                                </View>
                                <View style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{tenant.name?.[0] || 'T'}</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
