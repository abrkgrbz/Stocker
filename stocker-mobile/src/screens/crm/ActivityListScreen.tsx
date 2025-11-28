import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
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

export default function ActivityListScreen({ navigation }: any) {
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filterType, setFilterType] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadActivities = async (pageNum: number, type: string | null, shouldRefresh = false) => {
        try {
            const response = await apiService.crm.getActivities({
                pageNumber: pageNum,
                pageSize: 20,
                type: type || undefined
            });

            if (response.data && response.data.success) {
                const newItems = response.data.data.items || [];
                if (shouldRefresh) {
                    setActivities(newItems);
                } else {
                    setActivities(prev => [...prev, ...newItems]);
                }
                setHasMore(newItems.length >= 20);
            }
        } catch (error) {
            console.error('Failed to load activities:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadActivities(1, filterType, true);
    }, [filterType]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setPage(1);
        loadActivities(1, filterType, true);
    };

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadActivities(nextPage, filterType);
        }
    };

    const FilterTab = ({ label, type, icon }: any) => (
        <TouchableOpacity
            style={[
                styles.filterTab,
                filterType === type && styles.filterTabActive
            ]}
            onPress={() => setFilterType(type === filterType ? null : type)}
        >
            <Ionicons
                name={icon}
                size={16}
                color={filterType === type ? '#fff' : colors.textSecondary}
                style={{ marginRight: 4 }}
            />
            <Text style={[
                styles.filterText,
                filterType === type && styles.filterTextActive
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item, index }: any) => (
        <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
            <View style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceLight }]}>
                    <Ionicons
                        name={
                            item.type === 'Call' ? 'call' :
                                item.type === 'Email' ? 'mail' :
                                    item.type === 'Meeting' ? 'people' : 'document-text'
                        }
                        size={20}
                        color={colors.primary}
                    />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activityDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                    <View style={styles.cardFooter}>
                        <Text style={styles.dateText}>
                            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                        </Text>
                        {item.customerName && (
                            <Text style={styles.customerText}>
                                • {item.customerName}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </Animated.View>
    );

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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Aktiviteler</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Filters */}
                <View style={styles.filterContainer}>
                    <FilterTab label="Aramalar" type="Call" icon="call" />
                    <FilterTab label="E-postalar" type="Email" icon="mail" />
                    <FilterTab label="Toplantılar" type="Meeting" icon="people" />
                    <FilterTab label="Notlar" type="Note" icon="document-text" />
                </View>

                {/* List */}
                <FlatList
                    data={activities}
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
                                <Ionicons name="list-outline" size={64} color={colors.textMuted} />
                                <Text style={styles.emptyText}>Aktivite bulunamadı</Text>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={
                        isLoading && !isRefreshing ? (
                            <ActivityIndicator color={colors.primary} style={{ padding: spacing.m }} />
                        ) : null
                    }
                />
            </SafeAreaView>
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
    filterContainer: {
        flexDirection: 'row',
        padding: spacing.m,
        gap: spacing.s,
    } as ViewStyle,
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.xs,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    } as ViewStyle,
    filterTabActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    } as ViewStyle,
    filterText: {
        fontSize: 12,
        color: colors.textSecondary,
    } as TextStyle,
    filterTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    } as TextStyle,
    listContent: {
        padding: spacing.m,
    } as ViewStyle,
    card: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.m,
        marginBottom: spacing.m,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    } as ViewStyle,
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    } as ViewStyle,
    cardContent: {
        flex: 1,
    } as ViewStyle,
    activityTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 2,
    } as TextStyle,
    activityDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.s,
    } as TextStyle,
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,
    dateText: {
        fontSize: 12,
        color: colors.textMuted,
    } as TextStyle,
    customerText: {
        fontSize: 12,
        color: colors.textMuted,
        marginLeft: spacing.s,
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
