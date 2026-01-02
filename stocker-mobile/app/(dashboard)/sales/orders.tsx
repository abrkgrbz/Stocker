import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import {
    ArrowLeft,
    Search,
    Plus,
    Filter,
    ShoppingCart,
    Clock,
    CheckCircle,
    Truck,
    Package,
    XCircle,
    ChevronRight,
    RefreshCw
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useOrders } from '@/lib/api/hooks/useSales';
import type { Order, OrderStatus } from '@/lib/api/types/sales.types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: any }> = {
    draft: { label: 'Taslak', color: '#64748b', bgColor: '#f1f5f9', icon: Clock },
    pending: { label: 'Bekliyor', color: '#f59e0b', bgColor: '#fef3c7', icon: Clock },
    confirmed: { label: 'Onaylandı', color: '#3b82f6', bgColor: '#dbeafe', icon: CheckCircle },
    processing: { label: 'Hazırlanıyor', color: '#8b5cf6', bgColor: '#ede9fe', icon: Package },
    shipped: { label: 'Kargoda', color: '#06b6d4', bgColor: '#cffafe', icon: Truck },
    delivered: { label: 'Teslim Edildi', color: '#22c55e', bgColor: '#dcfce7', icon: CheckCircle },
    cancelled: { label: 'İptal', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle }
};

export default function OrdersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

    // Fetch orders from API
    const {
        data: ordersResponse,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useOrders({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        pageSize: 50
    });

    const orders = ordersResponse?.items || [];

    const statusFilters: { key: OrderStatus | 'all'; label: string }[] = [
        { key: 'all', label: 'Tümü' },
        { key: 'pending', label: 'Bekliyor' },
        { key: 'confirmed', label: 'Onaylı' },
        { key: 'shipped', label: 'Kargoda' },
        { key: 'delivered', label: 'Teslim' }
    ];

    const filteredOrders = useMemo(() => {
        if (!searchQuery) return orders;
        return orders.filter(order => {
            const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [orders, searchQuery]);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

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
            month: 'short'
        });
    };

    const OrderCard = ({ item, index }: { item: Order; index: number }) => {
        const statusConfig = STATUS_CONFIG[item.status];
        const StatusIcon = statusConfig.icon;

        return (
            <Animated.View entering={FadeInRight.duration(300).delay(index * 50)}>
                <Pressable
                    onPress={() => router.push(`/(dashboard)/sales/order/${item.id}` as any)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: colors.border.primary
                    }}
                >
                    <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-row items-center">
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: colors.modules.salesLight,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12
                                }}
                            >
                                <ShoppingCart size={22} color={colors.modules.sales} />
                            </View>
                            <View>
                                <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600' }}>
                                    {item.orderNumber}
                                </Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                    {item.customerName}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={{
                                backgroundColor: statusConfig.bgColor,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <StatusIcon size={12} color={statusConfig.color} />
                            <Text style={{ color: statusConfig.color, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                                {statusConfig.label}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                {formatDate(item.orderDate)}
                            </Text>
                            {item.deliveryDate && (
                                <>
                                    <Text style={{ color: colors.text.tertiary, marginHorizontal: 6 }}>→</Text>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                        {formatDate(item.deliveryDate)}
                                    </Text>
                                </>
                            )}
                        </View>
                        <View className="flex-row items-center">
                            <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '700' }}>
                                {formatCurrency(item.totalAmount)}
                            </Text>
                            <ChevronRight size={18} color={colors.text.tertiary} style={{ marginLeft: 4 }} />
                        </View>
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
                            <Text style={{ color: colors.text.primary }} className="text-xl font-bold">Siparişler</Text>
                            <Text style={{ color: colors.text.secondary }} className="text-sm">
                                {filteredOrders.length} sipariş
                            </Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(dashboard)/sales/order/new' as any)}
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
                            Sipariş ara...
                        </Text>
                    </Pressable>
                </View>
            </Animated.View>

            {/* Status Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="py-3 px-4"
                style={{ maxHeight: 52, backgroundColor: colors.surface.primary }}
            >
                {statusFilters.map((filter) => (
                    <Pressable
                        key={filter.key}
                        onPress={() => setSelectedStatus(filter.key)}
                        style={{
                            backgroundColor: selectedStatus === filter.key
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
                                color: selectedStatus === filter.key
                                    ? colors.text.inverse
                                    : colors.text.secondary,
                                fontSize: 13,
                                fontWeight: '500'
                            }}
                        >
                            {filter.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Orders List */}
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
                            Siparişler yükleniyor...
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
                            Siparişler yüklenemedi
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
                ) : filteredOrders.length === 0 ? (
                    <View className="items-center justify-center py-12">
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 16,
                                backgroundColor: colors.modules.salesLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}
                        >
                            <ShoppingCart size={28} color={colors.modules.sales} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            Sipariş bulunamadı
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center' }}>
                            {searchQuery ? 'Arama kriterlerinize uygun sipariş yok' : 'Henüz sipariş eklenmemiş'}
                        </Text>
                    </View>
                ) : (
                    filteredOrders.map((order, index) => (
                        <OrderCard key={order.id} item={order} index={index} />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
