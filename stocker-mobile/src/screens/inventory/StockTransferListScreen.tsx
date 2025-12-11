import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useInventoryStore, StockTransfer } from '../../stores/inventoryStore';
import { spacing } from '../../theme/theme';

export default function StockTransferListScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const { stockTransfers, isLoading, fetchStockTransfers } = useInventoryStore();
    const [statusFilter, setStatusFilter] = useState<string>('All');

    useEffect(() => {
        fetchStockTransfers();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return '#10b981';
            case 'Pending': return '#f59e0b';
            case 'Rejected': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    const filteredTransfers = statusFilter === 'All'
        ? stockTransfers
        : stockTransfers.filter(t => t.status === statusFilter);

    const renderItem = ({ item }: { item: StockTransfer }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}
            onPress={() => { /* Navigate to detail if needed */ }}
        >
            <View style={styles.cardHeader}>
                <Text style={[styles.reference, { color: colors.textPrimary }]}>{item.reference || `TR-${item.id}`}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.routeContainer}>
                <View style={styles.location}>
                    <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Çıkış</Text>
                    <Text style={[styles.locationName, { color: colors.textPrimary }]}>{item.sourceWarehouseName}</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
                <View style={styles.location}>
                    <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Varış</Text>
                    <Text style={[styles.locationName, { color: colors.textPrimary }]}>{item.destinationWarehouseName}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                    {new Date(item.transferDate).toLocaleDateString('tr-TR')}
                </Text>
                <Text style={[styles.itemCount, { color: colors.textPrimary }]}>
                    {item.items?.length || 0} Kalem
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Stok Transferleri</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CreateStockTransfer')}>
                    <Ionicons name="add-circle" size={28} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabs}>
                {['All', 'Pending', 'Completed'].map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.tab,
                            statusFilter === status && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                        ]}
                        onPress={() => setStatusFilter(status)}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: statusFilter === status ? colors.primary : colors.textSecondary }
                        ]}>
                            {status === 'All' ? 'Tümü' : status === 'Pending' ? 'Bekleyen' : 'Tamamlanan'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading && stockTransfers.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredTransfers}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={{ color: colors.textSecondary }}>Transfer bulunamadı</Text>
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
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: spacing.m,
        marginBottom: spacing.m,
        gap: spacing.s,
    },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: {
        padding: spacing.m,
    },
    card: {
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.m,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    reference: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.m,
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: spacing.s,
        borderRadius: 8,
    },
    location: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 10,
        marginBottom: 2,
    },
    locationName: {
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        fontSize: 12,
    },
    itemCount: {
        fontSize: 12,
        fontWeight: '500',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
});
