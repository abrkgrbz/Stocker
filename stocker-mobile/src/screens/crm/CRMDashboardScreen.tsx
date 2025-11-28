import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ViewStyle,
    TextStyle,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { StandardCard } from '../../components/StandardCard';

const { width } = Dimensions.get('window');

export default function CRMDashboardScreen({ navigation }: any) {
    const { colors, theme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);

    const loadData = async () => {
        try {
            const [statsRes, activitiesRes] = await Promise.all([
                apiService.tenant.getDashboardStats(),
                apiService.crm.getActivities({ pageSize: 5 })
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }

            if (activitiesRes.data.success) {
                setRecentActivities(activitiesRes.data.data.items || []);
            }
        } catch (error) {
            console.error('Failed to load CRM data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={theme === 'dark' ? ['#28002D', '#1A315A'] : ['#f0f9ff', '#e0f2fe']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? "#fff" : colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme === 'dark' ? "#fff" : colors.textPrimary }]}>CRM</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                >
                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <StatCard
                            title="Müşteriler"
                            value={stats?.totalCustomers?.toString() || "0"}
                            icon="people"
                            color={colors.primary}
                            onPress={() => navigation.navigate('CustomerList')}
                            theme={theme}
                            colors={colors}
                        />
                        <StatCard
                            title="Fırsatlar"
                            value={stats?.activeDeals?.toString() || "0"}
                            icon="trophy"
                            color={colors.warning}
                            onPress={() => navigation.navigate('DealList')}
                            theme={theme}
                            colors={colors}
                        />
                        <StatCard
                            title="Bekleyen"
                            value={stats?.pendingTasks?.toString() || "0"}
                            icon="time"
                            color={colors.error}
                            onPress={() => navigation.navigate('ActivityList', { type: 'Task' })}
                            theme={theme}
                            colors={colors}
                        />
                        <StatCard
                            title="Tamamlanan"
                            value={stats?.completedTasks?.toString() || "0"}
                            icon="checkmark-circle"
                            color={colors.success}
                            onPress={() => navigation.navigate('ActivityList', { type: 'Task' })}
                            theme={theme}
                            colors={colors}
                        />
                    </View>

                    {/* Quick Actions Grid */}
                    <Text style={[styles.sectionTitle, { color: theme === 'dark' ? "#fff" : colors.textPrimary }]}>Hızlı İşlemler</Text>
                    <View style={styles.quickActionsGrid}>
                        <ActionCard
                            title="Yeni Müşteri"
                            icon="person-add"
                            onPress={() => navigation.navigate('AddCustomer')}
                            theme={theme}
                            colors={colors}
                        />
                        <ActionCard
                            title="Yeni Fırsat"
                            icon="briefcase"
                            onPress={() => navigation.navigate('DealList')}
                            theme={theme}
                            colors={colors}
                        />
                    </View>

                    {/* Recent Activities */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme === 'dark' ? "#fff" : colors.textPrimary }]}>Son Aktiviteler</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ActivityList')}>
                            <Text style={[styles.viewAllText, { color: colors.accent }]}>Tümünü Gör</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.activitiesList}>
                        {isLoading ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => (
                                <StandardCard
                                    key={activity.id}
                                    title={activity.title}
                                    subtitle={new Date(activity.createdAt).toLocaleDateString('tr-TR')}
                                    icon={
                                        activity.type === 'Call' ? 'call' :
                                            activity.type === 'Email' ? 'mail' :
                                                activity.type === 'Meeting' ? 'people' : 'document-text'
                                    }
                                    iconColor={colors.accent}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconContainer}>
                                    <Ionicons name="file-tray-outline" size={32} color={colors.textMuted} />
                                </View>
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz aktivite bulunmuyor.</Text>
                                <TouchableOpacity
                                    style={styles.emptyButton}
                                    onPress={() => navigation.navigate('AddCustomer')}
                                >
                                    <Text style={[styles.emptyButtonText, { color: colors.primary }]}>İlk Müşterini Ekle</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
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
    } as ViewStyle,
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    } as ViewStyle,
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    } as TextStyle,
    content: {
        paddingHorizontal: spacing.l,
        paddingBottom: spacing.xl,
    } as ViewStyle,
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: spacing.m,
    } as ViewStyle,
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: spacing.l,
        marginBottom: spacing.m,
    } as TextStyle,
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.l,
        marginBottom: spacing.m,
    } as ViewStyle,
    viewAllText: {
        fontSize: 14,
        fontWeight: 'bold',
    } as TextStyle,
    quickActionsGrid: {
        flexDirection: 'row',
        gap: spacing.m,
    } as ViewStyle,
    activitiesList: {
        minHeight: 100,
    } as ViewStyle,
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        backgroundColor: 'rgba(30, 30, 46, 0.5)',
        borderRadius: 16,
    } as ViewStyle,
    emptyIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
    } as ViewStyle,
    emptyText: {
        textAlign: 'center',
        marginBottom: spacing.m,
    } as TextStyle,
    emptyButton: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
    } as ViewStyle,
    emptyButtonText: {
        fontWeight: 'bold',
        fontSize: 14,
    } as TextStyle,
    statCard: {
        width: '48%',
        padding: spacing.m,
        borderRadius: 16,
        marginBottom: spacing.m,
        borderWidth: 1,
    } as ViewStyle,
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.s,
    } as ViewStyle,
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    } as TextStyle,
    statTitle: {
        fontSize: 14,
    } as TextStyle,
    actionCard: {
        flex: 1,
        padding: spacing.m,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.s,
    } as ViewStyle,
    actionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    } as TextStyle,
});

const StatCard = ({ title, value, icon, color, onPress, theme, colors }: any) => (
    <TouchableOpacity
        style={[
            styles.statCard,
            {
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.surface,
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.surfaceLight,
            }
        ]}
        onPress={onPress}
    >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.statValue, { color: theme === 'dark' ? '#fff' : colors.textPrimary }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
    </TouchableOpacity>
);

const ActionCard = ({ title, icon, onPress, theme, colors }: any) => (
    <TouchableOpacity
        style={[
            styles.actionCard,
            {
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.surface,
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : colors.surfaceLight,
            }
        ]}
        onPress={onPress}
    >
        <View style={[styles.actionIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <Text style={[styles.actionTitle, { color: theme === 'dark' ? '#fff' : colors.textPrimary }]}>{title}</Text>
    </TouchableOpacity>
);
