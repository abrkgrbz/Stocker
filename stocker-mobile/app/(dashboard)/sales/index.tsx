import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    ShoppingCart,
    FileText,
    Receipt,
    TrendingUp,
    Clock,
    AlertCircle,
    ChevronRight,
    DollarSign,
    RefreshCw
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
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

    // Fetch data from API
    const { data: statsData, isLoading: statsLoading, refetch: refetchStats, isRefetching: statsRefetching } = useSalesStats();
    const { data: pendingOrdersData } = useOrders({ status: 'pending', pageSize: 1 });
    const { data: overdueData } = useOverdueInvoices();
    const { data: quotesData } = useQuotes({ status: 'draft', pageSize: 1 });
    const { data: recentOrdersData } = useRecentOrders(3);

    // Calculate stats
    const stats = {
        todaySales: statsData?.todaySales || 0,
        weeklySales: statsData?.weeklySales || 0,
        monthlySales: statsData?.monthlySales || 0,
        pendingOrders: pendingOrdersData?.totalCount || 0,
        overdueInvoices: overdueData?.length || 0,
        openQuotes: quotesData?.totalCount || 0
    };

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
            color: colors.semantic.error,
            bgColor: colors.semantic.errorLight,
            route: '/(dashboard)/sales/invoices',
            badge: stats.overdueInvoices
        },
        {
            title: 'Teklifler',
            subtitle: `${stats.openQuotes} açık teklif`,
            icon: Receipt,
            color: colors.semantic.info,
            bgColor: colors.semantic.infoLight,
            route: '/(dashboard)/sales/quotes',
            badge: stats.openQuotes
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
                            Satış
                        </Text>
                        <Text style={{ color: colors.text.tertiary }} className="text-sm">
                            Siparişler, Faturalar, Teklifler
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
                {/* Sales Stats Cards */}
                <Animated.View entering={FadeInDown.duration(400).delay(100)} className="p-4">
                    <View
                        style={{
                            backgroundColor: colors.modules.sales,
                            borderRadius: 20,
                            padding: 20,
                            marginBottom: 16
                        }}
                    >
                        <View className="flex-row items-center mb-4">
                            <DollarSign size={24} color="#fff" />
                            <Text style={{ color: '#fff', opacity: 0.9, marginLeft: 8 }} className="text-base">
                                Bugünkü Satış
                            </Text>
                        </View>
                        {isLoading ? (
                            <ActivityIndicator color="#fff" size="large" />
                        ) : (
                            <>
                                <Text style={{ color: '#fff' }} className="text-3xl font-bold mb-2">
                                    {formatCurrency(stats.todaySales)}
                                </Text>
                                <View className="flex-row">
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#fff', opacity: 0.7, fontSize: 12 }}>Bu Hafta</Text>
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>{formatCurrency(stats.weeklySales)}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#fff', opacity: 0.7, fontSize: 12 }}>Bu Ay</Text>
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>{formatCurrency(stats.monthlySales)}</Text>
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
                                {stats.pendingOrders}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>sipariş</Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                marginLeft: 8,
                                borderWidth: 1,
                                borderColor: stats.overdueInvoices > 0 ? colors.semantic.error + '50' : colors.border.primary
                            }}
                        >
                            <View className="flex-row items-center mb-2">
                                <AlertCircle size={18} color={colors.semantic.error} />
                                <Text style={{ color: colors.text.tertiary, marginLeft: 6, fontSize: 12 }}>Vadesi Geçmiş</Text>
                            </View>
                            <Text style={{ color: stats.overdueInvoices > 0 ? colors.semantic.error : colors.text.primary, fontSize: 24, fontWeight: '700' }}>
                                {stats.overdueInvoices}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>fatura</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Menu Items */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)} className="px-4">
                    <Text style={{ color: colors.text.secondary, marginBottom: 12 }} className="text-sm font-medium">
                        Modüller
                    </Text>
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

                {/* Recent Activity */}
                <Animated.View entering={FadeInDown.duration(400).delay(250)} className="p-4">
                    <Text style={{ color: colors.text.secondary, marginBottom: 12 }} className="text-sm font-medium">
                        Son İşlemler
                    </Text>
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: colors.border.primary,
                            overflow: 'hidden'
                        }}
                    >
                        {[
                            { type: 'order', title: 'Sipariş #1234', customer: 'ABC Ltd.', amount: 12500, time: '10 dk önce' },
                            { type: 'invoice', title: 'Fatura #F-2024-089', customer: 'XYZ A.Ş.', amount: 8750, time: '1 saat önce' },
                            { type: 'quote', title: 'Teklif #T-2024-045', customer: 'Demo Şirketi', amount: 25000, time: '3 saat önce' }
                        ].map((item, index) => (
                            <View
                                key={index}
                                style={{
                                    padding: 14,
                                    borderBottomWidth: index < 2 ? 1 : 0,
                                    borderBottomColor: colors.border.primary,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        backgroundColor: item.type === 'order'
                                            ? colors.modules.salesLight
                                            : item.type === 'invoice'
                                                ? colors.semantic.successLight
                                                : colors.semantic.infoLight,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}
                                >
                                    {item.type === 'order' && <ShoppingCart size={18} color={colors.modules.sales} />}
                                    {item.type === 'invoice' && <FileText size={18} color={colors.semantic.success} />}
                                    {item.type === 'quote' && <Receipt size={18} color={colors.semantic.info} />}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>
                                        {item.title}
                                    </Text>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                        {item.customer}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                                        {formatCurrency(item.amount)}
                                    </Text>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                                        {item.time}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
