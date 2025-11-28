import React, { useEffect, useState, useCallback } from 'react';
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

import { useCustomerStore } from '../../stores/customerStore';
import { hapticService } from '../../services/haptic';

export default function CustomerListScreen({ navigation }: any) {
    const { customers, isLoading, loadCustomers, deleteCustomers, syncCustomers } = useCustomerStore();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1); // Pagination might need adjustment for local DB

    // Selection Mode State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        loadCustomers(searchText);
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadCustomers(searchText);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText]);

    const handleRefresh = async () => {
        hapticService.medium();
        setIsRefreshing(true);
        await syncCustomers();
        setIsRefreshing(false);
        // Exit selection mode on refresh
        setIsSelectionMode(false);
        setSelectedIds([]);
    };

    const handleLoadMore = () => {
        // Local DB pagination or load all?
        // For now, store loads all. We can implement pagination in store later.
    };

    const toggleSelection = (id: string) => {
        hapticService.selection();
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
        hapticService.light();
        if (isSelectionMode) {
            toggleSelection(item.id);
        } else {
            navigation.navigate('CustomerDetail', { id: item.id, name: item.companyName });
        }
    };

    const handleBulkDelete = async () => {
        try {
            await deleteCustomers(selectedIds);
            setIsSelectionMode(false);
            setSelectedIds([]);
        } catch (error) {
            console.error("Delete failed", error);
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
                        <View style={styles.avatar}>
                            {isSelected ? (
                                <Ionicons name="checkmark" size={24} color={colors.primary} />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {item.companyName.substring(0, 2).toUpperCase()}
                                </Text>
                            )}
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.companyName}>{item.companyName}</Text>
                            <Text style={styles.contactPerson}>{item.contactPerson || 'Yetkili Belirtilmemiş'}</Text>
                        </View>
                        {!isSelectionMode && (
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        )}
                    </View>

                    <View style={styles.cardFooter}>
                        <View style={styles.footerItem}>
                            <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.footerText}>{item.email}</Text>
                        </View>
                        {item.phone && (
                            <View style={styles.footerItem}>
                                <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                                <Text style={styles.footerText}>{item.phone}</Text>
                            </View>
                        )}
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
                            <Text style={styles.headerTitle}>Müşteriler</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => navigation.navigate('AddCustomer')}
                            >
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
                            placeholder="Müşteri ara..."
                            placeholderTextColor={colors.textMuted}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => {
                                setSearchText('');
                                handleRefresh();
                            }}>
                                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* List */}
                <FlatList
                    data={customers}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="people-outline" size={64} color={colors.textMuted} />
                                <Text style={styles.emptyText}>Müşteri bulunamadı</Text>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={
                        isLoading && page > 1 ? (
                            <ActivityIndicator style={{ padding: 20 }} color={colors.primary} />
                        ) : null
                    }
                />
            </SafeAreaView>

            {isLoading && page === 1 && <Loading visible={true} />}
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
        alignItems: 'center',
        marginBottom: spacing.m,
    } as ViewStyle,
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    } as ViewStyle,
    avatarText: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: 'bold',
    } as TextStyle,
    cardInfo: {
        flex: 1,
    } as ViewStyle,
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 2,
    } as TextStyle,
    contactPerson: {
        fontSize: 14,
        color: colors.textSecondary,
    } as TextStyle,
    cardFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.surfaceLight,
        paddingTop: spacing.s,
        gap: spacing.l,
    } as ViewStyle,
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    } as ViewStyle,
    footerText: {
        fontSize: 12,
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
