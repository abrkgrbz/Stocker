import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useInventoryStore, Product } from '../../stores/inventoryStore';
import { spacing } from '../../theme/theme';

export default function ProductListScreen({ navigation, route }: any) {
    const { colors, theme } = useTheme();
    const { products, isLoading, fetchProducts } = useInventoryStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    const filterType = route.params?.filter; // 'lowStock', 'expiring', etc.

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        let result = products;

        if (filterType === 'lowStock') {
            result = result.filter(p => p.currentStock <= p.minStockLevel);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.code.toLowerCase().includes(query)
            );
        }

        setFilteredProducts(result);
    }, [products, searchQuery, filterType]);

    const renderItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        >
            <View style={styles.imageContainer}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.image} />
                ) : (
                    <View style={[styles.placeholderImage, { backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' }]}>
                        <Ionicons name="image-outline" size={24} color="#999" />
                    </View>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.productCode, { color: colors.textSecondary }]}>{item.code}</Text>
                <View style={styles.stockInfo}>
                    <Text style={[
                        styles.stockText,
                        { color: item.currentStock <= item.minStockLevel ? '#ef4444' : colors.textSecondary }
                    ]}>
                        Stok: {item.currentStock} {item.unitName}
                    </Text>
                    <Text style={[styles.priceText, { color: colors.primary }]}>₺{item.salePrice.toLocaleString('tr-TR')}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={[styles.searchContainer, { backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder="Ürün Ara..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isLoading && products.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={{ color: colors.textSecondary }}>Ürün bulunamadı</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
        gap: spacing.m,
    },
    backButton: {
        padding: 4,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        height: 40,
        borderRadius: 20,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.s,
        fontSize: 16,
    },
    listContent: {
        padding: spacing.l,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.m,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    imageContainer: {
        marginRight: spacing.m,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    placeholderImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    productCode: {
        fontSize: 12,
        marginBottom: 4,
    },
    stockInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: spacing.s,
    },
    stockText: {
        fontSize: 14,
        fontWeight: '500',
    },
    priceText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
});
