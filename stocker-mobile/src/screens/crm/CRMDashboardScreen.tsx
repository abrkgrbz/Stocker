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
import { colors, spacing, typography } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function CRMDashboardScreen({ navigation }: any) {
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);

    const loadData = async () => {
        try {
            // In a real app, we would fetch specific CRM stats
            // For now, we'll fetch tenant dashboard stats as a proxy
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

    const StatCard = ({ title, value, icon, color, delay }: any) => (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(600)}
            style={[styles.statCard, { borderLeftColor: color }]}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#7c3aed', '#4c1d95']}
                style={styles.headerBackground}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>CRM</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                    }
                >
                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <StatCard
                            title="Müşteriler"
                            value={stats?.totalCustomers || 0}
                            icon="people"
                            color={colors.primary}
                            delay={100}
                        />
                        <StatCard
                            title="Fırsatlar"
                            value={stats?.activeDeals || 0}
                            icon="trophy"
                            color={colors.warning}
                            delay={200}
                        />
                        <StatCard
                            title="Bekleyen"
                            value={stats?.pendingTasks || 0}
                            icon="time"
                            color={colors.error}
                            delay={300}
                        />
                        <StatCard
                            title="Tamamlanan"
                            value={stats?.completedTasks || 0}
                            icon="checkmark-circle"
                            color={colors.success}
                            delay={400}
                        />
                    </View>

                    {/* Quick Actions */}
                    <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('CustomerList')}
                        >
                            <LinearGradient
                                colors={[colors.primary, '#60a5fa']}
                                style={styles.actionGradient}
                            >
                                <Ionicons name="people" size={24} color="#fff" />
                                <Text style={styles.actionText}>Müşteriler</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <LinearGradient
                                colors={[colors.success, '#4ade80']}
                                style={styles.actionGradient}
                            >
                                <Ionicons name="add-circle" size={24} color="#fff" />
                                <Text style={styles.actionText}>Yeni Müşteri</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <LinearGradient
                                colors={[colors.warning, '#fbbf24']}
                                style={styles.actionGradient}
                            >
                                <Ionicons name="trophy" size={24} color="#fff" />
                                <Text style={styles.actionText}>Fırsatlar</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Recent Activities */}
                    <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
                    <View style={styles.activitiesList}>
                        {isLoading ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => (
                                <Animated.View
                                    key={activity.id}
                                    entering={FadeInDown.delay(500 + (index * 100)).duration(500)}
                                    style={styles.activityItem}
                                >
                                    <View style={[styles.activityIcon, { backgroundColor: colors.surfaceLight }]}>
                                        <Ionicons
                                            name={
                                                activity.type === 'Call' ? 'call' :
                                                    activity.type === 'Email' ? 'mail' :
                                                        activity.type === 'Meeting' ? 'people' : 'document-text'
                                            }
                                            size={16}
                                            color={colors.textSecondary}
                                        />
                                    </View>
                                    <View style={styles.activityContent}>
                                        <Text style={styles.activityTitle}>{activity.title}</Text>
                                        <Text style={styles.activityDate}>
                                            {new Date(activity.createdAt).toLocaleDateString('tr-TR')}
                                        </Text>
                                    </View>
                                </Animated.View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Henüz aktivite bulunmuyor.</Text>
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
        backgroundColor: colors.background,
    } as ViewStyle,
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
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
    content: {
        padding: spacing.l,
    } as ViewStyle,
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.m,
        marginBottom: spacing.xl,
    } as ViewStyle,
    statCard: {
        width: (width - (spacing.l * 2) - spacing.m) / 2,
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: 16,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
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
        color: colors.textPrimary,
    } as TextStyle,
    statTitle: {
        fontSize: 12,
        color: colors.textSecondary,
    } as TextStyle,
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.m,
    } as TextStyle,
    actionsContainer: {
        marginBottom: spacing.xl,
    } as ViewStyle,
    actionButton: {
        marginRight: spacing.m,
        width: 120,
        height: 100,
        borderRadius: 16,
        overflow: 'hidden',
    } as ViewStyle,
    actionGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.m,
    } as ViewStyle,
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: spacing.s,
    } as TextStyle,
    activitiesList: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.m,
    } as ViewStyle,
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
    } as ViewStyle,
    activityIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    } as ViewStyle,
    activityContent: {
        flex: 1,
    } as ViewStyle,
    activityTitle: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '500',
    } as TextStyle,
    activityDate: {
        fontSize: 12,
        color: colors.textSecondary,
    } as TextStyle,
    emptyText: {
        textAlign: 'center',
        color: colors.textSecondary,
        padding: spacing.m,
    } as TextStyle,
});
