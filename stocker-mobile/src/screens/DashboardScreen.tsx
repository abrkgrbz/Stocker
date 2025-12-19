import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Modal,
    TouchableWithoutFeedback,
    Alert,
    ViewStyle,
    TextStyle,
    ImageStyle,
    Switch,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { biometricService } from '../services/biometric';
import { hapticService } from '../services/haptic';
import { notificationService } from '../services/notification/NotificationService';
import { useAlert } from '../context/AlertContext';
import { DashboardWidget } from '../components/DashboardWidget';
import { useDashboardStore } from '../stores/dashboardStore';
import { Card } from '../../components/ui/Card';
import { DotBackground } from '../../components/ui/DotBackground';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface ModuleCard {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    path: string;
    description: string;
    badge?: string;
    disabled?: boolean;
}

export default function DashboardScreen({ navigation }: any) {
    const { user, logout, biometricEnabled, setBiometricEnabled } = useAuthStore();
    const { colors, theme, toggleTheme, setTheme, themePreference } = useTheme();
    const [userMenuVisible, setUserMenuVisible] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

    const { salesStats, crmStats, isLoading, fetchDashboardData } = useDashboardStore();
    const [refreshing, setRefreshing] = useState(false);

    React.useEffect(() => {
        checkBiometric();
        fetchDashboardData();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        hapticService.medium();
        await fetchDashboardData();
        setRefreshing(false);
    }, []);

    const checkBiometric = async () => {
        const status = await biometricService.checkAvailability();
        setIsBiometricAvailable(status.available);
    };

    const modules: ModuleCard[] = [
        {
            id: 'crm',
            title: 'CRM',
            icon: 'people',
            color: '#7c3aed',
            path: 'CRMDashboard',
            description: 'Müşteri ilişkileri',
            badge: 'Aktif',
        },
        {
            id: 'dashboards',
            title: 'Raporlar',
            icon: 'stats-chart',
            color: '#c026d3',
            path: 'DashboardDetail',
            description: 'Analiz ve raporlar',
        },
        {
            id: 'sales',
            title: 'Satış',
            icon: 'cart',
            color: '#10b981',
            path: 'SalesDashboard',
            description: 'Sipariş yönetimi',
            badge: 'Yeni',
        },
        {
            id: 'apps',
            title: 'Uygulamalar',
            icon: 'apps',
            color: '#0891b2',
            path: 'Modules',
            description: 'Modül yönetimi',
        },
        {
            id: 'settings',
            title: 'Ayarlar',
            icon: 'settings',
            color: '#64748b',
            path: 'Settings',
            description: 'Sistem ayarları',
        },
        {
            id: 'messaging',
            title: 'Mesajlar',
            icon: 'chatbubbles',
            color: '#e879f9',
            path: 'Messaging',
            description: 'İletişim',
            badge: 'Yakında',
            disabled: true,
        },
        {
            id: 'calendar',
            title: 'Takvim',
            icon: 'calendar',
            color: '#a78bfa',
            path: 'Calendar',
            description: 'Takvim',
            badge: 'Yakında',
            disabled: true,
        },
        {
            id: 'inventory',
            title: 'Stok',
            icon: 'cube',
            color: '#34d399',
            path: 'Inventory',
            description: 'Envanter',
            badge: 'Yeni',
        },
    ];

    const handleModuleClick = (module: ModuleCard) => {
        hapticService.selection();
        if (module.disabled) return;

        if (module.id === 'crm') {
            navigation.navigate('CRMDashboard');
            return;
        }

        if (module.id === 'sales') {
            navigation.navigate('SalesDashboard');
            return;
        }

        if (module.id === 'inventory') {
            navigation.navigate('InventoryDashboard');
            return;
        }

        if (module.id === 'hr') {
            navigation.navigate('HRDashboard');
            return;
        }

        if (module.id === 'settings') {
            navigation.navigate('Settings');
            return;
        }

        showAlert({
            title: "Yakında",
            message: `${module.title} modülü henüz mobil uygulamada aktif değil.`,
            type: 'info',
            buttons: [{ text: "Tamam" }]
        });
    };

    const { showAlert } = useAlert();

    const handleLogout = () => {
        hapticService.warning();
        setUserMenuVisible(false);
        showAlert({
            title: 'Çıkış Yap',
            message: 'Çıkış yapmak istediğinize emin misiniz?',
            type: 'warning',
            buttons: [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Logout failed:', error);
                        }
                    }
                }
            ]
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Background Pattern */}
            <View style={StyleSheet.absoluteFill}>
                <DotBackground />
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', colors.background]}
                    locations={[0, 0.6, 1]}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <View>
                        <Text style={[styles.tenantName, { color: colors.textPrimary }]}>
                            {user?.tenantName || 'Stocker'}
                        </Text>
                        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                            Hoş Geldiniz, {user?.firstName}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.userBadge, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                        onPress={() => setUserMenuVisible(true)}
                    >
                        <Ionicons name="person" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {/* Widgets Section */}
                    <View style={styles.gridContainer}>
                        <DashboardWidget
                            title="Günlük Satış"
                            value={salesStats ? `₺${salesStats.dailyTotal.toLocaleString('tr-TR')}` : '₺0'}
                            subtitle="Bugün"
                            icon="cash-outline"
                            color="#10b981"
                            trend={salesStats ? { value: salesStats.dailyTrend, direction: salesStats.dailyTrend >= 0 ? 'up' : 'down' } : undefined}
                            onPress={() => navigation.navigate('SalesDashboard')}
                            delay={200}
                        />
                        <DashboardWidget
                            title="Yeni Müşteri"
                            value={crmStats ? crmStats.newCustomers.toString() : '0'}
                            subtitle="Bu hafta"
                            icon="person-add-outline"
                            color="#3b82f6"
                            trend={crmStats ? { value: crmStats.customerTrend, direction: crmStats.customerTrend >= 0 ? 'up' : 'down' } : undefined}
                            onPress={() => navigation.navigate('CRMDashboard')}
                            delay={300}
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Modüller</Text>

                    {/* Modules Grid */}
                    <View style={styles.gridContainer}>
                        {modules.map((module, index) => (
                            <Animated.View
                                key={module.id}
                                entering={FadeInDown.delay(200 + (index * 50)).duration(600)}
                                style={styles.gridItemWrapper}
                            >
                                <Card
                                    style={[
                                        styles.moduleCard,
                                        module.disabled && styles.moduleCardDisabled
                                    ]}
                                    // @ts-ignore
                                    onTouchEnd={() => handleModuleClick(module)}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <View style={[styles.iconContainer, { backgroundColor: module.color + '20' }]}>
                                            <Ionicons
                                                name={module.icon}
                                                size={24}
                                                color={module.color}
                                            />
                                        </View>
                                        {module.badge && (
                                            <View style={[
                                                styles.badge,
                                                module.disabled ? styles.badgeWarning : { backgroundColor: colors.primary }
                                            ]}>
                                                <Text style={styles.badgeText}>{module.badge}</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text style={[
                                        styles.moduleTitle,
                                        { color: colors.textPrimary },
                                        module.disabled && styles.textDisabled
                                    ]}>{module.title}</Text>

                                    <Text style={[
                                        styles.moduleDescription,
                                        { color: colors.textSecondary },
                                        module.disabled && styles.textDisabled
                                    ]} numberOfLines={2}>
                                        {module.description}
                                    </Text>
                                </Card>
                            </Animated.View>
                        ))}
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Stocker v1.0.0
                        </Text>
                    </View>
                </ScrollView>

                {/* User Menu Modal */}
                <Modal
                    visible={userMenuVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setUserMenuVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setUserMenuVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
                                    <View style={styles.menuHeader}>
                                        <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Ayarlar</Text>
                                    </View>

                                    <View style={styles.menuItemRow}>
                                        <View style={styles.menuItemLeft}>
                                            <Ionicons name={theme === 'dark' ? "moon" : "sunny"} size={20} color={colors.textPrimary} />
                                            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Karanlık Mod</Text>
                                        </View>
                                        <Switch
                                            value={theme === 'dark'}
                                            onValueChange={() => {
                                                hapticService.selection();
                                                toggleTheme();
                                            }}
                                            trackColor={{ false: "#767577", true: colors.primary }}
                                            thumbColor={theme === 'dark' ? "#fff" : "#f4f3f4"}
                                        />
                                    </View>

                                    <View style={styles.menuItemRow}>
                                        <View style={styles.menuItemLeft}>
                                            <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
                                            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Sistem Teması</Text>
                                        </View>
                                        <Switch
                                            value={themePreference === 'system'}
                                            onValueChange={(val) => {
                                                hapticService.selection();
                                                setTheme(val ? 'system' : theme);
                                            }}
                                            trackColor={{ false: "#767577", true: colors.primary }}
                                            thumbColor={themePreference === 'system' ? "#fff" : "#f4f3f4"}
                                        />
                                    </View>

                                    {isBiometricAvailable && (
                                        <View style={styles.menuItemRow}>
                                            <View style={styles.menuItemLeft}>
                                                <Ionicons name="finger-print-outline" size={20} color={colors.textPrimary} />
                                                <Text style={[styles.menuText, { color: colors.textPrimary }]}>Biyometrik Giriş</Text>
                                            </View>
                                            <Switch
                                                value={biometricEnabled}
                                                onValueChange={(val) => {
                                                    hapticService.selection();
                                                    setBiometricEnabled(val);
                                                }}
                                                trackColor={{ false: "#767577", true: colors.primary }}
                                                thumbColor={biometricEnabled ? "#fff" : "#f4f3f4"}
                                            />
                                        </View>
                                    )}

                                    <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

                                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                                        setUserMenuVisible(false);
                                        navigation.navigate('Profile');
                                    }}>
                                        <Ionicons name="person-outline" size={20} color={colors.textPrimary} />
                                        <Text style={[styles.menuText, { color: colors.textPrimary }]}>Profil</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                                        <Ionicons name="log-out-outline" size={20} color={colors.error} />
                                        <Text style={[styles.menuText, { color: colors.error }]}>Çıkış Yap</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.l,
        paddingBottom: spacing.m,
        borderBottomWidth: 1,
        marginBottom: spacing.m,
    },
    tenantName: {
        fontSize: 20,
        fontWeight: '700',
    },
    welcomeSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    userBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    content: {
        paddingHorizontal: spacing.l,
        paddingBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: spacing.m,
        marginTop: spacing.s,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: spacing.m,
    },
    gridItemWrapper: {
        width: '48%',
        marginBottom: spacing.m,
    },
    moduleCard: {
        borderRadius: 16,
        padding: spacing.m,
        height: 140, // Slightly simpler height
        justifyContent: 'space-between',
        borderWidth: 1, // Enforce border for clean look
    },
    moduleCardDisabled: {
        opacity: 0.6,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeWarning: {
        backgroundColor: '#f59e0b',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moduleTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    moduleDescription: {
        fontSize: 11,
    },
    textDisabled: {
        // color handled inline
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.l,
        marginBottom: spacing.xl,
    },
    footerText: {
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: 20,
    },
    menuContainer: {
        width: 250,
        borderRadius: 12,
        padding: spacing.m,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuHeader: {
        marginBottom: spacing.m,
        paddingBottom: spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.s,
    },
    menuItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.s,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 14,
        marginLeft: spacing.m,
        fontWeight: '500',
    },
    menuDivider: {
        height: 1,
        marginVertical: spacing.s,
    },
});
