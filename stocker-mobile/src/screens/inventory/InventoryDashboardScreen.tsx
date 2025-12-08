import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useInventoryStore } from '../../stores/inventoryStore';
import { spacing } from '../../theme/theme';
import { DashboardWidget } from '../../components/DashboardWidget';

export default function InventoryDashboardScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const { stats, isLoading, fetchDashboardData } = useInventoryStore();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = React.useCallback(() => {
        fetchDashboardData();
    }, []);

    const StatCard = ({ title, value, icon, color, onPress }: any) => (
        <TouchableOpacity
            style={[styles.statCard, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.statInfo}>
                <Text style={[styles.statValue, { color: theme === 'dark' ? '#fff' : '#000' }]}>{value}</Text>
                <Text style={[styles.statTitle, { color: theme === 'dark' ? '#aaa' : '#666' }]}>{title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#555' : '#ccc'} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Stok Yönetimi</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Hızlı İşlemler</Text>
                    <View style={styles.actionGrid}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate('ProductList')}
                        >
                            <Ionicons name="cube-outline" size={24} color="#fff" />
                            <Text style={styles.actionText}>Ürünler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                            onPress={() => navigation.navigate('ProductList', { filter: 'lowStock' })}
                        >
                            <Ionicons name="alert-circle-outline" size={24} color="#fff" />
                            <Text style={styles.actionText}>Kritik Stok</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                            onPress={() => navigation.navigate('StockMovements')}
                        >
                            <Ionicons name="swap-horizontal-outline" size={24} color="#fff" />
                            <Text style={styles.actionText}>Hareketler</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Genel Durum</Text>
                    <StatCard
                        title="Toplam Ürün"
                        value={stats?.totalProducts || 0}
                        icon="cube"
                        color="#3b82f6"
                        onPress={() => navigation.navigate('ProductList')}
                    />
                    <StatCard
                        title="Düşük Stoklu Ürünler"
                        value={stats?.lowStockCount || 0}
                        icon="warning"
                        color="#ef4444"
                        onPress={() => navigation.navigate('ProductList', { filter: 'lowStock' })}
                    />
                    <StatCard
                        title="SKT Yaklaşanlar"
                        value={stats?.expiringCount || 0}
                        icon="hourglass"
                        color="#f59e0b"
                        onPress={() => navigation.navigate('ProductList', { filter: 'expiring' })}
                    />
                    <StatCard
                        title="Toplam Depo"
                        value={stats?.totalWarehouses || 0}
                        icon="business"
                        color="#8b5cf6"
                        onPress={() => { /* Navigate to Warehouses */ }}
                    />
                </View>
            </ScrollView>
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
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: spacing.l,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.m,
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
        padding: spacing.m,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
    },
    actionText: {
        color: '#fff',
        marginTop: 8,
        fontWeight: '600',
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: 12,
        marginBottom: spacing.s,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    iconContainer: {
        padding: 10,
        borderRadius: 10,
        marginRight: spacing.m,
    },
    statInfo: {
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statTitle: {
        fontSize: 14,
    },
});
