import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import {
    ArrowLeft,
    Search,
    Package,
    Hash,
    CheckCircle,
    AlertTriangle,
    Minus,
    Plus,
    BarChart3,
    Scan,
    X,
    ClipboardList,
    Save
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useProducts, useWarehouses, useCreateStockCount, useUpdateStockCountItem, useCompleteStockCount } from '@/lib/api/hooks/useInventory';
import type { Product, StockCountItem } from '@/lib/api/types/inventory.types';

interface CountItem extends StockCountItem {
    isCounted: boolean;
}

export default function StockCountScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const [searchQuery, setSearchQuery] = useState('');
    const [countItems, setCountItems] = useState<Map<string, CountItem>>(new Map());
    const [showOnlyUncounted, setShowOnlyUncounted] = useState(false);

    const {
        data: productsResponse,
        isLoading,
        refetch,
        isRefetching
    } = useProducts({ pageSize: 200 });

    const { data: warehouses } = useWarehouses();
    const defaultWarehouse = warehouses?.find(w => w.isDefault) || warehouses?.[0];

    const createStockCount = useCreateStockCount();
    const updateStockCountItem = useUpdateStockCountItem();
    const completeStockCount = useCompleteStockCount();

    const [stockCountId, setStockCountId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const products = productsResponse?.items || [];

    // Filter products
    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (searchQuery.length >= 2) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.sku.toLowerCase().includes(query) ||
                p.barcode?.toLowerCase().includes(query)
            );
        }

        if (showOnlyUncounted) {
            filtered = filtered.filter(p => !countItems.has(p.id));
        }

        return filtered;
    }, [products, searchQuery, showOnlyUncounted, countItems]);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const updateCount = (productId: string, quantity: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        setCountItems(prev => {
            const newMap = new Map(prev);
            newMap.set(productId, {
                productId,
                productName: product.name,
                sku: product.sku,
                barcode: product.barcode,
                expectedQuantity: product.stockQuantity,
                countedQuantity: Math.max(0, quantity),
                variance: quantity - product.stockQuantity,
                isCounted: true
            });
            return newMap;
        });
    };

    const incrementCount = (productId: string) => {
        const existing = countItems.get(productId);
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const currentCount = existing?.countedQuantity ?? product.stockQuantity;
        updateCount(productId, currentCount + 1);
    };

    const decrementCount = (productId: string) => {
        const existing = countItems.get(productId);
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const currentCount = existing?.countedQuantity ?? product.stockQuantity;
        updateCount(productId, currentCount - 1);
    };

    const resetCount = (productId: string) => {
        setCountItems(prev => {
            const newMap = new Map(prev);
            newMap.delete(productId);
            return newMap;
        });
    };

    // Stats
    const stats = useMemo(() => {
        const counted = countItems.size;
        const total = products.length;
        const withVariance = Array.from(countItems.values()).filter(i => i.variance !== 0).length;
        const positiveVariance = Array.from(countItems.values()).filter(i => (i.variance || 0) > 0).length;
        const negativeVariance = Array.from(countItems.values()).filter(i => (i.variance || 0) < 0).length;

        return { counted, total, withVariance, positiveVariance, negativeVariance };
    }, [countItems, products]);

    const handleSave = async () => {
        if (countItems.size === 0) {
            Alert.alert('Uyarı', 'Henüz hiçbir ürün sayılmadı.');
            return;
        }

        if (!defaultWarehouse) {
            Alert.alert('Hata', 'Depo bulunamadı.');
            return;
        }

        Alert.alert(
            'Sayımı Kaydet',
            `${countItems.size} ürün sayıldı. ${stats.withVariance} üründe fark var. Kaydetmek istiyor musunuz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Kaydet',
                    onPress: async () => {
                        setIsSaving(true);
                        try {
                            // Create stock count first
                            const countedProductIds = Array.from(countItems.keys());
                            const stockCount = await createStockCount.mutateAsync({
                                warehouseId: defaultWarehouse.id,
                                productIds: countedProductIds,
                                notes: `Mobil uygulama ile sayıldı - ${new Date().toLocaleDateString('tr-TR')}`
                            });

                            // Update each counted item
                            const updatePromises = Array.from(countItems.entries()).map(([productId, item]) =>
                                updateStockCountItem.mutateAsync({
                                    countId: stockCount.id,
                                    productId,
                                    data: { countedQuantity: item.countedQuantity ?? 0 }
                                })
                            );

                            await Promise.all(updatePromises);

                            // Complete the stock count
                            await completeStockCount.mutateAsync({
                                id: stockCount.id,
                                applyVariance: true
                            });

                            Alert.alert('Başarılı', 'Stok sayımı kaydedildi ve uygulandı.', [
                                { text: 'Tamam', onPress: () => router.back() }
                            ]);
                        } catch (error: any) {
                            const message = error?.response?.data?.message || 'Stok sayımı kaydedilirken bir hata oluştu';
                            Alert.alert('Hata', message);
                        } finally {
                            setIsSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const ProductCountCard = ({ product, index }: { product: Product; index: number }) => {
        const countItem = countItems.get(product.id);
        const currentCount = countItem?.countedQuantity ?? product.stockQuantity;
        const variance = countItem ? currentCount - product.stockQuantity : 0;
        const isCounted = countItem?.isCounted ?? false;

        return (
            <Animated.View entering={FadeInRight.duration(300).delay(Math.min(index * 30, 300))}>
                <View
                    style={{
                        backgroundColor: colors.surface.primary,
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: isCounted
                            ? variance === 0
                                ? colors.semantic.success
                                : variance > 0
                                    ? colors.semantic.warning
                                    : colors.semantic.error
                            : colors.border.primary
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        {/* Product Icon */}
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                backgroundColor: colors.modules.inventoryLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12
                            }}
                        >
                            <Package size={22} color={colors.modules.inventory} />
                        </View>

                        {/* Product Info */}
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600' }} numberOfLines={1}>
                                {product.name}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                <Hash size={12} color={colors.text.tertiary} />
                                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginLeft: 2 }}>
                                    {product.sku}
                                </Text>
                                {product.barcode && (
                                    <Text style={{ color: colors.text.tertiary, fontSize: 12, marginLeft: 8 }}>
                                        • {product.barcode}
                                    </Text>
                                )}
                            </View>

                            {/* Expected vs Counted */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                                    Beklenen: <Text style={{ fontWeight: '600' }}>{product.stockQuantity}</Text>
                                </Text>
                                {isCounted && variance !== 0 && (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginLeft: 12,
                                            paddingHorizontal: 8,
                                            paddingVertical: 2,
                                            borderRadius: 4,
                                            backgroundColor: variance > 0 ? colors.semantic.warningLight : colors.semantic.errorLight
                                        }}
                                    >
                                        {variance > 0 ? (
                                            <Plus size={12} color={colors.semantic.warning} />
                                        ) : (
                                            <Minus size={12} color={colors.semantic.error} />
                                        )}
                                        <Text style={{
                                            color: variance > 0 ? colors.semantic.warning : colors.semantic.error,
                                            fontSize: 12,
                                            fontWeight: '600',
                                            marginLeft: 2
                                        }}>
                                            {Math.abs(variance)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Count status */}
                        {isCounted && (
                            <Pressable
                                onPress={() => resetCount(product.id)}
                                style={{ padding: 4, marginLeft: 8 }}
                            >
                                <X size={18} color={colors.text.tertiary} />
                            </Pressable>
                        )}
                    </View>

                    {/* Counter */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 12,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: colors.border.primary
                    }}>
                        <Pressable
                            onPress={() => decrementCount(product.id)}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: colors.background.tertiary,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Minus size={22} color={colors.text.primary} />
                        </Pressable>

                        <View style={{
                            minWidth: 80,
                            alignItems: 'center',
                            marginHorizontal: 20
                        }}>
                            <Text style={{
                                color: colors.text.primary,
                                fontSize: 28,
                                fontWeight: '700'
                            }}>
                                {currentCount}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                                {isCounted ? 'Sayılan' : 'Mevcut'}
                            </Text>
                        </View>

                        <Pressable
                            onPress={() => incrementCount(product.id)}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: colors.brand.primary,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Plus size={22} color="#fff" />
                        </Pressable>
                    </View>
                </View>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeIn.duration(400)}
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: colors.surface.primary,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.primary
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Pressable onPress={() => router.back()} style={{ marginRight: 12, padding: 8, marginLeft: -8 }}>
                        <ArrowLeft size={24} color={colors.text.primary} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                            Stok Sayımı
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                            {defaultWarehouse?.name || 'Depo seçilmedi'}
                        </Text>
                    </View>
                    <Pressable
                        onPress={handleSave}
                        disabled={isSaving}
                        style={{
                            backgroundColor: colors.brand.primary,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                            opacity: isSaving ? 0.7 : 1
                        }}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Save size={18} color="#fff" />
                                <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6 }}>Kaydet</Text>
                            </>
                        )}
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
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Ürün ara (ad, SKU, barkod)..."
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
                    <Pressable
                        onPress={() => router.push('/(dashboard)/inventory/scanner' as any)}
                        style={{
                            marginLeft: 8,
                            padding: 8,
                            backgroundColor: colors.modules.inventory,
                            borderRadius: 8
                        }}
                    >
                        <Scan size={20} color="#fff" />
                    </Pressable>
                </View>
            </Animated.View>

            {/* Stats */}
            <Animated.View
                entering={FadeInDown.duration(400).delay(100)}
                style={{
                    flexDirection: 'row',
                    padding: 16,
                    gap: 12
                }}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: colors.surface.primary,
                    borderRadius: 12,
                    padding: 14,
                    alignItems: 'center'
                }}>
                    <BarChart3 size={20} color={colors.brand.primary} />
                    <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700', marginTop: 4 }}>
                        {stats.counted}/{stats.total}
                    </Text>
                    <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Sayılan</Text>
                </View>

                <View style={{
                    flex: 1,
                    backgroundColor: colors.surface.primary,
                    borderRadius: 12,
                    padding: 14,
                    alignItems: 'center'
                }}>
                    <CheckCircle size={20} color={colors.semantic.success} />
                    <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700', marginTop: 4 }}>
                        {stats.counted - stats.withVariance}
                    </Text>
                    <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Eşleşen</Text>
                </View>

                <View style={{
                    flex: 1,
                    backgroundColor: colors.surface.primary,
                    borderRadius: 12,
                    padding: 14,
                    alignItems: 'center'
                }}>
                    <AlertTriangle size={20} color={colors.semantic.warning} />
                    <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700', marginTop: 4 }}>
                        {stats.withVariance}
                    </Text>
                    <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Farklı</Text>
                </View>
            </Animated.View>

            {/* Filter Toggle */}
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                <Pressable
                    onPress={() => setShowOnlyUncounted(!showOnlyUncounted)}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        backgroundColor: showOnlyUncounted ? colors.brand.primary + '20' : colors.surface.primary,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: showOnlyUncounted ? colors.brand.primary : colors.border.primary
                    }}
                >
                    <ClipboardList size={18} color={showOnlyUncounted ? colors.brand.primary : colors.text.secondary} />
                    <Text style={{
                        color: showOnlyUncounted ? colors.brand.primary : colors.text.secondary,
                        fontSize: 14,
                        fontWeight: '500',
                        marginLeft: 8
                    }}>
                        Sadece sayılmamışları göster
                    </Text>
                </Pressable>
            </View>

            {/* Products List */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 60 + insets.bottom + 24 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={colors.brand.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                        <ActivityIndicator size="large" color={colors.brand.primary} />
                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginTop: 12 }}>
                            Ürünler yükleniyor...
                        </Text>
                    </View>
                ) : filteredProducts.length === 0 ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
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
                            {searchQuery ? 'Arama kriterlerinize uygun ürün yok' : showOnlyUncounted ? 'Tüm ürünler sayıldı' : 'Henüz ürün eklenmemiş'}
                        </Text>
                    </View>
                ) : (
                    filteredProducts.map((product, index) => (
                        <ProductCountCard key={product.id} product={product} index={index} />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
