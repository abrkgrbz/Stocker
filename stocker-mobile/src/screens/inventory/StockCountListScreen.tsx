import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useInventoryStore, StockCount } from '../../stores/inventoryStore';
import { spacing } from '../../theme/theme';

export default function StockCountListScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const { stockCounts, isLoading, fetchStockCounts } = useInventoryStore();
    const [statusFilter, setStatusFilter] = useState<string>('All');

    useEffect(() => {
        fetchStockCounts();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return '#10b981';
            case 'InProgress': return '#3b82f6';
            case 'Draft': return '#9ca3af';
            default: return '#9ca3af';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Completed': return 'Tamamlandı';
            case 'InProgress': return 'Devam Ediyor';
            case 'Draft': return 'Taslak';
            default: return status;
        }
    };

    const filteredCounts = statusFilter === 'All'
        ? stockCounts
        : stockCounts.filter(c => c.status === statusFilter);

    const renderItem = ({ item }: { item: StockCount }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}
            onPress={() => navigation.navigate('StockCountDetail', { countId: item.id })}
        >
            <View style={styles.cardHeader}>
                <Text style={[styles.warehouseName, { color: colors.textPrimary }]}>{item.warehouseName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
                </View>
            </View>

            <Text style={[styles.description, { color: colors.textSecondary }]}>
                {item.description || 'Açıklama yok'}
            </Text>

            <View style={styles.footer}>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                    {new Date(item.countDate).toLocaleDateString('tr-TR')}
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
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Stok Sayımları</Text>
                <TouchableOpacity onPress={() => { /* Create count logic */ }}>
                    <Ionicons name="add-circle" size={28} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabs}>
                {['All', 'InProgress', 'Completed'].map((status) => (
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
                            {status === 'All' ? 'Tümü' : status === 'InProgress' ? 'Devam Eden' : 'Tamamlanan'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading && stockCounts.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredCounts}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={{ color: colors.textSecondary }}>Sayım bulunamadı</Text>
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
        marginBottom: 8,
    },
    warehouseName: {
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
    description: {
        fontSize: 14,
        marginBottom: spacing.m,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 8,
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
