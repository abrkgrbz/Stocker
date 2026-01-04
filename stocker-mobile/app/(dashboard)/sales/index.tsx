import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
    ShoppingCart,
    FileText,
    Receipt,
    Clock,
    AlertCircle,
    ChevronRight,
    DollarSign,
    Plus,
    TrendingUp
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { PageHeader, Card, Badge } from '@/components/ui';
import {
    useSalesStats,
    useOrders,
    useOverdueInvoices,
    useQuotes,
    useRecentOrders
} from '@/lib/api/hooks/useSales';

export default function SalesDashboardScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    // Fetch data from API
    const { data: statsData, isLoading: statsLoading, refetch: refetchStats, isRefetching: statsRefetching } = useSalesStats();
    const { data: pendingOrdersData } = useOrders({ status: 'pending', pageSize: 1 });
    const { data: overdueData } = useOverdueInvoices();
    const { data: quotesData } = useQuotes({ status: 'draft', pageSize: 1 });
    const { data: recentOrdersData } = useRecentOrders(5);

    // Calculate stats
    const stats = {
        todaySales: statsData?.todaySales || 0,
        weeklySales: statsData?.weeklySales || 0,
        monthlySales: statsData?.monthlySales || 0,
        pendingOrders: pendingOrdersData?.totalCount || 0,
        overdueInvoices: overdueData?.length || 0,
        openQuotes: quotesData?.totalCount || 0
    };

    const recentOrders = recentOrdersData || [];

    const isLoading = statsLoading;
    const isRefetching = statsRefetching;

    const onRefresh = useCallback(() => {
        refetchStats();
    }, [refetchStats]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const menuItems = [
        {
            title: 'Siparişler',
            subtitle: `${stats.pendingOrders} bekleyen`,
            icon: ShoppingCart,
            color: colors.modules.sales,
            bgColor: colors.modules.salesLight,
            route: '/(dashboard)/sales/orders',
            badge: stats.pendingOrders
        },
        {
            title: 'Faturalar',
            subtitle: `${stats.overdueInvoices} vadesi geçmiş`,
            icon: FileText,
            color: stats.overdueInvoices > 0 ? colors.semantic.error : colors.modules.sales,
            bgColor: stats.overdueInvoices > 0 ? colors.semantic.errorLight : colors.modules.salesLight,
            route: '/(dashboard)/sales/invoices',
            badge: stats.overdueInvoices,
            badgeVariant: 'error' as const
        },
        {
            title: 'Teklifler',
            subtitle: `${stats.openQuotes} açık teklif`,
            icon: Receipt,
            color: colors.modules.sales,
            bgColor: colors.modules.salesLight,
            route: '/(dashboard)/sales/quotes',
            badge: stats.openQuotes
        }
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            {/* Header */}
            <PageHeader
                title="Satış"
                subtitle="Siparişler, Faturalar, Teklifler"
                primaryAction={{
                    icon: Plus,
                    label: 'Sipariş',
                    onPress: () => router.push('/(dashboard)/sales/add-order' as any),
                    variant: 'button',
                    backgroundColor: colors.modules.sales,
                }}
            />

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 + insets.bottom + 24 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.modules.sales}
                    />
                }
            >
                {/* Sales Stats Card */}
                <Animated.View entering={FadeInDown.duration(400).delay(100)} style={{ padding: 16 }}>
                    <View
                        style={{
                            backgroundColor: colors.modules.sales,
                            borderRadius: 20,
                            padding: 20,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12
                                }}
                            >
                                <TrendingUp size={24} color="#fff" />
                            </View>
                            <View>
                                <Text style={{ color: '#fff', opacity: 0.9, fontSize: 14 }}>
                                    Bugünkü Satış
                                </Text>
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>
                                        {formatCurrency(stats.todaySales)}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    borderRadius: 12,
                                    padding: 12
                                }}
                            >
                                <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>Bu Hafta</Text>
                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16, marginTop: 4 }}>
                                    {formatCurrency(stats.weeklySales)}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    borderRadius: 12,
                                    padding: 12
                                }}
                            >
                                <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>Bu Ay</Text>
                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16, marginTop: 4 }}>
                                    {formatCurrency(stats.monthlySales)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Quick Stats Row */}
                <Animated.View entering={FadeInDown.duration(400).delay(150)} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <Pressable
                            onPress={() => router.push('/(dashboard)/sales/orders' as any)}
                            style={{
                                flex: 1,
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <View
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        backgroundColor: colors.semantic.warningLight,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Clock size={16} color={colors.semantic.warning} />
                                </View>
                            </View>
                            <Text style={{ color: colors.text.primary, fontSize: 28, fontWeight: '700' }}>
                                {stats.pendingOrders}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>Bekleyen Sipariş</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => router.push('/(dashboard)/sales/invoices' as any)}
                            style={{
                                flex: 1,
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: stats.overdueInvoices > 0 ? colors.semantic.error + '50' : colors.border.primary
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <View
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        backgroundColor: colors.semantic.errorLight,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <AlertCircle size={16} color={colors.semantic.error} />
                                </View>
                            </View>
                            <Text style={{ color: stats.overdueInvoices > 0 ? colors.semantic.error : colors.text.primary, fontSize: 28, fontWeight: '700' }}>
                                {stats.overdueInvoices}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>Vadesi Geçmiş</Text>
                        </Pressable>
                    </View>
                </Animated.View>

                {/* Menu Items */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)} style={{ paddingHorizontal: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: colors.modules.salesLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10
                            }}
                        >
                            <DollarSign size={16} color={colors.modules.sales} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                            Modüller
                        </Text>
                    </View>

                    {menuItems.map((item, index) => (
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
                            {item.badge > 0 && (
                                <View
                                    style={{
                                        backgroundColor: item.badgeVariant === 'error' ? colors.semantic.error : item.color,
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

                {/* Recent Orders */}
                <Animated.View entering={FadeInDown.duration(400).delay(250)} style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    backgroundColor: colors.modules.salesLight,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 10
                                }}
                            >
                                <ShoppingCart size={16} color={colors.modules.sales} />
                            </View>
                            <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                                Son Siparişler
                            </Text>
                        </View>
                        <Pressable onPress={() => router.push('/(dashboard)/sales/orders' as any)}>
                            <Text style={{ color: colors.modules.sales, fontSize: 14, fontWeight: '500' }}>
                                Tümünü Gör
                            </Text>
                        </Pressable>
                    </View>

                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: colors.border.primary,
                            overflow: 'hidden'
                        }}
                    >
                        {recentOrders.length === 0 ? (
                            <View style={{ padding: 24, alignItems: 'center' }}>
                                <ShoppingCart size={32} color={colors.text.tertiary} />
                                <Text style={{ color: colors.text.tertiary, marginTop: 8 }}>
                                    Henüz sipariş yok
                                </Text>
                            </View>
                        ) : (
                            recentOrders.slice(0, 5).map((order, index) => (
                                <Pressable
                                    key={order.id}
                                    onPress={() => router.push(`/(dashboard)/sales/order/${order.id}` as any)}
                                    style={{
                                        padding: 14,
                                        borderBottomWidth: index < recentOrders.length - 1 ? 1 : 0,
                                        borderBottomColor: colors.border.primary,
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 10,
                                            backgroundColor: colors.modules.salesLight,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 12
                                        }}
                                    >
                                        <ShoppingCart size={18} color={colors.modules.sales} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>
                                            {order.orderNumber}
                                        </Text>
                                        <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                            {order.customerName}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                                            {formatCurrency(order.totalAmount)}
                                        </Text>
                                        <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                                            {formatDate(order.orderDate)}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
