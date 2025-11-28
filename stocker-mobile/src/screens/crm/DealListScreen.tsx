import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { Loading } from '../../components/Loading';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useDealStore } from '../../stores/dealStore';

export default function DealListScreen({ navigation }: any) {
    const { deals, isLoading, loadDeals, deleteDeals, syncDeals } = useDealStore();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Selection Mode State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        loadDeals();
    }, []);

    // Filter deals locally based on search text
    const filteredDeals = deals.filter(d =>
        d.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        d.customerName?.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await syncDeals();
        setIsRefreshing(false);
        // Exit selection mode on refresh
        setIsSelectionMode(false);
        setSelectedIds([]);
    };

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            const newSelected = selectedIds.filter(item => item !== id);
            setSelectedIds(newSelected);
            if (newSelected.length === 0) {
                setIsSelectionMode(false);
            }
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleLongPress = (id: string) => {
        setIsSelectionMode(true);
        toggleSelection(id);
    };

    const handlePress = (item: any) => {
        if (isSelectionMode) {
            toggleSelection(item.id);
        } else {
            navigation.navigate('DealDetail', { id: item.id, title: item.title });
        }
    };

    const handleBulkDelete = async () => {
        try {
            await deleteDeals(selectedIds);
            setIsSelectionMode(false);
            setSelectedIds([]);
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Won': return colors.success;
            case 'Lost': return colors.error;
            case 'Negotiation': return colors.warning;
            default: return colors.primary;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Won': return 'Kazanıldı';
            case 'Lost': return 'Kaybedildi';
            case 'Negotiation': return 'Görüşülüyor';
            case 'New': return 'Yeni';
            case 'Qualified': return 'Uygun';
            case 'Proposition': return 'Teklif';
            default: return status;
        }
    };

    const renderItem = ({ item, index }: any) => {
        const isSelected = selectedIds.includes(item.id);

        return (
            <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
                <TouchableOpacity
                    style={[
                        styles.card,
                        isSelected && { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primary + '10' }
                    ]}
                    onPress={() => handlePress(item)}
                    onLongPress={() => handleLongPress(item.id)}
                    delayLongPress={300}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.iconContainer}>
                            {isSelected ? (
                                <Ionicons name="checkmark" size={24} color={colors.primary} />
                            ) : (
                                <Ionicons name="briefcase" size={24} color={colors.primary} />
                            )}
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.dealTitle}>{item.title}</Text>
                            <Text style={styles.customerName}>{item.customerName}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.stage) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(item.stage) }]}>
                                {getStatusText(item.stage)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.cardFooter}>
                        <View style={styles.footerItem}>
                            <Ionicons name="cash-outline" size={16} color={colors.success} />
                            <Text style={[styles.footerText, { color: colors.success, fontWeight: 'bold' }]}>
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.value || 0)}
                            </Text>
                        </View>
                        <View style={styles.footerItem}>
                            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.footerText}>
                                {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#28002D', '#1A315A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    {isSelectionMode ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <TouchableOpacity onPress={() => {
                                setIsSelectionMode(false);
                                setSelectedIds([]);
                            }} style={styles.backButton}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={[styles.headerTitle, { marginLeft: 16 }]}>{selectedIds.length} Seçildi</Text>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity onPress={handleBulkDelete} style={[styles.backButton, { backgroundColor: colors.error }]}>
                                <Ionicons name="trash" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Fırsatlar</Text>
                            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddDeal')}>
                                <LinearGradient
                                    colors={colors.gradientGreen as [string, string]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.addButtonGradient}
                                >
                                    <Ionicons name="add" size={24} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Search Bar */}
                {!isSelectionMode && (
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon as TextStyle} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Fırsat ara..."
                            placeholderTextColor={colors.textMuted}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                )}

                {/* List */}
                <FlatList
                    data={filteredDeals}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="briefcase-outline" size={64} color={colors.textMuted} />
                                <Text style={styles.emptyText}>Fırsat bulunamadı</Text>
                            </View>
                        ) : null
                    }
                />
            </SafeAreaView>

            {isLoading && <Loading visible={true} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    } as ViewStyle,
    safeArea: {
        flex: 1,
    } as ViewStyle,
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
    } as ViewStyle,
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    } as ViewStyle,
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    } as TextStyle,
    addButton: {
        borderRadius: 12,
        overflow: 'hidden',
    } as ViewStyle,
    addButtonGradient: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        margin: spacing.m,
        paddingHorizontal: spacing.m,
        borderRadius: 12,
        height: 48,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    } as ViewStyle,
    searchIcon: {
        marginRight: spacing.s,
    } as ViewStyle,
    searchInput: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 16,
    } as TextStyle,
    listContent: {
        padding: spacing.m,
        paddingTop: 0,
    } as ViewStyle,
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.m,
        marginBottom: spacing.m,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    } as ViewStyle,
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.m,
    } as ViewStyle,
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    } as ViewStyle,
    cardInfo: {
        flex: 1,
    } as ViewStyle,
    dealTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 2,
    } as TextStyle,
    customerName: {
        fontSize: 14,
        color: colors.textSecondary,
    } as TextStyle,
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    } as ViewStyle,
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    } as TextStyle,
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: colors.surfaceLight,
        paddingTop: spacing.s,
    } as ViewStyle,
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    } as ViewStyle,
    footerText: {
        fontSize: 14,
        color: colors.textSecondary,
    } as TextStyle,
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        marginTop: spacing.xl,
    } as ViewStyle,
    emptyText: {
        marginTop: spacing.m,
        color: colors.textMuted,
        fontSize: 16,
    } as TextStyle,
});
