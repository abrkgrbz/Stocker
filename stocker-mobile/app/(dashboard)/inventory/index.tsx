import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    TextInput,
    RefreshControl,
    Image,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import {
    ArrowLeft,
    Search,
    Plus,
    Package,
    Filter,
    ChevronRight,
    X,
    Scan,
    AlertTriangle,
    Grid,
    List,
    RefreshCw,
    WifiOff,
    ArrowRightLeft,
    ClipboardList,
    DollarSign,
    Hash,
    Layers
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useProducts, useLowStockProducts } from '@/lib/api/hooks/useInventory';
import { useSync } from '@/lib/sync/SyncContext';
import {
    SortSheet,
    SortButton,
    type SortOption,
    type SortValue
} from '@/components/ui';
import type { Product, ProductStatus } from '@/lib/api/types/inventory.types';

const SORT_OPTIONS: SortOption[] = [
    { key: 'name', label: 'Ürün Adı', icon: <Package size={18} color="#64748b" /> },
    { key: 'price', label: 'Fiyat', icon: <DollarSign size={18} color="#64748b" /> },
    { key: 'stockQuantity', label: 'Stok Miktarı', icon: <Layers size={18} color="#64748b" /> },
    { key: 'sku', label: 'SKU', icon: <Hash size={18} color="#64748b" /> },
];

export default function ProductListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { isOnline } = useSync();

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [showLowStock, setShowLowStock] = useState(false);
    const [showSortSheet, setShowSortSheet] = useState(false);
    const [sortValue, setSortValue] = useState<SortValue | null>(null);

    // Fetch products from API
    const {
        data: productsResponse,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useProducts({
        search: searchQuery.length >= 2 ? searchQuery : undefined,
        pageSize: 50
    });

    // Fetch low stock count
    const { data: lowStockData } = useLowStockProducts();

    const products = productsResponse?.items || [];
    const lowStockCount = lowStockData?.length || 0;

    // Filter products locally
    const filteredProducts = useMemo(() => {
        let result = products;

        // Local search filter for immediate feedback
        if (searchQuery.length > 0 && searchQuery.length < 2) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.barcode?.includes(searchQuery)
            );
        }

        // Low stock filter
        if (showLowStock) {
            result = result.filter(p => p.stockQuantity <= (p.minStockLevel || 0));
        }

        // Sorting
        if (sortValue) {
            result = [...result].sort((a, b) => {
                let comparison = 0;
                switch (sortValue.key) {
                    case 'name':
                        comparison = a.name.localeCompare(b.name);
                        break;
                    case 'price':
                        comparison = a.price - b.price;
                        break;
                    case 'stockQuantity':
                        comparison = a.stockQuantity - b.stockQuantity;
                        break;
                    case 'sku':
                        comparison = a.sku.localeCompare(b.sku);
                        break;
                }
                return sortValue.order === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [products, searchQuery, showLowStock, sortValue]);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const getStockStatusColor = (product: Product) => {
        if (product.stockQuantity === 0) return colors.semantic.error;
        if (product.stockQuantity <= (product.minStockLevel || 0)) return colors.semantic.warning;
        return colors.semantic.success;
    };

    const getStockStatusLabel = (product: Product) => {
        if (product.stockQuantity === 0) return 'Stok Yok';
        if (product.stockQuantity <= (product.minStockLevel || 0)) return 'Düşük Stok';
        return 'Stokta';
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(value);
    };

    const ProductCard = ({ item, index }: { item: Product; index: number }) => {
        const stockColor = getStockStatusColor(item);
        const isLowStock = item.stockQuantity <= (item.minStockLevel || 0);

        return (
            <Animated.View entering={FadeInRight.duration(300).delay(index * 50)}>
                <Pressable
                    onPress={() => router.push(`/(dashboard)/inventory/${item.id}` as any)}
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: isLowStock ? colors.semantic.warning + '50' : colors.border.primary
                    }}
                >
                    <View className="flex-row">
                        {/* Product Image/Icon */}
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 12,
                                backgroundColor: colors.modules.inventoryLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12
                            }}
                        >
                            <Package size={28} color={colors.modules.inventory} />
                        </View>

                        {/* Info */}
                        <View style={{ flex: 1 }}>
                            <View className="flex-row items-start justify-between mb-1">
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600' }} numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 2 }}>
                                        SKU: {item.sku}
                                    </Text>
                                </View>
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
                                        {getStockStatusLabel(item)}
                                    </Text>
                                </View>
                            </View>

                            {/* Category & Brand */}
                            <View className="flex-row items-center mt-2">
                                {item.categoryName && (
                                    <View
                                        style={{
                                            backgroundColor: colors.background.tertiary,
                                            paddingHorizontal: 8,
                                            paddingVertical: 2,
                                            borderRadius: 4,
                                            marginRight: 6
                                        }}
                                    >
                                        <Text style={{ color: colors.text.secondary, fontSize: 11 }}>{item.categoryName}</Text>
                                    </View>
                                )}
                                {item.brandName && (
                                    <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>{item.brandName}</Text>
                                )}
                            </View>

                            {/* Price & Stock */}
                            <View className="flex-row items-center justify-between mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                                <View>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Fiyat</Text>
                                    <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '700' }}>
                                        {formatCurrency(item.price)}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Stok</Text>
                                    <Text style={{ color: stockColor, fontSize: 16, fontWeight: '700' }}>
                                        {item.stockQuantity} {item.unitName}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={colors.text.tertiary} />
                            </View>
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
                <View className="flex-row items-center mb-3">
                    <Pressable onPress={() => router.back()} className="mr-3 p-2 -ml-2">
                        <ArrowLeft size={24} color={colors.text.primary} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text.primary }} className="text-xl font-bold">Ürünler</Text>
                        <Text style={{ color: colors.text.secondary }} className="text-sm">
                            {filteredProducts.length} ürün
                        </Text>
                    </View>

                    {/* Barcode Scanner Button */}
                    <Pressable
                        onPress={() => router.push('/(dashboard)/inventory/scanner' as any)}
                        style={{
                            backgroundColor: colors.semantic.successLight,
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 8
                        }}
                    >
                        <Scan size={22} color={colors.semantic.success} />
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/(dashboard)/inventory/add' as any)}
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

                {/* Search Bar */}
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
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Ürün veya barkod ara..."
                        placeholderTextColor={colors.text.tertiary}
                        style={{
                            flex: 1,
                            paddingVertical: 12,
                            paddingHorizontal: 8,
                            color: colors.text.primary,
                            fontSize: 15
                        }}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <X size={18} color={colors.text.tertiary} />
                        </Pressable>
                    )}
                </View>

                {/* Filter Row */}
                <View className="flex-row items-center justify-between mt-3">
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable
                            onPress={() => setShowLowStock(!showLowStock)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 20,
                                backgroundColor: showLowStock ? colors.semantic.warning + '20' : colors.surface.primary,
                                borderWidth: 1,
                                borderColor: showLowStock ? colors.semantic.warning : colors.border.primary
                            }}
                        >
                            <AlertTriangle size={14} color={showLowStock ? colors.semantic.warning : colors.text.tertiary} />
                            <Text style={{
                                color: showLowStock ? colors.semantic.warning : colors.text.secondary,
                                fontSize: 13,
                                fontWeight: '500',
                                marginLeft: 6
                            }}>
                                Düşük Stok ({lowStockCount})
                            </Text>
                        </Pressable>
                        <SortButton
                            onPress={() => setShowSortSheet(true)}
                            value={sortValue}
                            options={SORT_OPTIONS}
                        />
                    </View>

                    <View className="flex-row">
                        <Pressable
                            onPress={() => setViewMode('list')}
                            style={{
                                padding: 8,
                                borderRadius: 8,
                                backgroundColor: viewMode === 'list' ? colors.brand.primary : 'transparent'
                            }}
                        >
                            <List size={20} color={viewMode === 'list' ? colors.text.inverse : colors.text.tertiary} />
                        </Pressable>
                        <Pressable
                            onPress={() => setViewMode('grid')}
                            style={{
                                padding: 8,
                                borderRadius: 8,
                                marginLeft: 4,
                                backgroundColor: viewMode === 'grid' ? colors.brand.primary : 'transparent'
                            }}
                        >
                            <Grid size={20} color={viewMode === 'grid' ? colors.text.inverse : colors.text.tertiary} />
                        </Pressable>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="flex-row mt-3">
                    <Pressable
                        onPress={() => router.push('/(dashboard)/inventory/transfers' as any)}
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 10,
                            borderRadius: 10,
                            backgroundColor: colors.modules.inventoryLight,
                            marginRight: 8
                        }}
                    >
                        <ArrowRightLeft size={16} color={colors.modules.inventory} />
                        <Text style={{ color: colors.modules.inventory, fontWeight: '600', marginLeft: 6, fontSize: 13 }}>
                            Transferler
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => router.push('/(dashboard)/inventory/stock-count' as any)}
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 10,
                            borderRadius: 10,
                            backgroundColor: colors.modules.inventoryLight
                        }}
                    >
                        <ClipboardList size={16} color={colors.modules.inventory} />
                        <Text style={{ color: colors.modules.inventory, fontWeight: '600', marginLeft: 6, fontSize: 13 }}>
                            Sayım
                        </Text>
                    </Pressable>
                </View>
            </Animated.View>

            {/* Product List */}
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => <ProductCard item={item} index={index} />}
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: insets.bottom + 100
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
                ListEmptyComponent={() => (
                    <View className="items-center justify-center py-12">
                        {isLoading ? (
                            <>
                                <ActivityIndicator size="large" color={colors.brand.primary} />
                                <Text style={{ color: colors.text.secondary, fontSize: 14, marginTop: 12 }}>
                                    Ürünler yükleniyor...
                                </Text>
                            </>
                        ) : isError ? (
                            <>
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
                                    {isOnline ? (
                                        <RefreshCw size={28} color={colors.semantic.error} />
                                    ) : (
                                        <WifiOff size={28} color={colors.semantic.error} />
                                    )}
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                                    {isOnline ? 'Bağlantı hatası' : 'Çevrimdışı'}
                                </Text>
                                <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                                    {isOnline ? 'Ürünler yüklenemedi' : 'İnternet bağlantınızı kontrol edin'}
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
                            </>
                        ) : (
                            <>
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
                                    <Package size={28} color={colors.modules.inventory} />
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                                    Ürün bulunamadı
                                </Text>
                                <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center' }}>
                                    {searchQuery ? 'Arama kriterlerinize uygun ürün yok' : 'Henüz ürün eklenmemiş'}
                                </Text>
                            </>
                        )}
                    </View>
                )}
            />

            {/* Sort Sheet */}
            <SortSheet
                visible={showSortSheet}
                onClose={() => setShowSortSheet(false)}
                options={SORT_OPTIONS}
                value={sortValue}
                onChange={setSortValue}
                title="Sıralama"
            />
        </SafeAreaView>
    );
}
