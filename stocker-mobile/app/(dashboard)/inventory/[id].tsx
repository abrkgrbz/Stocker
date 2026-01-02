import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    Package,
    Edit3,
    Trash2,
    MoreVertical,
    MapPin,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Clock,
    Barcode,
    Tag,
    DollarSign,
    Boxes,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Minus
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import type { Product, StockMovement } from '@/lib/api/types/inventory.types';

// Mock data
const MOCK_PRODUCT: Product = {
    id: '1',
    sku: 'PRD-001',
    barcode: '8691234567890',
    name: 'Laptop Dell Inspiron 15',
    description: '15.6" FHD, Intel Core i5, 8GB RAM, 256GB SSD',
    categoryName: 'Bilgisayarlar',
    brandName: 'Dell',
    unitName: 'Adet',
    price: 28500,
    cost: 24000,
    currency: 'TRY',
    stockQuantity: 15,
    minStockLevel: 5,
    status: 'active',
    createdAt: '2024-01-10',
    updatedAt: '2024-12-28',
    imageUrl: undefined
};

const MOCK_STOCK_LEVELS = [
    { warehouseId: '1', warehouseName: 'Ana Depo', quantity: 10, minQuantity: 3 },
    { warehouseId: '2', warehouseName: 'Mağaza', quantity: 3, minQuantity: 2 },
    { warehouseId: '3', warehouseName: 'Şube Depo', quantity: 2, minQuantity: 1 }
];

const MOCK_MOVEMENTS: StockMovement[] = [
    {
        id: '1',
        productId: '1',
        type: 'in',
        quantity: 5,
        fromWarehouse: undefined,
        toWarehouse: 'Ana Depo',
        reason: 'Tedarikçi Alımı',
        notes: 'Dell Türkiye siparişi',
        createdAt: '2024-12-28T14:30:00',
        createdBy: 'Ahmet Yılmaz'
    },
    {
        id: '2',
        productId: '1',
        type: 'out',
        quantity: 2,
        fromWarehouse: 'Ana Depo',
        toWarehouse: undefined,
        reason: 'Satış',
        notes: 'Sipariş #1234',
        createdAt: '2024-12-27T10:15:00',
        createdBy: 'Mehmet Demir'
    },
    {
        id: '3',
        productId: '1',
        type: 'transfer',
        quantity: 3,
        fromWarehouse: 'Ana Depo',
        toWarehouse: 'Mağaza',
        reason: 'Transfer',
        notes: 'Mağaza stoğu takviyesi',
        createdAt: '2024-12-26T16:45:00',
        createdBy: 'Ayşe Kaya'
    },
    {
        id: '4',
        productId: '1',
        type: 'in',
        quantity: 10,
        fromWarehouse: undefined,
        toWarehouse: 'Ana Depo',
        reason: 'Tedarikçi Alımı',
        notes: 'İlk stok girişi',
        createdAt: '2024-01-10T09:00:00',
        createdBy: 'Sistem'
    }
];

export default function ProductDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'stock' | 'movements'>('info');

    // In real app, fetch product by id
    const product = MOCK_PRODUCT;

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStockStatusColor = () => {
        if (product.stockQuantity === 0) return colors.semantic.error;
        if (product.stockQuantity <= (product.minStockLevel || 0)) return colors.semantic.warning;
        return colors.semantic.success;
    };

    const getStockStatusLabel = () => {
        if (product.stockQuantity === 0) return 'Stok Yok';
        if (product.stockQuantity <= (product.minStockLevel || 0)) return 'Düşük Stok';
        return 'Stokta';
    };

    const isLowStock = product.stockQuantity <= (product.minStockLevel || 0);
    const stockColor = getStockStatusColor();
    const profitMargin = ((product.price - (product.cost || 0)) / product.price * 100).toFixed(1);

    const handleDelete = () => {
        Alert.alert(
            'Ürünü Sil',
            `"${product.name}" ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: () => {
                        // API call would go here
                        router.back();
                    }
                }
            ]
        );
    };

    const handleQuickStockUpdate = (type: 'add' | 'remove') => {
        Alert.prompt(
            type === 'add' ? 'Stok Girişi' : 'Stok Çıkışı',
            'Miktar girin:',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Onayla',
                    onPress: (value: string | undefined) => {
                        const qty = parseInt(value || '0', 10);
                        if (qty > 0) {
                            Alert.alert('Başarılı', `${qty} adet ${type === 'add' ? 'eklendi' : 'çıkarıldı'}`);
                        }
                    }
                }
            ],
            'plain-text',
            '',
            'numeric'
        );
    };

    const TabButton = ({ tab, label }: { tab: typeof activeTab; label: string }) => (
        <Pressable
            onPress={() => setActiveTab(tab)}
            style={{
                flex: 1,
                paddingVertical: 12,
                borderBottomWidth: 2,
                borderBottomColor: activeTab === tab ? colors.brand.primary : 'transparent'
            }}
        >
            <Text
                style={{
                    color: activeTab === tab ? colors.brand.primary : colors.text.tertiary,
                    fontSize: 14,
                    fontWeight: '600',
                    textAlign: 'center'
                }}
            >
                {label}
            </Text>
        </Pressable>
    );

    const InfoItem = ({ icon: Icon, label, value, valueColor }: {
        icon: any;
        label: string;
        value: string;
        valueColor?: string;
    }) => (
        <View className="flex-row items-center py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.border.primary }}>
            <View
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: colors.background.tertiary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                }}
            >
                <Icon size={18} color={colors.text.tertiary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>{label}</Text>
                <Text style={{ color: valueColor || colors.text.primary, fontSize: 15, fontWeight: '500' }}>{value}</Text>
            </View>
        </View>
    );

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
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <Pressable onPress={() => router.back()} className="mr-3 p-2 -ml-2">
                            <ArrowLeft size={24} color={colors.text.primary} />
                        </Pressable>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }} numberOfLines={1}>
                                {product.name}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
                                SKU: {product.sku}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row">
                        <Pressable
                            onPress={() => router.push(`/(dashboard)/inventory/edit/${id}` as any)}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                backgroundColor: colors.background.tertiary,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 8
                            }}
                        >
                            <Edit3 size={20} color={colors.text.secondary} />
                        </Pressable>
                        <Pressable
                            onPress={handleDelete}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                backgroundColor: colors.semantic.errorLight,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Trash2 size={20} color={colors.semantic.error} />
                        </Pressable>
                    </View>
                </View>
            </Animated.View>

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            >
                {/* Product Card */}
                <Animated.View entering={FadeInDown.duration(400).delay(100)} className="p-4">
                    <View
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: isLowStock ? colors.semantic.warning + '50' : colors.border.primary
                        }}
                    >
                        {/* Product Image/Icon */}
                        <View className="flex-row">
                            <View
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 12,
                                    backgroundColor: colors.modules.inventoryLight,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 16
                                }}
                            >
                                <Package size={36} color={colors.modules.inventory} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View className="flex-row items-start justify-between mb-1">
                                    <View
                                        style={{
                                            backgroundColor: stockColor + '20',
                                            paddingHorizontal: 8,
                                            paddingVertical: 3,
                                            borderRadius: 6,
                                            flexDirection: 'row',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {isLowStock && <AlertTriangle size={12} color={stockColor} style={{ marginRight: 4 }} />}
                                        <Text style={{ color: stockColor, fontSize: 11, fontWeight: '600' }}>
                                            {getStockStatusLabel()}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={{ color: colors.text.secondary, fontSize: 13, marginTop: 4 }}>
                                    {product.categoryName} • {product.brandName}
                                </Text>
                                {product.description && (
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 4 }} numberOfLines={2}>
                                        {product.description}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Quick Stats */}
                        <View className="flex-row mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Satış Fiyatı</Text>
                                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                                    {formatCurrency(product.price)}
                                </Text>
                            </View>
                            <View style={{ width: 1, backgroundColor: colors.border.primary }} />
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Stok</Text>
                                <Text style={{ color: stockColor, fontSize: 18, fontWeight: '700' }}>
                                    {product.stockQuantity} {product.unitName}
                                </Text>
                            </View>
                            <View style={{ width: 1, backgroundColor: colors.border.primary }} />
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Kar Marjı</Text>
                                <Text style={{ color: colors.semantic.success, fontSize: 18, fontWeight: '700' }}>
                                    %{profitMargin}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Quick Stock Actions */}
                <Animated.View entering={FadeInDown.duration(400).delay(150)} className="px-4 mb-4">
                    <View className="flex-row">
                        <Pressable
                            onPress={() => handleQuickStockUpdate('remove')}
                            style={{
                                flex: 1,
                                backgroundColor: colors.semantic.errorLight,
                                borderRadius: 12,
                                paddingVertical: 14,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 8
                            }}
                        >
                            <Minus size={18} color={colors.semantic.error} />
                            <Text style={{ color: colors.semantic.error, fontSize: 14, fontWeight: '600', marginLeft: 6 }}>
                                Stok Çıkışı
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => handleQuickStockUpdate('add')}
                            style={{
                                flex: 1,
                                backgroundColor: colors.semantic.success,
                                borderRadius: 12,
                                paddingVertical: 14,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: 8
                            }}
                        >
                            <Plus size={18} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>
                                Stok Girişi
                            </Text>
                        </Pressable>
                    </View>
                </Animated.View>

                {/* Tabs */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                    <View
                        className="flex-row mx-4"
                        style={{
                            backgroundColor: colors.surface.primary,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: colors.border.primary
                        }}
                    >
                        <TabButton tab="info" label="Bilgiler" />
                        <TabButton tab="stock" label="Depolar" />
                        <TabButton tab="movements" label="Hareketler" />
                    </View>
                </Animated.View>

                {/* Tab Content */}
                <Animated.View entering={FadeInDown.duration(400).delay(250)} className="p-4">
                    {activeTab === 'info' && (
                        <View
                            style={{
                                backgroundColor: colors.surface.primary,
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.border.primary
                            }}
                        >
                            <InfoItem icon={Barcode} label="Barkod" value={product.barcode || '-'} />
                            <InfoItem icon={Tag} label="Kategori" value={product.categoryName || '-'} />
                            <InfoItem icon={Package} label="Marka" value={product.brandName || '-'} />
                            <InfoItem icon={DollarSign} label="Maliyet" value={formatCurrency(product.cost || 0)} />
                            <InfoItem icon={Boxes} label="Birim" value={product.unitName || '-'} />
                            <InfoItem
                                icon={AlertTriangle}
                                label="Min. Stok Seviyesi"
                                value={`${product.minStockLevel || 0} ${product.unitName}`}
                                valueColor={isLowStock ? colors.semantic.warning : undefined}
                            />
                            <InfoItem icon={Clock} label="Son Güncelleme" value={formatDate(product.updatedAt)} />
                        </View>
                    )}

                    {activeTab === 'stock' && (
                        <View>
                            {MOCK_STOCK_LEVELS.map((level, index) => {
                                const isWarehouseLow = level.quantity <= level.minQuantity;
                                return (
                                    <View
                                        key={level.warehouseId}
                                        style={{
                                            backgroundColor: colors.surface.primary,
                                            borderRadius: 12,
                                            padding: 16,
                                            marginBottom: 12,
                                            borderWidth: 1,
                                            borderColor: isWarehouseLow ? colors.semantic.warning + '50' : colors.border.primary
                                        }}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center">
                                                <View
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 10,
                                                        backgroundColor: colors.background.tertiary,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: 12
                                                    }}
                                                >
                                                    <MapPin size={20} color={colors.text.tertiary} />
                                                </View>
                                                <View>
                                                    <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600' }}>
                                                        {level.warehouseName}
                                                    </Text>
                                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                                        Min: {level.minQuantity} {product.unitName}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text
                                                    style={{
                                                        color: isWarehouseLow ? colors.semantic.warning : colors.semantic.success,
                                                        fontSize: 20,
                                                        fontWeight: '700'
                                                    }}
                                                >
                                                    {level.quantity}
                                                </Text>
                                                <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                                                    {product.unitName}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {activeTab === 'movements' && (
                        <View>
                            {MOCK_MOVEMENTS.map((movement, index) => {
                                const isIn = movement.type === 'in';
                                const isOut = movement.type === 'out';
                                const isTransfer = movement.type === 'transfer';

                                return (
                                    <View
                                        key={movement.id}
                                        style={{
                                            backgroundColor: colors.surface.primary,
                                            borderRadius: 12,
                                            padding: 16,
                                            marginBottom: 12,
                                            borderWidth: 1,
                                            borderColor: colors.border.primary
                                        }}
                                    >
                                        <View className="flex-row items-start justify-between">
                                            <View className="flex-row items-center">
                                                <View
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 10,
                                                        backgroundColor: isIn
                                                            ? colors.semantic.successLight
                                                            : isOut
                                                                ? colors.semantic.errorLight
                                                                : colors.semantic.infoLight,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: 12
                                                    }}
                                                >
                                                    {isIn && <ArrowDownRight size={20} color={colors.semantic.success} />}
                                                    {isOut && <ArrowUpRight size={20} color={colors.semantic.error} />}
                                                    {isTransfer && <TrendingUp size={20} color={colors.semantic.info} />}
                                                </View>
                                                <View>
                                                    <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                                                        {movement.reason}
                                                    </Text>
                                                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                                                        {isIn && `→ ${movement.toWarehouse}`}
                                                        {isOut && `${movement.fromWarehouse} →`}
                                                        {isTransfer && `${movement.fromWarehouse} → ${movement.toWarehouse}`}
                                                    </Text>
                                                    {movement.notes && (
                                                        <Text style={{ color: colors.text.tertiary, fontSize: 11, marginTop: 2 }}>
                                                            {movement.notes}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text
                                                    style={{
                                                        color: isIn
                                                            ? colors.semantic.success
                                                            : isOut
                                                                ? colors.semantic.error
                                                                : colors.semantic.info,
                                                        fontSize: 16,
                                                        fontWeight: '700'
                                                    }}
                                                >
                                                    {isIn ? '+' : isOut ? '-' : ''}{movement.quantity}
                                                </Text>
                                                <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                                                    {product.unitName}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="flex-row items-center justify-between mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                                            <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                                                {movement.createdBy}
                                            </Text>
                                            <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                                                {formatDate(movement.createdAt)}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
