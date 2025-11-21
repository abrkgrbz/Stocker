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

export default function DealListScreen({ navigation }: any) {
    const [deals, setDeals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');

    const loadDeals = async () => {
        try {
            const response = await apiService.crm.getDeals();
            if (response.data && response.data.success) {
                // Filter locally for now as the API might not support search yet
                let items = response.data.data || [];
                if (searchText) {
                    const lowerSearch = searchText.toLowerCase();
                    items = items.filter((d: any) =>
                        d.title?.toLowerCase().includes(lowerSearch) ||
                        d.customerName?.toLowerCase().includes(lowerSearch)
                    );
                }
                setDeals(items);
            }
        } catch (error) {
            console.error('Failed to load deals:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadDeals();
    }, [searchText]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadDeals();
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

    const renderItem = ({ item, index }: any) => (
        <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('DealDetail', { id: item.id, title: item.title })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="briefcase" size={24} color={colors.primary} />
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

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Fırsatlar</Text>
                    <TouchableOpacity style={styles.addButton}>
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Fırsat ara..."
                        placeholderTextColor={colors.textMuted}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                {/* List */}
                <FlatList
                    data={deals}
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
