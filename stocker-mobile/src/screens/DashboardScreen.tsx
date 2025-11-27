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
    Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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

const { width } = Dimensions.get('window');

interface ModuleCard {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    gradient: [string, string];
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

    React.useEffect(() => {
        checkBiometric();
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
            gradient: ['#7c3aed', '#c026d3'],
            path: 'CRMDashboard',
            description: 'Müşteri ilişkileri yönetimi',
            badge: 'Aktif',
        },
        {
            id: 'dashboards',
            title: 'Dashboards',
            icon: 'stats-chart',
            color: '#c026d3',
            gradient: ['#c026d3', '#0891b2'],
            path: 'DashboardDetail',
            description: 'Analiz ve raporlar',
        },
        {
            id: 'sales',
            title: 'Satış Yönetimi',
            icon: 'cart',
            color: '#10b981',
            gradient: ['#10b981', '#34d399'],
            path: 'SalesDashboard',
            description: 'Teklif, sipariş ve faturalar',
            badge: 'Yeni',
        },
        {
            id: 'apps',
            title: 'Uygulamalar',
            icon: 'apps',
            color: '#0891b2',
            gradient: ['#0891b2', '#7c3aed'],
            path: 'Modules',
            description: 'Modül yönetimi',
        },
        {
            id: 'settings',
            title: 'Ayarlar',
            icon: 'settings',
            color: '#6b7280',
            gradient: ['#6b7280', '#374151'],
            path: 'Settings',
            description: 'Sistem ayarları',
        },
        {
            id: 'messaging',
            title: 'Mesajlaşma',
            icon: 'chatbubbles',
            color: '#c026d3',
            gradient: ['#c026d3', '#e879f9'],
            path: 'Messaging',
            description: 'İletişim ve mesajlaşma',
            badge: 'Yakında',
            disabled: true,
        },
        {
            id: 'calendar',
            title: 'Takvim',
            icon: 'calendar',
            color: '#7c3aed',
            gradient: ['#7c3aed', '#a78bfa'],
            path: 'Calendar',
            description: 'Etkinlik ve toplantılar',
            badge: 'Yakında',
            disabled: true,
        },
        {
            id: 'contacts',
            title: 'Kontaklar',
            icon: 'person-circle',
            color: '#0891b2',
            gradient: ['#0891b2', '#22d3ee'],
            path: 'Contacts',
            description: 'Kişiler ve iletişim',
            badge: 'Yakında',
            disabled: true,
        },
        {
            id: 'inventory',
            title: 'Stok',
            icon: 'cube',
            color: '#10b981',
            gradient: ['#10b981', '#34d399'],
            path: 'Inventory',
            description: 'Envanter yönetimi',
            badge: 'Yakında',
            disabled: true,
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
            <LinearGradient
                colors={theme === 'dark' ? ['#28002D', '#1A315A'] : ['#f0f9ff', '#e0f2fe']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.tenantName, { color: theme === 'dark' ? '#fff' : colors.textPrimary }]}>
                        {user?.tenantName || 'Stocker'}
                    </Text>

                    <TouchableOpacity
                        style={[styles.userBadge, {
                            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                        }]}
                        onPress={() => setUserMenuVisible(true)}
                    >
                        <View style={[styles.avatarContainer, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : colors.primary }]}>
                            <Ionicons name="person" size={16} color="#fff" />
                        </View>
                        <Text style={[styles.userName, { color: theme === 'dark' ? '#fff' : colors.textPrimary }]}>
                            {user?.firstName} {user?.lastName}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            size={12}
                            color={theme === 'dark' ? "rgba(255,255,255,0.7)" : colors.textSecondary}
                            style={{ marginLeft: 4 }}
                        />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Welcome Section */}
                    <Animated.View
                        entering={FadeInDown.delay(100).duration(800)}
                        style={styles.welcomeSection}
                    >
                        <Text style={[styles.welcomeTitle, { color: theme === 'dark' ? '#fff' : colors.textPrimary }]}>
                            Hoş Geldiniz! 👋
                        </Text>
                        <Text style={[styles.welcomeSubtitle, { color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                            İşletmenizi yönetmek için bir modül seçin
                        </Text>
                    </Animated.View>

                    {/* Widgets Section */}
                    <View style={styles.gridContainer}>
                        <DashboardWidget
                            title="Günlük Satış"
                            value="₺12,450"
                            subtitle="Bugün"
                            icon="cash-outline"
                            color="#10b981"
                            trend={{ value: 12.5, direction: 'up' }}
                            onPress={() => navigation.navigate('SalesDashboard')}
                            delay={200}
                        />
                        <DashboardWidget
                            title="Yeni Müşteri"
                            value="5"
                            subtitle="Bu hafta"
                            icon="person-add-outline"
                            color="#3b82f6"
                            trend={{ value: 2, direction: 'up' }}
                            onPress={() => navigation.navigate('CRMDashboard')}
                            delay={300}
                        />
                    </View>

                    {/* Modules Grid */}
                    <View style={styles.gridContainer}>
                        {modules.map((module, index) => (
                            <Animated.View
                                key={module.id}
                                entering={FadeInDown.delay(200 + (index * 50)).duration(600)}
                                style={styles.gridItemWrapper}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.moduleCard,
                                        {
                                            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                                            elevation: theme === 'dark' ? 0 : 5,
                                            shadowOpacity: theme === 'dark' ? 0 : 0.1,
                                            borderWidth: theme === 'dark' ? 1 : 0,
                                            borderColor: 'rgba(255,255,255,0.1)'
                                        },
                                        module.disabled && styles.moduleCardDisabled
                                    ]}
                                    onPress={() => handleModuleClick(module)}
                                    activeOpacity={0.8}
                                >
                                    {module.badge && (
                                        <View style={[
                                            styles.badge,
                                            module.disabled ? styles.badgeWarning : styles.badgeSuccess
                                        ]}>
                                            <Text style={styles.badgeText}>{module.badge}</Text>
                                        </View>
                                    )}

                                    <Ionicons
                                        name={module.icon}
                                        size={48}
                                        color={module.disabled ? (theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#ccc') : module.color}
                                        style={styles.moduleIcon}
                                    />

                                    <Text style={[
                                        styles.moduleTitle,
                                        { color: theme === 'dark' ? '#fff' : colors.textPrimary },
                                        module.disabled && styles.textDisabled
                                    ]}>{module.title}</Text>

                                    <Text style={[
                                        styles.moduleDescription,
                                        { color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : colors.textSecondary },
                                        module.disabled && styles.textDisabled
                                    ]} numberOfLines={2}>
                                        {module.description}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Ionicons name="rocket-outline" size={16} color={theme === 'dark' ? "rgba(255,255,255,0.6)" : colors.textSecondary} style={{ marginRight: 8 }} />
                        <Text style={[styles.footerText, { color: theme === 'dark' ? "rgba(255,255,255,0.6)" : colors.textSecondary }]}>
                            Stocker - Modern İşletme Yönetim Sistemi
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
                                <View style={[styles.menuContainer, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' }]}>
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

                                    <View style={[styles.menuDivider, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

                                    <TouchableOpacity style={styles.menuItem} onPress={async () => {
                                        await notificationService.scheduleLocalNotification('Test Bildirimi', 'Bu bir test bildirimidir 🚀');
                                        showAlert({
                                            title: 'Başarılı',
                                            message: 'Bildirim gönderildi (1 saniye içinde gelecek)',
                                            type: 'success'
                                        });
                                    }}>
                                        <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
                                        <Text style={[styles.menuText, { color: colors.textPrimary }]}>Test Bildirim</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                                        setUserMenuVisible(false);
                                        showAlert({
                                            title: 'Bilgi',
                                            message: 'Profil sayfası yakında eklenecek.',
                                            type: 'info'
                                        });
                                    }}>
                                        <Ionicons name="person-outline" size={20} color={colors.textPrimary} />
                                        <Text style={[styles.menuText, { color: colors.textPrimary }]}>Profil</Text>
                                    </TouchableOpacity>

                                    <View style={[styles.menuDivider, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

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
        marginBottom: spacing.m,
    } as ViewStyle,
    tenantName: {
        fontSize: 20,
        fontWeight: 'bold',
    } as TextStyle,
    userBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
    } as ViewStyle,
    avatarContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    } as ViewStyle,
    userName: {
        fontSize: 14,
        fontWeight: '500',
    } as TextStyle,
    content: {
        paddingHorizontal: spacing.l,
        paddingBottom: spacing.xl,
    } as ViewStyle,
    welcomeSection: {
        marginBottom: spacing.l,
    } as ViewStyle,
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    } as TextStyle,
    welcomeSubtitle: {
        fontSize: 16,
    } as TextStyle,
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    } as ViewStyle,
    gridItemWrapper: {
        width: '48%',
        marginBottom: spacing.m,
    } as ViewStyle,
    moduleCard: {
        borderRadius: 16,
        padding: spacing.m,
        height: 160,
        justifyContent: 'space-between',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    } as ViewStyle,
    moduleCardDisabled: {
        opacity: 0.7,
    } as ViewStyle,
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    } as ViewStyle,
    badgeSuccess: {
        backgroundColor: '#10b981',
    } as ViewStyle,
    badgeWarning: {
        backgroundColor: '#f59e0b',
    } as ViewStyle,
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    } as TextStyle,
    moduleIcon: {
        marginBottom: spacing.s,
    } as TextStyle,
    moduleTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    } as TextStyle,
    moduleDescription: {
        fontSize: 12,
    } as TextStyle,
    textDisabled: {
        color: 'rgba(255,255,255,0.5)',
    } as TextStyle,
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.l,
        marginBottom: spacing.xl,
    } as ViewStyle,
    footerText: {
        fontSize: 12,
    } as TextStyle,
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: 20,
    } as ViewStyle,
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
    } as ViewStyle,
    menuHeader: {
        marginBottom: spacing.m,
        paddingBottom: spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    } as ViewStyle,
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    } as TextStyle,
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.s,
    } as ViewStyle,
    menuItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.s,
    } as ViewStyle,
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,
    menuText: {
        fontSize: 14,
        marginLeft: spacing.m,
        fontWeight: '500',
    } as TextStyle,
    menuDivider: {
        height: 1,
        marginVertical: spacing.s,
    } as ViewStyle,
});
