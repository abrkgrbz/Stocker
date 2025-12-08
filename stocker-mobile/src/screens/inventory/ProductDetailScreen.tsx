import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useInventoryStore, Product } from '../../stores/inventoryStore';
import { spacing } from '../../theme/theme';

export default function ProductDetailScreen({ navigation, route }: any) {
    const { productId } = route.params;
    const { colors, theme } = useTheme();
    const { fetchProductDetails } = useInventoryStore();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        setLoading(true);
        const data = await fetchProductDetails(productId);
        setProduct(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textPrimary }}>Ürün bulunamadı</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Ürün Detayı</Text>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Image Section */}
                <View style={[styles.imageSection, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                    {product.imageUrl ? (
                        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="contain" />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="image-outline" size={64} color="#ccc" />
                        </View>
                    )}
                </View>

                {/* Info Section */}
                <View style={[styles.section, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.productName, { color: colors.textPrimary }]}>{product.name}</Text>
                    <Text style={[styles.productCode, { color: colors.textSecondary }]}>{product.code}</Text>
                    {product.barcode && (
                        <View style={styles.barcodeContainer}>
                            <Ionicons name="barcode-outline" size={16} color={colors.textSecondary} />
                            <Text style={[styles.barcode, { color: colors.textSecondary }]}>{product.barcode}</Text>
                        </View>
                    )}
                    {product.description && (
                        <Text style={[styles.description, { color: colors.textSecondary }]}>{product.description}</Text>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Satış Fiyatı</Text>
                            <Text style={[styles.value, { color: colors.primary }]}>₺{product.salePrice.toLocaleString('tr-TR')}</Text>
                        </View>
                        <View>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Alış Fiyatı</Text>
                            <Text style={[styles.value, { color: colors.textPrimary }]}>₺{product.purchasePrice.toLocaleString('tr-TR')}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Kategori</Text>
                            <Text style={[styles.value, { color: colors.textPrimary }]}>{product.categoryName || '-'}</Text>
                        </View>
                        <View>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Marka</Text>
                            <Text style={[styles.value, { color: colors.textPrimary }]}>{product.brandName || '-'}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Ürün Tipi</Text>
                            <Text style={[styles.value, { color: colors.textPrimary }]}>{product.productType || '-'}</Text>
                        </View>
                        <View>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Oluşturulma Tarihi</Text>
                            <Text style={[styles.value, { color: colors.textPrimary }]}>
                                {product.createdAt ? new Date(product.createdAt).toLocaleDateString('tr-TR') : '-'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Stock Section */}
                <View style={[styles.section, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Stok Durumu</Text>

                    <View style={styles.stockRow}>
                        <Text style={[styles.stockLabel, { color: colors.textPrimary }]}>Toplam Stok</Text>
                        <Text style={[styles.stockValue, { color: product.currentStock <= product.minStockLevel ? '#ef4444' : '#10b981' }]}>
                            {product.currentStock} {product.unitName}
                        </Text>
                    </View>

                    <View style={styles.stockRow}>
                        <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Min. Stok Seviyesi</Text>
                        <Text style={[styles.stockValue, { color: colors.textSecondary }]}>{product.minStockLevel} {product.unitName}</Text>
                    </View>

                    <View style={styles.stockRow}>
                        <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Maks. Stok Seviyesi</Text>
                        <Text style={[styles.stockValue, { color: colors.textSecondary }]}>{product.maxStockLevel || '-'} {product.unitName}</Text>
                    </View>

                    <View style={styles.stockRow}>
                        <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Sipariş Tetikleme</Text>
                        <Text style={[styles.stockValue, { color: colors.textSecondary }]}>{product.reorderLevel || '-'} {product.unitName}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={styles.badge}>
                            <Ionicons name={product.trackSerialNumbers ? "checkmark-circle" : "close-circle"} size={16} color={product.trackSerialNumbers ? "#10b981" : "#ef4444"} />
                            <Text style={[styles.badgeText, { color: colors.textPrimary }]}>Seri No Takibi</Text>
                        </View>
                        <View style={styles.badge}>
                            <Ionicons name={product.trackLotNumbers ? "checkmark-circle" : "close-circle"} size={16} color={product.trackLotNumbers ? "#10b981" : "#ef4444"} />
                            <Text style={[styles.badgeText, { color: colors.textPrimary }]}>Lot Takibi</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: spacing.l,
    },
    imageSection: {
        height: 200,
        borderRadius: 16,
        marginBottom: spacing.l,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    section: {
        padding: spacing.l,
        borderRadius: 16,
        marginBottom: spacing.l,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productCode: {
        fontSize: 14,
        marginBottom: spacing.m,
    },
    barcodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.s,
        gap: 4,
    },
    barcode: {
        fontSize: 14,
    },
    description: {
        fontSize: 14,
        marginBottom: spacing.m,
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: spacing.m,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.m,
    },
    stockRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    stockLabel: {
        fontSize: 16,
    },
    stockValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
