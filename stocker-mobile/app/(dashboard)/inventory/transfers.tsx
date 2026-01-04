import React, { useState, useCallback } from 'react';
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
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import {
    X,
    ArrowRightLeft,
    Package,
    Warehouse,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    ArrowRight,
    Plus
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useStockTransfers } from '@/lib/api/hooks/useInventory';
import type { StockTransfer, StockTransferStatus } from '@/lib/api/types/inventory.types';

const STATUS_CONFIG: Record<StockTransferStatus, { label: string; color: string; icon: any }> = {
    draft: { label: 'Taslak', color: '#64748b', icon: Clock },
    pending: { label: 'Bekliyor', color: '#f59e0b', icon: Clock },
    approved: { label: 'Onaylandı', color: '#3b82f6', icon: CheckCircle },
    shipped: { label: 'Sevk Edildi', color: '#8b5cf6', icon: Truck },
    received: { label: 'Teslim Alındı', color: '#22c55e', icon: CheckCircle },
    cancelled: { label: 'İptal', color: '#ef4444', icon: XCircle },
};

export default function TransfersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [selectedStatus, setSelectedStatus] = useState<StockTransferStatus | 'all'>('all');

    const {
        data: transfersResponse,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useStockTransfers({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        pageSize: 50
    });

    const transfers = transfersResponse?.items || [];

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const StatusFilter = ({ status, label }: { status: StockTransferStatus | 'all'; label: string }) => {
        const isSelected = selectedStatus === status;
        const config = status !== 'all' ? STATUS_CONFIG[status] : null;

        return (
            <Pressable
                onPress={() => setSelectedStatus(status)}
                style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor: isSelected ? colors.modules.inventory : colors.surface.primary,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.modules.inventory : colors.border.primary,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
            >
                {config && (
                    <View
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: config.color,
                            marginRight: 6
                        }}
                    />
                )}
                <Text style={{
                    color: isSelected ? '#fff' : colors.text.secondary,
                    fontSize: 13,
                    fontWeight: '500'
                }}>
                    {label}
                </Text>
            </Pressable>
        );
    };

    const TransferCard = ({ transfer, index }: { transfer: StockTransfer; index: number }) => {
        const statusConfig = STATUS_CONFIG[transfer.status];
        const StatusIcon = statusConfig.icon;
        const totalItems = transfer.items?.reduce((sum, item) => sum + item.requestedQuantity, 0) || 0;

        return (
            <Animated.View entering={FadeInRight.duration(300).delay(index * 50)}>
                <Pressable
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: colors.border.primary,
                        borderLeftWidth: 4,
                        borderLeftColor: statusConfig.color
                    }}
                >
                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                                {transfer.transferNumber}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                {formatDate(transfer.requestedAt)}
                            </Text>
                        </View>
                        <View
                            style={{
                                backgroundColor: statusConfig.color + '20',
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 6,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <StatusIcon size={12} color={statusConfig.color} />
                            <Text style={{ color: statusConfig.color, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
                                {statusConfig.label}
                            </Text>
                        </View>
                    </View>

                    {/* Warehouses */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: colors.background.tertiary,
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 12
                        }}
                    >
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Warehouse size={18} color={colors.semantic.error} />
                            <Text style={{ color: colors.text.tertiary, fontSize: 10, marginTop: 4 }}>Kaynak</Text>
                            <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: '600', textAlign: 'center' }} numberOfLines={1}>
                                {transfer.fromWarehouseName}
                            </Text>
                        </View>

                        <View style={{ paddingHorizontal: 12 }}>
                            <ArrowRight size={20} color={colors.modules.inventory} />
                        </View>

                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Warehouse size={18} color={colors.semantic.success} />
                            <Text style={{ color: colors.text.tertiary, fontSize: 10, marginTop: 4 }}>Hedef</Text>
                            <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: '600', textAlign: 'center' }} numberOfLines={1}>
                                {transfer.toWarehouseName}
                            </Text>
                        </View>
                    </View>

                    {/* Items Summary */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Package size={16} color={colors.text.tertiary} />
                            <Text style={{ color: colors.text.secondary, fontSize: 13, marginLeft: 6 }}>
                                {transfer.items?.length || 0} ürün, {totalItems} adet
                            </Text>
                        </View>

                        {transfer.requestedByName && (
                            <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                {transfer.requestedByName}
                            </Text>
                        )}
                    </View>

                    {/* Progress Bar for shipped transfers */}
                    {transfer.status === 'shipped' && (
                        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>Transfer Durumu</Text>
                                <Text style={{ color: colors.modules.inventory, fontSize: 12, fontWeight: '600' }}>Yolda</Text>
                            </View>
                            <View style={{ height: 4, backgroundColor: colors.background.tertiary, borderRadius: 2 }}>
                                <View style={{ width: '66%', height: '100%', backgroundColor: colors.modules.inventory, borderRadius: 2 }} />
                            </View>
                        </View>
                    )}
                </Pressable>
            </Animated.View>
        );
    };

    // Stats
    const stats = {
        total: transfers.length,
        pending: transfers.filter(t => t.status === 'pending').length,
        shipped: transfers.filter(t => t.status === 'shipped').length,
        completed: transfers.filter(t => t.status === 'received').length,
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(400)}
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
                <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700' }}>
                        Stok Transferleri
                    </Text>
                    <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                        {stats.total} transfer
                    </Text>
                </View>
                <Pressable
                    onPress={() => router.push('/(dashboard)/inventory/add-transfer')}
                    style={{
                        backgroundColor: colors.modules.inventory,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginRight: 10
                    }}
                >
                    <Plus size={18} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 4, fontSize: 13 }}>
                        Yeni
                    </Text>
                </Pressable>
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
            </Animated.View>

            {/* Stats Row */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
                >
                    <View
                        style={{
                            backgroundColor: colors.modules.inventory,
                            borderRadius: 12,
                            padding: 14,
                            marginRight: 10,
                            minWidth: 100,
                            alignItems: 'center'
                        }}
                    >
                        <ArrowRightLeft size={20} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 4 }}>{stats.total}</Text>
                        <Text style={{ color: '#fff', fontSize: 11, opacity: 0.8 }}>Toplam</Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            padding: 14,
                            marginRight: 10,
                            minWidth: 100,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.border.primary
                        }}
                    >
                        <Clock size={20} color="#f59e0b" />
                        <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700', marginTop: 4 }}>{stats.pending}</Text>
                        <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Bekliyor</Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            padding: 14,
                            marginRight: 10,
                            minWidth: 100,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.border.primary
                        }}
                    >
                        <Truck size={20} color="#8b5cf6" />
                        <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700', marginTop: 4 }}>{stats.shipped}</Text>
                        <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Sevkte</Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            padding: 14,
                            minWidth: 100,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.border.primary
                        }}
                    >
                        <CheckCircle size={20} color="#22c55e" />
                        <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700', marginTop: 4 }}>{stats.completed}</Text>
                        <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Tamamlandı</Text>
                    </View>
                </ScrollView>
            </Animated.View>

            {/* Status Filters */}
            <View style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.surface.primary }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <StatusFilter status="all" label="Tümü" />
                    <StatusFilter status="pending" label="Bekliyor" />
                    <StatusFilter status="approved" label="Onaylandı" />
                    <StatusFilter status="shipped" label="Sevkte" />
                    <StatusFilter status="received" label="Teslim Alındı" />
                    <StatusFilter status="cancelled" label="İptal" />
                </ScrollView>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 60 + insets.bottom + 24 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.modules.inventory}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                        <ActivityIndicator size="large" color={colors.modules.inventory} />
                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginTop: 12 }}>
                            Transferler yükleniyor...
                        </Text>
                    </View>
                ) : isError ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
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
                            <XCircle size={28} color={colors.semantic.error} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            Yükleme hatası
                        </Text>
                        <Pressable
                            onPress={() => refetch()}
                            style={{
                                backgroundColor: colors.modules.inventory,
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                borderRadius: 8,
                                marginTop: 12
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600' }}>Tekrar Dene</Text>
                        </Pressable>
                    </View>
                ) : transfers.length === 0 ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 16,
                                backgroundColor: colors.modules.inventoryLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}
                        >
                            <ArrowRightLeft size={28} color={colors.modules.inventory} />
                        </View>
                        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            Transfer bulunamadı
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center' }}>
                            {selectedStatus !== 'all' ? 'Bu durumda transfer yok' : 'Henüz transfer oluşturulmamış'}
                        </Text>
                    </View>
                ) : (
                    transfers.map((transfer, index) => (
                        <TransferCard key={transfer.id} transfer={transfer} index={index} />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
