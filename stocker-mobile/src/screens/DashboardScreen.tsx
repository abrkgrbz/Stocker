import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/api';
import { colors, spacing, typography } from '../theme/colors';

import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function DashboardScreen() {
    const { user, logout } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            // Only fetch if user is master admin (assuming role check, but for now try fetching)
            // If endpoint fails (e.g. 403), we'll catch it
            const response = await apiService.master.getDashboardStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.log('Error fetching stats:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0a0a0a', '#1a1a1a']}
                style={StyleSheet.absoluteFill}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hoş geldin,</Text>
                        <Text style={styles.username}>{user?.firstName} {user?.lastName}</Text>
                        {user?.tenantName && (
                            <Text style={styles.tenantName}>{user.tenantName}</Text>
                        )}
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                        <Ionicons name="log-out-outline" size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                >
                    {/* Quick Stats */}
                    <Animated.View
                        entering={FadeInDown.delay(200).duration(800).springify()}
                        style={styles.section}
                    >
                        <Text style={styles.sectionTitle}>Genel Durum</Text>
                        <View style={styles.statsContainer}>
                            <LinearGradient
                                colors={['rgba(24, 144, 255, 0.15)', 'rgba(24, 144, 255, 0.05)']}
                                style={styles.statCard}
                            >
                                <View style={styles.statHeader}>
                                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(24, 144, 255, 0.2)' }]}>
                                        <Ionicons name="business" size={20} color={colors.primary} />
                                    </View>
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <Text style={styles.statValue}>{stats?.totalTenants || 0}</Text>
                                    )}
                                </View>
                                <Text style={styles.statLabel}>Aktif Kiracı</Text>
                            </LinearGradient>

                            <LinearGradient
                                colors={['rgba(82, 196, 26, 0.15)', 'rgba(82, 196, 26, 0.05)']}
                                style={styles.statCard}
                            >
                                <View style={styles.statHeader}>
                                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(82, 196, 26, 0.2)' }]}>
                                        <Ionicons name="people" size={20} color={colors.success} />
                                    </View>
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={colors.success} />
                                    ) : (
                                        <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
                                    )}
                                </View>
                                <Text style={styles.statLabel}>Toplam Kullanıcı</Text>
                            </LinearGradient>
                        </View>
                    </Animated.View>

                    {/* Recent Activity */}
                    <Animated.View
                        entering={FadeInDown.delay(400).duration(800).springify()}
                        style={styles.section}
                    >
                        <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
                        <View style={styles.card}>
                            <View style={styles.activityItem}>
                                <View style={[styles.activityIcon, { backgroundColor: 'rgba(0, 255, 136, 0.1)' }]}>
                                    <Ionicons name="add" size={18} color={colors.accent} />
                                </View>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityTitle}>Yeni kiracı kaydı: TechSoft</Text>
                                    <Text style={styles.activityTime}>15 dakika önce</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.activityItem}>
                                <View style={[styles.activityIcon, { backgroundColor: 'rgba(250, 173, 20, 0.1)' }]}>
                                    <Ionicons name="alert" size={18} color={colors.warning} />
                                </View>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityTitle}>Sistem bakımı planlandı</Text>
                                    <Text style={styles.activityTime}>2 saat önce</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Quick Actions */}
                    <Animated.View
                        entering={FadeInDown.delay(600).duration(800).springify()}
                        style={styles.section}
                    >
                        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
                        <View style={styles.actionGrid}>
                            <TouchableOpacity style={styles.actionButton}>
                                <LinearGradient
                                    colors={[colors.surface, colors.surface]}
                                    style={styles.actionGradient}
                                >
                                    <Ionicons name="business-outline" size={24} color={colors.primary} />
                                    <Text style={styles.actionText}>Kiracılar</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <LinearGradient
                                    colors={[colors.surface, colors.surface]}
                                    style={styles.actionGradient}
                                >
                                    <Ionicons name="people-outline" size={24} color={colors.success} />
                                    <Text style={styles.actionText}>Kullanıcılar</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <LinearGradient
                                    colors={[colors.surface, colors.surface]}
                                    style={styles.actionGradient}
                                >
                                    <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
                                    <Text style={styles.actionText}>Ayarlar</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
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
    safeArea: {
        flex: 1,
    } as ViewStyle,
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.l,
        paddingBottom: spacing.xl,
    } as ViewStyle,
    greeting: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 4,
    } as TextStyle,
    username: {
        color: colors.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
    } as TextStyle,
    tenantName: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    } as TextStyle,
    logoutButton: {
        padding: spacing.s,
        backgroundColor: 'rgba(255, 77, 79, 0.1)',
        borderRadius: 12,
    } as ViewStyle,
    content: {
        padding: spacing.l,
        paddingTop: 0,
    } as ViewStyle,
    section: {
        marginBottom: spacing.xl,
    } as ViewStyle,
    sectionTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.m,
        fontSize: 18,
    } as TextStyle,
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.m,
    } as ViewStyle,
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: spacing.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    } as ViewStyle,
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.m,
    } as ViewStyle,
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    statValue: {
        color: colors.textPrimary,
        fontSize: 28,
        fontWeight: 'bold',
    } as TextStyle,
    statLabel: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '500',
    } as TextStyle,
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.m,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    } as ViewStyle,
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.s,
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
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    } as TextStyle,
    activityTime: {
        color: colors.textSecondary,
        fontSize: 12,
    } as TextStyle,
    divider: {
        height: 1,
        backgroundColor: colors.surfaceLight,
        marginVertical: spacing.s,
    } as ViewStyle,
    actionGrid: {
        flexDirection: 'row',
        gap: spacing.m,
    } as ViewStyle,
    actionButton: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
    } as ViewStyle,
    actionGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.surfaceLight,
        borderRadius: 16,
    } as ViewStyle,
    actionText: {
        color: colors.textPrimary,
        marginTop: spacing.s,
        fontSize: 12,
        fontWeight: '500',
    } as TextStyle,
});
