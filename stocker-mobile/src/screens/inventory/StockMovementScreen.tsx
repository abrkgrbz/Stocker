import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useInventoryStore, StockMovement } from '../../stores/inventoryStore';
import { spacing } from '../../theme/theme';

export default function StockMovementScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const { stockMovements, isLoading, fetchStockMovements } = useInventoryStore();
    const [filterText, setFilterText] = useState('');

    const handleScan = () => {
        navigation.navigate('BarcodeScanner', {
            onScan: (data: string) => {
                setFilterText(data);
            }
        });
    };

    useEffect(() => {
        fetchStockMovements();
    }, []);

    const getMovementIcon = (type: string) => {
        switch (type) {
            case 'IN': return 'arrow-down-circle';
            case 'OUT': return 'arrow-up-circle';
            case 'TRANSFER': return 'swap-horizontal';
            case 'ADJUSTMENT': return 'build';
            default: return 'ellipse';
        }
    };

    const getMovementColor = (type: string) => {
        switch (type) {
            case 'IN': return '#10b981';
            case 'OUT': return '#ef4444';
            case 'TRANSFER': return '#3b82f6';
            case 'ADJUSTMENT': return '#f59e0b';
            default: return '#9ca3af';
        }
    };

    const renderItem = ({ item }: { item: StockMovement }) => (
        <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
            <View style={styles.iconContainer}>
                <Ionicons
                    name={getMovementIcon(item.type)}
                    size={24}
                    color={getMovementColor(item.type)}
                />
            </View>
            <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                    <Text style={[styles.productName, { color: colors.textPrimary }]}>{item.productName}</Text>
                    <Text style={[styles.date, { color: colors.textSecondary }]}>
                        {new Date(item.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <Text style={[styles.warehouse, { color: colors.textSecondary }]}>{item.warehouseName}</Text>
                <View style={styles.footerRow}>
                    <Text style={[styles.type, { color: getMovementColor(item.type) }]}>{item.type}</Text>
                    <Text style={[styles.quantity, { color: colors.textPrimary }]}>
                        {item.type === 'OUT' ? '-' : '+'}{item.quantity}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Ionicons
                    name="arrow-back"
                    size={24}
                    color={colors.textPrimary}
                    onPress={() => navigation.goBack()}
                />
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Stok Hareketleri</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={{ paddingHorizontal: spacing.m, paddingBottom: spacing.s }}>
                <View style={[styles.searchContainer, { backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder="Ürün veya depo ara..."
                        placeholderTextColor={colors.textSecondary}
                        value={filterText}
                        onChangeText={setFilterText}
                    />
                    {filterText.length > 0 ? (
                        <TouchableOpacity onPress={() => setFilterText('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={handleScan}>
                            <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isLoading && stockMovements.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={stockMovements}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={{ color: colors.textSecondary }}>Hareket bulunamadı</Text>
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
        justifyContent: 'space-between',
        padding: spacing.m,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContent: {
        padding: spacing.m,
    },
    card: {
        flexDirection: 'row',
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.s,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    iconContainer: {
        marginRight: spacing.m,
        justifyContent: 'center',
    },
    cardContent: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
    },
    warehouse: {
        fontSize: 14,
        marginBottom: 8,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    type: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    searchContainer: {
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
});
