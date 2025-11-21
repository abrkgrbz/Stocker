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

export default function CustomerListScreen({ navigation }: any) {
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const loadCustomers = async (pageNumber: number, search: string = '', refresh: boolean = false) => {
        try {
            if (pageNumber === 1) setIsLoading(true);

            const response = await apiService.crm.getCustomers({
                pageNumber,
                pageSize: 10,
                search
            });

            if (response.data.success) {
                const { items, totalCount: total } = response.data.data;

                if (refresh) {
                    setCustomers(items);
                } else {
                    setCustomers(prev => [...prev, ...items]);
                }

                setTotalCount(total);
                setHasMore(items.length === 10); // Assuming page size is 10
            }
        } catch (error) {
            console.error('Failed to load customers:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadCustomers(1, searchText, true);
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchText !== '') {
                setPage(1);
                loadCustomers(1, searchText, true);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setPage(1);
        loadCustomers(1, searchText, true);
    };

    const handleLoadMore = () => {
        if (!hasMore || isLoading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        loadCustomers(nextPage, searchText);
    };

    const renderItem = ({ item, index }: any) => (
        <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('CustomerDetail', { id: item.id, name: item.companyName })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item.companyName.substring(0, 2).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.companyName}>{item.companyName}</Text>
                        <Text style={styles.contactPerson}>{item.contactPerson || 'Yetkili Belirtilmemiş'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Müşteriler</Text>
                    <TouchableOpacity style={styles.addButton}>
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
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
        backgroundColor: colors.background,
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
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
    } as ViewStyle,
    backButton: {
        padding: 4,
    } as ViewStyle,
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    } as TextStyle,
    addButton: {
        padding: 4,
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
